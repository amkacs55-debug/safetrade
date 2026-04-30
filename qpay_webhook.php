<?php
// ============================================
// qpay_webhook.php — 100% АВТОМАТ ЗҮРХ
// QPay төлбөр орсон тэр агшинд ажиллана
// ============================================
require_once __DIR__.'/functions.php';

// Webhook нууц шалгах
$secret = $_GET['secret'] ?? '';
if (!hash_equals(WEBHOOK_SECRET, $secret)) {
    http_response_code(403);
    exit('Forbidden');
}

$order_id = (int)($_GET['order'] ?? 0);
if (!$order_id) {
    http_response_code(400);
    exit('Bad Request');
}

$pdo = db();

// Захиалга авах (зөвхөн pending)
$stmt = $pdo->prepare("SELECT * FROM orders WHERE id=? AND status='pending'");
$stmt->execute([$order_id]);
$order = $stmt->fetch();

if (!$order) {
    http_response_code(200); // Давхар webhook дуудалт
    exit('Already processed');
}

// QPay-с төлбөр баталгаажуулах
$check = qpay_check_invoice($order['qpay_invoice_id']);
$rows  = $check['rows'] ?? [];
$paid  = false;
foreach ($rows as $row) {
    if (($row['payment_status'] ?? '') === 'PAID') {
        $paid = true;
        break;
    }
}

if (!$paid) {
    http_response_code(200);
    exit('Payment not confirmed');
}

// ============================
// ТРАНЗАКЦ: Бүгдийг нэгэн зэрэг
// ============================
$pdo->beginTransaction();
try {
    // 1. Захиалгыг 'paid' болгох
    $pdo->prepare("UPDATE orders SET status='paid', paid_at=NOW() WHERE id=?")
        ->execute([$order_id]);

    // 2. Аккаунтыг 'sold' болгох
    $pdo->prepare("UPDATE accounts SET status='sold' WHERE id=?")
        ->execute([$order['account_id']]);

    // 3. Аккаунтын шифрлэгдсэн credentials авах
    $acc_stmt = $pdo->prepare("SELECT credentials_encrypted, seller_id FROM accounts WHERE id=?");
    $acc_stmt->execute([$order['account_id']]);
    $acc = $acc_stmt->fetch();

    // 4. Credentials тайлах
    $credentials_plain = decrypt_credentials($acc['credentials_encrypted']);

    // 5. Хүргэлт бичих (buyer унших боломжтой болно)
    $pdo->prepare("
        INSERT INTO deliveries (order_id, buyer_id, credentials_plain)
        VALUES (?, ?, ?)
    ")->execute([$order_id, $order['buyer_id'], $credentials_plain]);

    // 6. Захиалгыг 'delivered' болгох
    $pdo->prepare("UPDATE orders SET status='delivered', delivered_at=NOW() WHERE id=?")
        ->execute([$order_id]);

    // 7. Худалдагчийн үлдэгдэлд нэмэх
    $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id=?")
        ->execute([$order['seller_amount'], $acc['seller_id']]);

    // 8. Орлогын дэлгэрэнгүй бичих
    $pdo->prepare("
        INSERT INTO earnings (seller_id, order_id, gross_amount, fee_amount, net_amount)
        VALUES (?, ?, ?, ?, ?)
    ")->execute([
        $acc['seller_id'], $order_id,
        $order['amount'], $order['fee_amount'], $order['seller_amount'],
    ]);

    $pdo->commit();

    // Амжилттай
    http_response_code(200);
    echo 'OK';

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Webhook transaction failed for order $order_id: " . $e->getMessage());
    http_response_code(500);
    echo 'Transaction failed';
}
