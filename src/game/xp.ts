/** XP, die man von Level n auf n+1 braucht: 100, 150, 200, … */
export const xpToNext = (level: number) => 100 + (level - 1) * 50

export function levelInfo(xp: number) {
  let level = 1
  let floor = 0
  while (xp >= floor + xpToNext(level)) {
    floor += xpToNext(level)
    level++
  }
  const needed = xpToNext(level)
  const current = xp - floor
  return { level, current, needed, progress: current / needed }
}

export const STREAK_FREEZE_COST = 200
export const MAX_FREEZES = 2
export const DAILY_GOALS = [20, 50, 100] as const
