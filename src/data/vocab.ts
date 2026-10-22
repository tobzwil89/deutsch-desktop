import type { VocabLevel } from '../game/types'
import a1 from './vocab/a1.json'
import a2 from './vocab/a2.json'
import b1 from './vocab/b1.json'
import b2 from './vocab/b2.json'

export type Article = 'der' | 'die' | 'das'

export type Word = {
  id: string
  word: string
  pos: 'noun' | 'verb' | 'adjective' | 'adverb'
  article?: Article
  /** Pluralform ohne Artikel; null = kein oder kaum gebräuchlicher Plural */
  plural?: string | null
  en: string
  example: string
  exampleEn: string
  topic: string
  level: VocabLevel
}

type RawWord = Omit<Word, 'level'>

const withLevel = (list: unknown, level: VocabLevel): Word[] => (list as RawWord[]).map((w) => ({ ...w, level }))

export const VOCAB: Word[] = [...withLevel(a1, 'A1'), ...withLevel(a2, 'A2'), ...withLevel(b1, 'B1'), ...withLevel(b2, 'B2')]

export const VOCAB_LEVELS: VocabLevel[] = ['A1', 'A2', 'B1', 'B2']

/** Anzeigenamen der Themen. Neues Thema in den JSON-Dateien? Hier einen Namen ergänzen. */
export const TOPIC_NAMES: Record<string, string> = {
  everyday: 'Everyday life',
  food: 'Food & drink',
  travel: 'Travel',
  work: 'Work & study',
}

export const topicName = (t: string) => TOPIC_NAMES[t] ?? t

export const withArticle = (w: Word) => (w.article ? `${w.article} ${w.word}` : w.word)

export const pluralLabel = (w: Word) => (w.plural ? `die ${w.plural}` : 'no plural (or rarely used)')

export const ARTICLE_STYLE: Record<Article, string> = {
  der: 'text-blue-600 dark:text-blue-400',
  die: 'text-rose-600 dark:text-rose-400',
  das: 'text-emerald-600 dark:text-emerald-400',
}
