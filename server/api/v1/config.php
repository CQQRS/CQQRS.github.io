<?php

class Config {
	private const PROJECT_ROOT = __DIR__ . '/../..';
	
	public const API_ROOT = '/projects/cqqrsnet/api/v1';
	public const REPORT_ROOT = self::PROJECT_ROOT . '/reports';
	public const ASSETS_ROOT = self::PROJECT_ROOT . '/assets';
	public const DATA_ROOT = self::PROJECT_ROOT . '/data';
	public const LOG_DIR = self::PROJECT_ROOT . '/logs';

	public const MemberDirectoryPath = self::DATA_ROOT . "/memberDirectory.json";
	public const AvitarPath = self::DATA_ROOT . "/avitars";

	public const V1_URI_KEY = 'api/v1';
}

?>