# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while an AI assistant slowly realizes it lives inside the app.

This repository ships Phases **1–4**: scripted five-act game, art/animation expansion, and **live AI reaction flavor** (non-authoritative). Authored dialogue remains the safety net — the game plays fully without any API key.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Phase 4 — live AI (optional)

Copy `.env.example` → `.env.local` if you want real LLM flavor:

```bash
OPENAI_API_KEY=sk-...          # Nick sets this (local or Firebase App Hosting secret)
# OPENAI_MODEL=gpt-4o-mini     # optional
# DNPS_AI_MODE=auto            # auto | mock | live
```

| Mode | Behavior |
| --- | --- |
| **auto** (default) | Uses OpenAI when `OPENAI_API_KEY` is set; otherwise **local mock** flavor |
| **mock** | Always local mock (offline QA) |
| **live** | Prefer OpenAI; degrades to mock on failure |

**Rules:** AI only seasons spoken lines (scene-open + choice reactions). It never owns progression, endings, UI, or Act III KEEP comedy (popup cousin, checkbox flee, LOOK UNDERNEATH, etc.). Failures → authored line, no spinner, no error chrome.

Check provider status: `GET /api/assistant`.

## Production build (Firebase App Hosting)

```bash
npm run build
npm start
```

`next.config.ts` uses `output: "standalone"`. Nick redeploys from `main` after merge. To enable real live AI in production, set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL` / `DNPS_AI_MODE`) as App Hosting secrets/env — **not required** for deploy.

## How to playtest

1. Title screen → **UNMUTE / ENABLE SOUND** (optional; SFX + Web Speech).
2. **BEGIN ASSESSMENT** starts Act I. **CONTINUE ASSESSMENT** resumes localStorage.
3. Play Acts I–V. Late **UNAUTHORIZED?** / **SIDE PATH** options unlock secrets.
4. Kinetic beats: restless calibration, authority stamp, escaping button, popup war, checkbox rebellion, interface peel.
5. Act V: Submit / Refuse / Escape / Disable / Side Path (path-dependent).
6. Finish on the assessment report.

## What’s in this build

- Full-viewport facility stage (no max-width “app in a box”)
- Assistant orb as scene partner: expressive moods, glance, spotlight, companion beats, poke ladder (crack@3 / stitch@7 / ticket@12)
- **Phase 4 live AI:** `/api/assistant` + mock fallback; ScenePlayer upgrades dialogue in place (no chatbot panel)
- Ambient facility life + title residue
- Assistant safe zone; Form 12 orb dock-left
- Zero scrollbars; unmute + Web Speech; standalone App Hosting
- End report in human language

## Regression locks (do not break)

- Act III minigames mouse-fair (hover-slow / hit pads as shipped)
- Poke crack@3, stitch@7, ticket@12
- Zero scrollbars; orb not buried on Form 12; human report language
- Act III writing, popup cousin, “agreed then fled,” LOOK UNDERNEATH, ambient eggs, mug steal
- standalone / unmute / Web Speech

```bash
npm run keep-smoke
```

## Out of scope (later)

Full adaptive soundtrack polish (Phase 5).

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion · optional OpenAI-compatible chat API
