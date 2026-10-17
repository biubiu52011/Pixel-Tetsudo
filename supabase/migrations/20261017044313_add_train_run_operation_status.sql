alter table public.train_runs
 add column operation_status text not null default 'scheduled',
 add column operation_status_source_url text,
 add column operation_status_updated_at timestamptz,
 add constraint train_runs_operation_status_check check(operation_status in ('scheduled','cancelled')),
 add constraint train_runs_cancelled_source_check check(operation_status<>'cancelled' or (operation_status_source_url is not null and operation_status_updated_at is not null));
comment on column public.train_runs.operation_status is 'Date-specific operating fact. Cancellation never removes the published planned stops.';