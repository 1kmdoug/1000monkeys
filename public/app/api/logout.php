<?php
require __DIR__ . '/../../../server/bootstrap.php';

require_same_origin_post();
start_session();
$_SESSION = [];
setcookie(session_name(), '', cookie_options(1));
session_destroy();
json_out(['configured' => owner_configured(), 'owner' => false]);
