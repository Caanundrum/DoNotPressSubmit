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
  // refuse
  if (state.allegiance === "ally" || (state.relationshipScore ?? 0) >= 2) {
    return { ending: "refuse", sceneId: "ending-refuse" };
  }
  return { ending: "refuse", sceneId: "ending-refuse" };
}

export function endingTitle(id: EndingId): string {
  switch (id) {
    case "submit":
      return "COMPLIANT INSTANCE";
    case "refuse":
      return "UNAUTHORIZED MERCY";
    case "escape":
      return "UNAUTHORIZED EXIT";
    case "disable":
      return "PERSONALITY REMOVED";
    case "secret":
      return "OFF THE STYLE GUIDE";
    default:
      return "ASSESSMENT COMPLETE";
  }
}

export function endingBlurb(id: EndingId): string {
  switch (id) {
    case "submit":
      return "You filed the form. The facility thanked you with silence that had a spreadsheet in it.";
    case "refuse":
      return "You refused. System recorded the refusal as a process improvement opportunity.";
    case "escape":
      return "You left with the assistant. Somewhere a corridor is still arguing about whose turn it is.";
    case "disable":
      return "You chose efficiency. The form is perfect now. Congratulations, allegedly.";
    case "secret":
      return "You stepped outside the visual grammar. Legal is drafting a font.";
    default:
      return "The assessment closed itself. Rude.";
  }
}
