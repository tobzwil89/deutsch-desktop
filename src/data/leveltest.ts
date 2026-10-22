import type { Cefr } from '../game/types'
import raw from './leveltest.json'

export type Skill = 'grammar' | 'vocabulary' | 'reading'

export type TestQuestion = {
  id: string
  level: Cefr
  skill: Skill
  /** Lesetext (nur bei Leseverständnis) */
  text?: string
  question: string
  correct: string
  wrong: string[]
}

export const QUESTIONS = raw as TestQuestion[]
export const TEST_LEVELS: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1']
export const SKILL_NAMES: Record<Skill, string> = { grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading' }
