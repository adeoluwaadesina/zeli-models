alter table public.models
  add column if not exists hips text not null default '';
