<?php
// For `npm run serve` and the automated tests only; the real host (Apache)
// never uses this file.
//
// PHP's built-in server changed in 8.5: a request for a missing file now gets
// the homepage instead of "not found". This router makes it answer the way
// Apache does, so a missing file is a 404 on every PHP version.

$root = realpath($_SERVER['DOCUMENT_ROOT']);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
$target = realpath($root . $path);

$inside = $target !== false && ($target === $root || str_starts_with($target, $root . DIRECTORY_SEPARATOR));
$servable = $inside && (is_file($target) || is_file("$target/index.html") || is_file("$target/index.php"));

if ($servable) return false; // let the built-in server handle it as usual

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not found\n";
return true;
