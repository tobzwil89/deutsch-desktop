import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { APPS, APP_BY_ID, type AppId } from '../apps/registry'
import { useClock } from '../lib/hooks'
import { useUI } from './uiStore'
import { Wallpaper } from './Wallpaper'
import { Spinner } from './Spinner'

const DOCK_APPS: AppId[] = ['vocab', 'articles', 'conjugator', 'leveltest']

/** Zurück: über den Browser-Verlauf, damit auch die System-Zurück-Geste funktioniert. */
function goBack() {
  const ui = useUI.getState()
  if (window.history.state?.app) window.history.back()
  else if (ui.focused) ui.closeApp(ui.focused)
}

function MobileAppView({ id }: { id: AppId }) {
  const app = APP_BY_ID[id]
  const reduce = useReducedMotion()
  const startX = useRef<number | null>(null)
  const [dx, setDx] = useState(0)

  return (
    <motion.div
      role="dialog"
      aria-label={app.title}
      className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
      initial={reduce ? false : { x: '100%' }}
      animate={{ x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: '100%' }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
      style={dx ? { translateX: dx } : undefined}
      // Wischgeste vom linken Rand = zurück
      onTouchStart={(e) => {
        const x = e.touches[0].clientX
        startX.current = x < 28 ? x : null
      }}
      onTouchMove={(e) => {
        if (startX.current !== null) setDx(Math.max(0, e.touches[0].clientX - startX.current))
      }}
      onTouchEnd={() => {
        if (startX.current !== null && dx > 90) goBack()
        startX.current = null
        setDx(0)
      }}
    >
      <header className="flex shrink-0 items-center border-b border-black/10 bg-slate-50/90 px-2 pt-[env(safe-area-inset-top)] dark:border-white/10 dark:bg-slate-800/90">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back to home screen"
          className="flex h-12 min-w-20 items-center gap-1 px-2 text-[15px] font-medium text-blue-600 dark:text-blue-400"
        >
          <span aria-hidden="true" className="text-2xl leading-none">‹</span> Home
        </button>
        <h1 className="flex-1 truncate text-center text-[15px] font-semibold">{app.title}</h1>
        <span className="min-w-20" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <Suspense fallback={<Spinner />}>
          <app.Component />
        </Suspense>
      </div>
    </motion.div>
  )
}

function AppButton({ id, size = 60, showLabel = true }: { id: AppId; size?: number; showLabel?: boolean }) {
  const app = APP_BY_ID[id]
  return (
    <button
      type="button"
      onClick={() => useUI.getState().openApp(id)}
      aria-label={`Open ${app.title}`}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
    >
      <app.Icon size={size} className="drop-shadow-md" />
      {showLabel && <span className="text-[11px] font-medium text-slate-900 dark:text-white dark:[text-shadow:0_1px_3px_rgba(0,0,0,.7)]">{app.label}</span>}
    </button>
  )
}

export function MobileShell({ status, header, overlay }: { status?: ReactNode; header?: ReactNode; overlay?: ReactNode }) {
  const focused = useUI((s) => s.focused)
  const windows = useUI((s) => s.windows)
  const current = focused && windows[focused] ? focused : null
  const now = useClock()

  // Jede geöffnete App bekommt einen Verlaufseintrag → Browser-Zurück schließt sie
  useEffect(() => {
    if (current && window.history.state?.app !== current) window.history.pushState({ app: current }, '')
  }, [current])

  useEffect(() => {
    const onPop = () => {
      const ui = useUI.getState()
      if (ui.focused) ui.closeApp(ui.focused)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <Wallpaper />
      <div className="relative flex h-11 shrink-0 items-center justify-between px-5 pt-[env(safe-area-inset-top)] text-sm font-semibold text-slate-900 dark:text-white">
        <time>{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time>
        <div className="flex items-center gap-2">{status}</div>
      </div>
      <main className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-32 pt-2">
        {header}
        <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-6">
          {APPS.map((a) => (
            <li key={a.id} className="flex justify-center">
              <AppButton id={a.id} />
            </li>
          ))}
        </ul>
      </main>
      <nav
        aria-label="Favourite apps"
        className="absolute inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-around rounded-[28px] border border-white/30 bg-white/30 p-3 backdrop-blur-xl dark:bg-slate-900/40"
      >
        {DOCK_APPS.map((id) => (
          <AppButton key={id} id={id} size={56} showLabel={false} />
        ))}
      </nav>
      <AnimatePresence>{current && <MobileAppView key={current} id={current} />}</AnimatePresence>
      {overlay}
    </div>
  )
}
