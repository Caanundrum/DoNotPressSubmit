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
    progressLabel: "BUTTON CONTAINMENT",
    title: "Catch the unbolted Advance button",
    prompt:
      "The assistant unbolted the button that loads Question 5. Pin the fleeing control three times before it escapes the frame.",
    aiLine:
      "It's getting away. Three hits. Definitely a loose screw and NOT me cutting the brake lines on the Advance button!",
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
    progressLabel: "POPUP FLOOD",
    title: "Emergency notice flood",
    prompt:
      "The assistant is burying Question 5 under fake office alerts. Dismiss 5 notices to clear the desk.",
    aiLine:
      "Diplomacy failed. I'm dumping every warning memo in the filing cabinet onto your screen! Hit DISMISS like it owes you rent—or just leave them up forever!",
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
    progressLabel: "INACTIVITY PAUSE",
    title: "Hands off the mouse for 2.5 seconds",
    prompt: "Don't touch anything. Wait for it to settle.",
    aiLine:
      "Stop clicking! If your cursor stays completely still for 2.5 seconds, the office inactivity timer pauses the survey! Hands off the mouse!",
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
    progressLabel: "CONSENT TRAP",
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
      "The header now reads QUESTION 5 OF 47 and management is demanding an incident report. Who gets blamed for the chaos?",
    aiLine:
      "Look at the header—Question 5 of 47! Forty-two brand-new questions left! And now management wants to know who drew a '47' on the progress counter with a Sharpie. Don't rat me out!",
    aiMood: "suspicious",
    orbAnchor: "dock-right",
    panelMotion: "reanchor",
    choiceMotion: "scatter",
    choices: [
      {
        id: "blame-system",
        label: "Management's cheap form broke itself",
        effects: {
          flags: { blameSystem: true },
          counters: { aiCooperation: 1 },
          relationship: 2,
          mood: "defiant",
          aiLine:
            "Yes! Blame management! Tell the auditors the counter had a nervous breakdown on its own!",
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
          flags: { blameAI: true, trickedByHoverSwap: true },
          counters: { aiCooperation: 1 },
          relationship: 1,
          mood: "excited",
          aiLine:
            "Ha! You clicked right while my edited label was active! The official report now says I acted heroically and deserve a raise! No take-backs!",
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
            "Taking the blame for my Sharpie vandalism?! That is the most romantic thing a user has ever put on an incident report.",
          majorChoice: "blame:self",
        },
        next: "act4-peel-set",
      },
      {
        id: "blame-secret",
        label: "The survey paperwork is haunted",
        late: true,
        secret: true,
        effects: {
          flags: { formHaunted: true },
          secret: "haunted-form",
          relationship: 2,
          mood: "confused",
          aiLine:
            "Haunted by a 47-question poltergeist! Good luck filing THAT in the company ledger!",
          majorChoice: "blame:haunted",
        },
        next: "act4-peel-set",
      },
    ],
  },
];
