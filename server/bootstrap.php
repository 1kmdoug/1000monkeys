<?php
// Shared setup for every server endpoint. Lives outside the public folder,
// so it can never be fetched directly from the web.
//
// The rule this file enforces: nothing that reads a manuscript or writes to a
// source runs without the owner's login. Endpoints call require_owner() first.

declare(strict_types=1);

const SESSION_DAYS = 30;

function root_path(string $rel = ''): string {
    return dirname(__DIR__) . ($rel === '' ? '' : '/' . $rel);
}

// Config holds secrets (password hash now, Notion token later). It is never in
// the repo: config.local.php sits beside this folder, outside the web root.
function config(): array {
    static $config = null;
    if ($config !== null) return $config;
    $path = getenv('MONKEYS_CONFIG') ?: root_path('config.local.php');
    $loaded = is_file($path) ? require $path : [];
    $config = is_array($loaded) ? $loaded : [];
    return $config;
}

// Server-side working files (sessions, login attempt log). Not in the repo.
function storage_path(string $rel = ''): string {
    $base = getenv('MONKEYS_STORAGE') ?: root_path('storage');
    $path = $rel === '' ? $base : $base . '/' . $rel;
    $dir = $rel === '' || str_ends_with($rel, '/') ? $path : dirname($path);
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    return $path;
}

function is_https(): bool {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function json_out(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode($data);
    exit;
}

function cookie_options(int $expires): array {
    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $lifetime = SESSION_DAYS * 86400;
    ini_set('session.gc_maxlifetime', (string) $lifetime);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_save_path(storage_path('sessions/'));
    session_name('monkeys');
    $opts = cookie_options(0);
    unset($opts['expires']);
    session_set_cookie_params(['lifetime' => $lifetime] + $opts);
    session_start();
}

function owner_configured(): bool {
    return is_string(config()['owner_password_hash'] ?? null)
        && config()['owner_password_hash'] !== '';
}

function is_owner(): bool {
    start_session();
    return ($_SESSION['owner'] ?? false) === true;
}

// Keep a signed-in phone signed in: push the cookie's expiry out on each visit.
function refresh_session_cookie(): void {
    setcookie(session_name(), session_id(), cookie_options(time() + SESSION_DAYS * 86400));
}

// Gate for anything private. Call at the top of an endpoint.
function require_owner(): void {
    if (!is_owner()) json_out(['error' => 'sign_in_required'], 401);
}

// Only accept form posts that come from our own pages.
function require_same_origin_post(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        json_out(['error' => 'post_only'], 405);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== strtok($_SERVER['HTTP_HOST'] ?? '', ':')) {
        json_out(['error' => 'wrong_origin'], 403);
    }
    if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
        json_out(['error' => 'json_only'], 415);
    }
}

function json_body(): array {
    $body = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($body) ? $body : [];
}

// ---- Slow down password guessing: a handful of wrong tries, then a wait.

const LOGIN_WINDOW_SECONDS = 900;

function login_attempt_limit(): int {
    return (int) (config()['login_max_attempts'] ?? 5);
}

function with_attempt_log(callable $fn) {
    $fh = fopen(storage_path('login-attempts.json'), 'c+');
    if (!$fh) return $fn([]);
    flock($fh, LOCK_EX);
    $log = json_decode(stream_get_contents($fh) ?: '', true);
    $log = is_array($log) ? $log : [];
    $cutoff = time() - LOGIN_WINDOW_SECONDS;
    foreach ($log as $ip => $times) {
        $log[$ip] = array_values(array_filter($times, fn($t) => $t > $cutoff));
        if (!$log[$ip]) unset($log[$ip]);
    }
    $result = $fn($log);
    if (is_array($result['log'] ?? null)) {
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($result['log']));
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $result['value'] ?? null;
}

function client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function too_many_attempts(): bool {
    return (bool) with_attempt_log(fn($log) => [
        'value' => count($log[client_ip()] ?? []) >= login_attempt_limit(),
    ]);
}

function record_failed_attempt(): void {
    with_attempt_log(function ($log) {
        $log[client_ip()][] = time();
        return ['log' => $log];
    });
}

function clear_attempts(): void {
    with_attempt_log(function ($log) {
        unset($log[client_ip()]);
        return ['log' => $log];
    });
}
