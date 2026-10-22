import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameData } from './types'

export const STORAGE_KEY = 'deutsch-desktop-progress'

export const initialGameData = (): GameData => ({
  xp: 0,
  xpSpent: 0,
  dailyGoal: 50,
  activity: {},
  streak: 0,
  bestStreak: 0,
  lastGoalDay: null,
  freezes: 0,
  srs: {},
  stats: {
    answers: { c: 0, t: 0 },
    articles: { c: 0, t: 0 },
    verbs: {},
    tenses: {},
    bestCombo: 0,
    rounds: 0,
    nightOwl: false,
  },
  highscores: {},
  badges: {},
  levelTest: null,
  sound: true,
})

// Gesamter Lernfortschritt, dauerhaft in localStorage. Die Logik liegt in api.ts.
export const useGame = create<GameData>()(
  persist(() => initialGameData(), {
    name: STORAGE_KEY,
    version: 1,
  }),
)
