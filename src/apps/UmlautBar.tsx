import type { RefObject } from 'react'

const CHARS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

/** Knöpfe für Umlaute – für Lernende ohne deutsche Tastatur. */
export function UmlautBar({ inputRef, value, onChange }: { inputRef: RefObject<HTMLInputElement | null>; value: string; onChange: (v: string) => void }) {
  const insert = (ch: string) => {
    const el = inputRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + ch + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + 1, start + 1)
    })
  }
  return (
    <div className="flex flex-wrap gap-1" aria-label="Insert special characters">
      {CHARS.map((c) => (
        <button
          key={c}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insert(c)}
          aria-label={`Insert ${c}`}
          className="h-8 min-w-8 rounded-lg bg-slate-200 px-2 text-sm font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {c}
        </button>
      ))}
    </div>
  )
}
