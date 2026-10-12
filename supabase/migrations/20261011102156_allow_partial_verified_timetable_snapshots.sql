ALTER TABLE public.timetable_ingest_jobs
 ADD COLUMN IF NOT EXISTS omitted_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.timetable_ingest_jobs
 DROP CONSTRAINT IF EXISTS timetable_ingest_jobs_status_check;
ALTER TABLE public.timetable_ingest_jobs
 ADD CONSTRAINT timetable_ingest_jobs_status_check
 CHECK (status IN ('pending','running','complete','partial','failed','empty'));
CREATE OR REPLACE FUNCTION public.persist_odpt_timetable_templates(p_line_id text, p_calendar_urn text, p_rows jsonb)
 RETURNS TABLE(train_count integer, stop_count integer)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_expected_urn text;
  v_templates integer;
  v_stops integer;
  v_source text := 'odpt-api:v1:' || p_line_id;
BEGIN
  SELECT 'odpt.Railway:' || odpt_operator || '.' || odpt_railway
  INTO v_expected_urn
  FROM public.railway_lines
  WHERE id=p_line_id AND timetable_api_enabled=true;
  IF v_expected_urn IS NULL THEN RAISE EXCEPTION 'TIMETABLE_API_NOT_ENABLED'; END IF;
  IF p_calendar_urn NOT IN ('odpt.Calendar:Weekday','odpt.Calendar:SaturdayHoliday','odpt.Calendar:Saturday','odpt.Calendar:Sunday','odpt.Calendar:Holiday')
  THEN RAISE EXCEPTION 'INVALID_CALENDAR'; END IF;
  IF p_rows IS NULL OR jsonb_typeof(p_rows)<>'array' OR jsonb_array_length(p_rows)=0
  THEN RAISE EXCEPTION 'INVALID_BATCH'; END IF;
  IF jsonb_array_length(p_rows)>999 THEN RAISE EXCEPTION 'UNVERIFIED_BATCH_SIZE'; END IF;

  CREATE TEMP TABLE _tt_odpt_import_stage ON COMMIT DROP AS
  SELECT e.value AS raw, e.ord AS source_order,
    e.value->>'odpt:trainNumber' AS train_no,
    e.value->>'odpt:railway' AS railway_urn,
    (row_number() OVER (
      PARTITION BY (e.value->>'odpt:trainNumber'), (e.value->>'odpt:railway')
      ORDER BY e.ord
    ) - 1)::integer AS occurrence
  FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS e(value,ord);

  IF EXISTS (
    SELECT 1 FROM pg_temp._tt_odpt_import_stage s
    WHERE NULLIF(s.train_no,'') IS NULL
      OR s.railway_urn IS DISTINCT FROM v_expected_urn
      OR (s.raw->>'odpt:calendar') IS DISTINCT FROM p_calendar_urn
      OR jsonb_typeof(s.raw->'odpt:trainTimetableObject') IS DISTINCT FROM 'array'
  ) THEN RAISE EXCEPTION 'TIMETABLE_SOURCE_IDENTITY_MISMATCH'; END IF;
  -- Keep only verified runs with usable station/time evidence. Invalid upstream
  -- records must not destroy the entire line snapshot or become positions.
  CREATE TEMP TABLE _tt_odpt_import_valid ON COMMIT DROP AS
  SELECT s.*
  FROM pg_temp._tt_odpt_import_stage s
  WHERE jsonb_array_length(s.raw->'odpt:trainTimetableObject') >= 2
    AND (SELECT COUNT(*) FROM jsonb_array_elements(s.raw->'odpt:trainTimetableObject') AS z(row)
      WHERE coalesce(nullif(z.row->>'odpt:arrivalTime',''),nullif(z.row->>'odpt:departureTime','')) IS NOT NULL) >= 2
    AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(s.raw->'odpt:trainTimetableObject') AS z(row)
      WHERE coalesce(nullif(z.row->>'odpt:arrivalStation',''),nullif(z.row->>'odpt:departureStation','')) IS NULL);
  IF NOT EXISTS (SELECT 1 FROM pg_temp._tt_odpt_import_valid)
  THEN RAISE EXCEPTION 'NO_VERIFIED_TIMETABLE_SEGMENTS'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.manual_timetable_templates
    WHERE line_key=p_line_id AND calendar_urn=p_calendar_urn AND source_path<>v_source
  ) THEN RAISE EXCEPTION 'EXISTING_INDEPENDENT_SOURCE_REQUIRES_RECONCILIATION'; END IF;

  -- Transactional full replacement. A failure rolls back the previous good snapshot.
  DELETE FROM public.manual_timetable_templates
  WHERE line_key=p_line_id AND calendar_urn=p_calendar_urn AND source_path=v_source;

  INSERT INTO public.manual_timetable_templates
    (line_key,calendar_urn,train_number,railway_urn,direction_urn,train_type_urn,destination_urns,source_path,source_occurrence)
  SELECT p_line_id,p_calendar_urn,s.train_no,s.railway_urn,
    nullif(s.raw->>'odpt:railDirection',''),
    nullif(s.raw->>'odpt:trainType',''),
    CASE jsonb_typeof(s.raw->'odpt:destinationStation')
      WHEN 'array' THEN ARRAY(SELECT jsonb_array_elements_text(s.raw->'odpt:destinationStation'))
      WHEN 'string' THEN ARRAY[s.raw->>'odpt:destinationStation']
      ELSE ARRAY[]::text[]
    END,
    v_source,s.occurrence
  FROM pg_temp._tt_odpt_import_valid s;
  GET DIAGNOSTICS v_templates=ROW_COUNT;

  INSERT INTO public.manual_timetable_template_stops
    (template_id,stop_sequence,arrival_station_urn,departure_station_urn,arrival_clock,departure_clock)
  SELECT t.id,(z.ord-1)::integer,
    nullif(z.row->>'odpt:arrivalStation',''),nullif(z.row->>'odpt:departureStation',''),
    nullif(z.row->>'odpt:arrivalTime',''),nullif(z.row->>'odpt:departureTime','')
  FROM pg_temp._tt_odpt_import_valid s
  JOIN public.manual_timetable_templates t
    ON t.line_key=p_line_id AND t.calendar_urn=p_calendar_urn AND t.source_path=v_source
    AND t.train_number=s.train_no AND t.railway_urn=s.railway_urn
    AND t.source_occurrence=s.occurrence
  CROSS JOIN LATERAL jsonb_array_elements(s.raw->'odpt:trainTimetableObject') WITH ORDINALITY AS z(row,ord);
  GET DIAGNOSTICS v_stops=ROW_COUNT;

  RETURN QUERY SELECT v_templates,v_stops;
END;
$function$


