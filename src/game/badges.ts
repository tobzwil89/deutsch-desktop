import type { GameData } from './types'
import { levelInfo } from './xp'

export type BadgeDef = {
  id: string
  title: string
  /** Bedingung, wie sie gesperrt angezeigt wird */
  condition: string
  /** Kurzes Symbol auf der Medaille */
  glyph: string
  color: string
  check: (s: GameData) => boolean
}

export const learnedCount = (s: GameData) => Object.values(s.srs).filter((e) => e.box >= 3).length

const verbCorrect = (s: GameData) => Object.values(s.stats.verbs).reduce((n, v) => n + v.c, 0)

export const BADGES: BadgeDef[] = [
  { id: 'first-steps', title: 'First Steps', condition: 'Answer your first question correctly', glyph: '1', color: '#22c55e', check: (s) => s.stats.answers.c >= 1 },
  { id: 'goal-getter', title: 'Goal Getter', condition: 'Reach your daily goal once', glyph: '✓', color: '#0ea5e9', check: (s) => s.bestStreak >= 1 },
  { id: 'streak-7', title: '7-Day Streak', condition: 'Reach your daily goal 7 days in a row', glyph: '7', color: '#f97316', check: (s) => s.bestStreak >= 7 },
  { id: 'streak-30', title: '30-Day Streak', condition: 'Reach your daily goal 30 days in a row', glyph: '30', color: '#dc2626', check: (s) => s.bestStreak >= 30 },
  { id: 'words-100', title: '100 Words Learned', condition: 'Move 100 vocab cards to box 3 or higher', glyph: '100', color: '#6366f1', check: (s) => learnedCount(s) >= 100 },
  {
    id: 'article-master',
    title: 'Article Master',
    condition: '95 % accuracy over at least 100 der/die/das answers',
    glyph: 'A+',
    color: '#0f172a',
    check: (s) => s.stats.articles.t >= 100 && s.stats.articles.c / s.stats.articles.t >= 0.95,
  },
  { id: 'speed-demon', title: 'Speed Demon', condition: 'Reach a combo of 25 in Der/Die/Das', glyph: '×25', color: '#e11d48', check: (s) => s.stats.bestCombo >= 25 },
  { id: 'verb-virtuoso', title: 'Verb Virtuoso', condition: 'Conjugate 100 verbs correctly', glyph: 'V', color: '#ea580c', check: (s) => verbCorrect(s) >= 100 },
  { id: 'night-owl', title: 'Night Owl', condition: 'Practise between midnight and 4 a.m.', glyph: '☾', color: '#4c1d95', check: (s) => s.stats.nightOwl },
  { id: 'level-tester', title: 'Level Tester', condition: 'Complete the level test', glyph: 'C1', color: '#059669', check: (s) => s.levelTest !== null },
  { id: 'rising-star', title: 'Rising Star', condition: 'Reach level 5', glyph: '★', color: '#d97706', check: (s) => levelInfo(s.xp).level >= 5 },
]
