<?php

require_once __DIR__ . '/IRoutedController.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Paths.php';
require_once __DIR__ . '/../classes/ETagManager.php';
require_once __DIR__ . '/../classes/Log.php';
require_once __DIR__ . '/../classes/Paths.php';

require_once __DIR__ . '/../classes/routing/Router.php';

class ReportController implements IRoutedController
{
	private Log $_log;

	private Router $_router;

	function __construct(Router $router)
	{
		$this->_log = new Log("ReportController");
		$this->_router = $router;

		$this->Build();
	}

	private function Build()
	{

		$this->_router->get(
			"/{year}/{week}",
			fn(Request $req) =>
			$this->GetAll($req->params['year'], $req->params['week'])
		)->where('year', RouteGuard::$Year)
			->where('week', RouteGuard::$Week);

		$this->_router->get(
			"/{year}/{week}/{callsign}",
			fn(Request $req) =>
			$this->GetReport(
				$req->params['year'],
				$req->params['week'],
				$req->params['callsign']
			)
		)->where('year', RouteGuard::$Year)
			->where('week', RouteGuard::$Week)
			->where('callsign', RouteGuard::$Callsign);

		$this->_router->get(
			"/{year}/{week}/images/{image}",
			fn(Request $req) =>
			$this->GetImage($req->params['year'], $req->params['week'],
				$req->params['image'])
		)->where('year', RouteGuard::$Year)
			->where('week', RouteGuard::$Week)
			->where('image', RouteGuard::$Filename);
	}

	private function _GetAll(int $year, int $week)
	{
		$dataFiles = Paths::ReportResponses($year, $week);

		(new ETagManager())->FromFileMDate(...$dataFiles)->Set();

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

	public function GetImage(
		int $year,
		int $week,
		string $imageName
	) {
		
		$filePath = Paths::ReportResponseDir($year, $week)
			. "/images/$imageName";

		if (!file_exists($filePath)) {
		
			$this->_log->Debug("Unable to find image file at: $filePath");
			throw new HttpException(404, "Not found.");
		}

		(new ETagManager())->FromFileMDate($filePath)->Set();
		
		ob_clean();
		flush();
		Response::Jpeg();
		readfile($filePath);

		return Response::Blank();
	}
}
