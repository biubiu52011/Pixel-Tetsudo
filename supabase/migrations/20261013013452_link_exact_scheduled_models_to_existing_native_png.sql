
create or replace view public.train_timetable_vehicle_artwork
with (security_invoker=true) as
with canonical as (
  select m.timetable_id,m.vehicle_type,m.mapping_level,
         coalesce(alias.canonical_vehicle_type,m.vehicle_type) as exact_model
  from public.train_timetable_vehicle_mappings m
  left join public.vehicle_type_aliases alias on alias.alias=m.vehicle_type
  where m.mapping_level='dated_schedule_rule'
), matching as (
 select c.timetable_id,c.vehicle_type,a.id asset_id,a.image_path,
        a.operator,a.asset_scope
 from canonical c join public.vehicle_image_assets a
 on (case when a.asset_scope='subseries'
          then a.vehicle_type||coalesce(a.subseries,'')
          else a.vehicle_type end)=c.exact_model
 where a.asset_status='available' and a.file_format_status='native_png'
   and a.appearance_class='standard_or_fixed_livery'
   and ((a.asset_scope='generic' and a.is_generic=true and a.formation_id is null
         and a.theme is null and a.livery is null)
     or (a.asset_scope='subseries' and a.subseries is not null
         and a.formation_id is null and a.theme is null and a.livery is null))
   and a.image_path like 'images/列车/%.png'
), unambiguous as (
 select timetable_id from matching group by timetable_id
 having count(distinct asset_id)=1
)
select m.timetable_id,m.vehicle_type,m.image_path,m.asset_scope,m.operator,
       'model_specific_existing_native_png'::text as artwork_evidence
from matching m join unambiguous u on u.timetable_id=m.timetable_id;
comment on view public.train_timetable_vehicle_artwork is
'Only unique model-exact native PNG for source-dated scheduled vehicle type; not an actual observed carset or special livery.';
revoke all on public.train_timetable_vehicle_artwork from anon,authenticated;
grant select on public.train_timetable_vehicle_artwork to service_role;

create or replace view public.train_timetable_source_resolution
with (security_invoker = true) as
select m.source_template_id,m.timetable_id,m.member_role,
       tt.group_evidence,tt.timetable_validity,
       vm.vehicle_type,
       coalesce(vm.mapping_level,'unresolved') as mapping_level,
       vm.source_id as vehicle_source_id,
       vm.source_path as vehicle_source_path,
       es.source_url as vehicle_source_url,
       vm.timetable_revision_date as vehicle_revision_date,
       art.image_path as vehicle_artwork_path
from public.train_timetable_members m
join public.train_timetables tt on tt.id=m.timetable_id
left join public.train_timetable_vehicle_mappings vm on vm.timetable_id=m.timetable_id
left join public.evidence_sources es on es.id=vm.source_id
left join public.train_timetable_vehicle_artwork art on art.timetable_id=m.timetable_id;
revoke all on public.train_timetable_source_resolution from anon,authenticated;
grant select on public.train_timetable_source_resolution to service_role;

