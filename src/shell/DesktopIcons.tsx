import { useState } from 'react'
import { APPS, type AppId } from '../apps/registry'
import { useUI } from './uiStore'

export function DesktopIcons() {
  const [selected, setSelected] = useState<AppId | null>(null)
  const open = (id: AppId) => {
    const ui = useUI.getState()
    if (ui.windows[id]) ui.focusApp(id)
    else ui.openApp(id)
  }

  return (
    <ul
      aria-label="Desktop"
      className="absolute right-4 top-4 flex max-h-[calc(100%-7rem)] select-none flex-col flex-wrap-reverse content-start gap-3"
    >
      {APPS.map((app) => (
        <li key={app.id}>
          <button
            type="button"
            aria-label={`${app.title} (double-click or Enter to open)`}
            onClick={() => setSelected(app.id)}
            onDoubleClick={() => open(app.id)}
            onPointerUp={(e) => e.pointerType === 'touch' && open(app.id)}
            onKeyDown={(e) => e.key === 'Enter' && open(app.id)}
            onBlur={() => setSelected(null)}
            className={`flex w-24 flex-col items-center gap-1 rounded-lg p-1.5 ${selected === app.id ? 'bg-black/15 dark:bg-white/15' : ''}`}
          >
            <app.Icon size={54} className="drop-shadow-md" />
            <span
              className={`rounded px-1.5 text-center text-xs leading-snug text-white ${selected === app.id ? 'bg-blue-600' : 'bg-black/55'}`}
            >
              {app.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
