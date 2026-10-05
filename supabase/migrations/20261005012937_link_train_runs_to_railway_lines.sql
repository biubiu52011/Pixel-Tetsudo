alter table public.train_runs
  add column if not exists line_id varchar references public.railway_lines(id);

create index if not exists train_runs_line_service_date_idx
  on public.train_runs(line_id, service_date);

update public.train_runs
set line_id = 'Odawara'
where line_id is null and network_key = 'odakyu-main';
