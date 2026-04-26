<?php
// ============================================
// config.php — Supabase & QPay Тохиргоо
// ============================================

// Supabase Database (PostgreSQL) холболтын мэдээлэл
define('DB_HOST', 'aws-1-ap-northeast-1.pooler.supabase.com');
define('DB_PORT', '6543');
define('DB_USER', 'postgres.mmdvytteigecblxuvust');
define('DB_PASS', 'Hosoo0625201'); // <--- Энд Supabase нууц үгээ заавал бичээрэй
define('DB_NAME', 'postgres');

// Supabase API мэдээлэл (Frontend болон бусад үйлдэлд)
define('SUPABASE_URL', 'https://mmdvytteigecblxuvust.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZHZ5dHRlaWdlY2JseHV2dXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDc4NzIsImV4cCI6MjA5MjA4Mzg3Mn0.OUdv01DC5jRNz2it4EapZ4BH3t-gtmFn4WOlFNBGC4g');

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

// Session эхлүүлэх
if (session_status() === PHP_SESSION_NONE) {
    session_name('gmarket_sess');
    session_start();
}

/**
 * Supabase (PostgreSQL) DB холболт үүсгэх функц
 */
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            // PostgreSQL DSN тохиргоо
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            // Холболт амжилтгүй болвол алдааг мэдээлнэ
            die("Database connection failed: " . $e->getMessage());
        }
    }
    return $pdo;
}

/**
 * JSON хариу буцаах хялбар функц
 */
function json_response(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
