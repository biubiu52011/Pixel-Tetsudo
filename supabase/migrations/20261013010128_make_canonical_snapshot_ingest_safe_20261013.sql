
alter table public.train_timetables alter column lead_source_template_id drop not null;
alter table public.train_timetables drop constraint train_timetables_lead_source_template_id_fkey;
alter table public.train_timetables add constraint train_timetables_lead_source_template_id_fkey
  foreign key(lead_source_template_id) references public.manual_timetable_templates(id) on delete set null;

alter table public.train_timetable_members drop constraint train_timetable_members_source_template_id_fkey;
alter table public.train_timetable_members add constraint train_timetable_members_source_template_id_fkey
  foreign key(source_template_id) references public.manual_timetable_templates(id) on delete cascade;

alter table public.train_timetable_continuity drop constraint train_timetable_continuity_from_template_id_fkey;
alter table public.train_timetable_continuity add constraint train_timetable_continuity_from_template_id_fkey
  foreign key(from_template_id) references public.manual_timetable_templates(id) on delete cascade;
alter table public.train_timetable_continuity drop constraint train_timetable_continuity_to_template_id_fkey;
alter table public.train_timetable_continuity add constraint train_timetable_continuity_to_template_id_fkey
  foreign key(to_template_id) references public.manual_timetable_templates(id) on delete cascade;

