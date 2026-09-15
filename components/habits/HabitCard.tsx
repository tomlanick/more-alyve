'use client'

import { useState, useTransition } from 'react'

interface HabitCardProps {
  id: string
  name: string
  emoji: string
  completed: boolean
  onToggle: (id: string, completed: boolean) => Promise<void>
}

export function HabitCard({ id, name, emoji, completed, onToggle }: HabitCardProps) {
  const [localCompleted, setLocalCompleted] = useState(completed)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const next = !localCompleted
    setLocalCompleted(next)
    startTransition(async () => {
      try {
        await onToggle(id, next)
      } catch {
        setLocalCompleted(!next)
      }
    })
  }

  const accentColor = '#00C853'

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="w-full text-left transition-all duration-200 active:scale-[0.98]"
      style={{
        background: localCompleted ? 'rgba(0,200,83,0.06)' : '#FFFFFF',
        border: localCompleted ? '1px solid rgba(0,200,83,0.3)' : '1px solid #E8E8E5',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {/* Emoji badge */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: localCompleted ? 'rgba(0,200,83,0.12)' : '#F2F2F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>

      {/* Name */}
      <span
        style={{
          flex: 1,
          fontWeight: 700,
          fontSize: 15,
          color: localCompleted ? '#BBBBBB' : '#111111',
          textDecoration: localCompleted ? 'line-through' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {name}
      </span>

      {/* Check indicator */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: localCompleted ? 'none' : '2px solid #DEDEDD',
          background: localCompleted ? accentColor : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: localCompleted ? '0 0 10px rgba(0,200,83,0.4)' : 'none',
          transition: 'all 0.25s',
        }}
      >
        {localCompleted && (
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5L5.5 9L13 1" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}
