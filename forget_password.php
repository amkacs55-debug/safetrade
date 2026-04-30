<?php
// forget_password.php — Нууц үг сэргээх
require_once __DIR__.'/functions.php';

$action = $_POST['action'] ?? $_GET['action'] ?? 'request';

if ($action === 'request') {
    // 1. Token үүсгэж имэйл илгээх
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    if (!$email) json_response(['error' => 'Имэйл буруу'], 422);

    $stmt = db()->prepare('SELECT id FROM users WHERE email=?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $token   = generate_token(32);
        $expires = date('Y-m-d H:i:s', time() + 3600);
        db()->prepare('UPDATE users SET reset_token=?, reset_expires=? WHERE id=?')
            ->execute([$token, $expires, $user['id']]);

        $link = BASE_URL . '/index.php?page=reset&token=' . $token;
        // TODO: mail() эсвэл SendGrid ашиглан имэйл илгээх
        // mail($email, 'Нууц үг сэргээх', "Дараах холбоосоор орно уу:\n$link");
        error_log("Password reset link: $link"); // Dev-д log хийх
    }
    // Аюулгүйн үүднээс алдаа ч гэсэн амжилттай мэдэгдэл
    json_response(['success' => true, 'message' => 'Хэрэв имэйл бүртгэлтэй бол заавар илгээсэн.']);

} elseif ($action === 'reset') {
    $token    = clean($_POST['token'] ?? '');
    $password = $_POST['password'] ?? '';

    if (strlen($password) < 8) json_response(['error' => 'Нууц үг 8+ тэмдэгт байх ёстой'], 422);

    $stmt = db()->prepare('SELECT id FROM users WHERE reset_token=? AND reset_expires > NOW()');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) json_response(['error' => 'Token буруу эсвэл хугацаа дууссан'], 400);

    db()->prepare('UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL WHERE id=?')
        ->execute([hash_password($password), $user['id']]);

    json_response(['success' => true, 'message' => 'Нууц үг амжилттай солигдлоо!']);
}
