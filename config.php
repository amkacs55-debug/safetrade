<?php
// ============================================
// config.php — Тохиргооны файл
// ============================================
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'game_marketplace');

// QPay API тохиргоо
define('QPAY_API_URL',      'https://merchant.qpay.mn/v2');
define('QPAY_USERNAME',     'YOUR_QPAY_USERNAME');
define('QPAY_PASSWORD',     'YOUR_QPAY_PASSWORD');
define('QPAY_INVOICE_CODE', 'YOUR_INVOICE_CODE');

// Шимтгэл (%)
define('PLATFORM_FEE_PERCENT', 5); // 5% шимтгэл

// Нууцлалын түлхүүр (32 байт)
define('ENCRYPT_KEY', 'YOUR_32_BYTE_SECRET_KEY_HERE!!1');
define('ENCRYPT_CIPHER', 'AES-256-CBC');

// Сайтын үндсэн URL
define('BASE_URL', 'https://yourdomain.mn');
define('WEBHOOK_SECRET', 'YOUR_WEBHOOK_SECRET_TOKEN');

// Захиалга дуусах хугацаа (минут)
define('ORDER_EXPIRE_MINUTES', 30);

// Session
session_name('gmarket_sess');
session_start();

// DB холболт
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// JSON хариу буцаах хялбар функц
function json_response(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
