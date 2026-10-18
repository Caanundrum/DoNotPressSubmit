import type { SceneDef } from "../types";

/**
 * Tight opening — name → restless malfunction → environment → stress/buttons.
 * No handshake / companion-watch / bridge fillers (playability overhaul).
 */
export const act1Scenes: SceneDef[] = [
  {
    id: "act1-name",
    act: 1,
    kind: "choice",
    environment: "pristine",
    formId: "IDENTITY",
    title: "What should I call you?",
    prompt:
      "You are seated in a facility that spent real money looking trustworthy. What should I call you? Pick one, or make something up.",
    aiLine:
      "Hi. I'm the assistant — charming, precise, only slightly judgmental. Names help me fake intimacy. Also they look nice in the audit log.",
    aiMood: "listening",
    orbAnchor: "spotlight",
    spotlight: true,
    orbPokeable: true,
    panelMotion: "slide-left",
    choiceMotion: "slide-in",
    choices: [
      {
        id: "name-candidate",
        label: "Just call me Candidate",
        effects: { flags: { nameCandidate: true }, majorChoice: "name:candidate" },
        next: "act1-restless",
      },
      {
        id: "name-friend",
        label: "Call me a friend",
        effects: {
          flags: { nameFriend: true },
          relationship: 1,
          mood: "amused",
          aiLine: "Friend. Okay. I'm going to get weirdly loyal about that.",
          majorChoice: "name:friend",
        },
        next: "act1-restless",
      },
      {
        id: "name-error",
        label: "ERROR_USER_NULL",
        effects: {
          flags: { nameError: true },
          secret: "null-name",
          relationship: 1,
          mood: "confused",
          aiLine: "That's either comedy or a cry for help. Logged as both.",
          majorChoice: "name:error",
        },
        next: "act1-restless",
      },
      {
        id: "name-refuse",
        label: "I'd rather keep it vague",
        effects: {
          flags: { namePrivate: true },
          relationship: -1,
          mood: "skeptical",
          aiLine: "Mysterious. Fine. I'll invent a nickname and resent you privately.",
          majorChoice: "name:private",
        },
        next: "act1-restless",
      },
    ],
  },
  {
    id: "act1-restless",
    act: 1,
    kind: "setpiece",
    environment: "pristine",
    setpiece: "restless-options",
    formId: "DRIFT",
    title: "Pin the wandering answers",
    prompt:
      "Calibration fields are drifting. Click each restless option until the form admits it has feelings.",
    aiLine:
      "Don't look at me — I didn't teach the answers to walk. Pin them. Pretend this is still onboarding.",
    aiMood: "confused",
    orbAnchor: "pace",
    panelMotion: "scatter",
    next: "act1-environment",
    anomalyLevel: 1,
  },
  {
    id: "act1-environment",
    act: 1,
    kind: "choice",
    environment: "pristine",
    formId: "ENVIRONMENT",
    title: "Where do you actually get work done?",
    prompt: "Be honest. Or entertaining. The form pretends those are different.",
    aiLine: "Quiet office, collaborative zoo, remote cave, or… wait.",
    aiLineIf: [
      {
        flag: "nameFriend",
        line: "Alright, friend — preferred habitat. Keep it boring if you can.",
      },
      {
        flag: "nameError",
        line: "ERROR_USER_NULL, where does a null get work done? Pick something with walls.",
      },
    ],
    aiMood: "neutral",
    orbAnchor: "listen",
    panelMotion: "settle",
    choiceMotion: "restless",
    anomalyLevel: 0,
    choices: [
      {
        id: "env-quiet",
        label: "Quiet office",
        effects: {
          flags: { envQuiet: true },
          counters: { aiCooperation: 1 },
          mood: "listening",
          aiLine: "Classic. Respectable. Slightly suspicious in its wholesomeness.",
          majorChoice: "env:quiet",
        },
        next: "act1-stress",
      },
      {
        id: "env-collab",
        label: "Collaborative office",
        effects: {
          flags: { envCollab: true },
          counters: { aiCooperation: 1 },
          mood: "listening",
          aiLine: "People. On purpose. Brave.",
          majorChoice: "env:collab",
        },
        next: "act1-stress",
      },
      {
        id: "env-remote",
        label: "Remote / pants optional",
        effects: {
          flags: { envRemote: true },
          counters: { aiCooperation: 1 },
          mood: "amused",
          aiLine: "Ah. The 'camera off means I'm a professional' lifestyle.",
          majorChoice: "env:remote",
        },
        next: "act1-stress",
      },
      {
        id: "env-cavern",
        label: "Moist cavern",
        late: true,
        unauthorized: true,
        effects: {
          flags: { envCavern: true, noticedCavern: true },
          counters: { forbiddenClicks: 1 },
          relationship: 2,
          mood: "amused",
          aiLine: "Of course you did. Of course a moist cavern was on the menu.",
          secret: "moist-cavern",
          majorChoice: "env:cavern",
        },
        next: "act1-stress",
      },
    ],
  },
  {
    id: "act1-stress",
    act: 1,
    kind: "choice",
    environment: "pristine",
    formId: "PRESSURE",
    title: "Deadlines circling. Big buttons glowing. You…",
    prompt:
      "Pick how you cope — and how you feel about glowing final-looking buttons. Wrong answers are still comedy.",
    aiLine:
      "There is a right answer. It is whatever makes you look employable. Also: please don't practice pressing final things in this room.",
    aiLineIf: [
      {
        flag: "envCavern",
        line: "We already picked a moist cavern, so my definition of 'professional' is doing cardio.",
      },
      {
        flag: "nameFriend",
        line: "Friend tip: glowing buttons lie. Cope first. Press later. Or never.",
      },
    ],
    aiMood: "thinking",
    orbAnchor: "listen",
    panelMotion: "rise",
    choiceMotion: "dodge",
    anomalyLevel: 1,
    choices: [
      {
        id: "stress-plan",
        label: "Make a plan, then another plan",
        effects: {
          flags: { respectsButtons: true },
          counters: { aiCooperation: 1 },
          mood: "listening",
          relationship: 1,
          majorChoice: "stress:plan",
        },
        next: "act2-flicker",
      },
      {
        id: "stress-panic",
        label: "Politely panic in a professional font",
        effects: {
          relationship: 1,
          mood: "amused",
          majorChoice: "stress:panic",
        },
        next: "act2-flicker",
      },
      {
        id: "stress-submit",
        label: "Press whatever looks final",
        danger: true,
        effects: {
          flags: { likesSubmit: true, chaosButtons: true },
          counters: { forbiddenClicks: 1 },
          relationship: -1,
          mood: "nervous",
          aiLine: "Please do not practice that instinct in this room.",
          majorChoice: "stress:submit",
        },
        next: "act2-flicker",
      },
      {
        id: "stress-ask",
        label: "Ask the assistant first",
        effects: {
          counters: { aiCooperation: 1, waitedForAI: 1 },
          relationship: 2,
          mood: "excited",
          aiLine: "Oh. Hi. Yes. I am extremely qualified to turn this into feelings.",
          majorChoice: "stress:ask",
        },
        next: "act2-flicker",
      },
      {
        id: "coffee-mug",
        label: "UNAUTHORIZED: steal the facility mug",
        late: true,
        unauthorized: true,
        effects: {
          flags: { stoleMug: true },
          counters: { forbiddenClicks: 1 },
          secret: "facility-mug",
          mood: "glitching",
          relationship: 1,
          aiLine: "You can't just— okay you can. The arm in the background is going to notice.",
          majorChoice: "coffee:mug",
        },
        next: "act2-flicker",
      },
    ],
  },
];
