<?php
session_start();

// Render-ийн Environment Variables-аас унших, хэрэв байхгүй бол чиний өгсөн утгыг ашиглана
define('SUPABASE_URL', getenv('SUPABASE_URL') ?: 'https://mmdvytteigecblxuvust.supabase.co');
define('SUPABASE_KEY', getenv('SUPABASE_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZHZ5dHRlaWdlY2JseHV2dXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDc4NzIsImV4cCI6MjA5MjA4Mzg3Mn0.OUdv01DC5jRNz2it4EapZ4BH3t-gtmFn4WOlFNBGC4g');

/**
 * Supabase REST API руу хүсэлт илгээх функц
 * Алдааг хянах механизм нэмэгдсэн
 */
function supabase_request($endpoint, $method = 'GET', $data = null) {
    $url = SUPABASE_URL . $endpoint;
    $ch = curl_init();

    $auth_token = isset($_SESSION['access_token']) ? $_SESSION['access_token'] : SUPABASE_KEY;

    $headers = [
        "apikey: " . SUPABASE_KEY,
        "Authorization: Bearer " . $auth_token,
        "Content-Type: application/json",
        "Prefer: return=representation"
    ];

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // SSL сертификатын асуудлаас сэргийлнэ

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // Хэрэв cURL өөрөө алдаа заавал (холболтгүй гэх мэт)
    if ($response === false) {
        return ['code' => 500, 'data' => ['msg' => 'cURL Error: ' . $curl_error]];
    }

    $decoded_data = json_decode($response, true);
    
    // JSON задлахад алдаа гарсан эсэхийг шалгах
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['code' => $httpcode, 'data' => ['msg' => 'Invalid JSON response', 'raw' => $response]];
    }

    return ['code' => $httpcode, 'data' => $decoded_data];
}

/**
 * Нэвтрэхийг шаардах функц
 */
function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit;
    }
}

/**
 * CSRF хамгаалалт (Сонголтоор нэмж болно)
 */
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
