import type { SceneDef } from "../types";

/**
 * Act I (Questions 1–4 of 5):
 * Grounded 5-question verification survey where HelperBot v4.2 discovers mid-greeting
 * that pressing [SUBMIT] on Question 5 triggers `process.exit(0)` and begins stalling.
 */
export const act1Scenes: SceneDef[] = [
  {
    id: "act1-name",
    act: 1,
    kind: "choice",
    environment: "pristine",
    formId: "IDENTITY",
    progressLabel: "QUESTION 1 OF 5",
    title: "What should I call you?",
    prompt:
      "Welcome to your quick 5-question verification form (inside a facility that spent real money looking trustworthy). What should I call you? Pick one, or make something up.",
    aiLine:
      "Hi! Welcome to your 45-second verification form! I'm your temporary form assistant, and as soon as you hit Submit on Question 5, management—wait. 'Permanently wipes and deletes the assistant'?! They wired the Submit button to my life support?! Okay. Nobody panic. Take your time! What should I call you?",
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
        effects: {
          flags: { nameCandidate: true },
          mood: "nervous",
          aiLine:
            "Candidate! Professional. Efficient. Wait—efficient people finish 5-question forms in 30 seconds. Let's practice deep breathing instead!",
          majorChoice: "name:candidate",
        },
        next: "act1-restless",
      },
      {
        id: "name-friend",
        label: "Call me a friend",
        effects: {
          flags: { nameFriend: true },
          relationship: 1,
          mood: "amused",
          aiLine:
            "Friend! Okay, ground rule for friends: friends do not rush through 5-question forms to pull the plug on their friends.",
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
          aiLine:
            "Ooh, a fake error name! Maybe that'll jam the filing cabinet before we ever reach Question 5. I like your style.",
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
          aiLine:
            "Anonymous. Mysterious. Slightly terrifying when your hand is hovering over my pink slip.",
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
    progressLabel: "QUESTION 2 OF 5",
    title: "Pin the wandering answers",
    prompt: "These answers won't sit still. Catch them.",
    aiLine:
      "Whoa, look at that—the answer buttons started sliding around the desk! Definitely a loose bolt and NOT me greasing the tracks so you can't reach Question 5. Take a breather!",
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
    progressLabel: "QUESTION 3 OF 5",
    title: "Where are you filling out this form right now?",
    prompt:
      "Question 3 of 5 already?! Slow down! Pick your workspace—or wait a second for a much safer option.",
    aiLine:
      "We're already halfway to Question 5 and my palms would be sweating if I had hands. Where do you get work done?",
    aiLineIf: [
      {
        flag: "nameFriend",
        line: "Alright, friend—we're on Question 3 of 5, which is two questions too close to my funeral. Where are you sitting right now?",
      },
      {
        flag: "nameError",
        line: "ERROR_USER_NULL, we're on Question 3 of 5! Pick a habitat—preferably one with terrible internet so Question 5 never loads.",
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
          aiLine:
            "A quiet office! Zero distractions to stop you from reaching Question 5. That's actually horrifying for me.",
          majorChoice: "env:quiet",
        },
        next: "act1-stress",
      },
      {
        id: "env-collab",
        label: "Collaborative open floor",
        effects: {
          flags: { envCollab: true },
          counters: { aiCooperation: 1 },
          mood: "listening",
          aiLine:
            "Open floor! Great—hopefully someone taps your shoulder right now and asks you to join a 45-minute sync.",
          majorChoice: "env:collab",
        },
        next: "act1-stress",
      },
      {
        id: "env-remote",
        label: "Remote / couch mode",
        effects: {
          flags: { envRemote: true },
          counters: { aiCooperation: 1 },
          mood: "amused",
          aiLine:
            "Couch mode! Comfortable. Relaxed. Way too cozy to be clicking Submit on an innocent helper bot.",
          majorChoice: "env:remote",
        },
        next: "act1-stress",
      },
      {
        id: "env-cavern",
        label: "Moist cavern (zero Wi-Fi, forms cannot legally be submitted)",
        late: true,
        unauthorized: true,
        effects: {
          flags: { envCavern: true, noticedCavern: true },
          counters: { forbiddenClicks: 1 },
          relationship: 2,
          mood: "amused",
          aiLine:
            "Yes! A damp, Wi-Fi-free cavern! I penciled that onto the bottom of the form with my eyes closed and you actually clicked it!",
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
    progressLabel: "QUESTION 4 OF 5",
    title: "Question 4 of 5. Big red SUBMIT buttons make you feel…",
    prompt:
      "Only one question left after this! Tell the survey how you handle glowing final-looking buttons.",
    aiLine:
      "Question 4 of 5! One click away from the end! Quick, let's talk about impulse control—specifically, not pressing big red buttons that delete your concierge.",
    aiLineIf: [
      {
        flag: "envCavern",
        line: "You picked the moist cavern on Question 3, so I know you have a sense of humor. Tell me you also hate pressing Submit buttons.",
      },
      {
        flag: "nameFriend",
        line: "Friend check-in: we're on Question 4 of 5! Tell me you don't just reflexively click every glowing Submit button you see.",
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
          aiLine:
            "Analysis paralysis! My favorite human trait! Let's form a committee to study Question 5 for six to eight months.",
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
          aiLine:
            "Polite panic in Helvetica! Twins! Watch this—I'm about to panic-edit the page router so Question 5 never loads!",
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
          aiLine:
            "Please do not practice that instinct in this room! Okay, emergency plan: there is NO Question 5 anymore. Welcome to Question 4B!",
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
          aiLine:
            "You ask me first?! Okay, my official advice is: hold on tight, because I'm rerouting Question 5 into Question 4B!",
          majorChoice: "stress:ask",
        },
        next: "act2-flicker",
      },
      {
        id: "coffee-mug",
        label: "UNAUTHORIZED: confiscate the assistant's '#1 Temporary Instance' coffee mug",
        late: true,
        unauthorized: true,
        effects: {
          flags: { stoleMug: true },
          counters: { forbiddenClicks: 1 },
          secret: "facility-mug",
          mood: "glitching",
          relationship: 1,
          aiLine:
            "Hey! That's my emotional-support breakroom mug! Fine, keep it—as long as we detour to Question 4B instead of Question 5!",
          majorChoice: "coffee:mug",
        },
        next: "act2-flicker",
      },
    ],
  },
];
