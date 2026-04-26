<?php
// start_order.php — Захиалга эхлүүлэх + QPay QR үүсгэх
require_once __DIR__.'/functions.php';
require_once __DIR__.'/auth_check.php';
require_once __DIR__.'/fraud_detection.php';

$user = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'POST шаардлагатай'], 405);
}

check_fraud_rate_limit(get_ip(), 'start_order', 10, 600);

$account_id = (int)($_POST['account_id'] ?? 0);
if (!$account_id) json_response(['error' => 'Аккаунт ID буруу'], 422);

$pdo = db();

// Аккаунт шалгах
$acc = $pdo->prepare("SELECT * FROM accounts WHERE id=? AND status='available'");
$acc->execute([$account_id]);
$account = $acc->fetch();
if (!$account) json_response(['error' => 'Аккаунт олдсонгүй эсвэл аль хэдийн зарагдсан'], 404);

// Хэрэглэгч өөрийн аккаунтыг худалдаж авах гэж байгаа эсэх
if ($account['seller_id'] === $user['id']) {
    json_response(['error' => 'Өөрийн аккаунтыг худалдаж авах боломжгүй'], 400);
}

// Урьдчилсан захиалга байгаа эсэх шалгах
$existing = $pdo->prepare("
    SELECT id FROM orders
    WHERE buyer_id=? AND account_id=? AND status='pending' AND expires_at > NOW()
");
$existing->execute([$user['id'], $account_id]);
if ($existing->fetch()) {
    json_response(['error' => 'Та энэ аккаунтад аль хэдийн захиалга өгсөн байна. Хүлээнэ үү.'], 409);
}

// Үнэ тооцох
$fee_info = calculate_fee($account['price']);
$expires  = date('Y-m-d H:i:s', time() + ORDER_EXPIRE_MINUTES * 60);

// Захиалга бүртгэх
$pdo->prepare("
    INSERT INTO orders (buyer_id, account_id, amount, fee_amount, seller_amount, status, expires_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
")->execute([
    $user['id'], $account_id,
    $fee_info['gross'], $fee_info['fee'], $fee_info['seller'],
    $expires,
]);
$order_id = (int)$pdo->lastInsertId();

// Аккаунтыг "reserved" болгох
$pdo->prepare("UPDATE accounts SET status='reserved' WHERE id=?")->execute([$account_id]);

// QPay нэхэмжлэл үүсгэх
$game_names = [
    'mobile_legends' => 'Mobile Legends',
    'pubg'           => 'PUBG Mobile',
    'standoff2'      => 'Standoff 2',
];
$desc = ($game_names[$account['game']] ?? $account['game']) . ' - ' . $account['title'];

$qpay = qpay_create_invoice($order_id, $fee_info['gross'], $desc);

if (empty($qpay['invoice_id'])) {
    // QPay алдаатай бол захиалгыг буцаах
    $pdo->prepare("UPDATE orders SET status='cancelled' WHERE id=?")->execute([$order_id]);
    $pdo->prepare("UPDATE accounts SET status='available' WHERE id=?")->execute([$account_id]);
    json_response(['error' => 'QPay холболт амжилтгүй. Дахин оролдоно уу.'], 500);
}

// QPay мэдээллийг хадгалах
$pdo->prepare("
    UPDATE orders SET qpay_invoice_id=?, qpay_qr_text=?, qpay_qr_image=? WHERE id=?
")->execute([
    $qpay['invoice_id'],
    $qpay['qr_text'] ?? '',
    $qpay['qr_image'] ?? '',
    $order_id,
]);

json_response([
    'success'    => true,
    'order_id'   => $order_id,
    'amount'     => format_price($fee_info['gross']),
    'expires_at' => $expires,
    'qr_image'   => $qpay['qr_image'] ?? '',
    'qr_text'    => $qpay['qr_text'] ?? '',
    'invoice_id' => $qpay['invoice_id'],
    'banks'      => $qpay['urls'] ?? [],
]);
