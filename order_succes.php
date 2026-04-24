<?php
require 'config.php';
requireLogin();

$acc_id = $_GET['id'];
$uid = $_SESSION['user_id'];

// Зөвхөн энэ аккаунтыг худалдаж авсан хүнд л харуулна
$resp = supabase_request("/rest/v1/orders?account_id=eq.$acc_id&buyer_id=eq.$uid&select=*,accounts(*)");
$order = $resp['data'][0] ?? null;

if (!$order) {
    die("Төлбөр баталгаажаагүй эсвэл хандах эрхгүй байна.");
}
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
    <title>Амжилттай - SafeTrade</title>
</head>
<body>
    <div class="container" style="text-align: center;">
        <h1 style="color: #28a745;">🎉 Худалдан авалт амжилттай!</h1>
        <p>Таны худалдаж авсан аккаунтын мэдээлэл доор харагдаж байна:</p>
        
        <div class="vault-box" style="background: #333; padding: 20px; border-radius: 10px; border: 2px dashed #28a745; margin: 20px 0;">
            <h2 style="margin-top: 0;">Нэвтрэх мэдээлэл:</h2>
            <pre style="font-size: 18px; color: #fff;"><?= htmlspecialchars($order['accounts']['vault_data']) ?></pre>
        </div>
        
        <p style="color: #aaa;">*Энэ мэдээллийг хадгалж аваарай. Маргаан гарвал 24 цагийн дотор мэдэгдэнэ үү.</p>
        <a href="dashboard.php" class="btn">Dashboard руу очих</a>
    </div>
</body>
</html>

