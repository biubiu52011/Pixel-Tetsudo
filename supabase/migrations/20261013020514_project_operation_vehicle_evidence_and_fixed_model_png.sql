
create or replace view public.train_timetable_vehicle_artwork
with (security_invoker=true) as
with resolved as (
select m.timetable_id,m.vehicle_type,m.mapping_level,
  coalesce(alias2.canonical_vehicle_type,alias1.canonical_vehicle_type,m.vehicle_type) exact_model,
  coalesce(r.operator,own.owner_operator) actual_operator
from public.train_timetable_vehicle_mappings m
left join public.train_vehicle_rules r on r.id=m.vehicle_rule_id
left join public.curated_operation_owners own on own.id=m.operation_owner_id
left join public.vehicle_type_aliases alias1 on alias1.alias=m.vehicle_type
left join public.vehicle_type_aliases alias2 on alias2.alias=alias1.canonical_vehicle_type
where m.mapping_level in ('dated_schedule_rule','dated_operation_owner')
), matched as (
select v.timetable_id,v.vehicle_type,a.id asset_id,a.image_path,a.operator,a.asset_scope
from resolved v join public.vehicle_image_assets a
on a.operator=v.actual_operator
and (case when a.asset_scope='subseries' then a.vehicle_type||coalesce(a.subseries,'') else a.vehicle_type end)=v.exact_model
where a.asset_status='available' and a.file_format_status='native_png'
and a.appearance_class='standard_or_fixed_livery'
and a.formation_id is null and a.theme is null
and (
(a.asset_scope='generic' and a.is_generic=true and a.livery is null)
or (a.asset_scope='subseries' and a.subseries is not null and a.livery is null)
or (a.asset_scope='theme' and a.livery is not null)
)
and a.image_path like 'images/列车/%.png'
), unique_assets as (
select timetable_id from matched group by timetable_id having count(distinct asset_id)=1
)
select m.timetable_id,m.vehicle_type,m.image_path,m.asset_scope,m.operator,
'model_specific_existing_native_png'::text as artwork_evidence
from matched m join unique_assets u using(timetable_id);
comment on view public.train_timetable_vehicle_artwork is
'Unique operator-qualified, model-correct native PNG for dated scheduled operation evidence; fixed standard livery allowed, no speculative formation or temporary wrapping.';
revoke all on public.train_timetable_vehicle_artwork from anon,authenticated;
grant select on public.train_timetable_vehicle_artwork to service_role;

create or replace view public.train_timetable_source_resolution
with (security_invoker = true) as
select
m.source_template_id,m.timetable_id,m.member_role,
tt.group_evidence,tt.timetable_validity,
vm.vehicle_type,coalesce(vm.mapping_level,'unresolved') as mapping_level,
vm.source_id as vehicle_source_id,
vm.source_path as vehicle_source_path,
coalesce(own.source_url,es.source_url) as vehicle_source_url,
vm.timetable_revision_date as vehicle_revision_date,
art.image_path as vehicle_artwork_path,
op.operation_code as operation_code,
op.source_id as operation_source_id,
op.source_revision_date as operation_revision_date
from public.train_timetable_members m
join public.train_timetables tt on tt.id=m.timetable_id
left join public.train_timetable_vehicle_mappings vm on vm.timetable_id=m.timetable_id
left join public.evidence_sources es on es.id=vm.source_id
left join public.curated_operation_owners own on own.id=vm.operation_owner_id
left join public.train_timetable_vehicle_artwork art on art.timetable_id=m.timetable_id
left join public.train_timetable_operation_evidence op on op.timetable_id=m.timetable_id;
comment on view public.train_timetable_source_resolution is
'Canonical source-to-train identity, evidence-tiered planned vehicle, exact native image, and unique published operation. None asserts observed carset.';
revoke all on public.train_timetable_source_resolution from anon,authenticated;
grant select on public.train_timetable_source_resolution to service_role;

create or replace view public.train_timetable_vehicle_resolution
with (security_invoker=true) as
select t.id as timetable_id,t.calendar_urn,t.primary_train_number,t.timetable_validity,
 m.vehicle_type,coalesce(m.mapping_level,'unresolved') as mapping_level,
 false as actual_vehicle_confirmed,
 m.timetable_revision_date,m.rule_effective_from,m.rule_effective_to,
 m.vehicle_rule_id,m.source_template_id,m.source_path,m.source_id,
 coalesce(own.source_url,e.source_url) source_url,e.evidence_grade,
 op.operation_code,art.image_path as vehicle_artwork_path
from public.train_timetables t
left join public.train_timetable_vehicle_mappings m on m.timetable_id=t.id
left join public.curated_operation_owners own on own.id=m.operation_owner_id
left join public.evidence_sources e on e.id=m.source_id
left join public.train_timetable_operation_evidence op on op.timetable_id=t.id
left join public.train_timetable_vehicle_artwork art on art.timetable_id=t.id;
comment on view public.train_timetable_vehicle_resolution is
'One canonical train vehicle lookup, separating planned dated operation type from source candidate and observed carset.';
revoke all on public.train_timetable_vehicle_resolution from anon,authenticated;
grant select on public.train_timetable_vehicle_resolution to service_role;

