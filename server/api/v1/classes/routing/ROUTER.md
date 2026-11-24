# Router

A small, dependency-free REST router for PHP 8.1+. It has three main parts:

- `Request`: method, path, query, decoded JSON body and matched route params.
- `Router`: route registration, groups, middleware and dispatch.
- `Response`: response helpers for JSON, JPEG, blank responses with appropriate headers.
- `HttpException`: throw it from anywhere to produce a JSON error response.

## Quick start

```php
$router = new Router('/api/v1');

$router->get('/health', fn() => Response::Json(['ok' => true]));

$router->get('/users/{id}', function (Request $req) {
    return Response::Json(['id' => $req->params['id']]);
})->where('id', '\d+');
```

Point your web server at `index.php` as the front controller. For local development:

```
php -S 127.0.0.1:8000 index.php
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

| Pattern | Constraint | Matches | `$req->params` |
|---|---|---|---|
| `/users/{id}` | (none, default) | `/users/42`, `/users/abc` | `['id' => '42']` |
| `/users/{id}` with `.where('id', '\d+')` | `\d+` | `/users/42` only | `['id' => '42']` |
| `/posts/{slug}` with `.where('slug', '[a-z0-9-]+')` | `[a-z0-9-]+` | `/posts/hello-world` | `['slug' => 'hello-world']` |

By default, a parameter matches any characters except `/`. To constrain a parameter, chain `.where(param, pattern)` after the route definition. Values are always strings, so cast them yourself. Trailing slashes are ignored.

**Available constraint patterns in `RouteGuard`:**

```php
RouteGuard::$Filename  // [a-zA-Z0-9_.\-]+   - filenames with extensions
RouteGuard::$String    // .+                  - any characters
RouteGuard::$Int       // \d+                 - integers
RouteGuard::$Year      // \d{4}               - 4-digit year
RouteGuard::$Week      // \d{2}               - 2-digit week
RouteGuard::$Callsign  // (?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+  - alphanumeric with letters and digits
```

## Handlers

A handler is any callable that takes a `Request` and returns `[status, data, headers?]`. Use the `Response` helpers to build that:

```php
Response::Json($data);           // 200 with Content-Type: application/json
Response::Json($data, 201);      // 201 Created
Response::Jpeg();                // 200 with Content-Type: image/jpeg (use with readfile())
Response::Blank();               // 200 with no body
Response::Json(null, 204);       // 204 No Content (no body is sent)
```

A handler can also return a third element, an array of response headers:

```php
return [201, $user, ['Location' => "/api/v1/users/{$user['id']}"]];
```

**Important:** Set response headers with `Response::*()` **before** outputting body content (e.g., before `readfile()`), since headers must be sent first in HTTP.

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
    [$status, $data, $headers] = $next($req);
    $headers = $headers ?? [];
    $headers['X-Time-Ms'] = (string)round((microtime(true) - $start) * 1000);
    return [$status, $data, $headers];
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
| Any other uncaught exception | `500 Internal Server Error`, with details logged |

## OPTIONS and CORS

`OPTIONS` is answered automatically for any path that has at least one route:

```
OPTIONS /api/v1/users  ->  204
Allow: GET, POST, OPTIONS
```

Automatic OPTIONS responses skip middleware, so browser preflight requests succeed without an auth token. Register `$router->options(...)` to override this for a path.

## Testing with curl

```
curl -i localhost:8000/health
curl -i -X OPTIONS localhost:8000/api/v1/users
curl -i -X POST -H 'Authorization: Bearer secret' \
     -d '{"name":"Grace"}' localhost:8000/api/v1/users
curl -i localhost:8000/api/v1/reports/2026/47/images/VK7TO_2026_44.jpg
```

## Notes and limits

- Routes are matched in registration order, and the first match wins. Register specific paths before catch-alls.
- There is no route caching. Compiling regexes on each request is fine for small APIs; for large route tables consider FastRoute.
- `HEAD` is not handled automatically. Add it with `$router->add('HEAD', ...)` if you need it.
- Path parameters by default match anything except `/`. Use `.where(param, pattern)` to add constraints.
- Character class patterns in constraints should follow standard regex syntax; ensure hyphens are at the start or end of character classes (e.g., `[a-zA-Z0-9_.\-]` not `[a-zA-Z0-9_\-\.]`).
