<?php

include_once(__DIR__ . '/Exceptions.php');
include_once(__DIR__ . '/Request.php');
include_once(__DIR__ . '/Response.php');
include_once(__DIR__ . '/RouteGuards.php');
include_once(__DIR__ . '/Middleware.php');
include_once(__DIR__ . '/RouteBuilder.php');


final class Router
{
    /** @var array<int, array{method:string, path:string, regex:string, handler:callable, middleware:array, constraints:array}> */
    public array $routes = [];
	private string $apiRoot = '';
	private string $prefix = '';
    private array $groupMiddleware = [];

	public function __construct(string $apiRoot = '')
	{
		$this->apiRoot = $apiRoot;
	}

    public function get(string $path, callable $h, array $mw = []): RouteBuilder    { return $this->add('GET', $path, $h, $mw); }
    public function post(string $path, callable $h, array $mw = []): RouteBuilder   { return $this->add('POST', $path, $h, $mw); }
    public function put(string $path, callable $h, array $mw = []): RouteBuilder    { return $this->add('PUT', $path, $h, $mw); }
    public function patch(string $path, callable $h, array $mw = []): RouteBuilder  { return $this->add('PATCH', $path, $h, $mw); }
    public function delete(string $path, callable $h, array $mw = []): RouteBuilder { return $this->add('DELETE', $path, $h, $mw); }
    public function options(string $path, callable $h, array $mw = []): RouteBuilder { return $this->add('OPTIONS', $path, $h, $mw); }

    /** Group routes under a shared prefix and middleware. */
    public function group(string $prefix, callable $define, array $mw = []): void
    {
        [$oldPrefix, $oldMw] = [$this->prefix, $this->groupMiddleware];
        $this->prefix .= $prefix;
        $this->groupMiddleware = [...$oldMw, ...$mw];
        $define($this);
        [$this->prefix, $this->groupMiddleware] = [$oldPrefix, $oldMw];
    }

    public function add(string $method, string $path, callable $handler, array $mw = []): RouteBuilder
    {
        $fullPath = $this->apiRoot . $this->prefix . $path;
        $routeIndex = count($this->routes);
        
        $this->routes[] = [
            'method'      => $method,
            'path'        => $fullPath,
            'regex'       => $this->compileRoute($fullPath, []),
            'handler'     => $handler,
            'middleware'  => [...$this->groupMiddleware, ...$mw],
            'constraints' => [],
        ];
        
        return new RouteBuilder($this->routes[$routeIndex], $this);
    }

    /** Compile route path with optional parameter constraints into regex. */
    public function compileRoute(string $path, array $constraints = []): string
    {
        $regex = preg_replace_callback(
            '#\{(\w+)\}#',
            fn($m) => '(?P<' . $m[1] . '>' . ($constraints[$m[1]] ?? '[^/]+') . ')',
            rtrim($path, '/') ?: '/'
        );
        return '#^' . $regex . '$#';
    }

    public function dispatch(Request $req): array
    {
		$allowed = [];
        foreach ($this->routes as $route) {
            
			$regex = $route['regex'];

			if (!preg_match($route['regex'], $req->path, $m)) continue;
            if ($route['method'] !== $req->method) { $allowed[] = $route['method']; continue; }

            $req->params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);

            // Build the middleware pipeline around the handler.
            $next = fn(Request $r) => ($route['handler'])($r);
            foreach (array_reverse($route['middleware']) as $mw) {
                $next = fn(Request $r) => $mw($r, $next);
            }
            return $next($req);
        }
        if ($allowed) {
            // Automatic OPTIONS: report what the path supports (skips middleware, so preflights need no auth).
            if ($req->method === 'OPTIONS') {
                $methods = implode(', ', array_unique([...$allowed, 'OPTIONS']));
                return [204, null, ['Allow' => $methods]];
            }
            throw new HttpException(405, 'Method Not Allowed', ['Allow' => implode(', ', array_unique($allowed))]);
        }
        throw new HttpException(404, 'Not Found');
    }
}