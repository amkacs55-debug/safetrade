// ============================================
// app.js — Game Market Frontend Logic
// ============================================

const API = (path, opts = {}) =>
  fetch('/backend/' + path, {
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    ...opts,
  }).then(r => r.json());

// ===== STATE =====
let state = {
  game: '', sort: 'newest', page: 1,
  q: '', min: '', max: '',
  user: null,
  orderTimer: null,
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const page = new URLSearchParams(location.search).get('page') || 'market';

  // Active nav
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });

  // Page routing
  if (page === 'market')    initMarket();
  if (page === 'profile')   initProfile();
  if (page === 'seller')    initSeller();
  if (page === 'add')       initAddAccount();
  if (page === 'login')     initLogin();
  if (page === 'register')  initRegister();
  if (page === 'reset')     initReset();

  // Load user info
  loadUserNav();
});

// ===== USER NAV =====
async function loadUserNav() {
  const nav = document.getElementById('nav-user');
  if (!nav) return;
  try {
    const data = await API('profile.php');
    if (data.user) {
      state.user = data.user;
      nav.innerHTML = `
        <span class="balance">💰 ${data.user.balance}</span>
        <a href="?page=profile" class="btn btn-secondary btn-sm">${data.user.username}</a>
        ${data.user.role === 'seller' ? '<a href="?page=seller" class="btn btn-secondary btn-sm">📊 Самбар</a>' : ''}
        <a href="?page=logout" class="btn btn-sm" style="color:var(--muted)">Гарах</a>
      `;
    }
  } catch(e) {}
}

// ===== MARKET =====
function initMarket() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  // Game tabs
  document.querySelectorAll('.game-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.game = tab.dataset.game;
      state.page = 1;
      document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadCards();
    });
  });

  // Search
  const searchInput = document.getElementById('search-input');
  let searchTimer;
  searchInput?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = e.target.value.trim();
      state.page = 1;
      loadCards();
    }, 400);
  });

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', e => {
    state.sort = e.target.value;
    state.page = 1;
    loadCards();
  });

  loadCards();
}

async function loadCards() {
  const grid = document.getElementById('cards-grid');
  const pag  = document.getElementById('pagination');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  const params = new URLSearchParams({
    game: state.game, sort: state.sort,
    p: state.page, q: state.q,
    ...(state.min ? { min: state.min } : {}),
    ...(state.max ? { max: state.max } : {}),
  });

  const data = await API('gmarket.php?' + params);

  if (!data.accounts?.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <div class="icon">🎮</div>
      <p>Аккаунт олдсонгүй</p>
    </div>`;
    pag.innerHTML = '';
    return;
  }

  grid.innerHTML = data.accounts.map(a => cardHtml(a)).join('');
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openAccount(+card.dataset.id));
  });

  // Pagination
  pag.innerHTML = '';
  for (let i = 1; i <= data.total_pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === state.page) btn.classList.add('active');
    btn.addEventListener('click', () => { state.page = i; loadCards(); window.scrollTo(0,200); });
    pag.appendChild(btn);
  }
}

const GAME_EMOJI = { mobile_legends:'⚔️', pubg:'🎯', standoff2:'🔫' };
const GAME_BADGE = { mobile_legends:'ML', pubg:'PUBG', standoff2:'S2' };
const GAME_CLASS = { mobile_legends:'badge-ml', pubg:'badge-pub', standoff2:'badge-s2' };

function cardHtml(a) {
  const badgeClass = GAME_CLASS[a.game] || '';
  return `
  <div class="card" data-id="${a.id}">
    <span class="card-badge ${badgeClass}">${GAME_BADGE[a.game] || a.game}</span>
    <div class="card-img">${GAME_EMOJI[a.game] || '🎮'}</div>
    <div class="card-body">
      <div class="card-title">${esc(a.title)}</div>
      <div class="card-meta">
        ${a.level ? `<span class="tag">Lv.${a.level}</span>` : ''}
        ${a.rank  ? `<span class="tag">${esc(a.rank)}</span>` : ''}
        ${a.server? `<span class="tag">${esc(a.server)}</span>` : ''}
      </div>
      <div class="card-price">${formatPrice(a.price)}</div>
      <div class="card-seller">@${esc(a.seller_name)}</div>
    </div>
    <div class="card-footer">
      <span class="views">👁 ${a.views}</span>
      <span class="btn btn-primary btn-sm">Авах</span>
    </div>
  </div>`;
}

// ===== ACCOUNT DETAIL MODAL =====
async function openAccount(id) {
  // Fetch detail (re-use gmarket with id)
  const data = await API(`gmarket.php?id=${id}`);
  const a    = data.accounts?.[0];
  if (!a) return;

  showModal(`
    <div class="modal-header">
      <h2>${esc(a.title)}</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.8rem">
        <span class="status status-available">${GAME_BADGE[a.game]}</span>
        ${a.level ? `<span class="tag">Lv.${a.level}</span>` : ''}
        ${a.rank  ? `<span class="tag">${esc(a.rank)}</span>` : ''}
        ${a.server? `<span class="tag">${esc(a.server)}</span>` : ''}
      </div>
      ${a.description ? `<p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">${esc(a.description)}</p>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;
        background:var(--bg3);padding:.9rem;border-radius:var(--radius);margin-bottom:1rem">
        <div>
          <div style="font-size:.78rem;color:var(--muted)">Үнэ</div>
          <div class="card-price" style="font-size:1.5rem">${formatPrice(a.price)}</div>
        </div>
        <div style="font-size:.78rem;color:var(--muted);text-align:right">
          Худалдагч<br><strong style="color:var(--text)">@${esc(a.seller_name)}</strong>
        </div>
      </div>
      <div id="order-area"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Хаах</button>
      <button class="btn btn-primary" id="buy-btn" onclick="startOrder(${id})">
        ⚡ Худалдаж авах
      </button>
    </div>
  `);
}

// ===== ORDER FLOW =====
async function startOrder(accountId) {
  const buyBtn   = document.getElementById('buy-btn');
  const orderArea = document.getElementById('order-area');
  buyBtn.disabled = true;
  buyBtn.textContent = 'Уншиж байна...';
  orderArea.innerHTML = '';

  const fd = new FormData();
  fd.append('account_id', accountId);

  const data = await API('start_order.php', { method: 'POST', body: fd });

  if (data.error) {
    showAlert('order-area', data.error, 'error');
    buyBtn.disabled = false;
    buyBtn.textContent = '⚡ Худалдаж авах';
    return;
  }

  buyBtn.style.display = 'none';

  // ── DEMO горим: шууд хүргэлт харуулна ──
  if (data.demo) {
    orderArea.innerHTML = `
      <div class="alert alert-info" style="text-align:center;margin-bottom:.8rem">
        🧪 <strong>Demo горим</strong> — QPay холбогдоогүй үед шууд хүргэнэ
      </div>`;
    // deliver.php дуудаж credentials авна
    const creds = await API('deliver.php?order_id=' + data.order_id);
    if (creds.success) {
      showDelivery(creds);
    } else {
      showAlert('order-area', creds.error || 'Хүргэлт амжилтгүй', 'error');
    }
    return;
  }

  // ── LIVE горим: QR харуулж polling эхлүүлнэ ──
  orderArea.innerHTML = qrHtml(data);
  startCountdown(data.expires_at, data.order_id);
  startPolling(data.order_id);
}

function qrHtml(data) {
  const banksHtml = (data.banks || []).map(b =>
    `<a class="bank-btn" href="${b.link}" target="_blank">${b.name}</a>`
  ).join('');

  return `
  <div class="qr-box">
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.5rem">
      QPay-р төлнө үү <span class="live-dot"></span>
    </div>
    ${data.qr_image
      ? `<img src="data:image/png;base64,${data.qr_image}" alt="QR">`
      : `<div style="width:220px;height:220px;background:var(--bg);display:flex;align-items:center;justify-content:center;border-radius:8px;border:2px dashed var(--border);margin:0 auto">QR</div>`
    }
    <div class="qr-amount">${data.amount}</div>
    <div class="qr-timer" id="qr-timer">⏳ Хүлээж байна...</div>
    <div class="bank-links">${banksHtml}</div>
    <div id="payment-status" style="margin-top:.8rem"></div>
  </div>`;
}

function startCountdown(expiresAt, orderId) {
  const timerEl = document.getElementById('qr-timer');
  if (!timerEl) return;

  if (state.orderTimer) clearInterval(state.orderTimer);
  const expireTs = new Date(expiresAt).getTime();

  state.orderTimer = setInterval(() => {
    const left = Math.floor((expireTs - Date.now()) / 1000);
    if (!timerEl) return clearInterval(state.orderTimer);
    if (left <= 0) {
      timerEl.textContent = '⌛ Хугацаа дууслаа';
      timerEl.style.color = 'var(--danger)';
      clearInterval(state.orderTimer);
      document.getElementById('payment-status').innerHTML =
        `<div class="alert alert-error">Захиалгын хугацаа дуусав. Дахин оролдоно уу.</div>`;
      return;
    }
    const m = Math.floor(left / 60);
    const s = left % 60;
    timerEl.textContent = `⏳ ${m}:${String(s).padStart(2,'0')} үлдлээ`;
  }, 1000);
}

function startPolling(orderId) {
  let attempts = 0;
  const poll = setInterval(async () => {
    attempts++;
    if (attempts > 60) return clearInterval(poll);

    const r = await API(`deliver.php?order_id=${orderId}`);
    if (r.success) {
      clearInterval(poll);
      if (state.orderTimer) clearInterval(state.orderTimer);
      showDelivery(r);
    }
  }, 3000);
}

function showDelivery(creds) {
  document.querySelector('.qr-box')?.remove();
  document.getElementById('order-area').innerHTML = `
  <div class="delivery-box">
    <h3>✅ Төлбөр амжилттай!</h3>
    <p style="font-size:.85rem;color:var(--muted);margin-bottom:.8rem">
      Таны аккаунтын мэдээлэл доор байна. Нэвтэрсний дараа нууц үгээ сольно уу!
    </p>
    <div class="cred-row">
      <div>
        <div class="cred-label">Нэвтрэх нэр / И-мэйл</div>
        <div class="cred-val" id="cred-login">${esc(creds.login)}</div>
      </div>
      <button class="copy-btn" onclick="copyText('cred-login')">📋 Хуулах</button>
    </div>
    <div class="cred-row">
      <div>
        <div class="cred-label">Нууц үг</div>
        <div class="cred-val" id="cred-pass">${esc(creds.password)}</div>
      </div>
      <button class="copy-btn" onclick="copyText('cred-pass')">📋 Хуулах</button>
    </div>
    ${creds.extra ? `
    <div class="cred-row">
      <div>
        <div class="cred-label">Нэмэлт мэдээлэл</div>
        <div class="cred-val" id="cred-extra">${esc(creds.extra)}</div>
      </div>
      <button class="copy-btn" onclick="copyText('cred-extra')">📋 Хуулах</button>
    </div>` : ''}
    <div class="alert alert-info" style="margin-top:.8rem;font-size:.8rem">
      ⚠️ Энэ мэдээллийг зөвхөн та харах боломжтой. Аюулгүй газар хадгалаарай.
    </div>
  </div>`;

  // Confetti effect
  spawnConfetti();
}

// ===== PROFILE =====
async function initProfile() {
  const wrap = document.getElementById('profile-wrap');
  if (!wrap) return;

  wrap.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const data = await API('profile.php');

  if (data.error) { wrap.innerHTML = `<div class="alert alert-error">${data.error}</div>`; return; }

  let purchasesHtml = data.purchases?.length ? data.purchases.map(p => `
    <tr>
      <td>${GAME_BADGE[p.game] || p.game}</td>
      <td>${esc(p.title)}</td>
      <td>${formatPrice(p.amount)}</td>
      <td>${p.delivered_at?.slice(0,16) || '-'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewDelivery(${p.order_id})">
          🔑 Харах
        </button>
      </td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">Худалдан авалт байхгүй</td></tr>';

  wrap.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Хэрэглэгч</div>
        <div class="stat-val">${esc(data.user.username)}</div></div>
      <div class="stat-card"><div class="stat-label">Үлдэгдэл</div>
        <div class="stat-val">${data.user.balance}</div></div>
      <div class="stat-card"><div class="stat-label">Нийт авалт</div>
        <div class="stat-val">${data.purchases?.length || 0}</div></div>
    </div>
    ${data.pending?.length ? `
    <h3 style="font-family:var(--font-head);margin-bottom:.7rem">⏳ Хүлээгдэж буй захиалга</h3>
    ${data.pending.map(p => `
      <div class="alert alert-info" style="margin-bottom:.5rem">
        ${GAME_BADGE[p.game]} — ${esc(p.title)} |
        <strong>${formatPrice(p.amount)}</strong> |
        <button class="btn btn-primary btn-sm" onclick="resumeOrder(${p.order_id}, '${p.qpay_qr_image}', '${formatPrice(p.amount)}', '${p.expires_at}')">QR харах</button>
      </div>`).join('')}
    ` : ''}
    <h3 style="font-family:var(--font-head);margin:.8rem 0 .7rem">🛒 Худалдан авалтын түүх</h3>
    <div class="table-wrap">
      <table><thead><tr>
        <th>Тоглоом</th><th>Аккаунт</th><th>Үнэ</th><th>Огноо</th><th></th>
      </tr></thead><tbody>${purchasesHtml}</tbody></table>
    </div>`;
}

async function viewDelivery(orderId) {
  const data = await API(`deliver.php?order_id=${orderId}`);
  if (data.error) { alert(data.error); return; }
  showModal(`
    <div class="modal-header">
      <h2>🔑 Аккаунтын мэдээлэл</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${showDeliveryInline(data)}
    </div>`);
}

function showDeliveryInline(creds) {
  return `<div class="delivery-box">
    <div class="cred-row">
      <div><div class="cred-label">Нэвтрэх нэр</div>
      <div class="cred-val" id="dl-login">${esc(creds.login)}</div></div>
      <button class="copy-btn" onclick="copyText('dl-login')">📋</button>
    </div>
    <div class="cred-row">
      <div><div class="cred-label">Нууц үг</div>
      <div class="cred-val" id="dl-pass">${esc(creds.password)}</div></div>
      <button class="copy-btn" onclick="copyText('dl-pass')">📋</button>
    </div>
    ${creds.extra ? `<div class="cred-row"><div>
      <div class="cred-label">Нэмэлт</div>
      <div class="cred-val" id="dl-extra">${esc(creds.extra)}</div></div>
      <button class="copy-btn" onclick="copyText('dl-extra')">📋</button>
    </div>` : ''}
  </div>`;
}

// ===== SELLER DASHBOARD =====
async function initSeller() {
  const wrap = document.getElementById('seller-wrap');
  if (!wrap) return;

  wrap.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const data = await API('seller.php');

  if (data.error) { wrap.innerHTML = `<div class="alert alert-error">${data.error}</div>`; return; }

  const s = data.summary;
  const ordersHtml = data.recent_orders?.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${esc(o.account_title)}</td>
      <td>${esc(o.buyer_name)}</td>
      <td style="color:var(--success)">${formatPrice(o.seller_amount)}</td>
      <td><span class="status status-${o.status}">${o.status}</span></td>
      <td>${o.created_at?.slice(0,16)}</td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--muted)">Захиалга байхгүй</td></tr>';

  wrap.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Нийт борлуулалт</div><div class="stat-val">${s.total_sales}</div></div>
      <div class="stat-card"><div class="stat-label">Нийт орлого</div><div class="stat-val">${s.total_gross}</div></div>
      <div class="stat-card"><div class="stat-label">Шимтгэл</div><div class="stat-val" style="color:var(--danger)">${s.total_fee}</div></div>
      <div class="stat-card"><div class="stat-label">Цэвэр ашиг</div><div class="stat-val" style="color:var(--success)">${s.total_net}</div></div>
      <div class="stat-card"><div class="stat-label">Хэтэвч</div><div class="stat-val">${s.balance}</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem">
      <h3 style="font-family:var(--font-head)">📋 Сүүлийн захиалгууд</h3>
      <a href="?page=add" class="btn btn-primary btn-sm">+ Аккаунт нэмэх</a>
    </div>
    <div class="table-wrap">
      <table><thead><tr>
        <th>ID</th><th>Аккаунт</th><th>Худалдан авагч</th><th>Ашиг</th><th>Төлөв</th><th>Огноо</th>
      </tr></thead><tbody>${ordersHtml}</tbody></table>
    </div>`;
}

// ===== ADD ACCOUNT =====
function initAddAccount() {
  const form = document.getElementById('add-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = form.querySelector('[type=submit]');
    const fd   = new FormData(form);
    btn.disabled = true; btn.textContent = 'Хадгалж байна...';

    const data = await API('add_account.php', { method: 'POST', body: fd });
    btn.disabled = false; btn.textContent = '✅ Нэмэх';

    const area = document.getElementById('form-msg');
    if (data.error) {
      area.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    } else {
      area.innerHTML = `<div class="alert alert-success">Аккаунт амжилттай нэмэгдлээ! ID: #${data.account_id}</div>`;
      form.reset();
    }
  });
}

// ===== AUTH =====
function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    const data = await API('login.php', { method: 'POST', body: new FormData(form) });
    btn.disabled = false;
    if (data.error) {
      document.getElementById('auth-msg').innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    } else {
      location.href = data.redirect || '?page=market';
    }
  });
}

function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    const data = await API('register.php', { method: 'POST', body: new FormData(form) });
    btn.disabled = false;
    const msg = document.getElementById('auth-msg');
    if (data.error) {
      msg.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    } else {
      msg.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      setTimeout(() => location.href = '?page=login', 1500);
    }
  });
}

function initReset() {
  const token = new URLSearchParams(location.search).get('token');
  const form  = document.getElementById('reset-form');
  if (!form) return;
  if (token) {
    document.getElementById('reset-token')?.setAttribute('value', token);
    form.dataset.action = 'reset';
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    fd.append('action', form.dataset.action || 'request');
    const data = await API('forget_password.php', { method: 'POST', body: fd });
    document.getElementById('auth-msg').innerHTML = data.error
      ? `<div class="alert alert-error">${data.error}</div>`
      : `<div class="alert alert-success">${data.message}</div>`;
  });
}

// ===== UTILITIES =====
function showModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay')?.remove();
  document.body.style.overflow = '';
  if (state.orderTimer) clearInterval(state.orderTimer);
}

function showAlert(containerId, msg, type = 'error') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="alert alert-${type}">${esc(msg)}</div>`;
}

function copyText(elemId) {
  const text = document.getElementById(elemId)?.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(`[onclick="copyText('${elemId}')"]`);
    if (btn) { btn.textContent = '✅'; setTimeout(() => btn.textContent = '📋', 1500); }
  });
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatPrice(n) {
  return Number(n).toLocaleString('mn-MN') + '₮';
}

function spawnConfetti() {
  const colors = ['#00d4ff','#ff6b35','#00e676','#ffd740'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; top:-10px;
      left:${Math.random()*100}vw;
      width:8px; height:8px;
      background:${colors[i%colors.length]};
      border-radius:2px; z-index:9998;
      animation:confettiFall ${1+Math.random()*2}s ease forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

// Confetti animation
const style = document.createElement('style');
style.textContent = `
  @keyframes confettiFall {
    to { transform: translateY(105vh) rotate(${Math.random()*720}deg); opacity:0; }
  }`;
document.head.appendChild(style);
