import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppId } from '../apps/registry'

export type Geometry = { x: number; y: number; w: number; h: number }
export type WindowState = { minimized: boolean; maximized: boolean; z: number }
export type Theme = 'system' | 'light' | 'dark'

type UIState = {
  theme: Theme
  windows: Partial<Record<AppId, WindowState>>
  geometry: Partial<Record<AppId, Geometry>>
  /** Startparameter, die eine App einer anderen mitgeben kann (z. B. Deck-Vorschlag). */
  params: Partial<Record<AppId, string>>
  topZ: number
  focused: AppId | null
  openApp: (id: AppId, param?: string) => void
  closeApp: (id: AppId) => void
  minimizeApp: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  focusApp: (id: AppId) => void
  setGeometry: (id: AppId, g: Geometry) => void
  setTheme: (t: Theme) => void
}

/** Oberstes sichtbares Fenster (für den Fokus nach Schließen/Minimieren). */
function topVisible(windows: UIState['windows'], except: AppId): AppId | null {
  let best: AppId | null = null
  let bestZ = -1
  for (const [id, w] of Object.entries(windows) as [AppId, WindowState][]) {
    if (id !== except && !w.minimized && w.z > bestZ) {
      best = id
      bestZ = w.z
    }
  }
  return best
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      windows: {},
      geometry: {},
      params: {},
      topZ: 10,
      focused: null,
      openApp: (id, param) =>
        set((s) => {
          const z = s.topZ + 1
          const prev = s.windows[id]
          return {
            topZ: z,
            focused: id,
            params: param ? { ...s.params, [id]: param } : s.params,
            windows: { ...s.windows, [id]: { minimized: false, maximized: prev?.maximized ?? false, z } },
          }
        }),
      closeApp: (id) =>
        set((s) => {
          const windows = { ...s.windows }
          delete windows[id]
          const params = { ...s.params }
          delete params[id]
          return { windows, params, focused: s.focused === id ? topVisible(windows, id) : s.focused }
        }),
      minimizeApp: (id) =>
        set((s) => {
          const w = s.windows[id]
          if (!w) return s
          const windows = { ...s.windows, [id]: { ...w, minimized: true } }
          return { windows, focused: topVisible(windows, id) }
        }),
      toggleMaximize: (id) =>
        set((s) => {
          const w = s.windows[id]
          if (!w) return s
          return { windows: { ...s.windows, [id]: { ...w, maximized: !w.maximized } } }
        }),
      focusApp: (id) =>
        set((s) => {
          const w = s.windows[id]
          if (!w || (s.focused === id && !w.minimized)) return s
          const z = s.topZ + 1
          return { topZ: z, focused: id, windows: { ...s.windows, [id]: { ...w, minimized: false, z } } }
        }),
      setGeometry: (id, g) => set((s) => ({ geometry: { ...s.geometry, [id]: g } })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'deutsch-desktop-ui',
      // Nur Theme und Fensterpositionen merken, nicht welche Fenster offen sind
      partialize: (s) => ({ theme: s.theme, geometry: s.geometry }),
    },
  ),
)
