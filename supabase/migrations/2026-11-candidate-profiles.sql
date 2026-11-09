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
