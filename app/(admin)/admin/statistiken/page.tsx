import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, CheckSquare, TrendingUp, Activity } from 'lucide-react'

export default async function AdminStatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Statistiken sammeln
  const [
    { count: totalUsers },
    { count: totalCompletions },
    { data: recentScores },
    { data: topHabits },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('habit_completions').select('*', { count: 'exact', head: true }),
    supabase
      .from('daily_scores')
      .select('score_date, points')
      .gte('score_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('score_date'),
    supabase
      .from('habit_completions')
      .select('user_habit_id')
      .gte('completed_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ])

  const avgDailyScore = recentScores && recentScores.length > 0
    ? Math.round(recentScores.reduce((a, b) => a + b.points, 0) / recentScores.length * 10) / 10
    : 0

  const stats = [
    { label: 'Registrierte Nutzer', value: totalUsers ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Habits abgehakt (gesamt)', value: totalCompletions ?? 0, icon: CheckSquare, color: 'text-success' },
    { label: 'Ø Tagespunkte (7 Tage)', value: avgDailyScore, icon: TrendingUp, color: 'text-primary' },
    { label: 'Aktive Completions (30 Tage)', value: topHabits?.length ?? 0, icon: Activity, color: 'text-warning' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-foreground">Statistiken</h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-border p-4">
            <stat.icon size={18} className={stat.color} />
            <p className="text-3xl font-black text-foreground mt-2">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Letzte 7 Tage Score-Verlauf */}
      {recentScores && recentScores.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <h3 className="font-bold text-sm mb-3">Punkte-Verlauf (letzte 7 Tage)</h3>
          <div className="flex items-end gap-2 h-16">
            {recentScores.slice(-7).map((s) => {
              const maxAbs = 5
              const height = Math.max(2, Math.abs(s.points) / maxAbs * 100)
              return (
                <div key={s.score_date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm ${s.points > 0 ? 'bg-success' : s.points < 0 ? 'bg-danger' : 'bg-border'}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-muted">
                    {new Date(s.score_date).toLocaleDateString('de-DE', { weekday: 'narrow' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
