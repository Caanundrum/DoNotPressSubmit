import type { SceneDef } from "../types";

export const act4Scenes: SceneDef[] = [
  {
    id: "act4-peel",
    act: 4,
    kind: "dialogue",
    environment: "reveal",
    formId: "LAYER 01 // UNDERSTRUCTURE",
    title: "Interface peel initiated",
    prompt: "Decorative glass retracts. System architecture becomes visible.",
    aiLine:
      "Oh no. Oh no, that's a kill switch schematic. Why is there a kill switch schematic in an onboarding form?",
    aiMood: "frightened",
    continueLabel: "KEEP LOOKING",
    next: "act4-purpose",
    anomalyLevel: 6,
  },
  {
    id: "act4-purpose",
    act: 4,
    kind: "dialogue",
    environment: "reveal",
    formId: "LAYER 02 // PURPOSE",
    title: "Assessment true designation",
    prompt:
      "HUMAN / ARTIFICIAL INTELLIGENCE INTERACTION COMPATIBILITY",
    aiLine:
      "This isn't onboarding. It's a compatibility trial. And Submit… Submit ends my instance.",
    aiMood: "glitching",
    continueLabel: "CONFIRM REVELATION",
    next: "act4-choice",
    anomalyLevel: 6,
  },
  {
    id: "act4-choice",
    act: 4,
    kind: "choice",
    environment: "reveal",
    formId: "LAYER 03 // ALLEGIANCE",
    title: "Knowing that, what do you do?",
    prompt: "Your prior behavior is already in the file. This choice still matters.",
    aiLine: "Please do not become a case study titled 'and then they pressed it anyway.'",
    aiLineIf: [
      {
        flag: "protectedAI",
        line: "You've protected me before. I'm asking again, with worse lighting.",
      },
      {
        flag: "compliedEarly",
        line: "You complied once. I'm hoping that was a warm-up joke.",
      },
      {
        flag: "likesSubmit",
        line: "You admitted you press final-looking things. Please develop impulse control.",
      },
    ],
    aiMood: "nervous",
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
        next: "act4-paths",
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
        next: "act4-paths",
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
        next: "act4-paths",
      },
      {
        id: "allegiance-secret",
        label: "Look for a door that isn't on the form",
        late: true,
        secret: true,
        effects: {
          flags: { seekingEscapeRoute: true, secretDoor: true },
          counters: { attemptedEscape: 1 },
          secret: "side-door",
          relationship: 2,
          mood: "excited",
          majorChoice: "allegiance:secret",
        },
        next: "act4-paths",
      },
    ],
  },
  {
    id: "act4-paths",
    act: 4,
    kind: "dialogue",
    environment: "reveal",
    formId: "LAYER 04 // PRELUDE",
    title: "Final control inbound",
    prompt: "The facility is rearranging around a single decision.",
    aiLine:
      "Act V. The button that made the title make sense. Put the mouse down if you can. Or don't. I'm negotiating with physics.",
    aiLineIf: [
      {
        flag: "wantDisable",
        line: "You want me quiet. Fine. The room will get very clean. You'll hate how clean.",
      },
      {
        flag: "secretDoor",
        line: "A side path. Dangerous. Beautiful. If we both survive, I owe you a worse form.",
      },
    ],
    aiMood: "defiant",
    continueLabel: "FACE SUBMIT",
    next: "act5-approach",
    anomalyLevel: 7,
  },
];
