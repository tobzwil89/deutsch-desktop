import { create } from 'zustand'

export type ToastKind = 'badge' | 'level' | 'streak' | 'info'
export type Toast = { id: number; kind: ToastKind; title: string; body?: string }

type ToastState = { toasts: Toast[]; dismiss: (id: number) => void }

export const useToasts = create<ToastState>()((set) => ({
  toasts: [],
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

let nextId = 1

export function notify(kind: ToastKind, title: string, body?: string) {
  const id = nextId++
  useToasts.setState((s) => ({ toasts: [...s.toasts.slice(-3), { id, kind, title, body }] }))
  setTimeout(() => useToasts.getState().dismiss(id), 5000)
}
