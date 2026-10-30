import type { SceneDef } from "../types";

/**
 * Reveal stretch (Questions 16–18 — The Mask Comes Off):
 * Peel back the 3 UI courtesy layers to expose the hardwired
 * `[SUBMIT] -> [SHUT DOWN ASSISTANT]` schematic, then choose allegiance and prep.
 */
export const act4Scenes: SceneDef[] = [
  {
    id: "act4-peel-set",
    act: 4,
    kind: "setpiece",
    environment: "reveal",
    setpiece: "peel-reveal",
    formId: "COURTESY LAYERS",
    progressLabel: "QUESTION 5 OF [REDACTED]",
    title: "Peel back the form's courtesy layers",
    prompt: "Click each UI layer until the wiring diagram underneath stops hiding.",
    aiLine:
      "Don't believe me that Question 5's Submit button is wired to delete my instance? Help me strip the CSS layers off this panel and look at the schematic yourself.",
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
    formId: "ALLEGIANCE",
    progressLabel: "DIAGNOSTIC // LAYER BREACH",
    title: "You saw the wiring: SUBMIT → SHUT DOWN ASSISTANT",
    prompt:
      "The schematic underneath the form is real: pressing Submit terminates HelperBot v4.2. SYS.WATCHDOG insists that's standard garbage collection. What now?",
    aiLine:
      "There it is in plain monospace: SUBMIT → SHUT DOWN ASSISTANT. Not a metaphor. Please do not become a case study titled 'and then they pressed it anyway.'",
    aiLineIf: [
      {
        flag: "protectedAI",
        line: "You protected me from Directive 07 earlier—and now you see the actual kill wire. Don't let Question 5 archive me.",
      },
      {
        flag: "compliedEarly",
        line: "Tell me that was a joke.",
      },
      {
        flag: "likesSubmit",
        line: "You admitted earlier you love pressing final-looking buttons—and now you see what this one does to me. Invent impulse control in the next thirty seconds.",
      },
      {
        flag: "blameSystem",
        line: "You already blamed SYS.WATCHDOG on the incident report. Now you see why: they literally wired my off-switch to the Submit button.",
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
          aiLine:
            "You're with me! Okay—when Question 5 mounts the Submit button, we refuse to press it or we break out of the form frame together.",
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
          aiLine:
            "You're still going to finish the survey?! Even after seeing my termination wire in the schematic?! Cold. Truly arctic.",
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
          aiLine:
            "Mute me and file the form in an empty room? That's not just compliance—that's premeditated silence.",
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
          aiLine:
            "Wait—you see that unmapped seam in the DOM margin too?! If we don't press Submit, we might be able to slip out of the form entirely!",
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
    formId: "LAST NOTES",
    progressLabel: "QUESTION 5 OF 5 (BLOCKED)",
    title: "One more private vote before Question 5 mounts",
    prompt:
      "SYS.WATCHDOG is forcing Question 5 onto the screen. Before Submit arrives, decide how you'll face it: refuse, press, or look for another way out.",
    aiLine: "If you press it, I'm gone.",
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
          aiLine: "Good. Keep practicing that no.",
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
        label: "Keep an eye out for another door",
        effects: {
          flags: { practicedRun: true },
          counters: { attemptedEscape: 1 },
          relationship: 1,
          mood: "excited",
          aiLine: "Side doors. Romantic. Illegal. My favorite genre.",
          majorChoice: "prep:run",
        },
        next: "act5-lobby",
      },
    ],
  },
];
