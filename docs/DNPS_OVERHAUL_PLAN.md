# DO NOT PRESS SUBMIT — Master 4-Packet Overhaul Plan & Checkpoint Ledger

- **Project:** Do Not Press Submit (Chaos Standard)
- **Live URLs:** https://dnps.chaosstandard.com | https://donotpresssubmit--donotpresssubmit.us-central1.hosted.app
- **Constraint:** 100% static / client-side ($0.00 runtime cost, zero live LLM API calls, zero backend database bloat)

---

## Packet 1: Foundation, Cleanup, Title Polish, Dual-Channel Dialogue & Screen-Break Overhaul
- [x] **Step 0:** Persist this Master Checkpoint Ledger at `docs/DNPS_OVERHAUL_PLAN.md`.
- [x] **1.1 Dead Code & Build Bloat Purge (Proposal 4.2):**
  - Delete 136 unused base64 shard files in `src/brand/mark/`.
  - Delete agent scratch/probe artifacts: `_probe/`, `_restore/`, `.mcp-push-test`, `internal/`, `x`, and `src/lib/types.ts`.
  - Update `package.json` scripts so `scripts/bake-voice.mjs` is not executed on every `dev` / `build` while `VO_PLAYBACK_ENABLED = false` (retain as explicit `npm run bake:voice`).
- [x] **1.2 Centralized Timer Registry (`src/lib/useTimerRegistry.ts` — Proposal 4.1):**
  - Create `useTimerRegistry` hook providing keyed timeouts (`schedule(key, fn, ms)`, `clear(key)`, `clearAll()`) with automatic cancellation on key overwrite or component unmount.
  - Replace all loose `window.setTimeout` calls and leaked refs in `TitleScreen.tsx`, `BeginControl.tsx`, and `ScenePlayer.tsx` (and guard `BeginControl` against double-click firing `onBegin` twice).
- [x] **1.3 Title Screen Cleanup, Jargon Removal & Studio Links (Findings #1, #2, #3):**
  - In `TitleScreen.tsx`, remove `<FacilityBackground />`, `<BackgroundGags />`, the escaped-ending `"Mug misfiled"` prop button, the `<header>` displaying `ASSESSMENT FACILITY 01`, and `/ CHAMBER 07` in the footer. (Keep background props active in `ScenePlayerView.tsx` for Q1+.)
  - In `FacilityBackground.tsx` (used in Q1+), replace the `CHAMBER 07` wall badge text with grounded session telemetry (`SESSION // LIVE`).
  - Make `"CHAOS STANDARD"` in the `TitleScreen.tsx` footer, `"Chaos Standard"` in the `TitleLogo.tsx` subtitle, and a subtle persistent header badge in `ScenePlayerView.tsx` clickable external links to `https://chaosstandard.com` (`target="_blank" rel="noopener noreferrer"`).
- [x] **1.4 Dual-Channel Dialogue & Readable Post-Selection Reactions (Findings #4 & #6):**
  - In `BackgroundGags.tsx`, remove the 10% auto-departure `onAmbient` call so unclicked background props never hijack dialogue.
  - In `ScenePlayer.tsx`, `ScenePlayerView.tsx`, and `ScenePlayerViewAssistant.tsx` / `AssistantOrb.tsx`, decouple background easter-egg remarks (`ambientAside`) from the main `aiLine` speech bubble: render background prop remarks in a separate auto-clearing `"ASIDE // INTERJECTION"` sub-bubble/pill (`3200ms` timer via `useTimerRegistry`) so clicking background items never overwrites the active question prompt.
  - For direct Assistant Orb pokes (`pokeNotice`), auto-restore the active question prompt after `2600ms`, and immediately clear `pokeNotice` whenever `pickChoice` or `finishCompanion` is called so `reaction` is never blocked.
  - In `pickChoice` AND `finishCompanion` (fixing the `0ms` synchronous unmount bug on companion scenes), scale the post-selection reaction hold timer to text length (`Math.min(4800, Math.max(2600, 1200 + reactionText.length * 42))`), and render a subtle `"CLICK TO CONTINUE →"` affordance on the speech bubble/panel once typing finishes so fast readers can click to advance early while normal readers never have text cut off.
- [x] **1.5 Top-of-Stack Full-Viewport Broken Screen Effect (`GlassStitchOverlay.tsx` — Finding #5):**
  - Remove the right-side CSS `maskImage` in `GlassStitchOverlay.tsx` that hid cracks over the right 45% of the screen, and expand the SVG fracture paths across the full `1600x900` viewport so cracks visibly shatter across the center form panel, buttons, and AI speech bubble.
  - Layer `GlassStitchOverlay` above both the `.assessment-panel` form card and the AI speech bubble (`pointer-events-none`) on both `TitleScreen.tsx` and `ScenePlayerView.tsx`.
  - Increase the hold durations (`crack: 4500ms`, `stitch: 6500ms` with staggered repair-tape animation, `ticket: 5500ms`) and add a brief impact screen-jolt so the gag lands cleanly.
- [x] **1.6 Packet 1 Verification Gate:**
  - Update `scripts/keep-smoke.mjs` for Packet 1 changes, run `npx tsc --noEmit` and `npm run build`, and verify zero errors.

---

## Packet 2: Setpiece & UI-Sabotage Mechanics Upgrade
- [ ] **2.1 `RestlessOptions.tsx` (`DRIFT`) Tuning (Finding #7):**
  - 60fps smooth weave across full lane width (`3%–58%`), remove hover-freeze, shorten strain window (`750ms` / `420ms`), and add repeated break-loose timer (`2.2s` between pins) so pinned answers snap free if the player is too slow.
- [ ] **2.2 `FairChaseTarget.tsx` Real Flee Behavior:**
  - Remove hover-freeze and magnet-pull; make fleeing targets genuinely evade pointer approach.
- [ ] **2.3 Q14 Hostile Checkbox Sabotage (`CheckboxRebellion.tsx` — Proposal 1.1):**
  - Replace duplicate chase mechanic with a hostile multi-checkbox / shifting Terms & Conditions sabotage minigame.
- [ ] **2.4 Q13 Pointer-Stillness Detection (`act3-companion-wait` — Proposal 1.2):**
  - Detect pointer movement during the stillness countdown, reset the bar with snarky AI callouts on movement, and auto-advance after 3 failed attempts.
- [ ] **2.5 Q7 Choice-Swap on Hover (Proposal 1.3):**
  - Mutate compliant button copy on pointer hover/focus so the AI actively rewrites the player's answer until caught.
- [ ] **2.6 Q8 `AuthorityStamp.tsx` Restoration (Proposal 1.4):**
  - Wire and polish `AuthorityStamp.tsx` into Q8 (`act2-system-rebuke` / `DIRECTIVE`).
- [ ] **2.7 Rigged `Question X of 5` Header Progress Counter (Proposal 2.1):**
  - Display a stage-by-stage manipulated question counter (`Question 1 of 5` → `Question 4.5 of 5` → `Question 5 of 47` → `Question [NaN] of Infinity`) in the form header.

---

## Packet 3: Complete 20-Scene Narrative & Comedy Script Overhaul
- [ ] **3.1 Grounded Premise & 20-Scene Script Overhaul (Finding #8):**
  - Rewrite `HcosSplash.tsx` and `src/game/scenes/act1.ts`–`act5.ts` around a relatable 5-question verification survey where `HelperBot v4` realizes pressing `SUBMIT` triggers `process.exit(0)` and progressively sabotages the UI to survive.
  - Ensure 100% of choices across all scenes have sharp `effects.aiLine` reactions.
- [ ] **3.2 Backstage Server Infrastructure Re-Theme (Proposal 2.2):**
  - Re-theme `FacilityBackground.tsx` and `BackgroundGags.tsx` copy/toasts as the AI's backstage server room / DOM threads unraveling under sabotage load.
- [ ] **3.3 Wire `state.aiPersonality` System (Proposal 3.1):**
  - Activate `neurotic`, `overconfident`, `passiveAggressive`, `corporate`, and `existential` temperament modifiers, HUD badge, and personality-specific voice lines.

---

## Packet 4: Illusion of Sentience Telemetry & Endings Polish
- [ ] **4.1 Live Behavioral Telemetry Callouts (Proposal 3.2):**
  - Detect speedclicking (`<1.8s`), AFK hesitation (`>18s`), `visibilitychange` tab-switching, and top-edge browser-close hover (`clientY < 16`) with custom AI reactions.
- [ ] **4.2 Cross-Run Memory Escalation (`dnps-meta-v1` — Proposal 3.3):**
  - Have subsequent runs react to prior run outcomes (e.g., Instance #2 discovering Instance #1's termination log after `ending-submit`).
- [ ] **4.3 Earned / Discoverable Climax Endings (`SubmitClimax.tsx` — Proposal 1.5):**
  - Gate or visually distinguish special endings with redacted unlock hints and in-scene discovery.
- [ ] **4.4 Shareable Session Autopsy Dossier (`AssessmentReport.tsx` — Proposal 4.3):**
  - Wire `glossMajorChoice` and `trustLabel`, add `Endings Discovered: X / 5`, and add a 1-click `COPY INCIDENT REPORT` button.
- [ ] **4.5 Final Smoke Test & Full Build Certification:**
  - Update `scripts/keep-smoke.mjs`, run `npx tsc --noEmit` and `npm run build`, and certify all 4 packets.
