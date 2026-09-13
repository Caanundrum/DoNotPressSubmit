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
  | "center";

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
  | "report";

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
}

export const SAVE_KEY = "dnps-save-v2";
export const SKIP_INTRO_KEY = "dnps-skip-intros";
