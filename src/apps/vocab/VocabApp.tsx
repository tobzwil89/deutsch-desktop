import { useCallback, useMemo, useRef, useState } from 'react'
import { ARTICLE_STYLE, pluralLabel, topicName, VOCAB, VOCAB_LEVELS, withArticle, type Word } from '../../data/vocab'
import { finishRound, rateCard, recordAnswer } from '../../game/api'
import { useGame } from '../../game/store'
import type { VocabLevel } from '../../game/types'
import { checkVocab, type CheckResult } from '../../lib/answerCheck'
import { dayKey } from '../../lib/date'
import { useAppKeys } from '../../lib/hooks'
import { buildExtraSession, buildSession, intervalLabel, type Rating } from '../../lib/srs'
import { useUI } from '../../shell/uiStore'
import { Button, Card, Kbd, ProgressBar, Segmented, Stat } from '../ui'
import { UmlautBar } from '../UmlautBar'

type Mode = 'flip' | 'type'

// XP pro Bewertung; schwere Karten (schon einmal vergessen) geben +3
const XP_FOR: Record<Rating, number> = { again: 0, hard: 3, good: 5, easy: 6 }
const XP_TYPED = 8
const HARD_CARD_BONUS = 3
const SESSION_BONUS = 10

const RATINGS: { rating: Rating; label: string; key: string; cls: string }[] = [
  { rating: 'again', label: 'Again', key: '1', cls: 'bg-rose-600 hover:bg-rose-500' },
  { rating: 'hard', label: 'Hard', key: '2', cls: 'bg-amber-500 hover:bg-amber-400' },
  { rating: 'good', label: 'Good', key: '3', cls: 'bg-emerald-600 hover:bg-emerald-500' },
  { rating: 'easy', label: 'Easy', key: '4', cls: 'bg-sky-600 hover:bg-sky-500' },
]

function WordTitle({ w }: { w: Word }) {
  return (
    <div className="text-3xl font-bold sm:text-4xl">
      {w.article && <span className={ARTICLE_STYLE[w.article]}>{w.article} </span>}
      {w.word}
    </div>
  )
}

function Details({ w }: { w: Word }) {
  return (
    <div className="space-y-2 text-sm">
      {w.pos === 'noun' && (
        <p>
          <span className="text-slate-500 dark:text-slate-400">Plural:</span> {pluralLabel(w)}
        </p>
      )}
      <p className="italic">„{w.example}“</p>
      <p className="text-slate-500 dark:text-slate-400">{w.exampleEn}</p>
    </div>
  )
}

type Summary = { reviewed: number; correct: number; xp: number }

function Session({ cards, mode, onDone }: { cards: Word[]; mode: Mode; onDone: (s: Summary) => void }) {
  const [queue, setQueue] = useState(cards)
  const [pos, setPos] = useState(0)
  const [requeued] = useState(() => new Set<string>())
  const [flipped, setFlipped] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [stats, setStats] = useState<Summary>({ reviewed: 0, correct: 0, xp: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const srs = useGame((s) => s.srs)
  const card = queue[pos]
  const entry = srs[card.id]

  const advance = useCallback(
    (rating: Rating, correct: boolean, xp: number) => {
      rateCard(card.id, rating)
      recordAnswer({ correct, kind: 'vocab', xp })
      const next = { reviewed: stats.reviewed + 1, correct: stats.correct + (correct ? 1 : 0), xp: stats.xp + (correct ? xp : 0) }
      setStats(next)
      // Vergessene Karte kommt in dieser Sitzung noch einmal (einmalig)
      let q = queue
      if (rating === 'again' && !requeued.has(card.id)) {
        requeued.add(card.id)
        q = [...queue, card]
        setQueue(q)
      }
      if (pos + 1 >= q.length) {
        finishRound(SESSION_BONUS)
        onDone({ ...next, xp: next.xp + SESSION_BONUS })
        return
      }
      setPos(pos + 1)
      setFlipped(false)
      setInput('')
      setResult(null)
      requestAnimationFrame(() => inputRef.current?.focus())
    },
    [card, stats, queue, pos, requeued, onDone],
  )

  const bonus = entry && entry.lapses > 0 ? HARD_CARD_BONUS : 0

  const rateFlip = (r: Rating) => advance(r, r !== 'again', r === 'again' ? 0 : XP_FOR[r] + bonus)

  const check = () => {
    if (!input.trim()) return
    setResult(checkVocab(input, card))
  }
  const continueTyped = () => {
    if (!result) return
    advance(result.correct ? 'good' : 'again', result.correct, result.correct ? XP_TYPED + bonus : 0)
  }

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (mode === 'flip') {
        if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault()
          setFlipped(true)
        } else if (flipped) {
          const r = RATINGS.find((x) => x.key === e.key)
          if (r) rateFlip(r.rating)
        }
      } else if (result && e.key === 'Enter') continueTyped()
    },
    [mode, flipped, result, advance],
  )
  useAppKeys('vocab', onKey)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center gap-3 text-sm">
        <ProgressBar value={pos / queue.length} className="flex-1" label="Session progress" />
        <span className="tabular-nums text-slate-600 dark:text-slate-300">
          {pos + 1}/{queue.length}
        </span>
        <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">+{stats.xp} XP</span>
      </div>

      <Card className="flex min-h-64 flex-col justify-center gap-4 p-6 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {card.level} · {topicName(card.topic)} · {card.pos}
          {entry ? ` · box ${entry.box}` : ' · new'}
        </div>

        {mode === 'flip' ? (
          <>
            <WordTitle w={card} />
            {flipped ? (
              <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="text-xl font-semibold">{card.en}</p>
                <Details w={card} />
              </div>
            ) : (
              <Button onClick={() => setFlipped(true)} className="mx-auto">
                Show answer <Kbd>Space</Kbd>
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold">{card.en}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {card.pos === 'noun' ? 'Type the German noun with its article, e.g. „der Tisch“' : `Type the German ${card.pos}`}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (result) continueTyped()
                else check()
              }}
              className="flex flex-col items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                readOnly={!!result}
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                aria-label="Your answer in German"
                className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              />
              {!result && <UmlautBar inputRef={inputRef} value={input} onChange={setInput} />}
              {!result && (
                <Button type="submit" disabled={!input.trim()}>
                  Check <Kbd>Enter</Kbd>
                </Button>
              )}
            </form>
            {result && (
              <div
                role="status"
                className={`space-y-3 rounded-xl p-4 text-left ${result.correct ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-rose-50 dark:bg-rose-950/50'}`}
              >
                <p className={`font-semibold ${result.correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {result.correct ? 'Richtig!' : 'Not quite.'} <span className="text-slate-900 dark:text-white">{withArticle(card)}</span>
                </p>
                {result.hint && <p className="text-sm">{result.hint}</p>}
                <Details w={card} />
                <Button onClick={continueTyped} className="w-full">
                  Continue <Kbd>Enter</Kbd>
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {mode === 'flip' && flipped && (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.rating}
              type="button"
              onClick={() => rateFlip(r.rating)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-xl text-sm font-semibold text-white ${r.cls}`}
            >
              {r.label}
              <span className="text-[10px] font-normal opacity-90">
                {intervalLabel(entry?.box ?? 1, r.rating)} <Kbd>{r.key}</Kbd>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function deckCounts(words: Word[], srs: ReturnType<typeof useGame.getState>['srs'], today: string) {
  let due = 0
  let fresh = 0
  let learned = 0
  for (const w of words) {
    const e = srs[w.id]
    if (!e) fresh++
    else {
      if (e.due <= today) due++
      if (e.box >= 3) learned++
    }
  }
  return { due, fresh, learned, total: words.length }
}

export default function VocabApp() {
  const suggested = useUI((s) => s.params.vocab) as VocabLevel | undefined
  const [level, setLevel] = useState<VocabLevel>(suggested && VOCAB_LEVELS.includes(suggested) ? suggested : 'A1')
  const [mode, setMode] = useState<Mode>('flip')
  const [session, setSession] = useState<{ cards: Word[]; id: number } | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const srs = useGame((s) => s.srs)
  const today = dayKey()

  const levelWords = useMemo(() => VOCAB.filter((w) => w.level === level), [level])
  const topics = useMemo(() => [...new Set(levelWords.map((w) => w.topic))], [levelWords])

  const startDeck = (words: Word[]) => {
    let cards = buildSession(words, srs, today)
    if (!cards.length) cards = buildExtraSession(words, srs)
    setSummary(null)
    setSession({ cards, id: Date.now() })
  }

  if (session) {
    return (
      <Session
        key={session.id}
        cards={session.cards}
        mode={mode}
        onDone={(s) => {
          setSession(null)
          setSummary(s)
        }}
      />
    )
  }

  if (summary) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-6 text-center">
        <h3 className="text-2xl font-bold">Session complete!</h3>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Cards" value={summary.reviewed} />
          <Stat label="Correct" value={`${summary.reviewed ? Math.round((summary.correct / summary.reviewed) * 100) : 0} %`} />
          <Stat label="XP earned" value={`+${summary.xp}`} />
        </div>
        <Button onClick={() => setSummary(null)}>Back to decks</Button>
      </div>
    )
  }

  const decks = [{ id: 'all', title: `All ${level} words`, words: levelWords }, ...topics.map((t) => ({ id: t, title: topicName(t), words: levelWords.filter((w) => w.topic === t) }))]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      {suggested && (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          Based on your level test, we recommend the <strong>{suggested}</strong> decks.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Level" value={level} onChange={setLevel} options={VOCAB_LEVELS.map((l) => ({ value: l, label: l }))} />
        <Segmented
          label="Practice mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'flip', label: 'Flip cards' },
            { value: 'type', label: 'Type answer' },
          ]}
        />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {decks.map((d) => {
          const c = deckCounts(d.words, srs, today)
          const nothingDue = c.due === 0 && c.fresh === 0
          return (
            <li key={d.id}>
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{d.title}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{c.total} words</span>
                </div>
                <ProgressBar value={c.learned / c.total} color="bg-emerald-500" label={`${d.title}: ${c.learned} of ${c.total} learned`} />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-rose-600 dark:text-rose-400">{c.due}</strong> due · <strong>{c.fresh}</strong> new · {c.learned} learned
                </p>
                <Button variant={nothingDue ? 'secondary' : 'primary'} onClick={() => startDeck(d.words)} className="mt-auto">
                  {nothingDue ? 'Extra practice' : 'Study'}
                </Button>
              </Card>
            </li>
          )
        })}
      </ul>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Spaced repetition: cards you know well come back later (1 → 3 → 7 → 14 days), cards you forget come back today.
      </p>
    </div>
  )
}
