import { useCallback, useMemo, useRef, useState } from 'react'
import { mainForm, PERSON_LABEL, PERSONS, TENSES, VERB_BY_ID, VERBS, type Person, type Verb } from '../../data/verbs'
import { recordAnswer, awardXP } from '../../game/api'
import { useGame } from '../../game/store'
import type { Tally, Tense } from '../../game/types'
import { matches } from '../../lib/answerCheck'
import { useAppKeys } from '../../lib/hooks'
import { pick } from '../../lib/random'
import { Button, Card, Kbd, ProgressBar, Segmented } from '../ui'
import { UmlautBar } from '../UmlautBar'

type Category = 'all' | 'regular' | 'irregular' | 'separable' | 'modal' | 'weak'
type Task = { verb: Verb; person: Person; tense: Tense }

const XP: Record<Tense, number> = { present: 3, preterite: 4, perfect: 4 }
const STREAK_EVERY = 10
const STREAK_BONUS = 5

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'regular', label: 'Regular' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'separable', label: 'Separable' },
  { value: 'modal', label: 'Modal' },
  { value: 'weak', label: 'My weak verbs' },
]

const errorRate = (t: Tally) => (t.t ? 1 - t.c / t.t : 0)

/** Verben mit den meisten Fehlern (mind. ein Fehler, Trefferquote unter 80 %). */
function weakVerbs(stats: Record<string, Tally>): Verb[] {
  return Object.entries(stats)
    .filter(([id, t]) => VERB_BY_ID[id] && t.t - t.c > 0 && t.c / t.t < 0.8)
    .sort(([, a], [, b]) => b.t - b.c - (a.t - a.c) || errorRate(b) - errorRate(a))
    .slice(0, 10)
    .map(([id]) => VERB_BY_ID[id])
}

function poolFor(cat: Category, weak: Verb[]): Verb[] {
  switch (cat) {
    case 'regular':
      return VERBS.filter((v) => v.type === 'regular' && !v.separable)
    case 'irregular':
      return VERBS.filter((v) => ['irregular', 'mixed', 'auxiliary'].includes(v.type) && !v.separable)
    case 'separable':
      return VERBS.filter((v) => v.separable)
    case 'modal':
      return VERBS.filter((v) => v.type === 'modal')
    case 'weak':
      return weak
    default:
      return VERBS
  }
}

function newTask(pool: Verb[], tenses: Tense[], prev?: Task): Task {
  let verb = pick(pool)
  if (pool.length > 1) while (verb.id === prev?.verb.id) verb = pick(pool)
  return { verb, person: pick(PERSONS), tense: pick(tenses) }
}

/** Personalpronomen am Anfang ist erlaubt („du gehst“ = „gehst“). */
const stripPronoun = (s: string) => s.trim().replace(/^(ich|du|er|sie|es|wir|ihr|man)\s+/i, '')

function TenseTable({ verb, tense, highlight }: { verb: Verb; tense: Tense; highlight: Person }) {
  return (
    <table className="mx-auto text-left text-sm">
      <tbody>
        {PERSONS.map((p) => (
          <tr key={p} className={p === highlight ? 'font-semibold text-indigo-700 dark:text-indigo-300' : ''}>
            <td className="pr-4 text-slate-500 dark:text-slate-400">{PERSON_LABEL[p]}</td>
            <td>{verb[tense][p].split('|').join(' / ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function WeakSpots({ onPractise }: { onPractise: () => void }) {
  const stats = useGame((s) => s.stats)
  const weak = weakVerbs(stats.verbs)
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="mb-2 font-semibold">Accuracy by tense</h3>
        <div className="space-y-2">
          {TENSES.map((t) => {
            const tally = stats.tenses[t.id] ?? { c: 0, t: 0 }
            const acc = tally.t ? tally.c / tally.t : 0
            return (
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0">{t.de}</span>
                <ProgressBar value={acc} className="flex-1" color={acc < 0.7 ? 'bg-rose-500' : 'bg-emerald-500'} label={`${t.de} accuracy`} />
                <span className="w-24 shrink-0 text-right tabular-nums text-slate-500 dark:text-slate-400">
                  {tally.t ? `${Math.round(acc * 100)} % (${tally.t})` : '–'}
                </span>
              </div>
            )
          })}
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Verbs you get wrong most often</h3>
        {weak.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">No weak verbs yet – keep practising and they’ll show up here.</p>
        ) : (
          <>
            <ul className="mb-3 grid gap-1 text-sm sm:grid-cols-2">
              {weak.map((v) => {
                const t = stats.verbs[v.id]
                return (
                  <li key={v.id} className="flex justify-between rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    <span>
                      <strong>{v.infinitive}</strong> <span className="text-slate-500 dark:text-slate-400">{v.en}</span>
                    </span>
                    <span className="tabular-nums text-rose-600 dark:text-rose-400">{t.t - t.c} ✗</span>
                  </li>
                )
              })}
            </ul>
            <Button onClick={onPractise}>Practise weak verbs</Button>
          </>
        )}
      </section>
    </div>
  )
}

export default function ConjugatorApp() {
  const [tab, setTab] = useState<'drill' | 'stats'>('drill')
  const [category, setCategory] = useState<Category>('all')
  const [tenses, setTenses] = useState<Tense[]>(['present', 'preterite', 'perfect'])
  const verbStats = useGame((s) => s.stats.verbs)
  const weak = useMemo(() => weakVerbs(verbStats), [verbStats])
  const pool = poolFor(category, weak)
  const [task, setTask] = useState<Task>(() => newTask(VERBS, tenses))
  const [input, setInput] = useState('')
  const [result, setResult] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const next = useCallback(
    (p = pool, t = tenses) => {
      if (!p.length) return
      setTask((prev) => newTask(p, t, prev))
      setInput('')
      setResult(null)
      requestAnimationFrame(() => inputRef.current?.focus())
    },
    [pool, tenses],
  )

  const changeCategory = (c: Category) => {
    setCategory(c)
    next(poolFor(c, weak), tenses)
  }

  const toggleTense = (t: Tense) => {
    const nextTenses = tenses.includes(t) ? tenses.filter((x) => x !== t) : [...tenses, t]
    if (!nextTenses.length) return
    setTenses(nextTenses)
    next(pool, nextTenses)
  }

  const check = () => {
    if (!input.trim()) return
    const expected = task.verb[task.tense][task.person]
    const ok = matches(stripPronoun(input), expected)
    setResult(ok)
    recordAnswer({ correct: ok, kind: 'verb', xp: XP[task.tense], verbId: task.verb.id, tense: task.tense })
    const s = ok ? streak + 1 : 0
    setStreak(s)
    if (ok && s % STREAK_EVERY === 0) awardXP(STREAK_BONUS)
  }

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (result !== null && e.key === 'Enter') next()
    },
    [result, next],
  )
  useAppKeys('conjugator', onKey)

  const tenseInfo = TENSES.find((t) => t.id === task.tense)!
  const expected = task.verb[task.tense][task.person]

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 sm:p-6">
      <Segmented
        label="View"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'drill', label: 'Drill' },
          { value: 'stats', label: 'Weak spots' },
        ]}
      />

      {tab === 'stats' ? (
        <WeakSpots
          onPractise={() => {
            setTab('drill')
            changeCategory('weak')
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Tenses to practise">
            {TENSES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tenses.includes(t.id)}
                onClick={() => toggleTense(t.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  tenses.includes(t.id)
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                {t.de}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Verbs:</span>
            <select
              value={category}
              onChange={(e) => changeCategory(e.target.value as Category)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                  {c.value === 'weak' ? ` (${weak.length})` : ''}
                </option>
              ))}
            </select>
            <span className="ml-auto font-semibold tabular-nums text-orange-600 dark:text-orange-400">Streak {streak}</span>
          </label>

          {pool.length === 0 ? (
            <Card className="text-center text-sm">No weak verbs yet. Practise a bit first, then come back!</Card>
          ) : (
            <Card className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {tenseInfo.de} · {tenseInfo.en}
              </div>
              <div>
                <div className="text-3xl font-bold">{task.verb.infinitive}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{task.verb.en}</div>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{PERSON_LABEL[task.person]}</span> …
              </div>
              {task.verb.separable && task.tense !== 'perfect' && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Separable verb: put the prefix at the end, e.g. „stehe auf“.</p>
              )}
              <form
                className="flex w-full flex-col items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (result === null) check()
                  else next()
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  readOnly={result !== null}
                  autoFocus
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Conjugate ${task.verb.infinitive} for ${task.person} in ${tenseInfo.de}`}
                  placeholder={task.tense === 'perfect' ? 'e.g. bin gegangen' : ''}
                  className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
                />
                {result === null && <UmlautBar inputRef={inputRef} value={input} onChange={setInput} />}
                <Button type="submit" disabled={!input.trim()} className="bg-orange-600 hover:bg-orange-500">
                  {result === null ? 'Check' : 'Next'} <Kbd>Enter</Kbd>
                </Button>
              </form>
              {result !== null && (
                <div
                  role="status"
                  className={`w-full space-y-3 rounded-xl p-4 ${result ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-rose-50 dark:bg-rose-950/50'}`}
                >
                  <p className={`font-semibold ${result ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {result ? 'Richtig!' : 'Not quite – correct:'} {PERSON_LABEL[task.person].split(' ')[0]} {mainForm(expected)}
                  </p>
                  <TenseTable verb={task.verb} tense={task.tense} highlight={task.person} />
                  {task.tense === 'perfect' && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Perfekt = {task.verb.auxiliary} + {task.verb.participle}
                    </p>
                  )}
                  {task.verb.note && <p className="text-xs text-slate-600 dark:text-slate-300">{task.verb.note}</p>}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
