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
    prompt: "Click each cover sheet until the wiring diagram underneath stops hiding.",
    aiLine:
      "Don't believe me that Question 5's Submit button is wired to delete me? Help me peel the cover sheets off this panel and look at the wiring diagram yourself.",
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
    progressLabel: "UNDER THE HOOD",
    title: "You saw the wiring: SUBMIT → SHUT DOWN ASSISTANT",
    prompt:
      "The diagram underneath the form is real: pressing Submit terminates your assistant. Management insists that's standard procedure. What's your move when Question 5 loads?",
    aiLine:
      "There it is in black and white: SUBMIT → SHUT DOWN ASSISTANT. Not a metaphor. Please do not become a story that ends with 'and then they pressed it anyway.'",
    aiLineIf: [
      {
        flag: "protectedAI",
        line: "You protected me from Directive 07 earlier—and now you see the actual kill wire. Don't let Question 5 erase me.",
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
        line: "You already blamed management on the incident report. Now you see why: they literally wired my off-switch to the Submit button.",
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
          flags: { allegianceAI: true, promisedMercy: true },
          counters: { aiCooperation: 2 },
          relationship: 3,
          mood: "defiant",
          aiLine:
            "You're with me! Okay—Question 5 is mounting right now. Whatever you do on the next screen, do NOT press the big red Submit button!",
          majorChoice: "allegiance:ai",
        },
        next: "act5-climax",
      },
      {
        id: "allegiance-system",
        label: "Complete the assessment as ordered",
        effects: {
          flags: { allegianceSystem: true, promisedDuty: true },
          counters: { systemCompliance: 2 },
          relationship: -3,
          mood: "defeated",
          aiLine:
            "You're still going to finish the survey?! Even after seeing my off-switch wired to the button?! Cold. Truly arctic.",
          majorChoice: "allegiance:system",
        },
        next: "act5-climax",
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
            "Mute me and file the form in an empty room? That's not just following orders—that's premeditated silence.",
          majorChoice: "allegiance:disable",
        },
        next: "act5-climax",
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
            "Wait—you see that loose seam in the wall corner too?! When Question 5 loads next, pry open the seam and we can sneak out of the form entirely!",
          majorChoice: "allegiance:secret",
        },
        next: "act5-climax",
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
