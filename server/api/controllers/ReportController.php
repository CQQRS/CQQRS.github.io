<?php

include '../config.php';

class ReportController extends Controller {

	private array $_urlParts;	

	function __construct(array $urlParts) {
		$this->_urlParts = $urlParts;
	}

	// reports/year/week
	public function GetAll(int $year, int $week) {

		$contents = file_get_contents(Config::$reportRoot + "{$year}_{$week}");
		echo json_encode($contents);

	}

	// reports/year/week/{callsign}
	public function GetReport(int $year, int $week, string $callsign) {

		$targetCallsign = strtolower(trim($callsign));
		$contents = file_get_contents(Config::$reportRoot + "{$year}_{$week}");

		$json = json_decode($contents, true);
		if( !is_array($json)) {
			echo json_encode([]);
		}

		foreach ($json as $index => $entry) {
			if (!isset($entry['callsign'])) {
				continue;
			}

			if (strtolower(trim($entry['callsign'])) !== $targetCallsign) {
				continue;
			}

			echo json_encode($entry);
	
    	}

	}

	// reports/year/week
	public function UpsertReport() {

	}

	public function Process() {

		switch( $_SERVER['REQUEST_METHOD'] ){
			case 'GET':
				switch(count($this->_urlParts)){
					case 4:
						return $this->GetAll(
							$this->_urlParts[2],
							$this->_urlParts[3]
						);
						break;
					case 5:
						return $this->GetReport(
							$this->_urlParts[2],
							$this->_urlParts[3],
							$this->_urlParts[4]
						);
						break;
					default:
						http_response_code(400);
						echo json_encode(["message" => "Bad request"]);
						exit();
				}
				break;

			case 'POST':
				return $this->UpsertReport();
		}
	}

}