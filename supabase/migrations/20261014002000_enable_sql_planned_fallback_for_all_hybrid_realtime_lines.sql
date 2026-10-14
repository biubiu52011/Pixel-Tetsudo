-- HYBRID uses source-verified SQL train-level plans for missing Train positions.
-- This is *eligibility*, not a declaration that a current full-day timetable exists.
-- FULL lines are absent from this list and must never synthesize SQL positions.
-- StationTimetable entries cannot be imported as TrainTimetable routes.
UPDATE public.railway_lines
SET sql_planned_fallback_enabled = true
WHERE realtime_position_api_enabled = true
  AND id IN (
    'ChuoRapid',
    'Joban',
    'JobanLocal',
    'Kawagoe',
    'KeihinTohoku',
    'Keiyo',
    'Mita',
    'Musashino',
    'Nambu',
    'ShonanShinjuku',
    'SobuRapid',
    'Takasaki',
    'TobuIsesaki',
    'TobuNikko',
    'Tokaido',
    'Tsurumi',
    'UtsunomiyaJR',
    'Yamanote',
    'Yokosuka'
  );

COMMENT ON COLUMN public.railway_lines.sql_planned_fallback_enabled IS
'Permits independently sourced SQL TrainTimetable records to supplement realtime positions on HYBRID lines only. Does not attest to source currency or full coverage; StationTimetable does not qualify.';
