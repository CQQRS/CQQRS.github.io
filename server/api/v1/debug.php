<?php

http_response_code(200);

try {
	$log = new Log("api_v1");
	$log->Debug("Log message");
} catch (Throwable $ex) {
	
	$error = [
		'message' => $ex->getMessage(),
		'trace' => $ex->getTraceAsString()
	];

	echo json_encode($error);
}
echo "hello";
