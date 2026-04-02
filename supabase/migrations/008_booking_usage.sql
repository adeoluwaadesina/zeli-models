alter table public.contact_submissions
  add column if not exists project_usage text;
