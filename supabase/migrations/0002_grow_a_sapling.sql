-- Let Grow a Sapling keep the garden (streak, trees, names) in the signed-in account (applied to the live project).
alter table public.user_tool_data drop constraint user_tool_data_tool_id_check;
alter table public.user_tool_data add constraint user_tool_data_tool_id_check
  check (tool_id in ('flashcard-maker', 'reminder', 'days-countdown', 'grow-a-sapling'));
