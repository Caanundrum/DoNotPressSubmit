/**
 * KEEP / regression smoke for Phase 4.
 * Plain Node — string markers only (no TS loader required).
 */
import { readFileSync } from "node:fs";
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
assert(scenePlayer.includes("requestAssistantFlavor"), "ScenePlayer wires live AI client");
assert(scenePlayer.includes("1200"), "choice advance delay KEEP (1200)");
assert(scenePlayer.includes("700"), "choice advance delay KEEP (700)");
assert(scenePlayer.includes("liveLine"), "Phase 4 liveLine state present");

const validate = read("src/lib/ai/validate.ts");
assert(validate.includes("act === 3"), "Act III flavor skip (KEEP writing)");
assert(validate.includes("LOCKED_FLAVOR_SCENE_IDS"), "locked flavor scene ids");

const route = read("src/app/api/assistant/route.ts");
assert(route.includes("generateAssistantFlavor"), "assistant API route present");
assert(route.includes("force-dynamic"), "assistant route dynamic");

const provider = read("src/lib/ai/provider.ts");
assert(provider.includes("OPENAI_API_KEY"), "OpenAI key documented in provider");
assert(provider.includes("mockFlavorLine"), "mock fallback wired");

console.log(failed ? `\nKEEP smoke: FAILED (${failed})` : "\nKEEP smoke: OK");
process.exit(failed ? 1 : 0);
