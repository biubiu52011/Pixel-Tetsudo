
do $patch$
declare original text;
declare updated text;
begin
 select pg_get_functiondef('public.sync_canonical_train_timetables(text,text)'::regprocedure)
 into original;
 if position('refresh_train_timetable_vehicle_mappings' in original)>0 then
   return;
 end if;
 updated:=replace(original,
 E'\nend;\n$function$',
 E'\n  perform public.refresh_train_timetable_vehicle_mappings(p_line_id,p_calendar_urn);\nend;\n$function$');
 if updated=original or position('refresh_train_timetable_vehicle_mappings' in updated)=0
 then raise exception 'CANONICAL_SYNC_PATCH_PATTERN_NOT_FOUND'; end if;
 execute updated;
end;
$patch$;

