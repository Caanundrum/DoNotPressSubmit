/**
 * Build-time baked VO stubs (P1 #13).
 *
 * Writes short character-ish WAV takes per line ID × mood into public/audio/vo/.
 * No runtime speechSynthesis. No cloud TTS API.
 *
 * These are PLACEHOLDER takes (improved additive formant stubs) so playback
 * plumbing ships without silence/404s. Real recorded character VO is still a
 * follow-up — keep filenames `{lineId}--{mood}.wav` when swapping assets.
 *
 *   node scripts/bake-voice.mjs
 *
 * Wired from npm run predev / prebuild.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "audio", "vo");

/** @typedef {"calm"|"petty"|"alarmed"} VoiceMood */

const MOODS = /** @type {const} */ (["calm", "petty", "alarmed"]);

/** Hero beats — real VO targets; stubs for now. */
const HERO_IDS = [
  "hero-title",
  "hero-system-override",
  "hero-ending-submit",
  "hero-ending-refuse",
  "hero-ending-escape",
  "hero-ending-disable",
  "hero-ending-secret",
];

/** High-volume poke banter buckets (text hashed → poke-NN at runtime). */
const POKE_COUNT = 24;

/**
 * Expand scene coverage: every playable scene id that ScenePlayer may request
 * via sceneLineId(scene.id). Endings use hero-ending-* instead; report is silent.
 */
function collectSceneLineIds() {
  const scenesDir = join(root, "src", "game", "scenes");
  const ids = [];
  for (const name of readdirSync(scenesDir)) {
    if (!/^act\d\.ts$/.test(name)) continue;
    const text = readFileSync(join(scenesDir, name), "utf8");
    const re = /^\s{4}id:\s*"([^"]+)"/gm;
    let m;
    while ((m = re.exec(text))) {
      const id = m[1];
      if (id === "report" || id.startsWith("ending-")) continue;
      ids.push(`scene-${id}`);
    }
  }
  return ids;
}

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // Match runtime pokeLineId: keep FNV unsigned so ids stay poke-NN not poke--N.
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function moodParams(mood) {
  switch (mood) {
    case "petty":
      return { base: 188, buzz: 0.48, rate: 1.08, bright: 1.22, dur: 0.82, vibrato: 5.2, breath: 0.04 };
    case "alarmed":
      return { base: 228, buzz: 0.72, rate: 1.22, bright: 1.38, dur: 0.66, vibrato: 7.5, breath: 0.06 };
    default:
      return { base: 162, buzz: 0.32, rate: 0.94, bright: 1.0, dur: 1.02, vibrato: 3.6, breath: 0.03 };
  }
}

/**
 * Improved stub “character voice” — still not intelligible speech, but warmer
 * formants + vibrato + soft noise so hero/poke paths feel less empty than
 * the first-pass sine stubs. Distinct per id/mood.
 */
function synthesizePcm(lineId, mood) {
  const p = moodParams(mood);
  const seed = hashSeed(`${lineId}::${mood}`);
  const sampleRate = 22050;
  const duration = p.dur + ((seed % 21) / 100);
  const n = Math.floor(sampleRate * duration);
  const data = new Float32Array(n);

  const f0 = p.base + (seed % 41);
  const f1 = f0 * 2.05;
  const f2 = f0 * 3.25 * p.bright;
  const f3 = f0 * 4.1;
  const syllables = 5 + (seed % 6);
  const contour = 1 + ((seed % 9) - 4) * 0.012;

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const prog = t / duration;
    // Soft attack / release so stubs don't click.
    const env =
      Math.min(1, t * 22) *
      Math.min(1, (duration - t) * 12) *
      (0.62 + 0.38 * Math.sin(2 * Math.PI * syllables * prog * p.rate));
    const vib = 1 + 0.012 * Math.sin(2 * Math.PI * p.vibrato * t);
    const pitch = f0 * contour * vib * (1 + 0.04 * Math.sin(2 * Math.PI * 0.7 * prog));
    const buzz = Math.sin(2 * Math.PI * pitch * t * p.rate);
    // Cheap “glottal” shaping — soft clip of buzz before formants.
    const glottal = Math.tanh(buzz * (1.35 + p.buzz * 0.4));
    const form =
      0.42 * glottal +
      0.26 * Math.sin(2 * Math.PI * f1 * t * p.rate + glottal * p.buzz) +
      0.16 * Math.sin(2 * Math.PI * f2 * t + 0.3) +
      0.08 * Math.sin(2 * Math.PI * f3 * t * 0.98) +
      p.breath * (((seed >> ((i + 3) % 11)) & 1) * 2 - 1);
    data[i] = form * env * 0.3;
  }
  return { sampleRate, data };
}

function floatToWav(sampleRate, data) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = data.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  return buffer;
}

function writeTake(lineId, mood) {
  const { sampleRate, data } = synthesizePcm(lineId, mood);
  const wav = floatToWav(sampleRate, data);
  const file = join(outDir, `${lineId}--${mood}.wav`);
  writeFileSync(file, wav);
  return file;
}

mkdirSync(outDir, { recursive: true });

const SCENE_IDS = collectSceneLineIds();
const ids = [
  ...HERO_IDS,
  ...SCENE_IDS,
  ...Array.from({ length: POKE_COUNT }, (_, i) => `poke-${String(i).padStart(2, "0")}`),
];

let written = 0;
for (const id of ids) {
  for (const mood of MOODS) {
    writeTake(id, mood);
    written += 1;
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  format: "wav",
  moods: [...MOODS],
  lineIds: ids,
  sceneCoverage: SCENE_IDS.length,
  stubQuality: "formant-v2",
  notes:
    "STUB character takes (improved formant synthesis) — NOT recorded VO. Replace with real character VO / neural bake when assets land; keep filenames {lineId}--{mood}.wav. Hero + poke + all playable scene-* ids covered to avoid silence/404s.",
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const readme = `# Baked VO stubs

Generated by \`node scripts/bake-voice.mjs\` (also \`predev\` / \`prebuild\`).

## What ships today (honest)

| Layer | Status |
| --- | --- |
| Player path | baked WAV via \`speech.speakLine\` → \`/audio/vo/{lineId}--{mood}.wav\` |
| Live \`speechSynthesis\` | **off** (never a player path) |
| Runtime cloud TTS / LLM | **none** |
| Hero | **formant stubs**: \`hero-title\`, \`hero-system-override\`, \`hero-ending-*\` |
| Banter | **formant stubs**: \`poke-00\` … \`poke-23\` |
| Scenes | **formant stubs**: all playable \`scene-{sceneId}\` from act1–5 |
| Recorded character VO | **not shipped** — swap files in place when assets land |

Moods: calm / petty / alarmed.

WAV files are gitignored; regenerate on \`predev\` / \`prebuild\`. Ambience ducks under VO.
`;
writeFileSync(join(outDir, "README.md"), readme);

console.log(
  `bake-voice: wrote ${written} takes (${SCENE_IDS.length} scenes + hero + poke) → ${existsSync(outDir) ? "public/audio/vo" : outDir}`,
);
