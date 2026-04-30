<?php
// ============================================
// cron_worker.php — Автомат цэвэрлэгч
// Crontab: * * * * * php /path/to/backend/cron_worker.php
// ============================================
require_once __DIR__.'/config.php';

// CLI-с дуудагдаагүй бол хаах
if (PHP_SAPI !== 'cli' && ($_SERVER['REMOTE_ADDR'] ?? '') !== '127.0.0.1') {
    http_response_code(403);
    exit;
}

$pdo = db();

// ---- 1. Хугацаа дууссан pending захиалгуудыг цуцлах ----
$expired = $pdo->prepare("
    SELECT o.id, o.account_id
    FROM orders o
    WHERE o.status='pending' AND o.expires_at < NOW()
");
$expired->execute();
$rows = $expired->fetchAll();

$cancelled = 0;
foreach ($rows as $row) {
    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE orders SET status='cancelled' WHERE id=?")
            ->execute([$row['id']]);
        // Аккаунтыг дахин боломжтой болгох
        $pdo->prepare("UPDATE accounts SET status='available' WHERE id=? AND status='reserved'")
            ->execute([$row['account_id']]);
        $pdo->commit();
        $cancelled++;
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Cron cancel error: " . $e->getMessage());
    }
}

// ---- 2. Хуучин fraud log-ийг цэвэрлэх (7 хоногоос хуучин) ----
$pdo->exec("DELETE FROM fraud_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");

// ---- 3. Log ----
$ts = date('Y-m-d H:i:s');
echo "[$ts] Cron: $cancelled захиалга цуцлагдлаа\n";
error_log("[$ts] Cron cleanup: $cancelled expired orders cancelled");
