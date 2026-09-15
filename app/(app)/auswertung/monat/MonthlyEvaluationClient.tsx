'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LifeWheel, LIFE_WHEEL_CATEGORIES, type LifeWheelKey, type LifeWheelScores } from '@/components/evaluation/LifeWheel'
import { AppHeader } from '@/components/layout/AppHeader'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Trophy, Target, ChevronRight, Sparkles, Loader2 } from 'lucide-react'

type Step = 'wheel' | 'reflection' | 'done'

const defaultScores: LifeWheelScores = {
  health_fitness: 5,
  career_work: 5,
  finances_wealth: 5,
  personality_growth: 5,
  meaning_fulfillment: 5,
  family_friends: 5,
  love_partnership: 5,
  adventure_joy: 5,
}

interface Props {
  monthStart: string
  currentEval: (LifeWheelScores & {
    biggest_win: string | null
    biggest_challenge: string | null
    next_month_focus: string | null
  }) | null
  previousEval: Partial<LifeWheelScores> | null
  userId: string
}

const textareaStyle = {
  background: '#F2F2F0',
  border: '1px solid #E0E0DE',
  borderRadius: 10,
  color: '#111111',
  fontSize: 14,
  padding: '12px 14px',
  width: '100%',
  outline: 'none',
  resize: 'vertical' as const,
  minHeight: 80,
  lineHeight: 1.5,
}

const labelStyle = {
  color: '#666',
  fontSize: 12,
  fontWeight: 600 as const,
  marginBottom: 6,
  display: 'block',
}

export function MonthlyEvaluationClient({ monthStart, currentEval, previousEval, userId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(currentEval ? 'done' : 'wheel')
  const [scores, setScores] = useState<LifeWheelScores>(
    currentEval
      ? {
          health_fitness: currentEval.health_fitness,
          career_work: currentEval.career_work,
          finances_wealth: currentEval.finances_wealth,
          personality_growth: currentEval.personality_growth,
          meaning_fulfillment: currentEval.meaning_fulfillment,
          family_friends: currentEval.family_friends,
          love_partnership: currentEval.love_partnership,
          adventure_joy: currentEval.adventure_joy,
        }
      : defaultScores
  )
  const [biggestWin, setBiggestWin] = useState(currentEval?.biggest_win ?? '')
  const [biggestChallenge, setBiggestChallenge] = useState(currentEval?.biggest_challenge ?? '')
  const [nextMonthFocus, setNextMonthFocus] = useState(currentEval?.next_month_focus ?? '')
  const [saving, setSaving] = useState(false)

  const monthLabel = new Date(monthStart).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  })

  async function saveEvaluation() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('monthly_evaluations').upsert({
      user_id: userId,
      month_start: monthStart,
      ...scores,
      biggest_win: biggestWin,
      biggest_challenge: biggestChallenge,
      next_month_focus: nextMonthFocus,
    }, { onConflict: 'user_id,month_start' })
    setSaving(false)
    if (error) { toast({ title: 'Fehler beim Speichern', variant: 'danger' }); return }
    setStep('done')
    toast({ title: 'Monatsauswertung gespeichert! 🏆', variant: 'success' })
  }

  const primaryBtn = (onClick: () => void, disabled: boolean, children: React.ReactNode) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#F2F2F0' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
        border: 'none',
        borderRadius: 14,
        color: disabled ? '#999' : '#FFFFFF',
        fontSize: 15,
        fontWeight: 800,
        padding: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(255,28,71,0.3)',
        width: '100%',
      }}
    >
      {children}
    </button>
  )

  if (step === 'done') {
    return (
      <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
        <AppHeader title="Monatsauswertung" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderRadius: 20, padding: '28px 24px', background: 'linear-gradient(135deg, rgba(255,28,71,0.2), rgba(200,0,58,0.08))', border: '1px solid rgba(255,28,71,0.2)', textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>🏆</p>
            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 20 }}>Monatsauswertung {monthLabel}</h2>
            <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Abgeschlossen</p>
          </div>

          <LifeWheel scores={scores} previousScores={previousEval ?? undefined} readonly />

          {(biggestWin || biggestChallenge || nextMonthFocus) && (
            <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {biggestWin && (
                <div>
                  <p style={{ color: '#999', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>🏆 Größter Erfolg</p>
                  <p style={{ color: '#444', fontSize: 14 }}>{biggestWin}</p>
                </div>
              )}
              {biggestChallenge && (
                <div>
                  <p style={{ color: '#999', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>💪 Größte Herausforderung</p>
                  <p style={{ color: '#444', fontSize: 14 }}>{biggestChallenge}</p>
                </div>
              )}
              {nextMonthFocus && (
                <div>
                  <p style={{ color: '#999', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>🎯 Fokus nächsten Monat</p>
                  <p style={{ color: '#444', fontSize: 14 }}>{nextMonthFocus}</p>
                </div>
              )}
            </div>
          )}

          {primaryBtn(() => router.push('/profil'), false, 'Zurück zum Profil')}
        </div>
      </div>
    )
  }

  if (step === 'reflection') {
    return (
      <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
        <AppHeader title="Monatsauswertung" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(255,28,71,0.2)', borderRadius: 20, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} style={{ color: '#FF1C47' }} />
              <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>Monatsrückblick: {monthLabel}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>🏆 Was war dein größter Erfolg diesen Monat?</label>
                <textarea value={biggestWin} onChange={(e) => setBiggestWin(e.target.value)} placeholder="Ich habe diesen Monat erfolgreich…" style={textareaStyle} />
              </div>
              <div>
                <label style={labelStyle}>💪 Was war deine größte Herausforderung?</label>
                <textarea value={biggestChallenge} onChange={(e) => setBiggestChallenge(e.target.value)} placeholder="Besonders herausfordernd war…" style={textareaStyle} />
              </div>
              <div>
                <label style={labelStyle}>🎯 Worauf möchtest du nächsten Monat fokussieren?</label>
                <textarea value={nextMonthFocus} onChange={(e) => setNextMonthFocus(e.target.value)} placeholder="Nächsten Monat konzentriere ich mich auf…" style={textareaStyle} />
              </div>
            </div>
          </div>
          {primaryBtn(saveEvaluation, saving, saving ? <><Loader2 size={16} /> Speichern…</> : 'Monatsauswertung abschließen 🏆')}
        </div>
      </div>
    )
  }

  // step === 'wheel'
  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Monatsauswertung" />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderRadius: 20, padding: '20px', background: 'linear-gradient(135deg, rgba(255,28,71,0.15), rgba(200,0,58,0.06))', border: '1px solid rgba(255,28,71,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Trophy size={16} style={{ color: '#FF1C47' }} />
            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 15 }}>Monatsauswertung: {monthLabel}</h2>
          </div>
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5 }}>
            Wie lief dieser Monat? Bewerte dein Lebensglück in allen 8 Bereichen (1–10).
          </p>
        </div>

        <LifeWheel
          scores={scores}
          previousScores={previousEval ?? undefined}
          onChange={(key: LifeWheelKey, value: number) =>
            setScores((prev) => ({ ...prev, [key]: value }))
          }
        />

        {primaryBtn(() => setStep('reflection'), false, <> Weiter zur Reflexion <ChevronRight size={16} /></>)}
      </div>
    </div>
  )
}
