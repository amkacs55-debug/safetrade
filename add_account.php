<?php
// add_account.php — Худалдагч аккаунт нэмэх
require_once __DIR__.'/functions.php';
require_once __DIR__.'/auth_check.php';

$user = require_seller();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'POST шаардлагатай'], 405);
}

$game        = in_array($_POST['game'] ?? '', ['mobile_legends','pubg','standoff2']) ? $_POST['game'] : '';
$title       = clean($_POST['title'] ?? '');
$description = clean($_POST['description'] ?? '');
$price       = (float)($_POST['price'] ?? 0);
$level       = (int)($_POST['level'] ?? 0);
$rank        = clean($_POST['rank'] ?? '');
$server      = clean($_POST['server'] ?? '');
$login       = trim($_POST['login'] ?? '');
$password    = trim($_POST['password'] ?? '');
$extra       = trim($_POST['extra'] ?? '');  // нэмэлт мэдээлэл (email, phone гэх мэт)

if (!$game || !$title || $price <= 0 || !$login || !$password) {
    json_response(['error' => 'Бүх заавал талбарыг бөглөнө үү'], 422);
}
if ($price < 1000) {
    json_response(['error' => 'Доод үнэ 1,000₮ байх ёстой'], 422);
}

// Screenshot upload
$screenshots = [];
if (!empty($_FILES['screenshots']['name'][0])) {
    $upload_dir = __DIR__ . '/../assets/uploads/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    foreach ($_FILES['screenshots']['tmp_name'] as $i => $tmp) {
        $ext = strtolower(pathinfo($_FILES['screenshots']['name'][$i], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg','jpeg','png','webp'])) continue;
        if ($_FILES['screenshots']['size'][$i] > 5 * 1024 * 1024) continue; // 5MB хязгаар

        $filename = uniqid('ss_') . '.' . $ext;
        if (move_uploaded_file($tmp, $upload_dir . $filename)) {
            $screenshots[] = '/assets/uploads/' . $filename;
        }
        if (count($screenshots) >= 5) break; // Дээд тал нь 5 зураг
    }
}

// Credentials шифрлэх: login|password|extra
$plain_creds   = $login . '|' . $password . ($extra ? '|' . $extra : '');
$encrypted     = encrypt_credentials($plain_creds);

$pdo = db();
$stmt = $pdo->prepare("
    INSERT INTO accounts
    (seller_id, game, title, description, price, level, rank, server, screenshots, credentials_encrypted)
    VALUES (?,?,?,?,?,?,?,?,?,?)
");
$stmt->execute([
    $user['id'], $game, $title, $description, $price,
    $level, $rank, $server,
    json_encode($screenshots),
    $encrypted,
]);

$account_id = $pdo->lastInsertId();
json_response([
    'success'    => true,
    'account_id' => (int)$account_id,
    'message'    => 'Аккаунт амжилттай нэмэгдлээ!',
]);
