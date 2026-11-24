<?php

require_once __DIR__ . '/../config.php';

class Log
{

	private string $_prefix;
	private string $_logName;

	function __construct(string $prefix, string $logName = "apiLog")
	{
		$this->_prefix = $prefix;
		$this->_logName = $logName;
	}

	private function writeLog( string $type, string $message) {
		$logDir = Config::LOG_DIR;
		if (!is_dir($logDir)) {
			mkdir($logDir, 0775, true);
		}

		$logPath = $logDir . "/" . $this->_logName . ".log";
		$timestamp = gmdate('Y-m-d\TH:i:s\Z');
		$context = [
			$timestamp,
			$type,
			$this->_prefix,
			$message,
		];

		file_put_contents($logPath, join("\t", $context) . "\n", FILE_APPEND | LOCK_EX);

	}

	public function Debug(string $message)
	{
		$this->writeLog("DEBUG", $message);
	}

	public function Warn(string $message)
	{
		$this->writeLog("WARN", $message);
	}

	public function Error(string $message, ?Throwable $ex = null)
	{
		$message = $ex == null
			? $message
			: $message . "\n" . $ex->getTraceAsString() . "\n";
		
		$this->writeLog("ERROR", $message);
	}
}
