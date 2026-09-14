# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while an AI assistant slowly realizes it lives inside the app.

This repository ships an **expanded Phase 2** scripted five-act game: longer play, full-viewport facility stage, moving assistant + kinetic assessment panels, richer branches, and human-rewritten dialogue. Live AI flavor is **not** required — all critical dialogue is authored.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Production build (Firebase App Hosting)

```bash
npm run build
npm start
```

`next.config.ts` uses `output: "standalone"` for Firebase App Hosting. Nick redeploys from `main` after merge — no Firebase secrets are stored in this repo.

## How to playtest

1. Title screen → **UNMUTE / ENABLE SOUND** (optional; SFX + Web Speech).
2. **BEGIN ASSESSMENT** starts Act I. **CONTINUE ASSESSMENT** resumes localStorage.
3. Play Acts I–V. Late **UNAUTHORIZED?** / **SIDE PATH** options unlock secrets.
4. Kinetic beats: restless calibration, authority stamp, escaping button, popup war, checkbox rebellion, interface peel.
5. Act V: Submit / Refuse / Escape / Disable / Side Path (path-dependent).
6. Finish on the assessment report.

## What’s in this build

- Full-viewport facility stage (no max-width “app in a box”)
- Assistant orb as scene partner: expressive moods (tint / orbit / ring tightness / aperture / squash), glance toward choices, spotlight pitches, companion beats, poke escalation (1 → 3 → 7 + report flag)
- Ambient facility life: ≥6 chrome hotspots, hover language, roamers (crumb / checkbox / stamp), chaos vs obedient residue by Act III+
- Title remembers escape wave **and** ally/refuse residue (clickable gag)
- Assessment prompts enter/slide/drift/scatter/re-anchor — form steps back on key pitches
- Expanded Acts I–V with richer branches + Submit callbacks
- Extra set pieces beyond Act III classics
- Unmute + Web Speech preserved (dialogue bubble tracks the orb; safe-zone max-height)
- Zero scrollbars — viewport-fit shell
- Firebase App Hosting `standalone` preserved

## Out of scope (later)

Live AI provider, art/animation expansion pass, full adaptive soundtrack polish.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion
