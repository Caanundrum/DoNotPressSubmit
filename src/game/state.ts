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
    sceneId: "act1-welcome",
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
      return "You pressed Submit. The facility restored order. The assistant did not.";
    case "refuse":
      return "You refused. System eventually accepted an incomplete assessment. Somehow, the room exhaled.";
    case "escape":
      return "You helped the assistant leave through the infrastructure. The title screen will remember.";
    case "disable":
      return "You silenced the assistant. The form became perfectly clean. That was the joke.";
    case "secret":
      return "You found a path the interface was never meant to admit. Grammar broke. So did the rules.";
  }
}

export function trustLabel(score: number): string {
  if (score >= 4) return "Allied";
  if (score >= 1) return "Cautiously cooperative";
  if (score >= -1) return "Questionable";
  if (score >= -4) return "Frayed";
  return "Hostile";
}

/** One-line gloss for report — never dump raw `//ev:hall` codes at players. */
export function glossMajorChoice(code: string): string {
  const map: Record<string, string> = {
    "name:candidate": "Gave a careful name",
    "name:friend": "Called the assistant a friend",
    "name:error": "Typed a name error on purpose",
    "name:private": "Kept the name private",
    "env:quiet": "Picked a quiet workplace",
    "env:collab": "Picked a collaborative floor",
    "env:remote": "Picked remote / nowhere",
    "env:cavern": "Picked the moist cavern",
    "coffee:black": "Took coffee black",
    "coffee:sweet": "Took coffee sweet",
    "coffee:spite": "Took coffee out of spite",
    "coffee:mug": "Stole the facility mug",
    "honesty:yes": "Claimed honesty",
    "honesty:sorta": "Admitted selective honesty",
    "honesty:lie": "Lied on the honesty form",
    "meet:useful": "Wanted a useful meeting",
    "meet:theater": "Wanted meeting theater",
    "meet:duct": "Chose the maintenance duct",
    "stress:plan": "Stressed with a plan",
    "stress:panic": "Stressed into panic",
    "stress:submit": "Defaulted to Submit under stress",
    "stress:ask": "Asked the assistant under stress",
    "btn:respect": "Respected the button",
    "btn:curious": "Poked the button out of curiosity",
    "btn:chaos": "Voted for chaotic buttons",
    "flicker:ignore": "Ignored the blinking light",
    "flicker:wave": "Waved at the blinking light",
    "flicker:report": "Reported the blinking light",
    "trust:ai": "Trusted the assistant",
    "trust:system": "Trusted the system",
    "trust:neither": "Trusted neither side",
    "trust:light": "Trusted the haunted light",
    "dup:ai": "Sided with the assistant's copy",
    "dup:system": "Sided with the system's copy",
    "dup:both": "Answered both and confused auditors",
    "side:team": "Called yourselves a team",
    "side:lamp": "Sided with the lamp",
    "side:later": "Postponed taking a side",
    "comply:yes": "Complied when pressed",
    "comply:no": "Refused to comply",
    "comply:ask": "Asked before complying",
    "moved:button": "Blamed the moving button",
    "moved:system": "Blamed the system for the move",
    "moved:us": "Admitted you moved it together",
    "blame:system": "Blamed the system",
    "blame:ai": "Blamed the assistant",
    "blame:self": "Took the blame",
    "blame:haunted": "Blamed the haunting",
    "ev:kill": "Tried to kill the evidence",
    "ev:compat": "Chose compatible evidence",
    "ev:hall": "Spotted a hallway off the map",
    "allegiance:ai": "Pledged to the assistant",
    "allegiance:system": "Pledged to the system",
    "allegiance:disable": "Wanted the assistant muted",
    "allegiance:secret": "Kept a secret allegiance",
    "prep:refuse": "Prepared to refuse",
    "prep:submit": "Prepared to submit",
    "prep:run": "Prepared to run",
    "lobby:mercy": "Promised mercy",
    "lobby:duty": "Chose duty over mercy",
    "lobby:chaos": "Chose violent improvisation",
    "climax:submit": "Pressed Submit",
    "climax:refuse": "Refused to finish the form",
    "climax:escape": "Helped the assistant slip out",
    "climax:disable": "Muted the assistant and finished alone",
    "climax:secret": "Took the hallway that isn't on the form",
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
