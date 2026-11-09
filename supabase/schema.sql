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

-- ============================================================
-- Clients, phase 1 (December 2026). Identical copy of
-- supabase/migrations/2026-12-client-phase-1.sql.
-- ============================================================

-- Heritage Union: clients, phase 1 (enquiry to payment).
-- Safe to run more than once. Needs supabase/schema.sql (set_updated_at)
-- and the candidate profiles migration to have run first.
--
-- Same posture as every other table: Row Level Security on, NO policies,
-- so only the service role (Netlify Functions) can read or write. Client
-- documents live in a PRIVATE bucket with no storage policies; every upload
-- and view goes through a short-lived signed URL made by a function.

-- 1. Clients: one row per man, from first enquiry to the end of his engagement.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),

  -- F1 enquiry
  full_name text not null,
  email text not null,
  country text,
  age smallint,
  phone text,
  source text,
  enquiry_message text,
  consent_contact_at timestamptz,
  consent_text_version text,
  ip_hash text,

  -- Lifecycle. Values: enquiry, call_booked, call_held, thinking, invited,
  -- applying, submitted, checked, invoiced, active, paused, not_a_fit, closed.
  status text not null default 'enquiry',
  status_changed_at timestamptz not null default now(),
  fee_document_sent_at timestamptz,
  call_booked_at timestamptz,
  call_held_at timestamptz,
  thinking_since timestamptz,
  invited_at timestamptz,
  declined_at timestamptz,

  -- His private page (/client#t=...): sha256 of the token, never the token.
  access_token_hash text,
  access_token_expires_at timestamptz,
  link_sent_at timestamptz,

  -- F2 application and F3 background declaration (question ids in
  -- assets/data/client-application.json).
  application jsonb not null default '{}'::jsonb,
  declaration jsonb not null default '{}'::jsonb,
  declaration_typed_name text,
  declaration_signed_at timestamptz,
  declaration_ip_hash text,
  declaration_version text,
  agreement_version text,
  agreement_typed_name text,
  agreement_accepted_at timestamptz,
  submitted_at timestamptz,

  -- Documents (paths in the client-documents bucket) and the team's check.
  id_document_path text,
  certificate_path text,
  id_checked_at timestamptz,
  id_checked_by text,
  certificate_checked_at timestamptz,
  certificate_checked_by text,

  -- Engagement
  paid_at timestamptz,
  engagement_starts_at timestamptz,
  engagement_ends_at timestamptz,
  paused_at timestamptz,
  closed_at timestamptz,
  closed_reason text,
  documents_delete_after timestamptz,
  documents_deleted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clients_status_check check (status in ('enquiry', 'call_booked', 'call_held', 'thinking', 'invited', 'applying',
    'submitted', 'checked', 'invoiced', 'active', 'paused', 'not_a_fit', 'closed')),
  constraint clients_full_name_length check (char_length(full_name) <= 120),
  constraint clients_email_length check (char_length(email) <= 200),
  constraint clients_message_length check (enquiry_message is null or char_length(enquiry_message) <= 3000)
);

create unique index if not exists clients_email_lower_idx on public.clients (lower(email));
create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_created_at_idx on public.clients (created_at desc);
create index if not exists clients_access_token_hash_idx on public.clients (access_token_hash) where access_token_hash is not null;
create index if not exists clients_ip_hash_created_idx on public.clients (ip_hash, created_at desc);

alter table public.clients enable row level security;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

-- 2. Timeline: what happened and who did it. No personal data in "detail".
create table if not exists public.client_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null,
  actor text not null,          -- a team email, 'client' or 'system'
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists client_events_client_idx on public.client_events (client_id, created_at);
alter table public.client_events enable row level security;

-- 3. Invoices. Numbers (HU-YYYY-0001) are given when an invoice is sent.
create table if not exists public.client_invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null,           -- 'initiation' or 'honour'
  number text,
  description text not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'draft',
  created_by text not null,
  sent_at timestamptz,
  sent_by text,
  paid_at timestamptz,
  marked_paid_by text,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_invoices_kind_check check (kind in ('initiation', 'honour')),
  constraint client_invoices_status_check check (status in ('draft', 'sent', 'paid', 'void')),
  constraint client_invoices_amount_check check (amount_cents > 0)
);

create unique index if not exists client_invoices_number_idx on public.client_invoices (number) where number is not null;
create index if not exists client_invoices_client_idx on public.client_invoices (client_id);
alter table public.client_invoices enable row level security;

drop trigger if exists client_invoices_set_updated_at on public.client_invoices;
create trigger client_invoices_set_updated_at
  before update on public.client_invoices
  for each row
  execute function public.set_updated_at();

-- 4. Enquiries from press and others (not clients, not candidates).
create table if not exists public.general_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  country text,
  message text,
  consent_contact_at timestamptz not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.general_enquiries enable row level security;

-- 5. Private bucket for his photo ID and criminal record certificate
--    (and, from phase 2, his profile photos). 10 MB; PDF, JPEG or PNG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-documents', 'client-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- ============================================================
-- Clients, phase 2. Identical copy of
-- supabase/migrations/2026-12-client-phase-2.sql.
-- ============================================================

-- Heritage Union: clients, phase 2 (his profile to his 5 choices).
-- Safe to run more than once. Needs the client phase 1 migration first.
-- RLS on with no policies, as everywhere else.

-- 1. His profile (F4), written by him; the summary and translations,
--    written by the team. His photos are in the client-documents bucket
--    under <client_id>/photos/.
create table if not exists public.client_profiles (
  client_id uuid primary key references public.clients(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,         -- keyed by id in assets/data/client-profile-questions.json
  questions_version text not null,
  display_name text,
  photo_paths text[] not null default '{}',
  message_to_women text,                               -- shown to each woman he chooses
  submitted_at timestamptz,                            -- he finished F4

  -- The team's English summary (sanitised HTML) and its approval by him.
  summary_html text,
  summary_by text,
  summary_at timestamptz,
  summary_sent_at timestamptz,                         -- R9
  summary_approved_at timestamptz,                     -- R10
  changes_requested_at timestamptz,
  changes_comment text,

  -- Vietnamese translations (Huyen): summary, declaration (by field id), message.
  summary_vi_html text,
  declaration_vi jsonb not null default '{}'::jsonb,
  message_vi text,
  translated_by text,
  translated_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_profiles_display_name_length check (display_name is null or char_length(display_name) <= 40),
  constraint client_profiles_max_photos check (coalesce(array_length(photo_paths, 1), 0) <= 3),
  constraint client_profiles_message_length check (message_to_women is null or char_length(message_to_women) <= 500),
  constraint client_profiles_comment_length check (changes_comment is null or char_length(changes_comment) <= 2000)
);

alter table public.client_profiles enable row level security;

drop trigger if exists client_profiles_set_updated_at on public.client_profiles;
create trigger client_profiles_set_updated_at
  before update on public.client_profiles
  for each row
  execute function public.set_updated_at();

-- 2. The shortlist James sends him (up to 20 women who consented to sharing).
create table if not exists public.client_shortlists (
  client_id uuid not null references public.clients(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  added_by text not null,
  sent_at timestamptz not null default now(),
  primary key (client_id, candidate_id)
);

create index if not exists client_shortlists_candidate_idx on public.client_shortlists (candidate_id);
alter table public.client_shortlists enable row level security;

-- 3. His choices: up to 5, in order of preference.
create table if not exists public.client_choices (
  client_id uuid not null references public.clients(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  rank smallint not null,
  chosen_at timestamptz not null default now(),
  primary key (client_id, candidate_id),
  constraint client_choices_rank_check check (rank between 1 and 5)
);

create unique index if not exists client_choices_rank_idx on public.client_choices (client_id, rank);
alter table public.client_choices enable row level security;

-- 4. When the shortlist went to him, and when he sent his choices.
alter table public.clients add column if not exists shortlist_sent_at timestamptz;
alter table public.clients add column if not exists choices_submitted_at timestamptz;
