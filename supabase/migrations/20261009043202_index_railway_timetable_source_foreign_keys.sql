create index if not exists service_exceptions_source_id_idx on public.service_exceptions(source_id);
create index if not exists service_exceptions_train_run_id_idx on public.service_exceptions(train_run_id);
create index if not exists timetable_revisions_source_id_idx on public.timetable_revisions(source_id);
