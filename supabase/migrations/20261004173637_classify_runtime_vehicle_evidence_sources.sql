-- Applied to Supabase project pnupwfmgbtxqhpzsrhfn.
-- Migration: classify_runtime_vehicle_evidence_sources
-- Version: 20261004173637
--
-- Separates realtime API capability from dated SQL vehicle evidence.
-- Canonical observations are retained; API-backed networks mark SQL as fallback.
-- Realtime vehicle identity remains UNKNOWN until explicitly verified.

create table if not exists public.runtime_vehicle_source_policy (
  network_key text primary key,
  realtime_api_available boolean not null default false,
  realtime_vehicle_identity_status text not null default 'unknown'
    check (realtime_vehicle_identity_status in ('verified','absent','unknown')),
  sql_evidence_role text not null default 'primary'
    check (sql_evidence_role in ('primary','fallback','historical')),
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.runtime_vehicle_source_policy enable row level security;

insert into public.runtime_vehicle_source_policy
(network_key,realtime_api_available,realtime_vehicle_identity_status,sql_evidence_role,notes)
values
('keiyo',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.'),
('saikyo',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.'),
('sotetsu',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.'),
('tokyo-monorail',false,'absent','primary','Production ODPT config explicitly records TokyoMonorail as having no ODPT data; SQL is primary vehicle evidence.'),
('odakyu-main',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.'),
('oimachi',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.'),
('tozai',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.'),
('iketama',true,'unknown','fallback','Realtime API exists; SQL remains dated fallback evidence until vehicle identity capability is verified.')
on conflict (network_key) do update set
 realtime_api_available=excluded.realtime_api_available,
 realtime_vehicle_identity_status=excluded.realtime_vehicle_identity_status,
 sql_evidence_role=excluded.sql_evidence_role,
 notes=excluded.notes,
 updated_at=now();

alter table public.runtime_vehicle_operation_evidence
  add column if not exists sql_evidence_role text not null default 'primary'
  check (sql_evidence_role in ('primary','fallback','historical'));

update public.runtime_vehicle_operation_evidence e
set sql_evidence_role=p.sql_evidence_role
from public.runtime_vehicle_source_policy p
where p.network_key=e.network_key
  and e.sql_evidence_role is distinct from p.sql_evidence_role;

create index if not exists runtime_vehicle_operation_evidence_role_idx
on public.runtime_vehicle_operation_evidence(network_key,sql_evidence_role,service_date);
