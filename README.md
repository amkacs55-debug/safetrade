# 🎮 GameMarket.mn — Тоглоомын Аккаунт Зах Зээл

100% автомат QPay интеграцитай тоглоомын аккаунт худалдах платформ.
**Mobile Legends · PUBG Mobile · Standoff 2**

---

## 📁 Файлын бүтэц

```
/
├── index.php                  ← Нүүр хуудас + хуудас чиглүүлэгч
├── database.sql               ← Өгөгдлийн сан үүсгэх
├── .htaccess                  ← Аюулгүй байдлын тохиргоо
│
├── /backend/
│   ├── config.php             ← DB, QPay, тохиргоо
│   ├── auth_check.php         ← Хэрэглэгч шалгах
│   ├── functions.php          ← Шифрлэлт, QPay, тусламжийн функцууд
│   │
│   ├── login.php              ← POST: Нэвтрэх
│   ├── register.php           ← POST: Бүртгэл
│   ├── forget_password.php    ← POST: Нууц үг сэргээх
│   │
│   ├── gmarket.php            ← GET: Зах зээлийн жагсаалт
│   ├── profile.php            ← GET: Профайл + авалтууд
│   │
│   ├── start_order.php        ← POST: Захиалга + QPay QR үүсгэх ⚡
│   ├── qpay_webhook.php       ← POST: Автомат хүргэлтийн "зүрх" 💓
│   ├── deliver.php            ← GET: Аккаунтын мэдээлэл харах
│   │
│   ├── seller.php             ← GET: Худалдагчийн самбар
│   ├── add_account.php        ← POST: Аккаунт нэмэх
│   │
│   ├── cron_worker.php        ← CLI: Хугацаа дууссан захиалга цуцлах
│   └── fraud_detection.php    ← Rate limiting, хуурамч хамгаалалт
│
└── /assets/
    ├── css/style.css          ← Dark cyberpunk загвар
    ├── js/app.js              ← Frontend логик
    └── uploads/               ← Скриншот зургууд
```

---

## ⚙️ Суулгах заавар

### 1. Өгөгдлийн сан үүсгэх
```bash
mysql -u root -p < database.sql
```

### 2. `backend/config.php` тохируулах
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'game_marketplace');

define('QPAY_USERNAME',     'QPay-с авсан нэр');
define('QPAY_PASSWORD',     'QPay-с авсан нууц үг');
define('QPAY_INVOICE_CODE', 'QPay нэхэмжлэлийн код');

define('ENCRYPT_KEY',    'яг 32 тэмдэгт урт нууц түлхүүр!!');
define('WEBHOOK_SECRET', 'санамсаргүй урт нууц токен');
define('BASE_URL',       'https://yourdomain.mn');
```

### 3. Cron ажил тохируулах
```bash
# Минут бүр ажиллуулах (хугацаа дууссан захиалга цуцлах)
* * * * * php /var/www/html/backend/cron_worker.php >> /var/log/gmarket_cron.log 2>&1
```

### 4. Uploads хавтас зөвшөөрөл
```bash
mkdir -p assets/uploads
chmod 755 assets/uploads
chown www-data:www-data assets/uploads
```

---

## 🔄 100% Автомат Захиалгын Урсгал

```
Худалдан авагч "Авах" дарна
    ↓
start_order.php → QPay QR үүсгэнэ
    ↓
Худалдан авагч QPay-р төлнө
    ↓
QPay → qpay_webhook.php дуудна (автомат)
    ↓
Webhook:
  1. Захиалгыг "paid" болгоно
  2. Аккаунтыг "sold" болгоно
  3. Credentials шифрийг тайлна
  4. Deliveries хүснэгтэд бичнэ
  5. Захиалгыг "delivered" болгоно
  6. Худалдагчийн balance нэмнэ
  7. Earnings бичнэ
    ↓
Frontend 3 секунд тутам шалгана (polling)
    ↓
Амжилттай → Аккаунтын мэдээлэл харагдана ✅
```

---

## 🔐 Аюулгүй байдлын онцлогууд

| Онцлог | Тайлбар |
|--------|---------|
| **AES-256-CBC шифрлэлт** | Credentials зөвхөн шифрлэгдсэн байдлаар хадгалагдана |
| **Rate limiting** | Login: 10/15мин, Register: 5/цаг, Order: 10/10мин |
| **CSRF хамгаалалт** | Webhook нууц токен шалгадаг |
| **SQL injection** | PDO prepared statements |
| **XSS хамгаалалт** | Бүх оролт escaping хийгдсэн |
| **Upload хамгаалалт** | Зөвхөн зураг, 5MB хязгаар |
| **Directory listing** | .htaccess-р хаасан |

---

## 💰 Шимтгэлийн тооцоо

- Платформ: **5%** (config.php-д өөрчилж болно)
- Жишээ: 50,000₮ аккаунт → Шимтгэл: 2,500₮ → Худалдагч авна: 47,500₮

---

## 📱 QPay Банкуудын холболт

QPay автоматаар дараах банкуудтай холбогддог:
Голомт · Хаан · Монголбанк · Хас · Капитрон · Криpto гэх мэт

---

## 🛠 Технологи

- **Backend**: PHP 8.1+, PDO MySQL
- **Frontend**: Vanilla JS, CSS Custom Properties
- **Төлбөр**: QPay v2 API
- **Шифрлэлт**: OpenSSL AES-256-CBC
- **Загвар**: Dark Cyberpunk Gaming UI
