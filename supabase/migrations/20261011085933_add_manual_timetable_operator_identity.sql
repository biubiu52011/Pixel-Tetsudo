ALTER TABLE public.railway_lines
  ADD COLUMN IF NOT EXISTS timetable_operator text;
COMMENT ON COLUMN public.railway_lines.timetable_operator IS
  'Company/operator identity for curated SQL timetable records, independent of odpt_operator and realtime API configuration.';
WITH operators AS (
  SELECT line_key,
    max(CASE
      WHEN line_key = 'MinatoMirai' THEN 'YokohamaMinatomiraiRailway'
      WHEN line_key = 'TokyoMonorail' THEN 'TokyoMonorail'
      ELSE substring(railway_urn FROM '^odpt[.]Railway:([^.]+)[.]')
    END) AS operator_key
  FROM public.manual_timetable_templates
  GROUP BY line_key
)
UPDATE public.railway_lines AS lines
SET timetable_operator = operators.operator_key
FROM operators
WHERE lines.id = operators.line_key
  AND operators.operator_key IS NOT NULL
  AND lines.timetable_operator IS DISTINCT FROM operators.operator_key;
