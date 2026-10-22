import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useApplyTheme, useIsMobile } from './lib/hooks'
import { BootScreen } from './shell/BootScreen'
import { DesktopShell } from './shell/DesktopShell'
import { MobileShell } from './shell/MobileShell'

export default function App() {
  useApplyTheme()
  const isMobile = useIsMobile()
  const [booted, setBooted] = useState(false)
  const finishBoot = useCallback(() => setBooted(true), [])

  return (
    <>
      {isMobile ? <MobileShell /> : <DesktopShell />}
      <AnimatePresence>{!booted && <BootScreen key="boot" onDone={finishBoot} />}</AnimatePresence>
    </>
  )
}
