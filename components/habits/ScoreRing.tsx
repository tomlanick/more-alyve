'use client'

import { useId } from 'react'

interface ScoreRingProps {
  completed: number
  total: number
  points: number
  size?: number
}

export function ScoreRing({ completed, total, points, size = 140 }: ScoreRingProps) {
  const strokeWidth = 10
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? Math.min(completed / total, 1) : 0
  const dashOffset = circumference * (1 - progress)

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  // Color based on performance
  const color = points > 0 ? '#00C853' : points < 0 ? '#FF1C47' : '#CCCCCC'
  const glowColor = points > 0 ? 'rgba(0,200,83,0.4)' : points < 0 ? 'rgba(255,28,71,0.4)' : 'rgba(200,200,200,0.3)'
  const id = useId()
  const filterId = `glow-${id.replace(/:/g, '')}`

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ overflow: 'visible' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EBEBEA"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        {progress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        )}
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-black leading-none"
          style={{ fontSize: size * 0.22, color }}
        >
          {pct}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#BBBBBB' }}>
          {completed}/{total}
        </span>
      </div>
    </div>
  )
}
