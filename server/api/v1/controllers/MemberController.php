<?php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/Cache.php';
require_once __DIR__ . '/../classes/Log.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/ImageUtils.php';

class MemberController extends Controller
{
	private Log $_log;

	private array $_urlParts;

	function __construct(array $urlParts)
	{
		$this->_log = new Log("MemberController");

		$this->_urlParts = $urlParts;
	}

	public function Process()
	{

		$response = null;

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

			case 'PUT':
				switch (count($this->_urlParts)) {
					case 1:
						http_response_code(501);
						$response = ["message" => "Not Implemented"];
						break;
					case 3:

						switch ($this->_urlParts[1]) {
							case "avitar":
								$callsign = $this->_urlParts[2];
								$response = $this->SetAvitar($callsign);
						}
						http_response_code(501);
						$response = ["message" => "Not Implemented"];
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
	}

	// reports/year/week
	private function GetAll()
	{

		$filePath = Config::MemberDirectoryPath;

		Cache::SetFileTimeEtag($filePath);
		$raw = file_get_contents($filePath);
		$data = json_decode($raw);
		return $data;
	}

	private function GetAvitar(string $callsign)
	{

		$filePath = Config::AvitarPath . "/" . $callsign . "_100.jpg";
		$this->_log->Debug($filePath);
		if (!file_exists($filePath)) {
			http_response_code(404);
			return ["message" => "Not found."];
		}

		Cache::SetFileTimeEtag($filePath);
		header('Content-Type: image/jpeg');
		ob_clean();
		flush();
		readfile($filePath);
		exit(200);
	}

	private function SetAvitar(string $callsign)
	{
		$filePath = Config::AvitarPath . "/" . $callsign . ".jpg";
		$put_stream = fopen("php://input", "r");
		$file_stream = fopen($filePath, "w");

		if (!$put_stream || !$file_stream) {
			http_response_code(500);
			return ["message" => "Error handling streams."];
		};

		while ($chunk = fread($put_stream, 1024)) {
			fwrite($file_stream, $chunk);
		}

		fclose($put_stream);
		fclose($file_stream);

		$renamed = Paths::AppendSuffixToFileName($filePath, "_100");
		ImageUtils::ResizeLongEdge($filePath, $renamed, 100);

		$getUrl = Config::API_ROOT . "/v1/members/" . urlencode($callsign) . "/avitar";
		header("Location: " . $getUrl);
		http_response_code(201);
		return [
			"status" => "Success",
			"url" => $getUrl
		];
	}
}
