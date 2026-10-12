set lock_timeout = '5s';
alter table public.railway_lines
  drop column if exists name_jp,
  drop column if exists name_en,
  drop column if exists code,
  drop column if exists color,
  drop column if exists operator,
  drop column if exists type,
  drop column if exists duration_total_min,
  drop column if exists branch_of,
  drop column if exists sub_name_jp,
  drop column if exists sub_name_en,
  drop column if exists icon;
comment on table public.railway_lines is
  'Runtime railway registry only. Canonical railway metadata and through-service topology live in the GitHub railway data archive.';
comment on column public.railway_lines.id is
  'Canonical GitHub railway line id used as runtime foreign-key identity.';
comment on column public.railway_lines.odpt_operator is
  'Runtime ODPT operator mapping; not canonical railway metadata.';
comment on column public.railway_lines.odpt_railway is
  'Runtime ODPT railway mapping; not canonical railway metadata.';
comment on column public.railway_lines.odpt_base_url is
  'Runtime ODPT API endpoint selector.';
