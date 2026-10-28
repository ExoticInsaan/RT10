-- Per-user data for Flashcard Maker, Reminder and Days Countdown (applied to the live project).
create table public.user_tool_data (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tool_id text not null check (tool_id in ('flashcard-maker', 'reminder', 'days-countdown')),
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_id),
  constraint user_tool_data_size check (octet_length(data::text) <= 262144)
);

alter table public.user_tool_data enable row level security;

create policy "own data: select" on public.user_tool_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "own data: insert" on public.user_tool_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own data: update" on public.user_tool_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own data: delete" on public.user_tool_data for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.user_tool_data from anon;
