'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { calculateCombinedScore } from '@/lib/scoring'
import { Sun, Moon, Zap, TrendingUp, Flame, BarChart3, ChevronRight, CheckCircle2, Lightbulb, Check } from 'lucide-react'

interface Props {
  profile: { display_name: string | null; premium: boolean; avatar_id: string | null } | null
  todayPoints: number
  totalScore: number
  completedCount: number
  totalHabits: number
  scoreHistory: { date: string; points: number }[]
  morningDone: boolean
  eveningDone: boolean
  weeklyEvalDone: boolean
  streak: number
  willenskraft: number
  journalPct: number
  today: string
}

export function DashboardClient({
  profile,
  todayPoints,
  totalScore,
  completedCount: initialCompleted,
  totalHabits: initialTotal,
  scoreHistory,
  morningDone,
  eveningDone,
  weeklyEvalDone,
  streak,
  willenskraft,
  journalPct,
  today,
}: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'
  const greetingEmoji = hour < 12 ? '☀️' : hour < 18 ? '👋' : '🌙'
  const firstName = profile?.display_name?.split(' ')[0] ?? 'du'

  // Live-Daten für Disziplin-Ring — werden client-seitig beim Rendern frisch geholt
  const [completedCount, setCompletedCount] = useState(initialCompleted)
  const [totalHabits, setTotalHabits] = useState(initialTotal)
  const [totalItems, setTotalItems] = useState(initialTotal) // Habits + Änderungen gesamt
  const [completedItems, setCompletedItems] = useState(initialCompleted)

  useEffect(() => {
    const fetchLive = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: habits }, { data: comps }, { data: changes }, { data: changeComps }] = await Promise.all([
        supabase.from('user_habits').select('id').eq('user_id', user.id).eq('is_active', true),
        supabase.from('habit_completions').select('user_habit_id').eq('user_id', user.id).eq('completed_date', today),
        supabase.from('user_changes').select('id').eq('user_id', user.id).eq('is_active', true),
        supabase.from('change_completions').select('user_change_id').eq('user_id', user.id).eq('completed_date', today),
      ])
      const tH = habits?.length ?? 0
      const cH = comps?.length ?? 0
      const tC = changes?.length ?? 0
      const cC = changeComps?.length ?? 0
      setTotalHabits(tH)
      setCompletedCount(cH)
      setTotalItems(tH + tC)
      setCompletedItems(cH + cC)
    }
    fetchLive()
  }, [today])

  const disziplinPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const disziplinLabel = totalItems > 0 ? `${disziplinPct}%` : '—'
  const isPerfect = completedItems === totalItems && totalItems > 0

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>

        {/* ── GREETING ─────────────────────────── */}
        <div style={{ padding: '28px 24px 0' }}>
          <p style={{ color: '#BBBBBB', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            {greeting} {greetingEmoji}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ color: '#111111', fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {firstName}
            </h1>
            {streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 20, padding: '6px 14px' }}>
                <Flame size={15} style={{ color: '#FF6B00' }} />
                <span style={{ color: '#FF6B00', fontWeight: 900, fontSize: 15 }}>{streak}</span>
                <span style={{ color: '#FF9933', fontSize: 11, fontWeight: 600 }}>Tage</span>
              </div>
            )}
          </div>
        </div>

        {/* ── WHOOP RINGE ───────────────────────── */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '28px 8px 24px', border: '1px solid #EBEBEA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <WhoopRing label="TAGEBUCH" value={journalPct} max={100} displayValue={`${journalPct}%`} color="#5B9BD5" href="/routine/tagebuch" delay={0} />
              <WhoopRing label="DISZIPLIN" value={completedItems} max={totalItems} displayValue={disziplinLabel} color="#00C853" href="/logbuch" delay={200} />
              <WhoopRing label="STÄRKE" value={Math.min(willenskraft, 30)} max={30} displayValue={`${willenskraft}`} color="#4A9FFF" href="/profil" delay={400} />
            </div>
          </div>
        </div>

        {/* ── METRICS ROW ───────────────────────── */}
        <div style={{ padding: '16px 24px', marginBottom: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#FFFFFF', borderRadius: 20, border: '1px solid #EEEEEC', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <MetricCell icon={<Zap size={16} style={{ color: '#FF1C47' }} />} label="SCORE" value={`${totalScore}`} color="#111111" />
            <div style={{ borderLeft: '1px solid #F0F0EE', borderRight: '1px solid #F0F0EE' }}>
              <MetricCell
                icon={<TrendingUp size={16} style={{ color: todayPoints > 0 ? '#00C853' : todayPoints < 0 ? '#FF1C47' : '#CCCCCC' }} />}
                label="HEUTE"
                value={`${todayPoints > 0 ? '+' : ''}${todayPoints}`}
                color={todayPoints > 0 ? '#00C853' : todayPoints < 0 ? '#FF1C47' : '#BBBBBB'}
              />
            </div>
            <MetricCell
              icon={<Flame size={16} style={{ color: streak > 0 ? '#FF6B00' : '#DDDDDB' }} />}
              label="STREAK"
              value={streak > 0 ? `${streak}` : '—'}
              color={streak > 0 ? '#FF6B00' : '#BBBBBB'}
            />
          </div>
        </div>

        {/* ── LOGBUCH ───────────────────────────── */}
        <LogbuchCard scoreHistory={scoreHistory} today={today} />

        {/* ── ROUTINEN ──────────────────────────── */}
        <div style={{ padding: '0 24px', marginBottom: 20 }}>
          <p style={{ color: '#BBBBBB', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Tagesroutine
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link href="/routine/morgen" style={{ textDecoration: 'none' }}>
              <RoutineCard icon={<Sun size={22} />} label="Morgenroutine" sub={morningDone ? 'Abgeschlossen' : 'Jetzt starten →'} done={morningDone} accentColor="#FF9500" />
            </Link>
            <Link href="/routine/abend" style={{ textDecoration: 'none' }}>
              <RoutineCard icon={<Moon size={22} />} label="Abendroutine" sub={eveningDone ? 'Abgeschlossen' : 'Abends starten →'} done={eveningDone} accentColor="#7B61FF" />
            </Link>
          </div>
        </div>

        {/* ── WOCHENAUSWERTUNG BANNER ───────────── */}
        {!weeklyEvalDone && new Date().getDay() === 0 && (
          <div style={{ padding: '0 24px', marginBottom: 20 }}>
            <Link href="/auswertung/woche" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '16px 18px', borderRadius: 18, background: 'rgba(255,28,71,0.05)', border: '1px solid rgba(255,28,71,0.2)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <BarChart3 size={22} style={{ color: '#FF1C47', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>Wochenauswertung</p>
                  <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Lebensglück in 8 Bereichen bewerten</p>
                </div>
                <ChevronRight size={18} style={{ color: '#FF1C47' }} />
              </div>
            </Link>
          </div>
        )}


      </div>
    </div>
  )
}

// ── WHOOP Ring ────────────────────────────────────────────────────────────────

function WhoopRing({ label, value, max, displayValue, color, href, delay = 0 }: {
  label: string; value: number; max: number; displayValue: string; color: string; href: string; delay?: number
}) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t) }, [])

  const size = 100, sw = 9, r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(Math.max(value, 0) / max, 1) : 0
  const filled = circ * (ready ? pct : 0)
  const empty = circ - filled

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0EE" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${filled} ${empty}`}
            style={{ transition: `stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1) ${delay}ms`, filter: `drop-shadow(0 0 5px ${color}88)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#111111', fontWeight: 900, fontSize: displayValue.length > 3 ? 16 : 20, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {displayValue}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ color: '#AAAAAA', fontWeight: 700, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', textAlign: 'center' }}>{label}</span>
        <span style={{ color: '#CCCCCC', fontSize: 12, lineHeight: 1 }}>›</span>
      </div>
    </Link>
  )
}

// ── Logbuch Card ──────────────────────────────────────────────────────────────

const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function LogbuchCard({ scoreHistory, today }: { scoreHistory: { date: string; points: number }[]; today: string }) {
  const activeDates = new Set(scoreHistory.filter(s => s.points > -5).map(s => s.date))
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  return (
    <div style={{ padding: '0 24px', marginBottom: 20 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #EBEBEA', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Link href="/logbuch" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '16px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F2' }}>
            <p style={{ color: '#111111', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mein Logbuch</p>
            <ChevronRight size={16} style={{ color: '#CCCCCC' }} />
          </div>
        </Link>
        <div style={{ padding: '18px 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {last7.map((date) => {
            const d = new Date(date)
            const isToday = date === today
            const active = activeDates.has(date)
            return (
              <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ color: isToday ? '#111111' : '#BBBBBB', fontSize: 10, fontWeight: isToday ? 900 : 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {DAY_LABELS[d.getDay()]}
                </span>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: active ? '#00C853' : isToday ? '#F5F5F3' : '#F0F0EE', border: active ? 'none' : isToday ? '2px solid #DDDDDB' : '2px solid #E8E8E6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 2px 8px rgba(0,200,83,0.3)' : 'none' }}>
                  {active && <Check size={16} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                </div>
              </div>
            )
          })}
        </div>
        <Link href="/verhaltenseinblicke" style={{ textDecoration: 'none' }}>
          <div style={{ margin: '0 14px 14px', borderRadius: 12, background: '#F5F5F3', border: '1px solid #EBEBEA', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Lightbulb size={16} style={{ color: '#888' }} />
            <span style={{ color: '#555', fontWeight: 800, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Verhaltenseinblicke</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────────────────────

function MetricCell({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {icon}
      <p style={{ color, fontWeight: 900, fontSize: 22, lineHeight: 1, marginTop: 2 }}>{value}</p>
      <p style={{ color: '#CCCCCC', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  )
}

function RoutineCard({ icon, label, sub, done, accentColor }: { icon: React.ReactNode; label: string; sub: string; done: boolean; accentColor: string }) {
  return (
    <div style={{ padding: '18px 16px', borderRadius: 18, background: done ? `${accentColor}08` : '#FFFFFF', border: `1px solid ${done ? accentColor + '25' : '#EEEEEC'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: done ? accentColor : '#CCCCCC' }}>{icon}</div>
        {done && <CheckCircle2 size={16} style={{ color: accentColor }} />}
      </div>
      <div>
        <p style={{ color: '#111111', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{label}</p>
        <p style={{ color: done ? accentColor : '#BBBBBB', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{sub}</p>
      </div>
    </div>
  )
}
