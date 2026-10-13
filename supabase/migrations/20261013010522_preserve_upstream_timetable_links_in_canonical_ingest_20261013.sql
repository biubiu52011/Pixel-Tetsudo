
do $fix$
declare original text;
declare patched text;
begin
 select pg_get_functiondef('public.persist_odpt_timetable_templates(text,text,jsonb)'::regprocedure)
 into original;
 patched:=replace(original,
 '(line_key,calendar_urn,train_number,railway_urn,direction_urn,train_type_urn,destination_urns,source_path,source_occurrence)',
 '(line_key,calendar_urn,train_number,railway_urn,direction_urn,train_type_urn,destination_urns,source_path,source_occurrence,source_trip_id,previous_timetable_ids,next_timetable_ids)'
 );
 patched:=replace(patched,
 'v_source,s.occurrence' || chr(10) || '  FROM pg_temp._tt_odpt_import_valid s;',
 'v_source,s.occurrence,' || chr(10) ||
 '    nullif(s.raw->>''owl:sameAs'',''''),' || chr(10) ||
 '    CASE WHEN jsonb_typeof(s.raw->''odpt:previousTrainTimetable'')=''array''' || chr(10) ||
 '      THEN ARRAY(SELECT jsonb_array_elements_text(s.raw->''odpt:previousTrainTimetable''))' || chr(10) ||
 '      WHEN jsonb_typeof(s.raw->''odpt:previousTrainTimetable'')=''string''' || chr(10) ||
 '      THEN ARRAY[s.raw->>''odpt:previousTrainTimetable''] ELSE ARRAY[]::text[] END,' || chr(10) ||
 '    CASE WHEN jsonb_typeof(s.raw->''odpt:nextTrainTimetable'')=''array''' || chr(10) ||
 '      THEN ARRAY(SELECT jsonb_array_elements_text(s.raw->''odpt:nextTrainTimetable''))' || chr(10) ||
 '      WHEN jsonb_typeof(s.raw->''odpt:nextTrainTimetable'')=''string''' || chr(10) ||
 '      THEN ARRAY[s.raw->>''odpt:nextTrainTimetable''] ELSE ARRAY[]::text[] END' || chr(10) ||
 '  FROM pg_temp._tt_odpt_import_valid s;'
 );
 if original=patched or position('nullif(s.raw->>''owl:sameAs''' in patched)=0
  then raise exception 'ODPT_REFERENCE_PATCH_FAILED'; end if;
 execute patched;
end;
$fix$;
