export interface DayScore {
  total: number
  completed: number
  points: number
}

/**
 * Berechnet Punkte für eine Kategorie (Habits ODER Änderungen):
 *   Alle erledigt       → +5
 *   Mehr als die Hälfte → +2
 *   Genau die Hälfte    → ±0
 *   Weniger als Hälfte  → -2
 *   Gar keine           → -5
 *   Keine gesetzt       →  0 (neutral)
 */
export function calculateDayPoints(total: number, completed: number): number {
  if (total === 0) return 0
  if (completed === total) return 5
  if (completed > total / 2) return 2
  if (completed === Math.floor(total / 2) && total % 2 === 0) return 0
  if (completed < total / 2 && completed > 0) return -2
  return -5
}

/**
 * Kombinierter Tages-Score aus Habits + "Was will ich ändern":
 *   Habits:   -5 bis +5
 *   Änderungen: -5 bis +5
 *   Gesamt:  -10 bis +10
 *
 *   Alles erledigt (Habits + Änderungen) → +10
 *   Alles leer (Habits + Änderungen)     → -10
 */
export function calculateCombinedScore(
  totalHabits: number,
  completedHabits: number,
  totalChanges: number,
  completedChanges: number,
): number {
  return calculateDayPoints(totalHabits, completedHabits) +
         calculateDayPoints(totalChanges, completedChanges)
}

export function getScoreColor(points: number): string {
  if (points > 0) return 'text-success'
  if (points < 0) return 'text-danger'
  return 'text-muted'
}

export function getScoreBgColor(points: number): string {
  if (points > 0) return 'bg-success-light'
  if (points < 0) return 'bg-danger-light'
  return 'bg-neutral-light'
}

export function getScoreLabel(points: number): string {
  if (points === 10) return 'Perfekter Tag!'
  if (points >= 6) return 'Hervorragender Tag'
  if (points > 0) return 'Guter Tag'
  if (points === 0) return 'Durchschnittlicher Tag'
  if (points >= -4) return 'Schwacher Tag'
  return 'Verpasster Tag'
}

/**
 * Berechnet den aktuellen Streak (aufeinanderfolgende Tage mit positivem Score).
 */
export function calculateStreak(scoreDates: string[]): number {
  if (scoreDates.length === 0) return 0

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const dateSet = new Set(scoreDates)
  let streak = 0
  const cursor = new Date(today)

  if (!dateSet.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    if (dateSet.has(dateStr)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
