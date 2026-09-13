export type GamePhase =
  | "chaos"
  | "hcos"
  | "title"
  | "assessment"
  | "system"
  | "complete";

export type OrbMood =
  | "neutral"
  | "listening"
  | "amused"
  | "nervous"
  | "thinking";

export type WorkChoice =
  | "quiet"
  | "collaborative"
  | "remote"
  | "cavern"
  | null;

export interface GameState {
  phase: GamePhase;
  orbMood: OrbMood;
  choice: WorkChoice;
  beginHoverMs: number;
  systemActive: boolean;
  skipIntros: boolean;
  reducedMotion: boolean;
}
