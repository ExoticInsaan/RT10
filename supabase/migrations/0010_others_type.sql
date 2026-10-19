-- Adds the "others" resource type. Keep in sync with lib/catalog-config.ts.
-- (A resource's semester can already be empty: products.term allows null, shown as "None" in the admin page.)
alter table public.products drop constraint if exists products_type_check;
alter table public.products add constraint products_type_check
  check (type in ('important-questions', 'care-plans', 'case-studies', 'flashcards', 'notes', 'assignments', 'others'));
