<?php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/Cache.php';
require_once __DIR__ . '/../classes/Log.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/ImageUtils.php';

require_once __DIR__ . '/../classes/routing/Router.php';

class MemberController extends Controller
{
	private Log $_log;

	private Router $_router;

	function __construct(Router $router)
	{
		$this->_log = new Log("MemberController");
		$this->_router = $router;
	}

	public function Build()
	{

		$regx = (object)[
			'year' => '\d{4}',
			'week' => '\d{2}',
			'callsign' => '^(?=.*[a-zA-Z])(?=.*[0-9])'
		];

		// GET /
		$this->_router->get(
			"/",
			fn(Request $req) =>
			$this->GetAll()
		);

		// GET /{callsign}/avitar
		$this->_router->get(
			"/{callsign:$regx->callsign}/avitar",
			fn(Request $req) =>
			$this->GetAvitar($req->params['callsign'])
		);

		// GET /{callsign}/avitar
		$this->_router->post(
			"/{callsign:$regx->callsign}/avitar",
			fn(Request $req) =>
			$this->SetAvitar($req->params['callsign'])
		);


		/*
		$this->_log->Debug("New Process");
		$response = null;
		$this->_log->Debug($_SERVER['REQUEST_METHOD']);
		switch ($_SERVER['REQUEST_METHOD']) {
			case 'GET':
				switch (count($this->_urlParts)) {
					case 1:
						$response = $this->GetAll();
						break;
					case 3:
						if ($this->_urlParts[2] == "avitar") {
							$callsign = $this->_urlParts[1];
							$response = $this->GetAvitar($callsign);
							break;
						}

					default:
						http_response_code(400);
						$response = ["message" => "Bad request"];
				}
				break;

			case 'POST':
				$this->_log->Debug("Posting");
				switch (count($this->_urlParts)) {
					case 1:
						http_response_code(501);
						$response = ["message" => "Not Implemented"];
						break;
					case 3:
						$this->_log->Debug("3");
						if ($this->_urlParts[2] == "avitar") {
							$this->_log->Debug("avitar");
							$callsign = $this->_urlParts[1];
							$response = $this->SetAvitar($callsign);
							break;
						}
						http_response_code(400);
						$response = ["message" => "Bad request"];
						break;
					default:
						http_response_code(400);
						$response = ["message" => "Bad request"];
				}
				break;
		}

		if ($response !== null) {
			echo json_encode($response);
		}

		*/
	}

	// reports/year/week
	private function GetAll()
	{

		$filePath = Config::MemberDirectoryPath;

		Cache::SetFileTimeEtag($filePath);
		$raw = file_get_contents($filePath);
		$data = json_decode($raw);
		return Response::Json($data);
	}

	private function GetAvitar(string $callsign)
	{

		$filePath = Config::AvitarPath . "/" . $callsign . "_100.jpg";
		if (!file_exists($filePath)) {
			throw new HttpException(404, "Not found.");
		}

		Cache::SetFileTimeEtag($filePath);
		ob_clean();
		flush();
		readfile($filePath);
		return Response::Jpeg();
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
			http_response_code(400);
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
		Response::Json($data, 201);
	}
}
