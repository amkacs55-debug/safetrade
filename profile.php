<?php
require 'config.php';
requireLogin();

$uid = $_SESSION['user_id'];

// Миний худалдан авсан зүйлс
$orders_resp = supabase_request("/rest/v1/orders?buyer_id=eq.$uid&select=*,accounts(title,game)");
$orders = $orders_resp['data'] ?? [];

// Миний зарж буй зүйлс
$sales_resp = supabase_request("/rest/v1/accounts?seller_id=eq.$uid&select=*");
$sales = $sales_resp['data'] ?? [];
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
    <title>Миний арилжаа - SafeTrade</title>
</head>
<body>
    <div class="container">
        <h1>📜 Миний арилжааны түүх</h1>
        
        <h3>🛒 Худалдан авалтууд</h3>
        <?php foreach ($orders as $o): ?>
            <div class="history-item">
                <span>[<?= $o['accounts']['game'] ?>] <?= $o['accounts']['title'] ?></span>
                <span class="status-badge"><?= $o['status'] ?></span>
                <a href="order_success.php?id=<?= $o['account_id'] ?>">Мэдээлэл харах</a>
            </div>
        <?php endforeach; ?>

        <hr>

        <h3>💰 Миний зарууд</h3>
        <?php foreach ($sales as $s): ?>
            <div class="history-item">
                <span><?= $s['title'] ?> - <?= number_format($s['price']) ?> ₮</span>
                <span class="status-badge"><?= $s['status'] ?></span>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>

