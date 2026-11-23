<?php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/Cache.php';
require_once __DIR__ . '/../classes/Log.php';
require_once __DIR__ . '/../classes/Paths.php';

require_once __DIR__ . '/../classes/routing/Router.php';

class ReportController extends Controller
{
	private Log $_log;

	private Router $_router;

	function __construct(Router $router)
	{
		$this->_log = new Log("ReportController");
		$this->_router = $router;

		$this->Build();
	}

	public function Build()
	{

		$regx = (object)[
			'year' => '\d+',
			'week' => '\d+',
			'callsign' => '.+' //''^(?=.*[a-zA-Z])(?=.*[0-9])'
		];

		// GET /{year}/{week}
		$this->_router->get(
			"/{year:$regx->year}/{week:$regx->week}",
			fn(Request $req) =>
			$this->GetAll($req->params['year'], $req->params['week'])
		);

		// GET /{year}/{week}/{callsign}
		$this->_router->get(
			"/{year:$regx->year}/{week:$regx->week}/{callsign}",
			fn(Request $req) =>
			$this->GetReport(
				$req->params['year'],
				$req->params['week'],
				$req->params['callsign']
			)
		);
	}

	private function _GetAll(int $year, int $week)
	{
		$dataFiles = Paths::ReportResponseDir($year, $week);

		Cache::SetFileTimeEtag($dataFiles);

		$mergedData = [];
		foreach ($dataFiles as $file) {
			if (file_exists($file)) {
				$content = json_decode(file_get_contents($file), true);
				if (is_array($content)) {
					$mergedData = array_merge($mergedData, $content);
				} else {
					array_push($mergedData, $content);
				}
			}
		}

		return $mergedData;
	}

	// reports/year/week
	public function GetAll(int $year, int $week)
	{
		$mergedData = $this->_GetAll($year, $week);

		return Response::Json($mergedData);
	}

	// reports/{year}/{week}/{callsign}
	public function GetReport(int $year, int $week, string $callsign)
	{
		$callsign = strtolower(trim($callsign));
		$all = $this->_GetAll($year, $week);

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

	// reports/year/week
	public function UpsertReport()
	{
		return [
			"status" => "Success",
			"url" => "theUrl"
		];
	}
}
