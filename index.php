<?php
require 'config.php';

// Active төлөвтэй бүх зарыг татаж авах
$response = supabase_request("/rest/v1/accounts?status=eq.active&select=*,profiles(username)");
$accounts = $response['code'] == 200 ? $response['data'] : [];
?>
<!DOCTYPE html>
<html>
<head>
    <title>SafeTrade Зах зээл</title>
    <style>
        .card { border: 1px solid #ccc; padding: 15px; margin: 10px; width: 250px; display: inline-block; }
    </style>
</head>
<body>
    <h1>🎮 Тоглоомын аккаунт арилжаа</h1>
    <a href="dashboard.php">Хянах самбар руу орох</a> | <a href="auto_sell.php">Зар нэмэх</a>
    <hr>
    
    <?php foreach ($accounts as $acc): ?>
        <div class="card">
            <h3><?= htmlspecialchars($acc['game']) ?></h3>
            <p><b><?= htmlspecialchars($acc['title']) ?></b></p>
            <p>Үнэ: <?= number_format($acc['price']) ?>₮</p>
            <p>Худалдагч: <?= htmlspecialchars($acc['profiles']['username']) ?></p>
            <form action="escrow_buy.php" method="GET">
                <input type="hidden" name="id" value="<?= $acc['id'] ?>">
                <button type="submit" style="background:green;color:white;padding:10px;border:none;cursor:pointer;">Худалдаж авах</button>
            </form>
        </div>
    <?php endforeach; ?>
</body>
</html>

