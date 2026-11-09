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
