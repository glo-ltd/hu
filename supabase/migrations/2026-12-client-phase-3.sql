-- Heritage Union: clients, phase 3 (her decision and the introduction).
-- Safe to run more than once. Needs the client phase 2 migration first.
-- RLS on with no policies, as everywhere else.

-- 1. One row per client and woman he chose (including replacements).
--    status: queued (she has another request open), ready (can be sent),
--    sent, opened, accepted, introduced, declined, expired, cancelled.
--    Only one request per woman may be open (sent or opened) at a time.
create table if not exists public.introductions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  rank smallint not null,
  is_replacement boolean not null default false,
  status text not null default 'ready',
  status_changed_at timestamptz not null default now(),

  -- Her private decision link: sha256 only, separate from her profile link.
  decision_token_hash text,
  decision_token_expires_at timestamptz,
  sent_at timestamptz,
  sent_by text,
  opened_at timestamptz,

  -- Her decision. "consent" holds only the details she chose to share
  -- ({ zalo?, email?, phone?, contact: [...] }).
  decided_at timestamptz,
  decision_lang text,
  consent jsonb,
  consent_typed_name text,
  consent_text_version text,
  consent_ip_hash text,
  decline_reason text,              -- private: never shown to him

  -- "Ask him for an official background check first". Heritage Union does
  -- not carry out background checks; she may ask him for an official
  -- certificate. He may provide one or decline. While this is going on her
  -- request stays open and its 30-day expiry is paused.
  cert_requested_at timestamptz,    -- she asked
  cert_request_sent_at timestamptz, -- the team sent him the request (R22)
  cert_request_sent_by text,
  cert_response text,               -- provided | declined
  cert_responded_at timestamptz,
  cert_path text,                   -- <client_id>/certificate/<uuid>.<ext> in client-documents
  cert_seen_at timestamptz,         -- the team has looked at it; only then is it shown to her
  cert_seen_by text,
  expiry_paused_at timestamptz,

  -- The introduction itself, and closing states.
  introduced_at timestamptz,
  introduced_by text,
  reminder_sent_at timestamptz,     -- R14 (phase 4)
  expired_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,               -- withdrawn | paused | closed | team
  declined_notice_sent_at timestamptz, -- R17

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint introductions_status_check check (status in ('queued', 'ready', 'sent', 'opened', 'accepted', 'introduced', 'declined', 'expired', 'cancelled')),
  constraint introductions_cert_response_check check (cert_response is null or cert_response in ('provided', 'declined')),
  constraint introductions_reason_length check (decline_reason is null or char_length(decline_reason) <= 2000),
  constraint introductions_one_per_pair unique (client_id, candidate_id)
);

create index if not exists introductions_candidate_status_idx on public.introductions (candidate_id, status);
create index if not exists introductions_client_idx on public.introductions (client_id);
create index if not exists introductions_token_idx on public.introductions (decision_token_hash) where decision_token_hash is not null;
-- The "one open request per woman" rule, enforced by the database as well.
create unique index if not exists introductions_one_open_per_woman on public.introductions (candidate_id) where status in ('sent', 'opened');

alter table public.introductions enable row level security;

drop trigger if exists introductions_set_updated_at on public.introductions;
create trigger introductions_set_updated_at
  before update on public.introductions
  for each row
  execute function public.set_updated_at();

-- 2. "I have a question first": her messages to the team about a request.
create table if not exists public.introduction_questions (
  id uuid primary key default gen_random_uuid(),
  introduction_id uuid not null references public.introductions(id) on delete cascade,
  message text not null,
  lang text,
  answered_at timestamptz,
  answered_by text,
  created_at timestamptz not null default now(),
  constraint introduction_questions_length check (char_length(message) <= 2000)
);

create index if not exists introduction_questions_intro_idx on public.introduction_questions (introduction_id);
alter table public.introduction_questions enable row level security;

-- 3. For a project where an earlier draft of this file was already applied.
alter table public.introductions add column if not exists cert_requested_at timestamptz;
alter table public.introductions add column if not exists cert_request_sent_at timestamptz;
alter table public.introductions add column if not exists cert_request_sent_by text;
alter table public.introductions add column if not exists cert_response text;
alter table public.introductions add column if not exists cert_responded_at timestamptz;
alter table public.introductions add column if not exists cert_path text;
alter table public.introductions add column if not exists cert_seen_at timestamptz;
alter table public.introductions add column if not exists cert_seen_by text;
alter table public.introductions add column if not exists expiry_paused_at timestamptz;
