-- Admin access for the /admin page (already applied to the live project; kept here so the database can be rebuilt).
-- Admins are listed in app_admins by account id. The table has no policies on purpose, so nobody can read or change it
-- through the website. Add an admin in the Supabase SQL editor with:
--   insert into public.app_admins (user_id) select id from auth.users where lower(email) = lower('ADMIN EMAIL HERE');
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.app_admins where user_id = (select auth.uid()))
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Admins can read every tool request (everyone else still sees only their own).
create policy "admins: select all requests" on public.tool_requests
  for select to authenticated using (public.is_admin());

-- Totals only, no personal data. Refuses anyone who is not an admin.
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'users_total', (select count(*) from auth.users),
    'users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'users_30d', (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'signups_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'count', c) order by d)
      from (select created_at::date as d, count(*) as c from auth.users
            where created_at > now() - interval '14 days' group by 1) s), '[]'::jsonb),
    'requests_total', (select count(*) from public.tool_requests),
    'users_with_favourites', (select count(*) from public.user_tools where cardinality(favourites) > 0),
    'top_favourites', coalesce((
      select jsonb_agg(jsonb_build_object('tool', t, 'count', c) order by c desc)
      from (select t, count(*) as c from public.user_tools, unnest(favourites) as t
            group by t order by c desc limit 12) f), '[]'::jsonb),
    'saved_data', coalesce((
      select jsonb_agg(jsonb_build_object('tool', tool_id, 'users', c) order by c desc)
      from (select tool_id, count(*) as c from public.user_tool_data group by tool_id) s), '[]'::jsonb),
    'friend_games', coalesce((
      select jsonb_agg(jsonb_build_object('game', game, 'links', c) order by c desc)
      from (select game, count(*) as c from public.fun_links group by game) g), '[]'::jsonb),
    'friend_responses', (select count(*) from public.fun_responses)
  );
end
$$;
revoke all on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to authenticated;
