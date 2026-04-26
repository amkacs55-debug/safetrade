<?php
// fraud_detection.php — Хуурамч үйлдлийг хязгаарлах
require_once __DIR__.'/config.php';

/**
 * Rate limit шалгах
 * @param string $ip      IP хаяг
 * @param string $action  Үйлдлийн нэр (login, register, start_order...)
 * @param int    $limit   Хамгийн их оролдлого
 * @param int    $window  Хугацааны цонх (секунд)
 */
function check_fraud_rate_limit(string $ip, string $action, int $limit, int $window): void {
    $pdo = db();

    // Хаагдсан эсэх шалгах
    $blocked = $pdo->prepare("
        SELECT blocked_until FROM fraud_log
        WHERE ip_address=? AND action=? AND blocked_until > NOW()
        ORDER BY blocked_until DESC LIMIT 1
    ");
    $blocked->execute([$ip, $action]);
    $row = $blocked->fetch();
    if ($row) {
        json_response([
            'error'         => 'Та хэт олон удаа оролдлоо. Дахин оролдох хугацаа: ' . $row['blocked_until'],
            'blocked_until' => $row['blocked_until'],
        ], 429);
    }

    // Сүүлийн цонх дахь оролдлого тоолох
    $count_stmt = $pdo->prepare("
        SELECT COUNT(*) FROM fraud_log
        WHERE ip_address=? AND action=? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");
    $count_stmt->execute([$ip, $action, $window]);
    $count = (int)$count_stmt->fetchColumn();

    if ($count >= $limit) {
        // Хаах
        $block_until = date('Y-m-d H:i:s', time() + $window);
        $pdo->prepare("
            INSERT INTO fraud_log (ip_address, action, attempt_count, blocked_until)
            VALUES (?, ?, ?, ?)
        ")->execute([$ip, $action, $count + 1, $block_until]);
        json_response([
            'error'         => 'Хэт олон оролдлого. ' . round($window/60) . ' минутын дараа дахин оролдоно уу.',
            'blocked_until' => $block_until,
        ], 429);
    }
}

/**
 * Алдаа болгоныг log хийх
 */
function log_fraud_attempt(string $ip, ?int $user_id, string $action): void {
    $pdo = db();
    $existing = $pdo->prepare("
        SELECT id, attempt_count FROM fraud_log
        WHERE ip_address=? AND action=? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY created_at DESC LIMIT 1
    ");
    $existing->execute([$ip, $action]);
    $row = $existing->fetch();

    if ($row) {
        $pdo->prepare("UPDATE fraud_log SET attempt_count=attempt_count+1 WHERE id=?")
            ->execute([$row['id']]);
    } else {
        $pdo->prepare("INSERT INTO fraud_log (ip_address, user_id, action) VALUES (?,?,?)")
            ->execute([$ip, $user_id, $action]);
    }
}
