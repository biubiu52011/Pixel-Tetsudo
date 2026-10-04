-- Applied to Supabase project pnupwfmgbtxqhpzsrhfn.
-- Migration: index evidence foreign keys
-- Keep canonical evidence private: RLS remains enabled with no anon/authenticated
-- policies because runtime clients consume the generated static snapshot instead
-- of querying these tables directly.
--
-- These indexes cover foreign keys reported by the Supabase performance advisor.
-- IF NOT EXISTS keeps the migration safe against the already-applied production
-- change and repeatable in fresh environments.

create index if not exists fleet_carsets_source_id_idx
  on public.fleet_carsets (source_id);
create index if not exists formation_assignments_source_id_idx
  on public.formation_assignments (source_id);
create index if not exists operation_family_rules_source_id_idx
  on public.operation_family_rules (source_id);
create index if not exists operation_vehicle_date_rules_source_id_idx
  on public.operation_vehicle_date_rules (source_id);
create index if not exists operation_vehicle_observations_source_id_idx
  on public.operation_vehicle_observations (source_id);
create index if not exists railway_operations_source_id_idx
  on public.railway_operations (source_id);
create index if not exists spot_images_spot_id_idx
  on public.spot_images (spot_id);
create index if not exists spot_tags_tag_id_idx
  on public.spot_tags (tag_id);
create index if not exists train_operation_mappings_source_id_idx
  on public.train_operation_mappings (source_id);
create index if not exists train_runs_source_id_idx
  on public.train_runs (source_id);
create index if not exists train_vehicle_date_rules_source_id_idx
  on public.train_vehicle_date_rules (source_id);
create index if not exists train_vehicle_observations_source_id_idx
  on public.train_vehicle_observations (source_id);
create index if not exists train_vehicle_rules_source_id_idx
  on public.train_vehicle_rules (source_id);
create index if not exists vehicle_carsets_source_id_idx
  on public.vehicle_carsets (source_id);
create index if not exists vehicle_visual_identities_source_id_idx
  on public.vehicle_visual_identities (source_id);
