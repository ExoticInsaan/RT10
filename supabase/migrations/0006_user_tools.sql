-- Favourite and recently used tools, one row per user (the live project already has this table).
-- Kept here so the database can be rebuilt from this repo. Read and written by components/AccountListsSync.tsx.
create table if not exists public.user_tools (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favourites text[] not null default '{}'::text[] check (cardinality(favourites) <= 100),
  recents text[] not null default '{}'::text[] check (cardinality(recents) <= 20),
  updated_at timestamptz not null default now()
);

alter table public.user_tools enable row level security;

create policy "own row: select" on public.user_tools for select to authenticated using ((select auth.uid()) = user_id);
create policy "own row: insert" on public.user_tools for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own row: update" on public.user_tools for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own row: delete" on public.user_tools for delete to authenticated using ((select auth.uid()) = user_id);
