-- شغّل الملف ده مرة واحدة في Supabase SQL Editor قبل ما تحط الـ keys في .env

create table if not exists public.tires (
  id text primary key,
  brand text,
  origin text,
  size text,
  qty integer default 0,
  threshold integer default 2,
  cost numeric,
  wholesale numeric,
  retail numeric,
  place text,
  created_at timestamptz default now()
);

create table if not exists public.batteries (
  id text primary key,
  brand text,
  origin text,
  amp numeric,
  qty integer default 0,
  cost numeric,
  wholesale numeric,
  retail numeric,
  created_at timestamptz default now()
);

create table if not exists public.installments (
  id text primary key,
  name text,
  phone text,
  description text,
  total numeric,
  down numeric,
  installments integer,
  monthly numeric,
  paid integer default 0,
  remaining numeric,
  first_installment_date date,
  last_payment_date date,
  created_at timestamptz default now()
);

-- تفعيل Row Level Security
alter table public.tires enable row level security;
alter table public.batteries enable row level security;
alter table public.installments enable row level security;

-- ملاحظة: السياسات دي تسمح لأي حد معاه الـ anon key يقرأ/يكتب.
-- كفاية للاستخدام الشخصي/المحل بس مش production آمن لتطبيق عام.
create policy "allow all tires" on public.tires for all using (true) with check (true);
create policy "allow all batteries" on public.batteries for all using (true) with check (true);
create policy "allow all installments" on public.installments for all using (true) with check (true);

-- تفعيل الـ Realtime على الجداول
alter publication supabase_realtime add table public.tires;
alter publication supabase_realtime add table public.batteries;
alter publication supabase_realtime add table public.installments;
