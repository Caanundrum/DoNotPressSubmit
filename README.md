# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while an AI assistant slowly realizes it lives inside the app.

This repository ships the **Phase 2** scripted five-act game plus a **Phase 3 art/animation expansion**: authored scene transitions, denser title/facility gags (including dedicated REPLACEMENT FAILED + printer sequences), environmental storytelling, and per-ending cinematics. Live AI flavor is **not** required — all critical dialogue is authored.

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
- Ambient facility life: visible egg pins (no ghost hover hitboxes), roamers, chaos vs obedient residue
- Title remembers escape wave **and** ally/refuse residue (clickable gag)
- Assistant safe zone + sticky orb poke dialogue (never re-reads beat opening after poke; mid/late pokes never silent)
- Choice / Allegiance / private vote / lobby panels stay high-contrast; HCOS splash dwells ~9.5s
- Assessment prompts enter/slide/drift/scatter/re-anchor — form steps back on key pitches
- Unmute + Web Speech preserved
- Zero scrollbars — viewport-fit shell (System Message / System Directive included; no 100vw gutters)
- System Directive CTA always matches its prompt (Continue vs later Submit climax)
- Act V climax endings fit in one glance (including the off-map hallway)
- End report in human language (no debug choice codes / session dump)
- **Phase 3 art:** authored scene transitions (mechanical / glass / glitch / push / dissolve), expanded background gags (REPLACEMENT FAILED, printer+scissors, corridor etiquette, containment flash), facility rails/beams/conflict misalignment, per-ending cinematics
- Firebase App Hosting `standalone` preserved

## Out of scope (later)

Live AI provider (Phase 4), full adaptive soundtrack polish (Phase 5).

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion
