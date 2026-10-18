-- Profile name and the one-time welcome screen shown after a student's first sign-in.
alter table public.profiles add column if not exists welcomed_at timestamptz;

-- Names are short. (Existing rows already fit.)
alter table public.profiles drop constraint if exists profiles_name_len;
alter table public.profiles add constraint profiles_name_len
  check (name is null or char_length(name) <= 60);

-- A student can create their own profile row if it is missing, and read/update only their own.
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
