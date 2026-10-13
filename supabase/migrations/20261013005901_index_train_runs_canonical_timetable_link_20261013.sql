create index if not exists train_runs_canonical_timetable_id_idx on public.train_runs(canonical_timetable_id) where canonical_timetable_id is not null;
