-- Friendship Score, friend side: after a friend answers they can see where they rank among the link's friends.
-- Returns the friend's own rank and total, plus up to 5 friends just ahead of them (name and score only, never answers).
-- The rank is computed from the stored score, not from anything the browser sends. Ties share a rank.
-- Returns null when this name has not answered on this link. Not applied yet: run it in the Supabase SQL editor.

create or replace function public.fun_friend_rank(p_code text, p_name text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_key text := lower(btrim(coalesce(p_name, '')));
  v_score int;
  v_total int;
  v_ahead int;
  v_above jsonb;
begin
  select r.score into v_score
  from public.fun_responses r
  join public.fun_links l on l.code = r.code
  where r.code = p_code and l.game = 'friendship-score' and r.name_key = v_key and r.score is not null;
  if not found then return null; end if;

  select count(*)::int into v_total from public.fun_responses where code = p_code and score is not null;
  select count(*)::int into v_ahead from public.fun_responses where code = p_code and score > v_score;

  select coalesce(jsonb_agg(jsonb_build_object('name', x.responder_name, 'score', x.score) order by x.score desc, x.created_at), '[]'::jsonb)
  into v_above
  from (
    select responder_name, score, created_at
    from public.fun_responses
    where code = p_code and score > v_score
    order by score asc, created_at
    limit 5
  ) x;

  return jsonb_build_object('rank', v_ahead + 1, 'total', v_total, 'score', v_score, 'ahead', v_ahead, 'above', v_above);
end;
$$;

revoke all on function public.fun_friend_rank(text, text) from public;
grant execute on function public.fun_friend_rank(text, text) to anon, authenticated;
