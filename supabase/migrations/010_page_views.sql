-- Site analytics: one row per public page view, written by /api/track (service role).
-- No personal data: visitor_hash is a salted daily hash, raw IPs are never stored.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  page_type text not null,
  model_id text,
  country text,
  city text,
  device text,
  referrer text,
  visitor_hash text
);

create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);

create index if not exists page_views_model_id_idx
  on public.page_views (model_id)
  where model_id is not null;

alter table public.page_views enable row level security;
