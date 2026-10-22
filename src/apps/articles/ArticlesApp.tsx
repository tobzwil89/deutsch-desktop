import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { VOCAB, VOCAB_LEVELS, type Article, type Word } from '../../data/vocab'
import { finishRound, recordAnswer, saveHighscore } from '../../game/api'
import { useGame } from '../../game/store'
import { useAppKeys } from '../../lib/hooks'
import { shuffle } from '../../lib/random'
import { Button, Kbd, Segmented, Stat } from '../ui'
import { explainArticle } from './rules'

const ROUND_SECONDS = 60
type LevelChoice = (typeof VOCAB_LEVELS)[number] | 'ALL'

const BUTTONS: { article: Article; keys: string[]; hint: string; cls: string }[] = [
  { article: 'der', keys: ['1', 'j'], hint: '1 / J', cls: 'bg-blue-600 hover:bg-blue-500' },
  { article: 'die', keys: ['2', 'k'], hint: '2 / K', cls: 'bg-rose-600 hover:bg-rose-500' },
  { article: 'das', keys: ['3', 'l'], hint: '3 / L', cls: 'bg-emerald-600 hover:bg-emerald-500' },
]

const multiplier = (combo: number) => Math.min(5, 1 + Math.floor(combo / 5))

type Mistake = { word: Word; chosen: Article; explanation: string }

function nounsFor(level: LevelChoice): Word[] {
  return VOCAB.filter((w) => w.pos === 'noun' && (level === 'ALL' || w.level === level))
}

export default function ArticlesApp() {
  const [level, setLevel] = useState<LevelChoice>('A1')
  const [phase, setPhase] = useState<'menu' | 'play' | 'over'>('menu')
  const highscores = useGame((s) => s.highscores)

  // Spielzustand
  const [queue, setQueue] = useState<Word[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [answers, setAnswers] = useState({ c: 0, t: 0 })
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [feedback, setFeedback] = useState<{ ok: boolean; text?: string; id: number } | null>(null)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [newRecord, setNewRecord] = useState(false)
  const endAt = useRef(0)
  const reduce = useReducedMotion()

  const start = () => {
    setQueue(shuffle(nounsFor(level)))
    setIndex(0)
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setAnswers({ c: 0, t: 0 })
    setMistakes([])
    setFeedback(null)
    setNewRecord(false)
    setTimeLeft(ROUND_SECONDS)
    endAt.current = Date.now() + ROUND_SECONDS * 1000
    setPhase('play')
  }

  // Countdown
  useEffect(() => {
    if (phase !== 'play') return
    const t = setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000)
      setTimeLeft(left)
      if (left <= 0) setPhase('over')
    }, 100)
    return () => clearInterval(t)
  }, [phase])

  // Rundenende: Highscore und Bonus-XP
  useEffect(() => {
    if (phase !== 'over') return
    setNewRecord(saveHighscore(`articles-${level}`, score))
    if (answers.t > 0) finishRound(10 + Math.floor(score / 100))
  }, [phase])

  const current = queue.length ? queue[index % queue.length] : undefined

  const answer = useCallback(
    (chosen: Article) => {
      if (phase !== 'play' || !current) return
      const ok = chosen === current.article
      const nextCombo = ok ? combo + 1 : 0
      const mult = multiplier(ok ? nextCombo : 0)
      recordAnswer({ correct: ok, kind: 'article', xp: ok ? multiplier(nextCombo) : 0, combo: nextCombo })
      setAnswers((a) => ({ c: a.c + (ok ? 1 : 0), t: a.t + 1 }))
      setCombo(nextCombo)
      setBestCombo((b) => Math.max(b, nextCombo))
      if (ok) {
        setScore((s) => s + 10 * mult)
        setFeedback({ ok: true, id: Date.now() })
      } else {
        const explanation = explainArticle(current.word, current.article!)
        setMistakes((m) => [...m, { word: current, chosen, explanation }])
        setFeedback({ ok: false, text: `${current.article} ${current.word} – ${explanation}`, id: Date.now() })
      }
      // Liste durch → neu mischen
      if (index + 1 >= queue.length) {
        setQueue(shuffle(queue))
        setIndex(0)
      } else setIndex(index + 1)
    },
    [phase, current, combo, index, queue],
  )

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (phase === 'play') {
        const b = BUTTONS.find((x) => x.keys.includes(e.key.toLowerCase()))
        if (b) {
          e.preventDefault()
          answer(b.article)
        }
      } else if (e.key === 'Enter') start()
    },
    [phase, answer, level],
  )
  useAppKeys('articles', onKey)

  const levelOptions = useMemo(
    () => [...VOCAB_LEVELS.map((l) => ({ value: l as LevelChoice, label: l })), { value: 'ALL' as LevelChoice, label: 'All' }],
    [],
  )

  if (phase === 'menu') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 p-6 text-center">
        <div className="flex gap-1 text-4xl font-black tracking-tight">
          <span className="text-blue-600">der</span>
          <span className="text-rose-600">die</span>
          <span className="text-emerald-600">das</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A noun appears – pick the right article as fast as you can. You have <strong>60 seconds</strong>. Every 5 correct answers in a row raise your
          multiplier (up to ×5).
        </p>
        <Segmented label="Level" options={levelOptions} value={level} onChange={setLevel} />
        <p className="text-sm">
          Highscore {level === 'ALL' ? 'All levels' : level}: <strong className="tabular-nums">{highscores[`articles-${level}`] ?? 0}</strong>
        </p>
        <Button onClick={start} className="w-full max-w-60 text-base">
          Start round <Kbd>Enter</Kbd>
        </Button>
        <p className="hidden text-xs text-slate-500 md:block dark:text-slate-400">Keyboard: 1 / 2 / 3 or J / K / L</p>
      </div>
    )
  }

  if (phase === 'over') {
    const acc = answers.t ? Math.round((answers.c / answers.t) * 100) : 0
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
        <h3 className="text-center text-2xl font-bold">{newRecord ? 'New highscore!' : 'Time’s up!'}</h3>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Score" value={score} />
          <Stat label="Best combo" value={bestCombo} />
          <Stat label="Accuracy" value={`${acc} %`} />
        </div>
        {mistakes.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Review your mistakes</h4>
            <ul className="space-y-2">
              {mistakes.map((m, i) => (
                <li key={i} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                  <strong>
                    {m.word.article} {m.word.word}
                  </strong>{' '}
                  <span className="text-slate-500 dark:text-slate-400">({m.word.en}) – you chose {m.chosen}</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{m.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-center gap-2">
          <Button onClick={start}>
            Play again <Kbd>Enter</Kbd>
          </Button>
          <Button variant="secondary" onClick={() => setPhase('menu')}>
            Change level
          </Button>
        </div>
      </div>
    )
  }

  const mult = multiplier(combo)
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="tabular-nums">Score {score}</span>
        <span className={`rounded-full px-2 py-0.5 tabular-nums ${mult > 1 ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 dark:bg-slate-700'}`}>
          ×{mult} · combo {combo}
        </span>
        <span className="tabular-nums">{Math.ceil(timeLeft)} s</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
        <div className={`h-full ${timeLeft < 10 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }} />
      </div>

      <m.div
        key={feedback?.id ?? 'start'}
        animate={reduce || !feedback ? {} : feedback.ok ? { scale: [1, 1.04, 1] } : { x: [0, -10, 10, -6, 6, 0] }}
        transition={{ duration: 0.3 }}
        className={`flex flex-1 flex-col items-center justify-center rounded-3xl border-2 p-6 text-center transition-colors ${
          feedback?.ok === false ? 'border-rose-400' : feedback?.ok ? 'border-emerald-400' : 'border-transparent'
        } bg-slate-50 dark:bg-slate-800/60`}
        aria-live="polite"
      >
        <div className="text-4xl font-bold sm:text-5xl">{current?.word}</div>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{current?.en}</div>
      </m.div>

      <p className="min-h-10 text-center text-sm text-rose-700 dark:text-rose-300" role="status">
        {feedback?.ok === false ? feedback.text : ''}
      </p>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {BUTTONS.map((b) => (
          <button
            key={b.article}
            type="button"
            onClick={() => answer(b.article)}
            className={`flex min-h-16 flex-col items-center justify-center rounded-2xl text-xl font-bold text-white shadow active:scale-95 ${b.cls}`}
          >
            {b.article}
            <span className="hidden text-[10px] font-medium opacity-80 md:block">{b.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
