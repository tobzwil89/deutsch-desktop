import { useId, type ReactNode } from 'react'

// Alle Icons selbst gezeichnet: abgerundetes Quadrat mit Verlauf + einfaches Symbol.

type IconProps = { size?: number; className?: string }

function Tile({ from, to, size = 56, className, children }: IconProps & { from: string; to: string; children: ReactNode }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${id})`} />
      <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="rgba(255,255,255,.25)" />
      {children}
    </svg>
  )
}

export const VocabIcon = (p: IconProps) => (
  <Tile {...p} from="#60a5fa" to="#4338ca">
    <rect x="17" y="14" width="30" height="22" rx="4" fill="#c7d2fe" transform="rotate(-8 32 25)" />
    <rect x="15" y="22" width="34" height="26" rx="4" fill="#fff" />
    <text x="32" y="41" textAnchor="middle" fontSize="15" fontWeight="800" fill="#4338ca" fontFamily="Inter Variable, sans-serif">Aa</text>
  </Tile>
)

export const ArticlesIcon = (p: IconProps) => (
  <Tile {...p} from="#334155" to="#0f172a">
    <rect x="12" y="16" width="40" height="9" rx="4.5" fill="#3b82f6" />
    <rect x="12" y="28" width="40" height="9" rx="4.5" fill="#ef4444" />
    <rect x="12" y="40" width="40" height="9" rx="4.5" fill="#22c55e" />
    <text x="32" y="23.4" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#fff" fontFamily="Inter Variable, sans-serif">DER</text>
    <text x="32" y="35.4" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#fff" fontFamily="Inter Variable, sans-serif">DIE</text>
    <text x="32" y="47.4" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#fff" fontFamily="Inter Variable, sans-serif">DAS</text>
  </Tile>
)

export const ConjugatorIcon = (p: IconProps) => (
  <Tile {...p} from="#fb923c" to="#c2410c">
    <circle cx="32" cy="32" r="15" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="70 25" strokeLinecap="round" />
    <path d="M42 15 l5 6 -7 2z" fill="#fff" />
    <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Inter Variable, sans-serif">ich</text>
  </Tile>
)

export const LevelTestIcon = (p: IconProps) => (
  <Tile {...p} from="#34d399" to="#047857">
    <path d="M14 42 a18 18 0 0 1 36 0" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="6" strokeLinecap="round" />
    <path d="M14 42 a18 18 0 0 1 27 -15.6" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    <path d="M32 42 L42 28" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="42" r="4" fill="#fde68a" />
    <text x="32" y="55" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter Variable, sans-serif">A1–C1</text>
  </Tile>
)

export const AboutIcon = (p: IconProps) => (
  <Tile {...p} from="#f472b6" to="#be123c">
    <path d="M12 18 a6 6 0 0 1 6 -6 h28 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-18 l-9 8 v-8 h-1 a6 6 0 0 1 -6 -6z" fill="#fff" />
    <circle cx="32" cy="22" r="5" fill="#be123c" />
    <path d="M23 36 a9 7 0 0 1 18 0z" fill="#be123c" />
  </Tile>
)

export const ProgressIcon = (p: IconProps) => (
  <Tile {...p} from="#fcd34d" to="#d97706">
    <path d="M22 14 h20 v10 a10 10 0 0 1 -20 0z" fill="#fff" />
    <path d="M22 17 h-5 a5 5 0 0 0 5 9 M42 17 h5 a5 5 0 0 1 -5 9" fill="none" stroke="#fff" strokeWidth="3" />
    <rect x="29" y="33" width="6" height="8" fill="#fff" />
    <rect x="22" y="41" width="20" height="6" rx="2" fill="#fff" />
    <path d="M32 17 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6z" fill="#f59e0b" />
  </Tile>
)

export const LegalIcon = (p: IconProps) => (
  <Tile {...p} from="#94a3b8" to="#475569">
    <rect x="17" y="12" width="30" height="40" rx="4" fill="#fff" />
    <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="700" fill="#475569" fontFamily="Inter Variable, sans-serif">§</text>
  </Tile>
)

/** Eigenes Logo für Menüleiste und Bootscreen (kein Apple-Logo). */
export function Logo({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M14 10h16c14 0 22 9 22 22s-8 22-22 22H24l-10 8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="32" r="5" fill="currentColor" />
    </svg>
  )
}
