-- Free resources: a resource with price 0 is "Free". Before this, products.price had to be above 0.
-- Students get a free resource into My Library with one click: the server saves a purchases row
-- with status 'paid' and amount 0 (see app/api/claim/route.ts). Nothing else changes.
alter table public.products drop constraint if exists products_price_check;
alter table public.products add constraint products_price_check check (price >= 0);
