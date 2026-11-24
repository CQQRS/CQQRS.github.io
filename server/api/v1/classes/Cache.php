<?php

class Cache {

	public static function SetFileTimeEtag( string|array $fileList ){

		// Clear the file status cache to get accurate timestamps
		clearstatcache();

		$checkList = is_array($fileList)
			? $fileList
			: [$fileList];

		$latestMtime = 0;
		foreach ($checkList as $file) {
			if (file_exists($file)) {
				$mtime = filemtime($file);
				if ($mtime > $latestMtime) {
					$latestMtime = $mtime;
				}
			}
		}

		// Construct a Weak ETag based on the latest timestamp
		// A count modifier is added in case files are removed entirely
		$etagValue = 'W/"' . $latestMtime . '-' . count($checkList) . '"';

		Cache::HandleCachingForETag($etagValue);

	}

	private static function HandleCachingForETag( string $etag ) {

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