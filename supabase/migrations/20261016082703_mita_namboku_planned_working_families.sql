begin;
insert into public.evidence_sources(source_key,source_url,source_type,evidence_grade,notes)
values ('meguro-mita-namboku-working-plans-20260314','https://www.train.chokopy.net/unyo-search/Meguro/2026-03-14/weekday','reference','C',
'Recurring published working-owner families. No dated formation assignment. K=Tokyu3000/5080/3020; S=Metro9000; M80-96=Saitama2000; T=Toei6300/6500 candidates (do not infer6/8car from owner alone); G30-44=Sotetsu21000. Official shared segment Meguro--ShirokaneTakanawa: https://www.tokyometro.jp/ticket/particularcase/meguro_shiroganetakanawa/index.html ; current fleets https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/ and https://www.tokyu.co.jp/railway/trains/ . Sotetsu20000 is excluded from Meguro-network plans.')
on conflict(source_key) do nothing;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Tokyu','Mita','PLAN:MN-TOKYU',date '2026-03-14',array['東急5080系','東急3020系','東急3000系'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Mita"],"operationPatterns":["00K-48K"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Toei','Mita','PLAN:MN-TOEI',date '2026-03-14',array['都営6300形','都営6500形'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Mita"],"operationPatterns":["20T-89T"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Sotetsu','Mita','PLAN:MN-SOTETSU',date '2026-03-14',array['相鉄21000系'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Mita"],"operationPatterns":["30G-44G"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Tokyu','Namboku','PLAN:MN-TOKYU',date '2026-03-14',array['東急5080系','東急3020系','東急3000系'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Namboku"],"operationPatterns":["00K-48K"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'TokyoMetro','Namboku','PLAN:MN-METRO',date '2026-03-14',array['東京メトロ9000系'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Namboku"],"operationPatterns":["30S-70S"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'SaitamaRailway','Namboku','PLAN:MN-SAITAMA',date '2026-03-14',array['埼玉高速2000系'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Namboku"],"operationPatterns":["80M-96M"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Sotetsu','Namboku','PLAN:MN-SOTETSU',date '2026-03-14',array['相鉄21000系'],id,'Planned working-family constraint; preserve candidate ambiguity and no daily formation.','{"planOnly":true,"overridePlan":true,"lineIds":["Namboku"],"operationPatterns":["30G-44G"]}'::jsonb,''
from public.evidence_sources where source_key='meguro-mita-namboku-working-plans-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update set vehicle_candidates=excluded.vehicle_candidates,source_id=excluded.source_id,plan_scope=excluded.plan_scope,notes=excluded.notes;
commit;
