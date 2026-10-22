import { useState } from 'react'
import { SITE_NAME } from '../../config'
import { IMPRINT, PRIVACY_UPDATED } from '../../data/legal'
import { Segmented } from '../ui'

function Imprint() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Impressum (Legal notice)</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">Information according to § 5 DDG</p>
      <p>
        {IMPRINT.name}
        <br />
        {IMPRINT.address.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <p>
        Email: {IMPRINT.email}
        <br />
        Phone: {IMPRINT.phone}
      </p>
      <p>{IMPRINT.vatId}</p>
      <h4 className="font-semibold">Responsible for content</h4>
      <p>{IMPRINT.responsible}</p>
      <h4 className="font-semibold">Disclaimer</h4>
      <p>
        The learning content was created with care, but I cannot guarantee that it is complete or free of errors. Links to external websites (e.g.
        Preply) are the responsibility of their operators.
      </p>
    </div>
  )
}

function Privacy() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Datenschutzerklärung (Privacy policy)</h3>
      <p className="rounded-xl bg-emerald-50 p-3 font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
        In short: no cookies, no tracking, no analytics, no accounts. Your learning progress is stored only in your own browser.
      </p>
      <h4 className="font-semibold">1. Who is responsible</h4>
      <p>
        {IMPRINT.name}, {IMPRINT.address.join(', ')}, {IMPRINT.email}
      </p>
      <h4 className="font-semibold">2. Your progress stays on your device</h4>
      <p>
        {SITE_NAME} saves your XP, streak, vocabulary progress and settings in your browser’s local storage (localStorage). This data never
        leaves your device and is not sent to me or anyone else. You can export it, import it or delete it at any time in the Progress app – or
        by clearing your browser data.
      </p>
      <h4 className="font-semibold">3. No cookies, no tracking</h4>
      <p>This website uses no cookies, no analytics tools, no advertising and no tracking pixels. Fonts are hosted on this server, not loaded from Google.</p>
      <h4 className="font-semibold">4. Hosting</h4>
      <p>
        This website is hosted on GitHub Pages (GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). When you visit the
        site, your browser transmits technical data such as your IP address to GitHub’s servers, which GitHub may store in log files for
        security purposes. Legal basis: Art. 6 (1) (f) GDPR (secure and reliable provision of the website). Further information:
        GitHub Privacy Statement.
      </p>
      <h4 className="font-semibold">5. YouTube video</h4>
      <p>
        The introduction video in “About Me” is only loaded after you click on it (via youtube-nocookie.com). Only then is data transmitted to
        YouTube (Google Ireland Ltd.). Legal basis: your consent by clicking, Art. 6 (1) (a) GDPR.
      </p>
      <h4 className="font-semibold">6. Links to Preply</h4>
      <p>Booking buttons link to my profile on Preply. Once you leave this site, Preply’s privacy policy applies.</p>
      <h4 className="font-semibold">7. Your rights</h4>
      <p>
        You have the right to access, rectification, erasure, restriction of processing, data portability and objection (Art. 15–21 GDPR), and
        the right to lodge a complaint with a data protection supervisory authority.
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: {PRIVACY_UPDATED}</p>
    </div>
  )
}

export default function LegalApp() {
  const [tab, setTab] = useState<'imprint' | 'privacy'>('imprint')
  return (
    <div className="flex flex-col gap-4 p-4 text-sm leading-relaxed sm:p-6">
      <Segmented
        label="Document"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'imprint', label: 'Imprint' },
          { value: 'privacy', label: 'Privacy' },
        ]}
      />
      {tab === 'imprint' ? <Imprint /> : <Privacy />}
    </div>
  )
}
