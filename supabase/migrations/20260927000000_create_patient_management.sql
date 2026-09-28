-- ==============================================================================
-- MedSathi — Phase 3: Patient Management, Multi-Caregiver Association & RLS
-- Migration: 20260927000000_create_patient_management.sql
-- ==============================================================================

-- 1. Create public.patients table
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  age integer not null check (age > 0 and age < 130),
  photo_url text not null check (length(trim(photo_url)) > 0),
  photo_public_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes on patients
create index if not exists idx_patients_created_at on public.patients(created_at desc);

-- 2. Create public.caregiver_patients table (junction table)
create table if not exists public.caregiver_patients (
  id uuid primary key default gen_random_uuid(),
  caregiver_user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint uq_caregiver_patient unique (caregiver_user_id, patient_id)
);

-- Indexes on caregiver_patients
create index if not exists idx_caregiver_patients_caregiver on public.caregiver_patients(caregiver_user_id);
create index if not exists idx_caregiver_patients_patient on public.caregiver_patients(patient_id);
create index if not exists idx_caregiver_patients_created_at on public.caregiver_patients(created_at desc);

-- Enforce exactly one primary caregiver per patient via partial unique index
create unique index if not exists idx_unique_primary_caregiver_per_patient 
  on public.caregiver_patients(patient_id) 
  where (is_primary = true);

-- 3. Database trigger to enforce maximum 3 caregivers per patient
create or replace function public.check_max_caregivers_per_patient()
returns trigger as $$
declare
  current_count integer;
begin
  select count(*) into current_count
  from public.caregiver_patients
  where patient_id = new.patient_id;

  if current_count >= 3 then
    raise exception 'Maximum limit reached: A patient cannot have more than 3 caregivers.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_max_caregivers on public.caregiver_patients;
create trigger trg_enforce_max_caregivers
  before insert on public.caregiver_patients
  for each row
  execute function public.check_max_caregivers_per_patient();

-- 4. Trigger to keep updated_at current on patients table
drop trigger if exists on_patient_updated on public.patients;
create trigger on_patient_updated
  before update on public.patients
  for each row
  execute function public.handle_profile_updated_at();

-- 5. Helper security functions for RLS (security definer prevents policy recursion)
create or replace function public.is_caregiver_for_patient(p_patient_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.caregiver_patients
    where patient_id = p_patient_id
      and caregiver_user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create or replace function public.is_primary_caregiver(p_patient_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.caregiver_patients
    where patient_id = p_patient_id
      and caregiver_user_id = auth.uid()
      and is_primary = true
  );
end;
$$ language plpgsql security definer stable;

-- 6. Enable Row Level Security (RLS)
alter table public.patients enable row level security;
alter table public.caregiver_patients enable row level security;

-- 7. RLS Policies on public.patients
-- Select: Caregivers can only select patients they are assigned to
drop policy if exists "Caregivers can view their assigned patients" on public.patients;
create policy "Caregivers can view their assigned patients"
  on public.patients
  for select
  using (public.is_caregiver_for_patient(id));

-- Insert: Any authenticated caregiver can insert a patient
drop policy if exists "Authenticated caregivers can insert patients" on public.patients;
create policy "Authenticated caregivers can insert patients"
  on public.patients
  for insert
  to authenticated
  with check (true);

-- Update: Only PRIMARY caregiver can update patient information
drop policy if exists "Only primary caregiver can update patient" on public.patients;
create policy "Only primary caregiver can update patient"
  on public.patients
  for update
  using (public.is_primary_caregiver(id))
  with check (public.is_primary_caregiver(id));

-- Delete: Only PRIMARY caregiver can delete patient (cascades to caregiver_patients)
drop policy if exists "Only primary caregiver can delete patient" on public.patients;
create policy "Only primary caregiver can delete patient"
  on public.patients
  for delete
  using (public.is_primary_caregiver(id));

-- 8. RLS Policies on public.caregiver_patients
-- Select: Caregivers can view their own relationship rows or rows for their patients
drop policy if exists "Caregivers can view relationships for their patients" on public.caregiver_patients;
create policy "Caregivers can view relationships for their patients"
  on public.caregiver_patients
  for select
  using (
    caregiver_user_id = auth.uid()
    or public.is_caregiver_for_patient(patient_id)
  );

-- Insert: 
-- (a) Creator self-assignment as primary when patient has no existing caregivers
-- (b) Primary caregiver adding a secondary caregiver (is_primary must be false)
drop policy if exists "Caregiver relationship creation policy" on public.caregiver_patients;
create policy "Caregiver relationship creation policy"
  on public.caregiver_patients
  for insert
  to authenticated
  with check (
    -- Initial creator self-assignment
    (
      caregiver_user_id = auth.uid()
      and not exists (
        select 1 from public.caregiver_patients cp 
        where cp.patient_id = patient_id
      )
      and is_primary = true
    )
    -- OR Primary caregiver adding secondary caregiver
    or (
      public.is_primary_caregiver(patient_id)
      and is_primary = false
    )
  );

-- Delete: Only PRIMARY caregiver can remove secondary caregivers (cannot remove self directly)
drop policy if exists "Primary caregiver can remove secondary caregivers" on public.caregiver_patients;
create policy "Primary caregiver can remove secondary caregivers"
  on public.caregiver_patients
  for delete
  using (
    public.is_primary_caregiver(patient_id)
    and is_primary = false
  );

-- 9. Atomic Patient Creation RPC Function
create or replace function public.create_patient_with_primary_caregiver(
  p_full_name text,
  p_age integer,
  p_photo_url text,
  p_photo_public_id text default null
)
returns jsonb as $$
declare
  v_patient public.patients;
  v_caregiver_id uuid;
begin
  v_caregiver_id := auth.uid();
  if v_caregiver_id is null then
    raise exception 'Authentication required to create a patient.';
  end if;

  -- Insert patient record
  insert into public.patients (full_name, age, photo_url, photo_public_id)
  values (trim(p_full_name), p_age, trim(p_photo_url), p_photo_public_id)
  returning * into v_patient;

  -- Create primary caregiver relationship
  insert into public.caregiver_patients (caregiver_user_id, patient_id, is_primary)
  values (v_caregiver_id, v_patient.id, true);

  return to_jsonb(v_patient) || jsonb_build_object('is_primary', true);
end;
$$ language plpgsql security definer;

-- 10. RPC Function to lookup existing caregiver by email
create or replace function public.find_caregiver_by_email(p_email text)
returns jsonb as $$
declare
  v_user_id uuid;
  v_profile public.profiles;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    return null;
  end if;

  select * into v_profile
  from public.profiles
  where user_id = v_user_id;

  return jsonb_build_object(
    'user_id', v_user_id,
    'full_name', coalesce(v_profile.full_name, 'Caregiver'),
    'phone', v_profile.phone,
    'relationship_to_patient', v_profile.relationship_to_patient
  );
end;
$$ language plpgsql security definer;

-- Comments
comment on table public.patients is 'Stores Patient records created and managed by Caregivers.';
comment on table public.caregiver_patients is 'M-to-N relationship between Caregivers and Patients with max 3 caregivers per patient and 1 primary caregiver.';
