<?php
// Owner sign-in. One password, set on the server with server/set-password.php.
require __DIR__ . '/../../../server/bootstrap.php';

require_same_origin_post();
if (!owner_configured()) json_out(['error' => 'not_configured'], 503);
if (too_many_attempts()) json_out(['error' => 'too_many_attempts'], 429);

$password = json_body()['password'] ?? '';
if (!is_string($password) || !password_verify($password, config()['owner_password_hash'])) {
    record_failed_attempt();
    json_out(['error' => 'wrong_password'], 401);
}

clear_attempts();
start_session();
session_regenerate_id(true);
$_SESSION['owner'] = true;
json_out(['configured' => true, 'owner' => true]);
