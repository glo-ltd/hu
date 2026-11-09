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
