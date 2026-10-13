do $patch$
declare original text; patched text;
begin
  select pg_get_functiondef('public.refresh_train_timetable_vehicle_mappings(text,text)'::regprocedure) into original;
  patched:=replace(original,
    'where public.train_timetable_vehicle_mappings.mapping_level=''source_single_type_candidate'';',
    'where public.train_timetable_vehicle_mappings.mapping_level in (''source_single_type_candidate'',''dated_operation_owner'');');
  patched:=replace(patched,
    'rule_effective_to=excluded.rule_effective_to',
    'rule_effective_to=excluded.rule_effective_to, operation_owner_id=null, operation_mapping_id=null');
  patched:=replace(patched, E'\nend;\n$function$\n', E'\n'||$body$
  perform public.refresh_train_timetable_operation_evidence(p_line_id,p_calendar_urn);
  with matched as (
    select ev.timetable_id,ev.source_template_id,ev.operation_mapping_id,
           ev.source_id,ev.source_revision_date,
           co.id owner_id,co.vehicle_type,co.source_url,t.source_path
    from public.train_timetable_operation_evidence ev
    join public.train_operation_mappings om on om.id=ev.operation_mapping_id
    join public.curated_operation_owners co
      on co.network_key=om.network_key and co.operation_code=om.operation_code
      and co.calendar_type=ev.calendar_type
      and co.effective_from=ev.source_revision_date
      and co.evidence_grade in ('A','B','C')
      and nullif(btrim(co.vehicle_type),'') is not null
      and co.source_url is not null
    join public.manual_timetable_templates t on t.id=ev.source_template_id
    where t.vehicle_type_label is null
      and (p_line_id is null or t.line_key=p_line_id)
      and (p_calendar_urn is null or t.calendar_urn=p_calendar_urn)
  ), unique_matches as (
    select timetable_id from matched group by timetable_id
    having count(*)=1 and count(distinct vehicle_type)=1
  )
  insert into public.train_timetable_vehicle_mappings
    (timetable_id,source_template_id,vehicle_type,mapping_level,vehicle_rule_id,
     source_id,source_path,timetable_revision_date,rule_effective_from,rule_effective_to,
     operation_owner_id,operation_mapping_id)
  select m.timetable_id,m.source_template_id,m.vehicle_type,
         'dated_operation_owner',null,m.source_id,m.source_path,m.source_revision_date,
         m.source_revision_date,null,m.owner_id,m.operation_mapping_id
  from matched m join unique_matches u using(timetable_id)
  on conflict(timetable_id) do nothing;
$body$||E'end;\n$function$\n');
  if patched=original or position('perform public.refresh_train_timetable_operation_evidence' in patched)=0
  then raise exception 'refresh patch missing';end if;
  execute patched;
end;
$patch$;
select public.refresh_train_timetable_vehicle_mappings('TokyuToyoko',null);
