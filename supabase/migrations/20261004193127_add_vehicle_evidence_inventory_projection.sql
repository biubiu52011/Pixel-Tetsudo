-- Applied to Supabase project pnupwfmgbtxqhpzsrhfn.
-- Canonicalizes legacy/evidence-domain network keys for inventory purposes only.
-- Source facts keep their original network_key; no evidence identity is rewritten.

create table if not exists public.vehicle_network_key_aliases (
  alias_key text primary key,
  canonical_network_key text not null,
  alias_scope text not null default 'exact'
    check (alias_scope in ('exact','evidence_domain')),
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.vehicle_network_key_aliases enable row level security;

insert into public.vehicle_network_key_aliases(alias_key,canonical_network_key,alias_scope,notes)
values
 ('TokyoMonorail','tokyo-monorail','exact','Legacy mixed-case key.'),
 ('TsukubaExpress','tsukuba-express','exact','Legacy mixed-case key.'),
 ('saikyo-rinkai-sotetsu','saikyo','evidence_domain','Through-service evidence domain anchored to Saikyo runtime chain; retain source key in canonical facts.')
on conflict(alias_key) do update set
 canonical_network_key=excluded.canonical_network_key,
 alias_scope=excluded.alias_scope,
 notes=excluded.notes,
 updated_at=now();

create or replace view public.runtime_vehicle_evidence_inventory
with (security_invoker=true) as
with facts as (
 select network_key,'operation_observation'::text evidence_kind,count(*)::bigint evidence_rows,
        count(*)::bigint exact_rows,0::bigint narrowed_rows,min(service_date) min_date,max(service_date) max_date
 from public.operation_vehicle_observations group by network_key
 union all
 select network_key,'formation_assignment',count(*)::bigint,count(*)::bigint,0::bigint,min(service_date),max(service_date)
 from public.formation_assignments group by network_key
 union all
 select network_key,'operation_date_rule',count(*)::bigint,count(*)::bigint,0::bigint,min(valid_date),max(valid_date)
 from public.operation_vehicle_date_rules group by network_key
 union all
 select network_key,'train_date_rule',count(*)::bigint,count(*)::bigint,0::bigint,min(valid_date),max(valid_date)
 from public.train_vehicle_date_rules group by network_key
 union all
 select network_key,'train_rule',count(*)::bigint,count(*)::bigint,0::bigint,min(effective_from),max(effective_to)
 from public.train_vehicle_rules group by network_key
 union all
 select network_key,'train_observation',count(*)::bigint,count(*)::bigint,0::bigint,min(service_date),max(service_date)
 from public.train_vehicle_observations group by network_key
 union all
 select network_key,'operation_family_rule',count(*)::bigint,
        count(*) filter(where exact_vehicle_type is not null)::bigint,
        count(*) filter(where exact_vehicle_type is null and cardinality(vehicle_candidates)>0)::bigint,
        min(effective_from),max(effective_to)
 from public.operation_family_rules group by network_key
)
select f.network_key source_network_key,
       coalesce(a.canonical_network_key,f.network_key) canonical_network_key,
       coalesce(a.alias_scope,'exact') alias_scope,
       f.evidence_kind,f.evidence_rows,f.exact_rows,f.narrowed_rows,f.min_date,f.max_date
from facts f left join public.vehicle_network_key_aliases a on a.alias_key=f.network_key;
