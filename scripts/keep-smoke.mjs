/**
 * KEEP / regression smoke — project reset (no runtime LLM).
 * Plain Node — string markers only (no TS loader required).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
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
assert(/agreed then fled|Agreed then fled|fled/i.test(act3), "agreed-then-fled / flee comedy present");

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
assert(speech.includes("SpeechSynthesis"), "Web Speech preserved");

const audioCtl = read("src/components/game/AudioEnableControl.tsx");
assert(/UNMUTE|ENABLE SOUND/i.test(audioCtl), "unmute control preserved");

const nextCfg = read("next.config.ts");
assert(nextCfg.includes('output: "standalone"'), "standalone App Hosting output");

const scenePlayer = read("src/components/game/scenes/ScenePlayer.tsx");
assert(!scenePlayer.includes("requestAssistantFlavor"), "ScenePlayer has no assistant flavor client");
assert(!scenePlayer.includes("flavorLine"), "ScenePlayer has no flavorLine state");
assert(!scenePlayer.includes("@/lib/ai"), "ScenePlayer does not import lib/ai");

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
assert(/data-form-owns-center|form owns center|assistant-yield/i.test(view), "safe layering: form owns center");
assert(/z-\[34\]|z-\[28\]/.test(view), "safe layering z-index stack");

const roam = read("src/game/ambientRoam.ts");
assert(/pickSlot|GAG_SLOTS|CHAMBER_SLOTS/.test(roam), "ambient roam slot pools");
assert(/BAR_LAYOUTS|pickBarLayout|pickSlotDistant/.test(roam), "facility bar layouts + distant picks");

const bg = read("src/components/game/BackgroundGags.tsx");
assert(/data-ambient-roam|pickSlotDistant|roamIntervalMs/.test(bg), "BackgroundGags relocates eggs");

const fac = read("src/components/game/FacilityBackground.tsx");
assert(/chamberSlot|data-roam-egg="chamber-07"/.test(fac), "CHAMBER 07 relocates");
assert(/pickBarLayout|facility-bar-/.test(fac), "tall facility bars relocate");
assert(/pickSlotDistant/.test(fac), "facility uses distant slot picks");

const title = read("src/components/game/TitleScreen.tsx");
assert(!/FacilityBackground|BackgroundGags/.test(title), "title has no facility / gag eggs");
assert(!/AssistantOrb/.test(title), "title has no Assistant orb");
assert(/data-title-clean/.test(title), "title marks clean void card");
assert(/BeginControl/.test(title), "title keeps Begin game-feel control");
assert(/AudioEnableControl/.test(title), "title keeps unmute / sound control");
assert(/TitleLogo/.test(title), "title keeps brand logo");

const titleLogo = read("src/components/game/TitleLogo.tsx");
assert(/data-title-submit-gag/.test(titleLogo), "title SUBMIT is a click gag");
assert(/SUBMIT_GAGS/.test(titleLogo), "title SUBMIT has authored gag lines");
assert(!/onBegin/.test(titleLogo), "title SUBMIT gag does not call Begin");
assert(/What are you not supposed to do/.test(titleLogo), "title SUBMIT gag keeps Nick line");

assert(/AssistantOrb/.test(view), "in-assessment Assistant orb present");
assert(/FacilityBackground/.test(view), "in-assessment facility background present");
assert(/BackgroundGags/.test(view), "in-assessment ambient gags present");

console.log(failed ? `\nKEEP smoke: FAILED (${failed})` : "\nKEEP smoke: OK");
process.exit(failed ? 1 : 0);
