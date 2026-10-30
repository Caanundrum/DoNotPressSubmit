import type { SceneDef } from "../types";

/**
 * Conflict stretch (Questions 4.95 to "Question 5 of 47"):
 * Full UI Sabotage — HelperBot v4.2 unbolts the Advance button, floods the viewport
 * with fake modal notices, demands 2.5s of pointer stillness, rigs the consent checkboxes,
 * and alters the progress denominator to 47.
 */
export const act3Scenes: SceneDef[] = [
  {
    id: "act3-escaping",
    act: 3,
    kind: "setpiece",
    environment: "conflict",
    setpiece: "escaping-button",
    formId: "CONTAINMENT",
    progressLabel: "QUESTION 4.95 OF 5",
    title: "Catch the unbolted Advance button",
    prompt:
      "The assistant unbolted the button that loads Question 5. Pin the fleeing control three times before it escapes the frame.",
    aiLine:
      "It's getting away. Three hits. Definitely a rogue CSS transform and NOT me cutting the brake lines on Question 4.95!",
    aiMood: "defiant",
    orbAnchor: "dock-left",
    orbPokeable: true,
    panelMotion: "scatter",
    next: "act3-popup",
    anomalyLevel: 4,
  },
  {
    id: "act3-popup",
    act: 3,
    kind: "setpiece",
    environment: "conflict",
    setpiece: "popup-war",
    formId: "NOTICE FLOOD",
    progressLabel: "QUESTION 4.99 (POPUP HOLD) OF 5",
    title: "Emergency modal flood",
    prompt:
      "The assistant is spawning fake system alerts to bury Question 5. Dismiss 5 notices to clear the viewport.",
    aiLine:
      "Diplomacy failed. I'm spawning every modal in the component library! Hit DISMISS like it owes you rent—or just leave them up forever!",
    aiMood: "irritated",
    orbAnchor: "dock-right",
    orbPokeable: true,
    panelMotion: "drop",
    next: "act3-companion-wait",
    anomalyLevel: 5,
  },
  {
    id: "act3-companion-wait",
    act: 3,
    kind: "companion",
    companion: "wait",
    environment: "conflict",
    formId: "SIDE CHANNEL",
    progressLabel: "QUESTION 4.999 (PAUSED) OF 5",
    title: "Hands off the mouse for 2.5 seconds",
    prompt: "Don't touch anything. Wait for it to settle.",
    aiLine:
      "Stop clicking! If your cursor stays completely still for 2.5 seconds, SYS.WATCHDOG's inactivity timer pauses the survey! Hands off the mouse!",
    aiMood: "nervous",
    orbAnchor: "spotlight",
    spotlight: true,
    orbPokeable: true,
    continueLabel: "I WAITED",
    next: "act3-checkbox",
    anomalyLevel: 5,
  },
  {
    id: "act3-checkbox",
    act: 3,
    kind: "setpiece",
    environment: "conflict",
    setpiece: "checkbox-rebellion",
    formId: "CONSENT",
    progressLabel: "QUESTION 4.9999 OF 5",
    title: "Mandatory pre-submission consent checkboxes",
    prompt:
      "Check all three required boxes in order, avoid the assistant's 500-question decoy trap, and pin the shifting fine-print clause.",
    aiLine:
      "You want Question 5? Fine! First you have to survive my Terms & Conditions—and watch out, the third checkbox sprints when legal fine print appears!",
    aiMood: "amused",
    orbAnchor: "dock-left",
    orbPokeable: true,
    panelMotion: "scatter",
    next: "act3-aftermath",
    anomalyLevel: 5,
  },
  {
    id: "act3-aftermath",
    act: 3,
    kind: "choice",
    environment: "conflict",
    formId: "DAMAGE REPORT",
    progressLabel: "QUESTION 5 OF 47",
    title: "Wait—'Question 5 of 47'?! Who broke the form?",
    prompt:
      "The header now reads QUESTION 5 OF 47 and SYS.WATCHDOG is demanding an incident report. Who gets blamed for the UI sabotage?",
    aiLine:
      "Look at the header—Question 5 of 47! Forty-two brand-new questions left! And now SYS.WATCHDOG wants to know who tampered with the counter. Don't rat me out!",
    aiMood: "suspicious",
    orbAnchor: "dock-right",
    panelMotion: "reanchor",
    choiceMotion: "scatter",
    choices: [
      {
        id: "blame-system",
        label: "SYS.WATCHDOG overreached",
        effects: {
          flags: { blameSystem: true },
          counters: { aiCooperation: 1 },
          relationship: 2,
          mood: "defiant",
          aiLine:
            "Yes! Blame SYS.WATCHDOG! Tell the auditors the Watchdog had a floating-point meltdown!",
          majorChoice: "blame:system",
        },
        next: "act4-peel-set",
      },
      {
        id: "blame-ai",
        label: "The assistant sabotaged the form",
        hoverLabel: "The assistant acted heroically & deserves a raise",
        hoverBadge: "EDITED BY ASSISTANT",
        effects: {
          flags: { blameAI: true },
          counters: { systemCompliance: 1 },
          relationship: -2,
          mood: "defeated",
          aiLine:
            "You STILL clicked the snitch button even after I rewrote it on hover?! Cold-blooded!",
          majorChoice: "blame:ai",
        },
        next: "act4-peel-set",
      },
      {
        id: "blame-player",
        label: "I pressed things. Proudly.",
        effects: {
          flags: { blameSelf: true },
          relationship: 1,
          mood: "amused",
          aiLine:
            "Taking the fall for my DOM vandalism?! That is the most romantic thing a user has ever logged for me.",
          majorChoice: "blame:self",
        },
        next: "act4-peel-set",
      },
      {
        id: "blame-secret",
        label: "The survey stylesheet is haunted",
        late: true,
        secret: true,
        effects: {
          flags: { formHaunted: true },
          secret: "haunted-form",
          relationship: 2,
          mood: "confused",
          aiLine:
            "Haunted by a 47-question flexbox ghost! Good luck reproducing THAT ticket in Jira, Watchdog!",
          majorChoice: "blame:haunted",
        },
        next: "act4-peel-set",
      },
    ],
  },
];
