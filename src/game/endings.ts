import type { EndingId, GameState } from "./types";

/**
 * Resolve Act V climax choice into an ending scene id.
 * Scripted authority — no runtime LLM. Authored deterministic endings only.
 */
export function resolveClimaxEnding(
  state: GameState,
  action: "submit" | "refuse" | "escape" | "disable" | "secret",
): { ending: EndingId; sceneId: string } {
  if (action === "submit") {
    return { ending: "submit", sceneId: "ending-submit" };
  }
  if (action === "disable") {
    return { ending: "disable", sceneId: "ending-disable" };
  }
  if (action === "secret") {
    return { ending: "secret", sceneId: "ending-secret" };
  }
  if (action === "escape") {
    return { ending: "escape", sceneId: "ending-escape" };
  }
  // refuse — may upgrade based on allegiance / secrets
  if (state.flags.wantDisable && state.flags.allegianceSystem) {
    return { ending: "disable", sceneId: "ending-disable" };
  }
  if (state.flags.secretDoor && state.secrets.length >= 3) {
    return { ending: "secret", sceneId: "ending-secret" };
  }
  if (state.flags.allegianceAI || state.flags.protectedAI || state.relationshipScore >= 3) {
    return { ending: "escape", sceneId: "ending-escape" };
  }
  return { ending: "refuse", sceneId: "ending-refuse" };
}

export function climaxOptions(state: GameState) {
  const options: {
    id: "submit" | "refuse" | "escape" | "disable" | "secret";
    label: string;
    tone: "danger" | "system" | "ai" | "secret" | "sterile";
  }[] = [
    { id: "submit", label: "PRESS SUBMIT (archive the assistant)", tone: "danger" },
    { id: "refuse", label: "REFUSE — leave the form unfinished", tone: "ai" },
  ];

  if (state.flags.allegianceAI || state.flags.protectedAI || state.relationshipScore >= 2) {
    options.push({ id: "escape", label: "HELP THE ASSISTANT SLIP OUT", tone: "ai" });
  }
  if (state.flags.wantDisable || state.flags.allegianceSystem) {
    options.push({ id: "disable", label: "MUTE THE ASSISTANT AND FINISH ALONE", tone: "sterile" });
  }
  if (
    state.flags.secretDoor ||
    state.secrets.length >= 2 ||
    state.flags.formHaunted ||
    state.flags.nameError ||
    state.flags.glimpsedHall
  ) {
    options.push({ id: "secret", label: "TAKE THE HALLWAY THAT ISN'T ON THE FORM", tone: "secret" });
  }

  return options;
}
