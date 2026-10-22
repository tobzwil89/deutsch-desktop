import type { Word } from '../data/vocab'

/** Vergleichsform: klein, Umlaute als ae/oe/ue/ss, Leerzeichen vereinheitlicht. */
export function normalize(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

/** Stimmt die Eingabe mit einer der Alternativen überein? Alternativen im JSON mit "|" trennen. */
export function matches(input: string, expected: string): boolean {
  const n = normalize(input)
  return expected.split('|').some((e) => normalize(e) === n)
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

export type CheckResult = { correct: boolean; hint?: string }

/** Tolerante Prüfung im Vokabeltrainer (Englisch → Deutsch). */
export function checkVocab(input: string, w: Word): CheckResult {
  const raw = input.trim().replace(/\s+/g, ' ')
  const n = normalize(raw)
  if (!n) return { correct: false }
  const full = w.article ? `${w.article} ${w.word}` : w.word
  const accepted = [full]
  if (w.word.startsWith('sich ')) accepted.push(w.word.slice(5))

  const exact = accepted.find((a) => normalize(a) === n)
  if (exact) {
    if (w.pos === 'noun' && !raw.split(' ').pop()![0].match(/[A-ZÄÖÜ]/)) {
      return { correct: true, hint: `Nouns are always capitalised: ${full}` }
    }
    if (raw.toLowerCase() !== exact.toLowerCase()) return { correct: true, hint: `Spelling with umlauts: ${full}` }
    return { correct: true }
  }

  if (w.pos === 'noun') {
    if (n === normalize(w.word)) return { correct: false, hint: `Don’t forget the article: ${full}` }
    const m = n.match(/^(der|die|das) (.+)$/)
    if (m && m[2] === normalize(w.word)) return { correct: false, hint: `Right word, wrong article – it’s ${full}` }
  }

  // Ein Tippfehler bei längeren Wörtern wird verziehen (Artikel muss stimmen)
  const target = normalize(full)
  if (target.length >= 8 && levenshtein(n, target) === 1 && n.split(' ')[0] === target.split(' ')[0]) {
    return { correct: true, hint: `Small typo – correct spelling: ${full}` }
  }
  return { correct: false }
}
