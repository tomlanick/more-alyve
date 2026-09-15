-- ============================================================
-- More Alyve – Datenbankschema
-- Supabase (Region: Frankfurt eu-central-1)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  must_change_password boolean not null default false,
  premium       boolean not null default false,
  avatar_id     uuid,
  notification_morning_time  time default '07:00:00',
  notification_evening_time  time default '21:00:00',
  notifications_enabled      boolean not null default false,
  push_subscription          jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- AVATAR PROFILES (Persönlichkeits-Profile)
-- ============================================================
create table public.avatar_profiles (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  icon_emoji  text not null default '✨',
  color       text not null default '#FF1C47',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- HABIT TEMPLATES (Vorgegebene Habits)
-- ============================================================
create table public.habit_templates (
  id              uuid primary key default uuid_generate_v4(),
  avatar_id       uuid references public.avatar_profiles(id) on delete set null,
  name            text not null,
  description     text,
  icon_emoji      text not null default '✅',
  category        text,
  is_default      boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- USER HABITS (Vom User gewählte/eigene Habits)
-- ============================================================
create table public.user_habits (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  template_id     uuid references public.habit_templates(id) on delete set null,
  name            text not null,
  description     text,
  icon_emoji      text not null default '✅',
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- HABIT COMPLETIONS (Tägliche Abhakungen)
-- ============================================================
create table public.habit_completions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  user_habit_id   uuid not null references public.user_habits(id) on delete cascade,
  completed_date  date not null,
  completed_at    timestamptz not null default now(),
  unique(user_habit_id, completed_date)
);

-- ============================================================
-- DAILY SCORES (Täglicher Punktestand)
-- ============================================================
create table public.daily_scores (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  score_date      date not null,
  total_habits    integer not null default 0,
  completed_habits integer not null default 0,
  points          integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, score_date)
);

-- ============================================================
-- ROUTINE PROMPTS (Morgen/Abend Fragen-Vorlagen)
-- ============================================================
create table public.routine_prompts (
  id              uuid primary key default uuid_generate_v4(),
  type            text not null check (type in ('morning', 'evening')),
  prompt_text     text not null,
  placeholder_text text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true
);

-- ============================================================
-- ROUTINE ENTRIES (User-Antworten)
-- ============================================================
create table public.routine_entries (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  prompt_id       uuid not null references public.routine_prompts(id) on delete cascade,
  entry_date      date not null,
  answer          text not null,
  created_at      timestamptz not null default now(),
  unique(user_id, prompt_id, entry_date)
);

-- ============================================================
-- WEEKLY EVALUATIONS (Lebensrad-Bewertungen)
-- ============================================================
create table public.weekly_evaluations (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  week_start              date not null,
  health_fitness          integer check (health_fitness between 1 and 10),
  career_work             integer check (career_work between 1 and 10),
  finances_wealth         integer check (finances_wealth between 1 and 10),
  personality_growth      integer check (personality_growth between 1 and 10),
  meaning_fulfillment     integer check (meaning_fulfillment between 1 and 10),
  family_friends          integer check (family_friends between 1 and 10),
  love_partnership        integer check (love_partnership between 1 and 10),
  adventure_joy           integer check (adventure_joy between 1 and 10),
  changes_noted           text,
  improvements_planned    text,
  created_at              timestamptz not null default now(),
  unique(user_id, week_start)
);

-- ============================================================
-- WEEKLY GOALS (Wochenziele nach der Auswertung)
-- ============================================================
create table public.weekly_goals (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  week_start          date not null,
  goal_text           text,
  important_tasks     text,
  why_best_week       text,
  created_at          timestamptz not null default now(),
  unique(user_id, week_start)
);

-- ============================================================
-- COURSES (Kursstruktur – kein Video-Content im MVP)
-- ============================================================
create table public.courses (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  category        text,
  thumbnail_url   text,
  is_premium      boolean not null default false,
  is_published    boolean not null default false,
  duration_minutes integer,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- COURSE CHAPTERS
-- ============================================================
create table public.course_chapters (
  id              uuid primary key default uuid_generate_v4(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  title           text not null,
  description     text,
  video_url       text,
  duration_minutes integer,
  sort_order      integer not null default 0,
  is_published    boolean not null default false
);

-- ============================================================
-- USER COURSE PROGRESS
-- ============================================================
create table public.user_course_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  last_chapter_id uuid references public.course_chapters(id) on delete set null,
  progress_percent integer not null default 0,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  unique(user_id, course_id)
);

-- ============================================================
-- KI-COACH SESSIONS (Platzhalter für v2)
-- ============================================================
create table public.user_coach_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES für Performance
-- ============================================================
create index idx_habit_completions_user_date on public.habit_completions(user_id, completed_date);
create index idx_daily_scores_user_date on public.daily_scores(user_id, score_date);
create index idx_routine_entries_user_date on public.routine_entries(user_id, entry_date);
create index idx_user_habits_user on public.user_habits(user_id);
create index idx_weekly_evaluations_user on public.weekly_evaluations(user_id, week_start);
