<?php
require 'config.php';
requireLogin();

$uid = $_SESSION['user_id'];

// Хэрэглэгчийн мэдээлэл татах
$user_resp = supabase_request("/rest/v1/profiles?id=eq.$uid&select=*");
$user = $user_resp['data'][0] ?? null;

// Миний зарж буй аккаунтууд
$acc_resp = supabase_request("/rest/v1/accounts?seller_id=eq.$uid&select=count", 'GET');
$total_listings = $acc_resp['data'][0]['count'] ?? 0;
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
    <title>Dashboard - SafeTrade</title>
</head>
<body>
    <div class="sidebar">
        <h2>SafeTrade</h2>
        <p>Хэрэглэгч: <b><?= htmlspecialchars($user['username']) ?></b></p>
        <p>Баланс: <span class="price"><?= number_format($user['balance']) ?> ₮</span></p>
        <hr>
        <a href="index.php">Зах зээл</a>
        <a href="auto_sell.php">Зар нэмэх</a>
        <a href="profile.php">Миний арилжаа</a>
        <a href="logout.php" style="color: #ff4d4d;">Гарах</a>
    </div>

    <div class="content">
        <h1>Тавтай морил!</h1>
        <div class="stats">
            <div class="card">
                <h3><?= $total_listings ?></h3>
                <p>Нийт зар</p>
            </div>
            <div class="card">
                <h3><?= number_format($user['balance']) ?> ₮</h3>
                <p>Авах боломжтой</p>
            </div>
        </div>
    </div>
</body>
</html>

