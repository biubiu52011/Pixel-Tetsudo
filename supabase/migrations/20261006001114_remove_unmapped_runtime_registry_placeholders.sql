set lock_timeout='5s';
delete from public.runtime_vehicle_coverage
where line_id in ('Keio','SeibuEnoshima','SeibuIkebukuro','SeibuNoda','SobuLocal')
  and network_key is null
  and coverage_status='missing'
  and realtime_api_available=false
  and realtime_vehicle_identity_status='absent';

delete from public.railway_lines
where id in ('Keio','SeibuEnoshima','SeibuIkebukuro','SeibuNoda','SobuLocal','UenoTokyo')
  and odpt_railway is null
  and not exists (select 1 from public.train_runs t where t.line_id=railway_lines.id)
  and not exists (select 1 from public.runtime_vehicle_coverage c where c.line_id=railway_lines.id)
  and not exists (select 1 from public.line_stations s where s.line_id=railway_lines.id);
