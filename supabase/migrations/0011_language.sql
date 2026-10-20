-- Adds the language of a resource: Hindi Medium, English Medium or Hinglish.
-- Keep in sync with lib/catalog-config.ts. Older resources stay empty (nothing is shown on their page)
-- until you open them in the admin page, pick a language and save.
alter table public.products add column if not exists language text;
alter table public.products drop constraint if exists products_language_check;
alter table public.products add constraint products_language_check
  check (language is null or language in ('hindi', 'english', 'hinglish'));
