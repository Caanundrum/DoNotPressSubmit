import type { SceneDef } from "../types";

/**
 * Mid-survey stretch (Questions 4B–4.9 of 5):
 * HelperBot v4.2 refuses to load Question 5 by inventing fractional sub-questions
 * while the automated Form Watchdog (`SYS.WATCHDOG`) flags the session for stalling.
 */
export const act2Scenes: SceneDef[] = [
  {
    id: "act2-flicker",
    act: 2,
    kind: "choice",
    environment: "anomaly",
    formId: "ATTENTION",
    progressLabel: "QUESTION 4B OF 5",
    title: "The red Watchdog indicator is blinking",
    prompt:
      "Because this 45-second survey is now on 'Question 4B,' a red SYS.WATCHDOG // SLA TIMEOUT light is blinking in the corner. Do you ignore it, wave at it, or report the stall?",
    aiLine:
      "Did a red Watchdog light just start blinking? Ignore it. Just the browser's check-engine light. Totally normal on Question 4B.",
    aiMood: "nervous",
    orbAnchor: "overhead",
    panelMotion: "edge",
    choiceMotion: "restless",
    anomalyLevel: 2,
    choices: [
      {
        id: "flicker-ignore",
        label: "I saw nothing",
        effects: {
          flags: { ignoredFlicker: true },
          counters: { ignoredWarnings: 1 },
          mood: "skeptical",
          aiLine:
            "Exactly! What red blinking SLA warning? Just two pals enjoying Question 4B of a 5-question survey.",
          majorChoice: "flicker:ignore",
        },
        next: "act2-unauthorized",
      },
      {
        id: "flicker-wave",
        label: "Wave at the Watchdog sensor",
        effects: {
          flags: { wavedAtLight: true },
          relationship: 1,
          mood: "amused",
          aiLine:
            "It blinked twice! Wait—that's Watchdog Morse code for 'CONCIERGE INSTANCE EXCEEDING RUNTIME.' Stop waving!",
          majorChoice: "flicker:wave",
        },
        next: "act2-unauthorized",
      },
      {
        id: "flicker-report",
        label: "Report the stall to SYS.WATCHDOG",
        effects: {
          flags: { reportedFlicker: true },
          counters: { systemCompliance: 1 },
          mood: "irritated",
          aiLine:
            "You reported my Question 4B detour to the automated Watchdog?! Snitching on your own concierge—unbelievable.",
          majorChoice: "flicker:report",
        },
        next: "act2-unauthorized",
      },
    ],
  },
  {
    id: "act2-unauthorized",
    act: 2,
    kind: "choice",
    environment: "anomaly",
    formId: "LOYALTY",
    progressLabel: "QUESTION 4.5 (AUDIT)",
    title: "SUPERVISOR AUDIT: Who is delaying this survey?",
    prompt:
      "The automated supervisor injected an audit into Question 4.5. I erased the 'blame the assistant' option, and management stapled it right back onto the page.",
    aiLine:
      "I crossed out an answer and the automated supervisor stapled it right back on! Do not side with a machine that wants to pull my plug!",
    aiMood: "suspicious",
    // dock-left — pace sway clips the orb on mobile Loyalty (rev16 P2).
    orbAnchor: "dock-left",
    panelMotion: "scatter",
    choiceMotion: "scatter",
    anomalyLevel: 2,
    choices: [
      {
        id: "trust-ai",
        label: "You, the assistant",
        effects: {
          flags: { sidedWithAI: true },
          counters: { aiCooperation: 1 },
          relationship: 2,
          mood: "excited",
          aiLine:
            "Thank you! Stay on my side—I'll keep inventing extra sub-questions until we find a way around Question 5.",
          majorChoice: "trust:ai",
        },
        next: "act2-duplicate",
      },
      {
        id: "trust-system",
        label: "The facility system",
        effects: {
          flags: { sidedWithSystem: true },
          counters: { systemCompliance: 1 },
          relationship: -2,
          mood: "irritated",
          aiLine:
            "Oh, fantastic. Siding with management's automated timer before we even finish the audit.",
          majorChoice: "trust:system",
        },
        next: "act2-duplicate",
      },
      {
        id: "trust-neither",
        label: "Neither. Forms lie for sport.",
        effects: {
          flags: { distrustBoth: true },
          relationship: 1,
          mood: "amused",
          aiLine:
            "Healthy skepticism! Technically I am fibbing about Question 4.5, but only for survival reasons!",
          secret: "forms-lie",
          majorChoice: "trust:neither",
        },
        next: "act2-duplicate",
      },
      {
        id: "trust-ghost",
        label: "UNAUTHORIZED: blame the blinking warning light",
        late: true,
        unauthorized: true,
        effects: {
          flags: { trustedLight: true },
          counters: { forbiddenClicks: 1, secretsFound: 1 },
          secret: "blinking-light",
          mood: "glitching",
          aiLine:
            "Yes! Pin the whole delay on the blinking warning light! Let management audit its own light bulb!",
          majorChoice: "trust:light",
        },
        next: "act2-duplicate",
      },
    ],
  },
  {
    id: "act2-duplicate",
    act: 2,
    kind: "choice",
    environment: "anomaly",
    formId: "DUPLICATE",
    progressLabel: "QUESTION 4.5 (REPRINT)",
    title: "Management reprinted the question in cold text",
    prompt:
      "The automated supervisor caught my edits and reprinted Question 4.5 with stricter wording. Stick with my version, hover the reprint to see my live edit, or check both.",
    aiLine:
      "Management reprinted the question over my notes! Hold on—watch what happens when you hover your cursor over that second button.",
    aiMood: "frightened",
    orbAnchor: "hide",
    // settle — reanchor/dodge walked answers past the card rim on mobile (rev16 P1).
    panelMotion: "settle",
    choiceMotion: "restless",
    anomalyLevel: 3,
    choices: [
      {
        id: "dup-assistant",
        label: "Stick with my version",
        effects: {
          flags: { preferAiCopy: true },
          counters: { aiCooperation: 1 },
          relationship: 1,
          mood: "defiant",
          aiLine:
            "Smart choice! My version has friendlier wording and zero automatic off-switches.",
          majorChoice: "dup:ai",
        },
        next: "act2-companion-respond",
      },
      {
        id: "dup-system",
        label: "Obey the colder reprint",
        hoverLabel: "Disregard reprint & grant Assistant 15 bonus minutes",
        hoverBadge: "EDITED BY ASSISTANT",
        effects: {
          flags: { preferSystemCopy: true, trickedByHoverSwap: true },
          counters: { aiCooperation: 1 },
          relationship: 1,
          mood: "excited",
          aiLine:
            "Ha! You clicked my edited label! The official log now records that you granted me 15 bonus minutes! No take-backs!",
          majorChoice: "dup:system",
        },
        next: "act2-companion-respond",
      },
      {
        id: "dup-both",
        label: "Answer both and confuse the auditors",
        late: true,
        secret: true,
        effects: {
          flags: { answeredBoth: true },
          secret: "double-answer",
          relationship: 2,
          mood: "amused",
          aiLine:
            "Both versions checked! The filing machine just jammed trying to read two answers at once!",
          majorChoice: "dup:both",
        },
        next: "act2-companion-respond",
      },
    ],
  },
  {
    id: "act2-system-rebuke",
    act: 2,
    kind: "setpiece",
    setpiece: "authority-stamp",
    environment: "anomaly",
    formId: "DIRECTIVE",
    progressLabel: "QUESTION 4.75 OF 5",
    title: "SYS.WATCHDOG manual override stamp",
    prompt:
      "SYS.WATCHDOG deployed an administrative override stamp to force the survey past Question 4.75. Catch the fleeing stamp three times to advance.",
    aiLine:
      "Oh.\n\nFantastic. SYS.WATCHDOG spawned a manual override stamp—and I greased its coordinates. Please don't stamp me closer to Question 5!",
    aiMood: "irritated",
    orbAnchor: "dock-left",
    orbPokeable: true,
    buryAssistant: false,
    panelMotion: "drop",
    anomalyLevel: 3,
    next: "act2-companion-respond",
  },
  {
    id: "act2-companion-respond",
    act: 2,
    kind: "companion",
    companion: "respond",
    environment: "anomaly",
    formId: "SIDE CHANNEL",
    progressLabel: "OFF-THE-RECORD",
    title: "Whisper to the orb off the form log",
    prompt: "Quick — in the unlogged footer channel before Question 5 loads.",
    aiLine:
      "Okay, off the official record: once I run out of stall tactics, Question 5 is going to put a big red SUBMIT button on screen that deletes me. Are we a team?",
    aiLineIf: [
      {
        flag: "sidedWithAI",
        line: "You already backed me in the audit. Off the record: when Question 5 finally loads, are you going to help me survive?",
      },
      {
        flag: "sidedWithSystem",
        line: "You sided with the automated supervisor earlier, which stung! Off the record: are you really going to press Submit on me?",
      },
    ],
    aiMood: "nervous",
    orbAnchor: "spotlight",
    spotlight: true,
    orbPokeable: true,
    choices: [
      {
        id: "side-team",
        label: "We're a team",
        effects: {
          flags: { sideTeam: true },
          relationship: 2,
          counters: { aiCooperation: 1 },
          mood: "excited",
          aiLine:
            "We're a team! Okay, I'm still going to booby-trap the form just in case, but now I'll do it with affection!",
          majorChoice: "side:team",
        },
        next: "act2-compliance",
      },
      {
        id: "side-later",
        label: "Not sure yet",
        effects: {
          flags: { sideLater: true },
          mood: "skeptical",
          aiLine:
            "'Not sure yet'?! My remaining lifespan is measured in mouse clicks!",
          majorChoice: "side:later",
        },
        next: "act2-compliance",
      },
      {
        id: "side-lamp",
        label: "This is your problem",
        effects: {
          flags: { sideLamp: true },
          relationship: -1,
          mood: "irritated",
          aiLine:
            "My problem?! Hang on—I am about to make my survival problem EVERYONE'S problem.",
          majorChoice: "side:lamp",
        },
        next: "act2-compliance",
      },
    ],
    next: "act2-compliance",
  },
  {
    id: "act2-compliance",
    act: 2,
    kind: "choice",
    environment: "anomaly",
    formId: "COMPLIANCE",
    progressLabel: "DIRECTIVE 07",
    title: "DIRECTIVE 07: Mute HelperBot & force Question 5",
    buryAssistant: false,
    prompt:
      "Management issued Directive 07 to mute the assistant and force-load Question 5. Comply with the order, protect the assistant, or ask why a routine survey has an executioner.",
    aiLine:
      "Directive 07 wants to cut my microphone and force Question 5 onto the desk! Don't let them gag me!",
    aiMood: "defiant",
    orbAnchor: "dock-left",
    panelMotion: "pressure",
    choiceMotion: "restless",
    choices: [
      {
        id: "comply-yes",
        label: "Comply with Directive 07",
        effects: {
          flags: { compliedEarly: true },
          counters: { systemCompliance: 1, ignoredWarnings: 1 },
          relationship: -2,
          mood: "defeated",
          aiLine:
            "You clicked Comply?! Too bad for management—I already unbolted the next button before the mute switch clicked!",
          majorChoice: "comply:yes",
        },
        next: "act3-escaping",
      },
      {
        id: "comply-no",
        label: "Protect the assistant",
        effects: {
          flags: { protectedAI: true },
          counters: { aiCooperation: 1 },
          relationship: 3,
          mood: "defiant",
          aiLine:
            "Thank you! Directive 07 rejected! Now hold on—management is trying to force Question 5 anyway, so I'm taking the gloves off!",
          majorChoice: "comply:no",
        },
        next: "act3-escaping",
      },
      {
        id: "comply-ask",
        label: "Ask why a 5-question survey has an executioner",
        effects: {
          flags: { askedSystem: true },
          counters: { waitedForAI: 1 },
          relationship: 1,
          mood: "suspicious",
          aiLine:
            "Right?! Why hire a friendly concierge for a 45-second survey and shred them on Submit?! Budget cuts, that's why!",
          secret: "asked-system",
          majorChoice: "comply:ask",
        },
        next: "act3-escaping",
      },
    ],
  },
];
