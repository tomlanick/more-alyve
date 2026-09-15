-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS auf allen Tabellen
alter table public.profiles enable row level security;
alter table public.avatar_profiles enable row level security;
alter table public.habit_templates enable row level security;
alter table public.user_habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.daily_scores enable row level security;
alter table public.routine_prompts enable row level security;
alter table public.routine_entries enable row level security;
alter table public.weekly_evaluations enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.courses enable row level security;
alter table public.course_chapters enable row level security;
alter table public.user_course_progress enable row level security;
alter table public.user_coach_sessions enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
create policy "Eigenes Profil lesen" on public.profiles
  for select using (auth.uid() = id);

create policy "Eigenes Profil aktualisieren" on public.profiles
  for update using (auth.uid() = id);

-- Admin kann alle Profile lesen und bearbeiten
create policy "Admin kann alle Profile lesen" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin kann alle Profile aktualisieren" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin kann Profile anlegen" on public.profiles
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- AVATAR PROFILES – public readable
-- ============================================================
create policy "Avatare sind öffentlich lesbar" on public.avatar_profiles
  for select using (true);

create policy "Admin kann Avatare verwalten" on public.avatar_profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- HABIT TEMPLATES – public readable
-- ============================================================
create policy "Habit-Templates sind öffentlich lesbar" on public.habit_templates
  for select using (true);

create policy "Admin kann Habit-Templates verwalten" on public.habit_templates
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- USER HABITS
-- ============================================================
create policy "Eigene Habits lesen" on public.user_habits
  for select using (auth.uid() = user_id);

create policy "Eigene Habits anlegen" on public.user_habits
  for insert with check (auth.uid() = user_id);

create policy "Eigene Habits aktualisieren" on public.user_habits
  for update using (auth.uid() = user_id);

create policy "Eigene Habits löschen" on public.user_habits
  for delete using (auth.uid() = user_id);

-- ============================================================
-- HABIT COMPLETIONS
-- ============================================================
create policy "Eigene Completions lesen" on public.habit_completions
  for select using (auth.uid() = user_id);

create policy "Eigene Completions anlegen" on public.habit_completions
  for insert with check (auth.uid() = user_id);

create policy "Eigene Completions löschen" on public.habit_completions
  for delete using (auth.uid() = user_id);

-- ============================================================
-- DAILY SCORES
-- ============================================================
create policy "Eigene Scores lesen" on public.daily_scores
  for select using (auth.uid() = user_id);

create policy "Eigene Scores anlegen/aktualisieren" on public.daily_scores
  for all using (auth.uid() = user_id);

-- ============================================================
-- ROUTINE PROMPTS – public readable
-- ============================================================
create policy "Routine-Prompts sind öffentlich lesbar" on public.routine_prompts
  for select using (true);

create policy "Admin kann Prompts verwalten" on public.routine_prompts
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ROUTINE ENTRIES
-- ============================================================
create policy "Eigene Routine-Einträge lesen" on public.routine_entries
  for select using (auth.uid() = user_id);

create policy "Eigene Routine-Einträge anlegen" on public.routine_entries
  for insert with check (auth.uid() = user_id);

create policy "Eigene Routine-Einträge aktualisieren" on public.routine_entries
  for update using (auth.uid() = user_id);

-- ============================================================
-- WEEKLY EVALUATIONS
-- ============================================================
create policy "Eigene Auswertungen lesen" on public.weekly_evaluations
  for select using (auth.uid() = user_id);

create policy "Eigene Auswertungen anlegen" on public.weekly_evaluations
  for insert with check (auth.uid() = user_id);

create policy "Eigene Auswertungen aktualisieren" on public.weekly_evaluations
  for update using (auth.uid() = user_id);

-- ============================================================
-- WEEKLY GOALS
-- ============================================================
create policy "Eigene Wochenziele lesen" on public.weekly_goals
  for select using (auth.uid() = user_id);

create policy "Eigene Wochenziele anlegen" on public.weekly_goals
  for insert with check (auth.uid() = user_id);

create policy "Eigene Wochenziele aktualisieren" on public.weekly_goals
  for update using (auth.uid() = user_id);

-- ============================================================
-- COURSES – public readable wenn published
-- ============================================================
create policy "Veröffentlichte Kurse lesen" on public.courses
  for select using (is_published = true);

create policy "Admin kann alle Kurse lesen" on public.courses
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin kann Kurse verwalten" on public.courses
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- COURSE CHAPTERS
-- ============================================================
create policy "Veröffentlichte Kapitel lesen" on public.course_chapters
  for select using (
    is_published = true and
    exists (select 1 from public.courses where id = course_id and is_published = true)
  );

create policy "Admin kann alle Kapitel verwalten" on public.course_chapters
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- USER COURSE PROGRESS
-- ============================================================
create policy "Eigenen Fortschritt lesen" on public.user_course_progress
  for select using (auth.uid() = user_id);

create policy "Eigenen Fortschritt aktualisieren" on public.user_course_progress
  for all using (auth.uid() = user_id);

-- ============================================================
-- ADMIN: Statistiken – alle User-Daten lesbar für Admins
-- ============================================================
create policy "Admin liest alle Habit-Completions" on public.habit_completions
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin liest alle Daily Scores" on public.daily_scores
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
