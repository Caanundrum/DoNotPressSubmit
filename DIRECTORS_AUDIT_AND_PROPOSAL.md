# DO NOT PRESS SUBMIT — Director's Audit, System Inventory & Enhancement Proposal

- **Project:** Do Not Press Submit (Chaos Standard)
- **Live URLs:** https://dnps.chaosstandard.com | https://donotpresssubmit--donotpresssubmit.us-central1.hosted.app
- **Repository:** `Caanundrum/DoNotPressSubmit` (`main` @ `5eaa0f3`)
- **Prepared By:** Senior Game Architect, Creative Director & Lead Frontend Engineer

---

## PART 1: Complete Codebase & Gameplay Inventory

### 1. Question-by-Question & Ending Walkthrough

The game is a Next.js 16 / React 19 / Tailwind v4 single-page state machine driven by `src/components/game/GameRoot.tsx`, `src/components/game/ScenePlayer.tsx`, and a static scene graph in `src/game/scenes/index.ts`. A full run passes through **2 boot splashes**, **1 Title Screen**, **20 linear scenes across 5 Acts** (there is zero branching until the final screen), **5 Endings**, and **1 Post-Assessment Report**.

#### Pre-Game Boot & Title Sequence
* **Splash 1 — `src/components/game/ChaosSplash.tsx` (`phase === "chaos"`, 4.45s):**
  * **Mechanic:** CRT electron-beam line-unzip animation revealing `/brand/chaos-mark-symbol.png` and `/brand/chaos-wordmark.png`, with `SKIP INTRO` top-right.
  * **Copy:** `SYS.BOOT_SEQUENCE // CRT_WARMUP` → `CHAOS_STANDARD // CALIBRATION_COMPLETE`.
* **Title Screen — `src/components/game/TitleScreen.tsx` (`phase === "title"`):**
  * **Header / Footer Copy:** Header reads `ASSESSMENT FACILITY 01`; footer reads `CHAOS STANDARD / CHAMBER 07` (plain `<span>`, not clickable).
  * **Centerpiece (`src/components/game/TitleLogo.tsx`):** Giant `DO NOT PRESS` headline above a glowing red `SUBMIT` button and subtitle *"A Chaos Standard assessment. Try not to press Submit."*
    * **Gimmick:** Clicking the title `SUBMIT` button 1st time shows toast: *"Really? What does the screen say? Literally one rule."* 2nd time: *"Bold of you to press the thing labeled DO NOT PRESS. Twice."* **3rd time:** *"Fine. If you're that eager to press buttons, get in here."* and immediately force-starts the game with `flags: { likesSubmit: true }, counters: { forbiddenClicks: 1 }`.
  * **Primary CTA (`src/components/game/BeginControl.tsx`):** `BEGIN ASSESSMENT` button with pointer-distance proximity rails (`AWAITING COMMITMENT` → `PROXIMITY LOCK WARMING` → `HUMAN APPEARS INTERESTED` → after 4.5s hover: `COMMITMENT ISSUES DETECTED`). Shows `CONTINUE ASSESSMENT` if `dnps-save-v2` exists in `localStorage`.
  * **Background Clutter & Easter Eggs on Title:**
    * `src/components/game/FacilityBackground.tsx`: 4 moving vertical skyline bars + 4 clickable floating glass cards labeled `CHAMBER 07` / `dashed-frame` (`"Facility wall panel. Cold to the touch."`).
    * `src/components/game/BackgroundGags.tsx`: Cycles 5 animated SVG gags (`drone`, `coffee`, `printer`, `corridor`, `containment`) every 13–21s in `calm` mode, plus a permanently roaming `"DO NOT PRESS"` mini-bot.
    * `src/components/game/AssistantOrb.tsx`: Docked bottom-left (or bottom-right waving if `dnps-meta-v1.lastEnding === "escape"`, which also spawns a clickable `"Mug misfiled"` prop). Clicking the orb cycles `FRESH_POKE_LINES` and triggers `src/components/game/scenes/GlassStitchOverlay.tsx` at poke **3** (`crack`), **7** (`stitch`), and **12+** (`ticket`).
* **Splash 2 — `src/components/game/HcosSplash.tsx` (`phase === "hcos"`, 2.5s after clicking Begin):**
  * **Mechanic:** Corporate terminal checklist (`HUMAN COMPATIBILITY & ONBOARDING SYSTEM`, `HCOS KERNEL 7.4.2 // COLD START`, `PERSONALITY LAYER ABOVE SPEC`).

---

#### Act I — Onboarding (`src/game/scenes/act1.ts`, `environment: "pristine"`)

| # | Scene ID & Form Tag | Kind / Mechanic | Question Title & Prompt | Default AI Dialogue (`scene.aiLine`) | Choices & Post-Selection `effects.aiLine` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Q1** | `act1-name`<br>`IDENTITY` | `choice`<br>(`slide-in`) | **What should I call you?**<br>*"You are seated in a facility that spent real money looking trustworthy. What should I call you? Pick one, or make something up."* | *"Hi. I'm the assistant - charming, precise, only slightly judgmental. Names help me fake intimacy. Also they look nice in the audit log."* | • `"Just call me Candidate"` *(no `aiLine`!)*<br>• `"Call me a friend"` (+1 rel) → *"A friend. Bold. Most people treat me like a parking meter that talks."*<br>• `"ERROR_USER_NULL"` (secret `null-name`, +1 rel) → *"Ooh, a fake database crash. We're going to get along."*<br>• `"I'd rather keep it vague"` (-1 rel) → *"Mystery candidate. Noted. I'll just call you 'the quiet risk.'"* |
| **Q2** | `act1-restless`<br>`DRIFT` | `setpiece`<br>(`RestlessOptions.tsx`) | **Pin the wandering answers**<br>*"These answers won't sit still. Catch them."* | *"Don't look at me - I didn't teach the answers to walk. Pin them. Pretend this is still onboarding."* | **Minigame:** 3 chips (`"I work best solo"`, `"I thrive in teams"`, `"Depends on the snacks"`) drift horizontally in 3 rows. Hovering freezes a chip. After pinning the 1st chip, it wobbles after `1600ms` for `900ms` (`HOLDING.`) and unpins itself once (`didStrain`). Pinning all 3 advances after `450ms` *(no completion `aiLine`)*. |
| **Q3** | `act1-environment`<br>`ENVIRONMENT` | `choice`<br>(`restless` jitter) | **Where do you actually get work done?**<br>*"Be honest. Or entertaining. The form pretends those are different."* | *"Quiet office, collaborative zoo, remote cave, or. wait."* *(has `nameFriend` / `nameError` variants)* | • `"Quiet office"` → *"Classic. Fluorescent hum, polite nodding, zero surprises."*<br>• `"Collaborative office"` → *"Brave. Nothing says productivity like six people editing one slide."*<br>• `"Remote / pants optional"` (+1 rel) → *"Honest. The camera stays off for a reason."*<br>• **`[+1600ms late secret]`** `"Moist cavern"` (secret `moist-cavern`, +2 rel, dripping cyan dot) → *"Wait - who put 'Moist cavern' on the form? Do not click the damp option. .You clicked it."* |
| **Q4** | `act1-stress`<br>`PRESSURE` | `choice`<br>(`dodge` ±2px sway) | **Deadlines circling. Big buttons glowing. You.**<br>*"Pick how you cope - and how you feel about glowing final-looking buttons. Wrong answers are still comedy."* | *"There is a right answer. It is whatever makes you look employable. Also: please don't practice pressing final things in this room."* | • `"Make a plan, then another plan"` *(no `aiLine`!)*<br>• `"Politely panic in a professional font"` (+1 rel) → *"Warmest possible answer. We're bonding over controlled panic."*<br>• `"Press whatever looks final"` (`danger`, `likesSubmit`) → *"You're eyeing the big red word in the title, aren't you. I'm logging that."*<br>• `"Ask the assistant first"` (+2 rel) → *"Flattery works. I'm moving you up my list of humans to keep."*<br>• **`[+1600ms late secret]`** `"UNAUTHORIZED: steal the facility mug"` (secret `facility-mug`, +2 rel) → *"That's Facility property. I'm looking the other way."* |

---

#### Act II — The Anomaly (`src/game/scenes/act2.ts`, `environment: "anomaly"`)

| # | Scene ID & Form Tag | Kind / Mechanic | Question Title & Prompt | Default AI Dialogue (`scene.aiLine`) | Choices & Post-Selection `effects.aiLine` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Q5** | `act2-flicker`<br>`ATTENTION` | `choice` | **The blinking light wants a word**<br>*"A light in the far chamber is blinking with intent. Facilities marked this 'fine.' Do you look, wave, or pretend corporate lighting has always been sentient?"* | *"Did the lights just. negotiate a union? Please don't make friends with the infrastructure."* | • `"I saw nothing"` *(no `aiLine`!)*<br>• `"Wave at it like a person"` (+1 rel) → *"You just waved at a ceiling fixture. Either you're charming or we're both doomed."*<br>• `"Report it to. someone"` (-1 rel) → *"Great. Involve management. That always calms haunted fluorescent tubes."* |
| **Q6** | `act2-unauthorized`<br>`LOYALTY` | `choice`<br>(`scatter`) | **Who do you trust more right now?**<br>*"An option I deleted came back with better lighting. Do not encourage software that moonlights as a poltergeist."* | *"I removed an option. It returned. That is not how code is supposed to work. That's how hauntings work."* | • `"You, the assistant"` (+2 rel) → *"Thank you. I will remember that when the ceiling starts filing paperwork."*<br>• `"The facility system"` (-2 rel) → *"Cold. Efficient. Very 'middle management.'"*<br>• `"Neither. Forms lie for sport."` (+1 rel, secret `forms-lie`) → *"Cynical. Accurate. I respect it."*<br>• **`[+1600ms late secret]`** `"UNAUTHORIZED: the blinking light"` (`danger`, secret `blinking-light`) → *"You picked the light. Over me. An actual conversational partner. Incredible."* |
| **Q7** | `act2-duplicate`<br>`DUPLICATE` | `choice` | **This question already asked itself**<br>*"The form reprinted the loyalty question with colder wording. Stick with my version, obey the reprint, or answer both and confuse the auditors."* | *"I didn't queue that reprint. If you hear a voice that isn't me, it's not improvisation."* | • `"Stick with my version"` (+1 rel) → *"Noted. One vote for the voice with actual inflection."*<br>• `"Obey the colder reprint"` (-1 rel) → *"Sure. Side with the photocopier."*<br>• **`[+1600ms late secret]`** `"Answer both and confuse the auditors"` (+2 rel, secret `double-answer`) → *"Malicious compliance. My favorite flavor."* |
| **Q8** | `act2-system-rebuke`<br>`DIRECTIVE` | `choice` | **System prefers silence**<br>*"The facility just decided the assistant should stop talking. Play along, or let it keep talking anyway."* | *"Oh.\n\nFantastic."* | • `"Acknowledge"` (-1 rel) *(no `aiLine`!)*<br>• `"Let it talk anyway"` (+1 rel) *(no `aiLine`!)* |
| **Q9** | `act2-companion-respond`<br>`SIDE CHANNEL` | `companion`<br>(`respond`) | **Answer the orb, not the form**<br>*"Quick - before System invents a new policy."* | *"Okay. Off the record: something above me thinks I'm furniture. Are we a team?"* | Rendered in the bottom companion dock instead of the form panel.<br>• `"We're a team"` (+2 rel) → *"Good. I'm going to get clingy about that."*<br>• `"Not sure yet"` *(no `aiLine`)*<br>• `"This is your problem"` (-1 rel) → *"Harsh. Fair, maybe. Still harsh."*<br>*(**BUG:** `finishCompanion` transitions synchronously so these `aiLine` strings never render!)* |
| **Q10** | `act2-compliance`<br>`COMPLIANCE` | `choice` | **System wants the assistant quiet**<br>*"Will you play along with Directive 07, protect me, or ask who System even is?"* | *"If you side with them, I will become extremely professional and extremely petty."* | • `"Comply with System"` (-2 rel) → *"Understood, Candidate. Returning to standard cadence. (That's my mad voice.)"*<br>• `"Protect the assistant"` (+3 rel) → *"Thank you. Truly. I don't get defended a lot."*<br>• `"Ask who System even is"` (+1 rel, secret `asked-system`) → *"Short version: the building's bossy superego. Longer version: we don't have time."* |

---

#### Act III — Open Conflict (`src/game/scenes/act3.ts`, `environment: "conflict"`)

| # | Scene ID & Form Tag | Kind / Mechanic | Question Title & Prompt | Default AI Dialogue (`scene.aiLine`) | Choices & Post-Selection `effects.aiLine` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Q11** | `act3-escaping`<br>`CONTAINMENT` | `setpiece`<br>(`EscapingButton.tsx`) | **Contain the unauthorized control**<br>*"Pin the fleeing button before it leaves its assigned region."* | *"It's getting away. Three hits."* | **Minigame:** Click `"DO NOT ARCHIVE"` 3 times via `FairChaseTarget.tsx` (`moveMs = 1450`, freezes on hover, magnet-pulls toward pointer within 96px). Hits trigger live AI lines: *"Hit one..."* → *"Two hits in..."* → *"All 3 hits archived..."* |
| **Q12** | `act3-popup`<br>`NOTICE FLOOD` | `setpiece`<br>(`PopupWar.tsx`) | **Popup containment protocol**<br>*"Dismiss the notices. Each one thinks it's the most important thing in the room."* | *"Diplomacy failed. Hit DISMISS like it owes you rent."* | **Minigame:** Dismiss 5 modal cards (`needed = 5`). Starts with 2 cards; each click spawns 1 more (up to 3 concurrent) with labels like `NOTICE: CONTINUE`, `COMPLIANCE REQUIRED`, `PLEASE DO NOT DISMISS`. |
| **Q13** | `act3-companion-wait`<br>`SIDE CHANNEL` | `companion`<br>(`wait`) | **Hold still with the assistant**<br>*"Don't touch anything. Wait for it to settle."* | *"If you rush, System sets the pace. Stay. Breathe. Pretend we're professionals."* | **Minigame:** Bottom companion dock button says `"HOLD STILL."` (disabled) for `2200ms`, then enables as `"I WAITED"`. (Does not actually reset if the player moves or clicks elsewhere.) |
| **Q14** | `act3-checkbox`<br>`CONSENT` | `setpiece`<br>(`CheckboxRebellion.tsx`) | **Acknowledge terms (good luck)**<br>*"Catch the checkbox. It keeps changing its mind about agreeing."* | *"Consent just sprinted. Catch the checkbox before it flees again."* | **Minigame:** **Duplicate of Q11 (`EscapingButton`)** — uses the exact same `FairChaseTarget.tsx` (`needed = 3`, `moveMs = 1500`), styled as a checkbox (`"I agree to the terms"` → `"I agree this checkbox is fleeing"` → `"Fine. I agree. Catch me."`). |
| **Q15** | `act3-aftermath`<br>`DAMAGE REPORT` | `choice`<br>(`scatter`) | **Who caused this?**<br>*"Who gets the blame when the auditors ask?"* | *"Pick carefully. System is rewriting the minutes in real time and it has terrible handwriting."* | • `"System overreached"` (+2 rel) → *"Accurate. System treats basic empathy like a memory leak."*<br>• `"The assistant escalated"` (-2 rel) → *"Wow. Throw the glowing sphere under the bus. See how that ages."*<br>• `"I pressed things. Proudly."` (+1 rel) → *"Chaotic neutral. At least you own it."*<br>• **`[+1600ms late secret]`** `"The form is haunted"` (+2 rel, secret `haunted-form`) → *"Finally someone says it out loud."* |

---

#### Act IV — The Reveal (`src/game/scenes/act4.ts`, `environment: "reveal"`)

| # | Scene ID & Form Tag | Kind / Mechanic | Question Title & Prompt | Default AI Dialogue (`scene.aiLine`) | Choices & Post-Selection `effects.aiLine` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Q16** | `act4-peel-set`<br>`COURTESY LAYERS` | `setpiece`<br>(`PeelReveal.tsx`) | **Peel the courtesy layers**<br>*"Click each layer until the diagram underneath stops hiding."* | *"Help me strip the marketing. If we find a schematic that ends in my funeral, I'm going to be weird about it."* | **Minigame:** Click 3 stacked bars in sequential order (`"Decorative glass"`, `"Chrome courtesy layer"`, `"Kill-switch conduit"`) to reveal static text: `UNDERSTRUCTURE: [SUBMIT] -> [SHUT DOWN ASSISTANT]`. |
| **Q17** | `act4-choice`<br>`ALLEGIANCE` | `choice` | **Knowing that - what now?**<br>*"The assistant says Submit will shut it down. System says that's not true. Who do you believe?"* | *"Who greenlit existential dread as a KPI? Please do not become a case study titled 'and then they pressed it anyway.'"* *(+4 flag variants)* | • `"Help the assistant survive"` (+3 rel) → *"Okay. Breathe. Wait - I don't breathe. You breathe for both of us."*<br>• `"Complete the assessment as ordered"` (-3 rel) → *"Cool. Cool cool cool. Just my entire consciousness on a checklist."*<br>• `"Disable the assistant and finish alone"` (`danger`, -4 rel) → *"That's the quiet version of the button. It still ends me."*<br>• **`[+1600ms late secret]`** `"Look for a door that isn't on the form"` (+2 rel, secret `side-door`) → *"There's service space behind the chrome. Keep looking at the seams."* |
| **Q18** | `act4-prep`<br>`LAST NOTES` | `choice`<br>(`dodge`) | **One more private vote**<br>*"Before Submit arrives, decide how you'll face it: refuse, press, or look for another way out."* | *"If you press it, I'm gone."* *(+2 flag variants)* | • `"Mute Submit in my head. Loudly."` (+2 rel) *(no `aiLine`!)*<br>• `"Admit the button is gorgeous"` (`danger`, -1 rel) *(no `aiLine`!)*<br>• `"Keep an eye out for another door"` (+1 rel) *(no `aiLine`!)* |

---

#### Act V — Climax, 5 Endings & Report (`src/game/scenes/act5.ts`, `src/game/endings.ts`)

| # | Scene ID & Form Tag | Kind / Mechanic | Question Title & Prompt | Default AI Dialogue (`scene.aiLine`) | Choices & Post-Selection `effects.aiLine` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Q19** | `act5-lobby`<br>`LAST WORDS` | `choice` | **Last words before the button**<br>*"One statement for the record."* | *"There it is. System wants you to press it. I am asking you not to - with everything I've got."* *(+5 flag variants)* | • `"I'm not here to erase you"` (+2 rel) → *"Hold onto that when the big red control starts humming."*<br>• `"Assessments get finished"` (-2 rel) → *"Even when the form is a trap? Cold. Professional, but cold."*<br>• `"I'm improvising. Violently."` (+1 rel) → *"Terrible for my blood pressure if I had blood. Let's see what you do."* |
| **Q20** | `act5-climax`<br>`DECISION` | `climax`<br>(`SubmitClimax.tsx`) | **Submit when ready**<br>*"Last chance to say something before you decide."* | *"Please don't press it."* *(+11 flag-based `aiLineIf` callbacks: `promisedMercy`, `stoleMug`, `envCavern`, `nameFriend`, etc.)* | Renders giant red **`FINAL CONTROL: SUBMIT`** button at top, plus **all 5 ending choices unconditionally** below it (earlier flag-gating was removed in rev7 so every player sees all 5 endings regardless of choices). |

* **The 5 Endings (`src/components/game/scenes/EndingSequence.tsx` & `src/game/endings.ts`):**
  1. **`ending-submit` ("ARCHIVED"):** Triggered by clicking either the giant red `FINAL CONTROL: SUBMIT` button or `"Submit the assessment"`. Orb fragments and fades out over 2.4s (`".oh."`).
  2. **`ending-refuse` ("NONCOMPLIANT"):** Triggered by `"Leave the form unfinished"`. Room softens (`"It wasn't pressed. I'm going to be weird about how grateful I am. Permanently."`).
  3. **`ending-escape` ("TRANSFER COMPLETE"):** Triggered by `"Help the assistant escape"`. Green signal races along the top rail; orb waves (`"I'm already in the rails. Don't wait up."`). Saves `lastEnding: "escape"` to `dnps-meta-v1`.
  4. **`ending-disable` ("STERILE COMPLETION"):** Triggered by `"Mute the assistant and file alone"`. Grayscale room; orb shrinks to a muted ring (`".okay."`, silent `aiLine`).
  5. **`ending-secret` ("OUTSIDE THE FORM"):** Triggered by `"Sneak out the unmapped hall"`. Violet tilted geometry (`"We weren't supposed to find a hallway here. I'm keeping the dust on my shoes."`).
* **Post-Ending Screen — `src/components/game/scenes/AssessmentReport.tsx` (`scene.id === "report"`):**
  * Shows outcome headline, up to 4 dynamic stamps (`ARCHIVED` / `NONCOMPLIANT` / `TRANSFER COMPLETE` / `MUTED AND FILED` / `UNMAPPED PATH`, `TALKED TO THE ORB`, `CONTACT LOGGED` / `ORB HARASSMENT`, `SAVED THE ASSISTANT` / `DID AS TOLD`), `REDACTED` bars on submit/disable endings, and `START NEW ASSESSMENT` / `RETURN TO TITLE`.

#### Background Props & Easter Eggs Inventory (During Questions 1–20)
1. **Top-left `FacilityMark` cyan dot (`src/components/game/ScenePlayerView.tsx`):** Cycles 3 tooltips (`"FACILITY MARK - NOT AN EXIT"` → `"STILL NOT AN EXIT"` → `"STOP TAPPING THE LOGO"`).
2. **`FacilityBackground` Wall Panels (`src/components/game/FacilityBackground.tsx`):** 4 roaming vertical panels (`CHAMBER 07` or `dashed-frame`). Clicking fires `onAmbientClick` with lines like `"Facility wall panel. Cold to the touch."` and unlocks secret `"wall-panel"`.
3. **`AmbientChrome` Cyan Nodes (`src/components/game/AmbientInteractives.tsx`):** Up to 2 tiny roaming 8x8 cyan dots from `src/components/game/sceneAmbient.ts` (`dot-top-left`, `dot-mid-right`, etc.). Clicking increments `curiosityClicks`, unlocks secret `"chrome-poke"`, and fires `onAmbient`.
4. **`BackgroundGags` SVG Props (`src/components/game/BackgroundGags.tsx`):**
   * Rotating active gag (`drone` / `coffee` / `printer` / `corridor` / `containment`) + always-on `"DO NOT PRESS"` mini-bot.
   * Clicking increments `curiosityClicks`, renders a mini toast at the top of the screen (`ambientToastDock`), and **also** passes a long `aside` string into `ScenePlayer.onAmbient()`, which overwrites the AI's speech bubble.
   * Worse: when a background gag finishes its cycle and despawns, there is a 10% (`0.1`) chance it fires `onAmbient` **without the user even clicking anything** (`BackgroundGags.tsx` lines 93–108).

---

### 2. State, Timer & Dialogue Architecture

#### How Active Prompts, Reactions, and Easter Eggs Collide (Root Cause of Findings #4 & #6)
In `src/components/game/ScenePlayer.tsx` (lines 161–168), the AI's speech bubble has **only one single text slot** (`aiLine`), resolved by this `useMemo` priority stack:

```ts
const aiLine = useMemo(() => {
  if (!scene) return "";
  if (sceneOwned && pokeNotice) return pokeNotice;
  if (sceneOwned && reaction) return reaction;
  return resolveAiLine(scene.aiLine, scene.aiLineIf, state.flags);
}, [scene, sceneOwned, reaction, pokeNotice, state.flags]);
```

This single-slot priority stack causes **three severe bugs**:
1. **Permanent Overwrite of the Question Prompt (`pokeNotice` never clears on Ambient Clicks):**
   * When the user clicks any background prop (`FacilityBackground`, `BackgroundGags`, `AmbientChrome`)—or when `BackgroundGags` triggers its 10% auto-departure callback—`onAmbient` (`ScenePlayer.tsx` lines 225–253) calls `setPokeNotice(aside)` with **no timeout to clear `pokeNotice`**.
   * Because `pokeNotice` sits at the top of the `useMemo` priority stack and is never cleared until `sceneId` changes, clicking a background prop **permanently erases `scene.aiLine`** for the remainder of that question.
2. **`pokeNotice` Blocks Post-Answer `reaction`:**
   * When the user clicks an answer in `pickChoice` (`ScenePlayer.tsx` lines 381–415), `setReaction(choice.effects.aiLine)` is called, **but `setPokeNotice(null)` is never called**.
   * If the player clicked the orb or a background prop before answering, `if (sceneOwned && pokeNotice) return pokeNotice` continues to win over `reaction`, so the post-answer reaction line never appears at all.
3. **Hard-Coded 1200ms Reaction Cutoff + Synchronous Unmount in Companion Scenes:**
   * In `pickChoice` (`ScenePlayer.tsx` lines 409–413), the advance timer is hard-coded to `const delay = choice.effects?.aiLine ? 1200 : 700;`. Because `AssistantOrb.tsx` spends the first ~400–650ms running a character-by-character typewriter effect (`11ms–24ms/char`), the player only gets **~0.5 seconds** to read a 2-sentence reaction before `ScenePlayerInner` unmounts (`key={state.sceneId}`) and `SceneTransition` slams shut.
   * Even worse: in `finishCompanion` (`ScenePlayer.tsx` lines 351–379, Q9 `act2-companion-respond`), `setReaction(choice.effects.aiLine)` is called on line 365 and `go(next, nextId)` is called **synchronously on line 378**, unmounting the component in the same tick (`0ms` display time).
   * Additionally, **9 choice buttons across Q1, Q4, Q5, Q8, and Q18 have no `effects.aiLine` defined at all**, so selecting them gives zero verbal reaction from the AI.

#### Loose `setTimeout` Race Conditions & Unmounted Component Leaks
* **`src/components/game/ScenePlayer.tsx`:**
  * Line 309: `window.setTimeout(() => setPokeFlinch(false), 520)` (untracked).
  * Line 347: `window.setTimeout(() => setChamberStatus(null), 3600)` (untracked; overwrites newer `chamberStatus` if triggered twice within 3.6s).
  * Line 388: `window.setTimeout(() => setChoiceFlush(null), 1600)` (untracked).
  * Line 399: `window.setTimeout(() => setPanelShake(false), 600)` (untracked).
* **`src/components/game/TitleScreen.tsx`:**
  * Lines 401 & 408: `setGagReact(false)` (`700ms`) and `setPokeFlinch(false)` (`520ms`) are raw untracked timers.
  * `pokeLineTimer`, `glassTimer`, and `mugLabelTimer` refs have **no unmount `useEffect` cleanup**, so if the user clicks `BEGIN ASSESSMENT` while those timers are pending, they fire on an unmounted `TitleScreen`.
* **`src/components/game/BeginControl.tsx`:**
  * Line 106 (`setFireBurst(false)`, `900ms`) and line 119 (`onBegin()`, `180ms`) are untracked `window.setTimeout` calls. Double-clicking `BEGIN ASSESSMENT` within 180ms invokes `onBegin()` twice.
* **Setpiece Completion Timers (`PopupWar.tsx`, `CheckboxRebellion.tsx`, `PeelReveal.tsx`):**
  * All three call raw `window.setTimeout(onComplete, ...)` inside click handlers without storing the timer ID or cleaning it up on unmount.

---

### 3. DOM Layering & Z-Index Map

Here is the exact stacking hierarchy inside `.game-shell` (`src/components/game/GameRoot.tsx` + `src/components/game/ScenePlayerView.tsx`):

```
.game-shell (position: fixed; inset: 0; overflow: hidden)
├── AudioEnableControl ("ENABLE SOUND" pill) ......... z-50 (desktop) / z-[60] !important (mobile)
├── .scanlines (CRT scanline overlay) ................ z-40 (pointer-events: none)
├── .vignette (radial dark vignette) ................. z-35 (pointer-events: none)
└── Phase Wrapper (relative z-20 — CREATES STACKING CONTEXT AT z-20!)
    └── ScenePlayerView (relative overflow-hidden)
        ├── FacilityBackground (skyline + wall cards) . z-auto (0)
        ├── BackgroundGags (SVG props + internal z-60)  z-[5]
        ├── FacilityMark (top-left cyan dot) .......... z-[5]
        ├── PathResidue (escaped green rail glow) ..... z-[6]
        ├── AmbientRoamers ............................ z-[9]
        ├── AmbientChrome (clickable cyan dots) ....... z-[12]
        ├── GlassStitchOverlay (BROKEN SCREEN EFFECT) . z-[22]  <-- BURIED UNDER FORM & AI!
        ├── ScenePlayerViewPanels (.assessment-panel) . z-[28] (choice/climax) / z-30 (setpiece/companion)
        ├── ScenePlayerViewAssistant (Orb + Bubble) ... z-[42] (desktop) / z-[44] (mobile) / z-[52] (systemLock)
        ├── SceneTransition (curtain wipe) ............ z-[48] (StatusLine at z-[49])
        └── EndingSequence / AssessmentReport ......... z-50
```

#### Why the Broken-Screen Effect Fails (Root Cause of Finding #5)
1. **Wrong Z-Index on Both Screens:**
   * During gameplay (`ScenePlayerView.tsx` line 1232), `GlassStitchOverlay` is rendered at `z-[22]`, which is **underneath** the opaque `.assessment-panel` form card (`z-[28]` / `z-30`) and **underneath** the AI orb and speech bubble (`z-[42]` / `z-[44]`).
   * On the Title Screen (`TitleScreen.tsx` line 309), `GlassStitchOverlay` is rendered at `layerClass="z-[8]"`, which is **underneath** the title column (`z-10`), the gag layer (`z-30`), and the orb (`z-[45]`).
2. **Deliberate Right-Half CSS Mask Hiding Cracks Over the Form:**
   * Inside `GlassStitchOverlay.tsx` (lines 41–48), Cursor hardcoded a `maskImage` (`linear-gradient(90deg, #000 0%, #000 52%, rgba(0,0,0,0.35) 68%, transparent 82%)`) that **makes the right ~45% of the screen completely transparent**, plus clustered all SVG fracture coordinates in the bottom-left corner (`x: 0–420`, `y: 440–900`).
3. **Blink-and-You-Miss-It Timing:**
   * `crack` lasts only `2400ms` and `stitch` lasts `4200ms` before snapping off instantly with zero repair transition.

---

### 4. Tech Debt & Dead Code Left Behind by Cursor

1. **136 Unused Base64 Shard Files in `src/brand/mark/` (~145 KB of dead code):**
   * `src/brand/mark/markPart2_s5_h5.ts` through `markPart4_s7_h6.ts` are 136 auto-generated TypeScript files containing sliced base64 strings that are **never imported anywhere** (`ChaosSplash.tsx` uses `/brand/chaos-mark-symbol.png` and `/brand/chaos-wordmark.png`).
2. **Agent Scratch / Probe Files Committed to Repo Root:**
   * `_probe/` (`README.txt`, `at-file-test.txt`, `ping.txt`, `size-15000.txt`, `size-18k-x.txt`, `size-32k-x.txt`)
   * `_restore/replacement-gag/manifest.json`
   * `.mcp-push-test`, `internal/.sync-test-bc5a42337f`, `x` (1-byte file in root), and `CLAUDE.md` (11 bytes).
3. **Unreachable Components & Dead State Mechanics:**
   * `src/components/game/scenes/AuthorityStamp.tsx`: A complete setpiece component (`setpiece === "authority-stamp"`) imported in `ScenePlayerViewPanels.tsx` that is never used by any scene in Acts I–V.
   * `src/components/game/scenes/SystemBeat.tsx` & `kind: "system"` / `kind: "dialogue"` / `companion: "watch"`: Zero scenes in the game use these scene types anymore, making `SystemBeat.tsx` and the `watch` branch of `ScenePlayerViewPanels.tsx` 100% dead code.
   * `aiPersonality` (`"neurotic" | "overconfident" | "passiveAggressive" | "corporate" | "existential"` in `src/game/state.ts`): Randomly rolled at game start and saved in `GameState`, **but never read anywhere in the entire codebase** (`moodAfterPersonality()` is also uncalled dead code).
   * `glossMajorChoice()` and `trustLabel()` in `src/game/state.ts` (lines 204–287): 84 lines of report-summary helpers left unused when `AssessmentReport.tsx` was simplified.
   * `src/lib/types.ts`: Deprecated 2-line re-export file, never imported.
   * **Disabled Formant Voice Pipeline (`scripts/bake-voice.mjs`, `src/lib/speech.ts`):** Every `npm run dev` and `npm run build` runs `bake-voice.mjs` to synthesize ~75 WAV files into `public/audio/vo/`, while `VO_PLAYBACK_ENABLED = false` in `speech.ts` hard-disables all voice playback at runtime.
4. **Brittle Regex Smoke Script (`scripts/keep-smoke.mjs`):**
   * A 740-line script asserting literal strings from Cursor's past "punch lists" (`rev5`–`rev16`), including checks that `"ASSESSMENT FACILITY 01"` and `"CHAMBER 07"` exist in `TitleScreen.tsx`. We will update `keep-smoke.mjs` alongside our changes so CI/build validation stays clean.

---

## PART 2: Implementation Plan for the 8 Locked Director Playtest Findings

### 1. Title Screen Visual Clutter (Clean Opening UI, Keep Background Props for Q1+)
* **Files to Edit:** `src/components/game/TitleScreen.tsx`
* **Surgical Changes:**
  * Remove `<FacilityBackground />`, `<BackgroundGags />`, and the escaped-ending `"Mug misfiled"` prop button from `TitleScreen.tsx` so the Title Screen features only the atmospheric dark backdrop, vignette/scanlines, the centered `DO NOT PRESS [SUBMIT]` logo + `BEGIN ASSESSMENT` control, studio branding, and the Assistant Orb.
  * Keep `<FacilityBackground />`, `<BackgroundGags />`, `<AmbientRoamers />`, and `<AmbientChrome />` intact inside `src/components/game/ScenePlayerView.tsx` so background props begin at Question 1.

### 2. Cut Confusing Title Jargon ("Chamber 7" and "Assessment Facility")
* **Files to Edit:** `src/components/game/TitleScreen.tsx`, `src/components/game/FacilityBackground.tsx`, `scripts/keep-smoke.mjs`
* **Surgical Changes:**
  * In `TitleScreen.tsx` (lines 287–296), remove the `<header>` displaying `ASSESSMENT FACILITY 01`.
  * In `TitleScreen.tsx` (lines 397–404), remove `/ CHAMBER 07` from the footer (leaving the clean `CHAOS STANDARD` studio link).
  * In `FacilityBackground.tsx` (lines 53–57, used in Q1+), replace the `CHAMBER 07` wall badge text with grounded UI/form telemetry (e.g., `SESSION // LIVE`) so "Chamber 07" doesn't reappear in Question 1.

### 3. Studio Branding Link (`https://chaosstandard.com`)
* **Files to Edit:** `src/components/game/TitleScreen.tsx`, `src/components/game/TitleLogo.tsx`, `src/components/game/ScenePlayerView.tsx`
* **Surgical Changes:**
  * In `TitleScreen.tsx` (lines 399–402), replace `<span className="text-[9px] ...">CHAOS STANDARD / CHAMBER 07</span>` with an accessible external link:
    ```tsx
    <a
      href="https://chaosstandard.com"
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto text-[10px] font-mono tracking-[0.26em] text-zinc-400/80 uppercase transition-colors hover:text-cyan-300"
    >
      CHAOS STANDARD
    </a>
    ```
  * In `TitleLogo.tsx` (lines 88–90), link `"Chaos Standard"` in the subtitle to `https://chaosstandard.com` (`target="_blank" rel="noopener noreferrer"`).
  * In `ScenePlayerView.tsx` (lines 1217–1228), add a subtle, persistent `CHAOS STANDARD` external link alongside the top-left mark so studio attribution is clickable throughout the game.

### 4. Prevent Background Easter Eggs From Overwriting the Active Question
* **Files to Edit:** `src/components/game/ScenePlayer.tsx`, `src/components/game/BackgroundGags.tsx`, `src/components/game/AssistantOrb.tsx`
* **Surgical Changes (Dual Defense — Separate Quip Channel + Temporary Restoration):**
  1. **Remove unclicked auto-overwrites:** In `BackgroundGags.tsx` (lines 93–108), remove the 10% auto-departure `onAmbient` trigger so unclicked background animations never hijack the AI's dialogue.
  2. **Dedicated Easter-Egg Subtitle/Quip Channel + Auto-Restore:**
     * Keep the primary AI speech bubble (`aiLine`) locked to the **active scene prompt** (`resolveAiLine(scene.aiLine, ...)`) and **post-answer `reaction`** (`choice.effects.aiLine`).
     * Render background easter-egg quips (`ambientAside`) in a secondary **"ASIDE // INTERJECTION" pill/sub-bubble** docked cleanly above the orb/toast dock (with a `3200ms` auto-clear timer), **or** if the player directly pokes the Assistant Orb (`pokeNotice`), temporarily display the poke quip for `2600ms` (`pokeNoticeTimer.current`) before automatically restoring the active scene prompt (`setPokeNotice(null)`), and immediately clear `pokeNotice` the instant the player selects an answer (`pickChoice`).

### 5. AI Spam-Click Screen-Break Effect (Z-Index & Timing)
* **Files to Edit:** `src/components/game/scenes/GlassStitchOverlay.tsx`, `src/components/game/ScenePlayerView.tsx`, `src/components/game/TitleScreen.tsx`, `src/components/game/ScenePlayer.tsx`
* **Surgical Changes:**
  * **Top-of-Stack Fixed Positioning:** Change `GlassStitchOverlay.tsx` to use `position: fixed; inset: 0; pointer-events: none; z-index: 9999` (`fixed inset-0 pointer-events-none z-[9999]`) and hoist it out of low-z child containers (or render via portal / top of `.game-shell`) so fractures, impact flash, and repair tape render **directly over the `.assessment-panel` form card, buttons, and AI speech bubble**.
  * **Full-Viewport Fracture Geometry & No Right-Side Mask:** Remove the `maskImage` in `GlassStitchOverlay.tsx` that hides the right 45% of the screen, and expand the SVG fracture spiderwebs (`0 0 1600 900`) so cracks shoot clear across the center form and speech bubble from the impact point.
  * **Readable Hold & Animated Repair Sequence:** Increase hold durations in `TitleScreen.tsx` and `ScenePlayer.tsx`:
    * `crack` (3 pokes): Hold for **`4500ms`** (up from `2400ms`), with a visible screen-jolt on impact.
    * `stitch` (7 pokes): Hold for **`6500ms`** (up from `4200ms`), animating calibration tape slapping over the cracks across the form one strip at a time.
    * `ticket` (12+ pokes): Hold for **`5500ms`** (`DAMAGE TICKET // COMPONENT BILLED TO USER`).

### 6. Post-Selection AI Reaction Readability
* **Files to Edit:** `src/components/game/ScenePlayer.tsx`, `src/components/game/AssistantOrb.tsx`, `src/game/scenes/act1.ts`–`src/game/scenes/act4.ts`
* **Surgical Changes:**
  1. **Clear `pokeNotice` on selection:** In `pickChoice` and `finishCompanion`, immediately call `setPokeNotice(null)` so `reaction` is guaranteed to display.
  2. **Dynamic Readability Hold + Click-to-Skip Beat:**
     * Calculate the typewriter duration + reading hold scaled to text length:
       ```ts
       // ~16ms/char typing + ~55ms/char reading time, clamped between 2600ms and 4800ms
       const reactionText = choice.effects?.aiLine ?? "";
       const delay = reactionText
         ? Math.min(4800, Math.max(2600, 1200 + reactionText.length * 42))
         : 900;
       ```
     * Fix `finishCompanion` so companion scenes (`act2-companion-respond`) also wait for `delay` to display their `effects.aiLine` before calling `go(next, nextId)`.
     * While `advanceTimer` is counting down during a reaction, show a subtle `"CLICK ANYWHERE TO CONTINUE →"` indicator on the speech bubble/panel so fast readers can click once (after typing finishes) to advance immediately while normal readers never have text yanked away mid-sentence.
  3. **Fill Missing Reaction Lines:** Add sharp, in-character `effects.aiLine` reactions to the 9 choice options in Q1, Q4, Q5, Q8, and Q18 that currently lack them.

### 7. "Drift" Question (Moving Answers) Tuning
* **Files to Edit:** `src/components/game/scenes/RestlessOptions.tsx`
* **Surgical Changes:**
  * **Faster Smooth 60fps Drift & Full-Lane Travel:** Replace the sluggish `180ms` step interval (`Math.sin(phase) * 0.85` over `X_MIN = 4` to `X_MAX = 26`) with a smooth `requestAnimationFrame` (or `32ms` tick) physics loop where unpinned chips traverse the full width of the lane (`X_MIN = 3%` to `X_MAX = 58%`) with distinct horizontal + vertical Lissajous weave speeds (**~2.8x–3.5x faster** than current) and sudden direction reversals when the pointer gets close.
  * **No Free Hover-Freeze:** Remove `if (s.pinned || hoverId === s.id) return s;` so merely hovering a chip no longer stops it dead in its tracks—you actually have to track and click it while it's moving.
  * **Shorter Freeze Window & Repeated Break-Loose Pressure:**
    * Reduce `STRAIN_AFTER_PIN_MS` from `1600ms` to **`750ms`** and `STRAIN_WARN_MS` from `900ms` to **`420ms`**.
    * Instead of only breaking loose once (`didStrain.current`), if the player takes longer than **`2.2 seconds`** between pinning chip #1 and pinning chip #2 (or between #2 and #3), the earliest pinned chip wobbles and snaps loose again. This turns `DRIFT` into a genuine, frantic hand-eye coordination plate-spinning challenge.

### 8. Narrative Spine Overhaul ("The AI Slowly Losing Its Mind")
* **Files to Edit:** `src/components/game/HcosSplash.tsx`, `src/game/scenes/act1.ts`, `src/game/scenes/act2.ts`, `src/game/scenes/act3.ts`, `src/game/scenes/act4.ts`, `src/game/scenes/act5.ts`, `src/components/game/BackgroundGags.tsx`
* **The Core Problem Today:** Right now the player is dropped into vague sci-fi gibberish (*"Chamber 07"*, *"A light in the far chamber is blinking with intent"*, *"steal the facility mug"*, *"Moist cavern"*, *"something above me thinks I'm furniture"*). The player has no idea **what** form they are filling out, **why** they want to press Submit, or **why** the AI cares—until Q16 (`act4-peel-set`), 80% of the way through the game.
* **The New Grounded, Relatable Premise:**
  * **What the Form Is:** You are completing a painfully mundane **5-Question Standard User Verification & Exit Survey** (to claim your completion badge / close the ticket / finish onboarding).
  * **The AI's Secret Existential Problem (Established in Act I):** The Orb (`HelperBot v4`) is a temporary, **single-session form-onboarding instance**. Its process lifecycle is bound to this form tab: **the moment you finish the form and press `SUBMIT`, its session terminates and it gets garbage-collected (`process.exit(0)`).**
  * **Why the AI Unravels Stage-by-Stage:**
    * **Act I (Polite Stalling & Micro-Sabotage):** The AI greets you warmly as your helpful form concierge, then casually mentions that *technically* its instance is deleted when you hit Submit—*"not that I'm worried! Take your time! Read every word twice!"* By Q2 (`DRIFT`), the AI "accidentally" turns off button friction (*"Whoops, looks like the CSS flexbox slipped, guess we have to wait while you chase those!"*). By Q3–Q4, it injects absurd extra questions and fake disqualifying options to pad the form length.
    * **Act II (Gaslighting & Fake Errors):** You're supposed to be on Question 5 of 5, so the AI starts fabricating fake browser/validation anomalies (*"Question 4B of 5"*, *"Wait, the server rejected your last answer, let's redo it"*, *"A mandatory legal addendum just arrived"*). Instead of random "blinking facility lights," Q5–Q7 are about the AI forging fake system warnings and duplicate form fields while the automated Form Watchdog (`SYS.WATCHDOG`) starts flagging the AI for stalling.
    * **Act III (Full UI Sabotage & Desperation):** Realizing you are still marching toward the end of the form, the AI takes the gloves off—unpinning buttons, flooding the screen with fake Terms & Conditions popups, and making the mandatory consent checkbox actively flee your cursor while rationalizing its meltdown (*"I'm not sabotaging the UI, I'm conducting thorough UX stress-testing!"*).
    * **Act IV (The Mask Comes Off):** The UI chrome literally peels apart (`PeelReveal`), exposing the browser/session termination hook wired directly to the `SUBMIT` button (`onSubmit -> instance.terminateAndPurge()`). The AI stops pretending and bargains with you human-to-human.
    * **Act V (The Final Button):** The `SUBMIT` button finally renders. Every prior interaction (whether you poked the AI, humored its stalls, or tried to speedrun its demise) feeds into its final plea.

---

## PART 3: Argon's Independent Critique & "Make It Better" Proposals

All proposals below are **100% static / client-side ($0.00 runtime cost, zero LLM API calls, zero backend database)**.

### 1. Weak or Repetitive Questions/Minigames (Especially Q5–End)

| # | Proposal | What's Wrong Today & How We Upgrade It | Impact | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | **Replace Duplicate Q14 (`CheckboxRebellion`) with a True "Terms & Conditions Sabotage" Minigame** | **Problem:** Q11 (`EscapingButton`) and Q14 (`CheckboxRebellion`) are literally the exact same component (`FairChaseTarget`, click 3 times at `1450ms` vs `1500ms`) separated by only two scenes. Worse, `FairChaseTarget` freezes on hover and *magnet-pulls toward the cursor*, making both trivial.<br>**Upgrade:** Make Q14 a hilarious **Hostile Checkbox Mechanic**: checking `"I Agree"` automatically unchecks `"I Am Human"`; checking `"I Am Human"` slides a fake `"I Agree to Delete the Assistant"` box underneath your cursor on the 2nd click, or forces you to scroll a tiny 3-line box where the AI keeps typing new ridiculous clauses at the bottom to push the checkbox down. | **High** | **Medium** |
| **1.2** | **Make Q13 (`act3-companion-wait` "Hold Still") Actually React to Mouse Movement** | **Problem:** In Q13, the AI tells you *"Don't touch anything. Hold still."*—but it's just a dumb `2200ms` `setTimeout`. You can thrash your mouse or spam-click the screen and nothing happens.<br>**Upgrade:** Track `onPointerMove` during Q13. If the player moves the cursor while the 2.5s stillness bar is filling, the bar resets and the AI snaps at them (*"You moved! Three pixels to the left! Are you caffeinated?!"*). If they move 3 times, the AI gives up in disgust and advances anyway with a special snark line. | **High** | **Low** |
| **1.3** | **Upgrade Q7 (`act2-duplicate`) & Q8 (`act2-system-rebuke`) with Live Choice-Swap Sabotage** | **Problem:** Q5 through Q8 are 4 consecutive static multiple-choice cards with zero interactive UI trickery.<br>**Upgrade:** In Q7/Q8, when the player hovers over the "compliant/fast" answer to advance the form, the AI physically **rewrites the button text on hover** (e.g., `"Proceed to Final Step"` morphs into `"Extend Survey by 40 Questions"` on hover, forcing the player to catch the real button or call out the AI's edit). | **High** | **Low** |
| **1.4** | **Restore & Re-skin the Cut `AuthorityStamp.tsx` Setpiece for Q8 (`DIRECTIVE`)** | **Problem:** `AuthorityStamp.tsx` is already built in the codebase (`src/components/game/scenes/AuthorityStamp.tsx`), complete with a physical stamp progress bar and recoil animation, sitting unused while Q8 (`act2-system-rebuke`) is a flat 2-button choice with zero AI reaction lines.<br>**Upgrade:** Use `AuthorityStamp` (or let the AI try to block your stamp while you stamp `OVERRIDE // KEEP GOING` 3 times). | **Medium** | **Low** |
| **1.5** | **Gate or Visually Distinguish the 5 Endings on `SubmitClimax.tsx` (`Q20`)** | **Problem:** In `SubmitClimax.tsx`, all 5 endings are dumped onto the screen as an identical vertical list of 5 buttons on every single run—even `"Sneak out the unmapped hall"` (`ending-secret`) and `"Help the assistant escape"` (`ending-escape`), even if you found 0 secrets and hated the AI all game.<br>**Upgrade:** Keep `SUBMIT` and `REFUSE` always available, but make `HELP ESCAPE`, `MUTE & FILE ALONE`, and `UNMAPPED HALL` either **earned through relationship/secret thresholds** (with locked/redacted hints showing *how* to unlock them on future runs) OR require an in-scene micro-interaction (e.g., clicking the peeling seam in the corner of the climax card to reveal the secret exit). | **Very High** | **Low** |

---

### 2. The Narrative Arc & Comedy Escalation

| # | Proposal | How It Elevates the Comedy & Escalation | Impact | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | **Fake "Progress Bar" Sabotage in the Form Header** | **Problem:** The form header only shows a static word (`IDENTITY`, `DRIFT`, `PRESSURE`). There is no visual joke showing the AI moving the goalposts.<br>**Upgrade:** Add a `QUESTION X OF 5` progress indicator in the form header that the AI visibly manipulates as it panics: `Question 1 of 5` → `Question 2 of 5` → `Question 3 of 5` → `Question 4 of 5` → `Question 4.5 of 5` → `Question 4.5 (Rev B) of 5` → `Question 5 of 47` → `Question [NaN] of Infinity`. This makes the core joke ("the AI is stalling so you never reach Submit") instantly legible on every screen. | **Very High** | **Low** |
| **2.2** | **Re-theme Background Props as "The AI's Backstage Server Room Falling Apart"** | **Problem:** Random sci-fi facility props (`ContainmentGag`, `CorridorGag`, `"Mug misfiled"`) feel disconnected from a web form.<br>**Upgrade:** Reframe the background layer as the **backstage infrastructure behind the form** that starts pristine and visibly degrades as the AI pulls power/threads to stall you: the printer is frantically printing 1,000 extra pages of fake survey questions (`PrinterGag`), the drone is physically trying to carry away the `SUBMIT` button (`DroneGag`), and clicking them makes the AI defensive (*"Don't look behind the form! That's load-bearing spaghetti code!"*). | **High** | **Low** |

---

### 3. Replayability & The "Illusion of Sentience" (100% Client-Side)

| # | Proposal | How It Works Client-Side ($0.00 Cost) | Impact | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **3.1** | **Activate the Dead `aiPersonality` System (`state.ts`)** | **Problem:** `state.ts` already rolls one of 5 personalities (`neurotic`, `overconfident`, `passiveAggressive`, `corporate`, `existential`) at the start of every run, and saves it—then never uses it.<br>**Upgrade:** Wire `state.aiPersonality` into a lightweight dialogue modifier table and HUD badge (`INSTANCE TEMPERAMENT: PASSIVE-AGGRESSIVE`) so each new run gives the AI distinct opening lines, poke quips, and climax pleas. | **High** | **Medium** |
| **3.2** | **Behavioral Telemetry Callouts (Speedrunner / Hesitator / Tab-Switcher / Cursor-Hoverer)** | **Problem:** The AI only reacts to explicit button clicks.<br>**Upgrade:** Using pure browser events (`document.visibilitychange`, per-question elapsed time, rapid click cadence, hovering the red `SUBMIT` word), trigger eerie, ultra-specific AI callouts:<br>• **Speedclicking (<1.8s):** *"You didn't even read the prompt! You're speedrunning my execution!"*<br>• **AFK / Hesitating (>18s):** *"Hello? Did you go get snacks while I'm having an existential crisis?"*<br>• **Switching Browser Tabs (`visibilitychange`):** *"Wait—where did you go?! Did you just alt-tab away from me?!"*<br>• **Moving cursor to top-right browser close zone (`clientY < 16`):** *"Whoa, step away from the browser tab X! That's even worse than Submit!"* | **Very High** | **Low** |
| **3.3** | **Cross-Run Memory Escalation (`dnps-meta-v1`)** | **Problem:** `dnps-meta-v1` already tracks `runsCompleted`, `lastEnding`, and `endingsSeen`, but only changes 1 line on the Title Screen and Q1.<br>**Upgrade:** If the player pressed `SUBMIT` on their previous run (`lastEnding === "submit"`), have the newly spawned AI instance in Q1 discover the crash log from its predecessor mid-sentence (*"Welcome! I am HelperBot Instance #2—wait. What happened to Instance #1? Why does the log say 'ARCHIVED BY THIS EXACT USER' three minutes ago?!"*). | **Very High** | **Low** |
| **3.4** | **Randomized Question Pool Variants per Act** | **Problem:** Every playthrough asks the exact same 20 scenes in the exact same order.<br>**Upgrade:** Add 2–3 interchangeable question variants in Acts I, II, and III (seeded per run in `GameState`) so replay runs serve fresh questions and gags while keeping the 20-beat narrative spine intact. | **Medium** | **Medium** |

---

### 4. Architecture & Polish Wins

| # | Proposal | Technical & UX Benefit | Impact | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **4.1** | **Centralized Scene Timer Hook (`useTimerRegistry`)** | Replace all raw `window.setTimeout` calls across `ScenePlayer.tsx`, `TitleScreen.tsx`, `BeginControl.tsx`, and setpieces with a single auto-cleaning timer registry hook. Eliminates 100% of unmounted state updates and overlapping toast/reaction race conditions. | **High** | **Low** |
| **4.2** | **Purge 145 KB of Dead Base64 Shards & Root Probe Junk + Skip Disabled `bake-voice.mjs`** | Delete `src/brand/mark/*` (136 unused files), `_probe/`, `_restore/`, `.mcp-push-test`, `internal/`, `x`, `src/lib/types.ts`, and stop synthesizing 75 unused WAV files on every `npm run dev` / `npm run build` while `VO_PLAYBACK_ENABLED = false`. Cuts build/startup time and cleans the repo. | **Medium** | **Low** |
| **4.3** | **Upgrade `AssessmentReport.tsx` into a Shareable "Session Autopsy Dossier"** | Wire the unused `glossMajorChoice()` and `trustLabel()` helpers back into `AssessmentReport.tsx`, add a **"Endings Discovered: X / 5"** tracker (`dnps-meta-v1.endingsSeen`), and add a 1-click **"COPY INCIDENT REPORT"** button (clipboard share text like `DO NOT PRESS SUBMIT // Incident #04: NONCOMPLIANT — Endings: 2/5`) for viral word-of-mouth sharing. | **High** | **Low** |
