import { addDays, dayKey, daysBetween } from '../lib/date'
import { BADGES } from './badges'
import { notify } from './notify'
import { playSound } from './sound'
import { initialGameData, useGame } from './store'
import type { GameData, LevelTestResult, Tally, Tense } from './types'
import { levelInfo, MAX_FREEZES, STREAK_FREEZE_COST } from './xp'
import { rate, type Rating } from '../lib/srs'

// Die einzige Schnittstelle der Apps zur Gamification:
// recordAnswer(...), awardXP(...), finishRound(...), saveHighscore(...)

const get = () => useGame.getState()
const set = (patch: Partial<GameData>) => useGame.setState(patch)

const bump = (t: Tally | undefined, correct: boolean): Tally => ({
  c: (t?.c ?? 0) + (correct ? 1 : 0),
  t: (t?.t ?? 0) + 1,
})

/** Verpasste Tage mit Streak Freezes überbrücken – oder die Streak verfällt. */
export function settleStreak() {
  const s = get()
  const today = dayKey()
  if (!s.lastGoalDay || s.streak === 0) return
  const missed = daysBetween(s.lastGoalDay, today) - 1
  if (missed <= 0) return
  if (s.freezes >= missed) {
    set({ freezes: s.freezes - missed, lastGoalDay: addDays(today, -1) })
    notify('streak', 'Streak freeze used', `Your ${s.streak}-day streak is safe.`)
  } else {
    set({ streak: 0 })
  }
}

function celebrate() {
  // Erst beim ersten Level-up laden, damit der Start schneller ist
  void import('canvas-confetti').then(({ default: confetti }) => confetti({ particleCount: 140, spread: 80, origin: { y: 0.3 }, disableForReducedMotion: true, zIndex: 9999 }))
}

export function checkBadges() {
  const s = get()
  const unlocked = BADGES.filter((b) => !s.badges[b.id] && b.check(s))
  if (!unlocked.length) return
  const now = new Date().toISOString()
  set({ badges: { ...s.badges, ...Object.fromEntries(unlocked.map((b) => [b.id, now])) } })
  unlocked.forEach((b) => notify('badge', `Badge unlocked: ${b.title}`, b.condition))
  playSound('badge')
}

export function awardXP(amount: number) {
  if (amount <= 0) return
  settleStreak()
  const s = get()
  const today = dayKey()
  const before = levelInfo(s.xp).level
  const todayXp = (s.activity[today] ?? 0) + amount
  const patch: Partial<GameData> = { xp: s.xp + amount, activity: { ...s.activity, [today]: todayXp } }

  // Tagesziel zum ersten Mal heute erreicht → Streak zählt
  if (todayXp >= s.dailyGoal && s.lastGoalDay !== today) {
    const streak = s.lastGoalDay === addDays(today, -1) ? s.streak + 1 : 1
    Object.assign(patch, { streak, bestStreak: Math.max(s.bestStreak, streak), lastGoalDay: today })
    notify('streak', 'Daily goal reached!', streak > 1 ? `Streak: ${streak} days in a row` : 'Your streak has started.')
    playSound('goal')
  }
  set(patch)

  const after = levelInfo(s.xp + amount).level
  if (after > before) {
    notify('level', `Level up! You're now level ${after}`, 'Weiter so – keep going!')
    playSound('levelup')
    celebrate()
  }
  checkBadges()
}

export type AnswerInput = {
  correct: boolean
  kind: 'vocab' | 'article' | 'verb' | 'test'
  /** XP bei richtiger Antwort (inkl. Boni) */
  xp?: number
  combo?: number
  verbId?: string
  tense?: Tense
  silent?: boolean
}

export function recordAnswer({ correct, kind, xp = 0, combo, verbId, tense, silent }: AnswerInput) {
  const s = get()
  const stats = { ...s.stats, answers: bump(s.stats.answers, correct) }
  if (kind === 'article') stats.articles = bump(s.stats.articles, correct)
  if (verbId) stats.verbs = { ...s.stats.verbs, [verbId]: bump(s.stats.verbs[verbId], correct) }
  if (tense) stats.tenses = { ...s.stats.tenses, [tense]: bump(s.stats.tenses[tense], correct) }
  if (kind === 'article' && combo) stats.bestCombo = Math.max(s.stats.bestCombo, combo)
  if (new Date().getHours() < 4) stats.nightOwl = true
  set({ stats })

  if (!silent) playSound(correct ? 'correct' : 'wrong')
  if (correct && xp > 0) awardXP(xp)
  else checkBadges()
}

/** Abgeschlossene Runde/Sitzung mit Bonus-XP. */
export function finishRound(bonusXp: number) {
  set({ stats: { ...get().stats, rounds: get().stats.rounds + 1 } })
  awardXP(bonusXp)
}

/** Speichert einen Highscore und meldet, ob er neu ist. */
export function saveHighscore(key: string, score: number): boolean {
  const s = get()
  if (score <= (s.highscores[key] ?? 0)) return false
  set({ highscores: { ...s.highscores, [key]: score } })
  return true
}

export const spendableXp = (s: GameData) => s.xp - s.xpSpent

export function buyStreakFreeze(): boolean {
  const s = get()
  if (s.freezes >= MAX_FREEZES || spendableXp(s) < STREAK_FREEZE_COST) return false
  set({ freezes: s.freezes + 1, xpSpent: s.xpSpent + STREAK_FREEZE_COST })
  notify('streak', 'Streak freeze ready', 'It will protect your streak if you miss a day.')
  return true
}

export function setDailyGoal(goal: number) {
  set({ dailyGoal: goal })
}

export function toggleSound() {
  set({ sound: !get().sound })
}

// --- Sichern, Wiederherstellen, Zurücksetzen ---

export function exportProgress(): string {
  return JSON.stringify({ app: 'deutsch-desktop', version: 1, exportedAt: new Date().toISOString(), data: get() }, null, 2)
}

export function importProgress(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as { app?: string; data?: Partial<GameData> }
    if (parsed.app !== 'deutsch-desktop' || !parsed.data || typeof parsed.data.xp !== 'number') return false
    const base = initialGameData()
    useGame.setState({ ...base, ...parsed.data, stats: { ...base.stats, ...parsed.data.stats } }, true)
    return true
  } catch {
    return false
  }
}

export function resetProgress() {
  useGame.setState(initialGameData(), true)
}

// --- Karteikarten (Leitner) ---

export function rateCard(cardId: string, rating: Rating) {
  const s = get()
  set({ srs: { ...s.srs, [cardId]: rate(s.srs[cardId], rating, dayKey()) } })
  checkBadges()
}

// --- Einstufungstest ---

export function saveLevelTest(result: LevelTestResult) {
  set({ levelTest: result })
  checkBadges()
}
