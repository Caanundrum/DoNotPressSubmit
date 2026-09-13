# DO NOT PRESS SUBMIT

A short, highly visual browser comedy game from **Chaos Standard**. You fill out a mundane corporate assessment while an AI assistant slowly realizes it lives inside the app.

This repository currently ships the **Phase 1 Visual Vertical Slice**: cinematic intros, animated title facility, assistant orb moods, one interactive assessment beat, and a System interruption that physically affects the room.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Production build (Firebase App Hosting)

```bash
npm ci
npm run build
```

This app targets **Firebase App Hosting** (Node / `@apphosting/adapter-nextjs`), not classic static Firebase Hosting.

- Next is configured with `output: "standalone"`.
- After a successful build, App Hosting expects artifacts under `.next/standalone/` (including `.next/standalone/.next/routes-manifest.json`).
- Do **not** use `output: "export"` / the `out/` folder for this deploy path — that breaks the App Hosting Next adapter.

Nick owns Firebase console credentials and redeploy. After merging this change, reconnect/redeploy the App Hosting backend from `main` (or the PR branch if testing a preview).

```bash
npm start   # serves the Next standalone server on port 43123
```

## Phase 1 contents

- Chaos Standard logo splash (~5s, skippable)
- HCOS corporate boot splash
- Animated title screen with layered facility, ≥3 background gags, custom logo treatment, premium Begin control
- Assistant orb moods: neutral / listening / amused / nervous (+ thinking)
- One assessment scene with real choice + AI reaction (scripted)
- System interruption that locks lights / shakes the room
- Audio foundation wired for logo sting, ambience, UI clicks, Begin, System

## Out of scope (later phases)

Full 20 scenes, live AI provider, accounts, multiplayer, Steam, voice, secret ending, full soundtrack polish, Firebase credentials in-repo.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Framer Motion
