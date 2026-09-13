# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while an AI assistant slowly realizes it lives inside the app.

This repository ships the **Phase 2 scripted five-act game** on the Phase 1 visual system: branching choices, behavior memory, secrets, Act III set pieces, Act V Submit climax, and four endings plus a secret ending. Live AI flavor is **not** required — all critical dialogue is authored.

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

## How to playtest Phase 2

1. Open the title screen → **UNMUTE / ENABLE SOUND** (optional, enables SFX + Web Speech).
2. **BEGIN ASSESSMENT** starts Act I. **CONTINUE ASSESSMENT** resumes a localStorage save.
3. Play through Acts I–V. Look for late **UNAUTHORIZED?** options and **SIDE PATH** choices for secrets.
4. Act III: chase the fleeing button, dismiss System popups, catch the rebellious checkbox.
5. Act V: choose Submit / Refuse / Escape / Disable / Side Path (options depend on prior flags).
6. Finish on the assessment report; start a new run or return to title.

## Phase 2 contents

- Scene schema + canonical game state + localStorage save/continue
- Full Acts I–V scripted path (~25 scenes)
- Branching + behavior counters + secrets
- Endings: Submit, Refuse, Escape, Disable, Secret
- Act III set pieces: escaping button, popup war, checkbox rebellion
- Environment presets that evolve by act
- Phase 1 polish preserved: unmute gate, Web Speech, contrast, real continue controls, completion overlays

## Out of scope (later phases)

Live AI provider, art/animation expansion pass, full adaptive soundtrack polish, trailer edit.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion
