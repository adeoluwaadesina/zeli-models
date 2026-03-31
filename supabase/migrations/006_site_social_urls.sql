alter table public.site_settings
  add column if not exists tiktok_url text not null default '';

alter table public.site_settings
  add column if not exists twitter_url text not null default '';
