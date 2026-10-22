export type VocabLevel = 'A1' | 'A2' | 'B1' | 'B2'
export type Cefr = VocabLevel | 'C1'
export type Tense = 'present' | 'preterite' | 'perfect'

export type Tally = { c: number; t: number }

/** Leitner-Box (1–5), nächster Fälligkeitstag und wie oft vergessen. */
export type SrsEntry = { box: number; due: string; lapses: number }

export type LevelTestResult = {
  level: Cefr
  date: string
  skills: Record<string, Tally>
}

export type GameData = {
  xp: number
  /** Für Streak Freezes ausgegebene XP (Level bleibt davon unberührt). */
  xpSpent: number
  dailyGoal: number
  /** XP pro Tag, Schlüssel "YYYY-MM-DD" */
  activity: Record<string, number>
  streak: number
  bestStreak: number
  lastGoalDay: string | null
  freezes: number
  srs: Record<string, SrsEntry>
  stats: {
    answers: Tally
    articles: Tally
    verbs: Record<string, Tally>
    tenses: Record<string, Tally>
    bestCombo: number
    rounds: number
    nightOwl: boolean
  }
  highscores: Record<string, number>
  badges: Record<string, string>
  levelTest: LevelTestResult | null
  sound: boolean
}
