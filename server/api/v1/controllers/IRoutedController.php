<?php

require_once __DIR__ . '/../classes/routing/Router.php';

interface IRoutedController {

	public function __construct(Router $router);
}