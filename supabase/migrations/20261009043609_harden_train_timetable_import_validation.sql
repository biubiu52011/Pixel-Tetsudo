create or replace function public.import_train_timetable(p_line_id text,p_service_date date,p_runs jsonb)
returns integer language plpgsql security invoker set search_path=public as $$
declare r jsonb; v_id bigint; n integer:=0; v_count integer;
begin
 if p_line_id is null or p_service_date is null or p_runs is null or jsonb_typeof(p_runs)<>'array' or jsonb_array_length(p_runs)=0 then raise exception 'INVALID_IMPORT'; end if;
 if not exists(select 1 from public.railway_lines where id=p_line_id) then raise exception 'UNKNOWN_LINE'; end if;
 for r in select value from jsonb_array_elements(p_runs) loop
  if nullif(r->>'operator','') is null or nullif(r->>'network_key','') is null or nullif(r->>'train_number','') is null or nullif(r->>'calendar_type','') is null or jsonb_typeof(r->'stops')<>'array' or jsonb_array_length(r->'stops')<2 then raise exception 'INCOMPLETE_RUN'; end if;
  if exists(select 1 from jsonb_array_elements(r->'stops') s where nullif(s->>'station_key','') is null or nullif(s->>'stop_sequence','') is null) then raise exception 'INCOMPLETE_STOPS'; end if;
  if (select count(*) from jsonb_array_elements(r->'stops')) <> (select count(distinct s->>'stop_sequence') from jsonb_array_elements(r->'stops') s) then raise exception 'DUPLICATE_STOP_SEQUENCE'; end if;
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
  select v_id,(s->>'stop_sequence')::integer,s->>'station_key',s->>'station_urn',
  nullif(s->>'arrival_time','')::time,nullif(s->>'departure_time','')::time,
  nullif(s->>'arrival_minute','')::integer,nullif(s->>'departure_minute','')::integer
  from jsonb_array_elements(r->'stops') s;
  n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function public.import_train_timetable(text,date,jsonb) from public,anon,authenticated;
grant execute on function public.import_train_timetable(text,date,jsonb) to service_role;
