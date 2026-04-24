<?php
require 'config.php';
requireLogin();

$message = '';
$account = null;

if (isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM accounts WHERE id = ? AND status = 'active'");
    $stmt->execute([$_GET['id']]);
    $account = $stmt->fetch();
}

if (!$account) {
    die("Аккаунт олдсонгүй эсвэл зарагдсан байна.");
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die("Аюулгүй байдлын алдаа.");
    }

    $buyer_id = $_SESSION['user_id'];
    $price = $account['price'];
    
    // Гүйлгээ эхлүүлэх (Аль нэг нь алдаа гарвал буцна)
    $pdo->beginTransaction();
    try {
        // Худалдан авагчийн мөнгийг шалгах (Түгжиж унших - Double spend-ээс хамгаална)
        $stmt = $pdo->prepare("SELECT balance FROM users WHERE id = ? FOR UPDATE");
        $stmt->execute([$buyer_id]);
        $buyer_balance = $stmt->fetchColumn();

        if ($buyer_balance >= $price) {
            // 1. Худалдан авагчаас мөнгө хасах
            $stmt = $pdo->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
            $stmt->execute([$price, $buyer_id]);

            // 2. Аккаунтыг 'escrow' (Түгжигдсэн) төлөвт оруулах
            $stmt = $pdo->prepare("UPDATE accounts SET status = 'escrow' WHERE id = ?");
            $stmt->execute([$account['id']]);

            // 3. Ордер үүсгэх (Мөнгө системд хадгалагдаж байна)
            $stmt = $pdo->prepare("INSERT INTO orders (buyer_id, seller_id, account_id, amount, status) VALUES (?, ?, ?, ?, 'pending')");
            $stmt->execute([$buyer_id, $account['seller_id'], $account['id'], $price]);

            $pdo->commit();
            
            // Худалдан авалт амжилттай болсон тул шууд vault_data-г харуулах хуудас руу шилжих
            header("Location: order_success.php?id=" . $account['id']);
            exit;
        } else {
            $pdo->rollBack();
            $message = "Таны үлдэгдэл хүрэлцэхгүй байна.";
        }
    } catch (Exception $e) {
        $pdo->rollBack();
        $message = "Гүйлгээний алдаа: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="mn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Аюулгүй худалдан авалт</title>
    <style>
        body { font-family: Arial, sans-serif; background: #121212; color: #fff; padding: 20px; }
        .box { max-width: 400px; margin: auto; background: #1e1e1e; padding: 20px; border-radius: 8px; border-top: 4px solid #f39c12; }
        .btn { width: 100%; padding: 15px; background: #28a745; color: white; border: none; cursor: pointer; font-size: 16px; margin-top: 15px; border-radius: 4px; }
        .error { color: #ff4d4d; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="box">
        <h2>Худалдан авалт баталгаажуулах</h2>
        <?php if($message) echo "<div class='error'>$message</div>"; ?>
        
        <p><b>Тоглоом:</b> <?= htmlspecialchars($account['game']) ?></p>
        <p><b>Гарчиг:</b> <?= htmlspecialchars($account['title']) ?></p>
        <p><b>Үнэ:</b> <?= number_format($account['price']) ?> ₮</p>
        <hr>
        <p style="font-size: 12px; color: #aaa;">*Таны мөнгө шууд худалдагчид очихгүй бөгөөд системийн дундын дансанд хадгалагдана. Та аккаунтаа шалгаж баталгаажуулсны дараа мөнгө шилжинэ.</p>

        <form method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <button class="btn" type="submit">Аюулгүй төлбөр хийх</button>
        </form>
    </div>
</body>
</html>

