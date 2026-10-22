import { useState } from 'react'
import { PHOTO_URL, PREPLY_URL, TUTOR_NAME, YOUTUBE_VIDEO_ID } from '../../config'
import { ABOUT } from '../../data/about'
import { useUI } from '../../shell/uiStore'
import { Card } from '../ui'

function Photo() {
  if (PHOTO_URL) return <img src={PHOTO_URL} alt={TUTOR_NAME} className="h-28 w-28 rounded-full object-cover shadow-lg" />
  const initials = TUTOR_NAME.split(' ')
    .map((p) => p[0])
    .join('')
  return (
    <div
      role="img"
      aria-label={`Photo placeholder for ${TUTOR_NAME}`}
      className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-700 text-3xl font-bold text-white shadow-lg"
    >
      {initials}
    </div>
  )
}

/** Video erst nach Klick laden – vorher fließen keine Daten zu YouTube. */
function Video() {
  const [load, setLoad] = useState(false)
  if (!YOUTUBE_VIDEO_ID) return null
  return (
    <Card className="p-0">
      {load ? (
        <iframe
          className="aspect-video w-full rounded-2xl"
          src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`}
          title={`Introduction video by ${TUTOR_NAME}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoad(true)}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl bg-slate-900 p-4 text-white"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-2xl text-slate-900" aria-hidden="true">
            ▶
          </span>
          <span className="font-semibold">Watch my introduction video</span>
          <span className="max-w-sm text-xs text-white/70">The video loads from YouTube when you click – YouTube may then process your data.</span>
        </button>
      )}
    </Card>
  )
}

export default function AboutApp() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Photo />
        <div>
          <h3 className="text-2xl font-bold">{TUTOR_NAME}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{ABOUT.tagline}</p>
        </div>
      </header>

      {PREPLY_URL && (
        <a
          href={PREPLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 p-4 text-center text-white shadow-lg hover:from-rose-500 hover:to-pink-500"
        >
          <span className="block text-lg font-bold">Book a trial lesson on Preply</span>
          <span className="block text-sm opacity-90">Let’s find out what you need – in your first lesson ↗</span>
        </a>
      )}

      <section className="space-y-3 text-[15px] leading-relaxed">
        {ABOUT.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <Video />

      <section>
        <h4 className="mb-2 font-semibold">How I teach</h4>
        <ul className="grid gap-2 sm:grid-cols-3">
          {ABOUT.approach.map((a) => (
            <li key={a.title}>
              <Card className="h-full">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="mb-2 font-semibold">Languages I speak</h4>
        <ul className="flex flex-wrap gap-2 text-sm">
          {ABOUT.languages.map((l) => (
            <li key={l.name} className="rounded-xl bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
              <strong>{l.name}</strong> · {l.level}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        Not sure about your level?{' '}
        <button type="button" className="font-semibold text-rose-700 underline dark:text-rose-300" onClick={() => useUI.getState().openApp('leveltest')}>
          Take the free level test
        </button>
      </p>
    </div>
  )
}
