-- A student keeps access to anything they have paid for, even if the admin later unpublishes it
-- (for example to fix a typo). Without this, the product row disappears from their library.
-- Safe to run twice.
drop policy if exists "buyers read bought products" on public.products;
create policy "buyers read bought products"
  on public.products
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.purchases pu
       where pu.product_id = products.id
         and pu.user_id = (select auth.uid())
         and pu.status = 'paid'
    )
  );
