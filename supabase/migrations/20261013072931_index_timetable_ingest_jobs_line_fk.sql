-- Speed up FK checks and per-line ingest job lookups without changing data or RLS.
CREATE INDEX IF NOT EXISTS timetable_ingest_jobs_line_id_idx
  ON public.timetable_ingest_jobs (line_id);
