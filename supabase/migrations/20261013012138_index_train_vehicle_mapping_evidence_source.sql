create index if not exists train_timetable_vehicle_mappings_source_idx on public.train_timetable_vehicle_mappings(source_id) where source_id is not null;
