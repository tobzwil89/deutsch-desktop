import { toggleSound } from '../game/api'
import { useGame } from '../game/store'
import { levelInfo } from '../game/xp'
import { dayKey } from '../lib/date'
import { useUI } from './uiStore'

export function GoalRing({ size = 16, stroke = 3 }: { size?: number; stroke?: number }) {
  const todayXp = useGame((s) => s.activity[dayKey()] ?? 0)
  const goal = useGame((s) => s.dailyGoal)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.min(1, todayXp / goal)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={p >= 1 ? '#22c55e' : '#f59e0b'}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Flame({ active, size = 14 }: { active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"
        fill={active ? '#f97316' : 'currentColor'}
        fillOpacity={active ? 1 : 0.35}
      />
      {active && <path d="M12 13c1 1.5 2.5 2.5 2.5 4.5a2.5 2.5 0 0 1-5 0c0-1.5 1.5-2.5 2.5-4.5z" fill="#fde047" />}
    </svg>
  )
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
    </svg>
  )
}

/** Level, XP, Tagesziel, Streak und Ton – in der Menüleiste und auf dem Handy. */
export function GameStatus({ mobile = false }: { mobile?: boolean }) {
  const xp = useGame((s) => s.xp)
  const streak = useGame((s) => s.streak)
  const goalDone = useGame((s) => s.lastGoalDay === dayKey())
  const todayXp = useGame((s) => s.activity[dayKey()] ?? 0)
  const goal = useGame((s) => s.dailyGoal)
  const sound = useGame((s) => s.sound)
  const { level, current, needed, progress } = levelInfo(xp)
  const btn = 'flex h-7 items-center gap-1 rounded px-1.5 hover:bg-black/10 dark:hover:bg-white/15'
  const openProgress = () => useUI.getState().openApp('progress')

  return (
    <>
      <button type="button" className={btn} onClick={openProgress} aria-label={`Daily goal: ${todayXp} of ${goal} XP today`} title={`Daily goal: ${todayXp}/${goal} XP`}>
        <GoalRing />
      </button>
      <button type="button" className={btn} onClick={openProgress} aria-label={`Streak: ${streak} days${goalDone ? ', goal reached today' : ''}`} title="Daily streak">
        <Flame active={goalDone} />
        <span className="tabular-nums font-medium">{streak}</span>
      </button>
      <button type="button" className={btn} onClick={openProgress} aria-label={`Lv ${level} – ${current} of ${needed} XP to level ${level + 1}`} title={`${current}/${needed} XP to level ${level + 1}`}>
        <span className="font-semibold">Lv {level}</span>
        {!mobile && (
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-black/15 dark:bg-white/20">
            <span className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500" style={{ width: `${progress * 100}%` }} />
          </span>
        )}
      </button>
      {!mobile && (
        <button type="button" className={btn} onClick={toggleSound} aria-label={sound ? 'Mute sounds' : 'Turn sounds on'} aria-pressed={sound}>
          <SpeakerIcon on={sound} />
        </button>
      )}
    </>
  )
}

/** Begrüßungskarte oben auf dem Handy-Homescreen. */
export function MobileHeader({ cta }: { cta: React.ReactNode }) {
  const xp = useGame((s) => s.xp)
  const todayXp = useGame((s) => s.activity[dayKey()] ?? 0)
  const goal = useGame((s) => s.dailyGoal)
  const sound = useGame((s) => s.sound)
  const { level, current, needed, progress } = levelInfo(xp)
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Guten Morgen!' : hour < 18 ? 'Guten Tag!' : 'Guten Abend!'
  return (
    <section className="rounded-3xl border border-white/40 bg-white/55 p-4 text-slate-900 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55 dark:text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{greeting}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Level {level} · {current}/{needed} XP</p>
        </div>
        <button type="button" onClick={toggleSound} aria-label={sound ? 'Mute sounds' : 'Turn sounds on'} aria-pressed={sound} className="grid h-9 w-9 place-items-center rounded-full bg-black/5 dark:bg-white/10">
          <SpeakerIcon on={sound} />
        </button>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <GoalRing size={22} stroke={3.5} />
        <span>Today: <strong className="tabular-nums">{todayXp}/{goal} XP</strong></span>
      </div>
      <div className="mt-3">{cta}</div>
    </section>
  )
}
