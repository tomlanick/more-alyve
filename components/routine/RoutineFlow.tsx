'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Sun, Moon, BookOpen, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { LebensGlueckBubble } from '@/components/ui/LebensGlueckBubble'
import { type LifeWheelScores } from '@/components/evaluation/LifeWheel'
import { getWeekStart, toISODateString } from '@/lib/utils'

interface Prompt {
  id: string
  prompt_text: string
  placeholder_text: string | null
}

interface ExistingEntry {
  prompt_id: string
  answer: string
}

interface Props {
  type: 'morning' | 'evening'
  prompts: Prompt[]
  existingEntries: ExistingEntry[]
  existingNote?: string
  today: string
  userId: string
}

export function RoutineFlow({ type, prompts, existingEntries, existingNote, today, userId }: Props) {
  const router = useRouter()
  const isMorning = type === 'morning'
  const label = isMorning ? 'Morgenroutine' : 'Abendroutine'
  const accentColor = isMorning ? '#FF9500' : '#7B61FF'
  const Icon = isMorning ? Sun : Moon

  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(existingEntries.map((e) => [e.prompt_id, e.answer]))
  )
  const [personalNote, setPersonalNote] = useState(existingNote ?? '')
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(existingEntries.length === prompts.length && prompts.length > 0)
  const [weeklyScores, setWeeklyScores] = useState<LifeWheelScores | null>(null)
  const [showBubble, setShowBubble] = useState(false)

  // Guard
  if (!prompts || prompts.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F7F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, textAlign: 'center', maxWidth: 320, width: '100%' }}>
          <Icon size={40} style={{ color: accentColor, margin: '0 auto 16px' }} />
          <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{label}</h2>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Noch keine Fragen hinterlegt.</p>
          <button onClick={() => router.push('/routine')} style={btnStyle(accentColor)}>Zurück</button>
        </div>
      </div>
    )
  }

  const allAnswered = prompts.every((p) => answers[p.id]?.trim())

  async function handleSave() {
    if (!allAnswered) {
      toast({ title: 'Bitte beantworte alle Fragen', variant: 'default' })
      return
    }
    setSaving(true)
    const supabase = createClient()
    const entries = prompts.map((p) => ({
      user_id: userId,
      prompt_id: p.id,
      entry_date: today,
      answer: answers[p.id] ?? '',
    }))
    const { error } = await supabase.from('routine_entries').upsert(entries, { onConflict: 'user_id,prompt_id,entry_date' })
    if (error) { setSaving(false); toast({ title: 'Fehler beim Speichern', variant: 'danger' }); return }

    // Persönliche Notiz speichern (optional)
    if (personalNote.trim()) {
      await supabase.from('routine_personal_notes').upsert(
        { user_id: userId, entry_date: today, type, note: personalNote.trim() },
        { onConflict: 'user_id,entry_date,type' }
      )
    }

    setSaving(false)
    setCompleted(true)
    toast({ title: `${label} gespeichert ✨`, variant: 'success' })

    // After evening: fetch weekly evaluation and show Lebensglück bubble
    if (!isMorning) {
      const weekStart = toISODateString(getWeekStart(new Date(today)))
      const { data: evalData } = await supabase
        .from('weekly_evaluations')
        .select('health_fitness,career_work,finances_wealth,personality_growth,meaning_fulfillment,family_friends,love_partnership,adventure_joy')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle()
      if (evalData) {
        setWeeklyScores(evalData as LifeWheelScores)
        setTimeout(() => setShowBubble(true), 800)
      }
    }
  }

  const dateLabel = new Date(today).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (completed) {
    const weekStart = toISODateString(getWeekStart(new Date(today)))
    const weekLabel = new Date(weekStart).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

    return (
      <div style={{ minHeight: '100dvh', background: '#F7F7F5' }}>
      {showBubble && weeklyScores && (
        <LebensGlueckBubble
          scores={weeklyScores}
          weekLabel={`Woche ab ${weekLabel}`}
          onDismiss={() => setShowBubble(false)}
        />
      )}
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#F7F7F5', borderBottom: '1px solid #F0F0EE', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={18} style={{ color: accentColor }} />
            <span style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>{label}</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,200,83,0.15)', border: '1px solid #00C853', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={16} style={{ color: '#00C853' }} />
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 24px', paddingBottom: 100 }}>
          {/* Done banner */}
          <div style={{ borderRadius: 20, padding: '20px 22px', background: 'rgba(0,200,83,0.06)', border: '1px solid rgba(0,200,83,0.2)', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,200,83,0.15)', border: '2px solid #00C853', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Check size={24} style={{ color: '#00C853' }} />
            </div>
            <h2 style={{ color: '#111111', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{label} ✓</h2>
            <p style={{ color: '#666', fontSize: 13 }}>{dateLabel}</p>
          </div>

          {/* Diary entries */}
          <p style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Dein Eintrag</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {prompts.map((p) => (
              <div key={p.id} style={{ background: '#FFFFFF', borderRadius: 16, padding: '16px 18px', border: '1px solid #EBEBEA' }}>
                <p style={{ color: accentColor, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{p.prompt_text}</p>
                <p style={{ color: '#444', fontSize: 14, lineHeight: 1.6 }}>
                  {answers[p.id] || existingEntries.find(e => e.prompt_id === p.id)?.answer || '—'}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => router.push('/routine/tagebuch')} style={{ ...btnStyle(accentColor), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <BookOpen size={16} />
              Tagebuch ansehen
            </button>
            <button onClick={() => router.push('/routine')} style={{ width: '100%', height: 48, borderRadius: 14, background: 'transparent', border: '1px solid #E0E0DE', color: '#666', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F7F5' }}>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F0F0EE' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={18} style={{ color: accentColor }} />
            <span style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>{label}</span>
          </div>
          <span style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{dateLabel}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 2, background: '#F2F2F0' }}>
          <div style={{
            height: '100%',
            width: `${(prompts.filter(p => answers[p.id]?.trim()).length / prompts.length) * 100}%`,
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}88`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 24px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}>

        {/* Intro */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#111111', fontWeight: 900, fontSize: 20, lineHeight: 1.3, marginBottom: 6 }}>
            {isMorning ? 'Dein Morgen gehört dir ☀️' : 'Reflektiere deinen Tag 🌙'}
          </p>
          <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6 }}>
            {isMorning
              ? 'Nimm dir 10 Minuten nur für dich. Beantworte die Fragen ehrlich — dieser Eintrag wird Teil deines persönlichen Tagebuchs.'
              : 'Der Tag ist fast vorbei. Nimm dir einen Moment der Stille und reflektiere ehrlich, was war.'
            }
          </p>
        </div>

        {/* All questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {prompts.map((prompt, i) => (
            <div key={prompt.id}>
              <label style={{ display: 'block', color: accentColor, fontWeight: 800, fontSize: 14, lineHeight: 1.4, marginBottom: 10 }}>
                <span style={{ color: '#CCCCCC', fontSize: 11, fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>
                {prompt.prompt_text}
              </label>
              <textarea
                value={answers[prompt.id] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                placeholder={prompt.placeholder_text ?? 'Schreibe hier deine Antwort…'}
                rows={3}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: `1.5px solid ${answers[prompt.id]?.trim() ? accentColor + '55' : '#EBEBEA'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  color: '#111111',
                  fontSize: 15,
                  lineHeight: 1.7,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = accentColor }}
                onBlur={(e) => { e.target.style.borderColor = answers[prompt.id]?.trim() ? accentColor + '55' : '#EBEBEA' }}
              />
            </div>
          ))}
        </div>

        {/* Persönliche Notiz */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            background: '#FFFFFF',
            border: `1.5px solid ${personalNote.trim() ? accentColor + '33' : '#EBEBEA'}`,
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}>
            <div style={{
              padding: '12px 16px 10px',
              borderBottom: `1px solid ${personalNote.trim() ? accentColor + '22' : '#F5F5F3'}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>📝</span>
              <span style={{ color: '#888', fontWeight: 700, fontSize: 12 }}>
                Freier Eintrag — Erlebnis, Rückschlag, Gedanke …
              </span>
              <span style={{ color: '#CCCCCC', fontSize: 11, marginLeft: 'auto' }}>optional</span>
            </div>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Was bewegt dich heute? Schreib es einfach raus — ganz ohne Struktur."
              rows={4}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '14px 16px',
                color: '#111111',
                fontSize: 15,
                lineHeight: 1.75,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Save button — direkt unter den Fragen */}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleSave}
            disabled={saving || !allAnswered}
            style={{
              ...btnStyle(accentColor),
              opacity: allAnswered ? 1 : 0.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Speichern…</>
              : <><Check size={16} /> Eintrag speichern</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    width: '100%',
    height: 52,
    borderRadius: 14,
    background: color === '#FF9500'
      ? 'linear-gradient(135deg, #FF9500, #E67E00)'
      : color === '#7B61FF'
      ? 'linear-gradient(135deg, #7B61FF, #5B41DF)'
      : `linear-gradient(135deg, ${color}, #C8003A)`,
    border: 'none',
    color: '#FFFFFF',
    fontWeight: 900,
    fontSize: 15,
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${color}44`,
  }
}
