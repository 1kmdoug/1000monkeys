<?php
// Who is looking at the app right now? Safe to call by anyone.
require __DIR__ . '/../../../server/bootstrap.php';

$owner = owner_configured() && is_owner();
if ($owner) refresh_session_cookie();
json_out(['configured' => owner_configured(), 'owner' => $owner]);
