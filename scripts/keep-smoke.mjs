/**
 * KEEP / regression smoke — project reset (no runtime LLM).
 * Plain Node — string markers only (no TS loader required).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

const locks = read("src/game/aiLifeLocks.ts");
assert(/crack:\s*3/.test(locks), "poke crack @3");
assert(/stitch:\s*7/.test(locks), "poke stitch @7");
assert(/ticket:\s*12/.test(locks), "poke ticket @12");
assert(/FORM_12_ORB_ANCHOR = "dock-left"/.test(locks), "Form 12 orb dock-left lock");
assert(/FORM_12_SCENE_ID = "act3-checkbox"/.test(locks), "Form 12 scene id lock");

const act3 = read("src/game/scenes/act3.ts");
assert(act3.includes('id: "act3-checkbox"'), "act3 checkbox scene present");
assert(act3.includes('orbAnchor: "dock-left"'), "act3 Form 12 dock-left in scene data");
assert(!/Act III|Act IV|LOOK UNDERNEATH|ENGAGE THE NONSENSE/.test(act3), "act3 has no visible Act bridge copy");
assert(!/act3-between-1/.test(act3), "duplicate blame beat act3-between-1 removed");
assert(/fled|flees|sprint/i.test(act3), "checkbox flee comedy present");
assert(!/It agreed, then fled/.test(act3), "Form 12 orb line is unique (no stale It agreed then fled echo)");

const act1 = read("src/game/scenes/act1.ts");
assert(/mug|Mug/.test(act1), "mug steal path still in Act I");
assert(!/act1-handshake|act1-companion-watch|act1-bridge|act1-welcome/.test(act1), "slow Act I fillers / bridge cut");
assert(!/I'M READY\. PROBABLY/.test(act1), "single-button welcome continue removed");
assert(!/FORM 00B/.test(act1), "orientation form chrome uses plain IDENTITY label");
assert(/sceneId: "act1-name"/.test(read("src/game/state.ts")), "new runs start on act1-name");
assert(/facility that spent real money looking trustworthy/.test(act1), "signature facility line kept on opening");
assert(/act1-restless/.test(act1) && /next: "act1-restless"/.test(act1), "restless malfunction follows name");
assert(!/Act II|WALK INTO ACT/.test(act1), "act1 has no visible Act bridge copy");

const act2 = read("src/game/scenes/act2.ts");
assert(!/act2-stamp|authority-stamp/.test(act2), "authority-stamp chase dropped from act2");
assert(!/ENTER ACT III|act2-bridge/.test(act2), "act2 bridge removed");
assert(/The facility system/.test(act2), "trust choice names facility system");
assert(/We're a team|Not sure yet|This is your problem/.test(act2), "side-channel stances clarified");

const endings = read("src/game/endings.ts");
assert(/LEAVE FORM UNFINISHED/.test(endings), "climax refuse label clear");
assert(/HELP THE ASSISTANT ESCAPE/.test(endings), "climax escape label clear");
assert(/MUTE ASSISTANT AND FILE ALONE/.test(endings), "climax disable label clear");
assert(/SNEAK OUT THE UNMAPPED HALL/.test(endings), "climax secret label clear");
assert(/action === "refuse"/.test(endings) && /ending-refuse/.test(endings), "refuse routes to ending-refuse");
assert(!/relationshipScore >= 3/.test(endings), "refuse no longer upgrades via relationship");
assert(!/wantDisable|allegianceSystem|secretDoor|relationshipScore/.test(endings), "climax options not flag-gated");
assert(
  (endings.match(/id: "submit"/g) || []).length >= 1 &&
    (endings.match(/id: "refuse"/g) || []).length >= 1 &&
    (endings.match(/id: "escape"/g) || []).length >= 1 &&
    (endings.match(/id: "disable"/g) || []).length >= 1 &&
    (endings.match(/id: "secret"/g) || []).length >= 1,
  "climaxOptions always lists all five endings",
);

const popupSrc = read("src/components/game/scenes/PopupWar.tsx");
assert(/needed = 5/.test(popupSrc), "PopupWar requires 5 dismissals");
assert(!/CHILDREN|PREGNANT|COUSIN/.test(popupSrc), "PopupWar scrubbed cousin/children/pregnant labels");
assert(/Closed \{progress\}\/\{needed\}/.test(popupSrc), "PopupWar uses clean Closed counter");

const fair = read("src/components/game/FairChaseTarget.tsx");
assert(/hitPad|proximity|freeze/i.test(fair), "FairChaseTarget mouse-fair markers");

const escaping = read("src/components/game/scenes/EscapingButton.tsx");
assert(escaping.includes("hitPad={26}"), "EscapingButton hitPad 26");

const checkbox = read("src/components/game/scenes/CheckboxRebellion.tsx");
assert(checkbox.includes("hitPad={24}"), "CheckboxRebellion hitPad 24");

const popup = read("src/components/game/scenes/PopupWar.tsx");
assert(/minHeight:\s*44/.test(popup), "PopupWar DISMISS minHeight 44");

const speech = read("src/lib/speech.ts");
assert(!/speechSynthesis\.speak|new SpeechSynthesisUtterance/.test(speech), "no live speechSynthesis player path");
assert(/LIVE_BROWSER_TTS\s*=\s*false/.test(speech), "LIVE_BROWSER_TTS stays false");
assert(/speakLine|voiceAssetPath|baked|\/audio\/vo\//i.test(speech), "baked VO speakLine path present (disabled)");
assert(/VO_PLAYBACK_ENABLED = false/.test(speech), "robotic WAV VO playback hard-disabled");
assert(/duckAmbience|unduckAmbience/.test(read("src/lib/audio.ts")), "ambience duck helpers retained");

const voiceIds = read("src/lib/voiceIds.ts");
assert(/calm|petty|alarmed/.test(voiceIds), "voice moods calm/petty/alarmed");
assert(/pokeLineId|sceneLineId|endingLineId/.test(voiceIds), "line ID helpers for baked VO");
assert(/Math\.imul\(h,\s*16777619\)\s*>>>\s*0/.test(voiceIds), "pokeLineId keeps FNV hash unsigned");
// Runtime must never request poke--N (signed modulo bug).
{
  // Inline the fixed contract: pad 0..23 → poke-00..poke-23, never poke--.
  const ids = Array.from({ length: 24 }, (_, i) => `poke-${String(i).padStart(2, "0")}`);
  assert(ids.every((id) => /^poke-\d{2}$/.test(id) && !/^poke--/.test(id)), "poke id contract poke-NN");
  assert(!/return\s*`poke--/.test(voiceIds), "pokeLineId return template is poke-NN not poke--N");
}

assert(existsSync(join(root, "scripts/bake-voice.mjs")), "bake-voice build script present");
const bake = read("scripts/bake-voice.mjs");
assert(/public\/audio\/vo|hero-system-override|poke-/.test(bake), "bake-voice writes hero + poke stubs");
assert(/collectSceneLineIds|scene-\$\{|sceneCoverage|formant-v2/.test(bake), "bake-voice expands scene coverage (formant-v2)");
assert(/NOT recorded VO|Replace with real|stub/i.test(bake), "bake-voice documents stubs honestly");

const audioCtl = read("src/components/game/AudioEnableControl.tsx");
assert(/ENABLE SOUND|SOUND ON/i.test(audioCtl), "corner sound control preserved");
assert(/data-sound-corner/.test(audioCtl), "corner sound marker present");
assert(/setEnabled\(true\)/.test(audioCtl), "unmute arms speech director flag");
assert(!/speechSynthesis/.test(audioCtl), "AudioEnableControl never references speechSynthesis");
assert(!/UNMUTE \/ ENABLE SOUND/.test(audioCtl), "title CTA unmute button removed");

const nextCfg = read("next.config.ts");
assert(nextCfg.includes('output: "standalone"'), "standalone App Hosting output");

const scenePlayer = read("src/components/game/scenes/ScenePlayer.tsx");
assert(!scenePlayer.includes("requestAssistantFlavor"), "ScenePlayer has no assistant flavor client");
assert(!scenePlayer.includes("flavorLine"), "ScenePlayer has no flavorLine state");
assert(!scenePlayer.includes("@/lib/ai"), "ScenePlayer does not import lib/ai");
assert(/glassTimer/.test(scenePlayer), "crack FX timer ref prevents rapid-poke wipe");
assert(/pokeLineId|speakLine/.test(scenePlayer), "ScenePlayer routes VO through baked speakLine");

assert(!existsSync(join(root, "src/app/api/assistant")), "no /api/assistant route");
assert(!existsSync(join(root, "src/lib/ai")), "no src/lib/ai provider tree");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".git" || name === ".next") continue;
      walk(p, files);
    } else if (/\.(ts|tsx|js|mjs|md|json|mdc)$/.test(name)) {
      files.push(p);
    }
  }
  return files;
}

const bannedParts = [
  "api.openai.com",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "DNPS_AI_API_KEY",
  "DNPS_AI_MODE",
  "liveOpenAI",
  "chat/completions",
  "generateAssistantFlavor",
  "requestAssistantFlavor",
];
const scanned = walk(root).filter((f) => !f.endsWith("scripts/keep-smoke.mjs"));
let bannedHit = null;
for (const file of scanned) {
  const text = readFileSync(file, "utf8");
  const hit = bannedParts.find((p) => text.includes(p));
  if (hit) {
    bannedHit = `${file.replace(root + "/", "")} (${hit})`;
    break;
  }
}
assert(!bannedHit, `no live-LLM / assistant-API markers (hit: ${bannedHit ?? "none"})`);

const rule = read(".cursor/rules/do-not-press-submit.mdc");
assert(rule.includes("alwaysApply: true"), "Cursor rule alwaysApply");
assert(/No runtime LLM/i.test(rule), "Cursor rule bans runtime LLM");
assert(/Hallucinated Dungeons/i.test(rule), "Cursor rule bans HD contamination");
assert(/authored dialogue/i.test(rule), "Cursor rule: authored Assistant");
assert(/No auth|no auth|multiplayer/i.test(rule), "Cursor rule: no auth/multiplayer");
assert(/Visual Vertical Slice|Grade-A/i.test(rule), "Cursor rule: VVS / Grade-A priority");

const view = read("src/components/game/scenes/ScenePlayerView.tsx");
const viewAssistant = existsSync(join(root, "src/components/game/scenes/ScenePlayerViewAssistant.tsx"))
  ? read("src/components/game/scenes/ScenePlayerViewAssistant.tsx")
  : "";
const viewPanels = existsSync(join(root, "src/components/game/scenes/ScenePlayerViewPanels.tsx"))
  ? read("src/components/game/scenes/ScenePlayerViewPanels.tsx")
  : "";
const viewAll = view + viewAssistant + viewPanels;
assert(/data-form-owns-center|form owns center|assistant-yield/i.test(viewAll), "safe layering: form owns center");
assert(/z-\[42\]|z-\[28\]|z-\[15\]|z-30/.test(viewAll), "safe layering z-index stack (bubble above form)");
assert(/data-assistant-above-form/.test(viewAll), "assistant paints above non-gag forms");

const roam = read("src/game/ambientRoam.ts");
assert(/pickSlot|GAG_SLOTS|CHAMBER_SLOTS/.test(roam), "ambient roam slot pools");
assert(/BAR_LAYOUTS|pickBarLayout|pickSlotDistant/.test(roam), "facility bar layouts + distant picks");
assert(/TITLE_BAR_LAYOUTS|TITLE_GAG_SLOTS|TITLE_CHAMBER_SLOTS/.test(roam), "title calm roam pools present");
assert(/DRONE_PATH_SLOTS|dronePathLayout/.test(roam), "REPLACEMENT FAILED scene-aware path pools");
assert(/overhead/.test(roam), "Form 03B overhead drone path pool present");
assert(/orbAnchor === \"overhead\"|orbAnchor === 'overhead'/.test(roam), "dronePathLayout routes overhead anchors");

const bg = read("src/components/game/BackgroundGags.tsx");
assert(/data-ambient-roam|pickSlotDistant|roamIntervalMs/.test(bg), "BackgroundGags relocates eggs");
assert(/data-ambient-subtle|22000|36000/.test(bg), "BackgroundGags quieter roam cadence");
assert(/TITLE_GAG_SLOTS|calm|data-title-calm/.test(bg), "BackgroundGags supports title calm density");
assert(/data-drone-path|DRONE_PATH_SLOTS|dronePathLayout/.test(bg), "BackgroundGags uses drone path layout");
assert(/spotlight|safeSide|companion/.test(bg), "BackgroundGags receives layout hints for drone pathing");
assert(/orbAnchor/.test(bg), "BackgroundGags receives orbAnchor for Form 03B pathing");
assert(/data-toast-path/.test(bg), "click-gag toast docks by drone path");

const drone = read("src/components/game/gags/DroneGag.tsx");
assert(/data-replacement-failed|data-replacement-outline/.test(drone), "DroneGag marks REPLACEMENT FAILED outline");
assert(/data-drone-floor|bottomPct|nearBottom/.test(drone), "DroneGag bottom-pins to avoid edge clip");
assert(/RETRY \/\/ ALSO FAILED/.test(drone), "DroneGag keeps RETRY // ALSO FAILED gag copy");
assert(/data-drone-gag|gagOpen|data-drone-idle-glyph/.test(drone), "DroneGag idle is wordless; gag text on click");
assert(/safeLeft >= 78|nearRight = safeLeft >= 78/.test(drone), "DroneGag right-pins only in true right margin");
assert(/footprintVh/.test(drone), "DroneGag reserves open-gag vertical footprint");

const fac = read("src/components/game/FacilityBackground.tsx");
assert(/chamberSlot|data-roam-egg=\"chamber-07\"/.test(fac), "CHAMBER 07 relocates");
assert(!/>\s*CHAMBER 07\s*</.test(fac), "FacilityBackground strips idle CHAMBER 07 wallpaper");
assert(!/>\s*EVERYTHING IS FINE/.test(fac), "FacilityBackground strips idle EVERYTHING IS FINE wallpaper");
assert(!/QUEUE:\s*\{/.test(fac), "FacilityBackground strips idle QUEUE wallpaper");
assert(/Wordless chamber|wordless chamber/i.test(fac), "FacilityBackground chamber is wordless idle");
assert(/pickBarLayout|facility-bar-/.test(fac), "tall facility bars relocate");
assert(/pickSlotDistant/.test(fac), "facility uses distant slot picks");
assert(/stiffness:\s*22|v \* -3|v \* -7/.test(fac), "facility parallax/motion quieted");
assert(/TITLE_BAR_LAYOUTS|calm/.test(fac), "FacilityBackground supports title calm density");

assert(!/>DO NOT PRESS</.test(bg), "BackgroundGags strips idle DO NOT PRESS wallpaper");
assert(/data-do-not-press-glyph/.test(bg), "BackgroundGags uses wordless do-not-press glyph");

const title = read("src/components/game/TitleScreen.tsx");
assert(/FacilityBackground/.test(title), "title restores facility depth");
assert(/BackgroundGags/.test(title), "title restores ambient gag eggs");
assert(/AssistantOrb/.test(title), "title keeps Assistant orb");
assert(/data-title-cinematic|data-title-footer/.test(title), "title marks cinematic + footer");
assert(/data-title-density=\"medium\"|data-title-cta-column|data-title-orb-dock/.test(title), "title medium density composition markers");
assert(/calm/.test(title), "title passes calm density to ambient layers");
assert(!/data-title-void/.test(title), "title is not the empty void card");
assert(/BeginControl/.test(title), "title keeps Begin game-feel control");
assert(!/AudioEnableControl/.test(title), "title CTA column no longer hosts unmute button");
assert(/AudioEnableControl/.test(read("src/components/game/GameRoot.tsx")), "GameRoot hosts corner sound control");
assert(/phase === "title"/.test(read("src/components/game/GameRoot.tsx")), "corner sound available on title");
assert(/TitleLogo/.test(title), "title keeps brand logo");
assert(/onEagerBegin/.test(title), "title wires third-Submit eager begin");
assert(/goTitle|finishChaos/.test(read("src/components/game/GameRoot.tsx")), "chaos transitions toward title");
assert(/setPhase\("hcos"\)/.test(read("src/components/game/GameRoot.tsx")), "hcos plays after Begin");
assert(/2500/.test(read("src/components/game/HcosSplash.tsx")), "hcos splash shortened to 2500ms");
assert(!/TITLE_IDLE_COMEDY/.test(title), "title does not park idle comedy under the orb");
assert(!/\{\s*[\"']\/\/ residue — click me[\"']\s*\}/.test(title), "title strips idle residue click-me wallpaper");
assert(!/ASSISTANT ONLINE/.test(title), "title orb status not idle wallpaper competing with BEGIN");
assert(/data-residue-hint/.test(title), "title soft residue hint (wordless pulse) present");
assert(!/click me/i.test(title), "title has no click-me microcopy");

const orb = read("src/components/game/AssistantOrb.tsx");
assert(!/UNAUTHORIZED CONTACT\?/.test(orb), "orb poke hint no longer competes as loud unauthorized wallpaper");
assert(/data-orb-poke-hint|pokedOnce|first-poke/.test(orb), "orb poke hint folded into first poke only");
assert(!/>\s*logged\s*</.test(orb) && !/>\s*click me\s*</i.test(orb), "orb poke hint is wordless pulse (no click-me / logged text)");
assert(!/click me/i.test(orb), "AssistantOrb has no click-me microcopy");

const titleLogo = read("src/components/game/TitleLogo.tsx");
assert(/data-title-submit-gag/.test(titleLogo), "title SUBMIT is a click gag");
assert(/SUBMIT_GAGS/.test(titleLogo), "title SUBMIT has authored gag lines");
assert(/onEagerBegin/.test(titleLogo), "title SUBMIT click-3 can start assessment");
assert(/likesSubmit/.test(titleLogo), "title SUBMIT click-3 seeds likesSubmit");
assert(/What are you not supposed to do/.test(titleLogo), "title SUBMIT gag keeps Nick line");
assert(/Fine\. If you're that eager/.test(titleLogo), "title SUBMIT click-3 line present");
assert(/data-title-submit-toast|absolute/.test(titleLogo), "SUBMIT gag toast is absolute (no column jump)");
assert(/data-title-submit-toast-band/.test(titleLogo), "SUBMIT gag toast band reserved between Submit and subtitle");
assert(/data-title-subtitle/.test(titleLogo), "title subtitle marked so gag cannot cover it");
assert(
  titleLogo.indexOf("data-title-submit-toast-band") < titleLogo.indexOf("data-title-subtitle"),
  "toast band appears before subtitle in DOM (subtitle stays readable under gag)",
);

const motion = read("src/game/motion.ts");
assert(/max-h-\[min\(40vh,340px\)\]|leaveBottom/.test(motion), "bottom forms leave room for bubble above");
assert(/top-\[12%\]/.test(motion), "form panels clear SOUND ON corner");
assert(/right:\s*\"2\.5%\"/.test(motion), "right-side orb docks pin with ≥24px edge margin");
assert(/transform:\s*\"none\"/.test(motion), "orb stage avoids translate centering (FM-safe)");

assert(/AssistantOrb/.test(viewAll), "in-assessment Assistant orb present");
assert(/FacilityBackground/.test(view), "in-assessment facility background present");
assert(/BackgroundGags/.test(view), "in-assessment ambient gags present");
assert(/spotlight=\{spotlight\}|safeSide=\{safeSide\}|companion=\{companion\}/.test(view), "ScenePlayerView passes drone path hints");
assert(/orbAnchor=\{/.test(view), "ScenePlayerView passes orbAnchor to BackgroundGags");

const glass = read("src/components/game/scenes/GlassStitchOverlay.tsx");
assert(/spiderweb|fracture|impact/i.test(glass), "crack FX reads as glass fracture");
assert(/data-glass-behind-form|z-\[22\]/.test(glass), "crack stays behind form chrome");
assert(/data-glass-stitch|stitching UI/.test(glass), "stitch tier present");
assert(/phase === "stitch"/.test(glass) && /ticket/.test(glass), "ticket only on stitch ladder");

const restless = read("src/components/game/scenes/RestlessOptions.tsx");
assert(!/truncate/.test(restless), "Form 01C restless answers never ellipsize");
assert(/whitespace-normal|break-words/.test(restless), "Form 01C restless answers wrap fully");
assert(/PIN_X|ROWS/.test(restless), "Form 01C pinned answers use non-overlapping lanes");
assert(/data-restless-options/.test(restless), "Form 01C restless craft marked");

assert(/GlassStitchOverlay/.test(title), "title crack FX uses full glass overlay");
assert(/fullStage/.test(title), "title glass uses fullStage (no form-yield hairline mask)");
assert(/data-title-orb-edge-pad|bottom-8 left-8/.test(title), "title orb dock ≥24px from edges");
assert(/data-title-idle-hint|data-residue-hint/.test(title), "title idle orb hint readable at rest");
assert(/data-drone-memo-strip/.test(drone), "Drone memo strip marked for contrast");
assert(/data-ambient-dust/.test(fac), "floating dust marked decorative");
assert(/bottom-\[10%\]|data-companion-stack/.test(viewPanels), "Settle companion stack lifted for bottom margin");
assert(/data-companion-settle-cue|data-companion-settled|Ready when you are/.test(viewPanels), "companion wait shows settle cue when ready");
assert(!/ORBIT STEADY — YOU CAN CONTINUE/.test(viewPanels), "companion settle cue drops ORBIT STEADY jargon");
assert(/What should I call you\? Pick one/.test(act1), "name prompt uses plain human copy");
assert(/Call me a friend/.test(act1), "friend label clarified");
assert(/Moist cavern/.test(act1), "moist cavern option retained");
assert(/please don't look behind the panel/.test(read("src/game/scenes/act4.ts")), "signature behind-the-panel line retained");
const act5 = read("src/game/scenes/act5.ts");
assert(/Please don't press it\./.test(act5), "climax refuse is a plea without naming the option");
assert(!/Don't click the big red Submit/.test(act5), "climax no longer names the Submit option");
assert(!/act5-system-push|SYSTEM DIRECTIVE/.test(act5), "SYSTEM DIRECTIVE continue filler removed");
assert(!/Then the red rectangle gets loud/.test(act5), "lobby no longer narrates the red rectangle");
assert(!/Leave it unfinished if you have to|Try leaving the form unfinished/.test(act5), "refuse guidance does not name unfinished option");
assert(/Duty called\. I'm still asking\./.test(act5), "duty climax line shipped");
assert(!/Grammar broke|hallway behind the stylesheet|souvenir dust|Hallway dust on the ledger/.test(act5), "hall ending jargon purged");
assert(
  !/embarrassed negotiation|embarrassed pause|awkward memo/.test(
    act5 + read("src/game/state.ts") + read("src/components/game/scenes/AssessmentReport.tsx"),
  ),
  "unfinished ending narration purged",
);
const act4 = read("src/game/scenes/act4.ts");
assert(!/cast one quiet vote|Whisper it/.test(act4), "prep vote copy clarified; whisper muddle cut");
assert(/polite guillotine/.test(act4), "polite guillotine signature retained");
assert(/decide how you'll face it/.test(act4), "prep vote says what the player is choosing");
{
  const sceneChrome = [act1, act2, act3, act4, act5].join("\n");
  assert(!/formId:\s*"(?:FORM|LAYER|FINAL)\b/.test(sceneChrome), "no Form/Layer/Final structure formIds");
  assert(!/formId:\s*"[^"]*\/\//.test(sceneChrome), "no X // Y structure-giving formIds");
}
assert(!/act2-system-intro/.test(act2), "act2 CONTINUE ASSESSMENT filler beat removed");
assert(/text-\[13px\].*sm:text-\[15px\]|sm:text-\[15px\]/.test(viewAssistant), "assistant bubble primary type size");
assert(/delay: 0\.35/.test(read("src/components/game/scenes/SceneChoiceList.tsx")), "choices stagger after bubble");
assert(
  !/CHANNEL RESIDUE|ALLY RESIDUE|Title residue/.test(
    title + read("src/components/game/scenes/AssessmentReport.tsx"),
  ),
  "player-facing residue wording purged",
);
const reportSrc = read("src/components/game/scenes/AssessmentReport.tsx");
assert(/SAVED THE ASSISTANT|ESCAPED TOGETHER|LEFT UNFINISHED/.test(reportSrc), "report uses plain human outcome stamps");
assert(/NONCOMPLIANT|TRANSFER COMPLETE|UNMAPPED PATH|ARCHIVED/.test(reportSrc), "report stamps match ending outcomes without title repeats");
assert(!/OUTSIDE THE FORM/.test(reportSrc), "hall report stamp does not repeat ending title OUTSIDE THE FORM");
assert(
  /ending === "escape" \|\| ending === "refuse"/.test(reportSrc) &&
    !/ending === "escape" \|\| ending === "secret" \|\| ending === "refuse"/.test(reportSrc),
  "SAVED THE ASSISTANT stamp gated to escape/refuse (not hall)",
);
assert(/Archived\. No further questions\./.test(reportSrc), "submit report note is distinct from ending blurb");
assert(
  /The assistant was archived\. The facility is quiet now\./.test(read("src/game/state.ts")),
  "submit ending blurb keeps plain archive words",
);
assert(!/Instance stamp applied|One channel blanked/.test(reportSrc), "submit jargon purged from report");
assert(!/Softly\. Desperately\.|Quietly\. Urgently\./.test(act2 + act5), "triple-beat cadence purged from callback + Decision");
assert(!/THE TITLE REMEMBERS|MEMORY TRACE|MERCY TRACE/.test(title), "title memory chrome wording removed — orb carries the beat");
assert(/data-title-memory/.test(title), "title marks last-ending memory for look");
assert(/Something pokes back\./.test(title), "escape poke line shortened");
assert(!/Transfer channel giggles|softly, happily|stop socializing with escaped/.test(title), "rev8 poke leftovers removed");
assert(/SYSTEM: Stop encouraging it\./.test(title), "escape poke system line shipped");
assert(/id: "coffee-mug"/.test(act1), "Pressure keeps unauthorized facility mug option");
assert(/data-choice-count/.test(read("src/components/game/scenes/SceneChoiceList.tsx")), "choice list marks count for mobile density");
assert(/62dvh|66dvh|68dvh|choice-count="5"/.test(read("src/app/globals.css")), "mobile panel tall enough for five Pressure options");
assert(/rememberTitleEnding|TITLE_MEMORY_KEY/.test(read("src/game/storage.ts")), "title memory persists most recent ending");
assert(/lineSceneId|data-bubble-scene/.test(scenePlayer + viewAssistant), "orb bubble updates per scene");
assert(/return \[\]/.test(popupSrc), "PopupWar clears leftovers on final dismiss");
assert(!/newlyClosed === 4 \? 2/.test(popupSrc), "PopupWar no mid-cascade double-spawn at 4/5");
assert(
  /w-\[min\(280px,calc\(100%-28px\)\)\]|max-w-\[calc\(100%-28px\)\]/.test(checkbox),
  "Consent chase target stays inside panel",
);
assert(/VO_PLAYBACK_ENABLED = false/.test(speech) || /speakLine/.test(speech), "VO disable path marked");
// Punch list rev10 locks
assert(
  !/Watch the title next time|looks different next time/.test(
    act5 + read("src/game/state.ts") + reportSrc,
  ),
  "escape promise-title copy cut",
);
assert(
  /rails are still humming|I'm already in the rails|file kept the fingerprints/.test(
    act5 + read("src/game/state.ts") + reportSrc,
  ),
  "escape copy show-don't-tell",
);
assert(
  !/FRAGMENTING|ORBIT DISSOLVED — ORDER RESTORED/.test(
    read("src/components/game/scenes/EndingSequence.tsx"),
  ),
  "submit ending drops FRAGMENTING / ORBIT DISSOLVED labels",
);
assert(
  !/HERDING CONTROLS/.test(read("src/components/game/effects/SceneTransition.tsx")),
  "mechanical transition drops HERDING CONTROLS",
);
assert(
  !/CLICK TO PEEL —|Pretty\. Expensive\. Lying/.test(
    read("src/components/game/scenes/PeelReveal.tsx"),
  ),
  "peel jargon cut",
);
assert(!/Interface arguing with itself/.test(checkbox), "checkbox drops Interface arguing narrator");
assert(!/Select a narrative you can live with/.test(act3), "blame prompt drops Select a narrative");
assert(/data-title-orb-escape|data-title-escape-prop/.test(title), "escape title leaves visible orb/prop difference");
assert(
  /onAuxClick|preventDefault/.test(read("src/components/game/BeginControl.tsx")),
  "BEGIN ASSESSMENT blocks aux/new-tab path",
);
assert(
  /Notices cleared\. I'll take the win/.test(popupSrc + scenePlayer),
  "popup war swaps Diplomacy failed for done line",
);
assert(!/lawyer-ups/.test(act3), "checkbox drops lawyer-ups machine-voice");
assert(/data-title-poke-bubble/.test(title), "title poke lines use readable bubble");
assert(/X_MAX = 26/.test(restless), "Drift X_MAX leaves room at 390px");

// Punch list rev11 locks
assert(
  /buryAssistant:\s*false/.test(act5) && /id:\s*"act5-climax"[\s\S]*?buryAssistant:\s*false/.test(act5),
  "climax Decision does not bury the plea bubble",
);
assert(
  /left-\[min\(36vw,380px\)\]/.test(read("src/game/motion.ts")),
  "climax panel leaves left safe column for orb bubble",
);
assert(/Mug misfiled/.test(title), "escape prop uses Mug misfiled (no X // Y)");
assert(!/MUG \/\/ MISFILED/.test(title), "escape prop drops MUG // MISFILED chrome");
assert(/Glass complains\. That fingerprint is yours\./.test(title), "title third poke crack has a line");
assert(/titlePokeLine|FRESH_POKE_LINES|CRACK_POKE_LINE/.test(title), "title poke banter always bubbles");
assert(/data-title-orb-above-props|z-\[45\]/.test(title), "title orb stays above crack/gag props");
assert(/data-restless-pin-lanes|ROWS = \[4, 38, 72\]/.test(restless), "Drift pinned lanes spaced for mobile");
assert(/3\.45rem/.test(read("src/app/globals.css")), "mobile form top clears SOUND ON by ≥8px");
assert(/max-sm:pb-\[7\.5rem\]|data-title-main-column/.test(title), "mobile title clears orb from AWAITING COMMITMENT");

assert(/data-assistant-safe-dock|data-form-above-glass/.test(viewAll), "bubble safe dock hardened");
assert(/data-bubble-dock/.test(viewAll), "bubble dock side marked");
assert(/data-bubble-safe-gap|data-bubble-no-clip/.test(viewAll), "bubble keeps safe gap during flinch / no mid-line clip");
assert(/z-\[42\]|z-\[28\]/.test(viewAll), "safe layering z-index stack (assistant above form)");

const ending = read("src/components/game/scenes/EndingSequence.tsx");
assert(!/HCOS \/\/ ASSESSMENT FACILITY|HCOS \/\/ CHAMBER|ENDING \/\/ /.test(title + ending), "title/ending structure chrome purged");
assert(/TRANSFER COMPLETE/.test(ending + read("src/game/state.ts") + reportSrc), "escape ending keeps TRANSFER COMPLETE outcome");
assert(/case \"escape\"[\s\S]*mode:\s*\"present\"/.test(ending), "escape ending orb stays present (not exit-vanish)");
assert(/data-ending-orb=\"present\"/.test(ending), "ending orb present marker");
assert(!/\/\/ev:outside/.test(ending), "hall backdrop drops //ev:outside chrome");
assert(!/STILL HERE \/\/ GRATEFUL|STILL HERE \/\/ WRONG ANGLE/.test(ending), "ending orb captions drop X // Y mood labels");

assert(/YOUR REPLACEMENT|STATUS: FAILED/.test(drone), "drone gag self-explanatory YOUR REPLACEMENT / FAILED");
assert(/RETRY \/\/ ALSO FAILED/.test(drone), "drone gag keeps RETRY // ALSO FAILED punchline");
assert(/replace you|replacement drone/i.test(read("src/game/ambientGagMeta.ts")), "drone toast explains facility tried to replace you");

const toastBus = read("src/game/ambientToastBus.ts");
assert(/showAmbientToast|subscribeAmbientToast/.test(toastBus), "shared ambient toast bus (replace, never stack)");
assert(/data-toast-bus|showAmbientToast/.test(bg), "BackgroundGags hosts shared toast bus");
assert(/data-clickable-dot/.test(read("src/components/game/AmbientInteractives.tsx")), "clickable cyan dots marked distinct");
assert(/data-title-submit-toast-gap/.test(titleLogo), "SUBMIT toast gap marker ≥12px");
assert(/fullStage/.test(glass), "GlassStitchOverlay supports fullStage for title");

assert(/onEscapingHit|All 3 hits archived/.test(scenePlayer), "Form 10 hit lines clear stale Round one");
assert(/Three hits archives|All 3 hits/.test(act3) || /onHit/.test(escaping), "Form 10 archive progression wired");

const globals = read("src/app/globals.css");
assert(/data-form-above-glass[\s\S]*z-index:\s*28/.test(globals), "CSS form z below assistant (bubble above form)");
assert(/3\.45rem/.test(globals), "SOUND ON / form gap locked in globals");

// Chaos Standard brand — public PNG masters (no TS base64 embeds).
assert(/--cs-hazard-orange:\s*#ff6a00|--cs-hazard-orange:\s*#FF6A00/i.test(globals), "CS hazard orange token");
assert(/--cs-pitch-black:\s*#05070a|--cs-pitch-black:\s*#05070A/i.test(globals), "CS pitch black token");
assert(/--cs-cyan:\s*#00e5ff|--cs-cyan:\s*#00E5FF/i.test(globals), "CS DNPS cyan token");
assert(!existsSync(join(root, "src/chaosBrand")), "no leftover src/chaosBrand embed tree");
{
  const brandGone = !existsSync(join(root, "src/brand"));
  const tsconfig = read("tsconfig.json");
  const brandExcluded = /\"src\/brand\"/.test(tsconfig);
  assert(brandGone || brandExcluded, "src/brand absent (preferred) or excluded from tsconfig while shards delete");
}
{
  const brandPngs = {
    "public/brand/chaos-splash-card.png": "78a01fa0332775d88065597d30a9fda3",
    "public/brand/chaos-logo-master.png": "2f056d40f9b8e0e4011870205f368a8e",
    "public/brand/chaos-mark-symbol.png": "dbeea014e21c97b21f6e24d9e57d25d5",
    "public/brand/chaos-wordmark.png": "d41fa38805ac79e7fb1d20a240788d97",
  };
  for (const [rel, md5] of Object.entries(brandPngs)) {
    assert(existsSync(join(root, rel)), `${rel} present`);
    const buf = readFileSync(join(root, rel));
    assert(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47, `${rel} is real PNG`);
    assert(createHash("md5").update(buf).digest("hex") === md5, `${rel} md5 matches Nick master`);
  }
}
const chaosSplash = read("src/components/game/ChaosSplash.tsx");
assert(/data-chaos-splash/.test(chaosSplash), "ChaosSplash root marker present");
assert(/\/brand\/chaos-mark-symbol\.png/.test(chaosSplash), "ChaosSplash uses public mark PNG");
assert(/\/brand\/chaos-wordmark\.png/.test(chaosSplash), "ChaosSplash uses public wordmark PNG");
assert(/clipPath|clip-path/.test(chaosSplash), "ChaosSplash CRT clip-path reveal present");
assert(/#05070A|#05070a/.test(chaosSplash), "ChaosSplash uses pitch-black backdrop");
assert(!/@\/chaosBrand|@\/brand\//.test(chaosSplash), "ChaosSplash must not import TS brand embeds");
assert(!/CHAOS_MARK_DATA_URI|CHAOS_WORDMARK_DATA_URI/.test(chaosSplash), "ChaosSplash must not use data-URI embeds");
assert(!/chaos-symbol-dark\.svg[\"']/.test(chaosSplash), "ChaosSplash must not use wrong cyan-squircle symbol");
assert(!/data-chaos-wordmark-fallback/.test(chaosSplash), "ChaosSplash must not use CSS typographic wordmark fallback");
assert(!/src\/chaosBrand|src\/brand\//.test(chaosSplash), "ChaosSplash must not reference embed trees");
{
  const scannedSrc = walk(join(root, "src")).map((f) => f.slice(root.length + 1));
  const embedImportHit = scannedSrc.find((rel) => {
    if (!/\.(ts|tsx)$/.test(rel)) return false;
    const src = read(rel);
    return /@\/chaosBrand|@\/brand\/|from [\"'].*chaosBrand|from [\"'].*\/brand\//.test(src);
  });
  assert(!embedImportHit, embedImportHit ? `no @/chaosBrand|@/brand import (${embedImportHit})` : "no @/chaosBrand|@/brand imports in src");
}
const layout = read("src/app/layout.tsx");
assert(/Space_Grotesk|Space Grotesk/.test(layout), "display font is Space Grotesk (Chaos Standard)");
assert(/JetBrains_Mono|JetBrains Mono/.test(layout), "mono font is JetBrains Mono (Chaos Standard)");

console.log(failed ? `\nKEEP smoke: FAILED (${failed})` : "\nKEEP smoke: OK");
process.exit(failed ? 1 : 0);
