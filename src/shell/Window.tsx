import { Suspense, useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { motion, useReducedMotion } from 'framer-motion'
import type { AppDef } from '../apps/registry'
import { useUI, type Geometry } from './uiStore'
import { Spinner } from './Spinner'

const MENU_H = 28
const DOCK_SPACE = 84

function viewport() {
  return { vw: window.innerWidth, vh: window.innerHeight - MENU_H }
}

function defaultGeometry(app: AppDef, index: number): Geometry {
  const { vw, vh } = viewport()
  const w = Math.min(app.size.w, vw - 40)
  const h = Math.min(app.size.h, vh - DOCK_SPACE - 20)
  const offset = (index % 6) * 28
  return {
    w,
    h,
    x: Math.max(10, (vw - w) / 2 - 100 + offset),
    y: Math.max(10, (vh - DOCK_SPACE - h) / 2 + offset),
  }
}

/** Gespeicherte Position an die aktuelle Fenstergröße anpassen. */
function clampToViewport(g: Geometry): Geometry {
  const { vw, vh } = viewport()
  const w = Math.min(g.w, vw - 20)
  const h = Math.min(g.h, vh - 20)
  return { w, h, x: Math.min(Math.max(0, g.x), vw - w), y: Math.min(Math.max(0, g.y), vh - h) }
}

function TrafficLight({ color, label, symbol, onClick }: { color: string; label: string; symbol: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`grid h-3.5 w-3.5 place-items-center rounded-full text-[9px] font-bold leading-none text-black/0 group-hover:text-black/60 focus-visible:text-black/60 ${color}`}
    >
      {symbol}
    </button>
  )
}

export function Window({ app, index }: { app: AppDef; index: number }) {
  const state = useUI((s) => s.windows[app.id])
  const stored = useUI((s) => s.geometry[app.id])
  const focused = useUI((s) => s.focused === app.id)
  const { focusApp, closeApp, minimizeApp, toggleMaximize, setGeometry } = useUI.getState()
  const reduce = useReducedMotion()
  const innerRef = useRef<HTMLDivElement>(null)
  const [initial] = useState(() => defaultGeometry(app, index))
  const [dockTarget, setDockTarget] = useState({ x: 0, y: 0 })

  // Beim Öffnen Tastaturfokus ins Fenster setzen
  useEffect(() => {
    innerRef.current?.focus({ preventScroll: true })
  }, [])

  if (!state) return null
  const geom = clampToViewport(stored ?? initial)
  const titleId = `win-title-${app.id}`

  const minimize = () => {
    // Zielpunkt der Animation: das Dock-Icon der App
    const r = innerRef.current?.getBoundingClientRect()
    const d = document.getElementById(`dock-${app.id}`)?.getBoundingClientRect()
    if (r) {
      const tx = d ? d.left + d.width / 2 : window.innerWidth / 2
      const ty = d ? d.top + d.height / 2 : window.innerHeight
      setDockTarget({ x: tx - (r.left + r.width / 2), y: ty - (r.top + r.height / 2) })
    }
    minimizeApp(app.id)
  }

  return (
    <Rnd
      size={state.maximized ? { width: '100%', height: `calc(100% - ${DOCK_SPACE}px)` } : { width: geom.w, height: geom.h }}
      position={state.maximized ? { x: 0, y: 0 } : { x: geom.x, y: geom.y }}
      bounds="parent"
      minWidth={app.minSize.w}
      minHeight={app.minSize.h}
      dragHandleClassName="win-drag"
      disableDragging={state.maximized}
      enableResizing={!state.maximized && !state.minimized}
      onDragStop={(_, d) => setGeometry(app.id, { ...geom, x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) =>
        setGeometry(app.id, { x: pos.x, y: pos.y, w: ref.offsetWidth, h: ref.offsetHeight })
      }
      style={{ zIndex: state.z, pointerEvents: state.minimized ? 'none' : 'auto' }}
    >
      <motion.div
        ref={innerRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby={titleId}
        aria-hidden={state.minimized || undefined}
        onPointerDownCapture={() => focusApp(app.id)}
        onFocusCapture={() => focusApp(app.id)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          state.minimized
            ? { opacity: 0, scale: 0.08, x: dockTarget.x, y: dockTarget.y }
            : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        exit={{ opacity: 0, scale: 0.9 }}
        transition={
          reduce
            ? { duration: 0 }
            : state.minimized
              ? { duration: 0.35, ease: 'easeIn' }
              : { type: 'spring', stiffness: 400, damping: 32 }
        }
        className={`flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white/95 text-slate-900 outline-none backdrop-blur-xl dark:bg-slate-900/95 dark:text-slate-100 ${
          focused
            ? 'border-black/10 shadow-[0_24px_60px_rgba(0,0,0,.35)] dark:border-white/15'
            : 'border-black/5 shadow-[0_10px_30px_rgba(0,0,0,.2)] dark:border-white/10'
        }`}
      >
        <div
          className="win-drag group relative flex h-10 shrink-0 cursor-default select-none items-center border-b border-black/5 bg-slate-100/80 px-3 dark:border-white/10 dark:bg-slate-800/80"
          onDoubleClick={() => toggleMaximize(app.id)}
        >
          <div className="z-10 flex gap-2">
            <TrafficLight color="bg-[#ff5f57]" label={`Close ${app.title}`} symbol="×" onClick={() => closeApp(app.id)} />
            <TrafficLight color="bg-[#febc2e]" label={`Minimize ${app.title}`} symbol="–" onClick={minimize} />
            <TrafficLight
              color="bg-[#28c840]"
              label={state.maximized ? `Restore ${app.title}` : `Maximize ${app.title}`}
              symbol="+"
              onClick={() => toggleMaximize(app.id)}
            />
          </div>
          <h2
            id={titleId}
            className={`absolute inset-x-0 text-center text-[13px] font-semibold ${focused ? '' : 'text-slate-400'}`}
          >
            {app.title}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <Suspense fallback={<Spinner />}>
            <app.Component />
          </Suspense>
        </div>
      </motion.div>
    </Rnd>
  )
}
