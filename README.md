# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while an AI assistant slowly realizes it lives inside the app.

This repository currently ships the **Phase 1 Visual Vertical Slice** (+ polish): cinematic intros, animated title facility, assistant orb moods, one interactive assessment beat, a System interruption with a real continue control, Web Speech for AI lines, and an explicit unmute entry point.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Tap **UNMUTE / ENABLE SOUND** on the title screen (or the corner control later) to hear ambience, SFX, and spoken AI lines. Speech uses the browser **Web Speech API** — no extra API keys.

## Production build (Firebase App Hosting)

```bash
npm ci
npm run build
```

This app targets **Firebase App Hosting** (Node / `@apphosting/adapter-nextjs`), not classic static Firebase Hosting.

- Next is configured with `output: "standalone"`.
- After a successful build, App Hosting expects artifacts under `.next/standalone/` (including `.next/standalone/.next/routes-manifest.json`).
- Do **not** use `output: "export"` / the `out/` folder for this deploy path — that breaks the App Hosting Next adapter.

Nick owns Firebase console credentials and redeploy. After merging to `main`, reconnect/redeploy the App Hosting backend from `main`.

```bash
npm start   # serves the Next standalone server on port 43123
```

## Phase 1 contents

- Chaos Standard logo splash (~5s, skippable)
- HCOS corporate boot splash
- Animated title screen with layered facility, ≥3 background gags, custom logo treatment, premium Begin control
- Explicit **UNMUTE / ENABLE SOUND** control (title + corner)
- Assistant orb moods: neutral / listening / amused / nervous (+ thinking)
- One assessment scene with real choice + AI reaction (scripted) **spoken via Web Speech**
- System interruption with clickable **CONTINUE ASSESSMENT** (plus longer auto-resume)
- Completion overlay that clears the assessment form
- Audio foundation: logo sting, ambience, UI clicks, Begin, System (after unmute)

## Out of scope (later phases)

Full 20 scenes, live AI provider, accounts, multiplayer, Steam, full soundtrack polish, secret ending, Firebase credentials in-repo.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion · Web Speech API
