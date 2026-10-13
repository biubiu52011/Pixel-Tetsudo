
create table if not exists public.train_timetable_vehicle_mappings (
  timetable_id bigint primary key references public.train_timetables(id) on delete cascade,
  source_template_id bigint not null references public.manual_timetable_templates(id) on delete cascade,
  vehicle_type text not null check(btrim(vehicle_type)<>'' and vehicle_type not like '%/%'),
  mapping_level text not null check (mapping_level in ('dated_schedule_rule','source_single_type_candidate')),
  vehicle_rule_id bigint references public.train_vehicle_rules(id) on delete cascade,
  source_id bigint references public.evidence_sources(id) on delete set null,
  source_path text,
  timetable_revision_date date,
  rule_effective_from date,
  rule_effective_to date,
  actual_vehicle_confirmed boolean not null default false check (actual_vehicle_confirmed=false),
  created_at timestamptz not null default now(),
  check ((mapping_level='dated_schedule_rule' and vehicle_rule_id is not null and timetable_revision_date is not null)
  or (mapping_level='source_single_type_candidate' and vehicle_rule_id is null))
);
comment on table public.train_timetable_vehicle_mappings is
'Persistent vehicle-type matching by canonical train timetable. Source single-type labels are CANDIDATES only; dated schedule rules are evidence-backed scheduled types, NEVER real-time/observed carset identity.';
create index if not exists train_timetable_vehicle_mappings_evidence_idx
on public.train_timetable_vehicle_mappings(mapping_level,vehicle_type);
create index if not exists train_timetable_vehicle_mappings_template_idx
on public.train_timetable_vehicle_mappings(source_template_id);
create index if not exists train_timetable_vehicle_mappings_rule_idx
on public.train_timetable_vehicle_mappings(vehicle_rule_id) where vehicle_rule_id is not null;
alter table public.train_timetable_vehicle_mappings enable row level security;
revoke all on public.train_timetable_vehicle_mappings from anon,authenticated;
grant select,insert,update,delete on public.train_timetable_vehicle_mappings to service_role;

