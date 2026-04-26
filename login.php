<?php
// login.php — Нэвтрэх
require_once __DIR__.'/functions.php';
require_once __DIR__.'/fraud_detection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'POST шаардлагатай'], 405);
}

check_fraud_rate_limit(get_ip(), 'login', 10, 900);

$username = clean($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    json_response(['error' => 'Нэвтрэх нэр болон нууц үгээ оруулна уу'], 422);
}

$stmt = db()->prepare('SELECT * FROM users WHERE username=? OR email=?');
$stmt->execute([$username, $username]);
$user = $stmt->fetch();

if (!$user || !verify_password($password, $user['password_hash'])) {
    log_fraud_attempt(get_ip(), null, 'login');
    json_response(['error' => 'Нэвтрэх нэр эсвэл нууц үг буруу'], 401);
}

// Session үүсгэх
session_regenerate_id(true);
$_SESSION['user_id']   = $user['id'];
$_SESSION['username']  = $user['username'];
$_SESSION['role']      = $user['role'];

// Сүүлийн нэвтрэлт шинэчлэх
db()->prepare('UPDATE users SET last_login=NOW() WHERE id=?')->execute([$user['id']]);

json_response([
    'success'  => true,
    'username' => $user['username'],
    'role'     => $user['role'],
    'redirect' => BASE_URL . '/index.php?page=market',
]);
