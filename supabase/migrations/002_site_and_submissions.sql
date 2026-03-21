-- Extend models for gender, featured roster, tags, measurements
alter table public.models
  add column if not exists gender text not null default 'female'
    check (gender in ('female', 'male')),
  add column if not exists featured boolean not null default false,
  add column if not exists featured_order int,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists chest text not null default '',
  add column if not exists waist text not null default '',
  add column if not exists shoe text not null default '',
  add column if not exists eyes text not null default '',
  add column if not exists hair text not null default '',
  add column if not exists height_cm text not null default '';

-- Site content (single row id = 1)
create table if not exists public.site_settings (
  id int primary key check (id = 1),
  marquee_categories text[] not null default '{}'::text[],
  what_we_do jsonb not null default '[]'::jsonb,
  our_values jsonb not null default '[]'::jsonb,
  instagram_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_settings' and policyname = 'Public read site_settings'
  ) then
    create policy "Public read site_settings"
      on public.site_settings for select using (true);
  end if;
end $$;

-- Contact form (server-side insert only via service role; no anon policies)
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  company text not null default '',
  message text not null,
  read_flag boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Model applications
create table if not exists public.model_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  dob date not null,
  gender text not null,
  country text not null,
  state text not null,
  city text not null,
  height_feet int not null,
  height_inches int not null,
  portfolio_link text not null default '',
  interests text[] not null default '{}'::text[],
  interests_other text not null default '',
  photo_urls text[] not null default '{}'::text[],
  status text not null default 'new' check (status in ('new', 'reviewed')),
  created_at timestamptz not null default now()
);

alter table public.model_applications enable row level security;

create index if not exists contact_submissions_created_idx on public.contact_submissions (created_at desc);
create index if not exists model_applications_created_idx on public.model_applications (created_at desc);
create index if not exists models_gender_idx on public.models (gender);
create index if not exists models_featured_idx on public.models (featured) where featured = true;
