-- "Request a tool" submissions (the live project already has this table; no screen in the site uses it yet).
-- Kept here so the database can be rebuilt from this repo. People can add and read only their own requests.
create table if not exists public.tool_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tool_name text not null check (char_length(tool_name) >= 2 and char_length(tool_name) <= 100),
  details text check (details is null or char_length(details) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.tool_requests enable row level security;

create policy "own requests: select" on public.tool_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy "own requests: insert" on public.tool_requests for insert to authenticated with check ((select auth.uid()) = user_id);
