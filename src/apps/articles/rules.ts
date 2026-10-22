import type { Article } from '../../data/vocab'

// Endungsregeln für kurze Erklärungen nach einem Fehler.
// "always" = ohne nennenswerte Ausnahmen, sonst "usually".
type Rule = { test: RegExp; article: Article; text: string }

const RULES: Rule[] = [
  { test: /ung$/, article: 'die', text: 'Nouns ending in -ung are always feminine (die).' },
  { test: /(heit|keit)$/, article: 'die', text: 'Nouns ending in -heit / -keit are always feminine (die).' },
  { test: /schaft$/, article: 'die', text: 'Nouns ending in -schaft are always feminine (die).' },
  { test: /(tion|sion)$/, article: 'die', text: 'Nouns ending in -tion / -sion are always feminine (die).' },
  { test: /tät$/, article: 'die', text: 'Nouns ending in -tät are always feminine (die).' },
  { test: /..ei$/, article: 'die', text: 'Nouns ending in -ei (Bäckerei, Polizei) are feminine (die).' },
  { test: /..ie$/, article: 'die', text: 'Nouns ending in -ie are usually feminine (die).' },
  { test: /..ik$/, article: 'die', text: 'Nouns ending in -ik (Musik, Politik) are usually feminine (die).' },
  { test: /(chen|lein)$/, article: 'das', text: 'Diminutives ending in -chen / -lein are always neuter (das).' },
  { test: /ment$/, article: 'das', text: 'Nouns ending in -ment are usually neuter (das).' },
  { test: /..um$/, article: 'das', text: 'Nouns ending in -um (Praktikum, Zentrum) are usually neuter (das).' },
  { test: /nis$/, article: 'das', text: 'Nouns ending in -nis are usually neuter (das) – a few are feminine.' },
  { test: /(ling|ismus)$/, article: 'der', text: 'Nouns ending in -ling / -ismus are masculine (der).' },
  { test: /..e$/, article: 'die', text: 'Most nouns ending in -e are feminine (die).' },
]

/** Erklärung zum richtigen Artikel – inklusive Hinweis auf Ausnahmen. */
export function explainArticle(word: string, article: Article): string {
  const lower = word.toLowerCase()
  const rule = RULES.find((r) => r.test.test(lower))
  if (rule) {
    if (rule.article === article) return rule.text
    return `${rule.text.replace(/\.$/, '')} – but ${article} ${word} is an exception.`
  }
  if (word.length > 9) return 'Compound noun? The last part decides the article.'
  return 'No reliable rule here – learn the noun together with its article.'
}
