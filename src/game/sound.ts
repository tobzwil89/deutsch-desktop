import { useGame } from './store'

// Kleine, selbst erzeugte Töne über die Web Audio API – keine Sounddateien.

export type SoundKind = 'correct' | 'wrong' | 'levelup' | 'badge' | 'goal'

let ctx: AudioContext | null = null

function tone(ac: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.07) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ac.currentTime + start
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export function playSound(kind: SoundKind) {
  if (!useGame.getState().sound) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const ac = ctx
    switch (kind) {
      case 'correct':
        tone(ac, 660, 0, 0.12)
        tone(ac, 990, 0.07, 0.16)
        break
      case 'wrong':
        tone(ac, 220, 0, 0.18, 'triangle', 0.08)
        tone(ac, 180, 0.09, 0.22, 'triangle', 0.08)
        break
      case 'goal':
        ;[523, 659, 784].forEach((f, i) => tone(ac, f, i * 0.09, 0.25))
        break
      case 'badge':
        ;[784, 988, 1319].forEach((f, i) => tone(ac, f, i * 0.08, 0.3, 'sine', 0.06))
        break
      case 'levelup':
        ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(ac, f, i * 0.08, 0.35, 'square', 0.035))
        break
    }
  } catch {
    // Kein Audio verfügbar – still weitermachen
  }
}
