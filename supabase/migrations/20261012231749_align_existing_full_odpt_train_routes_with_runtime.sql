-- Align Supabase realtime availability to the existing ODPT Train + FULL
-- runtime policy for exact local IDs. Do not relabel legacy Keio aliases:
-- KeioSagami/KeioShin/KeioZoo still require independent feed verification.
-- TrainTimetable capability remains unchanged; this migration adds Train only.
WITH verified(id, operator_key, railway_code, base_url) AS (
 VALUES
 ('KeioInokashira','Keio','Inokashira','https://api-challenge.odpt.org/api/v4/'),
 ('KeioKeibajo','Keio','Keibajo','https://api-challenge.odpt.org/api/v4/'),
 ('KeioTakao','Keio','Takao','https://api-challenge.odpt.org/api/v4/'),
 ('Noda','Tobu','TobuUrbanPark','https://api-challenge.odpt.org/api/v4/'),
 ('Tojo','Tobu','Tojo','https://api-challenge.odpt.org/api/v4/'),
 ('Ogose','Tobu','Ogose','https://api-challenge.odpt.org/api/v4/')
)
UPDATE public.railway_lines AS l
SET odpt_operator=v.operator_key,
    odpt_railway=v.railway_code,
    odpt_base_url=v.base_url,
    realtime_position_api_enabled=true
FROM verified AS v
WHERE l.id=v.id
  AND l.realtime_position_api_enabled IS FALSE
  AND l.odpt_operator IS NULL
  AND l.odpt_railway IS NULL
  AND l.odpt_base_url IS NULL;
