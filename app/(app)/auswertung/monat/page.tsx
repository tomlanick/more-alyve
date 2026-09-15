import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { MonthlyEvaluationClient } from './MonthlyEvaluationClient'

function getMonthStart(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function getPreviousMonthStart(): string {
  const now = new Date()
  now.setDate(1)
  now.setMonth(now.getMonth() - 1)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function MonthlyEvaluationPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const monthStart = getMonthStart()
  const prevMonthStart = getPreviousMonthStart()

  const [{ data: currentEval }, { data: previousEval }] = await Promise.all([
    supabase
      .from('monthly_evaluations')
      .select('health_fitness,career_work,finances_wealth,personality_growth,meaning_fulfillment,family_friends,love_partnership,adventure_joy,biggest_win,biggest_challenge,next_month_focus')
      .eq('user_id', user.id)
      .eq('month_start', monthStart)
      .maybeSingle(),
    supabase
      .from('monthly_evaluations')
      .select('health_fitness,career_work,finances_wealth,personality_growth,meaning_fulfillment,family_friends,love_partnership,adventure_joy')
      .eq('user_id', user.id)
      .eq('month_start', prevMonthStart)
      .maybeSingle(),
  ])

  return (
    <MonthlyEvaluationClient
      monthStart={monthStart}
      currentEval={currentEval}
      previousEval={previousEval}
      userId={user.id}
    />
  )
}
