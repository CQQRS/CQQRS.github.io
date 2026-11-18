<?php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/Cache.php';
require_once __DIR__ . '/../classes/Log.php';
require_once __DIR__ . '/../classes/Paths.php';

class ReportController extends Controller
{
	private Log $_log;

	private array $_urlParts;

	function __construct(array $urlParts)
	{
		$this->_log = new Log("ReportController");

		$this->_urlParts = $urlParts;
	}

	public function Process()
	{

		$response = null;

		switch ($_SERVER['REQUEST_METHOD']) {
			case 'GET':
				switch (count($this->_urlParts)) {
					case 3:
						$response = $this->GetAll(
							$this->_urlParts[1],
							$this->_urlParts[2]
						);
						break;
					case 4:
						$response = $this->GetReport(
							$this->_urlParts[1],
							$this->_urlParts[2],
							$this->_urlParts[3]
						);
						break;
					default:
						http_response_code(400);
						$response = ["message" => "Bad request"];
				}
				break;

			case 'POST':
				$response = $this->UpsertReport();
		}

		if( $response !== null ){
			echo json_encode($response);
		}
	}

	// reports/year/week
	public function GetAll(int $year, int $week)
	{

		$dataFiles = Paths::ReportResponseDir($year, $week);

		Cache::SetFileTimeEtag($dataFiles);
		
		$mergedData = [];
		foreach ($dataFiles as $file) {
			if (file_exists($file)) {
				$content = json_decode(file_get_contents($file), true);
				if (is_array($content)) {
					$mergedData = array_merge($mergedData, $content);
				}
				else{
					array_push($mergedData, $content);
				}
			}
		}

		return $mergedData;
	}

	// reports/{year}/{week}/{callsign}
	public function GetReport(int $year, int $week, string $callsign)
	{
		$callsign = strtolower(trim($callsign));
		$all = $this->GetAll($year, $week);

		foreach ($all as $index => $entry) {
			if (!isset($entry['callsign'])) {
				continue;
			}

			if (strtolower(trim($entry['callsign'])) === $callsign) {
				return $entry;
			}
		}

		http_response_code(404);
		return [];
	}

	// reports/year/week
	public function UpsertReport() {
		return [
			"status"=> "Success",
			"url" => "theUrl"
		];
	}
}
