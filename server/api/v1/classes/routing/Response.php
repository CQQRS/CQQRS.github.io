<?php

class Response {

	public static function Blank(int $status = 200): array { 
		return [$status, null]; 
	}

	public static function Json(mixed $data, int $status = 200): array { 
		
		header('Content-Type: application/json');	
		return [$status, $data]; 
	}

	public static function Jpeg(int $status = 200): array { 
		
		header('Content-Type: image/jpeg');	
		return [$status, null]; 
	}
}