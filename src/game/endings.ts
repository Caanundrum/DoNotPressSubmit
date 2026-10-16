import type { EndingId, GameState } from "./types";

/**
 * Resolve climax choice into an ending scene id.
 * Each final button maps 1:1 — no refuse→escape upgrades (overhaul P0).
 */
export function resolveClimaxEnding(
  state: GameState,
  action: "submit" | "refuse" | "escape" | "disable" | "secret",
): { ending: EndingId; sceneId: string } {
  void state;
  if (action === "submit") {
    return { ending: "submit", sceneId: "ending-submit" };
  }
  if (action === "refuse") {
    return { ending: "refuse", sceneId: "ending-refuse" };
  }
  if (action === "escape") {
    return { ending: "escape", sceneId: "ending-escape" };
  }
  if (action === "secret") {
    return { ending: "secret", sceneId: "ending-secret" };
  }
  return { ending: "disable", sceneId: "ending-disable" };
}

/** Final climax always exposes all five endings — no flag-gated options (rev7). */
export function climaxOptions(state: GameState) {
  void state;
  return [
    { id: "submit" as const, label: "SUBMIT", tone: "danger" as const },
    { id: "refuse" as const, label: "LEAVE FORM UNFINISHED", tone: "ai" as const },
    { id: "escape" as const, label: "HELP THE ASSISTANT ESCAPE", tone: "ai" as const },
    { id: "disable" as const, label: "MUTE ASSISTANT AND FILE ALONE", tone: "sterile" as const },
    { id: "secret" as const, label: "SNEAK OUT THE UNMAPPED HALL", tone: "secret" as const },
  ];
}
