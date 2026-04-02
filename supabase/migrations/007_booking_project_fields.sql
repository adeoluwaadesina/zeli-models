-- Extra book-a-model lead fields (reference: project details)
alter table public.contact_submissions
  add column if not exists project_type text,
  add column if not exists budget_range text,
  add column if not exists project_date text,
  add column if not exists project_location text,
  add column if not exists project_duration text;
