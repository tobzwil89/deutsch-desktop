import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useApplyTheme, useIsMobile } from './lib/hooks'
import { BootScreen } from './shell/BootScreen'
import { DesktopShell } from './shell/DesktopShell'
import { MobileShell } from './shell/MobileShell'
import { GameStatus, MobileHeader } from './shell/GameStatus'
import { Toasts } from './shell/Toasts'
import { settleStreak } from './game/api'
import { PREPLY_URL } from './config'

export default function App() {
  useApplyTheme()
  const isMobile = useIsMobile()
  const [booted, setBooted] = useState(false)
  const finishBoot = useCallback(() => setBooted(true), [])

  // Beim Start prüfen, ob gestern ein Tag verpasst wurde (Streak/Freeze)
  useEffect(() => settleStreak(), [])

  const cta = (
    <a
      href={PREPLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-slate-900 py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
    >
      Book a trial lesson with Tobias
    </a>
  )

  return (
    <>
      {isMobile ? (
        <MobileShell status={<GameStatus mobile />} header={<MobileHeader cta={cta} />} overlay={<Toasts />} />
      ) : (
        <DesktopShell status={<GameStatus />} overlay={<Toasts />} />
      )}
      <AnimatePresence>{!booted && <BootScreen key="boot" onDone={finishBoot} />}</AnimatePresence>
    </>
  )
}
