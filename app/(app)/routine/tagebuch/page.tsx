import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/layout/AppHeader'
import { Sun, Moon } from 'lucide-react'
import { getWeekStart, toISODateString } from '@/lib/utils'
import { TagebuchCalendar } from '@/components/tagebuch/TagebuchCalendar'

const LIFE_CATS = [
  { key: 'health_fitness',      label: 'Gesundheit', emoji: '💪' },
  { key: 'career_work',         label: 'Karriere',   emoji: '💼' },
  { key: 'finances_wealth',     label: 'Finanzen',   emoji: '💰' },
  { key: 'personality_growth',  label: 'Wachstum',   emoji: '🌱' },
  { key: 'meaning_fulfillment', label: 'Sinn',       emoji: '✨' },
  { key: 'family_friends',      label: 'Familie',    emoji: '👨‍👩‍👧' },
  { key: 'love_partnership',    label: 'Liebe',      emoji: '❤️' },
  { key: 'adventure_joy',       label: 'Freude',     emoji: '🎉' },
] as const

function scoreColor(v: number) {
  if (v >= 8) return '#00C853'
  if (v >= 6) return '#7ED321'
  if (v >= 4) return '#FFD60A'
  return '#FF1C47'
}

export default async function TagebuchPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const [{ data: entries }, { data: weeklyEvals }, { data: personalNotes }] = await Promise.all([
    supabase
      .from('routine_entries')
      .select('entry_date, answer, prompt_id, routine_prompts(prompt_text, type, sort_order)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .order('prompt_id'),
    supabase
      .from('weekly_evaluations')
      .select('week_start, health_fitness, career_work, finances_wealth, personality_growth, meaning_fulfillment, family_friends, love_partnership, adventure_joy')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false }),
    supabase
      .from('routine_personal_notes')
      .select('entry_date, type, note')
      .eq('user_id', user.id),
  ])

  // Map personal notes: date_type → note
  const noteMap: Record<string, string> = {}
  for (const n of personalNotes ?? []) {
    noteMap[`${n.entry_date}_${n.type}`] = n.note
  }

  // Map week_start → eval scores
  const evalByWeek: Record<string, Record<string, number>> = {}
  for (const ev of weeklyEvals ?? []) {
    const { week_start, ...scores } = ev
    evalByWeek[week_start] = scores as Record<string, number>
  }

  // Group entries by date
  type EntryGroup = {
    date: string
    morning: { prompt_text: string; answer: string; sort_order: number }[]
    evening: { prompt_text: string; answer: string; sort_order: number }[]
    morningNote?: string
    eveningNote?: string
  }

  const grouped: Record<string, EntryGroup> = {}
  for (const entry of entries ?? []) {
    const p = entry.routine_prompts as { prompt_text: string; type: string; sort_order: number } | null
    if (!p) continue
    if (!grouped[entry.entry_date]) {
      grouped[entry.entry_date] = { date: entry.entry_date, morning: [], evening: [] }
    }
    const item = { prompt_text: p.prompt_text, answer: entry.answer, sort_order: p.sort_order }
    if (p.type === 'morning') grouped[entry.entry_date].morning.push(item)
    else grouped[entry.entry_date].evening.push(item)
  }
  // Attach personal notes
  for (const [key, note] of Object.entries(noteMap)) {
    const [date, type] = key.split('_')
    if (!grouped[date]) grouped[date] = { date, morning: [], evening: [] }
    if (type === 'morning') grouped[date].morningNote = note
    else grouped[date].eveningNote = note
  }

  const days = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))

  // Calendar data: date → {morning, evening}
  const entryDates: Record<string, { morning: boolean; evening: boolean }> = {}
  for (const day of days) {
    entryDates[day.date] = { morning: day.morning.length > 0, evening: day.evening.length > 0 }
  }

  // Group days by week
  type Week = { weekStart: string; days: EntryGroup[]; ev: Record<string, number> | null }
  const weekMap: Record<string, Week> = {}
  for (const day of days) {
    const ws = toISODateString(getWeekStart(new Date(day.date)))
    if (!weekMap[ws]) weekMap[ws] = { weekStart: ws, days: [], ev: evalByWeek[ws] ?? null }
    weekMap[ws].days.push(day)
  }

  const weeks = Object.values(weekMap).sort((a, b) => b.weekStart.localeCompare(a.weekStart))

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Tagebuch" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100 }}>
        <TagebuchCalendar entryDates={entryDates} />

        {weeks.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '40px 24px', textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📖</p>
            <p style={{ color: '#111111', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Noch keine Einträge</p>
            <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6 }}>Starte deine erste Morgen- oder Abendroutine, um dein Tagebuch zu beginnen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {weeks.map((week) => {
              const weekLabel = new Date(week.weekStart).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
              const avg = week.ev ? LIFE_CATS.reduce((s, c) => s + (week.ev![c.key] ?? 0), 0) / 8 : null

              return (
                <div key={week.weekStart}>
                  {/* Week header */}
                  <p style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Woche ab {weekLabel}
                  </p>

                  {/* Lebensglück card — blue sky */}
                  {week.ev && avg !== null && (
                    <div style={{
                      backgroundImage: 'url(/blaumitwolken25.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 20, padding: '20px 20px 18px', marginBottom: 12,
                      position: 'relative', overflow: 'hidden', minHeight: 150,
                    }}>

                      {/* Content */}
                      <div style={{ position: 'relative' }}>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                          Lebensglück
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                          <span style={{ color: '#FFFFFF', fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                            {avg.toFixed(1).replace('.', ',')}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 700 }}>/10</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                          {LIFE_CATS.map((cat) => {
                            const val = week.ev![cat.key] ?? 0
                            return (
                              <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                                <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${(val / 10) * 100}%`, background: '#FFFFFF', borderRadius: 2 }} />
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 800 }}>{val}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daily diary entries */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {week.days.map((day) => {
                      const d = new Date(day.date)
                      const dateLabel = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

                      return (
                        <div key={day.date} id={`tagebuch-day-${day.date}`} style={{ scrollMarginTop: 72 }}>
                          <p style={{ color: '#BBBBBB', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>{dateLabel}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {day.morning.length > 0 && (
                              <div style={{ background: '#FFFFFF', border: '1px solid rgba(255,149,0,0.15)', borderRadius: 16, overflow: 'hidden' }}>
                                <div style={{ background: 'rgba(255,149,0,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,149,0,0.1)' }}>
                                  <Sun size={13} style={{ color: '#FF9500' }} />
                                  <span style={{ color: '#FF9500', fontWeight: 800, fontSize: 11 }}>Morgenroutine</span>
                                </div>
                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {day.morning.sort((a, b) => a.sort_order - b.sort_order).map((item, i) => (
                                    <div key={i}>
                                      <p style={{ color: '#FF9500', fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.8 }}>{item.prompt_text}</p>
                                      <p style={{ color: '#444', fontSize: 14, lineHeight: 1.6 }}>{item.answer}</p>
                                    </div>
                                  ))}
                                  {day.morningNote && (
                                    <div style={{ borderTop: '1px solid rgba(255,149,0,0.1)', paddingTop: 10 }}>
                                      <p style={{ color: '#FF9500', fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.8 }}>📝 Persönliche Notiz</p>
                                      <p style={{ color: '#444', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{day.morningNote}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {day.evening.length > 0 && (
                              <div style={{ background: '#FFFFFF', border: '1px solid rgba(123,97,255,0.15)', borderRadius: 16, overflow: 'hidden' }}>
                                <div style={{ background: 'rgba(123,97,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(123,97,255,0.1)' }}>
                                  <Moon size={13} style={{ color: '#7B61FF' }} />
                                  <span style={{ color: '#7B61FF', fontWeight: 800, fontSize: 11 }}>Abendroutine</span>
                                </div>
                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {day.evening.sort((a, b) => a.sort_order - b.sort_order).map((item, i) => (
                                    <div key={i}>
                                      <p style={{ color: '#7B61FF', fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.8 }}>{item.prompt_text}</p>
                                      <p style={{ color: '#444', fontSize: 14, lineHeight: 1.6 }}>{item.answer}</p>
                                    </div>
                                  ))}
                                  {day.eveningNote && (
                                    <div style={{ borderTop: '1px solid rgba(123,97,255,0.1)', paddingTop: 10 }}>
                                      <p style={{ color: '#7B61FF', fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.8 }}>📝 Persönliche Notiz</p>
                                      <p style={{ color: '#444', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{day.eveningNote}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
