<?php
// ============================================
// auth_check.php — Хэрэглэгч нэвтэрсэн эсэхийг шалгах
// ============================================
require_once __DIR__.'/config.php';

function require_login(): array {
    if (empty($_SESSION['user_id'])) {
        if (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json')) {
            json_response(['error' => 'Нэвтрэх шаардлагатай'], 401);
        }
        header('Location: ' . BASE_URL . '/index.php?page=login');
        exit;
    }
    // DB-с хэрэглэгч шинэчлэх
    $stmt = db()->prepare('SELECT id, username, email, balance, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user) {
        session_destroy();
        header('Location: ' . BASE_URL . '/index.php?page=login');
        exit;
    }
    return $user;
}

function require_seller(): array {
    $user = require_login();
    if (!in_array($user['role'], ['seller', 'admin'])) {
        json_response(['error' => 'Зөвхөн худалдагч хандах боломжтой'], 403);
    }
    return $user;
}

function require_admin(): array {
    $user = require_login();
    if ($user['role'] !== 'admin') {
        json_response(['error' => 'Зөвхөн админ хандах боломжтой'], 403);
    }
    return $user;
}
