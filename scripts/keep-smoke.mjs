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
assert(act3.includes("cousin"), "popup cousin gag copy present");
assert(act3.includes("LOOK UNDERNEATH"), "LOOK UNDERNEATH continue label");
assert(/fled|flees|sprint/i.test(act3), "checkbox flee comedy present");
assert(!/It agreed, then fled/.test(act3), "Form 12 orb line is unique (no stale It agreed then fled echo)");

const act1 = read("src/game/scenes/act1.ts");
assert(/mug|Mug/.test(act1), "mug steal path still in Act I");

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
assert(/speakLine|voiceAssetPath|baked|\/audio\/vo\//i.test(speech), "baked VO speakLine path present");
assert(/duckAmbience|unduckAmbience/.test(read("src/lib/audio.ts")), "ambience ducks under VO");

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
assert(/UNMUTE|ENABLE SOUND/i.test(audioCtl), "unmute control preserved");
assert(/speakLine|hero-title|setEnabled\(true\)/.test(audioCtl), "unmute arms baked VO not browser TTS");
assert(!/speechSynthesis/.test(audioCtl), "AudioEnableControl never references speechSynthesis");

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
assert(/data-toast-path/.test(bg), "BackgroundGags click-gag toast docks by drone path");

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
assert(/AudioEnableControl/.test(title), "title keeps unmute / sound control");
assert(/TitleLogo/.test(title), "title keeps brand logo");
assert(!/TITLE_IDLE_COMEDY/.test(title), "title does not park idle comedy under the orb");
assert(!/\{\s*["']\/\/ residue — click me["']\s*\}/.test(title), "title strips idle residue click-me wallpaper");
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
assert(!/onBegin/.test(titleLogo), "title SUBMIT gag does not call Begin");
assert(/What are you not supposed to do/.test(titleLogo), "title SUBMIT gag keeps Nick line");
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
assert(/right:\s*\"1\.5%\"/.test(motion), "right-side orb docks pin with right margin");
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
assert(/YOU SETTLED\. I NOTICED/.test(act1), "Settle CTA names the settle beat (not vague I SAW THAT)");
assert(/honesty scale|archiving either way|Pick a rung/.test(act1), "Form 02 honesty scale / rung line present");
assert(/1 HR brochure|court deposition/.test(act1), "Form 02 shows HR-brochure-to-court scale");

assert(/data-assistant-safe-dock|data-form-above-glass/.test(viewAll), "bubble safe dock hardened");
assert(/data-bubble-dock/.test(viewAll), "bubble dock side marked");
assert(/data-bubble-safe-gap|data-bubble-no-clip/.test(viewAll), "bubble keeps safe gap during flinch / no mid-line clip");
assert(/z-\[42\]|z-\[28\]/.test(viewAll), "safe layering z-index stack (assistant above form)");

const ending = read("src/components/game/scenes/EndingSequence.tsx");
assert(/TRANSFER COMPLETE/.test(ending), "escape ending keeps TRANSFER COMPLETE orb label");
assert(/case \"escape\"[\s\S]*mode:\s*\"present\"/.test(ending), "escape ending orb stays present (not exit-vanish)");
assert(/data-ending-orb=\"present\"/.test(ending), "ending orb present marker");

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

// Chaos Standard brand port — Nick masters (04 monitor + 07 wordmark) ≡ cleaned Home PNGs.
assert(/--cs-hazard-orange:\s*#ff6a00|--cs-hazard-orange:\s*#FF6A00/i.test(globals), "CS hazard orange token");
assert(/--cs-pitch-black:\s*#05070a|--cs-pitch-black:\s*#05070A/i.test(globals), "CS pitch black token");
assert(/--cs-cyan:\s*#00e5ff|--cs-cyan:\s*#00E5FF/i.test(globals), "CS DNPS cyan token");
assert(existsSync(join(root, "src/chaosBrand/mark/index.ts")), "embedded Nick/Home mark module present");
assert(existsSync(join(root, "src/chaosBrand/wordmark/index.ts")), "embedded Nick/Home wordmark module present");
assert(existsSync(join(root, "src/chaosBrand/mark/markPart0.ts")), "mark PNG chunk 0 present");
assert(existsSync(join(root, "src/chaosBrand/wordmark/wordPart0.ts")), "wordmark PNG chunk 0 present");
const markPart0 = read("src/chaosBrand/mark/markPart0.ts");
assert(!/LOAD_FROM_FILE|PLACEHOLDER_WILL_REPLACE/.test(markPart0), "mark chunks must be real base64 (not stubs)");
assert(/export const markPart0 = "[A-Za-z0-9+/=]{200,}"/.test(markPart0), "markPart0 is real base64 payload");
const wordPart0 = read("src/chaosBrand/wordmark/wordPart0.ts");
assert(!/LOAD_FROM_FILE|PLACEHOLDER_WILL_REPLACE/.test(wordPart0), "wordmark chunks must be real base64");
assert(/export const wordPart0 = "[A-Za-z0-9+/=]{200,}"/.test(wordPart0), "wordmark chunks must be real base64 payload");
const markMod = read("src/chaosBrand/mark/index.ts");
assert(/CHAOS_MARK_DATA_URI|data:image\/png;base64/.test(markMod), "mark module builds PNG data URI");
assert(/md5 dbeea014e21c97b21f6e24d9e57d25d5/.test(markMod), "mark module pins Nick/Home monitor md5");
const wordMod = read("src/chaosBrand/wordmark/index.ts");
assert(/CHAOS_WORDMARK_DATA_URI|data:image\/png;base64/.test(wordMod), "wordmark module builds PNG data URI");
assert(/md5 d41fa38805ac79e7fb1d20a240788d97/.test(wordMod), "wordmark module pins Nick/Home wordmark md5");
// Reconstruct embed bytes and pin to Nick masters
{
  const parts = [0,1,2,3,4,5].map((i) => read(`src/chaosBrand/mark/markPart${i}.ts`).match(/export const markPart\d+ = "([^"]+)"/)[1]);
  const buf = Buffer.from(parts.join(""), "base64");
  assert(createHash("md5").update(buf).digest("hex") === "dbeea014e21c97b21f6e24d9e57d25d5", "reconstructed mark embed == Nick master 04");
}
{
  const parts = [0,1,2,3,4,5,6,7].map((i) => read(`src/chaosBrand/wordmark/wordPart${i}.ts`).match(/export const wordPart\d+ = "([^"]+)"/)[1]);
  const buf = Buffer.from(parts.join(""), "base64");
  assert(createHash("md5").update(buf).digest("hex") === "d41fa38805ac79e7fb1d20a240788d97", "reconstructed wordmark embed == Nick master 07");
}
const chaosSplash = read("src/components/game/ChaosSplash.tsx");
assert(/data-chaos-splash|StudioSplashReveal|ELECTRON_BEAM/.test(chaosSplash), "ChaosSplash CRT reveal ported from Home");
assert(/clipPath|clip-path|inset\(49\.2%/.test(chaosSplash), "ChaosSplash CRT clip-path unzip");
assert(/CHAOS_MARK_DATA_URI|@\/chaosBrand\/mark/.test(chaosSplash), "ChaosSplash uses embedded Bewildered Terminal mark");
assert(/CHAOS_WORDMARK_DATA_URI|@\/chaosBrand\/wordmark/.test(chaosSplash), "ChaosSplash uses embedded cracked CHAOS / silver STANDARD wordmark");
assert(!/chaos-symbol-dark\.svg["']/.test(chaosSplash), "ChaosSplash must not use wrong cyan-squircle symbol");
assert(!/data-chaos-wordmark-fallback/.test(chaosSplash), "ChaosSplash must not use CSS typographic wordmark fallback");
const layout = read("src/app/layout.tsx");
assert(/Space_Grotesk|Space Grotesk/.test(layout), "display font is Space Grotesk (Chaos Standard)");
assert(/JetBrains_Mono|JetBrains Mono/.test(layout), "mono font is JetBrains Mono (Chaos Standard)");

console.log(failed ? `\nKEEP smoke: FAILED (${failed})` : "\nKEEP smoke: OK");
process.exit(failed ? 1 : 0);
