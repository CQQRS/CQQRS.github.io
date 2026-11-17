<?php

require_once __DIR__ . '/../config.php';


class Paths {

	public static function ReportResponseDir(int $year, int $week) {

		$glob = Config::REPORT_ROOT . "/{$year}_{$week}/*.json";
		return glob($glob);

	}

}