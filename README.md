# 🎮 GameMarket MN

Mobile Legends, Standoff 2, PUBG аккаунт зарах/худалдах платформ.

## Стек
- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend/DB**: Supabase (Auth + PostgreSQL + Realtime)
- **Hosting**: Render.com

## Онцлог
- ✅ Бүртгэл / нэвтрэх (Supabase Auth)
- ✅ Зар нийтлэх (ML, Standoff2, PUBG)
- ✅ Зар хайх, шүүх
- ✅ Buyer-Seller realtime чат
- ✅ Verified Seller badge (99,000₮ нэг удаа)
- ✅ 5% шимтгэл систем
- ✅ Admin панел
- ✅ Seller dashboard

---

## 1. Supabase тохируулах

### Шинэ проект үүсгэх
1. [supabase.com](https://supabase.com) руу орно
2. New Project → нэр, password оруулна
3. Project үүссэний дараа **Settings → API** руу орно
4. `Project URL` болон `anon public` key-г хуулна

### Schema оруулах
1. Supabase → **SQL Editor** руу орно
2. `supabase-schema.sql` файлын бүх агуулгыг хуулаад ажиллуулна

### Realtime идэвхжүүлэх
1. Supabase → **Database → Replication** руу орно
2. `messages` table-ийг realtime-д нэмнэ (SQL-д хийгдсэн)

---

## 2. Local хөгжүүлэх

```bash
# 1. Clone
git clone <your-repo>
cd gamemarket

# 2. Dependencies суулгах
npm install

# 3. .env.local файл үүсгэх
cp .env.local.example .env.local
# .env.local файлд Supabase credentials оруулна

# 4. Ажиллуулах
npm run dev
```

`.env.local` файл:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 3. Render.com-д deploy хийх

### GitHub-т байршуулах
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/gamemarket.git
git push -u origin main
```

### Render.com тохируулах
1. [render.com](https://render.com) руу орж бүртгүүлнэ
2. **New → Web Service**
3. GitHub repository-г холбоно
4. Settings:
   - **Name**: gamemarket
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables** нэмнэ:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. **Create Web Service** дарна

Render.com free tier байдаг — зардал 0!

---

## 4. Admin тохируулах

`app/admin/page.tsx` файлд:
```typescript
const ADMIN_USERNAMES = ['admin'] // өөрийн username нэмнэ
```

Бүртгэл үүсгэхдээ username-аа `admin` гэж тавина.

---

## Хавтасны бүтэц

```
gamemarket/
├── app/
│   ├── page.tsx              # Нүүр хуудас
│   ├── auth/page.tsx         # Нэвтрэх/бүртгүүлэх
│   ├── listings/
│   │   ├── page.tsx          # Зарууд хуудас
│   │   └── new/page.tsx      # Зар нэмэх
│   ├── listing/[id]/page.tsx # Зар дэлгэрэнгүй
│   ├── chat/
│   │   ├── page.tsx          # Чат жагсаалт
│   │   └── [id]/page.tsx     # Чат дэлгэрэнгүй
│   ├── seller/dashboard/     # Seller dashboard
│   └── admin/page.tsx        # Admin панел
├── components/
│   └── layout/Navbar.tsx
├── lib/
│   ├── supabase.ts           # Client
│   ├── supabase-server.ts    # Server
│   └── utils.ts              # Helpers
├── types/index.ts
├── supabase-schema.sql       # DB schema
└── render.yaml               # Deploy config
```

---

## Шимтгэл тооцоо

| Үнэ | Шимтгэл (5%) | Худалдагч авах |
|-----|-------------|----------------|
| 50,000₮ | 2,500₮ | 47,500₮ |
| 100,000₮ | 5,000₮ | 95,000₮ |
| 200,000₮ | 10,000₮ | 190,000₮ |

Verified Seller badge: **99,000₮ нэг удаа** (admin баталгаажуулна)
