import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { getWeekStart, toISODateString } from '@/lib/utils'
import { WeeklyEvaluationClient } from './WeeklyEvaluationClient'

export default async function WeeklyEvaluationPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const weekStart = toISODateString(getWeekStart())

  // Aktuelle Wochenbewertung
  const { data: currentEval } = await supabase
    .from('weekly_evaluations')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  // Vorherige Wochenbewertung (zum Vergleich)
  const prevWeekStart = toISODateString(
    new Date(getWeekStart().getTime() - 7 * 24 * 60 * 60 * 1000)
  )
  const { data: previousEval } = await supabase
    .from('weekly_evaluations')
    .select('health_fitness, career_work, finances_wealth, personality_growth, meaning_fulfillment, family_friends, love_partnership, adventure_joy')
    .eq('user_id', user.id)
    .eq('week_start', prevWeekStart)
    .maybeSingle()

  // Aktuelle Wochenziele
  const { data: weeklyGoals } = await supabase
    .from('weekly_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  return (
    <WeeklyEvaluationClient
      weekStart={weekStart}
      currentEval={currentEval}
      previousEval={previousEval}
      weeklyGoals={weeklyGoals}
      userId={user.id}
    />
  )
}
