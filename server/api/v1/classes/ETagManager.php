<?php

class ETagManager{

	public string $newETag = '';	

	public function __construct( private array|null $_requestHeaders = null){

		if( $_requestHeaders == null){
			$_requestHeaders = $_SERVER;
		}

	}

	public function FromFileMDate( string ...$fileList): ETagManager {

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
		$this->newETag = 'W/"' . $latestMtime . '-' . count($checkList) . '"';

		return $this;

	}

	public function Set(): void {

		// Check if the browser sent a matching ETag
		$clientEtag = isset($this->_requestHeaders['HTTP_IF_NONE_MATCH']) 
			? trim($this->_requestHeaders['HTTP_IF_NONE_MATCH']) 
			: '';

		if ($clientEtag === $this->newETag) {
			// SUCCESS: The client already has the latest data. Short-circuit here!
			header('HTTP/1.1 304 Not Modified');
			exit;
		}

		// CACHE MISS: The data is new. Proceed to merge files and send payload.
		header('ETag: ' . $this->newETag);

	}

}