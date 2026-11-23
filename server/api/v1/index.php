<?php

try {
	require_once __DIR__ . '/config.php';
	require_once __DIR__ . '/classes/Log.php';
	require_once __DIR__ . '/classes/routing/Router.php';
	require_once __DIR__ . '/controllers/ReportController.php';
	require_once __DIR__ . '/controllers/MemberController.php';
} catch (Throwable $ex) {

	$log->Error($ex->getMessage(), $ex);

	$error = [
		'Block' => "imports",
		'message' => $ex->getMessage(),
		'trace' => $ex->getTraceAsString()
	];

	http_response_code(500);
	echo json_encode($error);
}

$log = null;
$log = new Log("index");
$log->Debug("index");

try {
	// For unstructions on using the router, see classes/routing/ROUTER.md
	$router = new Router(Config::API_ROOT);

	$req = Request::fromGlobals();
	$log->Debug(json_encode($req));

	$router->get('/ping', fn() => Response::Json('pong'));

	$router->group('/reports', function (Router $r) {

		new ReportController($r);
	});

	$router->group('/members', function (Router $r) {

		//new MemberController($r);
	});

	$headers = [];
	try {
		$res = $router->dispatch(Request::fromGlobals());
		[$status, $data, $headers] = [$res[0], $res[1], $res[2] ?? []];



		$log->Debug("Status: $status, Data: $data");
	} catch (HttpException $e) {
		[$status, $data, $headers] = [$e->status, ['error' => $e->getMessage()], $e->headers];

		if ($status == 404) {
			foreach ($router->routes as $route) {
				$log->Debug(json_encode($route));
			}
		}
	}

	foreach ($headers as $k => $v) header("$k: $v");
	if (isset($headers['Allow'])) header('Access-Control-Allow-Methods: ' . $headers['Allow']);

	http_response_code($status);
	if ($data !== null) echo json_encode($data);
} catch (Throwable $ex) {

	$log->Error($ex->getMessage(), $ex);

	$error = [
		'message' => $ex->getMessage(),
		'trace' => $ex->getTraceAsString()
	];

	http_response_code(500);
	echo json_encode($error);
}
