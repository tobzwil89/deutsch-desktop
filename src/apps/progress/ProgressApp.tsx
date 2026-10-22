import { useRef, useState } from 'react'
import { BADGES, learnedCount } from '../../game/badges'
import { buyStreakFreeze, exportProgress, importProgress, resetProgress, setDailyGoal, spendableXp } from '../../game/api'
import { notify } from '../../game/notify'
import { useGame } from '../../game/store'
import { DAILY_GOALS, levelInfo, MAX_FREEZES, STREAK_FREEZE_COST } from '../../game/xp'
import { dayKey } from '../../lib/date'
import { BadgeMedal } from '../../shell/BadgeMedal'
import { Button, Card, ProgressBar, Segmented, Stat } from '../ui'

const WEEKS = 16

function Heatmap() {
  const activity = useGame((s) => s.activity)
  const goal = useGame((s) => s.dailyGoal)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Beginn: Montag vor (WEEKS − 1) Wochen
  const start = new Date(today)
  start.setDate(start.getDate() - ((today.getDay() + 6) % 7) - (WEEKS - 1) * 7)

  const weeks: { key: string; xp: number; future: boolean }[][] = []
  for (let w = 0; w < WEEKS; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      const key = dayKey(date)
      days.push({ key, xp: activity[key] ?? 0, future: date > today })
    }
    weeks.push(days)
  }
  const activeDays = Object.values(activity).filter((x) => x > 0).length
  const color = (xp: number) =>
    xp === 0 ? 'bg-slate-200 dark:bg-slate-700' : xp < goal / 2 ? 'bg-emerald-200 dark:bg-emerald-900' : xp < goal ? 'bg-emerald-400 dark:bg-emerald-700' : 'bg-emerald-600 dark:bg-emerald-400'

  return (
    <div>
      <div role="img" aria-label={`Activity over the last ${WEEKS} weeks: ${activeDays} active days`} className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((days, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {days.map((d) => (
              <div key={d.key} title={d.future ? '' : `${d.key}: ${d.xp} XP`} className={`h-3 w-3 rounded-[3px] ${d.future ? 'bg-transparent' : color(d.xp)}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" aria-hidden="true">
        Less
        {[0, goal / 4, goal * 0.75, goal].map((x) => (
          <span key={x} className={`h-3 w-3 rounded-[3px] ${color(x)}`} />
        ))}
        More (goal reached)
      </div>
    </div>
  )
}

function DataTools() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deutsch-desktop-progress-${dayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const ok = importProgress(await file.text())
    notify('info', ok ? 'Progress imported' : 'Import failed', ok ? 'Welcome back!' : 'This file is not a Deutsch Desktop backup.')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-semibold">Your data</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Your progress lives only in this browser. Export it to keep a backup or to move to another device.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={download}>
          Export progress
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          Import progress
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Choose a backup file" />
        {!confirmReset ? (
          <Button variant="ghost" className="text-rose-700 dark:text-rose-300" onClick={() => setConfirmReset(true)}>
            Reset progress
          </Button>
        ) : (
          <div role="alertdialog" aria-label="Confirm reset" className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm dark:bg-rose-950/50">
            <span className="flex-1">Delete all XP, streaks, badges and vocab progress? This cannot be undone.</span>
            <Button
              variant="danger"
              onClick={() => {
                resetProgress()
                setConfirmReset(false)
                notify('info', 'Progress reset', 'A fresh start – viel Erfolg!')
              }}
            >
              Yes, reset
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function ProgressApp() {
  const s = useGame()
  const { level, current, needed, progress } = levelInfo(s.xp)
  const today = s.activity[dayKey()] ?? 0
  const acc = s.stats.answers.t ? Math.round((s.stats.answers.c / s.stats.answers.t) * 100) : 0
  const spendable = spendableXp(s)
  const canBuy = s.freezes < MAX_FREEZES && spendable >= STREAK_FREEZE_COST

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <Card className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-bold">Level {level}</h3>
          <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
            {current}/{needed} XP to level {level + 1}
          </span>
        </div>
        <ProgressBar value={progress} color="bg-gradient-to-r from-amber-400 to-fuchsia-500" label="Level progress" />
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Total XP" value={s.xp} />
        <Stat label={`Day streak (best ${s.bestStreak})`} value={s.streak} />
        <Stat label="Words learned" value={learnedCount(s)} />
        <Stat label="Accuracy" value={`${acc} %`} />
        <Stat label="Answers" value={s.stats.answers.t} />
        <Stat label="Level test" value={s.levelTest?.level ?? '–'} />
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Daily goal</h3>
          <Segmented
            label="Daily goal"
            value={String(s.dailyGoal)}
            onChange={(v) => setDailyGoal(Number(v))}
            options={DAILY_GOALS.map((g) => ({ value: String(g), label: `${g} XP` }))}
          />
        </div>
        <ProgressBar value={today / s.dailyGoal} color={today >= s.dailyGoal ? 'bg-emerald-500' : 'bg-amber-500'} label="Today’s goal progress" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Today: <strong>{today}</strong>/{s.dailyGoal} XP. Reach your goal every day to grow your streak.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sky-50 p-3 text-sm dark:bg-sky-950/40">
          <span className="flex-1">
            <strong>Streak freezes: {s.freezes}/{MAX_FREEZES}</strong> – protects your streak automatically if you miss a day. You have{' '}
            {spendable} XP to spend.
          </span>
          <Button variant="secondary" disabled={!canBuy} onClick={buyStreakFreeze}>
            Buy for {STREAK_FREEZE_COST} XP
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Activity</h3>
        <Heatmap />
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">
          Badges <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({Object.keys(s.badges).length}/{BADGES.length})</span>
        </h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => {
            const unlocked = !!s.badges[b.id]
            return (
              <li key={b.id} className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center ${unlocked ? '' : 'grayscale'}`}>
                <BadgeMedal badge={b} unlocked={unlocked} size={56} />
                <span className="text-sm font-semibold">{b.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {unlocked ? `Unlocked ${new Date(s.badges[b.id]).toLocaleDateString('en-GB')}` : b.condition}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <DataTools />
    </div>
  )
}
