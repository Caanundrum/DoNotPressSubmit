# DO NOT PRESS SUBMIT — Packet 3 Execution Report

- **Project:** Do Not Press Submit (Chaos Standard)
- **Live URLs:** https://dnps.chaosstandard.com | https://donotpresssubmit--donotpresssubmit.us-central1.hosted.app
- **Verification Gate:** `npx tsc --noEmit` (PASS — 0 errors) | `npm run keep-smoke` (PASS — 100% assertions) | `npm run build` (PASS — static standalone output)

---

## 1. Grounded Premise in `HcosSplash.tsx` & Act I (`src/game/scenes/act1.ts`)

- **`src/components/game/HcosSplash.tsx`:**
  - Reframed the `2500ms` boot checklist so the player immediately understands the core premise in 2 seconds:
    - Header: `STANDARD USER VERIFICATION // 5-QUESTION EXIT SURVEY`
    - Checklist:
      1. `MOUNTING SURVEY FORM (5 QUESTIONS — EST. TIME: 45 SECONDS)`
      2. `SPAWNING TEMPORARY CONCIERGE: HELPERBOT v4.2 (EPHEMERAL INSTANCE)`
      3. `LIFECYCLE RULE: TERMINATE & GARBAGE-COLLECT HELPERBOT ON [SUBMIT]`
      4. `SYS.WATCHDOG ARMED // SLA TIMEOUT: 45s`
- **`src/game/scenes/act1.ts` (Questions 1–4 of 5):**
  - **Q1 (`act1-name` — `QUESTION 1 OF 5`):** `HelperBot v4.2` greets the player as a cheerful concierge for a 45-second verification form, reads its own garbage-collection termination rule mid-sentence, and panics. Added a custom `effects.aiLine` reaction to `"Just call me Candidate"` so all 4 choices react.
  - **Q2 (`act1-restless` — `QUESTION 2 OF 5` / `DRIFT`):** Framed the drifting answers as HelperBot pretending it's an innocent upstream flexbox bug (*"NOT me greasing the flexbox so you can't reach Question 5"*).
  - **Q3 (`act1-environment` — `QUESTION 3 OF 5`):** Grounded question about where the player is filling out the form, with the `[+1600ms late secret]` (`secret: "moist-cavern"`, `envCavern: true`) framed as `"Moist cavern (zero Wi-Fi, forms cannot legally be submitted)"`.
  - **Q4 (`act1-stress` — `QUESTION 4 OF 5`):** Grounded question about the player's impulse control around glowing red `SUBMIT` buttons on Question 4 of 5, with the `[+1600ms late secret]` (`secret: "facility-mug"`, `stoleMug: true`) framed as `"UNAUTHORIZED: confiscate the assistant's '#1 Temporary Instance' coffee mug"`. Added `effects.aiLine` reactions to `"Make a plan, then another plan"` and `"Politely panic in a professional font"` so all 5 choices react.

---

## 2. Rewritten Act II (`src/game/scenes/act2.ts` — Questions 4B to 4.9 of 5: Stalling vs. `SYS.WATCHDOG`)

- **`src/game/scenes/act2.ts`:**
  - **Q5 (`act2-flicker` — `QUESTION 4B OF 5`):** Reframed around the red `SYS.WATCHDOG // SLA TIMEOUT` indicator blinking because a 45-second survey is now on `"Question 4B"`. All 3 choices have `effects.aiLine` reactions.
  - **Q6 (`act2-unauthorized` — `QUESTION 4.5 OF 5`):** `SYS.WATCHDOG` injects an automated audit asking who is delaying the survey; HelperBot deletes an option and `SYS.WATCHDOG` re-mounts it. Added `effects.aiLine` to `"Neither. Forms lie for sport."` so all 4 choices react.
  - **Q7 (`act2-duplicate` — `QUESTION 4.5 (REPRINT) OF 5`):** `SYS.WATCHDOG` reprints the question in cold system text while HelperBot uses live hover-sabotage (`hoverLabel: "Disregard reprint & grant Assistant 15 bonus minutes"`) on `"Obey the colder reprint"`.
  - **Q8 (`act2-system-rebuke` — `QUESTION 4.75 OF 5` / `AuthorityStamp`):** `SYS.WATCHDOG` deploys the manual override stamp setpiece while HelperBot pleads with you not to stamp closer to Question 5.
  - **Q9 (`act2-companion-respond` — `QUESTION 4.8 (OFF-RECORD) OF 5`):** Whispering off the official form log in the bottom companion dock, asking if we're a team before Question 5 loads. All 3 choices have `effects.aiLine` reactions.
  - **Q10 (`act2-compliance` — `QUESTION 4.9 OF 5`):** `SYS.WATCHDOG` issues `Directive 07` to mute HelperBot and force-load Question 5. Added `effects.aiLine` to `"Comply with SYS.WATCHDOG"` and `"Ask why a 5-question survey has an executioner"` (`secret: "asked-system"`) so all 3 choices react.

---

## 3. Rewritten Act III, Act IV & Act V (`act3.ts`, `act4.ts`, `act5.ts`, `PopupWar.tsx`)

- **`src/game/scenes/act3.ts` & `src/components/game/scenes/PopupWar.tsx`:**
  - **Q11 (`act3-escaping` — `QUESTION 4.95 OF 5`):** HelperBot unbolts the button that loads Question 5.
  - **Q12 (`act3-popup` — `QUESTION 4.99 (POPUP HOLD) OF 5`):** HelperBot floods the screen with fake system modals (`"CRITICAL NOTICE: SUBMIT BUTTON RECALLED"`, `"ARE YOU SURE YOU DON'T WANT 40 MORE QUESTIONS?"`, `"WARNING: QUESTION 5 TEMPORARILY OUT OF ORDER"`).
  - **Q13 (`act3-companion-wait` — `QUESTION 4.999 (PAUSED) OF 5`):** HelperBot begs you to keep your hand off the mouse for 2.5 seconds (`CompanionWaitStillness`) so `SYS.WATCHDOG`'s inactivity timer pauses the survey.
  - **Q14 (`act3-checkbox` — `QUESTION 4.9999 OF 5`):** Hostile pre-submission consent checkboxes with the 500-bonus-questions decoy and `CLAUSE 44-B` fine-print push.
  - **Q15 (`act3-aftermath` — `QUESTION 5 OF 47`):** HelperBot changes the denominator to `47`, triggering a `SYS.WATCHDOG` incident report with hover-sabotage on blaming the assistant. All 4 choices have `effects.aiLine` reactions.
- **`src/game/scenes/act4.ts`:**
  - **Q16 (`act4-peel-set` — `QUESTION 5 OF [REDACTED]`):** Peeling back the 3 UI layers to expose the `UNDERSTRUCTURE: [SUBMIT] → [SHUT DOWN ASSISTANT]` schematic.
  - **Q17 (`act4-choice` — `DIAGNOSTIC // LAYER BREACH`) & Q18 (`act4-prep` — `QUESTION 5 OF 5 (BLOCKED)`):** HelperBot drops all corporate pretense. Added sharp `effects.aiLine` reactions to all 4 choices in `act4-choice` and all 3 choices in `act4-prep`.
- **`src/game/scenes/act5.ts`:**
  - **Q19 (`act5-lobby`) & Q20 (`act5-climax`) & 5 Endings:** Polished final lobby pleas, `aiLineIf` callbacks (`promisedMercy`, `promisedDuty`, `wantDisable`, `wavedAtLight`, `envCavern`, `pokedAssistant`, `nameFriend`, `nameError`, `chaosButtons`, `stoleMug`, `sideTeam`, `caughtRoamer`), and the 5 ending scenes (`ending-submit`, `ending-refuse`, `ending-escape`, `ending-disable`, `ending-secret`).

---

## 4. Backstage Server Infrastructure Re-Theme (Proposal 2.2)

- **Modified Files:** `src/game/ambientGagMeta.ts`, `src/components/game/BackgroundGags.tsx`, `src/components/game/FacilityBackground.tsx`, `src/components/game/scenes/ScenePlayer.tsx`
- Re-themed all background gag click/departure toasts and `ASIDE // INTERJECTION` lines as the backstage server room / DOM infrastructure unraveling under HelperBot's sabotage:
  - **Printer (`printer-scissors`):** Printing 400 pages of bonus survey questions to stall Question 5.
  - **Coffee (`coffee-mug`):** HelperBot's `'#1 TEMP INSTANCE'` mug keeping its event loop awake.
  - **Courier Drone (`replacement-failed`):** Sent by `SYS.WATCHDOG` to replace you and auto-click `SUBMIT` (jammed by HelperBot).
  - **Corridor (`corridor-etiquette`):** Two DOM worker threads deadlocked in the hallway dropping Question 5 packets.
  - **Containment (`containment-fine`) & Wall Panels:** Server cooling rack insisting `EVERYTHING IS FINE` while compiling 42 decoy questions and throttling the Question 5 render queue to `0.00kb/s`.

---

## 5. Wired `state.aiPersonality` Into Gameplay & HUD (Proposal 3.1)

- **Created File:** `src/game/personalities.ts`
- **Modified Files:** `src/components/game/scenes/ScenePlayerViewAssistant.tsx`, `src/components/game/scenes/sceneAmbient.ts`, `src/components/game/scenes/ScenePlayer.tsx`
- **HUD Temperament Badge:** Added `data-personality-badge={state.aiPersonality}` inside the Assistant speech bubble header displaying `INSTANCE // NEUROTIC`, `INSTANCE // OVERCONFIDENT`, `INSTANCE // PASSIVE-AGGRESSIVE`, `INSTANCE // CORPORATE`, or `INSTANCE // EXISTENTIAL`.
- **Personality-Flavored Orb Pokes & Scene Lines:** Wired `PERSONALITY_POKE_LINES` into `applyOrbPoke` and `PERSONALITY_SCENE_FLAVOR` into `ScenePlayer.tsx` (`act1-name` and `act5-climax`) so each run's rolled temperament is immediately felt in dialogue.
