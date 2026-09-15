'use client'

export const LIFE_WHEEL_CATEGORIES = [
  { key: 'health_fitness',      label: 'Gesundheit & Fitness',      emoji: '💪' },
  { key: 'career_work',         label: 'Beruf & Karriere',          emoji: '💼' },
  { key: 'finances_wealth',     label: 'Finanzen & Vermögen',       emoji: '💰' },
  { key: 'personality_growth',  label: 'Persönlichkeit & Wachstum', emoji: '🌱' },
  { key: 'meaning_fulfillment', label: 'Sinn & Erfüllung',          emoji: '✨' },
  { key: 'family_friends',      label: 'Familie & Freunde',         emoji: '👨‍👩‍👧' },
  { key: 'love_partnership',    label: 'Liebe & Partnerschaft',     emoji: '❤️' },
  { key: 'adventure_joy',       label: 'Abenteuer & Lebensfreude',  emoji: '🎉' },
] as const

export type LifeWheelKey = typeof LIFE_WHEEL_CATEGORIES[number]['key']
export type LifeWheelScores = Record<LifeWheelKey, number>

interface LifeWheelProps {
  scores: LifeWheelScores
  previousScores?: Partial<LifeWheelScores>
  onChange?: (key: LifeWheelKey, value: number) => void
  readonly?: boolean
}

function ScoreBar({
  category, value, previousValue, onChange, readonly,
}: {
  category: typeof LIFE_WHEEL_CATEGORIES[number]
  value: number
  previousValue?: number
  onChange?: (v: number) => void
  readonly?: boolean
}) {
  const delta = previousValue !== undefined ? value - previousValue : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{category.emoji}</span>
          <span style={{ color: '#444444', fontWeight: 600, fontSize: 13 }}>{category.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {delta !== null && delta !== 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? '#00C853' : '#FF1C47' }}>
              {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
            </span>
          )}
          <span style={{ color: '#111111', fontWeight: 900, fontSize: 15, minWidth: 20, textAlign: 'right' }}>{value}</span>
        </div>
      </div>

      {/* Bar segments */}
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const filled = n <= value
          const wasFilled = previousValue !== undefined && n <= previousValue && n > value
          return (
            <button
              key={n}
              onClick={() => !readonly && onChange?.(n)}
              disabled={readonly}
              style={{
                flex: 1,
                height: 6 + n * 2.5,
                borderRadius: 3,
                background: filled
                  ? value >= 8 ? '#00C853' : value >= 5 ? '#FF9500' : '#FF1C47'
                  : wasFilled
                  ? 'rgba(0,0,0,0.06)'
                  : '#EBEBEA',
                border: 'none',
                cursor: readonly ? 'default' : 'pointer',
                boxShadow: filled && value >= 8 ? '0 0 4px rgba(0,200,83,0.3)' : 'none',
                transition: 'all 0.15s',
              }}
            />
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#CCCCCC', fontSize: 9, fontWeight: 600 }}>Schlecht</span>
        <span style={{ color: '#CCCCCC', fontSize: 9, fontWeight: 600 }}>Excellent</span>
      </div>
    </div>
  )
}

export function LifeWheel({ scores, previousScores, onChange, readonly = false }: LifeWheelProps) {
  const average = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / LIFE_WHEEL_CATEGORIES.length)
  const avgColor = average >= 8 ? '#00C853' : average >= 5 ? '#FF9500' : '#FF1C47'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Avg score card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #EEEEEC',
          borderRadius: 20,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div>
          <p style={{ fontSize: 52, fontWeight: 900, color: avgColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {average}
          </p>
          <p style={{ color: '#CCCCCC', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
            / 10
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#111111', fontWeight: 800, fontSize: 15 }}>Lebensglück-Score</p>
          <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Ø über alle 8 Bereiche</p>
          <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: n <= average ? avgColor : '#EBEBEA',
                  boxShadow: n <= average ? `0 0 4px ${avgColor}44` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Kategorie-Balken */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EEEEEC', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {LIFE_WHEEL_CATEGORIES.map((cat) => (
          <ScoreBar
            key={cat.key}
            category={cat}
            value={scores[cat.key]}
            previousValue={previousScores?.[cat.key]}
            onChange={(v) => onChange?.(cat.key, v)}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  )
}
