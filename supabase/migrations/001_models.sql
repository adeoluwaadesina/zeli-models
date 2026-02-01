-- Zeli Models: models table (Supabase Postgres)

create table if not exists public.models (
  id text primary key,
  name text not null,
  height text not null,
  bio text not null,
  images text[] not null default '{}'::text[],
  position int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists models_position_idx on public.models (position);

alter table public.models enable row level security;

-- Public portfolio can read models
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'models'
      and policyname = 'Public read models'
  ) then
    create policy "Public read models"
      on public.models
      for select
      using (true);
  end if;
end $$;

