'use client'

import { useEffect, useRef, useState } from 'react'
import { type LifeWheelScores } from '@/components/evaluation/LifeWheel'

const CATEGORIES = [
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

interface Props {
  scores: LifeWheelScores
  weekLabel?: string
  onDismiss: () => void
}

export function LebensGlueckBubble({ scores, weekLabel, onDismiss }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 8
  const avgStr = avg.toFixed(1).replace('.', ',')
  const avgColor = scoreColor(avg)

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.5 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: 0.06 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.01,
      hue: 150 + Math.random() * 60, // teal to green range
    }))

    let frame = 0
    let raf: number

    function draw() {
      ctx.clearRect(0, 0, W, H)
      frame++
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10
        const pulse = p.opacity * (0.7 + 0.3 * Math.sin(frame * p.speed + p.phase))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${pulse})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(4, 12, 8, 0.95)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%', maxWidth: 420, padding: '0 24px' }}>

        {/* Week label */}
        {weekLabel && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
            {weekLabel}
          </p>
        )}

        {/* Central bubble */}
        <div style={{ position: 'relative', marginBottom: 36 }}>
          {/* Outer glow rings */}
          <div style={{
            position: 'absolute', inset: -30,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${avgColor}18 0%, transparent 70%)`,
            animation: 'pulse 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -12,
            borderRadius: '50%',
            border: `1px solid ${avgColor}30`,
          }} />

          {/* Bubble */}
          <div style={{
            width: 200, height: 200, borderRadius: '50%',
            background: `radial-gradient(circle at 38% 32%, ${avgColor}55 0%, ${avgColor}20 35%, rgba(0,20,12,0.8) 70%)`,
            boxShadow: `0 0 50px ${avgColor}55, 0 0 100px ${avgColor}22, inset 0 0 40px ${avgColor}18`,
            border: `1.5px solid ${avgColor}60`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glass highlight */}
            <div style={{
              position: 'absolute', top: 18, left: 30, width: 60, height: 30,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              transform: 'rotate(-20deg)',
              filter: 'blur(4px)',
              pointerEvents: 'none',
            }} />

            <span style={{
              color: '#FFFFFF',
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textShadow: `0 0 30px ${avgColor}`,
            }}>
              {avgStr}
            </span>
            <span style={{
              color: avgColor,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: 6,
            }}>
              Lebensglück
            </span>
          </div>
        </div>

        {/* Category grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          width: '100%',
        }}>
          {CATEGORIES.map((cat) => {
            const val = scores[cat.key as keyof LifeWheelScores]
            const col = scoreColor(val)
            const pct = (val / 10) * 100
            return (
              <div key={cat.key} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '11px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <span style={{ color: col, fontSize: 13, fontWeight: 800 }}>{val}</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: col,
                    boxShadow: `0 0 6px ${col}`,
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 28, fontWeight: 600, letterSpacing: '0.04em' }}>
          Tippe zum Schließen
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
