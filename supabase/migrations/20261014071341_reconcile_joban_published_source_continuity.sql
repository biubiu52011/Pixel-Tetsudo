-- Reciprocal published source links, same calendar/revision and physical Toride
-- junction. Passing services retain NULL junction clocks; timed brackets are
-- source facts, never fabricated station passage times.
alter table public.train_timetable_continuity alter column arrival_clock drop not null;
alter table public.train_timetable_continuity alter column departure_clock drop not null;
alter table public.train_timetable_continuity alter column connection_minutes drop not null;
alter table public.train_timetable_continuity add column if not exists bracket_departure_clock text;
alter table public.train_timetable_continuity add column if not exists bracket_arrival_clock text;
alter table public.train_timetable_continuity drop constraint train_timetable_continuity_evidence_check;
alter table public.train_timetable_continuity add constraint train_timetable_continuity_evidence_check check (
 (evidence='reciprocal_source_ids_station_time_revision' and arrival_clock is not null and departure_clock is not null and connection_minutes is not null)
 or (evidence='reciprocal_source_ids_passing_station_revision' and arrival_clock is null and departure_clock is null and connection_minutes is null and bracket_departure_clock is not null and bracket_arrival_clock is not null));

create or replace function public.refresh_joban_source_continuity() returns void language plpgsql set search_path=public as $fn$
begin
with pairs as (
 select a.id from_id,b.id to_id,coalesce(af.arrival_station_urn,af.departure_station_urn) junction,
 af.arrival_clock arrive,bl.departure_clock depart,
 atime.departure_clock bracket_depart, btime.arrival_clock bracket_arrive
 from manual_timetable_templates a join manual_timetable_templates b
 on b.source_trip_id=any(a.next_timetable_ids) and a.source_trip_id=any(b.previous_timetable_ids)
 and a.calendar_urn=b.calendar_urn and a.source_revision_date is not distinct from b.source_revision_date
 cross join lateral (select * from manual_timetable_template_stops where template_id=a.id order by stop_sequence desc limit 1) af
 cross join lateral (select * from manual_timetable_template_stops where template_id=b.id order by stop_sequence limit 1) bl
 left join lateral (select departure_clock from manual_timetable_template_stops where template_id=a.id and departure_clock is not null order by stop_sequence desc limit 1) atime on true
 left join lateral (select arrival_clock from manual_timetable_template_stops where template_id=b.id and arrival_clock is not null order by stop_sequence limit 1) btime on true
 where ((a.line_key='Joban' and b.line_key='JobanMain') or (a.line_key='JobanMain' and b.line_key='Joban'))
 and a.train_number=b.train_number and a.direction_urn=b.direction_urn
 and coalesce(af.arrival_station_urn,af.departure_station_urn) in ('odpt.Station:JR-East.JobanRapid.Toride','odpt.Station:JR-East.Joban.Toride')
 and coalesce(bl.departure_station_urn,bl.arrival_station_urn) in ('odpt.Station:JR-East.JobanRapid.Toride','odpt.Station:JR-East.Joban.Toride')
), verified as (
 select *,case when arrive is not null and depart is not null then
 (split_part(depart,':',1)::int*60+split_part(depart,':',2)::int)-(split_part(arrive,':',1)::int*60+split_part(arrive,':',2)::int) end delta
 from pairs
 where (arrive ~ '^[0-9]{1,2}:[0-9]{2}$' and depart ~ '^[0-9]{1,2}:[0-9]{2}$')
 or (arrive is null and depart is null and bracket_depart ~ '^[0-9]{1,2}:[0-9]{2}$' and bracket_arrive ~ '^[0-9]{1,2}:[0-9]{2}$'
 and (split_part(bracket_arrive,':',1)::int*60+split_part(bracket_arrive,':',2)::int)-(split_part(bracket_depart,':',1)::int*60+split_part(bracket_depart,':',2)::int) between 1 and 180)
)
insert into train_timetable_continuity(from_template_id,to_template_id,junction_station_urn,arrival_clock,departure_clock,connection_minutes,evidence,bracket_departure_clock,bracket_arrival_clock)
select from_id,to_id,junction,arrive,depart,delta,
case when delta is null then 'reciprocal_source_ids_passing_station_revision' else 'reciprocal_source_ids_station_time_revision' end,
case when delta is null then bracket_depart end,case when delta is null then bracket_arrive end
from verified where delta between 0 and 30 or delta is null
on conflict(from_template_id) do nothing;

-- Each published Joban pair is one physical run. Reuse the existing root
-- canonical identity so runtime references survive metadata reconciliation.
with pairs as (
 select c.*,m.timetable_id,a.calendar_urn,a.train_number,a.source_revision_date
 from train_timetable_continuity c join manual_timetable_templates a on a.id=c.from_template_id
 join manual_timetable_templates b on b.id=c.to_template_id
 join train_timetable_members m on m.source_template_id=a.id
 where ((a.line_key='Joban' and b.line_key='JobanMain') or (a.line_key='JobanMain' and b.line_key='Joban'))
)
update train_timetables t set group_evidence='verified_continuation',lead_source_template_id=p.from_template_id
from pairs p where t.id=p.timetable_id;

with pairs as (
 select c.*,m.timetable_id from train_timetable_continuity c
 join manual_timetable_templates a on a.id=c.from_template_id
 join manual_timetable_templates b on b.id=c.to_template_id
 join train_timetable_members m on m.source_template_id=a.id
 where ((a.line_key='Joban' and b.line_key='JobanMain') or (a.line_key='JobanMain' and b.line_key='Joban'))
), ordered as (
 select p.*,s.n from pairs p cross join lateral (select count(*)::int n from manual_timetable_template_stops where template_id=p.from_template_id) s
)
update train_timetable_members m set timetable_id=p.timetable_id,
 segment_order=case when m.source_template_id=p.from_template_id then 0 else 1 end,
 member_role=case when m.source_template_id=p.from_template_id then 'primary' else 'verified_continuation' end,
 stop_offset=case when m.source_template_id=p.from_template_id then 0 else p.n end,
 merge_first_stop=m.source_template_id=p.to_template_id
from ordered p where m.source_template_id in (p.from_template_id,p.to_template_id);
end;
$fn$;
select public.refresh_joban_source_continuity();


CREATE OR REPLACE FUNCTION public.sync_canonical_train_timetables(p_line_id text, p_calendar_urn text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  -- The importer has already atomically replaced source rows and their stops.
  -- Preserve old canonical IDs still used by other member sources or runtime runs.
  delete from public.train_timetables tt
  where not exists (select 1 from public.train_timetable_members m where m.timetable_id=tt.id)
    and not exists (select 1 from public.train_runs r where r.canonical_timetable_id=tt.id);

  with candidates as (
    select t.*,
      coalesce(t.physical_service_key, 'source:'||t.id::text) as new_key
    from public.manual_timetable_templates t
    where t.line_key=p_line_id and t.calendar_urn=p_calendar_urn
      and not exists (select 1 from public.train_timetable_members m where m.source_template_id=t.id)
  ), primary_sources as (
    select distinct on(new_key) new_key,calendar_urn,train_number,id,source_revision_date
    from candidates order by new_key,id
  )
  insert into public.train_timetables
    (canonical_key,calendar_urn,primary_train_number,lead_source_template_id,group_evidence,source_revision_date)
  select new_key,calendar_urn,train_number,id,
    'source_only',source_revision_date
  from primary_sources
  on conflict(canonical_key) do nothing;

  insert into public.train_timetable_members
    (source_template_id,timetable_id,segment_order,member_role,first_stop_sequence,last_stop_sequence,stop_offset,merge_first_stop)
  select t.id,tt.id,0,
      case when tt.lead_source_template_id=t.id then 'primary' else 'duplicate_itinerary' end,
      min(s.stop_sequence),max(s.stop_sequence),0,false
  from public.manual_timetable_templates t
  join public.train_timetables tt
    on tt.canonical_key=coalesce(t.physical_service_key,'source:'||t.id::text)
  join public.manual_timetable_template_stops s on s.template_id=t.id
  where t.line_key=p_line_id and t.calendar_urn=p_calendar_urn
    and not exists(select 1 from public.train_timetable_members m where m.source_template_id=t.id)
  group by t.id,tt.id,tt.lead_source_template_id
  on conflict(source_template_id) do nothing;

  -- If replacement removed a representative source, select a surviving one.
  update public.train_timetables tt
  set lead_source_template_id = n.source_template_id,
      primary_train_number = src.train_number,
      calendar_urn = src.calendar_urn,
      source_revision_date = src.source_revision_date
  from (
    select m.timetable_id, min(m.source_template_id) source_template_id
    from public.train_timetable_members m group by m.timetable_id
  ) n
  join public.manual_timetable_templates src on src.id=n.source_template_id
  where tt.id=n.timetable_id and
    (tt.lead_source_template_id is null or not exists (
      select 1 from public.train_timetable_members m
      where m.timetable_id=tt.id and m.source_template_id=tt.lead_source_template_id
    ));

  update public.train_timetable_members m
  set member_role = case when m.source_template_id=tt.lead_source_template_id then 'primary' else 'duplicate_itinerary' end,
      segment_order=0,stop_offset=0,merge_first_stop=false
  from public.train_timetables tt
  where m.timetable_id=tt.id
    and tt.group_evidence<>'verified_continuation'
    and m.member_role is distinct from
      case when m.source_template_id=tt.lead_source_template_id then 'primary' else 'duplicate_itinerary' end;

  update public.train_timetables tt
  set group_evidence=case when exists(
    select 1 from public.train_timetable_members m
    where m.timetable_id=tt.id and m.member_role='duplicate_itinerary'
  ) then 'verified_shared_itinerary' else 'source_only' end
  where tt.canonical_key like 'shared-itinerary:%'
    and tt.group_evidence <> 'verified_continuation';
  if p_line_id in ('Joban','JobanMain') then perform public.refresh_joban_source_continuity(); end if;
  perform public.refresh_train_timetable_vehicle_mappings(p_line_id,p_calendar_urn);
end;
$function$

