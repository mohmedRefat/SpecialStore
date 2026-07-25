# مخزن الكاوتش والبطاريات — دمياط (React + Supabase)

## التشغيل محليًا

```bash
npm install
cp .env.example .env
# حط الـ SUPABASE_URL و ANON_KEY بتوعك في .env
npm run dev
```

## ربط Supabase

1. اعمل مشروع على supabase.com (لو لسه معملتوش).
2. افتح **SQL Editor** وشغّل ملف `schema.sql` اللي في الروت.
3. من **Project Settings → API** خد الـ **Project URL** و **anon public key**.
4. حطهم في `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. `npm run dev` — لو الـ keys مظبوطة هيشتغل *cloud mode* تلقائيًا (بيانات + realtime sync).
   لو مفيش keys أو حصل error، الابليكيشن هيرجع لـ localStorage تلقائيًا (نفس فكرة الابليكيشن الأصلي).

## البناء للنشر

```bash
npm run build
```
الناتج هيبقى في مجلد `dist/` — جاهز يترفع على Netlify / Vercel / أي static host.
