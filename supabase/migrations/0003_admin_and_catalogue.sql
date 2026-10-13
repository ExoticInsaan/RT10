-- Admin access and the catalogue fields for the five content types.
-- Run after 0001_init.sql.

-- 1. Who is an admin -------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;   -- no policies: not readable from the API

insert into public.admins (email) values ('jatinsinsinwar18@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
     where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2. Product fields ----------------------------------------------------------
alter table public.products drop constraint if exists products_type_check;
alter table public.products drop column if exists year;
alter table public.products add column if not exists term int check (term between 1 and 8);
alter table public.products add column if not exists pages int check (pages > 0);
alter table public.products add column if not exists description text;
alter table public.products add column if not exists sample_path text;

alter table public.products add constraint products_type_check
  check (type in ('important-questions', 'case-studies', 'care-plans', 'assignments', 'flashcards'));
alter table public.products add constraint products_course_check
  check (course in ('bsc-nursing', 'gnm', 'post-basic'));
alter table public.products add constraint products_term_course_check
  check (term is null
         or (course = 'bsc-nursing' and term between 1 and 8)
         or (course = 'gnm' and term between 1 and 3)
         or (course = 'post-basic' and term between 1 and 2));

-- 3. Admin can manage products ---------------------------------------------
create policy "admin reads all products" on public.products
  for select to authenticated using (public.is_admin());
create policy "admin inserts products" on public.products
  for insert to authenticated with check (public.is_admin());
create policy "admin updates products" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes products" on public.products
  for delete to authenticated using (public.is_admin());

-- 4. File storage: private bucket, PDFs only, 50 MB each ------------------------
update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array['application/pdf']
 where id = 'notes';

create policy "admin manages note files" on storage.objects
  for all to authenticated
  using (bucket_id = 'notes' and public.is_admin())
  with check (bucket_id = 'notes' and public.is_admin());

-- Buyers can open the PDF of a product they have paid for.
create policy "buyers read paid files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'notes'
    and exists (
      select 1
        from public.products p
        join public.purchases pu on pu.product_id = p.id
       where pu.user_id = (select auth.uid())
         and pu.status = 'paid'
         and p.file_path = storage.objects.name
    )
  );

-- Anyone can open the free sample of a published product.
create policy "anyone reads published samples" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'notes'
    and exists (
      select 1 from public.products p
       where p.published and p.sample_path = storage.objects.name
    )
  );
