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
