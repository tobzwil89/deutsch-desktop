import type { BadgeDef } from '../game/badges'

export function BadgeMedal({ badge, unlocked, size = 64 }: { badge: BadgeDef; unlocked: boolean; size?: number }) {
  const color = unlocked ? badge.color : '#94a3b8'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={unlocked ? '' : 'opacity-60'}>
      <path d="M20 4h10l-6 18h-8zM44 4H34l6 18h8z" fill={unlocked ? '#f59e0b' : '#cbd5e1'} />
      <circle cx="32" cy="38" r="22" fill={color} />
      <circle cx="32" cy="38" r="17.5" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeDasharray="3 3" />
      <text
        x="32"
        y="38"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={badge.glyph.length > 2 ? 12 : 17}
        fontWeight="800"
        fill="#fff"
        fontFamily="Inter Variable, sans-serif"
      >
        {unlocked ? badge.glyph : '?'}
      </text>
    </svg>
  )
}
