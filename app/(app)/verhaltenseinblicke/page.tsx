'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppHeader } from '@/components/layout/AppHeader'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface BehaviorItem {
  id: string
  name: string
  icon_emoji: string
  type: 'habit' | 'change'
  score: number
  completions: number
  daysActive: number
}

export default function VerhaltenseinblickePage() {
  const router = useRouter()
  const [items, setItems] = useState<BehaviorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [milestone, setMilestone] = useState<BehaviorItem | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date()
      today.setHours(12, 0, 0, 0)

      const [
        { data: habits },
        { data: changes },
        { data: habitComps },
        { data: changeComps },
      ] = await Promise.all([
        supabase.from('user_habits').select('id, name, icon_emoji, created_at').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
        supabase.from('user_changes').select('id, name, icon_emoji, created_at').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
        supabase.from('habit_completions').select('user_habit_id, completed_date').eq('user_id', user.id),
        supabase.from('change_completions').select('user_change_id, completed_date').eq('user_id', user.id),
      ])

      // Distinct Tage pro Item (kein Doppelzählen)
      const habitCompMap: Record<string, Set<string>> = {}
      for (const c of habitComps ?? []) {
        if (!habitCompMap[c.user_habit_id]) habitCompMap[c.user_habit_id] = new Set()
        habitCompMap[c.user_habit_id].add(c.completed_date)
      }
      const changeCompMap: Record<string, Set<string>> = {}
      for (const c of changeComps ?? []) {
        if (!changeCompMap[c.user_change_id]) changeCompMap[c.user_change_id] = new Set()
        changeCompMap[c.user_change_id].add(c.completed_date)
      }

      const calcScore = (id: string, createdAt: string, compMap: Record<string, Set<string>>) => {
        const created = new Date(createdAt)
        created.setHours(12, 0, 0, 0)
        const daysActive = Math.max(1, Math.round((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) + 1)
        const completions = compMap[id]?.size ?? 0
        // +1 erledigter Tag, -1 verpasster Tag — max. 1x pro Tag
        const score = completions - (daysActive - completions)
        return { score, completions, daysActive }
      }

      const behaviorItems: BehaviorItem[] = [
        ...(habits ?? []).map(h => ({
          id: h.id, name: h.name, icon_emoji: h.icon_emoji, type: 'habit' as const,
          ...calcScore(h.id, h.created_at, habitCompMap),
        })),
        ...(changes ?? []).map(c => ({
          id: c.id, name: c.name, icon_emoji: c.icon_emoji, type: 'change' as const,
          ...calcScore(c.id, c.created_at, changeCompMap),
        })),
      ].sort((a, b) => b.score - a.score) // Positivste (grün) oben, negativste unten

      setItems(behaviorItems)

      // +21 Milestone — localStorage verhindert Wiederholung
      const congratulated: string[] = JSON.parse(localStorage.getItem('ma_congratulated') ?? '[]')
      const found = behaviorItems.find(item => item.score >= 21 && !congratulated.includes(item.id))
      if (found) setMilestone(found)

      setLoading(false)
    }
    fetchData()
  }, [])

  const dismissMilestone = () => {
    if (!milestone) return
    const congratulated: string[] = JSON.parse(localStorage.getItem('ma_congratulated') ?? '[]')
    localStorage.setItem('ma_congratulated', JSON.stringify([...congratulated, milestone.id]))
    setMilestone(null)
  }

  const maxAbsScore = Math.max(21, ...items.map(i => Math.abs(i.score)))

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Verhaltenseinblicke" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px', paddingBottom: 100 }}>

        <p style={{ color: '#999', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          Jeder erledigte Tag{' '}
          <span style={{ color: '#00C853', fontWeight: 700 }}>+1</span>,
          jeder verpasste Tag{' '}
          <span style={{ color: '#FF6B00', fontWeight: 700 }}>-1</span>.
          Bei <span style={{ color: '#00C853', fontWeight: 700 }}>+21</span> ist eine Verhaltensweise zur Gewohnheit geworden.
        </p>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}>
          <span style={{ color: '#00C853', fontWeight: 800, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase' }}>▲ Hilft (oben)</span>
          <span style={{ color: '#BBBBBB', fontWeight: 700, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Punkte</span>
          <span style={{ color: '#FF6B00', fontWeight: 800, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Schadet ▼</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#BBBBBB', fontSize: 14 }}>Lade…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✨</p>
            <p style={{ color: '#999', fontSize: 14 }}>Noch keine Habits oder Änderungen gesetzt</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(item => {
              const clampedScore = Math.max(-maxAbsScore, Math.min(maxAbsScore, item.score))
              const pct = clampedScore / maxAbsScore // -1 bis +1
              const isPositive = item.score > 0
              const isNeutral = item.score === 0
              const barColor = isPositive ? '#00C853' : '#FF6B00'
              const dotColor = isNeutral ? '#CCCCCC' : barColor
              const isHabit = item.score >= 21

              return (
                <div key={item.id} style={{
                  background: isPositive ? 'rgba(0,200,83,0.04)' : isNeutral ? '#FFFFFF' : 'rgba(255,107,0,0.04)',
                  borderRadius: 16,
                  border: `1px solid ${isPositive ? 'rgba(0,200,83,0.18)' : isNeutral ? '#EBEBEA' : 'rgba(255,107,0,0.18)'}`,
                  padding: '14px 16px',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon_emoji}</span>
                      <span style={{ color: '#111111', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      {isHabit && <span style={{ fontSize: 13, flexShrink: 0 }}>🏆</span>}
                    </div>
                    <span style={{
                      color: isNeutral ? '#BBBBBB' : barColor,
                      fontWeight: 900, fontSize: 15, flexShrink: 0, marginLeft: 10,
                    }}>
                      {item.score > 0 ? '+' : ''}{item.score}
                    </span>
                  </div>

                  {/* Bar */}
                  <div style={{ position: 'relative', height: 6, borderRadius: 3, background: '#EBEBEA' }}>
                    {/* +21 Ziel-Markierung */}
                    <div style={{
                      position: 'absolute',
                      left: `${50 + (21 / maxAbsScore) * 50}%`,
                      top: -3, width: 1.5, height: 12,
                      background: 'rgba(0,200,83,0.5)',
                      transform: 'translateX(-50%)',
                    }} />
                    {/* Fill */}
                    {!isNeutral && (
                      <div style={{
                        position: 'absolute',
                        top: 0, height: '100%',
                        borderRadius: 3,
                        background: `linear-gradient(${isPositive ? 'to right' : 'to left'}, ${barColor}55, ${barColor})`,
                        left: isPositive ? '50%' : `${50 + pct * 50}%`,
                        width: `${Math.abs(pct) * 50}%`,
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${50 + pct * 50}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 14, height: 14,
                      borderRadius: '50%',
                      background: dotColor,
                      border: '2.5px solid #FFFFFF',
                      boxShadow: `0 1px 6px ${dotColor}55`,
                    }} />
                  </div>

                  {/* Sub info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ color: '#CCCCCC', fontSize: 10, fontWeight: 600 }}>
                      {item.completions}/{item.daysActive} Tagen erledigt
                    </span>
                    {isHabit && (
                      <span style={{ color: '#00C853', fontSize: 10, fontWeight: 800, letterSpacing: '0.04em' }}>
                        GEWOHNHEIT ✓
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* +21 Milestone Popup */}
      {milestone && (
        <>
          <div onClick={dismissMilestone} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
            background: '#FFFFFF',
            borderRadius: '28px 28px 0 0',
            padding: '28px 28px',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            maxWidth: 480, margin: '0 auto',
            textAlign: 'center',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0DE', margin: '0 auto 24px' }} />

            <div style={{
              width: 72, height: 72, borderRadius: 22,
              background: 'rgba(0,200,83,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', fontSize: 38,
            }}>
              🏆
            </div>

            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 22, marginBottom: 8, lineHeight: 1.2 }}>
              Gewohnheit etabliert!
            </h2>
            <p style={{ color: '#444', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
              {milestone.icon_emoji} {milestone.name}
            </p>
            <p style={{ color: '#999', fontSize: 14, lineHeight: 1.75, marginBottom: 28, maxWidth: 300, margin: '0 auto 28px' }}>
              Du hast <strong style={{ color: '#00C853' }}>+{milestone.score} Punkte</strong> erreicht und diese Verhaltensweise zur echten Gewohnheit gemacht. Zeit für eine neue Herausforderung!
            </p>

            <button
              onClick={() => { dismissMilestone(); router.push('/habits') }}
              style={{
                width: '100%', height: 54, borderRadius: 16,
                background: 'linear-gradient(135deg, #00C853, #00A844)',
                border: 'none', color: '#FFFFFF',
                fontWeight: 900, fontSize: 15, cursor: 'pointer',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 6px 20px rgba(0,200,83,0.3)',
              }}
            >
              <Plus size={18} />
              Neue Herausforderung wählen
            </button>
            <button
              onClick={dismissMilestone}
              style={{
                width: '100%', height: 46, borderRadius: 14,
                background: 'transparent', border: '1px solid #E0E0DE',
                color: '#888', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Später
            </button>
          </div>
        </>
      )}
    </div>
  )
}
