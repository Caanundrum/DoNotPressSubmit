import type { OrbMood, Personality } from "@/game/types";

/** Flavored dialogue only — never progression, UI, or endings. */
export type AssistantFlavorKind = "scene-open" | "choice-reaction";

export type AssistantFlavorSource = "live" | "mock" | "fallback";

export interface AssistantFlavorRequest {
  sceneId: string;
  act: number;
  kind: AssistantFlavorKind;
  personality: Personality;
  mood: OrbMood;
  playerName: string;
  /** Authored line — always the safety net and meaning anchor. */
  fallbackLine: string;
  formId?: string;
  title?: string;
  prompt?: string;
  choiceId?: string;
  choiceLabel?: string;
  /** Human-readable recent beats (already glossed). */
  recentBeats: string[];
  relationshipScore: number;
  ignoredWarnings: number;
  forbiddenClicks: number;
  orbPokes: number;
}

export interface AssistantFlavorResponse {
  ok: true;
  line: string;
  source: AssistantFlavorSource;
}

export interface AssistantFlavorError {
  ok: false;
  error: string;
  line: string;
  source: "fallback";
}

export type AssistantFlavorResult = AssistantFlavorResponse | AssistantFlavorError;

/** Hard-lock lines that must never be rewritten (climax / iconic beats). */
export const LOCKED_FLAVOR_SCENE_IDS = new Set([
  "act5-climax",
  "act5-counter",
  "act5-system-push",
  // Act III comedy is skipped entirely via act===3 in shouldAttemptFlavor;
  // IDs listed here as belt-and-suspenders.
  "act3-escaping",
  "act3-popup",
  "act3-checkbox",
  "act3-aftermath",
  "act3-between-1",
  "act3-between-2",
  "act3-recovery",
  "act3-bridge",
]);

export const MAX_FLAVOR_CHARS = 280;
