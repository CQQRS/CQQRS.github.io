<?php

class RouteGuard {
	public static string $Filename = '[a-zA-Z0-9_.\-]+';
	public static string $Int = '\d+';
	public static string $Year = '\d{4}';
	public static string $Week = '\d{2}';
	public static string $Callsign = '(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+';
}
