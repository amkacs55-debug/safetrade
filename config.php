<?php
// ============================================
// config.php — Шууд утгатай (Supabase)
// ============================================

// --- Database ---
define('DB_HOST', 'aws-1-ap-northeast-1.pooler.supabase.com');
define('DB_PORT', 6543);
define('DB_USER', 'postgres.mmdvytteigecblxuvust');
define('DB_PASS', 'Hosoo0625201'); // ← нууц үгээ энд бич
define('DB_NAME', 'postgres');

// --- QPay (одоогоор хоосон = demo горим) ---
define('QPAY_API_URL',      'https://merchant.qpay.mn/v2');
define('QPAY_USERNAME',     '');
define('QPAY_PASSWORD',     '');
define('QPAY_INVOICE_CODE', '');
define('DEMO_MODE', true);

// --- Шимтгэл ---
define('PLATFORM_FEE_PERCENT', 5);

// --- Шифрлэлт (яг 32 тэмдэгт) ---
define('ENCRYPT_KEY',    'GameMarket2024SecretKey!Mongolia');
define('ENCRYPT_CIPHER', 'AES-256-CBC');

// --- URL ---
define('BASE_URL',       'https://YOUR_APP.onrender.com'); // ← render URL-аа бич
define('WEBHOOK_SECRET', 'gmarket_webhook_2024_secret');

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
