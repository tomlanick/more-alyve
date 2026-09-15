'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LifeWheel, LIFE_WHEEL_CATEGORIES, type LifeWheelKey, type LifeWheelScores } from '@/components/evaluation/LifeWheel'
import { AppHeader } from '@/components/layout/AppHeader'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { BarChart3, Target, Sparkles, ChevronRight, Loader2 } from 'lucide-react'

type Step = 'wheel' | 'reflection' | 'goals' | 'done'

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
  weekStart: string
  currentEval: LifeWheelScores & {
    id: string
    changes_noted: string | null
    improvements_planned: string | null
  } | null
  previousEval: Partial<LifeWheelScores> | null
  weeklyGoals: {
    id: string
    goal_text: string | null
    important_tasks: string | null
    why_best_week: string | null
  } | null
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

export function WeeklyEvaluationClient({ weekStart, currentEval, previousEval, weeklyGoals, userId }: Props) {
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
  const [changesNoted, setChangesNoted] = useState(currentEval?.changes_noted ?? '')
  const [improvementsPlanned, setImprovementsPlanned] = useState(currentEval?.improvements_planned ?? '')
  const [goalText, setGoalText] = useState(weeklyGoals?.goal_text ?? '')
  const [importantTasks, setImportantTasks] = useState(weeklyGoals?.important_tasks ?? '')
  const [whyBestWeek, setWhyBestWeek] = useState(weeklyGoals?.why_best_week ?? '')
  const [saving, setSaving] = useState(false)

  function handleScoreChange(key: LifeWheelKey, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  async function saveEvaluation() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('weekly_evaluations').upsert({
      user_id: userId,
      week_start: weekStart,
      ...scores,
      changes_noted: changesNoted,
      improvements_planned: improvementsPlanned,
    }, { onConflict: 'user_id,week_start' })
    setSaving(false)
    if (error) { toast({ title: 'Fehler beim Speichern', variant: 'danger' }); return }
    setStep('goals')
  }

  async function saveGoals() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('weekly_goals').upsert({
      user_id: userId,
      week_start: weekStart,
      goal_text: goalText,
      important_tasks: importantTasks,
      why_best_week: whyBestWeek,
    }, { onConflict: 'user_id,week_start' })
    setSaving(false)
    setStep('done')
    toast({ title: 'Wochenauswertung gespeichert! 🎉', variant: 'success' })
  }

  const weekLabel = new Date(weekStart).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  const primaryBtn = (onClick: () => void, disabled: boolean, children: React.ReactNode) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#F2F2F0' : 'linear-gradient(135deg, #FF1C47, #C8003A)',
        border: 'none',
        borderRadius: 14,
        color: '#111111',
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
        <AppHeader title="Wochenauswertung" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderRadius: 20, padding: '28px 24px', background: 'linear-gradient(135deg, rgba(255,28,71,0.2), rgba(200,0,58,0.08))', border: '1px solid rgba(255,28,71,0.2)', textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>🎉</p>
            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 20 }}>Auswertung abgeschlossen</h2>
            <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Woche ab {weekLabel}</p>
          </div>

          <LifeWheel scores={scores} previousScores={previousEval ?? undefined} readonly />

          {(goalText || importantTasks || whyBestWeek) && (
            <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Target size={16} style={{ color: '#FF1C47' }} />
                <span style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>Ziele für diese Woche</span>
              </div>
              {goalText && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: '#999', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Welche Ziele möchtest du erreichen?</p>
                  <p style={{ color: '#444', fontSize: 14 }}>{goalText}</p>
                </div>
              )}
              {importantTasks && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: '#999', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Besonders wichtige Aufgaben</p>
                  <p style={{ color: '#444', fontSize: 14 }}>{importantTasks}</p>
                </div>
              )}
              {whyBestWeek && (
                <div>
                  <p style={{ color: '#999', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Warum wird diese Woche deine beste?</p>
                  <p style={{ color: '#444', fontSize: 14 }}>{whyBestWeek}</p>
                </div>
              )}
            </div>
          )}

          {primaryBtn(() => router.push('/dashboard'), false, 'Zurück zum Dashboard')}
        </div>
      </div>
    )
  }

  if (step === 'goals') {
    return (
      <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
        <AppHeader title="Neue Woche" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(255,28,71,0.2)', borderRadius: 20, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Target size={18} style={{ color: '#FF1C47' }} />
              <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>Die neue Woche</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Welche Ziele möchtest du diese Woche erreichen?</label>
                <textarea value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder="Meine Ziele für diese Woche…" style={textareaStyle} />
              </div>
              <div>
                <label style={labelStyle}>Welche Aufgaben sind diese Woche besonders wichtig?</label>
                <textarea value={importantTasks} onChange={(e) => setImportantTasks(e.target.value)} placeholder="Die wichtigsten Aufgaben…" style={textareaStyle} />
              </div>
              <div>
                <label style={labelStyle}>Warum wird diese Woche deine beste?</label>
                <textarea value={whyBestWeek} onChange={(e) => setWhyBestWeek(e.target.value)} placeholder="Weil ich…" style={textareaStyle} />
              </div>
            </div>
          </div>
          {primaryBtn(saveGoals, saving, saving ? <><Loader2 size={16} /> Speichern…</> : 'Abschließen & speichern ✓')}
        </div>
      </div>
    )
  }

  if (step === 'reflection') {
    const hasChanges = previousEval !== null
    return (
      <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
        <AppHeader title="Wochenauswertung" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEA', borderRadius: 20, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} style={{ color: '#FF1C47' }} />
              <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>Reflektion</h2>
            </div>

            {hasChanges && (
              <div style={{ background: '#F2F2F0', borderRadius: 12, padding: '14px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Veränderungen zur Vorwoche</p>
                {LIFE_WHEEL_CATEGORIES.map((cat) => {
                  const prev = previousEval?.[cat.key]
                  const curr = scores[cat.key]
                  if (prev === undefined || prev === curr) return null
                  const up = curr > prev
                  return (
                    <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                      <span style={{ flex: 1, color: '#444', fontSize: 13 }}>{cat.label}</span>
                      <span style={{ color: up ? '#00C853' : '#FF1C47', fontWeight: 700, fontSize: 12 }}>
                        {prev} → {curr} ({up ? '+' : ''}{curr - prev})
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {hasChanges && (
                <div>
                  <label style={labelStyle}>Hat sich deine Bewertung geändert? Wenn ja, warum?</label>
                  <textarea value={changesNoted} onChange={(e) => setChangesNoted(e.target.value)} placeholder="Was hat sich verändert und warum?" style={textareaStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Was möchtest du zukünftig unternehmen, um nächste Woche bessere Bewertungen zu erreichen?</label>
                <textarea value={improvementsPlanned} onChange={(e) => setImprovementsPlanned(e.target.value)} placeholder="Meine Verbesserungspläne…" style={textareaStyle} />
              </div>
            </div>
          </div>

          {primaryBtn(saveEvaluation, saving, saving ? <><Loader2 size={16} /> Speichern…</> : <> Weiter zu den Wochenzielen <ChevronRight size={16} /></>)}
        </div>
      </div>
    )
  }

  // step === 'wheel'
  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh' }}>
      <AppHeader title="Wochenauswertung" />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderRadius: 20, padding: '20px', background: 'linear-gradient(135deg, rgba(255,28,71,0.15), rgba(200,0,58,0.06))', border: '1px solid rgba(255,28,71,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BarChart3 size={16} style={{ color: '#FF1C47' }} />
            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 15 }}>Dein Lebensglück</h2>
          </div>
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5 }}>
            Das Lebensglück stützt sich auf 8 Säulen. Bewerte jeden Bereich auf einer Skala von 1 (katastrophal) bis 10 (hervorragend).
          </p>
        </div>

        <LifeWheel scores={scores} previousScores={previousEval ?? undefined} onChange={handleScoreChange} />

        {primaryBtn(() => setStep('reflection'), false, <> Weiter zur Reflektion <ChevronRight size={16} /></>)}
      </div>
    </div>
  )
}
