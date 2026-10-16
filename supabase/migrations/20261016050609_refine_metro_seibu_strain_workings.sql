begin;
update public.operation_family_rules set plan_scope=jsonb_set(plan_scope,'{operationPatterns}','["01M-38M"]'::jsonb)
where network_key in ('Yurakucho','Fukutoshin') and code_pattern='PLAN:MF-SEIBU' and source_id=(select id from evidence_sources where source_key='metro-yf-working-plan-20260314');
insert into public.operation_family_rules(operator,network_key,code_pattern,effective_from,vehicle_candidates,source_id,notes,plan_scope,calendar_type)
select 'Seibu','Yurakucho','PLAN:MF-SEIBU-STRAIN',date '2026-03-14',array['西武40000系'],id,
'Recurring weekday S-TRAIN working51-59M; retain40000 model plan without identifying a daily carset.',
'{"planOnly":true,"overridePlan":true,"lineIds":["Yurakucho"],"operationPatterns":["51M-59M"]}'::jsonb,''
from public.evidence_sources where source_key='metro-yf-working-plan-20260314'
on conflict(operator,network_key,code_pattern,effective_from,calendar_type) do update
set vehicle_candidates=excluded.vehicle_candidates,plan_scope=excluded.plan_scope,notes=excluded.notes;
commit;