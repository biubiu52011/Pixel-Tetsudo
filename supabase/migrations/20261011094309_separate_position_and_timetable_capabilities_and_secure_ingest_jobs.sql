ALTER TABLE public.railway_lines
  ADD COLUMN IF NOT EXISTS timetable_api_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS realtime_position_api_enabled boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.railway_lines.timetable_api_enabled IS 'Configured ODPT TrainTimetable resource, independent of position capability.';
COMMENT ON COLUMN public.railway_lines.realtime_position_api_enabled IS 'Configured ODPT Train resource, not proof of full realtime line coverage.';
UPDATE public.railway_lines
SET timetable_api_enabled=COALESCE(odpt_operator IN ('JR-East','Tobu','Toei','TokyoMetro','Tokyu','YokohamaMunicipal','Keisei') AND odpt_railway IS NOT NULL AND odpt_base_url IS NOT NULL,false),
    realtime_position_api_enabled=COALESCE(odpt_operator IN ('JR-East','Tobu','Toei') AND odpt_railway IS NOT NULL AND odpt_base_url IS NOT NULL,false);
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE TABLE IF NOT EXISTS public.timetable_ingest_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 secret_nonce uuid NOT NULL DEFAULT gen_random_uuid(),
 line_id varchar NOT NULL REFERENCES public.railway_lines(id),
 calendar_urn text NOT NULL CHECK(calendar_urn IN ('odpt.Calendar:Weekday','odpt.Calendar:SaturdayHoliday','odpt.Calendar:Saturday','odpt.Calendar:Sunday','odpt.Calendar:Holiday')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','complete','failed','empty')),
 train_count integer,
 stop_count integer,
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);
ALTER TABLE public.timetable_ingest_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.timetable_ingest_jobs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.timetable_ingest_jobs TO service_role;
CREATE INDEX IF NOT EXISTS timetable_ingest_jobs_status_idx ON public.timetable_ingest_jobs(status,created_at);
