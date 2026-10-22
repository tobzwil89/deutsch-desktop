import { useCallback, useMemo, useState } from 'react'
import { PREPLY_URL } from '../../config'
import { QUESTIONS, SKILL_NAMES, TEST_LEVELS, type Skill, type TestQuestion } from '../../data/leveltest'
import { finishRound, recordAnswer, saveLevelTest } from '../../game/api'
import { useGame } from '../../game/store'
import type { Cefr, LevelTestResult, Tally, VocabLevel } from '../../game/types'
import { dayKey } from '../../lib/date'
import { useAppKeys } from '../../lib/hooks'
import { shuffle } from '../../lib/random'
import { useUI } from '../../shell/uiStore'
import { Button, Card, Kbd, ProgressBar } from '../ui'

const TOTAL = 25
const START_LEVEL = 1 // A2
const XP_PER_CORRECT = 3
const COMPLETION_XP = 30

type Answer = { q: TestQuestion; chosen: string; correct: boolean }

const LEVEL_TEXT: Record<Cefr, string> = {
  A1: 'You can handle simple everyday phrases and introduce yourself.',
  A2: 'You can talk about familiar topics and manage routine situations.',
  B1: 'You can deal with most travel situations and talk about experiences and plans.',
  B2: 'You can discuss a wide range of topics fluently and understand complex texts.',
  C1: 'You can use German flexibly and effectively for social, academic and professional purposes.',
}

/** Nächste Frage: zufällig, ungenutzt, möglichst auf dem aktuellen Niveau. */
function pickQuestion(levelIdx: number, used: Set<string>): TestQuestion {
  const order = [0, 1, -1, 2, -2, 3, -3, 4, -4].map((d) => levelIdx + d).filter((i) => i >= 0 && i < TEST_LEVELS.length)
  for (const i of order) {
    const open = QUESTIONS.filter((q) => q.level === TEST_LEVELS[i] && !used.has(q.id))
    if (open.length) return shuffle(open)[0]
  }
  return QUESTIONS[0]
}

/**
 * Schätzung aus den letzten 15 Antworten: Niveau + 0,5 bei richtig, − 0,5 bei falsch.
 * Wer zwischen B1 (richtig) und B2 (falsch) pendelt, landet so bei B1.
 */
function estimate(answers: Answer[]): Cefr {
  const recent = answers.slice(-15)
  const ability = recent.reduce((sum, a) => sum + TEST_LEVELS.indexOf(a.q.level) + (a.correct ? 0.5 : -0.5), 0) / recent.length
  return TEST_LEVELS[Math.max(0, Math.min(TEST_LEVELS.length - 1, Math.floor(ability)))]
}

const deckFor = (level: Cefr): VocabLevel => (level === 'C1' ? 'B2' : level)

function Result({ result, answers, onRetake }: { result: LevelTestResult; answers: Answer[]; onRetake: () => void }) {
  const skills = Object.entries(result.skills) as [Skill, Tally][]
  const rated = skills.filter(([, t]) => t.t > 0).sort(([, a], [, b]) => b.c / b.t - a.c / a.t)
  const strongest = rated[0]?.[0]
  const weakest = rated.length > 1 ? rated[rated.length - 1][0] : undefined
  const missed = answers.filter((a) => !a.correct)
  const deck = deckFor(result.level)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 sm:p-6">
      <Card className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">Your estimated level</p>
        <p className="my-1 text-6xl font-black text-emerald-600 dark:text-emerald-400">{result.level}</p>
        <p className="text-sm">{LEVEL_TEXT[result.level]}</p>
      </Card>

      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
        <strong>Please note:</strong> this short test gives a rough estimate only – it is not an official certificate and doesn’t test speaking,
        listening or writing. In a trial lesson we can find out exactly where you stand.
      </p>

      {PREPLY_URL && (
        <a
          href={PREPLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-center text-white shadow-lg hover:from-emerald-500 hover:to-teal-500"
        >
          <span className="block text-lg font-bold">Book a trial lesson</span>
          <span className="block text-sm opacity-90">Get a personal learning plan for your {result.level} German ↗</span>
        </a>
      )}

      <Card>
        <h3 className="mb-3 font-semibold">Strengths and weaknesses</h3>
        <div className="space-y-2">
          {skills.map(([skill, t]) => (
            <div key={skill} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0">{SKILL_NAMES[skill]}</span>
              <ProgressBar value={t.t ? t.c / t.t : 0} className="flex-1" color="bg-emerald-500" label={`${SKILL_NAMES[skill]} score`} />
              <span className="w-14 shrink-0 text-right tabular-nums text-slate-500 dark:text-slate-400">
                {t.c}/{t.t}
              </span>
            </div>
          ))}
        </div>
        {strongest && weakest && strongest !== weakest && (
          <p className="mt-3 text-sm">
            Your strongest area is <strong>{SKILL_NAMES[strongest].toLowerCase()}</strong>; focus next on{' '}
            <strong>{SKILL_NAMES[weakest].toLowerCase()}</strong>.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="font-semibold">Recommended next step</h3>
        <p className="text-sm">
          Practise the <strong>{deck}</strong> vocabulary decks{result.level === 'C1' ? ' to keep your core vocabulary sharp' : ''}.
        </p>
        <Button onClick={() => useUI.getState().openApp('vocab', deck)}>Open {deck} vocabulary</Button>
      </Card>

      {missed.length > 0 && (
        <details className="rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          <summary className="cursor-pointer font-semibold">Review {missed.length} missed questions</summary>
          <ul className="mt-3 space-y-2">
            {missed.map((a) => (
              <li key={a.q.id}>
                <span className="text-xs text-slate-500 dark:text-slate-400">{a.q.level} · </span>
                {a.q.question}
                <br />
                <span className="text-rose-600 dark:text-rose-400">✗ {a.chosen}</span> ·{' '}
                <span className="text-emerald-700 dark:text-emerald-400">✓ {a.q.correct}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <Button variant="secondary" onClick={onRetake}>
        Retake the test
      </Button>
    </div>
  )
}

export default function LevelTestApp() {
  const saved = useGame((s) => s.levelTest)
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>(saved ? 'result' : 'intro')
  const [levelIdx, setLevelIdx] = useState(START_LEVEL)
  const [used] = useState(() => new Set<string>())
  const [question, setQuestion] = useState<TestQuestion>(() => pickQuestion(START_LEVEL, used))
  const [answers, setAnswers] = useState<Answer[]>([])
  const options = useMemo(() => shuffle([question.correct, ...question.wrong]), [question])

  const start = () => {
    used.clear()
    const q = pickQuestion(START_LEVEL, used)
    used.add(q.id)
    setQuestion(q)
    setLevelIdx(START_LEVEL)
    setAnswers([])
    setPhase('test')
  }

  const choose = useCallback(
    (chosen: string) => {
      const correct = chosen === question.correct
      recordAnswer({ correct, kind: 'test', xp: XP_PER_CORRECT, silent: true })
      const all = [...answers, { q: question, chosen, correct }]
      setAnswers(all)
      if (all.length >= TOTAL) {
        const skills: Record<string, Tally> = { grammar: { c: 0, t: 0 }, vocabulary: { c: 0, t: 0 }, reading: { c: 0, t: 0 } }
        for (const a of all) {
          skills[a.q.skill].t++
          if (a.correct) skills[a.q.skill].c++
        }
        saveLevelTest({ level: estimate(all), date: dayKey(), skills })
        finishRound(COMPLETION_XP)
        setPhase('result')
        return
      }
      // Adaptiv: richtig → schwerer, falsch → leichter
      const nextIdx = Math.max(0, Math.min(TEST_LEVELS.length - 1, levelIdx + (correct ? 1 : -1)))
      const q = pickQuestion(nextIdx, used)
      used.add(q.id)
      setLevelIdx(nextIdx)
      setQuestion(q)
    },
    [question, answers, levelIdx, used],
  )

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'test') return
      const i = ['1', '2', '3', '4'].indexOf(e.key)
      if (i >= 0) choose(options[i])
    },
    [phase, options, choose],
  )
  useAppKeys('leveltest', onKey)

  if (phase === 'result' && saved) return <Result result={saved} answers={answers} onRetake={start} />

  if (phase === 'intro' || phase === 'result') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <h3 className="text-2xl font-bold">What’s your German level?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {TOTAL} multiple-choice questions on grammar, vocabulary and reading. The test adapts to you: questions get harder when you answer
          correctly and easier when you don’t. It takes about 10 minutes – no time limit.
        </p>
        <ul className="grid w-full grid-cols-5 gap-1 text-xs font-semibold">
          {TEST_LEVELS.map((l) => (
            <li key={l} className="rounded-lg bg-emerald-100 py-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              {l}
            </li>
          ))}
        </ul>
        <Button onClick={start} className="w-full max-w-60 bg-emerald-600 text-base hover:bg-emerald-500">
          Start the test
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center gap-3 text-sm">
        <ProgressBar value={answers.length / TOTAL} className="flex-1" color="bg-emerald-500" label="Test progress" />
        <span className="tabular-nums text-slate-600 dark:text-slate-300">
          {answers.length + 1}/{TOTAL}
        </span>
      </div>
      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{SKILL_NAMES[question.skill]}</span>
        {question.text && <blockquote className="rounded-xl bg-slate-100 p-3 text-sm leading-relaxed dark:bg-slate-900">{question.text}</blockquote>}
        <p className="text-lg font-semibold" id="test-question">
          {question.question}
        </p>
        <div className="grid gap-2" role="group" aria-labelledby="test-question">
          {options.map((o, i) => (
            <button
              key={o}
              type="button"
              onClick={() => choose(o)}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 text-left hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-950/40"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold dark:bg-slate-800">{i + 1}</span>
              {o}
            </button>
          ))}
        </div>
      </Card>
      <p className="hidden text-center text-xs text-slate-500 md:block dark:text-slate-400">
        Tip: press <Kbd>1</Kbd>–<Kbd>4</Kbd> to answer
      </p>
    </div>
  )
}
