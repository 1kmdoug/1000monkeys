<?php
// Sets (or changes) the owner password. Run on the server, from the folder
// that holds this repo:
//
//     php server/set-password.php
//
// It stores a one-way hash in config.local.php, never the password itself.

declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

require __DIR__ . '/bootstrap.php';

function ask_hidden(string $prompt): string {
    fwrite(STDERR, $prompt);
    $tty = stream_isatty(STDIN);
    if ($tty) shell_exec('stty -echo 2>/dev/null');
    $line = fgets(STDIN);
    if ($tty) { shell_exec('stty echo 2>/dev/null'); fwrite(STDERR, "\n"); }
    return rtrim($line === false ? '' : $line, "\r\n");
}

$password = ask_hidden('New owner password (at least 10 characters): ');
if (strlen($password) < 10) { fwrite(STDERR, "Too short. Nothing changed.\n"); exit(1); }
if (ask_hidden('Type it again: ') !== $password) { fwrite(STDERR, "Those didn't match. Nothing changed.\n"); exit(1); }

$path = getenv('MONKEYS_CONFIG') ?: root_path('config.local.php');
$config = config();
$config['owner_password_hash'] = password_hash($password, PASSWORD_DEFAULT);

$php = "<?php\n// Private settings for this server. Never commit this file.\nreturn " . var_export($config, true) . ";\n";
if (file_put_contents($path, $php, LOCK_EX) === false) { fwrite(STDERR, "Couldn't write $path\n"); exit(1); }
@chmod($path, 0600);

// Sign out every device, so an old password stops working everywhere.
foreach (glob(storage_path('sessions/') . 'sess_*') ?: [] as $file) @unlink($file);

fwrite(STDERR, "Password saved to $path. Any signed-in devices were signed out.\n");
