<?php

include 'controllers/ReportController.php';

// Essential API Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Parse the request URL and HTTP method
$requestMethod = $_SERVER["REQUEST_METHOD"];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($uri, '/'));

$controller = null;

switch( $uriSegments[1] ) {
	case 'reports':
		$controller = new ReportController($uriSegments);
		break;

	case 'images':
		echo 'images';
		break;

	default:
		http_response_code(404);
		echo json_encode(["message" => "Endpoint Not Found"]);
		exit();
}

$controller->Process();