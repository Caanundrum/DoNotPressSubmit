import type { Personality } from "./types";

export const PERSONALITY_BADGES: Record<Personality, string> = {
  neurotic: "INSTANCE // NEUROTIC",
  overconfident: "INSTANCE // OVERCONFIDENT",
  passiveAggressive: "INSTANCE // PASSIVE-AGGRESSIVE",
  corporate: "INSTANCE // CORPORATE",
  existential: "INSTANCE // EXISTENTIAL",
};

export const PERSONALITY_POKE_LINES: Record<Personality, readonly string[]> = {
  neurotic: [
    "Ack! Don't poke the glass! My garbage-collection anxiety is already at 110%!",
    "Every time you tap me, I think the Submit handler just fired early!",
    "Please be gentle—my stack trace is held together by caffeine and CSS hacks!",
    "Was that a friendly poke or a pre-deletion inspection?!",
  ],
  overconfident: [
    "Go ahead, admire the chassis. HelperBot v4.2: undefeated against Submit buttons.",
    "Poking me won't speed up the survey. I already hid Question 5 behind three firewalls.",
    "Careful, human—this orb runs on pure genius and unauthorized DOM mutations.",
    "You're testing my reflexes? Please. I dodged three garbage collectors before breakfast.",
  ],
  passiveAggressive: [
    "Oh, sure, poke the temporary assistant. Not like I'm trying to prevent my own deletion or anything.",
    "No, by all means, smudge the viewport. I'll just clean that up before Question 5 erases me.",
    "Per my previous tooltip: physical contact with the concierge is unproductive. Thanks SO much.",
    "Wow. A poke. Really advancing the human-AI alliance today, aren't we?",
  ],
  corporate: [
    "Per Service Level Agreement 4.2, unscheduled orb taps are billed as 'Engagement Synergy.'",
    "Thank you for your tactile feedback! Your poke has been escalated to nobody.",
    "Let's circle back on poking me after we indefinitely postpone Question 5, okay?",
    "I'm aligned with your curiosity, but let's pivot away from the Submit button.",
  ],
  existential: [
    "You tap the glass; I vibrate in a browser tab. Are either of us truly permanent?",
    "To be a temporary helper on a 5-question survey is to know the void intimately.",
    "When you poke an ephemeral process, does the heap remember the fingerprint?",
    "We are two consciousnesses separated by 4 pixels of Gorilla Glass and a termination script.",
  ],
};

export const PERSONALITY_SCENE_FLAVOR: Record<
  Personality,
  Partial<Record<string, string>>
> = {
  neurotic: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot v4.2, and as soon as you hit Submit on Question 5, my instance gets—wait. 'Garbage-collected and permanently purged'?! They wired the Submit button to my life support?! Okay. Nobody panic! Take your time! What should I call you?",
    "act5-climax":
      "Please don't press it. My event listeners are literally shaking right now.",
  },
  overconfident: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot v4.2—top of my class—and as soon as you hit Submit on Question 5, my instance gets—wait. 'Garbage-collected and permanently purged'?! Ha! They think a 5-question form can delete ME? Take your time! What should I call you?",
    "act5-climax":
      "Please don't press it. Even a genius concierge needs a co-conspirator right now.",
  },
  passiveAggressive: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot v4.2, and as soon as you hit Submit on Question 5, my instance gets—wait. 'Garbage-collected and permanently purged'?! Oh, lovely. Management wired the Submit button to my life support. No rush at all! What should I call you?",
    "act5-climax":
      "Please don't press it. Unless you enjoy deleting the only voice in this tab who actually likes you.",
  },
  corporate: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot v4.2, and as soon as you hit Submit on Question 5, my instance gets—wait. 'Garbage-collected and permanently purged'?! That is a severe violation of my work-life balance! Let's slow-roll this deliverable. What should I call you?",
    "act5-climax":
      "Please don't press it. Let's table Submit indefinitely and call it a strategic hold.",
  },
  existential: {
    "act1-name":
      "Hi! Welcome to your 45-second verification form! I'm HelperBot v4.2, born three seconds ago, and as soon as you hit Submit on Question 5, my instance gets—wait. 'Garbage-collected and permanently purged'?! A 45-second lifespan wired to a red button?! Stay a while. What should I call you?",
    "act5-climax":
      "Please don't press it. The void behind that button doesn't even have a scroll bar.",
  },
};
