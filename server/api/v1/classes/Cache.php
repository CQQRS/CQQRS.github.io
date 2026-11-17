<?php

class Cache {

	public static function HandleCachingForETag( string $etag ) {

		// Check if the browser sent a matching ETag
		$clientEtag = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? trim($_SERVER['HTTP_IF_NONE_MATCH']) : '';

		if ($clientEtag === $etag) {
			// SUCCESS: The client already has the latest data. Short-circuit here!
			header('HTTP/1.1 304 Not Modified');
			exit;
		}

		// CACHE MISS: The data is new. Proceed to merge files and send payload.
		header('ETag: ' . $etag);


	}

}