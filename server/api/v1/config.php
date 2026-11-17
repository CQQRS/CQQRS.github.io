<?php

class Config {
	private const PROJECT_ROOT = __DIR__ . '/../..';
	
	public const REPORT_ROOT = self::PROJECT_ROOT . '/reports';
	public const LOG_DIR = self::PROJECT_ROOT . '/logs';
	public const V1_URI_KEY = 'api/v1';
}

?>