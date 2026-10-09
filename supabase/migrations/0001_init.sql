-- TopperShelf initial schema. Run in Supabase -> SQL Editor (or via the CLI).

create extension if not exists "pgcrypto";

-- 1. profiles: one row per student ---------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  college text,
  course text check (course in ('GNM', 'BSc Nursing', 'Post Basic')),
  year text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a student signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. products: everything on sale ----------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null check (type in ('notes', 'quiz', 'test')),
  subject text not null,
  course text,
  year text,
  price numeric(8, 2) not null check (price > 0),   -- rupees: 19 or 28
  file_path text,                                    -- path in the private 'notes' bucket
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. questions: quiz and test questions (NO answers in this table) --------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  position int not null default 0,
  question text not null,
  options jsonb not null,           -- e.g. ["A text", "B text", "C text", "D text"]
  is_sample boolean not null default false  -- first few questions free to preview
);

-- Correct answers + explanations live apart, with NO policies:
-- only the server (service role) can read them, so they never reach the browser.
create table public.question_answers (
  question_id uuid primary key references public.questions (id) on delete cascade,
  correct_option int not null,
  explanation text
);

-- 4. purchases: who bought what ------------------------------------------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id),
  gateway_order_id text not null unique,
  gateway_payment_id text unique,                    -- unique = safe against double webhooks
  amount int not null,                               -- paise
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);
create unique index one_paid_purchase_per_item
  on public.purchases (user_id, product_id) where status = 'paid';

-- 5. attempts: quiz and test results -------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id),
  answers jsonb,
  score int,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

-- Row Level Security ------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.questions        enable row level security;
alter table public.question_answers enable row level security;  -- no policy = server only
alter table public.purchases        enable row level security;
alter table public.attempts         enable row level security;

create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create policy "anyone reads published products"
  on public.products for select using (published);

create policy "read sample questions or questions you paid for"
  on public.questions for select using (
    is_sample
    or exists (
      select 1 from public.purchases pu
      where pu.product_id = questions.product_id
        and pu.user_id = auth.uid()
        and pu.status = 'paid'
    )
  );

-- Students read only their own purchases. No insert/update policy:
-- only the server (service role) writes purchases.
create policy "own purchases read" on public.purchases for select using (auth.uid() = user_id);

create policy "own attempts read" on public.attempts for select using (auth.uid() = user_id);

-- Storage: create a PRIVATE bucket named 'notes' (Dashboard -> Storage).
-- Add no public policies. The server checks the purchase, then issues a signed URL (~60 s).
