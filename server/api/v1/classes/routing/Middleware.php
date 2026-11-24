<?php

class Middleware {

	public function Auth(Request $req, callable $next) {
		$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
		if ($token !== 'Bearer secret') throw new HttpException(401, 'Unauthorized');
		return $next($req);
	}
}