-- Optional image used only on the home "Featured models" grid (full-bleed card).
alter table public.models
  add column if not exists featured_image_url text not null default '';
