import type { Tense } from '../game/types'
import raw from './verbs.json'

export const PERSONS = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'] as const
export type Person = (typeof PERSONS)[number]

/** Formen pro Person; mehrere richtige Formen mit "|" getrennt. */
export type Table = Record<Person, string>

export type Verb = {
  id: string
  infinitive: string
  en: string
  type: 'regular' | 'irregular' | 'mixed' | 'modal' | 'auxiliary'
  separable: boolean
  auxiliary: 'haben' | 'sein'
  participle: string
  present: Table
  preterite: Table
  perfect: Table
  note?: string
}

export const VERBS = raw as Verb[]
export const VERB_BY_ID = Object.fromEntries(VERBS.map((v) => [v.id, v])) as Record<string, Verb>

export const PERSON_LABEL: Record<Person, string> = {
  ich: 'ich',
  du: 'du',
  er: 'er / sie / es',
  wir: 'wir',
  ihr: 'ihr',
  sie: 'sie / Sie',
}

export const TENSES: { id: Tense; de: string; en: string }[] = [
  { id: 'present', de: 'Präsens', en: 'present' },
  { id: 'preterite', de: 'Präteritum', en: 'simple past' },
  { id: 'perfect', de: 'Perfekt', en: 'present perfect' },
]

/** Erste (Haupt-)Form anzeigen */
export const mainForm = (form: string) => form.split('|')[0]
