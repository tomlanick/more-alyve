'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  entryDates: Record<string, { morning: boolean; evening: boolean }>
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function toLocalStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TagebuchCalendar({ entryDates }: Props) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const todayStr = toLocalStr(today)

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthLabel = viewDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // First weekday (0=Mo, 6=So) — JS Sunday=0, so shift
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // 0=Mo

  const prev = () => setViewDate(new Date(year, month - 1, 1))
  const next = () => setViewDate(new Date(year, month + 1, 1))

  // Build grid cells
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EBEBEA',
      borderRadius: 20,
      padding: '16px 16px 12px',
      marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#BBBBBB', display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ color: '#111111', fontWeight: 800, fontSize: 14 }}>{monthLabel}</span>
        <button
          onClick={next}
          disabled={year === today.getFullYear() && month === today.getMonth()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: (year === today.getFullYear() && month === today.getMonth()) ? '#DDDDDD' : '#BBBBBB', display: 'flex' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', color: '#CCCCCC', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const entry = entryDates[dateStr]
          const hasMorning = !!entry?.morning
          const hasEvening = !!entry?.evening
          const hasBoth = hasMorning && hasEvening
          const hasAny = hasMorning || hasEvening
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr

          let bg = 'transparent'
          let textColor = isFuture ? '#DDDDDD' : '#444444'
          let fontWeight = 600

          if (hasBoth) {
            bg = 'linear-gradient(135deg, rgba(255,149,0,0.18) 50%, rgba(123,97,255,0.18) 50%)'
            textColor = '#111111'
            fontWeight = 800
          } else if (hasMorning) {
            bg = 'rgba(255,149,0,0.15)'
            textColor = '#CC7700'
            fontWeight = 800
          } else if (hasEvening) {
            bg = 'rgba(123,97,255,0.15)'
            textColor = '#5B41DF'
            fontWeight = 800
          }

          return (
            <div
              key={dateStr}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 10,
                background: bg,
                border: isToday ? '2px solid #FF1C47' : '2px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasAny ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (!hasAny) return
                const el = document.getElementById(`tagebuch-day-${dateStr}`)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <span style={{ fontSize: 12, fontWeight, color: textColor, lineHeight: 1 }}>{day}</span>

              {/* Dot indicators */}
              {hasAny && (
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {hasMorning && <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#FF9500' }} />}
                  {hasEvening && <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#7B61FF' }} />}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9500' }} />
          <span style={{ color: '#AAAAAA', fontSize: 10, fontWeight: 600 }}>Morgen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B61FF' }} />
          <span style={{ color: '#AAAAAA', fontSize: 10, fontWeight: 600 }}>Abend</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(135deg, #FF9500 50%, #7B61FF 50%)' }} />
          <span style={{ color: '#AAAAAA', fontSize: 10, fontWeight: 600 }}>Beide</span>
        </div>
      </div>
    </div>
  )
}
