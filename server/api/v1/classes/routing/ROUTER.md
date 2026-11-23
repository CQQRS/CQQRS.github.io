# Router

A small, dependency-free REST router for PHP 8.1+. It lives in `api.php` and has three parts:

- `Request`: method, path, query, decoded JSON body and matched route params.
- `Router`: route registration, groups, middleware and dispatch.
- `HttpException`: throw it from anywhere to produce a JSON error response.

## Quick start

```php
$router = new Router();

$router->get('/health', fn() => json(['ok' => true]));

$router->get('/users/{id:\d+}', function (Request $req) {
    return json(['id' => (int)$req->params['id']]);
});
```

Point your web server at `api.php` as the front controller. For local development:

```
php -S 127.0.0.1:8000 api.php
```

## Defining routes

Shortcut methods exist for each verb:

```php
$router->get($path, $handler, $middleware = []);
$router->post(...);
$router->put(...);
$router->patch(...);
$router->delete(...);
$router->options(...);
$router->add('HEAD', $path, $handler);   // any other method
```

### Path parameters

| Pattern | Matches | `$req->params` |
|---|---|---|
| `/users/{id}` | `/users/42`, `/users/abc` | `['id' => '42']` |
| `/users/{id:\d+}` | `/users/42` only | `['id' => '42']` |
| `/posts/{slug:[a-z0-9-]+}` | `/posts/hello-world` | `['slug' => 'hello-world']` |

Without a constraint, a parameter matches any characters except `/`. Values are always strings, so cast them yourself. Trailing slashes are ignored.

## Handlers

A handler is any callable that takes a `Request` and returns `[status, data]`. Use the `json()` helper to build that:

```php
json($data);          // 200
json($data, 201);     // 201 Created
json(null, 204);      // 204 No Content (no body is sent)
```

A handler can also return a third element, an array of response headers:

```php
return [201, $user, ['Location' => "/api/v1/users/{$user['id']}"]];
```

### Reading the request

```php
$req->method;            // 'POST'
$req->path;              // '/api/v1/users'
$req->params['id'];      // path parameter
$req->query['page'] ?? 1; // query string (?page=2)
$req->body['name'] ?? null; // decoded JSON body
```

A body that isn't valid JSON becomes an empty array.

## Groups

Groups share a path prefix and middleware. They can be nested.

```php
$router->group('/api/v1', function (Router $r) use ($auth) {
    $r->get('/users', $listUsers);                  // GET /api/v1/users

    $r->group('/admin', function (Router $r) {
        $r->get('/stats', $stats);                  // GET /api/v1/admin/stats
    }, [$adminOnly]);                               // adds to the outer middleware
}, [$auth]);
```

## Middleware

A middleware is a callable with the signature `fn(Request $req, callable $next)`. It either calls `$next($req)` to continue or throws to stop.

```php
$auth = function (Request $req, callable $next) {
    if (($_SERVER['HTTP_AUTHORIZATION'] ?? '') !== 'Bearer secret') {
        throw new HttpException(401, 'Unauthorized');
    }
    return $next($req);
};

$router->post('/users', $createUser, [$auth]);   // single route
$router->group('/api/v1', $define, [$auth]);     // whole group
```

Execution order is outermost first: group middleware, then route middleware, then the handler. A middleware can also modify the response by wrapping `$next`:

```php
$timing = function (Request $req, callable $next) {
    $start = microtime(true);
    [$status, $data] = $next($req);
    return [$status, $data, ['X-Time-Ms' => (string)round((microtime(true) - $start) * 1000)]];
};
```

## Errors

Throw `HttpException` from handlers or middleware:

```php
throw new HttpException(404, 'User not found');
throw new HttpException(422, 'name is required');
throw new HttpException(429, 'Slow down', ['Retry-After' => '30']);
```

The front controller turns it into `{"error": "<message>"}` with the given status and headers. The router raises these itself:

| Situation | Response |
|---|---|
| No route matches the path | `404 Not Found` |
| Path matches, but not for this method | `405 Method Not Allowed` with an `Allow` header |
| Any other uncaught exception | `500 Internal Server Error`, with details written to `error_log` and not sent to the client |

## OPTIONS and CORS

`OPTIONS` is answered automatically for any path that has at least one route:

```
OPTIONS /api/v1/users  ->  204
Allow: GET, POST, OPTIONS
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

Automatic OPTIONS responses skip middleware, so browser preflight requests succeed without an auth token. Register `$router->options(...)` to override this for a path.

Every response includes `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers` and `Access-Control-Max-Age`. The origin defaults to `*`. In production set the `CORS_ORIGIN` environment variable to your frontend's origin:

```
CORS_ORIGIN=https://app.example.com
```

## Testing with curl

```
curl -i localhost:8000/health
curl -i -X OPTIONS localhost:8000/api/v1/users
curl -i -X POST -H 'Authorization: Bearer secret' \
     -d '{"name":"Grace"}' localhost:8000/api/v1/users
```

## Notes and limits

- Routes are matched in registration order, and the first match wins. Register specific paths before catch-alls.
- There is no route caching. Compiling regexes on each request is fine for small APIs; for large route tables consider FastRoute.
- `HEAD` is not handled automatically. Add it with `$router->add('HEAD', ...)` if you need it.
- The sample `$users` array and the hard-coded bearer token in `api.php` are placeholders. Replace them with a real data layer and real authentication.
