import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useToasts, type ToastKind } from '../game/notify'
import { Flame } from './GameStatus'

const ACCENT: Record<ToastKind, string> = {
  badge: 'bg-amber-500',
  level: 'bg-fuchsia-500',
  streak: 'bg-orange-500',
  info: 'bg-sky-500',
}
const SYMBOL: Record<ToastKind, ReactNode> = { badge: '★', level: '↑', streak: <Flame active size={20} />, info: 'i' }

export function Toasts() {
  const toasts = useToasts((s) => s.toasts)
  const dismiss = useToasts((s) => s.dismiss)
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 top-12 z-[9800] flex flex-col items-center gap-2 md:inset-x-auto md:right-3 md:top-9 md:items-end"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            layout
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="pointer-events-auto flex w-full max-w-80 items-start gap-3 rounded-2xl border border-black/10 bg-white/90 p-3 text-left shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/90"
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg font-bold text-white ${ACCENT[t.kind]}`} aria-hidden="true">
              {SYMBOL[t.kind]}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t.title}</span>
              {t.body && <span className="block text-xs text-slate-600 dark:text-slate-300">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
