-- Simplified model applications (age + single address); optional legacy location columns
alter table public.model_applications
  add column if not exists applicant_age int,
  add column if not exists applicant_address text not null default '';

alter table public.model_applications alter column dob drop not null;
alter table public.model_applications alter column gender drop not null;
alter table public.model_applications alter column country drop not null;
alter table public.model_applications alter column state drop not null;
alter table public.model_applications alter column city drop not null;

alter table public.model_applications alter column gender set default 'other';
alter table public.model_applications alter column country set default '';
alter table public.model_applications alter column state set default '';
alter table public.model_applications alter column city set default '';

-- Book-a-model lead fields on contact submissions
alter table public.contact_submissions
  add column if not exists gender_preference text,
  add column if not exists model_count_total int,
  add column if not exists model_count_female int,
  add column if not exists model_count_male int,
  add column if not exists terms_accepted boolean not null default false;
