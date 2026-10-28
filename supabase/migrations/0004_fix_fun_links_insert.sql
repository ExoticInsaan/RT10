-- Fix: the insert policy on fun_links counted fun_links inside itself, which Postgres rejects as infinite recursion.
-- The 60-links-per-person limit moves to a trigger. (Applied to the live project.)
drop policy "own links: insert" on public.fun_links;
create policy "own links: insert" on public.fun_links for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create or replace function public.fun_links_limit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select count(*) from public.fun_links l where l.owner_id = new.owner_id) >= 60 then
    raise exception 'This link has reached its limit.' using errcode = '54000';
  end if;
  return new;
end;
$$;
revoke all on function public.fun_links_limit() from public, anon, authenticated;

create trigger fun_links_limit before insert on public.fun_links for each row execute function public.fun_links_limit();
