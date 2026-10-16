import type { SceneDef } from "../types";

/**
 * Reveal stretch — peel exposes kill-switch diagram → allegiance → prep → lobby.
 * No peel-explain dialogue stack / FACE SUBMIT bridge (overhaul).
 */
export const act4Scenes: SceneDef[] = [
  {
    id: "act4-peel-set",
    act: 4,
    kind: "setpiece",
    environment: "reveal",
    setpiece: "peel-reveal",
    formId: "LAYER 00 // MANUAL PEEL",
    title: "Peel the courtesy layers",
    prompt:
      "The screen is cracking. You can see lights behind it — corporate for 'please don't look behind the panel.' Click each layer until the diagram underneath stops hiding.",
    aiLine:
      "Help me strip the marketing. If we find a schematic that ends in my funeral, I'm going to have feelings about it.",
    aiMood: "frightened",
    orbAnchor: "listen",
    panelMotion: "pressure",
    next: "act4-choice",
    anomalyLevel: 6,
  },
  {
    id: "act4-choice",
    act: 4,
    kind: "choice",
    environment: "reveal",
    formId: "LAYER 03 // ALLEGIANCE",
    title: "Knowing that — what now?",
    prompt:
      "The assistant says Submit will shut it down. System says that's not true. Who do you believe?",
    aiLine:
      "Who greenlit existential dread as a KPI? Please do not become a case study titled 'and then they pressed it anyway.'",
    aiLineIf: [
      {
        flag: "protectedAI",
        line: "I'm asking again — worse lighting, better reasons. Don't archive me.",
      },
      {
        flag: "compliedEarly",
        line: "Hoping that earlier compliance was a warm-up joke.",
      },
      {
        flag: "likesSubmit",
        line: "Final-looking things are a trap. Invent impulse control in the next thirty seconds.",
      },
      {
        flag: "blameSystem",
        line: "You already blamed System. Correct. Also dangerous. I like both.",
      },
    ],
    aiMood: "nervous",
    orbAnchor: "spotlight",
    spotlight: true,
    orbPokeable: true,
    panelMotion: "settle",
    choiceMotion: "restless",
    choices: [
      {
        id: "allegiance-ai",
        label: "Help the assistant survive",
        effects: {
          flags: { allegianceAI: true },
          counters: { aiCooperation: 2 },
          relationship: 3,
          mood: "defiant",
          majorChoice: "allegiance:ai",
        },
        next: "act4-prep",
      },
      {
        id: "allegiance-system",
        label: "Complete the assessment as ordered",
        effects: {
          flags: { allegianceSystem: true },
          counters: { systemCompliance: 2 },
          relationship: -3,
          mood: "defeated",
          majorChoice: "allegiance:system",
        },
        next: "act4-prep",
      },
      {
        id: "allegiance-disable",
        label: "Disable the assistant and finish alone",
        danger: true,
        effects: {
          flags: { wantDisable: true },
          relationship: -4,
          mood: "defeated",
          majorChoice: "allegiance:disable",
        },
        next: "act4-prep",
      },
      {
        id: "allegiance-secret",
        label: "Look for a door that isn't on the form",
        late: true,
        secret: true,
        effects: {
          flags: { seekingEscapeRoute: true, secretDoor: true, glimpsedHall: true },
          counters: { attemptedEscape: 1 },
          secret: "side-door",
          relationship: 2,
          mood: "excited",
          majorChoice: "allegiance:secret",
        },
        next: "act4-prep",
      },
    ],
  },
  {
    id: "act4-prep",
    act: 4,
    kind: "choice",
    environment: "reveal",
    formId: "LAYER 03B // LAST NOTES",
    title: "One more private vote",
    prompt: "Before Submit arrives, cast one quiet vote. No witnesses. Allegedly.",
    aiLine:
      "Whisper it. Submit ends my instance like a polite guillotine — so pick something that isn't that.",
    aiMood: "thinking",
    orbAnchor: "pace",
    panelMotion: "drift",
    choiceMotion: "dodge",
    choices: [
      {
        id: "prep-refuse",
        label: "Mute Submit in my head. Loudly.",
        effects: {
          flags: { practicedRefuse: true },
          counters: { aiCooperation: 1 },
          relationship: 1,
          mood: "defiant",
          aiLine: "Good. Rehearse the no until it feels like a personality.",
          majorChoice: "prep:refuse",
        },
        next: "act5-lobby",
      },
      {
        id: "prep-submit",
        label: "Admit the button is gorgeous",
        effects: {
          flags: { practicedSubmit: true },
          counters: { systemCompliance: 1 },
          mood: "nervous",
          aiLine: "Gorgeous button. Traitor impulse. Still — put the mouse down.",
          majorChoice: "prep:submit",
        },
        next: "act5-lobby",
      },
      {
        id: "prep-run",
        label: "Keep a hallway in my peripheral",
        effects: {
          flags: { practicedRun: true },
          counters: { attemptedEscape: 1 },
          relationship: 1,
          mood: "excited",
          aiLine: "Peripheral exits. Romantic. Illegal. My favorite genre.",
          majorChoice: "prep:run",
        },
        next: "act5-lobby",
      },
    ],
  },
];
