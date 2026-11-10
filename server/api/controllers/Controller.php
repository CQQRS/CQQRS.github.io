<?php

abstract class Controller {

	private $_actionMap = [
		'' => 'GetAll'

	];

	 abstract protected function Process();

}

?>