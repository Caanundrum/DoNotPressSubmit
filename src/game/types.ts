export type Personality =
  | "neurotic"
  | "overconfident"
  | "passiveAggressive"
  | "corporate"
  | "existential";

export type OrbMood =
  | "neutral"
  | "listening"
  | "thinking"
  | "amused"
  | "skeptical"
  | "confused"
  | "suspicious"
  | "irritated"
  | "nervous"
  | "frightened"
  | "defiant"
  | "defeated"
  | "excited"
  | "glitching";

/** Where the assistant occupies the facility stage. */
export type OrbAnchor =
  | "dock-left"
  | "dock-right"
  | "listen"
  | "pace"
  | "flee"
  | "loom"
  | "hide"
  | "overhead"
  | "center"
  /** Key pitch: bigger, more present — still clear of form CTAs */
  | "spotlight"
  /** Act V: refuses to stand under Submit lights */
  | "avoid-submit";

/** Non-form companion beat — relationship as play, not only narration. */
export type CompanionBeat = "wait" | "watch" | "respond";

/** How the assessment prompt/panel enters and lives on stage. */
export type PanelMotion =
  | "settle"
  | "slide-left"
  | "slide-right"
  | "rise"
  | "drop"
  | "drift"
  | "scatter"
  | "reanchor"
  | "pressure"
  | "edge";

/** How choice buttons behave beyond static click-next. */
export type ChoiceMotion = "static" | "restless" | "scatter" | "slide-in" | "dodge";

export type EndingId =
  | "submit"
  | "refuse"
  | "escape"
  | "disable"
  | "secret";

export type EnvironmentPreset =
  | "pristine"
  | "anomaly"
  | "conflict"
  | "reveal"
  | "climax"
  | "sterile"
  | "escape"
  | "archive";

export type SceneKind =
  | "dialogue"
  | "choice"
  | "system"
  | "setpiece"
  | "climax"
  | "ending"
  | "report"
  | "companion";

export type SetpieceId =
  | "escaping-button"
  | "popup-war"
  | "checkbox-rebellion"
  | "submit-button"
  | "restless-options"
  | "authority-stamp"
  | "peel-reveal";

export type ShellPhase =
  | "chaos"
  | "hcos"
  | "title"
  | "playing"
  | "ending"
  | "report";

export interface BehaviorCounters {
  ignoredWarnings: number;
  forbiddenClicks: number;
  systemCompliance: number;
  aiCooperation: number;
  secretsFound: number;
  liedToAI: number;
  rapidClicks: number;
  waitedForAI: number;
  attemptedEscape: number;
  /** Tiny illegal orb pokes — relationship without blocking CTAs */
  orbPokes: number;
  /** Facility chrome / ambient gag clicks (report-visible) */
  ambientClicks: number;
}

export interface GameState {
  sessionId: string;
  act: number;
  sceneId: string;
  aiPersonality: Personality;
  aiMood: OrbMood;
  relationshipScore: number;
  playerName: string;
  flags: Record<string, boolean>;
  counters: BehaviorCounters;
  history: string[];
  secrets: string[];
  ending?: EndingId;
  majorChoices: string[];
}

export interface ChoiceDef {
  id: string;
  label: string;
  /** Appears after a short delay */
  late?: boolean;
  unauthorized?: boolean;
  /** Accent treatment */
  danger?: boolean;
  /** Secret / violet path */
  secret?: boolean;
  effects?: ChoiceEffects;
  next: string;
}

export interface ChoiceEffects {
  flags?: Record<string, boolean>;
  counters?: Partial<BehaviorCounters>;
  relationship?: number;
  mood?: OrbMood;
  aiLine?: string;
  secret?: string;
  majorChoice?: string;
  ending?: EndingId;
}

export interface SceneDef {
  id: string;
  act: number;
  kind: SceneKind;
  environment: EnvironmentPreset;
  formId?: string;
  title?: string;
  prompt?: string;
  aiLine?: string;
  /** Alternate line when a flag is set */
  aiLineIf?: { flag: string; line: string }[];
  aiMood?: OrbMood;
  systemLine?: string;
  systemTitle?: string;
  choices?: ChoiceDef[];
  setpiece?: SetpieceId;
  /** Auto-advance after ms (dialogue beats) */
  autoMs?: number;
  continueLabel?: string;
  next?: string;
  endingId?: EndingId;
  /** Visual note for act evolution */
  anomalyLevel?: number;
  /** Assistant stage position for this beat */
  orbAnchor?: OrbAnchor;
  /** Assessment panel choreography */
  panelMotion?: PanelMotion;
  /** Choice button kinetic style */
  choiceMotion?: ChoiceMotion;
  /**
   * Key dialogue / pitch beat: orb enlarges & centers presence,
   * assessment form dims so the player answers the assistant.
   */
  spotlight?: boolean;
  /** Short non-form companion interaction */
  companion?: CompanionBeat;
  /**
   * Allow a tiny poke hit-target on the orb.
   * Only when docked clear of form CTAs / during spotlight+companion.
   */
  orbPokeable?: boolean;
}

export const SAVE_KEY = "dnps-save-v2";
export const SKIP_INTRO_KEY = "dnps-skip-intros";
/** Survives new-game clear — title screen wave after escape ending */
export const TITLE_WAVE_KEY = "dnps-title-wave-v1";
/** Survives new-game clear — title remembers ally / refuse mercy */
export const TITLE_ALLY_KEY = "dnps-title-ally-v1";

/**
 * Five readable “expressive” moods for the enjoyment pass.
 * Full OrbMood still drives color; these collapse presentation physics.
 */
export type ExpressiveMood =
  | "idle"
  | "curious"
  | "nervous"
  | "pleased"
  | "alarmed";
