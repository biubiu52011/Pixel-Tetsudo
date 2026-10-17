-- Cancellation facts have been preserved in the existing service_exceptions owner.
alter table public.train_runs
 drop column operation_status,
 drop column operation_status_source_url,
 drop column operation_status_updated_at;