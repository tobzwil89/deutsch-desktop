import type { ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { APP_BY_ID, type AppId } from '../apps/registry'
import { useUI } from './uiStore'
import { Wallpaper } from './Wallpaper'
import { MenuBar } from './MenuBar'
import { Dock } from './Dock'
import { DesktopIcons } from './DesktopIcons'
import { Window } from './Window'

export function DesktopShell({ status, overlay }: { status?: ReactNode; overlay?: ReactNode }) {
  const windows = useUI((s) => s.windows)
  const openIds = Object.keys(windows) as AppId[]
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Wallpaper />
      <MenuBar status={status} />
      <main className="absolute inset-x-0 bottom-0 top-7" aria-label="Desktop">
        <DesktopIcons />
        <AnimatePresence>
          {openIds.map((id, i) => (
            <Window key={id} app={APP_BY_ID[id]} index={i} />
          ))}
        </AnimatePresence>
      </main>
      <Dock />
      {overlay}
    </div>
  )
}
