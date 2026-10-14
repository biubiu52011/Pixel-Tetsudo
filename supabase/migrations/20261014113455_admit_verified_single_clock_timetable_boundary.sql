-- Single-clock evidence retains the one published boundary time and its timed source brackets.
alter table public.train_timetable_continuity drop constraint train_timetable_continuity_evidence_check;
alter table public.train_timetable_continuity add constraint train_timetable_continuity_evidence_check check (
 (evidence='reciprocal_source_ids_station_time_revision' and arrival_clock is not null and departure_clock is not null and connection_minutes is not null)
 or (evidence='reciprocal_source_ids_passing_station_revision' and arrival_clock is null and departure_clock is null and connection_minutes is null and bracket_departure_clock is not null and bracket_arrival_clock is not null)
 or (evidence='reciprocal_source_ids_single_boundary_clock_revision' and ((arrival_clock is null) <> (departure_clock is null)) and connection_minutes is null and bracket_departure_clock is not null and bracket_arrival_clock is not null));
