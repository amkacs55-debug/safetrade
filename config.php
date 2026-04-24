<?php
session_start();

define('SUPABASE_URL', 'https://mmdvytteigecblxuvust.supabase.co');
define('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZHZ5dHRlaWdlY2JseHV2dXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDc4NzIsImV4cCI6MjA5MjA4Mzg3Mn0.OUdv01DC5jRNz2it4EapZ4BH3t-gtmFn4WOlFNBGC4g');

// Supabase REST API руу хүсэлт илгээх үндсэн функц
function supabase_request($endpoint, $method = 'GET', $data = null) {
    $url = SUPABASE_URL . $endpoint;
    $ch = curl_init($url);
    
    // Хэрэглэгч нэвтэрсэн бол түүний Token-ийг ашиглана, үгүй бол Anon Key
    $auth_token = isset($_SESSION['access_token']) ? $_SESSION['access_token'] : SUPABASE_KEY;

    $headers = [
        "apikey: " . SUPABASE_KEY,
        "Authorization: Bearer " . $auth_token,
        "Content-Type: application/json",
        "Prefer: return=representation" // Бичсэн өгөгдлийг буцааж авах
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpcode, 'data' => json_decode($response, true)];
}

function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit;
    }
}
?>

