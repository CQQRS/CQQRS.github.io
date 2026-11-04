<?php
header('Content-Type: application/json; charset=utf-8');

function writeServerErrorLog(string $message): void
{
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir) && !mkdir($logDir, 0775, true) && !is_dir($logDir)) {
        return;
    }

    $logPath = $logDir . '/report-errors.log';
    $timestamp = gmdate('Y-m-d\TH:i:s\Z');
    $requestId = $_SERVER['HTTP_X_REQUEST_ID'] ?? 'no-request-id';
    $context = [
        'timestamp' => $timestamp,
        'request_id' => $requestId,
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
        'path' => $_SERVER['REQUEST_URI'] ?? 'UNKNOWN',
        'message' => $message,
        'post' => $_POST,
    ];

    $line = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    file_put_contents($logPath, $line, FILE_APPEND | LOCK_EX);
}

function httpError(int $status, string $message): void
{
    writeServerErrorLog($message);

    http_response_code($status);

    $payload = [
        'status' => 'error',
        'message' => $message,
    ];

    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        $json = '{"status":"error","message":"Unable to encode error response."}';
    }

    echo $json;
    exit;
}

function resize_long_edge(string $inputPath, string $outputPath, int $size): bool
{
    $convertBinary = '/usr/bin/convert';
    if (!is_executable($convertBinary)) {
        writeServerErrorLog('ImageMagick is not available on the server at /usr/bin/convert.');
        return false;
    }

    $cmd = sprintf(
        '%s %s -resize %dx%d %s 2>&1',
        escapeshellarg($convertBinary),
        escapeshellarg($inputPath),
		escapeshellarg($size),
		escapeshellarg($size),
        escapeshellarg($outputPath)
    );

    exec($cmd, $output, $returnCode);

    if ($returnCode !== 0 || !is_file($outputPath)) {
        $details = implode("\n", $output);
        writeServerErrorLog('Image resize failed. Command: ' . $cmd . '\nOutput: ' . $details);
        return false;
    }

    return true;
}

function append_to_filename(string $filename, string $suffix): string {
    $dir = dirname($filename);
    $info = pathinfo($filename);

    $newName = $info['filename'] . '_' . $suffix;

    if (!empty($info['extension'])) {
        $newName .= '.' . $info['extension'];
    }

    return ($dir === '.' || $dir === '') ? $newName : $dir . '/' . $newName;
}

function get_edition(): string {
	$weekYear = (int) date('o');
	$weekNumber = (int) date('W');
	return sprintf('%d_%02d', $weekYear, $weekNumber);
}

function normalize_callsign(string $value): string
{
    return strtolower(trim($value));
}

function find_and_update_record(array &$entries, array $record): array
{
    $targetCallsign = normalize_callsign((string) ($record['callsign'] ?? ''));
    if ($targetCallsign === '') {
        $entries[] = $record;
        return $entries;
    }

    foreach ($entries as $index => $entry) {
        if (!isset($entry['callsign'])) {
            continue;
        }

        if (normalize_callsign((string) $entry['callsign']) !== $targetCallsign) {
            continue;
        }

        $existingRecord = $entry;

        if (empty($record['photos']) && !empty($existingRecord['photos'])) {
            $record['photos'] = $existingRecord['photos'];
        }

        $entries[$index] = array_merge($existingRecord, $record);
        return $entries;
    }

    $entries[] = $record;
    return $entries;
}

function collect_uploaded_files($fileInput): array
{
    if (!is_array($fileInput)) {
        return [];
    }

    $files = [];

    if (isset($fileInput['name']) && !is_array($fileInput['name'])) {
        if (($fileInput['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $files[] = $fileInput;
        }
        return $files;
    }

    $fileCount = is_array($fileInput['name'] ?? null) ? count($fileInput['name']) : 0;
    for ($i = 0; $i < $fileCount; $i++) {
        $error = $fileInput['error'][$i] ?? UPLOAD_ERR_NO_FILE;
        if ($error !== UPLOAD_ERR_OK) {
            continue;
        }

        $files[] = [
            'name' => $fileInput['name'][$i] ?? '',
            'type' => $fileInput['type'][$i] ?? 'application/octet-stream',
            'tmp_name' => $fileInput['tmp_name'][$i] ?? '',
            'error' => $error,
            'size' => $fileInput['size'][$i] ?? 0,
        ];
    }

    return $files;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    httpError(405, 'Only POST requests are accepted.');
}

$requiredFields = ['name', 'callsign', 'qth'];
$missingFields = [];

foreach ($requiredFields as $field) {
    $value = $_POST[$field] ?? '';
    if (is_string($value)) {
        $value = trim($value);
    }

    if ($value === '' || $value === null) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    httpError(422, 'The following fields are required: ' . implode(', ', $missingFields) . '.');
}

$rootFolder = __DIR__;
$uploadsFolder = $rootFolder . '/../reports';

if (!is_dir($uploadsFolder) && !mkdir($uploadsFolder, 0775, true) && !is_dir($uploadsFolder)) {
    httpError(500, 'Unable to create upload directory.');
}

$edition = $_GET["testing"] ? "2026_test" : get_edition();

$targetFolder = $uploadsFolder . '/' . $edition;

if (!is_dir($targetFolder) && !mkdir($targetFolder, 0775, true) && !is_dir($targetFolder)) {
    httpError(500, 'Unable to create week folder.');
}

$imageFolder = $targetFolder . '/images';
if (!is_dir($imageFolder) && !mkdir($imageFolder, 0775, true) && !is_dir($imageFolder)) {
    httpError(500, 'Unable to create image folder.');
}

$fileInput = $_FILES['file'] ?? $_FILES['photo'] ?? $_FILES['file[]'] ?? null;

$record = [];
foreach ($_POST as $key => $value) {
    $record[$key] = is_array($value) ? $value : trim((string) $value);
}
$record['submitted_at'] = gmdate(DATE_ATOM);
$record['edition'] = $edition;
$record['photos'] = [];

$uploadedFiles = collect_uploaded_files($fileInput);

foreach ($uploadedFiles as $index => $uploadedFile) {
    $safeBaseName = preg_replace('/[^A-Za-z0-9._-]+/', '_', ($_POST['callsign'] ?? 'photo'));
    $safeBaseName = trim($safeBaseName, "_.-") ?: 'photo';

    $extension = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
    $extension = $extension !== '' ? '.' . $extension : '';

    $year = (int) date('o');
    $week = (int) date('W');
    $suffix = count($uploadedFiles) > 1 ? '_' . ($index + 1) : '';
    $photoFileName = $imageFolder . '/' . $safeBaseName . '_' . $year . '_' . $week . $suffix . $extension;

    if (!move_uploaded_file($uploadedFile['tmp_name'], $photoFileName)) {
        httpError(500, 'The uploaded photo could not be saved as the original.');
    }

    $imageInfo = @getimagesize($photoFileName);
    if ($imageInfo === false) {
        @unlink($photoFileName);
        httpError(415, 'The uploaded file is not a valid image.');
    }

    $resizeList = [800, 400];
    foreach ($resizeList as $size) {
        $resizeOutput = append_to_filename($photoFileName, $size);
        if (!resize_long_edge($photoFileName, $resizeOutput, $size)) {
            @unlink($resizeOutput);
            httpError(500, 'The uploaded photo could not be resized. See the server log for details.');
        }
    }

    $record['photos'][] = [
        'filename' => basename($photoFileName),
        'mime' => $uploadedFile['type'] ?? 'application/octet-stream',
        'size' => (int) ($uploadedFile['size'] ?? 0),
    ];
}

$logPath = $targetFolder . '/entries.json';
$handle = fopen($logPath, 'c+');
if ($handle === false) {
    httpError(500, 'Unable to open the journal file for writing.');
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    httpError(500, 'Unable to lock the journal file for writing.');
}

$entries = [];
$fileContents = stream_get_contents($handle);
rewind($handle);

if ($fileContents !== false && trim($fileContents) !== '') {
    $decoded = json_decode($fileContents, true);
    if (is_array($decoded)) {
        $entries = $decoded;
    } else {
        foreach (preg_split('/\r\n|\r|\n/', trim($fileContents)) as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $parsed = json_decode($line, true);
            if (is_array($parsed)) {
                $entries[] = $parsed;
            }
        }
    }
}

$entries = find_and_update_record($entries, $record);

$jsonOut = json_encode($entries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($jsonOut === false) {
    flock($handle, LOCK_UN);
    fclose($handle);
    httpError(400, 'The submitted data could not be encoded as JSON.');
}

ftruncate($handle, 0);
rewind($handle);
$bytesWritten = fwrite($handle, $jsonOut . PHP_EOL);

if ($bytesWritten === false) {
    flock($handle, LOCK_UN);
    fclose($handle);
    httpError(500, 'Unable to write the JSON entry.');
}

fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'folder' => $edition,
    'saved_photos' => array_map(static fn($p) => $p['photo_filename'], $record['photos']),
    'log_file' => basename($logPath),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
