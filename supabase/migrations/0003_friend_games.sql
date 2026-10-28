-- Friend games: Friendship Score, What Am I to You, How Well Do You Know Me, and the Grow a Sapling garden buddy.
-- A signed-in person makes a link (fun_links). Friends open it with no account and answer through the functions below.
-- Only the link's owner can read the answers. Deleting the owner's account deletes their links and everything on them.
-- (Applied to the live project.)

create table public.fun_links (
  code text primary key check (code ~ '^[A-Za-z0-9]{6,12}$'),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game text not null check (game in ('friendship-score', 'what-am-i-to-you', 'how-well-do-you-know-me', 'grow-a-sapling')),
  owner_name text not null check (char_length(btrim(owner_name)) between 1 and 24),
  -- Know Me: the owner's answer key. Friends can never read this column; they only get a right/wrong from fun_know_check.
  secret jsonb not null default '{}'::jsonb check (octet_length(secret::text) <= 2048),
  -- Grow a Sapling: a small public snapshot of the garden (trees grown, streak) so the buddy page can show it.
  public jsonb not null default '{}'::jsonb check (octet_length(public::text) <= 2048),
  created_at timestamptz not null default now()
);
create index fun_links_owner_idx on public.fun_links (owner_id, game, created_at desc);

create table public.fun_responses (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.fun_links (code) on delete cascade,
  responder_name text not null check (char_length(btrim(responder_name)) between 1 and 24),
  name_key text generated always as (lower(btrim(responder_name))) stored,
  answers jsonb not null check (octet_length(answers::text) <= 1024),
  score int check (score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (code, name_key)
);

create table public.fun_garden_waters (
  code text not null references public.fun_links (code) on delete cascade,
  day int not null,
  buddy_name text not null check (char_length(btrim(buddy_name)) between 1 and 20),
  created_at timestamptz not null default now(),
  primary key (code, day)
);

alter table public.fun_links enable row level security;
alter table public.fun_responses enable row level security;
alter table public.fun_garden_waters enable row level security;

revoke all on public.fun_links, public.fun_responses, public.fun_garden_waters from anon;

create policy "own links: select" on public.fun_links for select to authenticated using ((select auth.uid()) = owner_id);
create policy "own links: insert" on public.fun_links for insert to authenticated
  with check ((select auth.uid()) = owner_id and (select count(*) from public.fun_links l where l.owner_id = (select auth.uid())) < 60);
create policy "own links: update" on public.fun_links for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "own links: delete" on public.fun_links for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "answers on own links: select" on public.fun_responses for select to authenticated
  using (exists (select 1 from public.fun_links l where l.code = fun_responses.code and l.owner_id = (select auth.uid())));
create policy "answers on own links: delete" on public.fun_responses for delete to authenticated
  using (exists (select 1 from public.fun_links l where l.code = fun_responses.code and l.owner_id = (select auth.uid())));

create policy "waterings on own links: select" on public.fun_garden_waters for select to authenticated
  using (exists (select 1 from public.fun_links l where l.code = fun_garden_waters.code and l.owner_id = (select auth.uid())));

-- ---------------------------------------------------------------------------------------------
-- Functions a friend can call without an account. They run with the owner's rights, so each one checks its input.
-- ---------------------------------------------------------------------------------------------

-- What a friend sees when they open a link: who made it, which game, and (for a garden) the public snapshot.
create or replace function public.fun_get_link(p_code text)
returns table (game text, owner_name text, public jsonb, responses int, buddy text)
language sql stable security definer set search_path = ''
as $$
  select l.game, l.owner_name, l.public,
         (select count(*)::int from public.fun_responses r where r.code = l.code),
         (select w.buddy_name from public.fun_garden_waters w where w.code = l.code order by w.created_at limit 1)
  from public.fun_links l
  where l.code = p_code;
$$;

-- A friend's answers. Same name again replaces the earlier answers. Each link keeps at most 300 friends.
create or replace function public.fun_submit_response(p_code text, p_name text, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  l public.fun_links;
  v_name text := btrim(coalesce(p_name, ''));
  v_score int;
  v_key jsonb;
  v_picks jsonb;
  v_i int;
  v_n int;
begin
  select * into l from public.fun_links where code = p_code;
  if not found then raise exception 'This link does not exist.' using errcode = 'P0002'; end if;
  if char_length(v_name) not between 1 and 24 then raise exception 'Please enter a name (1 to 24 letters).' using errcode = '22023'; end if;
  if jsonb_typeof(p_answers) is distinct from 'object' then raise exception 'Bad answers.' using errcode = '22023'; end if;

  select count(*) into v_n from public.fun_responses where code = p_code and name_key <> lower(v_name);
  if v_n >= 300 then raise exception 'This link has reached its limit.' using errcode = '54000'; end if;

  if l.game = 'friendship-score' then
    v_picks := p_answers -> 'picks';
    if jsonb_typeof(v_picks) is distinct from 'array' or jsonb_array_length(v_picks) <> 8 then raise exception 'Bad answers.' using errcode = '22023'; end if;
    for v_i in 0..7 loop
      if coalesce(v_picks ->> v_i, '') !~ '^[0-3]$' then raise exception 'Bad answers.' using errcode = '22023'; end if;
    end loop;
    if coalesce(p_answers ->> 'score', '') !~ '^[0-9]{1,3}$' then raise exception 'Bad answers.' using errcode = '22023'; end if;
    v_score := least(100, (p_answers ->> 'score')::int);
    p_answers := jsonb_build_object('picks', v_picks);

  elsif l.game = 'what-am-i-to-you' then
    if coalesce(p_answers ->> 'l', '') !~ '^[0-7]$' then raise exception 'Bad answers.' using errcode = '22023'; end if;
    p_answers := jsonb_build_object('l', (p_answers ->> 'l')::int, 'note', left(btrim(coalesce(p_answers ->> 'note', '')), 140));
    v_score := null;

  elsif l.game = 'how-well-do-you-know-me' then
    v_picks := p_answers -> 'guesses';
    v_key := l.secret -> 'key';
    if jsonb_typeof(v_picks) is distinct from 'array' or jsonb_array_length(v_picks) <> 10 or jsonb_typeof(v_key) is distinct from 'array' or jsonb_array_length(v_key) <> 10 then
      raise exception 'Bad answers.' using errcode = '22023';
    end if;
    v_score := 0;
    for v_i in 0..9 loop
      if coalesce(v_picks ->> v_i, '') !~ '^[0-3]$' then raise exception 'Bad answers.' using errcode = '22023'; end if;
      if (v_picks ->> v_i) = (v_key ->> v_i) then v_score := v_score + 1; end if;
    end loop;
    v_score := v_score * 10; -- stored out of 100
    p_answers := jsonb_build_object('guesses', v_picks);

  else
    raise exception 'This link does not take answers.' using errcode = '22023';
  end if;

  insert into public.fun_responses (code, responder_name, answers, score)
  values (p_code, v_name, p_answers, v_score)
  on conflict (code, name_key) do update
    set responder_name = excluded.responder_name, answers = excluded.answers, score = excluded.score, created_at = now();

  return jsonb_build_object('ok', true, 'score', v_score);
end;
$$;

-- Know Me: after a friend picks, tell them the right answer for that one question (the rest of the key stays hidden).
create or replace function public.fun_know_check(p_code text, p_q int, p_guess int)
returns int
language sql stable security definer set search_path = ''
as $$
  select (l.secret -> 'key' ->> p_q)::int
  from public.fun_links l
  where l.code = p_code and l.game = 'how-well-do-you-know-me' and p_q between 0 and 9 and p_guess between 0 and 3;
$$;

-- Garden buddy: water the shared tree for today. One buddy per garden; the day must be today where the friend is.
create or replace function public.fun_garden_water(p_code text, p_name text, p_day int)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  l public.fun_links;
  v_name text := btrim(coalesce(p_name, ''));
  v_server_day int := floor(extract(epoch from now()) / 86400)::int;
  v_other text;
begin
  select * into l from public.fun_links where code = p_code and game = 'grow-a-sapling';
  if not found then raise exception 'This garden does not exist.' using errcode = 'P0002'; end if;
  if char_length(v_name) not between 1 and 20 then raise exception 'Please enter a name (1 to 20 letters).' using errcode = '22023'; end if;
  if p_day is null or p_day < v_server_day - 1 or p_day > v_server_day + 1 then raise exception 'Check your phone date and time.' using errcode = '22023'; end if;

  select w.buddy_name into v_other from public.fun_garden_waters w where w.code = p_code and lower(w.buddy_name) <> lower(v_name) limit 1;
  if v_other is not null then raise exception 'This garden already has a buddy.' using errcode = '42501'; end if;

  insert into public.fun_garden_waters (code, day, buddy_name) values (p_code, p_day, v_name) on conflict (code, day) do nothing;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.fun_get_link(text), public.fun_submit_response(text, text, jsonb), public.fun_know_check(text, int, int), public.fun_garden_water(text, text, int) from public;
grant execute on function public.fun_get_link(text), public.fun_submit_response(text, text, jsonb), public.fun_know_check(text, int, int), public.fun_garden_water(text, text, int) to anon, authenticated;
