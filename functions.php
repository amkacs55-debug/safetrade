<?php
// ============================================
// functions.php — Үндсэн функцууд
// ============================================
require_once __DIR__.'/config.php';

/**
 * Шимтгэл тооцох
 * Жишээ: 10000₮ → fee=500₮, seller=9500₮
 */
function calculate_fee(float $price): array {
    $fee    = round($price * PLATFORM_FEE_PERCENT / 100, 2);
    $seller = round($price - $fee, 2);
    return ['gross' => $price, 'fee' => $fee, 'seller' => $seller];
}

/**
 * Credentials шифрлэх (хадгалахад)
 */
function encrypt_credentials(string $plain): string {
    $iv = random_bytes(16);
    $encrypted = openssl_encrypt($plain, ENCRYPT_CIPHER, ENCRYPT_KEY, 0, $iv);
    return base64_encode($iv . $encrypted);
}

/**
 * Credentials тайлах (хүргэлтэд)
 */
function decrypt_credentials(string $stored): string {
    $raw       = base64_decode($stored);
    $iv        = substr($raw, 0, 16);
    $encrypted = substr($raw, 16);
    return openssl_decrypt($encrypted, ENCRYPT_CIPHER, ENCRYPT_KEY, 0, $iv);
}

/**
 * Нууц үг hash хийх
 */
function hash_password(string $pass): string {
    return password_hash($pass, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verify_password(string $pass, string $hash): bool {
    return password_verify($pass, $hash);
}

/**
 * Санамсаргүй token үүсгэх
 */
function generate_token(int $length = 32): string {
    return bin2hex(random_bytes($length));
}

/**
 * IP хаяг авах
 */
function get_ip(): string {
    return $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
}

/**
 * Input цэвэрлэх
 */
function clean(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Тоо форматлах (₮ тэмдэгтэй)
 */
function format_price(float $amount): string {
    return number_format($amount, 0, '.', ',') . '₮';
}

/**
 * QPay API токен авах
 */
function qpay_get_token(): string {
    $ch = curl_init(QPAY_API_URL . '/auth/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_USERPWD        => QPAY_USERNAME . ':' . QPAY_PASSWORD,
    ]);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res['access_token'] ?? '';
}

/**
 * QPay нэхэмжлэл үүсгэх
 */
function qpay_create_invoice(int $order_id, float $amount, string $description): array {
    $token = qpay_get_token();
    $body  = [
        'invoice_code'         => QPAY_INVOICE_CODE,
        'sender_invoice_no'    => 'ORDER-' . $order_id,
        'invoice_receiver_code'=> 'terminal',
        'invoice_description'  => $description,
        'amount'               => $amount,
        'callback_url'         => BASE_URL . '/backend/qpay_webhook.php?order=' . $order_id
                                    . '&secret=' . WEBHOOK_SECRET,
    ];
    $ch = curl_init(QPAY_API_URL . '/invoice');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ],
        CURLOPT_POSTFIELDS     => json_encode($body),
    ]);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res ?? [];
}

/**
 * QPay нэхэмжлэл шалгах
 */
function qpay_check_invoice(string $invoice_id): array {
    $token = qpay_get_token();
    $ch = curl_init(QPAY_API_URL . '/payment/check');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ],
        CURLOPT_POSTFIELDS => json_encode(['object_type' => 'INVOICE', 'object_id' => $invoice_id]),
    ]);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res ?? [];
}
