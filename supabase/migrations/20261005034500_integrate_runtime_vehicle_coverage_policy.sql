-- Separate SQL evidence freshness from realtime vehicle-identity capability.
-- coverage_status remains the SQL evidence status for backward compatibility.
-- effective_coverage_status is the combined runtime status.
-- Realtime availability alone is never treated as vehicle coverage: only
-- realtime_vehicle_identity_status='verified' can produce effective active coverage.

alter table public.runtime_vehicle_coverage
  add column if not exists realtime_api_available boolean not null default false,
  add column if not exists realtime_vehicle_identity_status text not null default 'absent'
    check (realtime_vehicle_identity_status in ('verified','absent','unknown')),
  add column if not exists sql_evidence_role text not null default 'primary'
    check (sql_evidence_role in ('primary','fallback','historical')),
  add column if not exists effective_coverage_status text not null default 'missing'
    check (effective_coverage_status in ('active','stale','partial','missing','unverified'));

update public.runtime_vehicle_coverage c
set realtime_api_available=p.realtime_api_available,
    realtime_vehicle_identity_status=p.realtime_vehicle_identity_status,
    sql_evidence_role=p.sql_evidence_role,
    effective_coverage_status=case
      when p.realtime_api_available and p.realtime_vehicle_identity_status='verified' then 'active'
      when p.realtime_api_available and p.realtime_vehicle_identity_status='unknown' then 'unverified'
      else c.coverage_status
    end,
    notes=case
      when p.realtime_api_available and p.realtime_vehicle_identity_status='unknown'
        then 'Realtime Train API exists but vehicle identity capability is unverified; SQL evidence remains fallback and SQL coverage_status is preserved separately.'
      when not p.realtime_api_available
        then 'No active realtime Train vehicle source; effective coverage follows SQL coverage_status.'
      else c.notes
    end,
    updated_at=now()
from public.runtime_vehicle_source_policy p
where p.network_key=c.network_key;

-- Do not synthesize coverage rows for canonical networks whose project line_id
-- is absent from railway_lines. runtime_vehicle_coverage.line_id has an FK to
-- railway_lines(id); inventory expansion must follow canonical line inventory.
