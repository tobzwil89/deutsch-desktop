import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Gemeinsame Bausteine, damit alle Apps gleich aussehen.

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-900',
  secondary:
    'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 disabled:opacity-50',
  ghost: 'text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-white/10',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-8 rounded-lg px-3 text-sm font-medium transition-colors ${
            value === o.value ? 'bg-white text-slate-900 shadow dark:bg-slate-600 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({ value, className = '', color = 'bg-indigo-500', label }: { value: number; className?: string; color?: string; label?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={`h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${className}`}
    >
      <div className={`h-full rounded-full transition-[width] ${color}`} style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="hidden rounded border border-current/30 px-1 text-[10px] font-medium opacity-70 md:inline">{children}</kbd>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60 ${className}`}>{children}</div>
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 text-center dark:bg-slate-800">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  )
}
