import { useEffect, useState } from 'react'
import { useUI } from '../shell/uiStore'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

export function useIsDark(): boolean {
  const theme = useUI((s) => s.theme)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  return theme === 'dark' || (theme === 'system' && systemDark)
}

/** Setzt die Klasse "dark" auf <html> je nach Einstellung und System. */
export function useApplyTheme() {
  const dark = useIsDark()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return dark
}

export function useClock(intervalMs = 10_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Tastenkürzel, die nur greifen, wenn diese App im Vordergrund ist (und nicht in Eingabefeldern). */
export function useAppKeys(appId: string, handler: (e: KeyboardEvent) => void, active = true) {
  const focused = useUI((s) => s.focused === appId)
  useEffect(() => {
    if (!active || !focused) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.metaKey || e.ctrlKey || e.altKey || el.closest('input, textarea, select')) return
      handler(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, focused, handler])
}
