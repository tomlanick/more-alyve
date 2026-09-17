import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { todayISO, getWeekStart, toISODateString } from '@/lib/utils'
import { calculateCombinedScore, calculateStreak } from '@/lib/scoring'
import { DashboardClient } from './DashboardClient'

/** Aufeinanderfolgende Tage mit positivem Score (gut/perfekt) */
function calculateWillenskraft(scores: { score_date: string; points: number }[]): number {
  if (scores.length === 0) return 0
  const scoreMap = new Map(scores.map((s) => [s.score_date, s.points]))
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  let streak = 0
  for (let i = 0; i < 90; i++) {
    const dateStr = cursor.toISOString().slice(0, 10)
    const pts = scoreMap.get(dateStr) ?? null
    if (pts !== null && pts > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default async function DashboardPage() {
  const today = todayISO()

  // ─── DEV BYPASS: DEV_BYPASS_AUTH=true in .env.local → kein Login nötig ───
  if (process.env.DEV_BYPASS_AUTH === 'true') {
    const scoreHistory = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i))
      return { date: d.toISOString().slice(0, 10), points: Math.round(Math.random() * 16 - 4) }
    })
    return (
      <DashboardClient
        profile={{ display_name: 'Dev User', premium: true, avatar_id: null }}
        todayPoints={7}
        totalScore={142}
        completedCount={3}
        totalHabits={5}
        scoreHistory={scoreHistory}
        morningDone={true}
        eveningDone={false}
        weeklyEvalDone={false}
        streak={4}
        willenskraft={3}
        journalPct={68}
        today={today}
      />
    )
  }
  // ─────────────────────────────────────────────────────────────────────────

  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  // Profil laden
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, premium, avatar_id')
    .eq('id', user.id)
    .single()

  // Aktuelle Phase laden (neueste ohne ended_at)
  const { data: currentPhase } = await supabase
    .from('user_phases')
    .select('started_at')
    .eq('user_id', user.id)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fallback: Beginn der App-Zeit, wenn noch keine Phase existiert
  const phaseStart = currentPhase?.started_at ?? '2020-01-01'

  // Heutige aktive Habits laden
  const { data: habits } = await supabase
    .from('user_habits')
    .select('id, name, icon_emoji')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order')

  // Heutige Completions laden (Habits + Änderungen)
  const [{ data: completions }, { data: changeCompletions }, { data: userChanges }] = await Promise.all([
    supabase.from('habit_completions').select('user_habit_id').eq('user_id', user.id).eq('completed_date', today),
    supabase.from('change_completions').select('user_change_id').eq('user_id', user.id).eq('completed_date', today),
    supabase.from('user_changes').select('id').eq('user_id', user.id).eq('is_active', true),
  ])

  const totalHabits = habits?.length ?? 0
  const completedCount = completions?.length ?? 0
  const totalChanges = userChanges?.length ?? 0
  const completedChanges = changeCompletions?.length ?? 0
  const todayPoints = calculateCombinedScore(totalHabits, completedCount, totalChanges, completedChanges)

  // Punkte ab Start der aktuellen Phase laden
  const { data: scores } = await supabase
    .from('daily_scores')
    .select('score_date, points')
    .eq('user_id', user.id)
    .gte('score_date', phaseStart)
    .order('score_date')

  const totalScore = scores?.reduce((sum, s) => sum + s.points, 0) ?? 0
  const scoreHistory = scores?.map((s) => ({ date: s.score_date, points: s.points })) ?? []
  const streak = calculateStreak(scores?.map((s) => s.score_date) ?? [])
  const willenskraft = calculateWillenskraft(scores ?? [])

  // Routine-Prompts IDs für Morgen & Abend
  const [{ data: morningPrompts }, { data: eveningPrompts }] = await Promise.all([
    supabase.from('routine_prompts').select('id').eq('type', 'morning').eq('is_active', true),
    supabase.from('routine_prompts').select('id').eq('type', 'evening').eq('is_active', true),
  ])
  const morningIds = morningPrompts?.map((p) => p.id) ?? []
  const eveningIds = eveningPrompts?.map((p) => p.id) ?? []

  const [{ data: morningEntries }, { data: eveningEntries }] = await Promise.all([
    morningIds.length > 0
      ? supabase.from('routine_entries').select('id').eq('user_id', user.id).eq('entry_date', today).in('prompt_id', morningIds)
      : Promise.resolve({ data: [] }),
    eveningIds.length > 0
      ? supabase.from('routine_entries').select('id').eq('user_id', user.id).eq('entry_date', today).in('prompt_id', eveningIds)
      : Promise.resolve({ data: [] }),
  ])

  const morningDone = (morningEntries?.length ?? 0) >= morningIds.length && morningIds.length > 0
  const eveningDone = (eveningEntries?.length ?? 0) >= eveningIds.length && eveningIds.length > 0

  // Tagebuch: Konsistenz ab Start der aktuellen Phase
  const { data: allEntries } = await supabase
    .from('routine_entries')
    .select('entry_date, routine_prompts!inner(type)')
    .eq('user_id', user.id)
    .gte('entry_date', phaseStart)

  const completedSessions = new Set<string>()
  for (const entry of allEntries ?? []) {
    const type = (entry.routine_prompts as unknown as { type: string })?.type
    if (type) completedSessions.add(`${entry.entry_date}_${type}`)
  }
  const daysSincePhaseStart = Math.max(1, Math.floor((Date.now() - new Date(phaseStart).getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const totalPossible = daysSincePhaseStart * 2
  const journalPct = Math.min(100, Math.round((completedSessions.size / totalPossible) * 100))

  // Wochenauswertung für aktuelle Woche vorhanden?
  const weekStart = toISODateString(getWeekStart())
  const { data: weeklyEval } = await supabase
    .from('weekly_evaluations')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  return (
    <DashboardClient
      profile={profile}
      todayPoints={todayPoints}
      totalScore={totalScore}
      completedCount={completedCount}
      totalHabits={totalHabits}
      scoreHistory={scoreHistory}
      morningDone={morningDone}
      eveningDone={eveningDone}
      weeklyEvalDone={!!weeklyEval}
      streak={streak}
      willenskraft={willenskraft}
      journalPct={journalPct}
      today={today}
    />
  )
}
