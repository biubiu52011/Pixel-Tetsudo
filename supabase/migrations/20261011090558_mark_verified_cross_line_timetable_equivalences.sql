
ALTER TABLE public.manual_timetable_templates
  ADD COLUMN IF NOT EXISTS physical_service_key text;
COMMENT ON COLUMN public.manual_timetable_templates.physical_service_key IS
  'Verified cross-line same physical train: same service calendar and exact ordered station/time itinerary on 2+ line keys. Null means not proven; source rows are retained.';
WITH signatures AS (
  SELECT t.id, t.line_key, t.calendar_urn,
    md5(string_agg(
      concat_ws('|',s.stop_sequence::text,coalesce(s.arrival_station_urn,''),coalesce(s.departure_station_urn,''),
        coalesce(s.arrival_clock,''),coalesce(s.departure_clock,'')),
      ';' ORDER BY s.stop_sequence
    )) AS schedule_fingerprint,
    count(*) AS stop_count,
    count(*) FILTER (WHERE s.arrival_clock IS NOT NULL OR s.departure_clock IS NOT NULL) AS timed_stops
  FROM public.manual_timetable_templates t
  JOIN public.manual_timetable_template_stops s ON s.template_id=t.id
  GROUP BY t.id
), verified AS (
  SELECT calendar_urn,schedule_fingerprint
  FROM signatures
  GROUP BY calendar_urn,schedule_fingerprint
  HAVING count(DISTINCT line_key)>1 AND min(stop_count)>=2 AND min(timed_stops)>=2
)
UPDATE public.manual_timetable_templates AS t
SET physical_service_key = 'shared-itinerary:' || md5(s.calendar_urn || '|' || s.schedule_fingerprint)
FROM signatures s
JOIN verified v ON v.calendar_urn=s.calendar_urn AND v.schedule_fingerprint=s.schedule_fingerprint
WHERE t.id=s.id
  AND t.physical_service_key IS DISTINCT FROM 'shared-itinerary:' || md5(s.calendar_urn || '|' || s.schedule_fingerprint);

