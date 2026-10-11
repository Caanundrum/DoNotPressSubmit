import type { SceneDef } from "../types";

export const act1Scenes: SceneDef[] = [
  {
    id: "act1-welcome",
    act: 1,
    kind: "dialogue",
    environment: "pristine",
    formId: "FORM 00 // ORIENTATION",
    title: "Human Compatibility & Onboarding",
    prompt:
      "You are seated in a facility that spent real money looking trustworthy. Confirm you are ready for a perfectly ordinary assessment.",
    aiLine:
      "Hi. I'm the assistant. I'll be charming, precise, and only slightly judgmental. If anything weird crawls onto the form, pretend we both imagined it.",
    aiMood: "neutral",
    orbAnchor: "spotlight",
    spotlight: true,
    orbPokeable: true,
    panelMotion: "rise",
    continueLabel: "I'M READY. PROBABLY.",
    next: "act1-name",
  },
];
