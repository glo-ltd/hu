-- Heritage Union candidate registration schema
--
-- Run this once against a new Supabase project (Singapore region).
-- Row Level Security is enabled with NO policies for the anon or
-- authenticated roles, so this table is completely inaccessible from the
-- browser or any client-side key. Only the service_role key (used only
-- inside netlify/functions/candidate-register.js and
-- netlify/functions/withdraw-candidate.js, never shipped to the browser)
-- can read or write it, because service_role bypasses RLS entirely.

create extension if not exists "pgcrypto";

create type candidate_status as enum (
  'new',
  'contacted',
  'profile_complete',
  'withdrawn',
  'deleted'
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),

  -- Form fields
  full_name text not null,
  date_of_birth date not null,
  province text not null,
  zalo_number text not null,
  email text,
  preferred_language text not null check (preferred_language in ('vi', 'en')),
  about_text text not null,
  source text,

  -- Consent (Vietnamese law: no pre-ticked boxes, so both of these are
  -- only ever set at the moment the visitor ticks them)
  consent_contact_at timestamptz not null,
  consent_processing_at timestamptz not null,
  consent_text_version text not null,
  -- Optional, separate consent to show a short profile (first name, age,
  -- province, about text; never surname, DOB or contact details) to
  -- clients. Null means she has not agreed: her profile must not be shown.
  -- Set back to null if she changes her mind.
  consent_profile_sharing_at timestamptz,

  -- Anti-abuse / provenance (never store a raw IP)
  ip_hash text not null,

  -- Lifecycle
  status candidate_status not null default 'new',
  needs_zalo_followup boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint candidates_full_name_length check (char_length(full_name) <= 100),
  constraint candidates_about_text_length check (char_length(about_text) <= 1500),
  constraint candidates_min_age check (date_of_birth <= (current_date - interval '18 years'))
);

create index if not exists candidates_status_idx on public.candidates (status);
create index if not exists candidates_created_at_idx on public.candidates (created_at desc);
create index if not exists candidates_zalo_number_idx on public.candidates (zalo_number);
create index if not exists candidates_email_idx on public.candidates (email) where email is not null;

-- Simple per-IP-hash rate limiting support: the function counts rows with
-- this ip_hash created in the last hour before inserting a new one.
create index if not exists candidates_ip_hash_created_idx on public.candidates (ip_hash, created_at desc);

alter table public.candidates enable row level security;
-- Deliberately no policies: anon and authenticated roles get zero access.
-- Only the service_role key (server-side only) can read or write.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists candidates_set_updated_at on public.candidates;
create trigger candidates_set_updated_at
  before update on public.candidates
  for each row
  execute function public.set_updated_at();

-- Waitlist (used while CANDIDATE_SIGNUPS_OPEN=false): just enough to notify
-- people once registrations open. Same RLS posture as above.
create table if not exists public.candidate_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null, -- Zalo number or email, whichever they gave
  consent_notify_at timestamptz not null,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_name_length check (char_length(name) <= 100),
  constraint waitlist_contact_length check (char_length(contact) <= 100)
);

create index if not exists candidate_waitlist_created_at_idx on public.candidate_waitlist (created_at desc);

alter table public.candidate_waitlist enable row level security;
-- No policies here either — service_role only.

-- Migration for databases created before the profile-sharing consent was
-- added (safe to run more than once).
alter table public.candidates add column if not exists consent_profile_sharing_at timestamptz;

-- ============================================================
-- Candidate profiles (November 2026). Identical copy of
-- supabase/migrations/2026-11-candidate-profiles.sql, so a new project
-- gets everything from this one file.
-- ============================================================

-- Heritage Union: candidate profiles, questionnaire and photo storage.
-- Applied to production on 2026-11-09. Safe to run more than once.

-- 1. New status (must run on its own, before anything uses it)
alter type candidate_status add value if not exists 'profile_in_progress';

-- 2. New columns on candidates
alter table public.candidates add column if not exists profile_token_hash text;
alter table public.candidates add column if not exists profile_token_expires_at timestamptz;
alter table public.candidates add column if not exists zalo_confirmed_at timestamptz;
alter table public.candidates add column if not exists profile_link_sent_at timestamptz;

create index if not exists candidates_profile_token_hash_idx
  on public.candidates (profile_token_hash) where profile_token_hash is not null;

-- 3. One profile per candidate, written by her. RLS on, no policies:
--    only the service role (server-side functions) can read or write.
create table if not exists public.candidate_profiles (
  candidate_id uuid primary key references public.candidates(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  questions_version text not null,
  display_name text,
  photo_paths text[] not null default '{}',
  consent_photo_sharing_at timestamptz,
  consent_profile_text_version text,
  confirmed_true_at timestamptz,
  submitted_at timestamptz,
  translations jsonb not null default '{}'::jsonb,
  translated_by text,
  translated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candidate_profiles_display_name_length check (display_name is null or char_length(display_name) <= 40),
  constraint candidate_profiles_max_photos check (coalesce(array_length(photo_paths, 1), 0) <= 3)
);

alter table public.candidate_profiles enable row level security;

drop trigger if exists candidate_profiles_set_updated_at on public.candidate_profiles;
create trigger candidate_profiles_set_updated_at
  before update on public.candidate_profiles
  for each row
  execute function public.set_updated_at();

-- 4. Private photo bucket. No storage policies: all access is through
--    signed URLs created server-side with the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-photos', 'candidate-photos', false, 3145728, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;
