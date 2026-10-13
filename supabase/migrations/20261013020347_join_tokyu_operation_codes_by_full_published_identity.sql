
create or replace function public.refresh_train_timetable_operation_evidence(
 p_line_id text default null, p_calendar_urn text default null)
returns void language plpgsql security invoker set search_path=public as $fn$
begin
 with source as (
 select m.timetable_id,m.source_template_id,t.train_number,t.calendar_urn,t.source_revision_date,
 case when t.calendar_urn='odpt.Calendar:Weekday' then 'weekday'
 when t.calendar_urn='odpt.Calendar:SaturdayHoliday' then 'holiday' end cal,
 left(t.train_number,3)||'-'||right(t.train_number,3) expanded
 from public.train_timetable_members m
 join public.manual_timetable_templates t on t.id=m.source_template_id
 join public.train_timetables tt on tt.id=m.timetable_id
 where t.line_key='TokyuToyoko' and t.train_number ~ '^[0-9]{6}$'
 and t.source_revision_date is not null and tt.group_evidence='source_only'
 and m.member_role='primary'
 and (p_line_id is null or p_line_id=t.line_key)
 and (p_calendar_urn is null or p_calendar_urn=t.calendar_urn)
 ), matches as (
 select s.*,om.id op_id,om.operation_code,om.source_id
 from source s join public.train_operation_mappings om
 on om.network_key='toyoko-fukutoshin' and om.train_number=s.expanded
 and om.calendar_type=s.cal and om.effective_from=s.source_revision_date
 where s.cal is not null
 ), unique_matches as (
 select timetable_id from matches group by timetable_id
 having count(*)=1 and count(distinct operation_code)=1
 )
 insert into public.train_timetable_operation_evidence
 (timetable_id,source_template_id,operation_mapping_id,operation_code,calendar_type,source_revision_date,match_format,source_id)
 select m.timetable_id,m.source_template_id,m.op_id,m.operation_code,m.cal,m.source_revision_date,
 'tokyu_toyoko_compact_six',m.source_id
 from matches m join unique_matches u using(timetable_id)
 on conflict(timetable_id) do update set
 source_template_id=excluded.source_template_id,operation_mapping_id=excluded.operation_mapping_id,
 operation_code=excluded.operation_code,calendar_type=excluded.calendar_type,
 source_revision_date=excluded.source_revision_date,match_format=excluded.match_format,source_id=excluded.source_id
 where public.train_timetable_operation_evidence.source_template_id=excluded.source_template_id;
end;
$fn$;
revoke all on function public.refresh_train_timetable_operation_evidence(text,text) from public,anon,authenticated;
grant execute on function public.refresh_train_timetable_operation_evidence(text,text) to service_role;
select public.refresh_train_timetable_operation_evidence(null,null);

