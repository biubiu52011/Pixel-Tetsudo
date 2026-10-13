
create or replace function public.refresh_train_timetable_vehicle_mappings(
 p_line_id text default null, p_calendar_urn text default null)
returns void language plpgsql security invoker set search_path = public as $$
begin
 with targets as (
   select distinct m.timetable_id from public.train_timetable_members m
   join public.manual_timetable_templates t on t.id=m.source_template_id
   where (p_line_id is null or t.line_key=p_line_id)
     and (p_calendar_urn is null or t.calendar_urn=p_calendar_urn)
 ), matches as (
   select m.timetable_id,t.id template_id,t.source_revision_date,t.source_path,
          r.id rule_id,r.vehicle_type,r.source_id,r.effective_from,r.effective_to
   from targets tg join public.train_timetable_members m on m.timetable_id=tg.timetable_id
   join public.manual_timetable_templates t on t.id=m.source_template_id
   left join public.vehicle_network_key_aliases a on a.alias_key=t.line_key
   join public.train_vehicle_rules r
     on r.network_key=coalesce(a.canonical_network_key,t.line_key)
    and r.train_number=t.train_number
    and (r.calendar_type=(case
      when t.calendar_urn='odpt.Calendar:Weekday' then 'weekday'
      when t.calendar_urn='odpt.Calendar:SaturdayHoliday' then 'holiday'
      end) or r.calendar_type is null)
    and t.source_revision_date is not null
    and (r.effective_from is null or t.source_revision_date>=r.effective_from)
    and (r.effective_to is null or t.source_revision_date<=r.effective_to)
   where m.member_role<>'duplicate_itinerary'
 ), unique_type as (
   select timetable_id from matches group by timetable_id
   having count(distinct vehicle_type)=1
 ), ranked as (
   select m.*,row_number() over(partition by m.timetable_id
   order by m.effective_from desc nulls last,m.rule_id desc,m.template_id) rn
   from matches m join unique_type u using(timetable_id)
 )
 insert into public.train_timetable_vehicle_mappings
 (timetable_id,source_template_id,vehicle_type,mapping_level,vehicle_rule_id,
 source_id,source_path,timetable_revision_date,rule_effective_from,rule_effective_to)
 select timetable_id,template_id,vehicle_type,'dated_schedule_rule',rule_id,
 source_id,source_path,source_revision_date,effective_from,effective_to
 from ranked where rn=1 and nullif(btrim(vehicle_type),'') is not null
 and vehicle_type not like '%/%'
 on conflict(timetable_id) do update set
 source_template_id=excluded.source_template_id,
 vehicle_type=excluded.vehicle_type,
 mapping_level=excluded.mapping_level,
 vehicle_rule_id=excluded.vehicle_rule_id,
 source_id=excluded.source_id,
 source_path=excluded.source_path,
 timetable_revision_date=excluded.timetable_revision_date,
 rule_effective_from=excluded.rule_effective_from,
 rule_effective_to=excluded.rule_effective_to
 where public.train_timetable_vehicle_mappings.mapping_level='source_single_type_candidate';

 with targets as (
   select distinct m.timetable_id from public.train_timetable_members m
   join public.manual_timetable_templates t on t.id=m.source_template_id
   where (p_line_id is null or t.line_key=p_line_id)
     and (p_calendar_urn is null or t.calendar_urn=p_calendar_urn)
 ), candidate as (
   select m.timetable_id,m.source_template_id,btrim(t.vehicle_type_label) label,
   t.source_path,t.source_revision_date from targets tg
   join public.train_timetable_members m on m.timetable_id=tg.timetable_id
   join public.manual_timetable_templates t on t.id=m.source_template_id
   where m.member_role='primary'
     and nullif(btrim(t.vehicle_type_label),'') is not null
     and t.vehicle_type_label not like '%/%'
     and not exists (
       select 1 from public.train_timetable_members other
       join public.manual_timetable_templates t2 on t2.id=other.source_template_id
       where other.timetable_id=m.timetable_id and other.source_template_id<>m.source_template_id
         and t2.vehicle_type_label is distinct from t.vehicle_type_label
     )
 )
 insert into public.train_timetable_vehicle_mappings
 (timetable_id,source_template_id,vehicle_type,mapping_level,source_path,timetable_revision_date)
 select timetable_id,source_template_id,label,'source_single_type_candidate',source_path,source_revision_date
 from candidate on conflict(timetable_id) do nothing;
end;
$$;
revoke all on function public.refresh_train_timetable_vehicle_mappings(text,text) from public,anon,authenticated;
grant execute on function public.refresh_train_timetable_vehicle_mappings(text,text) to service_role;

