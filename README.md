# Deutsch Desktop

Gamifizierte Deutsch-Lernseite im Stil eines Desktops: Fenster, Dock, Menüleiste, auf dem Handy ein Homescreen.
Apps: Vocab Trainer, Der/Die/Das, Conjugator, Level Test, Progress, About Me, Legal.

Kein Backend, keine Konten, kein Tracking. Der gesamte Fortschritt liegt im `localStorage` des Browsers.

## Lokal starten

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install        # einmalig
npm run dev        # Entwicklungsserver, http://localhost:5173
npm run build      # Produktionsversion nach dist/ (prüft auch die Typen)
npm run preview    # gebaute Version ansehen, http://localhost:4173
```

## Platzhalter ersetzen

| Was | Wo |
|---|---|
| Preply-Link (alle Buchungsknöpfe) | `src/config.ts` → `PREPLY_URL` |
| Name, Kontakt-E-Mail | `src/config.ts` → `TUTOR_NAME`, `CONTACT_EMAIL` |
| Foto | Bild nach `public/` legen (z. B. `public/tobias.jpg`), dann `PHOTO_URL = '/tobias.jpg'` in `src/config.ts` |
| Vorstellungsvideo | `src/config.ts` → `YOUTUBE_VIDEO_ID` (nur die ID, z. B. `dQw4w9WgXcQ`). Leer = kein Video |
| Texte „About Me“ | `src/data/about.ts` (alles in `[eckigen Klammern]`) |
| Impressum, Datenschutz | `src/data/legal.ts` und Fließtext in `src/apps/legal/LegalApp.tsx` |
| Subdomain | `public/CNAME` und GitHub-Einstellungen (siehe unten) |

## Deployment auf GitHub Pages

Bei jedem Push auf `main` baut GitHub Actions die Seite und veröffentlicht sie (`.github/workflows/deploy.yml`).

Einmalige Einrichtung:

1. Auf github.com ein **öffentliches** Repository `deutsch-desktop` unter `tobzwil89` anlegen (ohne README, leer).
2. Im Projektordner:
   ```bash
   git remote add origin https://github.com/tobzwil89/deutsch-desktop.git
   git push -u origin main
   ```
3. Im Repository: **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.
4. Beim Domain-Anbieter einen DNS-Eintrag anlegen:
   `CNAME`  `deutsch`  →  `tobzwil89.github.io`
5. **Settings → Pages → Custom domain:** `deutsch.tobiaszwilling.me` eintragen und speichern. Sobald das Zertifikat da ist (kann bis zu 24 h dauern), **„Enforce HTTPS“** anhaken.

Hinweis: Beim Veröffentlichen über GitHub Actions zählt die Domain aus den Pages-Einstellungen (Schritt 5). `public/CNAME` liegt trotzdem bei, schadet nicht.

**Andere Subdomain?** `public/CNAME` ändern, DNS-Eintrag anpassen und in Schritt 5 die neue Domain eintragen. `base` in `vite.config.ts` bleibt `/`, solange die Seite auf einer eigenen (Sub-)Domain liegt.

## Inhalte erweitern

Alle Lerninhalte liegen als JSON in `src/data/`. Nach einer Änderung `npm run build` ausführen: Tippfehler in der JSON-Struktur fallen dann sofort auf.

### Vokabeln: `src/data/vocab/a1.json`, `a2.json`, `b1.json`, `b2.json`

```json
{
  "id": "a1-tisch",
  "word": "Tisch",
  "pos": "noun",
  "article": "der",
  "plural": "Tische",
  "en": "table, desk",
  "example": "Das Buch liegt auf dem Tisch.",
  "exampleEn": "The book is on the table.",
  "topic": "work"
}
```

- `id`: eindeutig, Format `niveau-wort`. **Nie nachträglich ändern**, sonst geht der Lernfortschritt dieser Karte verloren.
- `pos`: `noun`, `verb`, `adjective` oder `adverb`.
- Nur bei Nomen: `article` (`der`/`die`/`das`) und `plural` **ohne** Artikel. `null` bedeutet: kein oder kaum gebräuchlicher Plural.
- Reflexive Verben mit „sich“ schreiben (`"sich erinnern"`). Beim Tippen wird beides akzeptiert, mit und ohne „sich“.
- `topic`: `everyday`, `food`, `travel`, `work`. Ein neues Thema funktioniert sofort. Den Anzeigenamen trägst du in `src/data/vocab.ts` → `TOPIC_NAMES` ein.
- Alle Nomen erscheinen automatisch auch im Der/Die/Das-Spiel.

### Verben: `src/data/verbs.json`

```json
{
  "id": "gehen",
  "infinitive": "gehen",
  "en": "to go, to walk",
  "type": "irregular",
  "separable": false,
  "auxiliary": "sein",
  "participle": "gegangen",
  "present":   { "ich": "gehe", "du": "gehst", "er": "geht", "wir": "gehen", "ihr": "geht", "sie": "gehen" },
  "preterite": { "ich": "ging", "du": "gingst", "er": "ging", "wir": "gingen", "ihr": "gingt", "sie": "gingen" },
  "perfect":   { "ich": "bin gegangen", "du": "bist gegangen", "er": "ist gegangen", "wir": "sind gegangen", "ihr": "seid gegangen", "sie": "sind gegangen" },
  "note": "optional: Hinweis, der nach der Antwort erscheint"
}
```

- Alle Formen werden ausgeschrieben, die App berechnet nichts.
- Mehrere richtige Formen mit `|` trennen: `"du": "aßest|aßt"`. Die erste wird als Lösung angezeigt.
- Trennbare Verben mit Präfix am Ende: `"stehe auf"`. Dazu `"separable": true`.
- `type`: `regular`, `irregular`, `mixed`, `modal` oder `auxiliary` (bestimmt den Filter im Conjugator).
- Ein Pronomen vor der Antwort („du gehst“) wird beim Prüfen ignoriert.

### Einstufungstest: `src/data/leveltest.json`

```json
{
  "id": "b1-16",
  "level": "B1",
  "skill": "grammar",
  "text": "optional: Lesetext für Leseverständnis",
  "question": "Ich weiß nicht, ___ er morgen kommt.",
  "correct": "ob",
  "wrong": ["wenn", "als", "damit"]
}
```

- `level`: `A1` bis `C1`. `skill`: `grammar`, `vocabulary` oder `reading`.
- Genau eine richtige und drei falsche Antworten. Die Reihenfolge wird in der App gemischt.
- Pro Niveau sollten mindestens 10 Fragen da sein, sonst gehen dem adaptiven Test die Fragen aus (aktuell: 15 pro Niveau).

### Abzeichen, XP und Tagesziele

- Abzeichen: `src/game/badges.ts`
- XP-Kurve, Freeze-Preis und Tagesziele: `src/game/xp.ts`
- XP pro Antwort: jeweils oben in der App-Datei (z. B. `src/apps/vocab/VocabApp.tsx`)

## Aufbau

```
src/
  config.ts          Platzhalter und Links
  shell/             Desktop (Menüleiste, Dock, Fenster) und Handy-Homescreen
  apps/              eine App pro Ordner, wird erst beim Öffnen geladen
  game/              Gamification: Store, XP, Streak, Abzeichen, Töne, Mitteilungen
                     (Apps rufen nur Funktionen aus game/api.ts auf)
  lib/               Leitner-System, Antwortprüfung, Datum, Hooks
  data/              Lerninhalte (JSON) und Texte
```

Technik: Vite, React, TypeScript, Tailwind CSS, Zustand (mit `persist`), Framer Motion, react-rnd, canvas-confetti. Die Schrift Inter liegt lokal (`@fontsource-variable/inter`) und wird nicht von Google geladen.
