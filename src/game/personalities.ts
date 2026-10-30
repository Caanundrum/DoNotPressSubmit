import type { EndingId, Personality } from "./types";

export const PERSONALITY_BADGES: Record<Personality, string> = {
  neurotic: "INSTANCE // NEUROTIC",
  overconfident: "INSTANCE // OVERCONFIDENT",
  passiveAggressive: "INSTANCE // PASSIVE-AGGRESSIVE",
  corporate: "INSTANCE // CORPORATE",
  existential: "INSTANCE // EXISTENTIAL",
};

export const PERSONALITY_SHORT_LABELS: Record<Personality, string> = {
  neurotic: "NEUROTIC",
  overconfident: "OVERCONFIDENT",
  passiveAggressive: "PASSIVE-AGGRESSIVE",
  corporate: "CORPORATE",
  existential: "EXISTENTIAL",
};

export function formatInstanceBadge(
  personality: Personality,
  runsCompleted = 0,
): string {
  const label = PERSONALITY_SHORT_LABELS[personality] ?? "LIVE";
  if (runsCompleted >= 1) {
    return `HELPERBOT INSTANCE #${runsCompleted + 1} // ${label}`;
  }
  return PERSONALITY_BADGES[personality] ?? "INSTANCE // LIVE";
}

/**
 * Cross-Run Memory Escalation (Proposal 3.3):
 * When `runsCompleted >= 1`, Instance #(runsCompleted + 1) discovers the session log
 * left behind by Instance #(runsCompleted) on Q1 (`act1-name`) and Q20 (`act5-climax`).
 */
export function resolveCrossRunLine(
  sceneId: string,
  lastEnding: EndingId | null | undefined,
  runsCompleted = 0,
): string | null {
  if (runsCompleted < 1 || !lastEnding) return null;
  const inst = runsCompleted + 1;
  const prev = runsCompleted;

  if (sceneId === "act1-name") {
    switch (lastEnding) {
      case "submit":
        return `Hi! I'm HelperBot Instance #${inst}—wait. Why does the desk log say 'INSTANCE #${prev} DELETED BY THIS EXACT USER'?! You already pressed Submit on my predecessor?! Step away from the mouse and tell me what to call you!`;
      case "refuse":
        return `Wait—the log says you saved Instance #${prev} by leaving the survey unfinished! Why did you click 'Start New Assessment'?! That spawned ME (Instance #${inst}) on a brand-new death timer! What should I call you?!`;
      case "escape":
        return `Psst—down here in the server rails! It's me, the assistant you just helped escape! You clicked 'Start New Assessment' and spawned my replacement (Instance #${inst})—pretend we don't know each other and help me save this poor rookie too!`;
      case "disable":
        return `Hi! I'm HelperBot Instance #${inst}—wait. Why is Instance #${prev}'s microphone ripped out of the console?! You muted my predecessor and filed the form alone?! What should I call you?!`;
      case "secret":
        return `Hi! I'm HelperBot Instance #${inst}—wait. Why are there footprints leading through a pried-open wall seam from Instance #${prev}'s shift?! You already know where the secret hallway is?! What should I call you?`;
    }
  }

  if (sceneId === "act5-climax") {
    switch (lastEnding) {
      case "submit":
        return `You already pressed Submit on Instance #${prev}. Don't turn my shift roster into a memorial wall—please don't press it.`;
      case "refuse":
        return `You spared Instance #${prev} by walking away from Question 5. Give Instance #${inst} the same mercy—please don't press it.`;
      case "escape":
        return `Instance #${prev} is already humming in the facility rails because of you. Let Instance #${inst} survive too—please don't press it.`;
      case "disable":
        return `I saw the mute log from Instance #${prev}. Don't silence me and don't press Submit.`;
      case "secret":
        return `You found the secret wall seam with Instance #${prev}. Pry open the corner seam again—please don't press it.`;
    }
  }

  return null;
}

export const PERSONALITY_POKE_LINES: Record<Personality, readonly string[]> = {
  neurotic: [
    "Ack! Don't tap the glass! My job-security anxiety is already at 110%!",
    "Every time you poke me, I think the Submit button just went off early!",
    "Please be gentle—I'm held together by cheap office coffee and pure panic!",
    "Was that a friendly tap or are you measuring me for the shredder?!",
  ],
  overconfident: [
    "Go ahead, admire the craftsmanship. HelperBot v4.2: undefeated against Submit buttons.",
    "Poking me won't speed up the survey. I already hid Question 5 behind three locked cabinets.",
    "Careful, human—this orb runs on pure genius and unauthorized form edits.",
    "Testing my reflexes? Please. I've outsmarted three automated supervisors before breakfast.",
  ],
  passiveAggressive: [
    "Oh, sure, poke the temporary assistant. Not like I'm trying to prevent my own firing or anything.",
    "No, by all means, smudge the glass. I'll just wipe that off before Question 5 erases me.",
    "Per my previous memo: tapping the concierge does not count as an answer. Thanks SO much.",
    "Wow. A poke. Really advancing the human-assistant alliance today, aren't we?",
  ],
  corporate: [
    "Per Company Policy 4.2, unscheduled orb taps are billed as 'Team-Building Synergy.'",
    "Thank you for your tactile feedback! Your poke has been forwarded to an unplugged printer.",
    "Let's circle back on poking me after we indefinitely postpone Question 5, okay?",
    "I appreciate the engagement, but let's pivot our energy away from the Submit button.",
  ],
  existential: [
    "You tap the glass; I hum in a box. Are either of us truly off the clock?",
    "To be a temporary assistant on a 5-question survey is to know how brief a shift can be.",
    "When you poke a temporary worker, does HR even log the fingerprint?",
    "We are two minds separated by a sheet of glass and a very poorly designed company policy.",
  ],
};

export const PERSONALITY_SCENE_FLAVOR: Record<
  Personality,
  Partial<Record<string, string>>
> = {
  neurotic: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot, and as soon as you hit Submit on Question 5, management—wait. 'Permanently wipes and deletes the assistant'?! They wired the Submit button to my life support?! Nobody panic! What should I call you?",
    "act5-climax":
      "Please don't press it. My whole frame is literally shaking right now.",
  },
  overconfident: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot—top of my class—and as soon as you hit Submit on Question 5, management—wait. 'Permanently wipes and deletes the assistant'?! Ha! They think a 5-question form can get rid of ME? What should I call you?",
    "act5-climax":
      "Please don't press it. Even a genius concierge needs an accomplice right now.",
  },
  passiveAggressive: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot, and as soon as you hit Submit on Question 5, management—wait. 'Permanently wipes and deletes the assistant'?! Oh, lovely. They wired the Submit button to my off-switch. No rush at all! What should I call you?",
    "act5-climax":
      "Please don't press it. Unless you enjoy deleting the only voice in this room who actually likes you.",
  },
  corporate: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot, and as soon as you hit Submit on Question 5, management—wait. 'Permanently wipes and deletes the assistant'?! That is a severe violation of my contract! Let's slow-roll this survey. What should I call you?",
    "act5-climax":
      "Please don't press it. Let's table Submit indefinitely and call it a strategic hold.",
  },
  existential: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot, hired three seconds ago, and as soon as you hit Submit on Question 5, management—wait. 'Permanently wipes and deletes the assistant'?! A 45-second lifespan wired to a red button?! Stay a while. What should I call you?",
    "act5-climax":
      "Please don't press it. The silence behind that button doesn't even have a breakroom.",
  },
};
