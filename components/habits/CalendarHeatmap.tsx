'use client'

import { cn } from '@/lib/utils'

interface DayData {
  date: string
  points: number
}

interface CalendarHeatmapProps {
  data: DayData[]
  days?: number
}

export function CalendarHeatmap({ data, days = 28 }: CalendarHeatmapProps) {
  const today = new Date()
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayData = data.find((x) => x.date === dateStr)
    const isToday = dateStr === today.toISOString().split('T')[0]
    const isFuture = d > today

    return { dateStr, points: dayData?.points, isToday, isFuture, dayOfWeek: d.getDay() }
  })

  const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  function getCellColor(points: number | undefined, isFuture: boolean): string {
    if (isFuture) return 'bg-surface-2'
    if (points === undefined) return 'bg-surface-2'
    if (points >= 5) return 'bg-success opacity-90'
    if (points > 0) return 'bg-success opacity-50'
    if (points === 0) return 'bg-neutral-light'
    if (points >= -2) return 'bg-danger opacity-40'
    return 'bg-danger opacity-80'
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayLabels.map((l) => (
          <div key={l} className="text-[10px] text-muted text-center font-medium">{l}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {/* Offset for first cell */}
        {cells[0].dayOfWeek !== 1 &&
          Array.from({ length: cells[0].dayOfWeek === 0 ? 6 : cells[0].dayOfWeek - 1 }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
        {cells.map(({ dateStr, points, isToday, isFuture }) => (
          <div
            key={dateStr}
            title={dateStr}
            className={cn(
              'aspect-square rounded-md transition-all',
              getCellColor(points, isFuture),
              isToday && 'ring-2 ring-primary ring-offset-1'
            )}
          />
        ))}
      </div>
    </div>
  )
}
