<?php
// register.php — Бүртгэл
require_once __DIR__.'/functions.php';
require_once __DIR__.'/fraud_detection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'POST шаардлагатай'], 405);
}

check_fraud_rate_limit(get_ip(), 'register', 5, 3600);

$username = clean($_POST['username'] ?? '');
$email    = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';
$role     = in_array($_POST['role'] ?? '', ['buyer','seller']) ? $_POST['role'] : 'buyer';

if (!$username || !$email || strlen($password) < 8) {
    json_response(['error' => 'Бүх талбарыг зөв бөглөнө үү (нууц үг 8+ тэмдэгт)'], 422);
}

$pdo = db();
$check = $pdo->prepare('SELECT id FROM users WHERE username=? OR email=?');
$check->execute([$username, $email]);
if ($check->fetch()) {
    json_response(['error' => 'Нэвтрэх нэр эсвэл имэйл аль хэдийн бүртгэлтэй'], 409);
}

$hash = hash_password($password);
$stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)');
$stmt->execute([$username, $email, $hash, $role]);

json_response(['success' => true, 'message' => 'Бүртгэл амжилттай! Нэвтэрнэ үү.']);
