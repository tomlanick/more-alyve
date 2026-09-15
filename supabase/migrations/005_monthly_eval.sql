-- ============================================================
-- More Alyve – Monatsauswertung
-- ============================================================

create table if not exists public.monthly_evaluations (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  month_start           date not null,  -- erster Tag des Monats
  health_fitness        integer check (health_fitness between 1 and 10),
  career_work           integer check (career_work between 1 and 10),
  finances_wealth       integer check (finances_wealth between 1 and 10),
  personality_growth    integer check (personality_growth between 1 and 10),
  meaning_fulfillment   integer check (meaning_fulfillment between 1 and 10),
  family_friends        integer check (family_friends between 1 and 10),
  love_partnership      integer check (love_partnership between 1 and 10),
  adventure_joy         integer check (adventure_joy between 1 and 10),
  biggest_win           text,
  biggest_challenge     text,
  next_month_focus      text,
  created_at            timestamptz not null default now(),
  unique(user_id, month_start)
);

-- RLS
alter table public.monthly_evaluations enable row level security;

create policy "Users can manage own monthly evaluations"
  on public.monthly_evaluations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_monthly_evaluations_user on public.monthly_evaluations(user_id, month_start);
