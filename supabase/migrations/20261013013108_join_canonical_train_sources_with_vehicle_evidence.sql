
create or replace view public.train_timetable_source_resolution
with (security_invoker = true)
as
select
 m.source_template_id,
 m.timetable_id,
 m.member_role,
 tt.group_evidence,
 tt.timetable_validity,
 map.vehicle_type,
 coalesce(map.mapping_level,'unresolved') as mapping_level,
 map.source_id as vehicle_source_id,
 map.source_path as vehicle_source_path,
 ev.source_url as vehicle_source_url,
 map.timetable_revision_date as vehicle_revision_date
from public.train_timetable_members m
join public.train_timetables tt on tt.id=m.timetable_id
left join public.train_timetable_vehicle_mappings map on map.timetable_id=m.timetable_id
left join public.evidence_sources ev on ev.id=map.source_id;
comment on view public.train_timetable_source_resolution is
'Source template ID to canonical train timetable and evidence-tiered vehicle mapping. Source candidate is NEVER observed actual fleet or exact artwork.';
revoke all on public.train_timetable_source_resolution from anon,authenticated;
grant select on public.train_timetable_source_resolution to service_role;
