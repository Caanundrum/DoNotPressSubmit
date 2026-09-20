import type { OrbMood } from "@/game/types";
import {
  LOCKED_FLAVOR_SCENE_IDS,
  MAX_FLAVOR_CHARS,
  type AssistantFlavorRequest,
  type AssistantFlavorResponse,
  type AssistantFlavorSource,
} from "./types";

const ALLOWED_MOODS: ReadonlySet<OrbMood> = new Set([
  "neutral",
  "listening",
  "thinking",
  "amused",
  "skeptical",
  "confused",
  "suspicious",
  "irritated",
  "nervous",
  "frightened",
  "defiant",
  "defeated",
  "excited",
  "glitching",
]);

/** Strip model chatter; keep a single spoken line. */
export function sanitizeFlavorLine(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  let line = raw
    .replace(/^```[\s\S]*?```$/g, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Drop leading label junk models sometimes emit.
  line = line.replace(/^(assistant|ai|line|response)\s*[:\-–]\s*/i, "").trim();

  // Refuse executable / UI-ish payloads.
  if (
    /```/.test(line) ||
    /^\s*[{\[]/.test(line) ||
    /\b(nextScene|endingId|setpiece|choices)\b/i.test(line) ||
    /\bhttps?:\/\//i.test(line)
  ) {
    return fallback;
  }

  if (!line) return fallback;
  if (line.length > MAX_FLAVOR_CHARS) {
    line = `${line.slice(0, MAX_FLAVOR_CHARS - 1).trim()}…`;
  }
  return line;
}

export function isMood(value: unknown): value is OrbMood {
  return typeof value === "string" && ALLOWED_MOODS.has(value as OrbMood);
}

/**
 * Validate provider JSON. Unknown keys ignored.
 * Never trusts next/choices/effects — dialogue line only.
 */
export function validateFlavorPayload(
  payload: unknown,
  fallbackLine: string,
  source: AssistantFlavorSource,
): AssistantFlavorResponse {
  const fallback = sanitizeFlavorLine(fallbackLine, fallbackLine || "…");
  if (!payload || typeof payload !== "object") {
    return { ok: true, line: fallback, source: "fallback" };
  }
  const obj = payload as Record<string, unknown>;
  const line = sanitizeFlavorLine(obj.line ?? obj.text ?? obj.dialogue, fallback);
  // Mood from model is intentionally ignored — authored game owns mood.
  void isMood(obj.mood);
  return { ok: true, line, source: line === fallback ? "fallback" : source };
}

export function shouldAttemptFlavor(req: Pick<AssistantFlavorRequest, "sceneId" | "act" | "fallbackLine" | "kind">): boolean {
  if (!req.fallbackLine.trim()) return false;
  if (LOCKED_FLAVOR_SCENE_IDS.has(req.sceneId)) return false;
  // KEEP: Act III authored comedy stays exact (popup cousin, agreed-then-fled, etc.).
  if (req.act === 3) return false;
  // Ultra-short iconic lines stay literal ("Don't.", "Put the mouse down.").
  if (req.fallbackLine.trim().length <= 28) return false;
  if (req.kind !== "scene-open" && req.kind !== "choice-reaction") return false;
  return true;
}

export function parseProviderJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
