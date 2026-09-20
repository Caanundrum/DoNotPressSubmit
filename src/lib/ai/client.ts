"use client";

import { glossMajorChoice } from "@/game/state";
import type { GameState } from "@/game/types";
import type {
  AssistantFlavorKind,
  AssistantFlavorRequest,
  AssistantFlavorResult,
} from "./types";

export type FlavorRequestInput = {
  state: GameState;
  sceneId: string;
  act: number;
  kind: AssistantFlavorKind;
  fallbackLine: string;
  formId?: string;
  title?: string;
  prompt?: string;
  choiceId?: string;
  choiceLabel?: string;
  /** Client abort / timeout ms */
  timeoutMs?: number;
};

function buildRequest(input: FlavorRequestInput): AssistantFlavorRequest {
  const { state } = input;
  const recentBeats = [...state.majorChoices]
    .slice(-6)
    .map((c) => glossMajorChoice(c))
    .filter(Boolean);
  return {
    sceneId: input.sceneId,
    act: input.act,
    kind: input.kind,
    personality: state.aiPersonality,
    mood: state.aiMood,
    playerName: state.playerName,
    fallbackLine: input.fallbackLine,
    formId: input.formId,
    title: input.title,
    prompt: input.prompt,
    choiceId: input.choiceId,
    choiceLabel: input.choiceLabel,
    recentBeats,
    relationshipScore: state.relationshipScore,
    ignoredWarnings: state.counters.ignoredWarnings,
    forbiddenClicks: state.counters.forbiddenClicks,
    orbPokes: state.counters.orbPokes,
  };
}

/**
 * Browser helper — never blocks the scene on network.
 * On any failure, returns the authored fallback with source:"fallback".
 */
export async function requestAssistantFlavor(
  input: FlavorRequestInput,
): Promise<AssistantFlavorResult> {
  const fallback = input.fallbackLine?.trim() ?? "";
  if (!fallback) {
    return { ok: false, error: "empty", line: "", source: "fallback" };
  }

  const timeoutMs = input.timeoutMs ?? 2200;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequest(input)),
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: true, line: fallback, source: "fallback" };
    }
    const data = (await res.json()) as AssistantFlavorResult;
    const line =
      typeof data.line === "string" && data.line.trim() ? data.line.trim() : fallback;
    if (!data.ok) {
      return { ok: true, line: fallback, source: "fallback" };
    }
    return {
      ok: true,
      line,
      source: data.source === "live" || data.source === "mock" ? data.source : "fallback",
    };
  } catch {
    return { ok: true, line: fallback, source: "fallback" };
  } finally {
    window.clearTimeout(timer);
  }
}
