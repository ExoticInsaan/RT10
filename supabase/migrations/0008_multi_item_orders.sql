-- One Razorpay order (and one payment) can now cover several resources: the cart checks out at once.
-- Each resource still gets its own purchases row, and the rows of one order share the same
-- gateway_order_id / gateway_payment_id, so those two columns are unique per resource instead of globally.
alter table public.purchases drop constraint if exists purchases_gateway_order_id_key;
alter table public.purchases drop constraint if exists purchases_gateway_payment_id_key;
alter table public.purchases add constraint purchases_order_product_key unique (gateway_order_id, product_id);
alter table public.purchases add constraint purchases_payment_product_key unique (gateway_payment_id, product_id);
create index if not exists purchases_gateway_order_id_idx on public.purchases (gateway_order_id);
create index if not exists purchases_gateway_payment_id_idx on public.purchases (gateway_payment_id);
