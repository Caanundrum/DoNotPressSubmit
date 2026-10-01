import type { OrbMood } from "@/game/types";

/** Voice take buckets for baked VO / stub assets. */
export type VoiceMood = "calm" | "petty" | "alarmed";

/** Map assistant orb mood → VO take variant. */
export function voiceMoodFromOrb(mood: OrbMood | undefined | null): VoiceMood {
  switch (mood) {
    case "amused":
    case "excited":
    case "defiant":
    case "irritated":
    case "skeptical":
      return "petty";
    case "nervous":
    case "confused":
    case "frightened":
    case "glitching":
    case "defeated":
    case "suspicious":
      return "alarmed";
    default:
      return "calm";
  }
}

/** Stable poke-banter bucket (poke-00 … poke-23). */
export function pokeLineId(text: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    // Keep FNV step unsigned — Math.imul is signed int32; negative h % 24
    // produced poke + double-dash + N paths that 404'd against baked poke-NN files.
    h = Math.imul(h, 16777619) >>> 0;
  }
  const idx = h % 24;
  return `poke-${String(idx).padStart(2, "0")}`;
}

export function sceneLineId(sceneId: string): string {
  return `scene-${sceneId}`;
}

export function endingLineId(endingId: string): string {
  return `hero-ending-${endingId}`;
}

export function voiceAssetPath(lineId: string, mood: VoiceMood): string {
  return `/audio/vo/${lineId}--${mood}.wav`;
}
