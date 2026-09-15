'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = [
  '#FF1C47', '#FF1C47', // red (double weight — brand)
  '#00C853', '#00C853', // green
  '#FFD60A',            // yellow
  '#FF9500',            // orange
  '#7B61FF',            // purple
  '#007AFF',            // blue
  '#FFFFFF',            // white
  '#FF6B00',            // deep orange
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  width: number
  height: number
  rotation: number
  rotationSpeed: number
  opacity: number
  shape: 'rect' | 'circle' | 'ribbon'
}

function makeParticle(cx: number, cy: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 6 + Math.random() * 14
  const shape = Math.random() < 0.5 ? 'rect' : Math.random() < 0.5 ? 'circle' : 'ribbon'
  return {
    x: cx,
    y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 4, // slight upward bias
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: shape === 'ribbon' ? 2 + Math.random() * 3 : 6 + Math.random() * 8,
    height: shape === 'ribbon' ? 12 + Math.random() * 14 : 6 + Math.random() * 8,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    opacity: 1,
    shape,
  }
}

interface Props {
  onDismiss: () => void
}

export function PerfectDayOverlay({ onDismiss }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showText, setShowText] = useState(false)

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

    const cx = W / 2
    const cy = H / 2

    // Two bursts: initial burst + smaller second pop
    const particles: Particle[] = []
    for (let i = 0; i < 180; i++) particles.push(makeParticle(cx, cy))

    let frame = 0
    let rafId: number

    // Text appears after 800ms
    const textTimer = setTimeout(() => setShowText(true), 800)

    // Second burst at 300ms
    const burst2 = setTimeout(() => {
      for (let i = 0; i < 80; i++) particles.push(makeParticle(cx, cy))
    }, 300)

    function draw() {
      ctx.clearRect(0, 0, W, H)

      const gravity = 0.35
      const drag = 0.98

      for (const p of particles) {
        p.vy += gravity
        p.vx *= drag
        p.vy *= drag
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        // Fade out when below screen or after a while
        if (p.y > H + 40) { p.opacity = 0; continue }
        if (frame > 90) p.opacity = Math.max(0, p.opacity - 0.008)

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // rect or ribbon
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
          // slight shimmer highlight
          ctx.globalAlpha = p.opacity * 0.3
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width * 0.3, p.height)
        }
        ctx.restore()
      }

      frame++
      // Stop after all particles faded
      if (frame < 300) {
        rafId = requestAnimationFrame(draw)
      }
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(textTimer)
      clearTimeout(burst2)
    }
  }, [])

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Center text */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          opacity: showText ? 1 : 0,
          transform: showText ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
          transition: 'opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents: 'none',
        }}
      >
        {/* Glow ring */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,200,83,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: 32,
          padding: '36px 48px',
          border: '1px solid rgba(0,200,83,0.3)',
          boxShadow: '0 24px 80px rgba(0,200,83,0.25), 0 4px 24px rgba(0,0,0,0.12)',
        }}>
          <p style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }}>🎉</p>
          <h1 style={{
            color: '#111111',
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 8,
          }}>
            Perfekter Tag
          </h1>
          <p style={{ color: '#00C853', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Alle Habits geschafft ✓
          </p>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 16, fontWeight: 600 }}>
          Tippe zum Schließen
        </p>
      </div>
    </div>
  )
}
