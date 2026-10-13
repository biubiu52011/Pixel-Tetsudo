
do $repair$
declare original text;
declare corrected text;
begin
 select pg_get_functiondef('public.sync_canonical_train_timetables(text,text)'::regprocedure) into original;
 corrected := replace(original,
  'select new_key,calendar_urn,train_number,id,source_revision_date,',
  'select new_key,calendar_urn,train_number,id,');
 if original=corrected then raise exception 'FUNCTION_PATCH_PATTERN_MISSING'; end if;
 execute corrected;
end;
$repair$;

