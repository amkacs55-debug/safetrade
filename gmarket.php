<?php
// gmarket.php — Зах зээлийн жагсаалт
require_once __DIR__.'/functions.php';

// ── Дангаар нэг аккаунт харах (detail modal) ──────────────────────────────
if (isset($_GET['id'])) {
    $id  = (int)$_GET['id'];
    $pdo = db();

    // Views нэмэх
    $pdo->prepare("UPDATE accounts SET views = views + 1 WHERE id = ? AND status = 'available'")
        ->execute([$id]);

    $stmt = $pdo->prepare("
        SELECT a.id, a.game, a.title, a.description, a.price, a.level, a.rank,
               a.server, a.screenshots, a.views, a.created_at,
               u.username AS seller_name
        FROM accounts a
        JOIN users u ON a.seller_id = u.id
        WHERE a.id = ? AND a.status = 'available'
    ");
    $stmt->execute([$id]);
    $account = $stmt->fetch();

    if (!$account) {
        json_response(['error' => 'Аккаунт олдсонгүй'], 404);
    }

    $shots = json_decode($account['screenshots'] ?? '[]', true);
    $account['thumb']       = $shots[0] ?? null;
    $account['screenshots'] = $shots;

    json_response(['accounts' => [$account], 'total' => 1, 'page' => 1, 'total_pages' => 1]);
}

// ── Жагсаалт ──────────────────────────────────────────────────────────────
$game   = in_array($_GET['game'] ?? '', ['mobile_legends','pubg','standoff2','']) ? ($_GET['game'] ?? '') : '';
$sort   = in_array($_GET['sort'] ?? '', ['price_asc','price_desc','newest','popular']) ? $_GET['sort'] : 'newest';
$page   = max(1, (int)($_GET['p'] ?? 1));
$limit  = 12;
$offset = ($page - 1) * $limit;

$where        = "WHERE a.status = 'available'";
$params       = [];
$count_params = [];

if ($game) {
    $where          .= ' AND a.game = ?';
    $params[]        = $game;
    $count_params[]  = $game;
}

// Хайлт
$search = clean($_GET['q'] ?? '');
if ($search) {
    $where          .= ' AND (a.title LIKE ? OR a.description LIKE ?)';
    $params[]        = "%$search%";
    $params[]        = "%$search%";
    $count_params[]  = "%$search%";
    $count_params[]  = "%$search%";
}

// Үнийн хязгаар
$min = (float)($_GET['min'] ?? 0);
$max = (float)($_GET['max'] ?? 0);
if ($min > 0) { $where .= ' AND a.price >= ?'; $params[] = $min; $count_params[] = $min; }
if ($max > 0) { $where .= ' AND a.price <= ?'; $params[] = $max; $count_params[] = $max; }

$order_map = [
    'price_asc'  => 'a.price ASC',
    'price_desc' => 'a.price DESC',
    'newest'     => 'a.created_at DESC',
    'popular'    => 'a.views DESC',
];
$order = $order_map[$sort];

$pdo = db();

// Нийт тоо (params дангаараа — LIMIT/OFFSET байхгүй)
$count_stmt = $pdo->prepare("SELECT COUNT(*) FROM accounts a $where");
$count_stmt->execute($count_params);
$total = (int)$count_stmt->fetchColumn();

// Жагсаалт
$stmt = $pdo->prepare("
    SELECT a.id, a.game, a.title, a.description, a.price, a.level, a.rank,
           a.server, a.screenshots, a.views, a.created_at,
           u.username AS seller_name
    FROM accounts a
    JOIN users u ON a.seller_id = u.id
    $where
    ORDER BY $order
    LIMIT $limit OFFSET $offset
");
$stmt->execute($params);
$accounts = $stmt->fetchAll();

// Screenshot — эхний зургийг thumbnail болгох
foreach ($accounts as &$acc) {
    $shots = json_decode($acc['screenshots'] ?? '[]', true);
    $acc['thumb'] = $shots[0] ?? null;
    unset($acc['screenshots']);
}
unset($acc);

json_response([
    'accounts'    => $accounts,
    'total'       => $total,
    'page'        => $page,
    'total_pages' => (int)ceil($total / $limit),
]);
