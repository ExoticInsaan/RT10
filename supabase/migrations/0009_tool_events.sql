-- Anonymous "tool opened" counts for the /admin page (already applied to the live project; kept here so the database
-- can be rebuilt from this repo).
-- Each row is only: which tool, website or app, signed in or not, and when. No account id, device id or IP address.
create table if not exists public.tool_events (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null check (char_length(tool_id) between 1 and 60),
  event text not null check (event = 'open'),
  platform text not null check (platform in ('web', 'app')),
  signed_in boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists tool_events_created_at_idx on public.tool_events (created_at);

alter table public.tool_events enable row level security;

-- Anyone (signed in or not) can add a row. Nobody can read, change or delete rows through the website or app:
-- there is no select policy on purpose. Only the admin_tool_usage() function below reads them, for admins.
revoke all on public.tool_events from anon, authenticated;
grant insert on public.tool_events to anon, authenticated;
create policy "anyone: insert events" on public.tool_events for insert to anon, authenticated with check (true);

-- Totals per tool for the last p_days days (1 to 365). Refuses anyone who is not an admin.
create or replace function public.admin_tool_usage(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  days integer := greatest(1, least(coalesce(p_days, 30), 365));
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'days', days,
    'by_tool', coalesce((
      select jsonb_agg(jsonb_build_object(
               'tool', tool_id, 'opens', opens, 'signed_in_opens', signed_in_opens, 'app_opens', app_opens
             ) order by opens desc, tool_id)
      from (
        select tool_id,
               count(*) as opens,
               count(*) filter (where signed_in) as signed_in_opens,
               count(*) filter (where platform = 'app') as app_opens
        from public.tool_events
        where created_at >= now() - make_interval(days => days)
        group by tool_id
      ) t), '[]'::jsonb)
  );
end
$$;
revoke all on function public.admin_tool_usage(integer) from public, anon, authenticated;
grant execute on function public.admin_tool_usage(integer) to authenticated;
