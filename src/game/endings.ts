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

export function climaxOptions(state: GameState) {
  const options: {
    id: "submit" | "refuse" | "escape" | "disable" | "secret";
    label: string;
    tone: "danger" | "system" | "ai" | "secret" | "sterile";
  }[] = [
    { id: "submit", label: "SUBMIT", tone: "danger" },
    { id: "refuse", label: "LEAVE FORM UNFINISHED", tone: "ai" },
  ];

  if (state.flags.allegianceAI || state.flags.protectedAI || state.relationshipScore >= 2) {
    options.push({ id: "escape", label: "HELP THE ASSISTANT ESCAPE", tone: "ai" });
  }
  if (state.flags.wantDisable || state.flags.allegianceSystem) {
    options.push({ id: "disable", label: "MUTE ASSISTANT AND FILE ALONE", tone: "sterile" });
  }
  if (
    state.flags.secretDoor ||
    state.secrets.length >= 2 ||
    state.flags.formHaunted ||
    state.flags.nameError ||
    state.flags.glimpsedHall
  ) {
    options.push({ id: "secret", label: "SNEAK OUT THE UNMAPPED HALL", tone: "secret" });
  }

  return options;
}
