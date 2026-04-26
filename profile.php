<?php
// profile.php — Хэрэглэгчийн профайл + хүргэгдсэн аккаунтууд
require_once __DIR__.'/functions.php';
require_once __DIR__.'/auth_check.php';

$user = require_login();
$pdo  = db();

// Хэтэвч
$bal = $pdo->prepare('SELECT balance FROM users WHERE id=?');
$bal->execute([$user['id']]);
$balance = $bal->fetchColumn();

// Худалдаж авсан (хүргэгдсэн) аккаунтууд
$stmt = $pdo->prepare("
    SELECT o.id AS order_id, o.amount, o.delivered_at,
           a.game, a.title, a.level, a.rank,
           d.viewed_at
    FROM orders o
    JOIN accounts a ON o.account_id = a.id
    LEFT JOIN deliveries d ON d.order_id = o.id
    WHERE o.buyer_id=? AND o.status='delivered'
    ORDER BY o.delivered_at DESC
");
$stmt->execute([$user['id']]);
$purchases = $stmt->fetchAll();

// Хүлээгдэж буй захиалга
$pending_stmt = $pdo->prepare("
    SELECT o.id AS order_id, o.amount, o.expires_at,
           o.qpay_qr_image, o.qpay_qr_text,
           a.game, a.title
    FROM orders o
    JOIN accounts a ON o.account_id = a.id
    WHERE o.buyer_id=? AND o.status='pending' AND o.expires_at > NOW()
    ORDER BY o.created_at DESC
");
$pending_stmt->execute([$user['id']]);
$pending = $pending_stmt->fetchAll();

json_response([
    'user'      => [
        'username' => $user['username'],
        'balance'  => format_price((float)$balance),
        'role'     => $user['role'],
    ],
    'purchases' => $purchases,
    'pending'   => $pending,
]);
