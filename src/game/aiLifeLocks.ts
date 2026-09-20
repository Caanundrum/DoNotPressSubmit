/**
 * Light AI-life regression locks (P2).
 * Keep these thresholds/anchors honest — do not “simplify” them away.
 */

/** Orb poke world events: crack → stitch → ticket. */
export const POKE_WORLD = {
  crack: 3,
  stitch: 7,
  ticket: 12,
} as const;

/** Form 12 (checkbox rebellion) must stay docked — pace clips the orb. */
export const FORM_12_SCENE_ID = "act3-checkbox";
export const FORM_12_ORB_ANCHOR = "dock-left" as const;

/** Ambient gag ids that must increment Ambient fiddling when they fire. */
export const AMBIENT_FIDDLE_IDS = [
  "replacement-failed",
  "printer-scissors",
  "coffee-mug",
  "chamber-07",
  "dashed-frame",
  "corridor-etiquette",
  "containment-fine",
] as const;

export type AmbientFiddleId = (typeof AMBIENT_FIDDLE_IDS)[number];

export function isAmbientFiddleId(id: string): id is AmbientFiddleId {
  return (AMBIENT_FIDDLE_IDS as readonly string[]).includes(id);
}

/** Dev-only assert: Form 12 never drifts off dock-left. */
export function assertForm12Dock(anchor: string | undefined, sceneId: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (sceneId !== FORM_12_SCENE_ID) return;
  if (anchor !== FORM_12_ORB_ANCHOR) {
    console.error(
      `[ai-life lock] Form 12 orb must stay ${FORM_12_ORB_ANCHOR} (got ${String(anchor)}) — pace clips.`,
    );
  }
}
