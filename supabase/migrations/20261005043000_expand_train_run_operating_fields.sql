alter table public.train_runs
  add column if not exists rail_direction text,
  add column if not exists train_type text,
  add column if not exists destination_station text;

comment on column public.train_runs.rail_direction is 'Canonical/source rail direction URN or key for this run.';
comment on column public.train_runs.train_type is 'Canonical/source train type URN or key for this run.';
comment on column public.train_runs.destination_station is 'Canonical/source destination station URN or key for this run.';
