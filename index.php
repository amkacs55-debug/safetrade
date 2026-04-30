<?php
// index.php — Нүүр хуудас + Хуудас чиглүүлэгч
require_once __DIR__.'/backend/config.php';

$page = match(clean($_GET['page'] ?? 'market')) {
    'market'   => 'market',
    'profile'  => 'profile',
    'seller'   => 'seller',
    'add'      => 'add',
    'login'    => 'login',
    'register' => 'register',
    'reset'    => 'reset',
    'logout'   => 'logout',
    default    => 'market',
};

// Logout
if ($page === 'logout') {
    session_destroy();
    header('Location: /index.php?page=login');
    exit;
}

$titles = [
    'market'   => 'Зах Зээл',
    'profile'  => 'Профайл',
    'seller'   => 'Худалдагчийн Самбар',
    'add'      => 'Аккаунт Нэмэх',
    'login'    => 'Нэвтрэх',
    'register' => 'Бүртгүүлэх',
    'reset'    => 'Нууц Үг Сэргээх',
];

function clean($s) { return htmlspecialchars(strip_tags(trim($s??'')), ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GameMarket.mn — <?= $titles[$page] ?></title>
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>">
</head>
<body>

<!-- ===== NAVBAR ===== -->
<nav class="navbar">
  <a href="/index.php?page=market" class="logo">GAME<span>MKT</span></a>
  <div class="nav-links">
    <a href="?page=market" data-page="market">🏪 Зах Зээл</a>
    <?php if (!empty($_SESSION['user_id'])): ?>
      <a href="?page=profile" data-page="profile">👤 Профайл</a>
      <?php if (in_array($_SESSION['role'] ?? '', ['seller','admin'])): ?>
        <a href="?page=seller" data-page="seller">📊 Самбар</a>
        <a href="?page=add" data-page="add">➕ Зарах</a>
      <?php endif; ?>
    <?php endif; ?>
  </div>
  <div class="nav-right" id="nav-user">
    <?php if (empty($_SESSION['user_id'])): ?>
      <a href="?page=login" class="btn btn-secondary btn-sm">Нэвтрэх</a>
      <a href="?page=register" class="btn btn-primary btn-sm">Бүртгүүлэх</a>
    <?php endif; ?>
  </div>
</nav>

<!-- ===== PAGE CONTENT ===== -->
<?php switch ($page):
  case 'market': ?>

<div class="hero">
  <h1>🎮 Тоглоомын <span>Аккаунт</span> Зах Зээл</h1>
  <p>Mobile Legends, PUBG, Standoff 2 аккаунтуудыг аюулгүй, автомат түргэн хүргэлттэйгээр худалдан авна уу</p>
  <div class="hero-games">
    <span class="game-pill ml" onclick="setGame('mobile_legends')">⚔️ Mobile Legends</span>
    <span class="game-pill pub" onclick="setGame('pubg')">🎯 PUBG Mobile</span>
    <span class="game-pill s2" onclick="setGame('standoff2')">🔫 Standoff 2</span>
  </div>
</div>

<div class="game-tabs">
  <a class="game-tab active" data-game="" href="#">
    <span class="dot"></span> Бүгд
  </a>
  <a class="game-tab" data-game="mobile_legends" href="#">
    <span class="dot"></span> Mobile Legends
  </a>
  <a class="game-tab" data-game="pubg" href="#">
    <span class="dot"></span> PUBG Mobile
  </a>
  <a class="game-tab" data-game="standoff2" href="#">
    <span class="dot"></span> Standoff 2
  </a>
</div>

<div class="search-bar">
  <input type="text" id="search-input" placeholder="🔍 Аккаунт хайх...">
  <select id="sort-select">
    <option value="newest">Шинэ</option>
    <option value="price_asc">Хямд</option>
    <option value="price_desc">Үнэтэй</option>
    <option value="popular">Алдартай</option>
  </select>
</div>

<div class="cards-grid" id="cards-grid">
  <div class="loading" style="grid-column:1/-1"><div class="spinner"></div></div>
</div>
<div class="pagination" id="pagination"></div>

<?php break; case 'profile': ?>
<div style="padding:1.5rem">
  <h2 style="font-family:var(--font-head);margin-bottom:1rem">👤 Миний профайл</h2>
  <div id="profile-wrap"><div class="loading"><div class="spinner"></div></div></div>
</div>

<?php break; case 'seller': ?>
<div style="padding:1.5rem">
  <h2 style="font-family:var(--font-head);margin-bottom:1rem">📊 Худалдагчийн самбар</h2>
  <div id="seller-wrap"><div class="loading"><div class="spinner"></div></div></div>
</div>

<?php break; case 'add': ?>
<div style="padding:1.5rem;max-width:680px;margin:0 auto">
  <h2 style="font-family:var(--font-head);margin-bottom:1.2rem">➕ Аккаунт зарах</h2>
  <div id="form-msg"></div>
  <form id="add-form" enctype="multipart/form-data" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem">
    <div class="form-group">
      <label>Тоглоом *</label>
      <select name="game" required>
        <option value="">— Сонгох —</option>
        <option value="mobile_legends">⚔️ Mobile Legends</option>
        <option value="pubg">🎯 PUBG Mobile</option>
        <option value="standoff2">🔫 Standoff 2</option>
      </select>
    </div>
    <div class="form-group">
      <label>Гарчиг *</label>
      <input name="title" placeholder="Жишээ: ML Diamond 5 - 80+ Hero" required>
    </div>
    <div class="form-group">
      <label>Тайлбар</label>
      <textarea name="description" placeholder="Аккаунтын дэлгэрэнгүй тайлбар..."></textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Үнэ (₮) *</label>
        <input name="price" type="number" min="1000" placeholder="25000" required>
      </div>
      <div class="form-group">
        <label>Түвшин</label>
        <input name="level" type="number" min="0" placeholder="75">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Ранк</label>
        <input name="rank" placeholder="Mythic, Legendary...">
      </div>
      <div class="form-group">
        <label>Сервер</label>
        <input name="server" placeholder="SEA, Global...">
      </div>
    </div>
    <hr style="border-color:var(--border);margin:1rem 0">
    <div class="alert alert-info" style="margin-bottom:1rem;font-size:.83rem">
      🔒 Нэвтрэх мэдээлэл нь AES-256 шифрлэлтээр хамгаалагдана. Зөвхөн төлбөр тасалдсаны дараа худалдан авагчид харагдана.
    </div>
    <div class="form-group">
      <label>Нэвтрэх нэр / И-мэйл *</label>
      <input name="login" placeholder="account@email.com" required>
    </div>
    <div class="form-group">
      <label>Нууц үг *</label>
      <input name="password" type="password" placeholder="••••••••" required>
      <div class="form-hint">Аккаунтын нууц үг (тоглоомын апп дахь)</div>
    </div>
    <div class="form-group">
      <label>Нэмэлт мэдээлэл</label>
      <input name="extra" placeholder="Зочилсон и-мэйл, утасны дугаар гэх мэт...">
    </div>
    <div class="form-group">
      <label>Скриншот (max 5)</label>
      <input name="screenshots[]" type="file" accept="image/*" multiple>
    </div>
    <button type="submit" class="btn btn-primary btn-full" style="margin-top:.5rem">
      ✅ Аккаунт нэмэх
    </button>
  </form>
</div>

<?php break; case 'login': ?>
<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:1.5rem">
  <div style="width:100%;max-width:380px">
    <h2 style="font-family:var(--font-head);text-align:center;margin-bottom:1.5rem;font-size:1.8rem">
      🎮 Нэвтрэх
    </h2>
    <div id="auth-msg"></div>
    <form id="login-form" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem">
      <div class="form-group">
        <label>Нэвтрэх нэр / И-мэйл</label>
        <input name="username" placeholder="username" required>
      </div>
      <div class="form-group">
        <label>Нууц үг</label>
        <input name="password" type="password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Нэвтрэх</button>
      <div style="text-align:center;margin-top:1rem;font-size:.85rem;color:var(--muted)">
        <a href="?page=reset" style="color:var(--accent)">Нууц үг мартсан?</a>
        &nbsp;·&nbsp;
        <a href="?page=register" style="color:var(--accent)">Бүртгүүлэх</a>
      </div>
    </form>
  </div>
</div>

<?php break; case 'register': ?>
<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:1.5rem">
  <div style="width:100%;max-width:400px">
    <h2 style="font-family:var(--font-head);text-align:center;margin-bottom:1.5rem;font-size:1.8rem">
      ✨ Бүртгүүлэх
    </h2>
    <div id="auth-msg"></div>
    <form id="register-form" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem">
      <div class="form-group">
        <label>Нэвтрэх нэр *</label>
        <input name="username" placeholder="gamertag" required>
      </div>
      <div class="form-group">
        <label>И-мэйл *</label>
        <input name="email" type="email" placeholder="you@mail.com" required>
      </div>
      <div class="form-group">
        <label>Нууц үг * (8+ тэмдэгт)</label>
        <input name="password" type="password" placeholder="••••••••" required minlength="8">
      </div>
      <div class="form-group">
        <label>Үүрэг</label>
        <select name="role">
          <option value="buyer">🛒 Худалдан авагч</option>
          <option value="seller">💰 Худалдагч</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Бүртгүүлэх</button>
      <div style="text-align:center;margin-top:1rem;font-size:.85rem;color:var(--muted)">
        Аль хэдийн бүртгэлтэй? <a href="?page=login" style="color:var(--accent)">Нэвтрэх</a>
      </div>
    </form>
  </div>
</div>

<?php break; case 'reset': ?>
<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:1.5rem">
  <div style="width:100%;max-width:380px">
    <h2 style="font-family:var(--font-head);text-align:center;margin-bottom:1.5rem">
      🔐 Нууц үг сэргээх
    </h2>
    <div id="auth-msg"></div>
    <?php $token = clean($_GET['token'] ?? ''); ?>
    <form id="reset-form" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem"
          data-action="<?= $token ? 'reset' : 'request' ?>">
      <?php if ($token): ?>
        <input type="hidden" id="reset-token" name="token" value="<?= $token ?>">
        <div class="form-group">
          <label>Шинэ нууц үг</label>
          <input name="password" type="password" placeholder="••••••••" required minlength="8">
        </div>
        <button type="submit" class="btn btn-primary btn-full">Нууц үг солих</button>
      <?php else: ?>
        <div class="form-group">
          <label>Бүртгэлтэй и-мэйл</label>
          <input name="email" type="email" placeholder="you@mail.com" required>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Имэйл илгээх</button>
      <?php endif; ?>
      <div style="text-align:center;margin-top:1rem;font-size:.85rem">
        <a href="?page=login" style="color:var(--accent)">← Нэвтрэх хуудас руу</a>
      </div>
    </form>
  </div>
</div>
<?php endswitch; ?>

<!-- ===== FOOTER ===== -->
<footer style="border-top:1px solid var(--border);padding:1.5rem;text-align:center;color:var(--muted);font-size:.8rem;margin-top:2rem">
  <div style="font-family:var(--font-head);font-size:1rem;color:var(--accent);margin-bottom:.4rem">GAMEMKT.MN</div>
  QPay интеграцитай 100% автомат тоглоомын аккаунт зах зээл
  <br>© <?= date('Y') ?> · Шимтгэл: 5% · Автомат хүргэлт
</footer>

<script src="/assets/js/app.js"></script>
<script>
// Hero game pill shortcut
function setGame(g) {
  state.game = g;
  state.page = 1;
  history.pushState(null,'','?page=market');
  document.querySelectorAll('.game-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.game === g);
  });
  loadCards?.();
}
</script>
</body>
</html>
