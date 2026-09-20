import { NextResponse } from "next/server";
import { generateAssistantFlavor, assistantProviderStatus } from "@/lib/ai/provider";
import type { AssistantFlavorRequest } from "@/lib/ai/types";
import type { OrbMood, Personality } from "@/game/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PERSONALITIES: ReadonlySet<Personality> = new Set([
  "neurotic",
  "overconfident",
  "passiveAggressive",
  "corporate",
  "existential",
]);

function asPersonality(value: unknown): Personality {
  return typeof value === "string" && PERSONALITIES.has(value as Personality)
    ? (value as Personality)
    : "corporate";
}

function asMood(value: unknown): OrbMood {
  return typeof value === "string" ? (value as OrbMood) : "neutral";
}

function asString(value: unknown, max = 400): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function asStringArray(value: unknown, maxItems = 8, maxLen = 120): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .slice(0, maxItems)
    .map((v) => v.slice(0, maxLen));
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseBody(raw: unknown): AssistantFlavorRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const fallbackLine = asString(body.fallbackLine, 400);
  if (!fallbackLine) return null;
  const kind = body.kind === "choice-reaction" ? "choice-reaction" : "scene-open";
  return {
    sceneId: asString(body.sceneId, 80) || "unknown",
    act: Math.max(1, Math.min(5, Math.floor(asNumber(body.act) || 1))),
    kind,
    personality: asPersonality(body.personality),
    mood: asMood(body.mood),
    playerName: asString(body.playerName, 40),
    fallbackLine,
    formId: asString(body.formId, 40) || undefined,
    title: asString(body.title, 120) || undefined,
    prompt: asString(body.prompt, 240) || undefined,
    choiceId: asString(body.choiceId, 60) || undefined,
    choiceLabel: asString(body.choiceLabel, 120) || undefined,
    recentBeats: asStringArray(body.recentBeats),
    relationshipScore: asNumber(body.relationshipScore),
    ignoredWarnings: asNumber(body.ignoredWarnings),
    forbiddenClicks: asNumber(body.forbiddenClicks),
    orbPokes: asNumber(body.orbPokes),
  };
}

/** GET — simulated-AI status (zero secrets; no network model calls). */
export async function GET() {
  const status = assistantProviderStatus();
  return NextResponse.json({
    ok: true,
    phase: 4,
    ...status,
    note: "Simulated AI only — local mock/scripted flavor over authored lines. Zero secrets; no LLM backend; no outbound model calls.",
  });
}

/** POST — non-authoritative simulated dialogue flavor. Always returns a speakable line. */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", line: "", source: "fallback" },
      { status: 400 },
    );
  }

  const parsed = parseBody(raw);
  if (!parsed) {
    return NextResponse.json(
      {
        ok: false,
        error: "fallbackLine_required",
        line: "",
        source: "fallback",
      },
      { status: 400 },
    );
  }

  const result = await generateAssistantFlavor(parsed);
  return NextResponse.json(result);
}
