'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X, Check, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { calculateCombinedScore } from '@/lib/scoring'

const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Wie viele vergangene Tage noch nachträglich bearbeitet werden können */
const EDIT_WINDOW_DAYS = 3

interface Habit {
  id: string
  name: string
  icon_emoji: string
}

interface UserChange {
  id: string
  name: string
  icon_emoji: string
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTodayStr() {
  return toLocalDateStr(new Date())
}

/** Wie viele Tage liegt dateStr vor todayStr (negativ = Zukunft) */
function daysDiff(dateStr: string, todayStr: string): number {
  const d1 = new Date(dateStr + 'T12:00:00')
  const d2 = new Date(todayStr + 'T12:00:00')
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export default function LogbuchPage() {
  const router = useRouter()
  const todayStr = getTodayStr()

  const [offset, setOffset] = useState(0)
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Record<string, Set<string>>>({})
  const [changes, setChanges] = useState<UserChange[]>([])
  const [changeCompletions, setChangeCompletions] = useState<Record<string, Set<string>>>({})
  const [userId, setUserId] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayStr)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      const cutoffStr = toLocalDateStr(cutoff)

      const [
        { data: habitsData },
        { data: compData },
        { data: changesData },
        { data: changeCompData },
      ] = await Promise.all([
        supabase.from('user_habits').select('id, name, icon_emoji').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
        supabase.from('habit_completions').select('user_habit_id, completed_date').eq('user_id', user.id).gte('completed_date', cutoffStr),
        supabase.from('user_changes').select('id, name, icon_emoji').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
        supabase.from('change_completions').select('user_change_id, completed_date').eq('user_id', user.id).gte('completed_date', cutoffStr),
      ])

      setHabits(habitsData ?? [])
      setChanges(changesData ?? [])

      const compMap: Record<string, Set<string>> = {}
      for (const c of compData ?? []) {
        if (!compMap[c.completed_date]) compMap[c.completed_date] = new Set()
        compMap[c.completed_date].add(c.user_habit_id)
      }
      setCompletions(compMap)

      const changeCompMap: Record<string, Set<string>> = {}
      for (const c of changeCompData ?? []) {
        if (!changeCompMap[c.completed_date]) changeCompMap[c.completed_date] = new Set()
        changeCompMap[c.completed_date].add(c.user_change_id)
      }
      setChangeCompletions(changeCompMap)
    }
    fetchData()
  }, [])

  const upsertScore = useCallback(async (
    supabase: ReturnType<typeof createClient>,
    date: string,
    newHabitCompletions: Set<string>,
    newChangeCompletions: Set<string>,
  ) => {
    const score = calculateCombinedScore(
      habits.length, newHabitCompletions.size,
      changes.length, newChangeCompletions.size,
    )
    await supabase.from('daily_scores').upsert(
      { user_id: userId, score_date: date, points: score },
      { onConflict: 'user_id,score_date' },
    )
  }, [habits.length, changes.length, userId])

  const handleToggle = useCallback(async (habitId: string) => {
    if (!userId || daysDiff(selectedDate, todayStr) > EDIT_WINDOW_DAYS || selectedDate > todayStr) return
    const supabase = createClient()
    const isCompleted = completions[selectedDate]?.has(habitId)
    if (isCompleted) {
      await supabase.from('habit_completions').delete().eq('user_id', userId).eq('user_habit_id', habitId).eq('completed_date', selectedDate)
    } else {
      await supabase.from('habit_completions').insert({ user_id: userId, user_habit_id: habitId, completed_date: selectedDate })
    }
    const updatedHabitComp = new Set(completions[selectedDate] ?? [])
    if (isCompleted) updatedHabitComp.delete(habitId)
    else updatedHabitComp.add(habitId)

    await upsertScore(supabase, selectedDate, updatedHabitComp, changeCompletions[selectedDate] ?? new Set())

    setCompletions(prev => {
      const next = { ...prev }
      next[selectedDate] = updatedHabitComp
      return next
    })
  }, [userId, selectedDate, completions, changeCompletions, todayStr, upsertScore])

  const handleToggleChange = useCallback(async (changeId: string) => {
    if (!userId || daysDiff(selectedDate, todayStr) > EDIT_WINDOW_DAYS || selectedDate > todayStr) return
    const supabase = createClient()
    const isCompleted = changeCompletions[selectedDate]?.has(changeId)
    if (isCompleted) {
      await supabase.from('change_completions').delete().eq('user_id', userId).eq('user_change_id', changeId).eq('completed_date', selectedDate)
    } else {
      await supabase.from('change_completions').insert({ user_id: userId, user_change_id: changeId, completed_date: selectedDate })
    }
    const updatedChangeComp = new Set(changeCompletions[selectedDate] ?? [])
    if (isCompleted) updatedChangeComp.delete(changeId)
    else updatedChangeComp.add(changeId)

    await upsertScore(supabase, selectedDate, completions[selectedDate] ?? new Set(), updatedChangeComp)

    setChangeCompletions(prev => {
      const next = { ...prev }
      next[selectedDate] = updatedChangeComp
      return next
    })
  }, [userId, selectedDate, changeCompletions, completions, todayStr, upsertScore])

  // 7 days ending at (today - offset)
  const anchorDate = new Date()
  anchorDate.setHours(12, 0, 0, 0)
  anchorDate.setDate(anchorDate.getDate() - offset)

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchorDate)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(12, 0, 0, 0)
    return d
  })

  const isCurrentWeek = offset === 0
  const rangeLabel = isCurrentWeek
    ? 'HEUTE'
    : `${last7[0].getDate()}. – ${last7[6].toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}`

  const selectedCompletions = completions[selectedDate] ?? new Set()
  const selectedChangeCompletions = changeCompletions[selectedDate] ?? new Set()
  const isToday = selectedDate === todayStr
  const selectedDiff = daysDiff(selectedDate, todayStr)
  const isEditable = selectedDate <= todayStr && selectedDiff <= EDIT_WINDOW_DAYS
  const completedCount = habits.filter(h => selectedCompletions.has(h.id)).length

  const selectedDateObj = new Date(selectedDate + 'T12:00:00')
  const selectedLabel = isToday
    ? 'Heute'
    : selectedDateObj.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #C8BAA8 0%, #A89880 45%, #8C7D6E 100%)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '56px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, lineHeight: 1 }}>
          <X size={22} style={{ color: 'rgba(255,255,255,0.9)' }} />
        </button>
        <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Logbuch
        </span>
        <Link href="/habits" style={{ padding: 8, lineHeight: 1 }}>
          <Settings2 size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </Link>
      </div>

      {/* Week navigation */}
      <div style={{ padding: '36px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexShrink: 0 }}>
        <button onClick={() => setOffset(o => o + 7)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, lineHeight: 1 }}>
          <ChevronLeft size={24} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>
        <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: 15, letterSpacing: '0.10em', textTransform: 'uppercase', minWidth: 180, textAlign: 'center' }}>
          {rangeLabel}
        </span>
        <button onClick={() => setOffset(o => Math.max(0, o - 7))} disabled={isCurrentWeek} style={{ background: 'none', border: 'none', cursor: isCurrentWeek ? 'default' : 'pointer', padding: 10, lineHeight: 1 }}>
          <ChevronRight size={24} style={{ color: isCurrentWeek ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)' }} />
        </button>
      </div>

      {/* 7 Day Cards */}
      <div style={{ padding: '28px 12px 0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, flexShrink: 0 }}>
        {last7.map((date) => {
          const dateStr = toLocalDateStr(date)
          const dayLabel = DAY_LABELS[date.getDay()]
          const dateNum = date.getDate()
          const isSelected = dateStr === selectedDate
          const isFuture = dateStr > todayStr
          const diff = daysDiff(dateStr, todayStr)
          const editable = !isFuture && diff <= EDIT_WINDOW_DAYS
          const hasComp = (completions[dateStr]?.size ?? 0) > 0 || (changeCompletions[dateStr]?.size ?? 0) > 0

          // Drei Zustände:
          // 1. hasComp → grüner Kreis mit ✓
          // 2. !hasComp && editable → leerer Kreis (noch ausfüllbar)
          // 3. !hasComp && !editable && !isFuture → grauer Kreis mit ✗ (verpasst)
          // 4. isFuture → transparenter Kreis

          const showGreen = !isFuture && hasComp
          const showGrayX = !isFuture && !hasComp && !editable
          const showEmpty = !isFuture && !hasComp && editable
          const showFuture = isFuture

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && setSelectedDate(dateStr)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, padding: '12px 4px 12px',
                background: isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.11)',
                borderRadius: 22,
                border: isSelected ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                backdropFilter: 'blur(6px)',
                cursor: isFuture ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                {dayLabel}
              </span>
              <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 900, lineHeight: 1 }}>
                {dateNum}
              </span>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: showGreen ? '#00C853' : showGrayX ? 'rgba(255,255,255,0.18)' : showEmpty ? 'rgba(255,255,255,0.18)' : 'transparent',
                border: showFuture ? '1.5px solid rgba(255,255,255,0.15)' : showEmpty ? '1.5px solid rgba(255,255,255,0.5)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: showGreen ? '0 2px 10px rgba(0,200,83,0.45)' : 'none',
              }}>
                {showGreen && <Check size={13} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                {showGrayX && <X size={11} style={{ color: 'rgba(255,255,255,0.45)', strokeWidth: 2.5 }} />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Content card */}
      <div style={{
        flex: 1,
        marginTop: 28,
        background: '#F7F7F5',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#BBBBBB', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
              {selectedLabel}
            </p>
            <h2 style={{ color: '#111111', fontSize: 18, fontWeight: 900 }}>
              {completedCount}/{habits.length} Habits erledigt
            </h2>
          </div>
          {!isToday && (
            <span style={{
              color: isEditable ? '#FF6B00' : '#BBBBBB',
              fontSize: 11, fontWeight: 700,
              background: isEditable ? 'rgba(255,107,0,0.08)' : '#F0F0EE',
              border: isEditable ? '1px solid rgba(255,107,0,0.2)' : 'none',
              borderRadius: 8, padding: '4px 10px',
            }}>
              {isEditable ? 'Nachträglich' : 'Vergangen'}
            </span>
          )}
        </div>

        <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>

          {/* Habits */}
          {habits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>✨</p>
              <p style={{ color: '#999', fontSize: 14 }}>Noch keine Habits angelegt</p>
            </div>
          ) : habits.map((habit) => {
            const done = selectedCompletions.has(habit.id)
            const canToggle = isEditable
            return (
              <button
                key={habit.id}
                onClick={() => canToggle && handleToggle(habit.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: done ? 'rgba(0,200,83,0.06)' : '#FFFFFF',
                  border: `1px solid ${done ? 'rgba(0,200,83,0.2)' : '#EBEBEA'}`,
                  borderRadius: 18, padding: '14px 16px',
                  cursor: canToggle ? 'pointer' : 'default',
                  textAlign: 'left', width: '100%',
                  transition: 'all 0.15s',
                  opacity: !canToggle && !done ? 0.5 : 1,
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: done ? 'rgba(0,200,83,0.1)' : '#F5F5F3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {habit.icon_emoji}
                </div>
                <span style={{
                  flex: 1, color: done ? '#888' : '#111111',
                  fontWeight: 800, fontSize: 15,
                  textDecoration: done ? 'line-through' : 'none',
                }}>
                  {habit.name}
                </span>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#00C853' : 'transparent',
                  border: done ? 'none' : '2px solid #DDDDDB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: done ? '0 2px 8px rgba(0,200,83,0.3)' : 'none',
                }}>
                  {done && <Check size={14} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                </div>
              </button>
            )
          })}

          {/* Was will ich ändern */}
          {changes.length > 0 && (
            <>
              <div style={{ height: 1, background: '#E8E8E6', margin: '8px 0' }} />
              <p style={{ color: '#BBBBBB', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', paddingLeft: 4, marginBottom: 2 }}>
                Was will ich ändern?
              </p>
              {changes.map((change) => {
                const done = selectedChangeCompletions.has(change.id)
                const canToggle = isEditable
                return (
                  <button
                    key={change.id}
                    onClick={() => canToggle && handleToggleChange(change.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: done ? 'rgba(0,200,83,0.06)' : '#FFFFFF',
                      border: `1px solid ${done ? 'rgba(0,200,83,0.2)' : '#EBEBEA'}`,
                      borderRadius: 18, padding: '14px 16px',
                      cursor: canToggle ? 'pointer' : 'default',
                      textAlign: 'left', width: '100%',
                      transition: 'all 0.15s',
                      opacity: !canToggle && !done ? 0.5 : 1,
                    }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                      background: done ? 'rgba(0,200,83,0.1)' : 'rgba(255,107,0,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      {change.icon_emoji}
                    </div>
                    <span style={{
                      flex: 1, color: done ? '#888' : '#111111',
                      fontWeight: 800, fontSize: 15,
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {change.name}
                    </span>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: done ? '#00C853' : 'transparent',
                      border: done ? 'none' : '2px solid #DDDDDB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: done ? '0 2px 8px rgba(0,200,83,0.3)' : 'none',
                    }}>
                      {done && <Check size={14} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                    </div>
                  </button>
                )
              })}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
