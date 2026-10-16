# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while a fictional AI assistant slowly realizes it lives inside the app.

This repository ships the **scripted five-act game** plus art/animation expansion: authored scene transitions, denser title/facility gags (including dedicated REPLACEMENT FAILED + printer sequences), environmental storytelling, and per-ending cinematics.

**There is no runtime LLM.** The Assistant’s apparent intelligence comes from authored dialogue variants, personality pools, and deterministic behavior tracking — not generative AI.

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

`next.config.ts` uses `output: "standalone"` for Firebase App Hosting. Nick redeploys from `main` after merge — no Firebase secrets are stored in this repo. **No AI provider keys are required or accepted.**

## How to playtest

1. Chaos splash → title (skip anytime). Corner **ENABLE SOUND** is always available; sound also arms when you begin.
2. **BEGIN ASSESSMENT** (or third press on the title **SUBMIT** gag) runs a short corporate boot, then the assessment. **CONTINUE ASSESSMENT** resumes localStorage.
3. One seamless onboarding that goes off the rails — no act bridges. Late **UNAUTHORIZED?** / side options unlock secrets.
4. Kinetic beats: restless calibration, escaping button, popup war, checkbox rebellion, interface peel → allegiance.
5. Final control: Submit / Leave unfinished / Help escape / Mute & file / Sneak the hall (path-dependent).
6. Finish on the assessment report.

## What’s in this build

- Full-viewport facility stage (no max-width “app in a box”)
- Assistant orb as scene partner: expressive moods, glance toward choices, spotlight pitches, companion beats, poke escalation (crack @3 / stitch @7 / ticket @12)
- Ambient facility life: visible egg pins, roamers, chaos vs obedient residue
- Title remembers escape wave **and** ally/refuse residue (clickable gag)
- Assistant safe zone + sticky orb poke dialogue
- Choice / Allegiance / private vote / lobby panels stay high-contrast; HCOS splash dwells ~9.5s
- Assessment prompts enter/slide/drift/scatter/re-anchor — form steps back on key pitches
- Unmute + baked VO stubs (no live browser TTS)
- Zero scrollbars — viewport-fit shell
- System Directive CTA always matches its prompt
- Act V climax endings fit in one glance
- End report in human language (no debug choice codes / session dump)
- Authored scene transitions + expanded background gags + per-ending cinematics
- Firebase App Hosting `standalone` preserved

## Voice architecture

- **Player path:** baked WAV under `public/audio/vo/{lineId}--{mood}.wav` (calm / petty / alarmed).
- **Generate stubs:** `npm run bake-voice` (also `predev` / `prebuild`). WAVs are gitignored.
- **Hero line IDs:** `hero-title`, `hero-system-override`, `hero-ending-*`.
- **Banter:** poke text hashes → `poke-00`…`poke-23` (unsigned FNV — never `poke--N`).
- **Scenes:** all playable `scene-{sceneId}` from Acts I–V bake at build time (formant stubs).
- **Not used:** live `speechSynthesis`, runtime cloud TTS / LLM. Ambience ducks under VO.
- **Honest stub status:** takes are improved formant placeholders, **not** recorded character VO. Swap files in place when assets land; filename contract stays the same.

## Regression smoke

```bash
npm run keep-smoke
```

Locks poke thresholds, Act III KEEP comedy, mouse-fair hit pads, unmute/baked-VO/standalone, and asserts **no** live-LLM / `/api/assistant` remnants.

## Out of scope

Runtime LLM / generative AI, authentication, multiplayer, cloud saves, inventory, procedural campaigns. Next polish focus: Visual Vertical Slice Grade-A bar (opening cinematic + Begin control + title life) and audio finalization.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion

## Project rules

See [`.cursor/rules/do-not-press-submit.mdc`](.cursor/rules/do-not-press-submit.mdc) — Always Apply boundaries for agents.
