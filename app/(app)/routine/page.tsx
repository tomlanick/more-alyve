import { createClient } from '@/lib/supabase/server'
import { getDevUser } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'
import { todayISO, getWeekStart, toISODateString } from '@/lib/utils'
import { AppHeader } from '@/components/layout/AppHeader'
import Link from 'next/link'
import { Sun, Moon, CheckCircle2, Circle, BookOpen } from 'lucide-react'

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

export default async function RoutineOverviewPage() {
  const supabase = await createClient()
  const user = getDevUser() ?? (await supabase.auth.getUser()).data.user
  if (!user) redirect('/login')

  const today = todayISO()
  const weekStart = toISODateString(getWeekStart())

  const [{ data: morningPrompts }, { data: eveningPrompts }, { data: weeklyEval }] = await Promise.all([
    supabase.from('routine_prompts').select('id').eq('type', 'morning').eq('is_active', true),
    supabase.from('routine_prompts').select('id').eq('type', 'evening').eq('is_active', true),
    supabase.from('weekly_evaluations').select('health_fitness,career_work,finances_wealth,personality_growth,meaning_fulfillment,family_friends,love_partnership,adventure_joy').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
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

  const hour = new Date().getHours()
  const isEvening = hour >= 18

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Routine" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Greeting hero */}
        <div style={{ borderRadius: 20, padding: '20px 22px', background: 'linear-gradient(135deg, rgba(255,28,71,0.18), rgba(200,0,58,0.07))', border: '1px solid rgba(255,28,71,0.2)' }}>
          <p style={{ color: '#111111', fontWeight: 900, fontSize: 20, lineHeight: 1.2 }}>
            {isEvening ? 'Guten Abend 🌙' : 'Guten Morgen ☀️'}
          </p>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Deine tägliche Reflexion — Morgen & Abend
          </p>
        </div>

        {/* Info */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '18px 20px' }}>
          <p style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Warum Routinen?</p>
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>
            Nimm dir täglich 10 Minuten nur für dich. Die Morgenroutine gibt dir Fokus für den Tag, die Abendroutine hilft dir zu reflektieren. So entsteht dein persönliches Tagebuch.
          </p>
        </div>

        {/* Morgenroutine */}
        <Link href="/routine/morgen" style={{ textDecoration: 'none' }}>
          <div style={{
            background: morningDone ? 'rgba(0,200,83,0.06)' : '#FFFFFF',
            border: morningDone ? '1px solid rgba(0,200,83,0.25)' : '1px solid rgba(255,149,0,0.2)',
            borderRadius: 20,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: morningDone ? 'rgba(0,200,83,0.12)' : 'rgba(255,149,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sun size={26} style={{ color: morningDone ? '#00C853' : '#FF9500' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#111111', fontWeight: 800, fontSize: 15 }}>Morgenroutine</p>
              <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>5 Fragen · ~3 Minuten</p>
              <p style={{ color: morningDone ? '#00C853' : '#FF9500', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                {morningDone ? '✓ Heute abgeschlossen' : 'Jetzt starten →'}
              </p>
            </div>
            {morningDone
              ? <CheckCircle2 size={22} style={{ color: '#00C853', flexShrink: 0 }} />
              : <Circle size={22} style={{ color: '#CCCCCC', flexShrink: 0 }} />
            }
          </div>
        </Link>

        {/* Abendroutine */}
        <Link href="/routine/abend" style={{ textDecoration: 'none' }}>
          <div style={{
            background: eveningDone ? 'rgba(0,200,83,0.06)' : '#FFFFFF',
            border: eveningDone ? '1px solid rgba(0,200,83,0.25)' : '1px solid rgba(123,97,255,0.2)',
            borderRadius: 20,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: eveningDone ? 'rgba(0,200,83,0.12)' : 'rgba(123,97,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Moon size={26} style={{ color: eveningDone ? '#00C853' : '#7B61FF' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#111111', fontWeight: 800, fontSize: 15 }}>Abendroutine</p>
              <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>6 Fragen · ~5 Minuten</p>
              <p style={{ color: eveningDone ? '#00C853' : '#7B61FF', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                {eveningDone ? '✓ Heute abgeschlossen' : 'Abends starten →'}
              </p>
            </div>
            {eveningDone
              ? <CheckCircle2 size={22} style={{ color: '#00C853', flexShrink: 0 }} />
              : <Circle size={22} style={{ color: '#CCCCCC', flexShrink: 0 }} />
            }
          </div>
        </Link>

        {/* Tagebuch */}
        <Link href="/routine/tagebuch" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,28,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={22} style={{ color: '#FF1C47' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#111111', fontWeight: 800, fontSize: 15 }}>Mein Tagebuch</p>
              <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Alle deine vergangenen Einträge</p>
            </div>
            <span style={{ color: '#CCCCCC', fontSize: 18 }}>›</span>
          </div>
        </Link>

        {/* Lebensglück */}
        {weeklyEval ? (() => {
          const ev = weeklyEval as Record<string, number>
          const avg = LIFE_CATS.reduce((s, c) => s + (ev[c.key] ?? 0), 0) / 8
          return (
            <Link href="/auswertung/woche" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundImage: 'url(/blaumitwolken25.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 20, padding: '20px 20px 18px',
                position: 'relative', overflow: 'hidden',
                minHeight: 160,
              }}>
                <div style={{ position: 'relative' }}>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                    Lebensglück · Diese Woche
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                    <span style={{ color: '#FFFFFF', fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                      {avg.toFixed(1).replace('.', ',')}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 700 }}>/10</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {LIFE_CATS.map((cat) => {
                      const val = ev[cat.key] ?? 0
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
            </Link>
          )
        })() : (
          <Link href="/auswertung/woche" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundImage: 'url(/blaumitwolken25.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 20, padding: '20px',
              display: 'flex', alignItems: 'center', gap: 16,
              position: 'relative', overflow: 'hidden', minHeight: 90,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                backdropFilter: 'blur(4px)',
              }}>✨</div>
              <div style={{ position: 'relative' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Lebensglück
                </p>
                <p style={{ color: '#FFFFFF', fontWeight: 900, fontSize: 16, textShadow: '0 1px 8px rgba(0,0,0,0.1)' }}>Wochenauswertung starten</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>8 Lebensbereiche bewerten →</p>
              </div>
            </div>
          </Link>
        )}

      </div>
    </div>
  )
}
