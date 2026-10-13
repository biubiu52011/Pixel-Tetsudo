
-- Reference operation facts stay attached to canonical train timetables, not line-specific runtime caches.
create table if not exists public.train_timetable_operation_evidence (
  timetable_id bigint primary key references public.train_timetables(id) on delete cascade,
  source_template_id bigint not null references public.manual_timetable_templates(id) on delete cascade,
  operation_mapping_id bigint not null references public.train_operation_mappings(id) on delete cascade,
  operation_code text not null check (btrim(operation_code)<>''),
  source_revision_date date not null,
  calendar_type text not null,
  match_format text not null check(match_format in ('source_exact','tokyu_toyoko_compact_six')),
  source_id bigint references public.evidence_sources(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists train_timetable_operation_evidence_template_idx
  on public.train_timetable_operation_evidence(source_template_id);
create index if not exists train_timetable_operation_evidence_mapping_idx
  on public.train_timetable_operation_evidence(operation_mapping_id);
create index if not exists train_timetable_operation_evidence_source_idx
  on public.train_timetable_operation_evidence(source_id);
alter table public.train_timetable_operation_evidence enable row level security;
revoke all on public.train_timetable_operation_evidence from anon,authenticated;
grant select,insert,update,delete on public.train_timetable_operation_evidence to service_role;
comment on table public.train_timetable_operation_evidence is
'Unique source-revision-matched published operation code per canonical train timetable; never actual carset or realtime identity.';

alter table public.train_timetable_vehicle_mappings
  add column if not exists operation_owner_id bigint references public.curated_operation_owners(id) on delete cascade;
alter table public.train_timetable_vehicle_mappings
  add column if not exists operation_mapping_id bigint references public.train_operation_mappings(id) on delete cascade;
create index if not exists train_timetable_vehicle_op_owner_idx on public.train_timetable_vehicle_mappings(operation_owner_id) where operation_owner_id is not null;
create index if not exists train_timetable_vehicle_op_map_idx on public.train_timetable_vehicle_mappings(operation_mapping_id) where operation_mapping_id is not null;

alter table public.train_timetable_vehicle_mappings drop constraint train_timetable_vehicle_mappings_mapping_level_check;
alter table public.train_timetable_vehicle_mappings add constraint train_timetable_vehicle_mappings_mapping_level_check
  check(mapping_level in ('dated_schedule_rule','source_single_type_candidate','dated_operation_owner'));
alter table public.train_timetable_vehicle_mappings drop constraint train_timetable_vehicle_mappings_check;
alter table public.train_timetable_vehicle_mappings add constraint train_timetable_vehicle_mappings_check check (
  (mapping_level='dated_schedule_rule' and vehicle_rule_id is not null and timetable_revision_date is not null and operation_owner_id is null and operation_mapping_id is null)
  or (mapping_level='dated_operation_owner' and vehicle_rule_id is null and operation_owner_id is not null and operation_mapping_id is not null and timetable_revision_date is not null)
  or (mapping_level='source_single_type_candidate' and vehicle_rule_id is null and operation_owner_id is null and operation_mapping_id is null)
);
-- Existing normalized type labels are operator-scoped again at asset join time.
insert into public.vehicle_type_aliases(alias,canonical_vehicle_type,normalization_reason)
values('相鉄20000系','20000系','sotetsu_operator_scoped_exact_model_png')
on conflict(alias) do nothing;
-- Fix stale weekday URL on the already-curated Saturday/holiday reference records.
update public.curated_operation_owners
set source_url='https://www.train.chokopy.net/unyo-search/Toyoko/2026-03-14/saturdayholiday'
where network_key='toyoko-fukutoshin' and calendar_type='holiday'
and effective_from=date '2026-03-14'
and source_url='https://www.train.chokopy.net/unyo-search/Toyoko/2026-03-14/weekday';

