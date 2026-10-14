-- Synced with Supabase migration 20261014000401.
-- A sourced PARTIAL plan may fill gaps only when runtime mode is non-FULL.
-- This does not assign an operating calendar, model or complete-train flag.
ALTER TABLE public.railway_lines
 ADD COLUMN IF NOT EXISTS sql_planned_fallback_enabled boolean NOT NULL DEFAULT false;
UPDATE public.railway_lines
SET sql_planned_fallback_enabled = true
WHERE id = 'Kawagoe'
  AND realtime_position_api_enabled = true
  AND timetable_api_enabled = false;
COMMENT ON COLUMN public.railway_lines.sql_planned_fallback_enabled IS
  'Explicitly authorizes source-verified partial SQL plans to supplement non-FULL Train API coverage; does not imply full timetable validity.';
