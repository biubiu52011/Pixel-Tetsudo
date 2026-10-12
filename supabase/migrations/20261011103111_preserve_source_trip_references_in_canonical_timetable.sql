ALTER TABLE public.manual_timetable_templates
 ADD COLUMN IF NOT EXISTS source_trip_id text,
 ADD COLUMN IF NOT EXISTS previous_timetable_ids text[],
 ADD COLUMN IF NOT EXISTS next_timetable_ids text[],
 ADD COLUMN IF NOT EXISTS source_revision_date date;
COMMENT ON COLUMN public.manual_timetable_templates.source_trip_id IS 'Original trip identity in the source timetable; never substitute a synthetic train number.';
COMMENT ON COLUMN public.manual_timetable_templates.previous_timetable_ids IS 'Source-provided previous segment timetable identifiers (unverified until the referenced segment exists).';
COMMENT ON COLUMN public.manual_timetable_templates.next_timetable_ids IS 'Source-provided next segment timetable identifiers (unverified until the referenced segment exists).';
COMMENT ON COLUMN public.manual_timetable_templates.source_revision_date IS 'Source timetable revision date, not an assertion that the timetable remains current.';
