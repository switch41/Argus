-- Argus Supabase Schema (idempotent)
-- This file is safe to re-run in Supabase SQL Editor.

-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'tourist' check (role in ('admin', 'tourist', 'police', 'tourism_official', 'responder', 'operator')),
  department text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tourist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  passport_number text,
  nationality text,
  date_of_birth text,
  blood_group text,
  digital_id_hash text unique,
  emergency_contact_1 jsonb,
  emergency_contact_2 jsonb,
  entry_point text,
  planned_duration integer,
  accommodation_address text,
  local_guide_contact text,
  medical_conditions text,
  is_active boolean not null default true,
  expiry_date bigint,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.geo_fences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  zone_type text check (zone_type in ('safe', 'restricted', 'high_risk', 'emergency')),
  coordinates jsonb,
  radius double precision,
  is_active boolean not null default true,
  creator_id uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid references public.tourist_profiles(id) on delete set null,
  alert_type text,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  title text,
  description text,
  location jsonb,
  is_resolved boolean not null default false,
  resolved_by uuid references auth.users(id),
  resolved_at bigint,
  assigned_to uuid references auth.users(id),
  response_time integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.location_history (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid references public.tourist_profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  is_manual boolean not null default false,
  location_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  message text,
  type text,
  is_read boolean not null default false,
  related_alert_id uuid references public.alerts(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  status text check (status in ('open', 'assigned', 'investigating', 'resolved', 'closed')),
  priority text check (priority in ('urgent', 'high', 'medium', 'low')),
  timeline jsonb not null default '[]'::jsonb,
  assigned_unit uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.device_signals (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid not null references public.tourist_profiles(id) on delete cascade,
  type text check (type in ('sos', 'vitals', 'location')),
  payload jsonb not null default '{}'::jsonb,
  "timestamp" timestamptz not null default timezone('utc', now())
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid not null references public.tourist_profiles(id) on delete cascade,
  title text not null,
  description text,
  start_date bigint not null,
  end_date bigint not null,
  planned_route jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.advisories (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  message text not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default timezone('utc', now())
);

-- Helpful indexes
create index if not exists idx_tourist_profiles_user_id on public.tourist_profiles(user_id);
create index if not exists idx_alerts_tourist_id on public.alerts(tourist_id);
create index if not exists idx_location_history_tourist_id on public.location_history(tourist_id);
create index if not exists idx_itineraries_tourist_id on public.itineraries(tourist_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- Auto-create profile rows for new auth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'tourist'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.tourist_profiles enable row level security;
alter table public.geo_fences enable row level security;
alter table public.alerts enable row level security;
alter table public.location_history enable row level security;
alter table public.notifications enable row level security;
alter table public.cases enable row level security;
alter table public.device_signals enable row level security;
alter table public.itineraries enable row level security;
alter table public.case_messages enable row level security;
alter table public.advisories enable row level security;

-- Drop policies so this script can be re-run
drop policy if exists "profiles_select_own_or_official" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "tourist_profiles_select_own_or_official" on public.tourist_profiles;
drop policy if exists "tourist_profiles_insert_own" on public.tourist_profiles;
drop policy if exists "tourist_profiles_update_own_or_official" on public.tourist_profiles;
drop policy if exists "itineraries_manage_own_or_official" on public.itineraries;
drop policy if exists "location_history_manage_own_or_official" on public.location_history;
drop policy if exists "alerts_create_own_tourist_or_official" on public.alerts;
drop policy if exists "alerts_select_own_or_official" on public.alerts;
drop policy if exists "alerts_update_official" on public.alerts;
drop policy if exists "notifications_select_own_or_official" on public.notifications;
drop policy if exists "notifications_insert_own_or_official" on public.notifications;
drop policy if exists "notifications_update_own_or_official" on public.notifications;
drop policy if exists "cases_select_official" on public.cases;
drop policy if exists "cases_modify_official" on public.cases;
drop policy if exists "device_signals_select_own_or_official" on public.device_signals;
drop policy if exists "device_signals_insert_own_or_official" on public.device_signals;
drop policy if exists "case_messages_select_official" on public.case_messages;
drop policy if exists "case_messages_insert_official" on public.case_messages;
drop policy if exists "advisories_select_all" on public.advisories;
drop policy if exists "advisories_modify_official" on public.advisories;
drop policy if exists "geo_fences_select_all" on public.geo_fences;
drop policy if exists "geo_fences_modify_official" on public.geo_fences;

-- Profiles
create policy "profiles_select_own_or_official"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

-- Tourist profiles
create policy "tourist_profiles_select_own_or_official"
on public.tourist_profiles for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "tourist_profiles_insert_own"
on public.tourist_profiles for insert
with check (user_id = auth.uid());

create policy "tourist_profiles_update_own_or_official"
on public.tourist_profiles for update
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Itineraries
create policy "itineraries_manage_own_or_official"
on public.itineraries for all
using (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
)
with check (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Location history
create policy "location_history_manage_own_or_official"
on public.location_history for all
using (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
)
with check (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Alerts
create policy "alerts_create_own_tourist_or_official"
on public.alerts for insert
with check (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "alerts_select_own_or_official"
on public.alerts for select
using (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "alerts_update_official"
on public.alerts for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Notifications
create policy "notifications_select_own_or_official"
on public.notifications for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "notifications_insert_own_or_official"
on public.notifications for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "notifications_update_own_or_official"
on public.notifications for update
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Cases
create policy "cases_select_official"
on public.cases for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "cases_modify_official"
on public.cases for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Device signals
create policy "device_signals_select_own_or_official"
on public.device_signals for select
using (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "device_signals_insert_own_or_official"
on public.device_signals for insert
with check (
  exists (select 1 from public.tourist_profiles tp where tp.id = tourist_id and tp.user_id = auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Case messages
create policy "case_messages_select_official"
on public.case_messages for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

create policy "case_messages_insert_official"
on public.case_messages for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official', 'responder', 'operator')
  )
);

-- Advisories
create policy "advisories_select_all"
on public.advisories for select
using (true);

create policy "advisories_modify_official"
on public.advisories for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'tourism_official')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'tourism_official')
  )
);

-- Geo-fences
create policy "geo_fences_select_all"
on public.geo_fences for select
using (true);

create policy "geo_fences_modify_official"
on public.geo_fences for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'police', 'tourism_official')
  )
);

-- Realtime for alerts (used by dashboard subscription)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'alerts'
  ) then
    alter publication supabase_realtime add table public.alerts;
  end if;
end
$$;

-- Force PostgREST to reload schema cache.
notify pgrst, 'reload schema';