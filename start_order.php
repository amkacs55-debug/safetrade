<?php
// start_order.php — Захиалга + QPay QR (DEMO горимтой)
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

$acc = $pdo->prepare("SELECT * FROM accounts WHERE id=? AND status='available'");
$acc->execute([$account_id]);
$account = $acc->fetch();
if (!$account) json_response(['error' => 'Аккаунт олдсонгүй эсвэл аль хэдийн зарагдсан'], 404);

if ((int)$account['seller_id'] === (int)$user['id']) {
    json_response(['error' => 'Өөрийн аккаунтыг худалдаж авах боломжгүй'], 400);
}

$existing = $pdo->prepare("
    SELECT id FROM orders
    WHERE buyer_id=? AND account_id=? AND status='pending' AND expires_at > NOW()
");
$existing->execute([$user['id'], $account_id]);
if ($existing->fetch()) {
    json_response(['error' => 'Та энэ аккаунтад аль хэдийн захиалга өгсөн байна.'], 409);
}

$fee_info = calculate_fee((float)$account['price']);
$expires  = date('Y-m-d H:i:s', time() + ORDER_EXPIRE_MINUTES * 60);

$pdo->prepare("
    INSERT INTO orders (buyer_id, account_id, amount, fee_amount, seller_amount, status, expires_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
")->execute([
    $user['id'], $account_id,
    $fee_info['gross'], $fee_info['fee'], $fee_info['seller'],
    $expires,
]);
$order_id = (int)$pdo->lastInsertId();

$pdo->prepare("UPDATE accounts SET status='reserved' WHERE id=?")->execute([$account_id]);

// ── DEMO горим: QPay-гүй шууд хүргэнэ ────────────────────────────────────
if (DEMO_MODE) {
    $demo_invoice = 'DEMO-' . $order_id . '-' . time();

    $pdo->prepare("UPDATE orders SET qpay_invoice_id=? WHERE id=?")
        ->execute([$demo_invoice, $order_id]);

    // Шууд webhook дуудах
    $acc2 = $pdo->prepare("SELECT credentials_encrypted, seller_id FROM accounts WHERE id=?");
    $acc2->execute([$account_id]);
    $accData = $acc2->fetch();

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE orders SET status='paid', paid_at=NOW() WHERE id=?")->execute([$order_id]);
        $pdo->prepare("UPDATE accounts SET status='sold' WHERE id=?")->execute([$account_id]);

        $credentials_plain = decrypt_credentials($accData['credentials_encrypted']);

        $pdo->prepare("INSERT INTO deliveries (order_id, buyer_id, credentials_plain) VALUES (?,?,?)")
            ->execute([$order_id, $user['id'], $credentials_plain]);

        $pdo->prepare("UPDATE orders SET status='delivered', delivered_at=NOW() WHERE id=?")->execute([$order_id]);
        $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id=?")->execute([$fee_info['seller'], $accData['seller_id']]);
        $pdo->prepare("INSERT INTO earnings (seller_id, order_id, gross_amount, fee_amount, net_amount) VALUES (?,?,?,?,?)")
            ->execute([$accData['seller_id'], $order_id, $fee_info['gross'], $fee_info['fee'], $fee_info['seller']]);

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Demo order failed: " . $e->getMessage());
    }

    json_response([
        'success'    => true,
        'demo'       => true,
        'order_id'   => $order_id,
        'amount'     => format_price($fee_info['gross']),
        'expires_at' => $expires,
        'qr_image'   => '',
        'invoice_id' => $demo_invoice,
        'banks'      => [],
    ]);
}

// ── LIVE горим: QPay QR ───────────────────────────────────────────────────
$game_names = ['mobile_legends'=>'Mobile Legends','pubg'=>'PUBG Mobile','standoff2'=>'Standoff 2'];
$desc = ($game_names[$account['game']] ?? $account['game']) . ' - ' . $account['title'];

$qpay = qpay_create_invoice($order_id, $fee_info['gross'], $desc);

if (empty($qpay['invoice_id'])) {
    $pdo->prepare("UPDATE orders SET status='cancelled' WHERE id=?")->execute([$order_id]);
    $pdo->prepare("UPDATE accounts SET status='available' WHERE id=?")->execute([$account_id]);
    json_response(['error' => 'QPay холболт амжилтгүй. Дахин оролдоно уу.'], 500);
}

$pdo->prepare("UPDATE orders SET qpay_invoice_id=?, qpay_qr_text=?, qpay_qr_image=? WHERE id=?")
    ->execute([$qpay['invoice_id'], $qpay['qr_text'] ?? '', $qpay['qr_image'] ?? '', $order_id]);

json_response([
    'success'    => true,
    'demo'       => false,
    'order_id'   => $order_id,
    'amount'     => format_price($fee_info['gross']),
    'expires_at' => $expires,
    'qr_image'   => $qpay['qr_image'] ?? '',
    'qr_text'    => $qpay['qr_text'] ?? '',
    'invoice_id' => $qpay['invoice_id'],
    'banks'      => $qpay['urls'] ?? [],
]);
