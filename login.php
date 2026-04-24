<?php
require 'config.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $auth = supabase_request('/auth/v1/token?grant_type=password', 'POST', [
        'email' => $email,
        'password' => $password
    ]);

    if ($auth['code'] == 200 && isset($auth['data']['access_token'])) {
        $_SESSION['access_token'] = $auth['data']['access_token'];
        $_SESSION['user_id'] = $auth['data']['user']['id'];
        
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "И-мэйл эсвэл нууц үг буруу байна.";
    }
}
?>
<!DOCTYPE html>
<html>
<head><title>Нэвтрэх</title></head>
<body>
    <h2>Нэвтрэх</h2>
    <?php if($error) echo "<p style='color:red;'>$error</p>"; ?>
    <form method="POST">
        <input type="email" name="email" placeholder="И-мэйл" required><br><br>
        <input type="password" name="password" placeholder="Нууц үг" required><br><br>
        <button type="submit">Нэвтрэх</button>
    </form>
</body>
</html>

