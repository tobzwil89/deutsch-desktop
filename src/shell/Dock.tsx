import { useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { APPS, type AppDef } from '../apps/registry'
import { useUI } from './uiStore'

const BASE = 48
const MAX = 76

function DockIcon({ app, mouseX, magnify }: { app: AppDef; mouseX: MotionValue<number>; magnify: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const running = useUI((s) => !!s.windows[app.id])
  const [hover, setHover] = useState(false)

  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    return b ? x - b.left - b.width / 2 : Infinity
  })
  const target = useTransform(distance, [-140, 0, 140], [BASE, MAX, BASE])
  const size = useSpring(target, { mass: 0.1, stiffness: 170, damping: 14 })

  const open = () => {
    const ui = useUI.getState()
    if (ui.windows[app.id]) ui.focusApp(app.id)
    else ui.openApp(app.id)
  }

  return (
    <div className="relative flex flex-col items-center">
      {hover && (
        <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-slate-900/85 px-2 py-1 text-xs text-white">
          {app.title}
        </span>
      )}
      <motion.button
        ref={ref}
        id={`dock-${app.id}`}
        type="button"
        aria-label={`Open ${app.title}`}
        onClick={open}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        style={magnify ? { width: size, height: size } : { width: BASE, height: BASE }}
        className="rounded-[22%]"
      >
        <app.Icon className="h-full w-full drop-shadow-md" />
      </motion.button>
      <span
        aria-hidden="true"
        className={`mt-1 h-1 w-1 rounded-full ${running ? 'bg-slate-800 dark:bg-white' : 'bg-transparent'}`}
      />
    </div>
  )
}

export function Dock() {
  const mouseX = useMotionValue(Infinity)
  const reduce = useReducedMotion()
  return (
    <nav
      aria-label="Dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed bottom-2 left-1/2 z-[9000] flex -translate-x-1/2 select-none items-end gap-2 rounded-2xl border border-white/40 bg-white/35 px-2.5 pt-2 pb-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
    >
      {APPS.filter((a) => a.inDock).map((app) => (
        <DockIcon key={app.id} app={app} mouseX={mouseX} magnify={!reduce} />
      ))}
    </nav>
  )
}
