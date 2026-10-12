CREATE SCHEMA IF NOT EXISTS railway_archive;
CREATE TABLE railway_archive.saikyo_kawagoe_templates_20261013 AS
  SELECT * FROM public.manual_timetable_templates WHERE line_key='SaikyoKawagoe';
CREATE TABLE railway_archive.saikyo_kawagoe_stops_20261013 AS
  SELECT s.* FROM public.manual_timetable_template_stops s
  INNER JOIN public.manual_timetable_templates t ON t.id=s.template_id
  WHERE t.line_key='SaikyoKawagoe';
