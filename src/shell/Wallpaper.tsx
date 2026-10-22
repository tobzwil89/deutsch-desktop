// Eigenes Hintergrundbild: Farbverlauf + weiche Wellen, hell und dunkel.
export function Wallpaper() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[linear-gradient(140deg,#fef3c7_0%,#fecaca_30%,#ddd6fe_65%,#bae6fd_100%)] dark:bg-[linear-gradient(140deg,#1e1b4b_0%,#3b0764_40%,#701a75_75%,#7c2d12_100%)]"
    >
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-amber-300/50 blur-3xl dark:bg-indigo-500/30" />
      <div className="absolute -right-24 top-1/4 h-[32rem] w-[32rem] rounded-full bg-fuchsia-300/40 blur-3xl dark:bg-fuchsia-600/25" />
      <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-300/50 blur-3xl dark:bg-orange-500/20" />
      <svg className="absolute bottom-0 left-0 h-1/2 w-full" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 260 C 240 180 480 340 720 260 S 1200 160 1440 240 V400 H0z" className="fill-white/25 dark:fill-white/5" />
        <path d="M0 310 C 300 240 560 380 860 300 S 1260 250 1440 300 V400 H0z" className="fill-white/30 dark:fill-black/20" />
        <path d="M0 350 C 360 300 700 400 1040 340 S 1340 330 1440 350 V400 H0z" className="fill-white/35 dark:fill-black/25" />
      </svg>
    </div>
  )
}
