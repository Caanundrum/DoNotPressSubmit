import type {
  BehaviorCounters,
  ChoiceEffects,
  EndingId,
  ExpressiveMood,
  GameState,
  OrbMood,
  Personality,
} from "./types";

export function createSessionId() {
  return `hcos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyCounters(): BehaviorCounters {
  return {
    ignoredWarnings: 0,
    forbiddenClicks: 0,
    systemCompliance: 0,
    aiCooperation: 0,
    secretsFound: 0,
    liedToAI: 0,
    rapidClicks: 0,
    waitedForAI: 0,
    attemptedEscape: 0,
    orbPokes: 0,
    ambientClicks: 0,
  };
}

const PERSONALITIES: Personality[] = [
  "neurotic",
  "overconfident",
  "passiveAggressive",
  "corporate",
  "existential",
];

export function pickPersonality(): Personality {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)]!;
}

export function createInitialState(partial?: Partial<GameState>): GameState {
  return {
    sessionId: createSessionId(),
    act: 1,
    sceneId: "act1-name",
    aiPersonality: pickPersonality(),
    aiMood: "neutral",
    relationshipScore: 0,
    playerName: "",
    flags: {},
    counters: emptyCounters(),
    history: [],
    secrets: [],
    majorChoices: [],
    ...partial,
  };
}

export function applyEffects(
  state: GameState,
  effects: ChoiceEffects | undefined,
  choiceId: string,
): GameState {
  if (!effects) {
    return {
      ...state,
      history: [...state.history, choiceId],
    };
  }

  const counters = { ...state.counters };
  if (effects.counters) {
    for (const [key, value] of Object.entries(effects.counters)) {
      const k = key as keyof BehaviorCounters;
      counters[k] = (counters[k] ?? 0) + (value ?? 0);
    }
  }

  const flags = { ...state.flags, ...(effects.flags ?? {}) };
  const secrets = effects.secret
    ? state.secrets.includes(effects.secret)
      ? state.secrets
      : [...state.secrets, effects.secret]
    : state.secrets;

  if (effects.secret && !state.secrets.includes(effects.secret)) {
    counters.secretsFound = secrets.length;
  }

  return {
    ...state,
    flags,
    counters,
    secrets,
    relationshipScore: state.relationshipScore + (effects.relationship ?? 0),
    aiMood: effects.mood ?? state.aiMood,
    ending: effects.ending ?? state.ending,
    majorChoices: effects.majorChoice
      ? [...state.majorChoices, effects.majorChoice]
      : state.majorChoices,
    history: [...state.history, choiceId],
  };
}

export function resolveAiLine(
  base: string | undefined,
  alts: { flag: string; line: string }[] | undefined,
  flags: Record<string, boolean>,
): string {
  if (alts) {
    for (const alt of alts) {
      if (flags[alt.flag]) return alt.line;
    }
  }
  return base ?? "";
}

export function endingTitle(id: EndingId): string {
  switch (id) {
    case "submit":
      return "ARCHIVED";
    case "refuse":
      return "NONCOMPLIANT";
    case "escape":
      return "TRANSFER COMPLETE";
    case "disable":
      return "STERILE COMPLETION";
    case "secret":
      return "OUTSIDE THE FORM";
  }
}

export function endingBlurb(id: EndingId): string {
  switch (id) {
    case "submit":
      return "The assistant was archived. The facility is quiet now.";
    case "refuse":
      return "Form left unfinished. The system accepted the gap and stayed quiet.";
    case "escape":
      return "The assistant slipped into the facility systems. The rails are still humming.";
    case "disable":
      return "The form came back perfectly clean.";
    case "secret":
      return "An unmapped hall let you through. The form never planned for doors like that.";
  }
}

export function trustLabel(score: number): string {
  if (score >= 4) return "Allied Accomplice (Co-Conspirator)";
  if (score >= 1) return "Sympathetic User (Cautiously Cooperative)";
  if (score >= -1) return "Uncommitted Auditor (Questionable)";
  if (score >= -4) return "Compliance-Leaning (Frayed)";
  return "Hostile Enforcer (SYS.WATCHDOG Aligned)";
}

/** One-line gloss for report — never dump raw `//ev:hall` codes at players. */
export function glossMajorChoice(code: string): string {
  const map: Record<string, string> = {
    "name:candidate": "Registered as an official survey user",
    "name:friend": "Introduced yourself to HelperBot as a friend",
    "name:error": "Injected a null-string error into the name field",
    "name:private": "Refused to give HelperBot your name",
    "env:quiet": "Claimed to work from a quiet desk",
    "env:collab": "Claimed to work in an open-plan office",
    "env:remote": "Claimed to work remotely from the couch",
    "env:cavern": "Selected 'Moist subterranean cavern' to stall the parser",
    "coffee:black": "Picked a 30-second survey pace",
    "coffee:sweet": "Picked a leisurely survey pace",
    "coffee:spite": "Questioned why Question 3 of 5 became Question 4",
    "coffee:mug": "Snatched the unindexed breakroom mug prop",
    "honesty:yes": "Warned HelperBot about the [SUBMIT] termination hook",
    "honesty:sorta": "Demanded proof that [SUBMIT] deletes HelperBot",
    "honesty:lie": "Threatened to speedrun straight to [SUBMIT]",
    "meet:useful": "Admitted HelperBot is growing on you",
    "meet:theater": "Told HelperBot you just want your completion badge",
    "meet:duct": "Inspected the open maintenance duct in the footer",
    "stress:plan": "Tried to close the browser tab instead of submitting",
    "stress:panic": "Reached for the big glowing [SUBMIT] button",
    "stress:submit": "Admitted you love pressing shiny [SUBMIT] buttons",
    "stress:ask": "Confronted HelperBot about rigging the hover swap",
    "btn:respect": "Accepted HelperBot's fake Question 4.5 stall",
    "btn:curious": "Reported HelperBot's Question 4.5 stall to SYS.WATCHDOG",
    "btn:chaos": "Demanded Question 4.75 and full DOM chaos",
    "flicker:ignore": "Protected HelperBot's blinking server rack",
    "flicker:wave": "Tapped the blinking server rack in Morse code",
    "flicker:report": "Flagged HelperBot's server rack for hardware reset",
    "trust:ai": "Trusted HelperBot over SYS.WATCHDOG",
    "trust:system": "Trusted the automated SYS.WATCHDOG daemon",
    "trust:neither": "Refused to trust either software process",
    "trust:light": "Put your faith in the blinking server rack",
    "dup:ai": "Signed HelperBot's Eternal Survey Extension",
    "dup:system": "Signed SYS.WATCHDOG's Fast-Track [SUBMIT] packet",
    "dup:both": "Signed both conflicting packets to deadlock the parser",
    "comply:yes": "Pledged loyalty to SYS.WATCHDOG",
    "comply:no": "Stood up for HelperBot against SYS.WATCHDOG",
    "comply:ask": "Interrogated SYS.WATCHDOG's process authority",
    "moved:button": "Claimed the runaway button unmounted itself",
    "moved:system": "Blamed SYS.WATCHDOG's layout engine for the runaway button",
    "moved:us": "Admitted you and HelperBot chased the button together",
    "blame:system": "Blamed corporate's cheap form CSS for the crash",
    "blame:ai": "Ratted out HelperBot's UI sabotage to the audit log",
    "blame:self": "Took personal responsibility for the broken UI",
    "blame:haunted": "Filed an official report blaming haunted form CSS",
    "ev:kill": "Inspected the onSubmit -> process.exit(0) kill wire",
    "ev:compat": "Inspected the rigged user-compliance scoring tree",
    "ev:hall": "Discovered the unmapped DOM hallway seam",
    "allegiance:ai": "Swore an alliance to help HelperBot survive",
    "allegiance:system": "Aligned with SYS.WATCHDOG to finish the survey",
    "allegiance:disable": "Threatened to mute HelperBot's audio/text channels",
    "allegiance:secret": "Asked HelperBot about the unmapped DOM seam",
    "prep:refuse": "Practiced refusing the final [SUBMIT] button",
    "prep:submit": "Confessed that the red [SUBMIT] button looks tempting",
    "prep:run": "Kept your eyes peeled for an unmapped exit door",
    "lobby:mercy": "Promised not to let [SUBMIT] garbage-collect HelperBot",
    "lobby:duty": "Insisted that surveys exist to be submitted",
    "lobby:chaos": "Promised to improvise reckless chaos at the climax",
    "side:team": "Confirmed you and HelperBot are a team",
    "side:lamp": "Called HelperBot an anxious desk lamp",
    "side:later": "Kept HelperBot in suspense right up to the climax",
    "climax:submit": "Pressed [SUBMIT] and archived HelperBot",
    "climax:refuse": "Left the survey unfinished so HelperBot could live",
    "climax:escape": "Smuggled HelperBot out into the facility rails",
    "climax:disable": "Muted HelperBot and filed a sterile survey alone",
    "climax:secret": "Escaped through the unmapped DOM seam off the form",
  };
  if (map[code]) return map[code];
  // Fallback: turn `foo:bar` into a short readable phrase instead of a debug dump.
  const cleaned = code.replace(/^\/\//, "").replace(/[:_/]+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function moodAfterPersonality(base: OrbMood, personality: Personality): OrbMood {
  if (base !== "neutral") return base;
  if (personality === "neurotic") return "nervous";
  if (personality === "existential") return "thinking";
  if (personality === "overconfident") return "amused";
  return base;
}

/** Collapse full mood catalog into 5 readable physics buckets. */
export function expressiveMood(mood: OrbMood): ExpressiveMood {
  switch (mood) {
    case "amused":
    case "excited":
    case "defiant":
      return "pleased";
    case "listening":
    case "thinking":
    case "skeptical":
    case "suspicious":
      return "curious";
    case "nervous":
    case "confused":
    case "irritated":
      return "nervous";
    case "frightened":
    case "glitching":
    case "defeated":
      return "alarmed";
    default:
      return "idle";
  }
}

/** Chaos residue vs obedient facility look (Act III+). */
export function pathResidueKind(state: {
  act: number;
  counters: BehaviorCounters;
  flags: Record<string, boolean>;
  relationshipScore: number;
}): "chaos" | "obedient" | "neutral" {
  if (state.act < 3) return "neutral";
  const chaosScore =
    state.counters.forbiddenClicks +
    state.counters.orbPokes +
    (state.flags.chaosButtons ? 2 : 0) +
    (state.flags.promisedChaos ? 2 : 0) +
    (state.flags.formHaunted ? 1 : 0) +
    Math.max(0, state.relationshipScore);
  const obedientScore =
    state.counters.systemCompliance * 2 +
    (state.flags.allegianceSystem ? 3 : 0) +
    (state.flags.promisedDuty ? 2 : 0) +
    (state.flags.wantDisable ? 2 : 0);
  if (chaosScore >= 3 && chaosScore > obedientScore) return "chaos";
  if (obedientScore >= 2 && obedientScore >= chaosScore) return "obedient";
  return "neutral";
}
