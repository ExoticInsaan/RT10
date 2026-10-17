-- Cover pictures: the first page of each PDF, shown to everyone in the shop.
alter table public.products add column if not exists cover_path text;

-- Public bucket (anyone can see a cover). Only the server, using the service role, writes to it.
-- No listing policy is added, so the folder contents cannot be browsed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 2097152, array['image/webp'])
on conflict (id) do nothing;

-- The admin page can delete a cover when a resource is deleted.
create policy "admin manages covers" on storage.objects
  for all to authenticated
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());
