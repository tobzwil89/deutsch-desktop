import type { SrsEntry } from '../game/types'
import { addDays } from './date'
import { shuffle } from './random'

// Leitner-System mit 5 Boxen. Abstand bis zur nächsten Wiederholung je Box (Tage):
export const INTERVALS = [0, 1, 3, 7, 14]

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export function nextBox(current: number, rating: Rating): number {
  if (rating === 'again') return 1
  if (rating === 'hard') return Math.max(1, current)
  if (rating === 'good') return Math.min(5, current + 1)
  return Math.min(5, current + 2)
}

export function rate(prev: SrsEntry | undefined, rating: Rating, today: string): SrsEntry {
  const box = nextBox(prev?.box ?? 1, rating)
  return {
    box,
    due: addDays(today, INTERVALS[box - 1]),
    lapses: (prev?.lapses ?? 0) + (prev && rating === 'again' ? 1 : 0),
  }
}

export function intervalLabel(current: number, rating: Rating): string {
  const days = INTERVALS[nextBox(current, rating) - 1]
  return days === 0 ? 'today' : days === 1 ? '1 day' : `${days} days`
}

/** Fällige Karten zuerst (älteste zuerst), danach einige neue. */
export function buildSession<T extends { id: string }>(
  items: T[],
  srs: Record<string, SrsEntry>,
  today: string,
  size = 20,
  maxNew = 10,
): T[] {
  const due = items
    .filter((w) => srs[w.id] && srs[w.id].due <= today)
    .sort((a, b) => srs[a.id].due.localeCompare(srs[b.id].due) || srs[a.id].box - srs[b.id].box)
    .slice(0, size)
  const fresh = shuffle(items.filter((w) => !srs[w.id])).slice(0, Math.max(0, Math.min(maxNew, size - due.length)))
  return [...due, ...fresh]
}

/** Zusatzübung, wenn nichts fällig ist: Karten, die bald fällig werden. */
export function buildExtraSession<T extends { id: string }>(items: T[], srs: Record<string, SrsEntry>, size = 20): T[] {
  return [...items].sort((a, b) => (srs[a.id]?.due ?? '').localeCompare(srs[b.id]?.due ?? '')).slice(0, size)
}
