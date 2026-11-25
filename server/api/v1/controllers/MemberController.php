<?php

require_once __DIR__ . '/IRoutedController.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/MemberRepo.php';
require_once __DIR__ . '/../classes/ETagManager.php';
require_once __DIR__ . '/../classes/Log.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/ImageUtils.php';

require_once __DIR__ . '/../classes/routing/Router.php';

class MemberController implements IRoutedController
{
	private Log $_log;

	private Router $_router;

	function __construct(Router $router)
	{
		$this->_log = new Log("MemberController");
		$this->_router = $router;

		$this->Build();
	}


	protected function Build()
	{

		// GET /
		$this->_router->get(
			"/",
			fn(Request $req) =>
			$this->GetAll()
		);

		$this->_router->post(
			"/",
			fn(Request $req) =>
			$this->Upsert($req->body)
		);

		// GET /{callsign}
		$this->_router->get(
			"/{callsign}",
			fn(Request $req) =>
			$this->GetCallsign($req->params['callsign'])
		)->where('callsign', RouteGuard::$Callsign);

		// GET /{callsign}/avitar
		$this->_router->get(
			"/{callsign}/avitar",
			fn(Request $req) =>
			$this->GetAvitar($req->params['callsign'])
		)->where('callsign', RouteGuard::$Callsign);

		// POST /{callsign}/avitar
		$this->_router->post(
			"/{callsign}/avitar",
			fn(Request $req) =>
			$this->SetAvitar($req->params['callsign'])
		)->where('callsign', RouteGuard::$Callsign);
	}

	private function GetAll()
	{

		(new ETagManager())->FromFileMDate(Config::MemberDirectoryPath)->Set();

		$data = MemberRepo::GetAll();
		return Response::Json($data);
	}

	private function GetCallsign(string $callsign)
	{

		(new ETagManager())->FromFileMDate(Config::MemberDirectoryPath)->Set();

		$all = MemberRepo::GetAll();

		$callsign = strtolower(trim($callsign));

		foreach ($all as $index => $entry) {

			if (!isset($entry['callsign'])) {
				continue;
			}

			if (strtolower(trim($entry['callsign'])) === $callsign) {
				return Response::Json($entry);
			}
		}

		throw new HttpException(404, "Not found.");
	}

	private function GetAvitar(string $callsign)
	{

		$filePath = Config::AvitarPath . "/" . $callsign . "_100.jpg";
		if (!file_exists($filePath)) {
			throw new HttpException(404, "Not found.");
		}

		(new ETagManager())->FromFileMDate($filePath)->Set();

		ob_clean();
		flush();
		Response::Jpeg();
		readfile($filePath);

		return Response::Blank();
	}

	private function SetAvitar(string $callsign)
	{
		$this->_log->Debug("filePath setup");

		$this->_log->Debug("Files: " . join(", ", $_FILES));

		// Check if file was uploaded via FormData
		if (!isset($_FILES['file'])) {
			throw new HttpException(400, "No file uploaded.");
		}

		$uploadedFile = $_FILES['file'];
		$this->_log->Debug("File received: " . $uploadedFile['name']);

		if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
			$errorMsg = match ($uploadedFile['error']) {
				UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => "File is too large.",
				UPLOAD_ERR_PARTIAL => "File upload was incomplete.",
				UPLOAD_ERR_NO_FILE => "No file was uploaded.",
				UPLOAD_ERR_NO_TMP_DIR => "Server configuration error.",
				UPLOAD_ERR_CANT_WRITE => "Cannot write to server.",
				default => "Unknown upload error.",
			};
			throw new HttpException(400, $errorMsg);
		}

		// Verify MIME type before moving
		$finfo = finfo_open(FILEINFO_MIME_TYPE);
		$mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
		finfo_close($finfo);

		if ($mimeType !== 'image/jpeg') {
			throw new HttpException(400, "File must be a JPEG image. Received: "
				. $mimeType);
		}

		// Move uploaded file to final location
		$filePath = Config::AvitarPath . "/" . $callsign . ".jpg";
		$this->_log->Debug("Moving to: " . $filePath);

		if (!move_uploaded_file($uploadedFile['tmp_name'], $filePath)) {
			throw new HttpException(500, "Failed to save uploaded file.");
		}

		$this->_log->Debug("file written to " . $filePath);

		// Resize the image
		$renamed = Paths::AppendSuffixToFileName($filePath, "_100");
		ImageUtils::ResizeLongEdge($filePath, $renamed, 100);

		$getUrl = Config::API_ROOT . "/members/" . urlencode($callsign) . "/avitar";
		header("Location: " . $getUrl);

		$data = [
			"status" => "Success",
			"url" => $getUrl
		];

		return Response::Json($data, 201);
	}

	private function Upsert(array $memberList)
	{
		$upsertedData = MemberRepo::Upsert($memberList);

		return Response::Json($upsertedData, 201);
	}
}
