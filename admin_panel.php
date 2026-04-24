<?php
require 'config.php';
requireLogin();

$uid = $_SESSION['user_id'];
$resp = supabase_request("/rest/v1/profiles?id=eq.$uid&select=role");

if ($resp['code'] == 200 && $resp['data'][0]['role'] === 'admin') {
    echo "Тавтай морил, Админ аа! Та сайтыг удирдах эрхтэй.";
    // Энд админ цэснүүдийг харуулж болно
} else {
    echo "Уучлаарай, энэ хуудсанд зөвхөн админ нэвтрэх боломжтой.";
    exit;
}
?>

