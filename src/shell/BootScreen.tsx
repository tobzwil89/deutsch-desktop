import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Logo } from '../icons/AppIcons'
import { SITE_NAME } from '../config'

export function BootScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const duration = reduce ? 0.3 : 1.5

  useEffect(() => {
    const t = setTimeout(onDone, duration * 1000)
    // Überspringen per Klick, Tippen oder Taste
    window.addEventListener('keydown', onDone)
    window.addEventListener('pointerdown', onDone)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onDone)
      window.removeEventListener('pointerdown', onDone)
    }
  }, [onDone, duration])

  return (
    <motion.div
      className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950 text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label={`Starting ${SITE_NAME}`}
    >
      <div className="flex flex-col items-center gap-6">
        <Logo size={72} className="text-amber-400" />
        <p className="text-lg font-semibold tracking-wide">{SITE_NAME}</p>
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs text-white/60">Click or press any key to skip</p>
      </div>
    </motion.div>
  )
}
