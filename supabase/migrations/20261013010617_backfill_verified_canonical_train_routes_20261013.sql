
with raw as (
 select t.id from_id,t.source_trip_id from_ref,t.calendar_urn cal,t.source_revision_date from_revision,
        unnest(t.next_timetable_ids) next_ref
 from public.manual_timetable_templates t
 where cardinality(t.next_timetable_ids)>0 and t.source_trip_id is not null
), evidence as (
 select a.from_id,b.id to_id,af.arrival_station_urn junction_station,
        af.arrival_clock arrive,bl.departure_clock depart,
 case when af.arrival_clock ~ '^[0-9]{1,2}:[0-9]{2}$'
           and bl.departure_clock ~ '^[0-9]{1,2}:[0-9]{2}$'
 then (split_part(bl.departure_clock,':',1)::int*60+split_part(bl.departure_clock,':',2)::int)
      -(split_part(af.arrival_clock,':',1)::int*60+split_part(af.arrival_clock,':',2)::int)
 end delta
 from raw a join public.manual_timetable_templates b
   on b.calendar_urn=a.cal and b.source_trip_id=a.next_ref
  and b.previous_timetable_ids @> array[a.from_ref]
  and b.source_revision_date is not distinct from a.from_revision
 cross join lateral (select * from public.manual_timetable_template_stops
   where template_id=a.from_id order by stop_sequence desc limit 1) af
 cross join lateral (select * from public.manual_timetable_template_stops
   where template_id=b.id order by stop_sequence limit 1) bl
 where a.from_id<>b.id
 and af.arrival_station_urn=bl.departure_station_urn and af.arrival_station_urn is not null
 and af.arrival_clock is not null and bl.departure_clock is not null
)
insert into public.train_timetable_continuity
(from_template_id,to_template_id,junction_station_urn,arrival_clock,departure_clock,connection_minutes,evidence)
select from_id,to_id,junction_station,arrive,depart,delta,'reciprocal_source_ids_station_time_revision'
from evidence where delta between 0 and 30
on conflict(from_template_id) do nothing;

with recursive chain as (
 select c.from_template_id root_id,c.from_template_id template_id,0 depth,array[c.from_template_id] seen
 from public.train_timetable_continuity c where not exists (
   select 1 from public.train_timetable_continuity prev
   where prev.to_template_id=c.from_template_id)
 union all
 select w.root_id,c.to_template_id,w.depth+1,w.seen||c.to_template_id
 from chain w join public.train_timetable_continuity c
   on c.from_template_id=w.template_id
 where not c.to_template_id=any(w.seen) and w.depth<30
), grouped as (
 select t.id,t.calendar_urn,t.train_number,t.source_revision_date,
 case when c.root_id is not null then 'continuation:'||c.root_id::text
      when t.physical_service_key is not null then t.physical_service_key
      else 'source:'||t.id::text end canonical_key,
 case when c.root_id is not null then 'verified_continuation'
      when t.physical_service_key is not null then 'verified_shared_itinerary'
      else 'source_only' end group_evidence,
 coalesce(c.depth,0) sequence_in_group
 from public.manual_timetable_templates t left join chain c on c.template_id=t.id
), representative as (
 select distinct on(canonical_key)
 canonical_key,calendar_urn,train_number,id,group_evidence,source_revision_date
 from grouped order by canonical_key,sequence_in_group,id
)
insert into public.train_timetables
(canonical_key,calendar_urn,primary_train_number,lead_source_template_id,group_evidence,source_revision_date)
select canonical_key,calendar_urn,train_number,id,group_evidence,source_revision_date
from representative
on conflict(canonical_key) do nothing;

with recursive chain as (
 select c.from_template_id root_id,c.from_template_id template_id,0 depth,array[c.from_template_id] seen
 from public.train_timetable_continuity c where not exists (
  select 1 from public.train_timetable_continuity p where p.to_template_id=c.from_template_id)
 union all
 select w.root_id,c.to_template_id,w.depth+1,w.seen||c.to_template_id
 from chain w join public.train_timetable_continuity c
 on c.from_template_id=w.template_id
 where not c.to_template_id=any(w.seen) and w.depth<30
), stop_stats as (
 select template_id,min(stop_sequence) first_stop,max(stop_sequence) last_stop,count(*)::int stop_count
 from public.manual_timetable_template_stops group by template_id
), member_base as (
 select t.id source_template_id,tt.id timetable_id,coalesce(c.depth,0) segment_order,
 case when c.depth>0 then 'verified_continuation'
      when tt.lead_source_template_id<>t.id then 'duplicate_itinerary'
      else 'primary' end member_role,
 ss.first_stop,ss.last_stop,ss.stop_count
 from public.manual_timetable_templates t
 left join chain c on c.template_id=t.id
 join public.train_timetables tt on tt.canonical_key=
 (case when c.root_id is not null then 'continuation:'||c.root_id::text
       when t.physical_service_key is not null then t.physical_service_key
       else 'source:'||t.id::text end)
 join stop_stats ss on ss.template_id=t.id
), member_ordered as (
 select *,
 coalesce(sum(
   case when member_role='duplicate_itinerary' then 0
        when member_role='verified_continuation' then stop_count-1
        else stop_count end)
 over (partition by timetable_id order by segment_order,source_template_id
       rows between unbounded preceding and 1 preceding),0)::int stop_offset
 from member_base
)
insert into public.train_timetable_members
(source_template_id,timetable_id,segment_order,member_role,first_stop_sequence,last_stop_sequence,stop_offset,merge_first_stop)
select source_template_id,timetable_id,segment_order,member_role,
       first_stop,last_stop,stop_offset,member_role='verified_continuation'
from member_ordered
on conflict(source_template_id) do nothing;

update public.train_timetables tt set group_evidence='source_only'
where tt.group_evidence='verified_shared_itinerary'
  and not exists (
  select 1 from public.train_timetable_members m
  where m.timetable_id=tt.id and m.member_role='duplicate_itinerary'
);

do $validate$
begin
 if exists (
  select 1 from public.manual_timetable_templates t
  left join public.train_timetable_members m on m.source_template_id=t.id
  where m.source_template_id is null
 ) then raise exception 'CANONICAL_BACKFILL_HAS_UNMAPPED_SOURCE'; end if;
end;
$validate$;
