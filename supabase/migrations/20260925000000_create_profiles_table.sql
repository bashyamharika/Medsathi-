-- ==============================================================================
-- MedSathi — Phase 2: Caregiver Profile Table & Row Level Security (RLS)
-- Migration: 20260925000000_create_profiles_table.sql
-- ==============================================================================

-- 1. Create public.profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  role text not null default 'caregiver' check (role in ('caregiver')),
  full_name text not null,
  age integer check (age is null or (age > 0 and age < 130)),
  phone text,
  relationship_to_patient text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create index on user_id for high-performance profile lookups
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 4. RLS Policy: Caregiver can only read their own profile
create policy "Caregivers can read own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

-- 5. RLS Policy: Caregiver can only insert their own profile
create policy "Caregivers can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

-- 6. RLS Policy: Caregiver can only update their own profile
create policy "Caregivers can update own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Trigger to keep updated_at automatically current
create or replace function public.handle_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.handle_profile_updated_at();

-- 8. Trigger to automatically provision public.profiles upon auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, role, full_name, age, phone, relationship_to_patient)
  values (
    new.id,
    'caregiver',
    coalesce(new.raw_user_meta_data->>'full_name', 'Caregiver'),
    case 
      when (new.raw_user_meta_data->>'age') ~ '^[0-9]+$' then (new.raw_user_meta_data->>'age')::integer
      else null
    end,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'relationship_to_patient'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Comment on table for documentation
comment on table public.profiles is 'Stores Caregiver profile records linked to Supabase Auth users.';

