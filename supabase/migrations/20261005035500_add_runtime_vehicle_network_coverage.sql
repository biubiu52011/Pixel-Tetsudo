-- Vehicle evidence coverage is network-scoped, not railway_lines-scoped.
-- Keep runtime_vehicle_coverage for legacy line-level reporting, but use this
-- canonical inventory for the eight source-policy networks.

create table if not exists public.runtime_vehicle_network_coverage (
  network_key text primary key references public.runtime_vehicle_source_policy(network_key),
  coverage_status text not null default 'missing'
    check (coverage_status in ('active','stale','partial','missing')),
  operation_evidence_rows integer not null default 0,
  latest_service_date date,
  has_timed_segments boolean not null default false,
  realtime_api_available boolean not null default false,
  realtime_vehicle_identity_status text not null default 'absent'
    check (realtime_vehicle_identity_status in ('verified','absent','unknown')),
  sql_evidence_role text not null default 'primary'
    check (sql_evidence_role in ('primary','fallback','historical')),
  effective_coverage_status text not null default 'missing'
    check (effective_coverage_status in ('active','stale','partial','missing','unverified')),
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.runtime_vehicle_network_coverage enable row level security;

insert into public.runtime_vehicle_network_coverage
(network_key,coverage_status,operation_evidence_rows,latest_service_date,has_timed_segments,
 realtime_api_available,realtime_vehicle_identity_status,sql_evidence_role,effective_coverage_status,notes,updated_at)
select p.network_key,
       case when count(e.observation_id)=0 then 'missing'
            when max(e.service_date)=current_date then 'active'
            else 'stale' end,
       count(e.observation_id)::integer,
       max(e.service_date),
       bool_or(e.valid_from_time is not null or e.valid_to_time is not null),
       p.realtime_api_available,p.realtime_vehicle_identity_status,p.sql_evidence_role,
       case
         when p.realtime_api_available and p.realtime_vehicle_identity_status='verified' then 'active'
         when p.realtime_api_available and p.realtime_vehicle_identity_status='unknown' then 'unverified'
         when count(e.observation_id)=0 then 'missing'
         when max(e.service_date)=current_date then 'active'
         else 'stale'
       end,
       case
         when p.realtime_api_available and p.realtime_vehicle_identity_status='unknown'
           then 'Realtime Train API exists but vehicle identity capability is unverified; SQL evidence is fallback.'
         when not p.realtime_api_available
           then 'No active realtime Train vehicle source; effective coverage follows SQL evidence.'
         else 'Realtime vehicle identity is verified.'
       end,
       now()
from public.runtime_vehicle_source_policy p
left join public.runtime_vehicle_operation_evidence e on e.network_key=p.network_key
group by p.network_key,p.realtime_api_available,p.realtime_vehicle_identity_status,p.sql_evidence_role
on conflict (network_key) do update set
 coverage_status=excluded.coverage_status,
 operation_evidence_rows=excluded.operation_evidence_rows,
 latest_service_date=excluded.latest_service_date,
 has_timed_segments=excluded.has_timed_segments,
 realtime_api_available=excluded.realtime_api_available,
 realtime_vehicle_identity_status=excluded.realtime_vehicle_identity_status,
 sql_evidence_role=excluded.sql_evidence_role,
 effective_coverage_status=excluded.effective_coverage_status,
 notes=excluded.notes,
 updated_at=excluded.updated_at;
