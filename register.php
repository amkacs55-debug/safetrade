<?php
require 'config.php';
$message = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $username = $_POST['username'];

    // 1. Supabase Auth руу бүртгэх
    $auth_response = supabase_request('/auth/v1/signup', 'POST', [
        'email' => $email,
        'password' => $password
    ]);

    if ($auth_response['code'] == 200 && isset($auth_response['data']['user']['id'])) {
        $user_id = $auth_response['data']['user']['id'];

        // 2. Profiles хүснэгтэд хэрэглэгчийн нэрийг нэмэх
        supabase_request('/rest/v1/profiles', 'POST', [
            'id' => $user_id,
            'username' => $username,
            'balance' => 0
        ]);

        $message = "Амжилттай бүртгүүллээ! Одоо нэвтэрнэ үү.";
    } else {
        $message = "Алдаа: " . ($auth_response['data']['msg'] ?? 'Бүртгэл амжилтгүй.');
    }
}
?>
<!DOCTYPE html>
<html>
<head><title>Бүртгүүлэх</title></head>
<body>
    <h2>SafeTrade Бүртгэл</h2>
    <?php if($message) echo "<p style='color:green;'>$message</p>"; ?>
    <form method="POST">
        <input type="text" name="username" placeholder="Хэрэглэгчийн нэр" required><br><br>
        <input type="email" name="email" placeholder="И-мэйл хаяг" required><br><br>
        <input type="password" name="password" placeholder="Нууц үг (Хамгийн багадаа 6 тэмдэгт)" required><br><br>
        <button type="submit">Бүртгүүлэх</button>
        <a href="login.php">Нэвтрэх</a>
    </form>
</body>
</html>

