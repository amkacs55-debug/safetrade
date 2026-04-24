<?php
require 'config.php';
requireLogin();

$message = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $game = $_POST['game'];
    $title = $_POST['title'];
    $price = $_POST['price'];
    $vault_data = $_POST['vault_data'];
    $seller_id = $_SESSION['user_id'];

    $insert = supabase_request('/rest/v1/accounts', 'POST', [
        'seller_id' => $seller_id,
        'game' => $game,
        'title' => $title,
        'price' => $price,
        'vault_data' => $vault_data,
        'status' => 'active'
    ]);

    if ($insert['code'] == 201) {
        $message = "Зар амжилттай нэмэгдлээ!";
    } else {
        $message = "Алдаа гарлаа: " . json_encode($insert['data']);
    }
}
?>
<!DOCTYPE html>
<html>
<head><title>Зар нэмэх</title></head>
<body>
    <h2>Шинэ аккаунт зарах (Автомат хүргэлт)</h2>
    <?php if($message) echo "<p style='color:blue;'>$message</p>"; ?>
    <form method="POST">
        <select name="game" required>
            <option value="Standoff 2">Standoff 2</option>
            <option value="PUBG Mobile">PUBG Mobile</option>
            <option value="Mobile Legends">Mobile Legends</option>
        </select><br><br>
        <input type="text" name="title" placeholder="Гарчиг" required><br><br>
        <input type="number" name="price" placeholder="Зарах үнэ (₮)" required><br><br>
        <textarea name="vault_data" rows="4" placeholder="Login ID: ...&#10;Password: ..." required></textarea><br><br>
        <button type="submit">Нийтлэх</button>
    </form>
    <a href="index.php">Буцах</a>
</body>
</html>

