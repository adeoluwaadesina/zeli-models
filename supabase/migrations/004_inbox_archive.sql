-- Admin inbox: soft-archive with timed purge (app deletes rows archived > 30 days)
alter table public.contact_submissions
  add column if not exists archived_at timestamptz;

alter table public.model_applications
  add column if not exists archived_at timestamptz;

create index if not exists contact_submissions_archived_at_idx
  on public.contact_submissions (archived_at desc)
  where archived_at is not null;

create index if not exists model_applications_archived_at_idx
  on public.model_applications (archived_at desc)
  where archived_at is not null;
