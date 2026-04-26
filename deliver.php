<?php
// deliver.php — Аккаунтын мэдээллийг buyer-д харуулах
require_once __DIR__.'/functions.php';
require_once __DIR__.'/auth_check.php';

$user     = require_login();
$order_id = (int)($_GET['order_id'] ?? 0);

if (!$order_id) json_response(['error' => 'Захиалга ID буруу'], 422);

$pdo = db();

// Зөвхөн тухайн buyer уншиж болно
$stmt = $pdo->prepare("
    SELECT d.*, o.account_id, a.game, a.title
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    JOIN accounts a ON o.account_id = a.id
    WHERE d.order_id=? AND d.buyer_id=?
");
$stmt->execute([$order_id, $user['id']]);
$delivery = $stmt->fetch();

if (!$delivery) {
    json_response(['error' => 'Хүргэлт олдсонгүй эсвэл эрх байхгүй'], 404);
}

// Хэзээ нээгдсэн тэмдэглэх
if (!$delivery['viewed_at']) {
    $pdo->prepare("UPDATE deliveries SET viewed_at=NOW() WHERE order_id=?")
        ->execute([$order_id]);
}

// Credentials-ийг мөрөөр хуваах (login | password | extra)
$parts = explode('|', $delivery['credentials_plain']);

json_response([
    'success'    => true,
    'game'       => $delivery['game'],
    'title'      => $delivery['title'],
    'login'      => $parts[0] ?? '',
    'password'   => $parts[1] ?? '',
    'extra'      => $parts[2] ?? '',
    'viewed_at'  => $delivery['viewed_at'] ?? date('Y-m-d H:i:s'),
]);
