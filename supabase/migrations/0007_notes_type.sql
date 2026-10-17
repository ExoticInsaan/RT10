-- Adds the "notes" resource type. Keep in sync with lib/catalog-config.ts.
alter table public.products drop constraint if exists products_type_check;
alter table public.products add constraint products_type_check
  check (type in ('important-questions', 'care-plans', 'case-studies', 'flashcards', 'notes', 'assignments'));
