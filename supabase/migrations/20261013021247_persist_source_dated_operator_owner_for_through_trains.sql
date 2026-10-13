
alter table public.train_timetable_operation_evidence
 add column if not exists curated_owner_id bigint references public.curated_operation_owners(id) on delete set null;
create index if not exists train_timetable_operation_evidence_owner_idx
 on public.train_timetable_operation_evidence(curated_owner_id) where curated_owner_id is not null;
comment on column public.train_timetable_operation_evidence.curated_owner_id is
'Published operator-owner for exact train operation and calendar, not an observed vehicle or formation.';

do $patch$
declare original text; patched text; block text;
begin
  select pg_get_functiondef('public.refresh_train_timetable_operation_evidence(text,text)'::regprocedure) into original;
  block:=$body$
  with eligible as (
    select ev.timetable_id,own.id owner_id
    from public.train_timetable_operation_evidence ev
    join public.train_operation_mappings om on om.id=ev.operation_mapping_id
    join public.curated_operation_owners own
      on own.network_key=om.network_key
     and own.operation_code=om.operation_code
     and own.calendar_type=ev.calendar_type
     and own.effective_from=ev.source_revision_date
     and own.owner_operator is not null
     and own.source_url is not null
    join public.manual_timetable_templates t on t.id=ev.source_template_id
    where (p_line_id is null or t.line_key=p_line_id)
      and (p_calendar_urn is null or t.calendar_urn=p_calendar_urn)
  ), unique_owner as (
    select timetable_id,max(owner_id) owner_id from eligible
    group by timetable_id having count(*)=1
  )
  update public.train_timetable_operation_evidence ev
  set curated_owner_id=uo.owner_id
  from unique_owner uo
  where ev.timetable_id=uo.timetable_id
    and ev.curated_owner_id is distinct from uo.owner_id;
$body$;
  patched:=replace(original,E'\nend;\n$function$\n',E'\n'||block||E'end;\n$function$\n');
  if patched=original or position('unique_owner as' in patched)=0 then
    raise exception 'refresh hook missing';end if;
  execute patched;
end;
$patch$;
select public.refresh_train_timetable_operation_evidence('TokyuToyoko',null);

create or replace view public.train_timetable_source_resolution
with (security_invoker=true) as
select m.source_template_id,m.timetable_id,m.member_role,tt.group_evidence,
tt.timetable_validity,vm.vehicle_type,
coalesce(vm.mapping_level,'unresolved') mapping_level,
vm.source_id vehicle_source_id,vm.source_path vehicle_source_path,
coalesce(vown.source_url,es.source_url) vehicle_source_url,
vm.timetable_revision_date vehicle_revision_date,
art.image_path vehicle_artwork_path,
op.operation_code,op.source_id operation_source_id,
op.source_revision_date operation_revision_date,
own.owner_operator operation_owner,
own.source_url operation_owner_source_url
from public.train_timetable_members m
join public.train_timetables tt on tt.id=m.timetable_id
left join public.train_timetable_vehicle_mappings vm on vm.timetable_id=m.timetable_id
left join public.evidence_sources es on es.id=vm.source_id
left join public.curated_operation_owners vown on vown.id=vm.operation_owner_id
left join public.train_timetable_vehicle_artwork art on art.timetable_id=m.timetable_id
left join public.train_timetable_operation_evidence op on op.timetable_id=m.timetable_id
left join public.curated_operation_owners own on own.id=op.curated_owner_id;
revoke all on public.train_timetable_source_resolution from anon,authenticated;
grant select on public.train_timetable_source_resolution to service_role;

