
create or replace view public.train_timetable_vehicle_resolution
with (security_invoker=true)
as
select
 t.id as timetable_id,
 t.calendar_urn,
 t.primary_train_number,
 t.timetable_validity,
 m.vehicle_type,
 coalesce(m.mapping_level,'unresolved') as mapping_level,
 false as actual_vehicle_confirmed,
 m.timetable_revision_date,
 m.rule_effective_from,
 m.rule_effective_to,
 m.vehicle_rule_id,
 m.source_template_id,
 m.source_path,
 m.source_id,
 e.source_url,
 e.evidence_grade
from public.train_timetables t
left join public.train_timetable_vehicle_mappings m on m.timetable_id=t.id
left join public.evidence_sources e on e.id=m.source_id;
comment on view public.train_timetable_vehicle_resolution is
'Canonical train vehicle lookup: schedule-rule, single-label candidate or unresolved. None implies actual observed formation or exact PNG.';
revoke all on public.train_timetable_vehicle_resolution from anon,authenticated;
grant select on public.train_timetable_vehicle_resolution to service_role;

select public.refresh_train_timetable_vehicle_mappings(null,null);

