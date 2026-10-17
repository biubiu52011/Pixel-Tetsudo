begin;
update public.operation_family_rules set plan_scope=plan_scope-'candidateLabelsAny',notes=notes || ' Admission is based on the published regular train-number whitelist; legacy SQL candidate text is not required for ODPT realtime or blank-label SQL input. Existing actual vehicle priority is unchanged.' where operator='JR-East' and network_key='ChuoMain' and code_pattern='PLAN:CHUO-REGIONAL' and effective_from=date '2026-10-16' and plan_scope->'candidateLabelsAny' is not null;
commit;
