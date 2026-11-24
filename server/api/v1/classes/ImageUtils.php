<?php

class ImageUtils
{

	public static function ResizeLongEdge(string $inputPath, string $outputPath, int $size): void
	{
		$convertBinary = '/usr/bin/convert';
		if (!is_executable($convertBinary)) {
			throw new Exception('ImageMagick is not available on the server at /usr/bin/convert.');
		}

		$cmd = sprintf(
			'%s %s -resize %dx%d %s 2>&1',
			escapeshellarg($convertBinary),
			escapeshellarg($inputPath),
			$size,
			$size,
			escapeshellarg($outputPath)
		);

		exec($cmd, $output, $returnCode);

		if ($returnCode !== 0 || !is_file($outputPath)) {
			$details = implode("\n", $output);
			throw new Exception('Image resize failed. Command: ' . $cmd . '\nOutput: ' . $details);
		}
	}
}
