<?php
// seller.php — Худалдагчийн самбар
require_once __DIR__.'/functions.php';
require_once __DIR__.'/auth_check.php';

$user = require_seller();
$pdo  = db();

// Нийт орлого
$earnings_stmt = $pdo->prepare("
    SELECT
        COUNT(*) AS total_sales,
        SUM(gross_amount) AS total_gross,
        SUM(fee_amount) AS total_fee,
        SUM(net_amount) AS total_net
    FROM earnings WHERE seller_id=?
");
$earnings_stmt->execute([$user['id']]);
$summary = $earnings_stmt->fetch();

// Миний зарсан аккаунтууд
$accounts_stmt = $pdo->prepare("
    SELECT a.id, a.game, a.title, a.price, a.status, a.views, a.created_at
    FROM accounts a
    WHERE a.seller_id=?
    ORDER BY a.created_at DESC
    LIMIT 50
");
$accounts_stmt->execute([$user['id']]);
$accounts = $accounts_stmt->fetchAll();

// Сүүлийн 10 захиалга
$orders_stmt = $pdo->prepare("
    SELECT o.id, o.amount, o.fee_amount, o.seller_amount,
           o.status, o.created_at, a.title AS account_title,
           u.username AS buyer_name
    FROM orders o
    JOIN accounts a ON o.account_id = a.id
    JOIN users u ON o.buyer_id = u.id
    WHERE a.seller_id=?
    ORDER BY o.created_at DESC
    LIMIT 10
");
$orders_stmt->execute([$user['id']]);
$recent_orders = $orders_stmt->fetchAll();

// Хэтэвчний үлдэгдэл
$balance_stmt = $pdo->prepare('SELECT balance FROM users WHERE id=?');
$balance_stmt->execute([$user['id']]);
$balance = $balance_stmt->fetchColumn();

json_response([
    'summary'       => [
        'total_sales' => (int)($summary['total_sales'] ?? 0),
        'total_gross' => format_price((float)($summary['total_gross'] ?? 0)),
        'total_fee'   => format_price((float)($summary['total_fee'] ?? 0)),
        'total_net'   => format_price((float)($summary['total_net'] ?? 0)),
        'balance'     => format_price((float)$balance),
    ],
    'accounts'      => $accounts,
    'recent_orders' => $recent_orders,
]);
