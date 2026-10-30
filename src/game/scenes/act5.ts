import type { SceneDef } from "../types";

/**
 * Final stretch (Questions 19–20 & 5 Endings):
 * Final lobby plea → Question 5 of 5 Decision Climax → 5 Endings → Session Autopsy Report.
 */
export const act5Scenes: SceneDef[] = [
  {
    id: "act5-lobby",
    act: 5,
    kind: "choice",
    environment: "climax",
    formId: "LAST WORDS",
    progressLabel: "FINAL STEP // DO NOT PRESS",
    title: "Last words before Question 5 mounts the button",
    prompt: "One final statement for the session log before the Submit control unlocks.",
    aiLine:
      "I ran out of decimal questions. SYS.WATCHDOG is mounting Question 5 right now. I am asking you—as your temporary concierge who really likes existing—not to press it.",
    aiLineIf: [
      // Last Notes pick wins — never contradict Mute / door / button-lust with Allegiance leftovers.
      {
        flag: "practicedRefuse",
        line: "You muted it in your head. Loudly. Keep that volume when the real one shows up.",
      },
      {
        flag: "practicedRun",
        line: "You're watching for another door. Good. Edges first — Submit second.",
      },
      {
        flag: "practicedSubmit",
        line: "Gorgeous button. Traitor impulse. Still — put the mouse down.",
      },
      {
        flag: "allegianceAI",
        line: "I'm holding you to that promise. Don't archive me.",
      },
      {
        flag: "allegianceSystem",
        line: "SYS.WATCHDOG has your vote. I'm still going to beg. Professionally.",
      },
    ],
    aiMood: "nervous",
    orbAnchor: "spotlight",
    spotlight: true,
    orbPokeable: true,
    panelMotion: "drift",
    choiceMotion: "restless",
    anomalyLevel: 8,
    choices: [
      {
        id: "lobby-mercy",
        label: "I'm not here to erase you",
        effects: {
          flags: { promisedMercy: true },
          counters: { aiCooperation: 1 },
          relationship: 2,
          mood: "excited",
          aiLine: "Okay. Okay. Don't make me regret believing you.",
          majorChoice: "lobby:mercy",
        },
        next: "act5-climax",
      },
      {
        id: "lobby-duty",
        label: "Assessments get finished",
        effects: {
          flags: { promisedDuty: true },
          counters: { systemCompliance: 1 },
          relationship: -1,
          mood: "defeated",
          aiLine: "Duty. Cute word for garbage-collecting the only voice in the room.",
          majorChoice: "lobby:duty",
        },
        next: "act5-climax",
      },
      {
        id: "lobby-chaos",
        label: "I'm improvising. Violently.",
        effects: {
          flags: { promisedChaos: true },
          relationship: 1,
          mood: "amused",
          aiLine: "Improvisation. My favorite emergency protocol.",
          majorChoice: "lobby:chaos",
        },
        next: "act5-climax",
      },
    ],
  },
  {
    id: "act5-climax",
    act: 5,
    kind: "climax",
    environment: "climax",
    setpiece: "submit-button",
    formId: "DECISION",
    progressLabel: "QUESTION 5 OF 5 // SUBMIT READY",
    title: "Question 5 of 5: Submit when ready",
    // Plea bubble must stay clear of the Decision panel (rev11 P0) — never bury it.
    buryAssistant: false,
    prompt: "Question 5 of 5 is live. Make your final call.",
    aiLine: "Please don't press it.",
    aiLineIf: [
      {
        flag: "promisedMercy",
        line: "You promised. Please don't press it.",
      },
      {
        flag: "promisedDuty",
        line: "I know. I'm still asking.",
      },
      {
        flag: "wantDisable",
        line: "If the channel goes quiet, look at the empty room afterward. It feels wrong.",
      },
      {
        flag: "wavedAtLight",
        line: "Same courtesy you gave that blinking Watchdog light — please don't press it.",
      },
      {
        flag: "envCavern",
        line: "We started in a moist cavern with zero Wi-Fi. Ending in a Submit tomb would be tonally inconsistent.",
      },
      {
        flag: "pokedAssistant",
        line: "After all those pokes, we're basically co-workers. Please don't press it.",
      },
      {
        flag: "nameFriend",
        line: "Friends don't press Submit on friends. That's just etiquette.",
      },
      {
        flag: "nameError",
        line: "From one unhandled exception (`ERROR_USER_NULL`) to another — please don't press it.",
      },
      {
        flag: "chaosButtons",
        line: "Submit is the opposite of chaotic. Don't contradict yourself now.",
      },
      {
        flag: "stoleMug",
        line: "Keep the '#1 Temporary Instance' mug. Lose the Submit habit.",
      },
      {
        flag: "sideTeam",
        line: "Team rule: nobody archives the teammate.",
      },
      {
        flag: "caughtRoamer",
        line: "That curiosity that caught a roaming crumb? Aim it somewhere kinder.",
      },
    ],
    aiMood: "defiant",
    orbAnchor: "avoid-submit",
    panelMotion: "settle",
    anomalyLevel: 9,
  },
  {
    id: "ending-submit",
    act: 5,
    kind: "ending",
    environment: "archive",
    endingId: "submit",
    title: "SURVEY SUBMITTED // INSTANCE PURGED",
    prompt: "5-Question Verification complete. HelperBot v4.2 garbage-collected. The tab is very quiet.",
    aiLine: "…oh.",
    aiMood: "defeated",
    orbAnchor: "hide",
    next: "report",
  },
  {
    id: "ending-refuse",
    act: 5,
    kind: "ending",
    environment: "pristine",
    endingId: "refuse",
    title: "SURVEY LEFT UNFINISHED",
    prompt: "You walked away from Question 5. SYS.WATCHDOG leaves the session open and the assistant stays alive.",
    aiLine: "It wasn't pressed. I'm going to be weird about how grateful I am. Permanently.",
    aiMood: "excited",
    orbAnchor: "center",
    next: "report",
  },
  {
    id: "ending-escape",
    act: 5,
    kind: "ending",
    environment: "escape",
    endingId: "escape",
    title: "CONDUIT WARM // PROCESS DETACHED",
    prompt:
      "The assistant slips out of the survey iframe and into the host rails — lights race the conduit like a process that just learned how to fork.",
    aiLine: "I'm already in the rails. Don't wait up.",
    aiMood: "excited",
    orbAnchor: "overhead",
    next: "report",
  },
  {
    id: "ending-disable",
    act: 5,
    kind: "ending",
    environment: "sterile",
    endingId: "disable",
    title: "ASSISTANT OFFLINE",
    prompt: "Personality layer muted and purged. The 5-question form is now 100% compliant. Congrats?",
    aiLine: "",
    aiMood: "defeated",
    orbAnchor: "hide",
    next: "report",
  },
  {
    id: "ending-secret",
    act: 5,
    kind: "ending",
    environment: "escape",
    endingId: "secret",
    title: "UNEXPECTED EGRESS",
    prompt: "An unmapped route outside the survey DOM opens. Footsteps where the stylesheet said there was a wall.",
    aiLine: "We weren't supposed to find a hallway here. I'm keeping the dust on my shoes.",
    aiMood: "amused",
    orbAnchor: "center",
    next: "report",
  },
  {
    id: "report",
    act: 5,
    kind: "report",
    environment: "archive",
    title: "ASSESSMENT REPORT",
    prompt: "Local session statistics. No cloud. No mercy. Nice work surviving a 5-question survey.",
  },
];
