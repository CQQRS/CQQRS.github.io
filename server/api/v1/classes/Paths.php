<?php

require_once __DIR__ . '/../config.php';

class Paths
{
	public static function ReportResponseDir(int $year, int $week)
	{

		$glob = Config::REPORT_ROOT . "/{$year}_{$week}/*.json";
		return glob($glob);
	}

	public static function AppendSuffixToFileName(string $filename, string $suffix): string
	{
		$dir = dirname($filename);
		$info = pathinfo($filename);

		$newName = $info['filename'] . '_' . $suffix;

		if (!empty($info['extension'])) {
			$newName .= '.' . $info['extension'];
		}

		return ($dir === '.' || $dir === '') ? $newName : $dir . '/' . $newName;
	}
}
