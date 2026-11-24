<?php

/** Fluent builder for defining route parameter constraints. */
class RouteBuilder
{
    private array $route;
    private Router $router;

    public function __construct(array &$route, Router $router)
    {
        $this->route = &$route;
        $this->router = $router;
    }

    /**
     * Apply a constraint pattern to a route parameter.
     * @param string $param Parameter name
     * @param string $pattern Regex pattern (without delimiters)
     * @return $this
     */
    public function where(string $param, string $pattern): self
    {
        if (!isset($this->route['constraints'])) {
            $this->route['constraints'] = [];
        }
        $this->route['constraints'][$param] = $pattern;
        $this->route['regex'] = $this->router->compileRoute(
            $this->route['path'],
            $this->route['constraints']
        );
        return $this;
    }

    /**
     * Apply multiple constraints at once.
     * @param array<string, string> $constraints Map of param => pattern
     * @return $this
     */
    public function whereMany(array $constraints): self
    {
        foreach ($constraints as $param => $pattern) {
            $this->where($param, $pattern);
        }
        return $this;
    }
}
