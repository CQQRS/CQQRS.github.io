<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/classes/Log.php';
require_once __DIR__ . '/controllers/ReportController.php';
require_once __DIR__ . '/controllers/MemberController.php';

$log = null;

try {

	$log = new Log("index");
	
	// Essential API Headers
	header("Content-Type: application/json; charset=UTF-8");
	
	// Parse the request URL and HTTP method
	$requestMethod = $_SERVER["REQUEST_METHOD"];
	$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
	$key = Config::V1_URI_KEY;
	$uri = substr($uri, strpos($uri,$key)+ strlen($key));
	$uriSegments = explode('/', trim($uri, '/'));

	$controller = null;

	switch ($uriSegments[0]) {
		case 'reports':
			$controller = new ReportController($uriSegments);
			break;

		case 'members':
			$controller = new MemberController($uriSegments);
			break;

		case 'test':
			echo json_encode(["paths" => join(" -> ", $uriSegments)]);
			exit();
			break;

		default:

			$log->Debug("switched default");
			http_response_code(404);
			echo json_encode(["message" => "Endpoint Not Found"]);
			exit();
	}


	if ($controller != null) {
		$controller->Process();
	}
} catch (Throwable $ex) {
	
	$log->Error($ex->getMessage(), $ex);

	$error = [
		'message' => $ex->getMessage(),
		'trace' => $ex->getTraceAsString()
	];

	http_response_code(500);
	echo json_encode($error);
}