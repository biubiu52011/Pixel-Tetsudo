
create or replace view public.train_timetable_stops
with (security_invoker = true)
as
select
  m.timetable_id,
  (m.stop_offset + s.stop_sequence - m.first_stop_sequence - case when m.merge_first_stop then 1 else 0 end)::integer as stop_sequence,
  coalesce(s.arrival_station_urn,s.departure_station_urn) as station_urn,
  s.arrival_station_urn,
  s.departure_station_urn,
  s.arrival_clock,
  coalesce(s.departure_clock,
    case when s.stop_sequence=m.last_stop_sequence then boundary.departure_clock end
  ) as departure_clock,
  m.source_template_id,
  t.line_key,
  t.railway_urn,
  t.train_number,
  t.direction_urn,
  t.train_type_urn,
  t.source_revision_date
from public.train_timetable_members m
join public.manual_timetable_template_stops s
  on s.template_id=m.source_template_id
join public.manual_timetable_templates t
  on t.id=m.source_template_id
left join public.train_timetable_members next_member
  on next_member.timetable_id=m.timetable_id
  and next_member.segment_order=m.segment_order+1
  and next_member.merge_first_stop
left join public.manual_timetable_template_stops boundary
  on boundary.template_id=next_member.source_template_id
  and boundary.stop_sequence=next_member.first_stop_sequence
where m.member_role<>'duplicate_itinerary'
  and not (m.merge_first_stop and s.stop_sequence=m.first_stop_sequence);
comment on view public.train_timetable_stops is 'Full ordered stop sequence by canonical train timetable, using persisted verified continuity and exact source clocks. Not realtime; no runtime through-service guessing.';

create or replace view public.train_timetable_lines
with (security_invoker = true)
as
select distinct
 m.timetable_id,
 t.line_key,
 tt.calendar_urn,
 tt.primary_train_number,
 tt.group_evidence,
 tt.timetable_validity,
 tt.source_revision_date
from public.train_timetable_members m
join public.manual_timetable_templates t on t.id=m.source_template_id
join public.train_timetables tt on tt.id=m.timetable_id;
comment on view public.train_timetable_lines is 'Read-only railway timetable projection generated from canonical train-first schedules; source line does not define train identity.';

alter table public.train_runs
  add column if not exists canonical_timetable_id bigint references public.train_timetables(id);
comment on column public.train_runs.canonical_timetable_id is 'Optional verified link from date-specific runtime train to canonical timetable; never fill from train number alone.';

revoke all on public.train_timetable_stops, public.train_timetable_lines from anon,authenticated;
grant select on public.train_timetable_stops, public.train_timetable_lines to service_role;

