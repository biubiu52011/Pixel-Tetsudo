
do $patch$
declare original text;
declare updated text;
begin
  select pg_get_functiondef('public.persist_odpt_timetable_templates(text,text,jsonb)'::regprocedure)
    into original;
  updated := replace(original,
    'GET DIAGNOSTICS v_stops=ROW_COUNT;',
    'GET DIAGNOSTICS v_stops=ROW_COUNT;' || chr(10) ||
    '  PERFORM public.sync_canonical_train_timetables(p_line_id,p_calendar_urn);'
  );
  updated := replace(updated,
    '  -- Transactional full replacement. A failure rolls back the previous good snapshot.',
    '  -- Do not remove a verified continuous trip without a complete successor link.' || chr(10) ||
    '  IF EXISTS (' || chr(10) ||
    '    SELECT 1 FROM public.manual_timetable_templates t' || chr(10) ||
    '    WHERE t.line_key=p_line_id AND t.calendar_urn=p_calendar_urn AND t.source_path=v_source' || chr(10) ||
    '      AND EXISTS (SELECT 1 FROM public.train_timetable_continuity c' || chr(10) ||
    '                  WHERE c.from_template_id=t.id OR c.to_template_id=t.id)' || chr(10) ||
    '  ) THEN RAISE EXCEPTION ''CANONICAL_CONTINUATION_REQUIRES_VERIFIED_RECONCILIATION''; END IF;' || chr(10) ||
    '  -- Transactional full replacement. A failure rolls back the previous good snapshot.'
  );
  if original=updated or position('PERFORM public.sync_canonical_train_timetables' in updated)=0
    then raise exception 'IMPORTER_PATCH_PATTERN_MISSING'; end if;
  execute updated;
end;
$patch$;

