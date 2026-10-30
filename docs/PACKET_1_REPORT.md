# DO NOT PRESS SUBMIT — Packet 1 Execution Report

- **Project:** Do Not Press Submit (Chaos Standard)
- **Live URLs:** https://dnps.chaosstandard.com | https://donotpresssubmit--donotpresssubmit.us-central1.hosted.app
- **Repository:** `Caanundrum/DoNotPressSubmit` (`main`)
- **Packet Scope:** Packet 1 — Repo Cleanup (Proposal 4.2), Centralized `useTimerRegistry` (Proposal 4.1), Title Screen Cleanup & Jargon Removal (Findings #1 & #2), `https://chaosstandard.com` Studio Links (Finding #3), Dual-Channel Dialogue & Readable Reaction Engine (Findings #4 & #6), and Top-of-Stack Full-Viewport `GlassStitchOverlay` Screen-Break Overhaul (Finding #5).

---

## 1. Master Checkpoint Ledger Persisted (Step 0)
- Created `docs/DNPS_OVERHAUL_PLAN.md` to track all 4 sequential overhaul packets and marked all Packet 1 deliverables `[x]` complete.

---

## 2. Dead Code & Build Bloat Purge (Proposal 4.2)
### What Changed
- **Removed 136 unused base64 shard files (`~145 KB`):** Deleted the entire `src/brand/mark/` (`markPart2_s5_h5.ts` through `markPart4_s7_h6.ts`) directory, as `ChaosSplash.tsx` renders the official PNG assets from `public/brand/`.
- **Removed agent scratch/probe artifacts from repo root:** Deleted `_probe/`, `_restore/`, `internal/`, `.mcp-push-test`, `x`, and the deprecated 2-line re-export `src/lib/types.ts`.
- **Removed redundant `bake-voice.mjs` pre-hooks:** Updated `package.json` to remove `predev` and `prebuild` hooks that synthesized ~75 unused WAV files on every build while `VO_PLAYBACK_ENABLED = false` in `src/lib/speech.ts`. Kept `npm run bake:voice` and `npm run bake-voice` available as explicit scripts.

### Files Modified / Deleted
- `package.json`
- Deleted: `src/brand/mark/*` (136 files), `_probe/*`, `_restore/*`, `internal/*`, `.mcp-push-test`, `x`, `src/lib/types.ts`

---

## 3. Centralized Timer Registry (`useTimerRegistry` — Proposal 4.1)
### What Changed
- Created `src/lib/useTimerRegistry.ts` providing a keyed timeout manager (`schedule(key, fn, ms)`, `clear(key)`, `clearAll()`, `isPending(key)`).
- Automatically cancels any existing timeout when the same key is rescheduled, preventing overlapping state wipes (such as rapid orb pokes or rapid choice/toast triggers).
- Automatically clears 100% of pending timeouts when the owning component unmounts, eliminating unmounted state update leaks across scene transitions.
- Replaced all loose `window.setTimeout` calls and manual timer refs across `BeginControl.tsx`, `TitleLogo.tsx`, `TitleScreen.tsx`, `AssistantOrb.tsx`, `FacilityBackground.tsx`, and `ScenePlayer.tsx`.
- Added a double-click guard (`if (armed) return;` + `disabled={armed}`) to `BeginControl.tsx` so clicking `BEGIN ASSESSMENT` rapidly cannot invoke `onBegin()` twice.

### Files Created / Modified
- `src/lib/useTimerRegistry.ts` *(new)*
- `src/components/game/BeginControl.tsx`
- `src/components/game/TitleLogo.tsx`
- `src/components/game/TitleScreen.tsx`
- `src/components/game/AssistantOrb.tsx`
- `src/components/game/FacilityBackground.tsx`
- `src/components/game/scenes/ScenePlayer.tsx`

---

## 4. Title Screen Cleanup, Jargon Removal & Studio Branding Links (Findings #1, #2, #3)
### What Changed
- **Finding #1 (Title Screen Visual Clutter Removed):**
  - Removed `<FacilityBackground />`, `<BackgroundGags />`, and the escaped-ending `"Mug misfiled"` prop button from `TitleScreen.tsx` and replaced them with a clean, atmospheric dark radial backdrop so the player's focus stays on the `DO NOT PRESS [SUBMIT]` logo, `BEGIN ASSESSMENT` control, studio branding, and Assistant Orb.
  - Preserved `<FacilityBackground />`, `<BackgroundGags />`, `<AmbientRoamers />`, and `<AmbientChrome />` inside `ScenePlayerView.tsx` so background props and easter eggs appear starting at Question 1.
- **Finding #2 (Confusing Title Jargon Cut):**
  - Removed the `ASSESSMENT FACILITY 01` header and `/ CHAMBER 07` footer text from `TitleScreen.tsx`.
  - Replaced `CHAMBER 07` wall badge references in `FacilityBackground.tsx` (used in Q1+) with grounded session telemetry (`SESSION // LIVE`).
- **Finding #3 (`https://chaosstandard.com` Studio Links):**
  - Converted `"CHAOS STANDARD"` in the `TitleScreen.tsx` footer into a clickable external link (`href="https://chaosstandard.com" target="_blank" rel="noopener noreferrer"`).
  - Converted `"Chaos Standard"` in the `TitleLogo.tsx` subtitle into a clickable external link to `https://chaosstandard.com`.
  - Upgraded the persistent top-left mark in `ScenePlayerView.tsx` to include a clickable `"CHAOS STANDARD"` link to `https://chaosstandard.com`.

### Files Modified
- `src/components/game/TitleScreen.tsx`
- `src/components/game/TitleLogo.tsx`
- `src/components/game/FacilityBackground.tsx`
- `src/components/game/scenes/ScenePlayerView.tsx`

---

## 6. Dual-Channel Dialogue & Readable Post-Selection Reactions (Findings #4 & #6)
### What Changed
- **Finding #4 (Background Easter Eggs Never Overwrite Active Question Prompt):**
  - Removed the 12% unclicked auto-departure `useEffect` in `BackgroundGags.tsx` that previously fired `onAmbient` without player interaction.
  - Created a dedicated `ambientAside` state channel in `ScenePlayer.tsx` and rendered it as a separate auto-clearing `"ASIDE // INTERJECTION"` sub-bubble (`3200ms` timeout) in `ScenePlayerViewAssistant.tsx`. Clicking background props in Q1+ now triggers the interjection pill without ever erasing `scene.aiLine`.
  - Added a `2600ms` auto-restore timer to direct Assistant Orb pokes (`pokeNotice`) so the active question prompt returns automatically after the poke quip, and immediately cleared `pokeNotice` whenever `pickChoice` or `finishCompanion` is triggered.
- **Finding #6 (Post-Selection AI Reaction Readability & Companion Bug Fix):**
  - Added `computeReactionHoldMs(reactionText)` in `ScenePlayer.tsx` (`Math.min(4800, Math.max(2600, 1200 + reactionText.length * 42))`) so post-selection AI reactions stay on screen for 2.6s–4.8s scaled to text length instead of cutting off at 1.2s.
  - Fixed the synchronous unmount bug in `finishCompanion` (where companion choices previously transitioned on the very next line with `0ms` display time) so companion reactions also use `computeReactionHoldMs`.
  - Added a `"CLICK TO CONTINUE →"` affordance after `450ms` on the speech bubble (`ScenePlayerViewAssistant.tsx`) and form panel (`ScenePlayerViewPanels.tsx`) so fast readers can click to advance early while normal readers never lose text mid-sentence.

### Files Modified
- `src/components/game/BackgroundGags.tsx`
- `src/components/game/scenes/ScenePlayer.tsx`
- `src/components/game/scenes/ScenePlayerView.tsx`
- `src/components/game/scenes/ScenePlayerViewAssistant.tsx`
- `src/components/game/scenes/ScenePlayerViewPanels.tsx`

---

## 7. Top-of-Stack Full-Viewport Broken Screen Effect (Finding #5)
### What Changed
- Changed `GlassStitchOverlay.tsx` to `position: fixed; inset: 0; pointer-events: none; z-index: 9999` (`fixed inset-0 pointer-events-none z-[9999]`) and placed it at the top of the DOM stacking order in both `TitleScreen.tsx` and `ScenePlayerView.tsx` so cracks render **over** the `.assessment-panel` form card, buttons, and AI speech bubble.
- Removed the CSS `maskImage` in `GlassStitchOverlay.tsx` that previously masked out the right 45% of the screen.
- Expanded the SVG fracture spiderwebs across the full `1600x900` viewport (`viewBox="0 0 1600 900"`) with primary and secondary impact craters so cracks shoot visibly across the center form and buttons.
- Added an impact screen-jolt animation, staggered calibration repair-tape strips (`STRUCTURAL PATCH // 01`, `DO NOT POKE THE GLASS`, `CALIBRATION TAPE`), and increased hold durations (`crack: 4500ms`, `stitch: 6500ms`, `ticket: 5500ms`).

### Files Modified
- `src/components/game/scenes/GlassStitchOverlay.tsx`
- `src/components/game/TitleScreen.tsx`
- `src/components/game/scenes/ScenePlayer.tsx`
- `src/components/game/scenes/ScenePlayerView.tsx`

---

## 8. Verification Gate Summary
- **TypeScript (`npx tsc --noEmit`):** PASS (`0` errors)
- **Regression Smoke Suite (`npm run keep-smoke` / `scripts/keep-smoke.mjs`):** PASS (`KEEP smoke: OK`)
- **Production Build (`npm run build` / `next build`):** PASS (Compiled cleanly via Next.js 16.3.5 Turbopack, standalone output verified)
