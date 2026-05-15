<?php
declare(strict_types=1);

date_default_timezone_set('Africa/Kinshasa');

/*
 * Configuration Hostinger.
 *
 * A remplacer sur Hostinger si les variables d'environnement ne sont pas
 * configurees dans hPanel. Ne jamais mettre ces valeurs dans le frontend.
 */
function gtc_env(string $key, string $default): string
{
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

define('GTC_DB_HOST', gtc_env('GTC_DB_HOST', 'localhost'));
define('GTC_DB_NAME', gtc_env('GTC_DB_NAME', 'u459400944_gtc_bd'));
define('GTC_DB_USER', gtc_env('GTC_DB_USER', 'u459400944_USER_A_REMPLACER'));
define('GTC_DB_PASS', gtc_env('GTC_DB_PASS', 'MOT_DE_PASSE_A_REMPLACER'));
define('GTC_DB_CHARSET', 'utf8mb4');

/*
 * Mode debug temporaire et protege.
 * Exemple: /api/verify-certificate.php?certificate_id=GTC-EX-2026-0001&debug=VOTRE_TOKEN
 */
define('GTC_DEBUG_TOKEN', gtc_env('GTC_DEBUG_TOKEN', 'GTC_DEBUG_2026_SECURE_TEST'));
define('GTC_ADMIN_PASSWORD', gtc_env('GTC_ADMIN_PASSWORD', 'ADMIN_PASSWORD_A_REMPLACER'));

function gtc_is_debug(): bool
{
    if (GTC_DEBUG_TOKEN === 'DEBUG_TOKEN_A_REMPLACER' || GTC_DEBUG_TOKEN === '') {
        return false;
    }

    $token = (string) ($_GET['debug'] ?? ($_SERVER['HTTP_X_GTC_DEBUG'] ?? ''));
    return $token !== '' && hash_equals(GTC_DEBUG_TOKEN, $token);
}

function gtc_sanitize_debug_text(string $text): string
{
    $secrets = [
        GTC_DB_PASS,
        rawurlencode(GTC_DB_PASS),
        urlencode(GTC_DB_PASS),
    ];

    foreach ($secrets as $secret) {
        if ($secret !== '' && $secret !== 'MOT_DE_PASSE_A_REMPLACER') {
            $text = str_replace($secret, '[DB_PASSWORD_HIDDEN]', $text);
        }
    }

    return $text;
}

function gtc_exception_debug(Throwable $exception): array
{
    return [
        'type' => get_class($exception),
        'code' => (string) $exception->getCode(),
        'message' => gtc_sanitize_debug_text($exception->getMessage()),
    ];
}

function gtc_apply_cors(string $methods = 'GET, POST'): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-GTC-Debug');
    header('Access-Control-Allow-Methods: ' . $methods . ', OPTIONS');
    header('Access-Control-Max-Age: 86400');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function gtc_origin_is_allowed(): bool
{
    return true;
}

function gtc_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        http_response_code(500);
        echo '{"success":false,"message":"Erreur JSON."}';
        exit;
    }

    echo $json;
    exit;
}

function gtc_json_error(string $message, int $status = 400, array $extra = []): void
{
    gtc_json(array_merge([
        'success' => false,
        'message' => $message,
    ], $extra), $status);
}

function gtc_require_method(string $method): void
{
    $current = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($current !== $method) {
        header('Allow: ' . $method);
        gtc_json_error('Methode non autorisee.', 405);
    }
}

function gtc_db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    if (
        GTC_DB_USER === 'u459400944_USER_A_REMPLACER'
        || GTC_DB_PASS === 'MOT_DE_PASSE_A_REMPLACER'
    ) {
        throw new RuntimeException('Identifiants MySQL non configures dans public_html/api/db.php.');
    }

    if (!extension_loaded('pdo_mysql')) {
        throw new RuntimeException('Extension PHP pdo_mysql indisponible sur cet hebergement.');
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        GTC_DB_HOST,
        GTC_DB_NAME,
        GTC_DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 10,
    ];

    if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
        $options[PDO::MYSQL_ATTR_INIT_COMMAND] = 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci';
    }

    $pdo = new PDO($dsn, GTC_DB_USER, GTC_DB_PASS, $options);
    $pdo->exec('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');

    return $pdo;
}

function gtc_db_health(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT DATABASE() AS database_name, VERSION() AS mysql_version');
    $row = $stmt ? $stmt->fetch() : null;

    return [
        'connected' => true,
        'database' => $row['database_name'] ?? GTC_DB_NAME,
        'mysql_version' => $row['mysql_version'] ?? null,
    ];
}

function gtc_table_columns(PDO $pdo, string $table): array
{
    $stmt = $pdo->prepare(
        'SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table
         ORDER BY ORDINAL_POSITION'
    );
    $stmt->execute([':table' => $table]);

    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    return is_array($columns) ? array_values($columns) : [];
}

function gtc_clean_text($value, int $maxLength): string
{
    $text = trim((string) $value);
    $text = preg_replace('/[\x00-\x1F\x7F]/', '', $text) ?? $text;

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength, 'UTF-8');
    }

    return substr($text, 0, $maxLength);
}

function gtc_string_length(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function gtc_get_basic_password(): ?string
{
    if (isset($_SERVER['PHP_AUTH_PW'])) {
        return (string) $_SERVER['PHP_AUTH_PW'];
    }

    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (stripos($authorization, 'Basic ') === 0) {
        $decoded = base64_decode(substr($authorization, 6), true);
        if ($decoded !== false && strpos($decoded, ':') !== false) {
            return substr($decoded, strpos($decoded, ':') + 1);
        }
    }

    return null;
}

function gtc_require_admin_password(): void
{
    if (GTC_ADMIN_PASSWORD === 'ADMIN_PASSWORD_A_REMPLACER') {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Veuillez configurer GTC_ADMIN_PASSWORD dans public_html/api/db.php.';
        exit;
    }

    $provided = gtc_get_basic_password();
    if ($provided === null || !hash_equals(GTC_ADMIN_PASSWORD, $provided)) {
        header('WWW-Authenticate: Basic realm="GTC Admin Temporaire"');
        http_response_code(401);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Authentification requise.';
        exit;
    }
}

function gtc_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
