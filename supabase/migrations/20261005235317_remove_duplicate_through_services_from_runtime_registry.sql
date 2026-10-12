set lock_timeout = '5s';
alter table public.railway_lines
  drop column if exists through_services;
