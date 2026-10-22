import { useEffect, useRef, useState } from 'react'
import { APP_BY_ID } from '../apps/registry'
import { Logo } from '../icons/AppIcons'
import { PREPLY_URL, SITE_NAME } from '../config'
import { useClock, useIsDark } from '../lib/hooks'
import { useUI } from './uiStore'

function LogoMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { openApp, setTheme } = useUI.getState()
  const theme = useUI((s) => s.theme)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'block w-full rounded px-3 py-1 text-left hover:bg-blue-600 hover:text-white focus-visible:bg-blue-600 focus-visible:text-white'
  const run = (fn: () => void) => () => {
    fn()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Main menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-7 place-items-center rounded px-2 hover:bg-black/10 dark:hover:bg-white/15"
      >
        <Logo size={15} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-7 w-60 rounded-lg border border-black/10 bg-white/95 p-1 text-[13px] shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/95"
        >
          <button role="menuitem" className={item} onClick={run(() => openApp('about'))}>
            About {SITE_NAME}
          </button>
          <a role="menuitem" className={item} href={PREPLY_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Book a trial lesson ↗
          </a>
          <button role="menuitem" className={item} onClick={run(() => openApp('progress'))}>
            My progress
          </button>
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button key={t} role="menuitemradio" aria-checked={theme === t} className={item} onClick={run(() => setTheme(t))}>
              {theme === t ? '✓ ' : ' '}
              {t === 'system' ? 'Match system theme' : t === 'light' ? 'Light mode' : 'Dark mode'}
            </button>
          ))}
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
          <button role="menuitem" className={item} onClick={run(() => openApp('legal'))}>
            Legal &amp; Privacy
          </button>
        </div>
      )}
    </div>
  )
}

function ThemeToggle() {
  const isDark = useIsDark()
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => useUI.getState().setTheme(isDark ? 'light' : 'dark')}
      className="grid h-7 w-7 place-items-center rounded hover:bg-black/10 dark:hover:bg-white/15"
    >
      {isDark ? '☾' : '☀'}
    </button>
  )
}

function Clock() {
  const now = useClock()
  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return (
    <time dateTime={now.toISOString()} className="px-1 tabular-nums">
      <span className="hidden lg:inline">{day}&nbsp;&nbsp;</span>
      {time}
    </time>
  )
}

export function MenuBar({ status }: { status?: React.ReactNode }) {
  const focused = useUI((s) => s.focused)
  return (
    <header className="fixed inset-x-0 top-0 z-[9500] flex h-7 select-none items-center justify-between bg-white/55 px-2 text-[13px] text-slate-900 backdrop-blur-xl dark:bg-slate-950/45 dark:text-white">
      <div className="flex items-center gap-1">
        <LogoMenu />
        <span className="px-2 font-semibold">{focused ? APP_BY_ID[focused].title : SITE_NAME}</span>
        <a
          href={PREPLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded px-2 py-0.5 hover:bg-black/10 sm:block dark:hover:bg-white/15"
        >
          Book a lesson
        </a>
      </div>
      <div className="flex items-center gap-1">
        {status}
        <ThemeToggle />
        <Clock />
      </div>
    </header>
  )
}
