-- Monthly "Popular" list for the app's Home screen, built from the anonymous tool_events counts (0009).
-- One snapshot per calendar month (top tools by opens over the 30 days before it was taken). It is created by the first
-- get_popular_tools() call of each month, so no scheduled job is needed and the list stays the same all month.
-- Only tool names and counts are stored. Nothing about any person.
create table if not exists public.popular_tools_monthly (
  month date not null,
  rank integer not null check (rank between 1 and 12),
  tool_id text not null,
  opens integer not null,
  primary key (month, rank)
);
alter table public.popular_tools_monthly enable row level security;
-- No direct access for the website or app: only the function below reads and writes it.
revoke all on public.popular_tools_monthly from anon, authenticated;

create or replace function public.get_popular_tools(p_limit integer default 4)
returns text[]
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  m date := date_trunc('month', now())::date;
  lim integer := greatest(1, least(coalesce(p_limit, 4), 12));
  result text[];
begin
  if not exists (select 1 from public.popular_tools_monthly where month = m) then
    perform pg_advisory_xact_lock(hashtext('popular_tools_monthly'));
    if not exists (select 1 from public.popular_tools_monthly where month = m) then
      insert into public.popular_tools_monthly (month, rank, tool_id, opens)
      select m, (row_number() over (order by opens desc, tool_id))::integer, tool_id, opens
      from (
        select tool_id, count(*)::integer as opens
        from public.tool_events
        where created_at >= now() - interval '30 days'
        group by tool_id
        order by opens desc, tool_id
        limit 12
      ) t;
    end if;
  end if;
  select coalesce(array_agg(tool_id order by rank), '{}') into result
  from (select tool_id, rank from public.popular_tools_monthly where month = m order by rank limit lim) s;
  return result;
end
$$;
revoke all on function public.get_popular_tools(integer) from public;
grant execute on function public.get_popular_tools(integer) to anon, authenticated;
