-- Heritage Union: clients, phase 4 (automation, closing, feedback, concerns).
-- Safe to run more than once. Needs the client phase 3 migration first.
-- RLS on with no policies, as everywhere else.

-- 1. When each automatic step happened, so the daily job is safe to run twice.
alter table public.clients add column if not exists thinking_reminder_sent_at timestamptz;
alter table public.clients add column if not exists checkin_sent_at timestamptz;          -- R18, once
alter table public.clients add column if not exists engagement_flagged_at timestamptz;    -- reached 12 months
alter table public.clients add column if not exists closed_kind text;                     -- success | completed | closed
alter table public.clients add column if not exists closed_by text;
alter table public.clients add column if not exists paused_reason text;
alter table public.clients add column if not exists feedback_token_hash text;
alter table public.clients add column if not exists feedback_token_expires_at timestamptz;
alter table public.clients add column if not exists feedback_requested_at timestamptz;     -- R21

create index if not exists clients_feedback_token_idx on public.clients (feedback_token_hash) where feedback_token_hash is not null;

-- 2. Feedback (R21). Kept after his documents are deleted. Never published
--    without the permission he chose here.
create table if not exists public.client_feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  rating smallint not null,
  comments text,
  publish_permission text not null default 'none',   -- none | first_name | first_name_country | anonymous
  permission_text_version text not null,
  created_at timestamptz not null default now(),
  constraint client_feedback_rating_check check (rating between 1 and 5),
  constraint client_feedback_permission_check check (publish_permission in ('none', 'first_name', 'first_name_country', 'anonymous')),
  constraint client_feedback_comments_length check (comments is null or char_length(comments) <= 4000)
);

alter table public.client_feedback enable row level security;

-- 3. Concerns from /contact?concern=1 and /vi/contact?concern=1.
create table if not exists public.concerns (
  id uuid primary key default gen_random_uuid(),
  about text not null,               -- client | woman | heritage_union | other
  reporter_role text not null,       -- candidate | client | other
  reporter_name text,
  reporter_contact text,
  subject_hint text,                 -- name or reference of the person it is about, if known
  message text not null,
  lang text not null default 'en',
  client_id uuid references public.clients(id) on delete set null,   -- linked by the team
  ip_hash text not null,
  handled_at timestamptz,
  handled_by text,
  created_at timestamptz not null default now(),
  constraint concerns_about_check check (about in ('client', 'woman', 'heritage_union', 'other')),
  constraint concerns_role_check check (reporter_role in ('candidate', 'client', 'other')),
  constraint concerns_message_length check (char_length(message) <= 5000)
);

create index if not exists concerns_created_idx on public.concerns (created_at desc);
alter table public.concerns enable row level security;
