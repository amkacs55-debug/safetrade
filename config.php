<?php
// ============================================
// config.php — Supabase PostgreSQL + Render env
// ============================================

// --- Database (Supabase PostgreSQL) ---
// Render environment variables-д тохируулна:
// DATABASE_URL = postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
$_db_url = getenv('DATABASE_URL') ?: '';

if ($_db_url) {
    // DATABASE_URL-с задлах
    $p = parse_url($_db_url);
    define('DB_HOST', $p['host']);
    define('DB_PORT', $p['port'] ?? 6543);
    define('DB_USER', urldecode($p['user']));
    define('DB_PASS', urldecode($p['pass']));
    define('DB_NAME', ltrim($p['path'], '/'));
} else {
    // Тусдаа env vars (fallback)
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_PORT', (int)(getenv('DB_PORT') ?: 5432));
    define('DB_USER', getenv('DB_USER') ?: 'postgres');
    define('DB_PASS', getenv('DB_PASS') ?: '');
    define('DB_NAME', getenv('DB_NAME') ?: 'postgres');
}

// --- QPay ---
define('QPAY_API_URL',      'https://merchant.qpay.mn/v2');
define('QPAY_USERNAME',     getenv('QPAY_USERNAME')     ?: '');
define('QPAY_PASSWORD',     getenv('QPAY_PASSWORD')     ?: '');
define('QPAY_INVOICE_CODE', getenv('QPAY_INVOICE_CODE') ?: '');

// QPAY_USERNAME хоосон бол DEMO горим
define('DEMO_MODE', QPAY_USERNAME === '');

// --- Шимтгэл ---
define('PLATFORM_FEE_PERCENT', (int)(getenv('FEE_PERCENT') ?: 5));

// --- Шифрлэлт (яг 32 тэмдэгт) ---
$_ekey = getenv('ENCRYPT_KEY') ?: 'DemoKey_32bytes_ForTestOnly!!!1';
define('ENCRYPT_KEY',    substr(str_pad($_ekey, 32, '0'), 0, 32));
define('ENCRYPT_CIPHER', 'AES-256-CBC');

// --- URL / Webhook ---
define('BASE_URL',       rtrim(getenv('BASE_URL') ?: 'http://localhost', '/'));
define('WEBHOOK_SECRET', getenv('WEBHOOK_SECRET') ?: 'demo_webhook_secret');

// --- Захиалга дуусах хугацаа ---
define('ORDER_EXPIRE_MINUTES', 30);

// --- Session ---
session_name('gmarket_sess');
if (session_status() === PHP_SESSION_NONE) session_start();

// --- PostgreSQL PDO холболт ---
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'pgsql:host=%s;port=%d;dbname=%s;sslmode=require',
            DB_HOST, DB_PORT, DB_NAME
        );
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// --- JSON хариу ---
function json_response(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
