begin;
insert into public.evidence_sources(source_key,source_url,source_type,evidence_grade,notes)
values ('metro-yf-working-plan-20260314','https://loo-ool.com/rail/MF/32/','reference','C',
'Recurring working-family constraints, not daily observations. Public MF plan and 2026-03-14 Toyoko working roster identify S/M/T/K/91-95G owners. Metro current fleet: https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/index.html . 01-19S are 8-car 17000; 21+S 10-car 10000/17000. K01-35 8-car Tokyu/Y500; K51-65 10-car Tokyu. M retains Seibu6000/40000 candidates; 71-75M S-TRAIN40000. Tobu through fleet retains50070/9000/9050, excludes30000. Sotetsu91-95G20000. No individual formation or daily allocation inferred.')
on conflict(source_key) do nothing;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'TokyoMetro','Fukutoshin','PLAN:MF-METRO-8',date '2026-03-14',array['東京メトロ17000系'],id,'Planned METRO-8 owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["01S-19S"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'TokyoMetro','Yurakucho','PLAN:MF-METRO-10',date '2026-03-14',array['東京メトロ10000系','東京メトロ17000系'],id,'Planned METRO-10 owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Yurakucho"],"operationPatterns":["21S-99S"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'TokyoMetro','Fukutoshin','PLAN:MF-METRO-10',date '2026-03-14',array['東京メトロ10000系','東京メトロ17000系'],id,'Planned METRO-10 owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["21S-99S"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Seibu','Yurakucho','PLAN:MF-SEIBU',date '2026-03-14',array['西武6000系','西武40000系'],id,'Planned SEIBU owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Yurakucho"],"operationPatterns":["01M-70M"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Seibu','Fukutoshin','PLAN:MF-SEIBU',date '2026-03-14',array['西武6000系','西武40000系'],id,'Planned SEIBU owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["01M-70M"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Seibu','Fukutoshin','PLAN:MF-SEIBU-STRAIN',date '2026-03-14',array['西武40000系'],id,'Planned SEIBU-STRAIN owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["71M-75M"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Tobu','Yurakucho','PLAN:MF-TOBU',date '2026-03-14',array['東武50070系','東武9000系','東武9050系'],id,'Planned TOBU owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Yurakucho"],"operationPatterns":["01T-23T"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Tobu','Fukutoshin','PLAN:MF-TOBU',date '2026-03-14',array['東武50070系','東武9000系','東武9050系'],id,'Planned TOBU owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["01T-23T"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Tokyu','Fukutoshin','PLAN:MF-TOKYU-8',date '2026-03-14',array['東急5050系','東急5000系','横浜高速Y500系'],id,'Planned TOKYU-8 owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["01K-35K"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Tokyu','Fukutoshin','PLAN:MF-TOKYU-10',date '2026-03-14',array['東急5050系'],id,'Planned TOKYU-10 owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["51K-65K"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Sotetsu','Fukutoshin','PLAN:MF-SOTETSU-10',date '2026-03-14',array['相鉄20000系(10両)'],id,'Planned SOTETSU-10 owner/working family; recurring candidates, not observed formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Fukutoshin"],"operationPatterns":["91G-95G"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,notes=excluded.notes,plan_scope=excluded.plan_scope;
commit;
