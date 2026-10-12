
insert into public.runtime_vehicle_source_policy
(network_key,realtime_api_available,realtime_vehicle_identity_status,sql_evidence_role,notes)
values
('asakusa',true,'unknown','fallback','Toei realtime Train endpoint is active; vehicle identity field not verified'),
('ChibaMonorail',false,'absent','primary','Canonical key retained pending runtime line-key normalization'),
('chiyoda-joban-odakyu',false,'absent','primary','Family-rule timetable evidence domain'),
('denentoshi-hanzomon',false,'absent','primary','Tokyu/Metro/Tobu through-service evidence domain'),
('hanzomon',false,'absent','primary','Dated formation evidence'),
('hibiya',false,'absent','primary','Dated formation evidence'),
('kodomonokuni',false,'absent','primary','Structural exact fleet evidence'),
('meguro',false,'absent','primary','Published operation-family evidence'),
('seibu-shinjuku',false,'absent','primary','Dated train observations'),
('setagaya',false,'absent','primary','Structural exact fleet evidence'),
('tobu-limited-express',true,'unknown','fallback','Tobu realtime Train endpoint is active; vehicle identity field not verified'),
('toyoko-fukutoshin',false,'absent','primary','Calendar-scoped operation-family evidence'),
('tsukuba-express',false,'absent','primary','MIR has timetable API but no realtime Train endpoint')
on conflict(network_key) do update set
realtime_api_available=excluded.realtime_api_available,
realtime_vehicle_identity_status=excluded.realtime_vehicle_identity_status,
sql_evidence_role=excluded.sql_evidence_role,
notes=excluded.notes,
updated_at=now();

