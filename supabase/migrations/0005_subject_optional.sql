-- The admin page no longer asks for a subject, and the shop no longer uses it.
-- The column stays (older rows keep their value) but is now optional.
alter table public.products alter column subject drop not null;
