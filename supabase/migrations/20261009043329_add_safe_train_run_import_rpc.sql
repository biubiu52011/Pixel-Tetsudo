create or replace function public.import_train_timetable(p_line_id text,p_service_date date,p_runs jsonb)
returns integer language plpgsql security invoker set search_path=public as $$
declare r jsonb; s jsonb; v_id bigint; n integer:=0; v_count integer;
begin
 if p_runs is null or jsonb_typeof(p_runs)<>'array' then raise exception 'INVALID_RUNS'; end if;
 for r in select value from jsonb_array_elements(p_runs) loop
  if nullif(r->>'train_number','') is null or jsonb_typeof(r->'stops')<>'array' or jsonb_array_length(r->'stops')<2 then raise exception 'INCOMPLETE_RUN'; end if;
  select count(*) into v_count from public.train_runs where service_date=p_service_date and line_id=p_line_id and operator=r->>'operator' and network_key=r->>'network_key' and train_number=r->>'train_number' and calendar_type=r->>'calendar_type' and coalesce(rail_direction,'')=coalesce(r->>'rail_direction','');
  if v_count>1 then raise exception 'AMBIGUOUS_RUN'; end if;
  if v_count=1 then
   select id into v_id from public.train_runs where service_date=p_service_date and line_id=p_line_id and operator=r->>'operator' and network_key=r->>'network_key' and train_number=r->>'train_number' and calendar_type=r->>'calendar_type' and coalesce(rail_direction,'')=coalesce(r->>'rail_direction','');
   update public.train_runs set train_type=r->>'train_type',destination_station=r->>'destination_station' where id=v_id;
  else
   insert into public.train_runs(service_date,line_id,operator,network_key,train_number,operation_code,calendar_type,rail_direction,train_type,destination_station)
   values(p_service_date,p_line_id,r->>'operator',r->>'network_key',r->>'train_number',r->>'train_number',r->>'calendar_type',r->>'rail_direction',r->>'train_type',r->>'destination_station') returning id into v_id;
  end if;
  delete from public.train_run_stops where train_run_id=v_id;
  insert into public.train_run_stops(train_run_id,stop_sequence,station_key,station_urn,arrival_time,departure_time,arrival_minute,departure_minute)
  select v_id,(x.value->>'stop_sequence')::integer,x.value->>'station_key',x.value->>'station_urn',
  nullif(x.value->>'arrival_time','')::time,nullif(x.value->>'departure_time','')::time,
  nullif(x.value->>'arrival_minute','')::integer,nullif(x.value->>'departure_minute','')::integer
  from jsonb_array_elements(r->'stops') x;
  n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function public.import_train_timetable(text,date,jsonb) from public,anon,authenticated;
grant execute on function public.import_train_timetable(text,date,jsonb) to service_role;
