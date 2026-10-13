
create or replace function public.sync_canonical_train_timetables(p_line_id text,p_calendar_urn text)
returns void
language plpgsql
security invoker
set search_path = 'public'
as $func$
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
  select new_key,calendar_urn,train_number,id,source_revision_date,
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
end;
$func$;

revoke all on function public.sync_canonical_train_timetables(text,text) from public,anon,authenticated;
grant execute on function public.sync_canonical_train_timetables(text,text) to service_role;

