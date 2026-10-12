-- Post-bootstrap repair of ODPT runtime mappings omitted by the historical
-- add_odpt_line_source_mapping migration. No blanket reset and no capability flips.
-- The runtime Train API flags are a separate, independently verified capability.
WITH source(id, odpt_operator, odpt_railway, odpt_base_url) AS (
 VALUES
  ('Arakawa','Toei','Arakawa','https://api.odpt.org/api/v4/'),
  ('KeioMain','Keio','Keio','https://api-challenge.odpt.org/api/v4/'),
  ('Kawagoe','JR-East','Kawagoe','https://api-challenge.odpt.org/api/v4/'),
  ('SaikyoKawagoe','JR-East','SaikyoKawagoe','https://api-challenge.odpt.org/api/v4/'),
  ('SobuRapid','JR-East','SobuRapid','https://api-challenge.odpt.org/api/v4/'),
  ('Tokaido','JR-East','Tokaido','https://api-challenge.odpt.org/api/v4/'),
  ('UtsunomiyaJR','JR-East','Utsunomiya','https://api-challenge.odpt.org/api/v4/')
)
UPDATE public.railway_lines l
 SET odpt_operator = src.odpt_operator,
     odpt_railway = src.odpt_railway,
     odpt_base_url = src.odpt_base_url
FROM source src
WHERE l.id = src.id
  AND l.realtime_position_api_enabled IS TRUE
  AND l.odpt_operator IS NULL AND l.odpt_railway IS NULL AND l.odpt_base_url IS NULL;
