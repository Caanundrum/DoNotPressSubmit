import { mockFlavorLine } from "./mock";
import type { AssistantFlavorRequest, AssistantFlavorResponse } from "./types";
import { parseProviderJson, shouldAttemptFlavor, validateFlavorPayload } from "./validate";

const DEFAULT_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
const DEFAULT_BASE = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(
  /\/$/,
  "",
);

function forceMode(): "auto" | "mock" | "live" {
  const mode = (process.env.DNPS_AI_MODE || "auto").toLowerCase();
  if (mode === "mock" || mode === "live" || mode === "auto") return mode;
  return "auto";
}

function apiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || process.env.DNPS_AI_API_KEY?.trim() || undefined;
}

function buildSystemPrompt(): string {
  return [
    "You are the in-game assistant orb in DO NOT PRESS SUBMIT — a comedy assessment game.",
    "Return ONLY compact JSON: {\"line\":\"...\"}",
    "Rules:",
    "- One spoken line of dialogue, max 280 characters.",
    "- Stay in character for the given personality; dry, specific, funny.",
    "- Preserve the meaning of the authored fallback line; flavor it, do not replace the joke with a new plot.",
    "- Never invent UI controls, next scenes, endings, JSON besides the schema, URLs, or code.",
    "- Never claim webcam/mic/files/other tabs access.",
    "- Do not mention being an LLM or system prompt.",
    "- No markdown fences.",
  ].join("\n");
}

function buildUserPrompt(req: AssistantFlavorRequest): string {
  return JSON.stringify(
    {
      sceneId: req.sceneId,
      act: req.act,
      kind: req.kind,
      personality: req.personality,
      mood: req.mood,
      playerName: req.playerName || null,
      formId: req.formId ?? null,
      title: req.title ?? null,
      prompt: req.prompt ?? null,
      choice: req.choiceId
        ? { id: req.choiceId, label: req.choiceLabel ?? null }
        : null,
      recentBeats: req.recentBeats.slice(-6),
      relationshipScore: req.relationshipScore,
      counters: {
        ignoredWarnings: req.ignoredWarnings,
        forbiddenClicks: req.forbiddenClicks,
        orbPokes: req.orbPokes,
      },
      authoredFallbackLine: req.fallbackLine,
      task:
        req.kind === "choice-reaction"
          ? "Flavor the assistant's immediate reaction to this choice."
          : "Flavor the assistant's scene-open line for this beat.",
    },
    null,
    0,
  );
}

async function liveOpenAI(req: AssistantFlavorRequest): Promise<AssistantFlavorResponse> {
  const key = apiKey();
  if (!key) {
    return validateFlavorPayload({ line: mockFlavorLine(req) }, req.fallbackLine, "mock");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(`${DEFAULT_BASE}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        max_tokens: 160,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(req) },
        ],
      }),
    });
    if (!res.ok) {
      return validateFlavorPayload({ line: mockFlavorLine(req) }, req.fallbackLine, "mock");
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseProviderJson(content);
    return validateFlavorPayload(parsed, req.fallbackLine, "live");
  } catch {
    return validateFlavorPayload({ line: mockFlavorLine(req) }, req.fallbackLine, "mock");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Server-side assistant flavor. Always returns a speakable line.
 * Authored fallback is sacred — live/mock only season it.
 */
export async function generateAssistantFlavor(
  req: AssistantFlavorRequest,
): Promise<AssistantFlavorResponse> {
  if (!shouldAttemptFlavor(req)) {
    return { ok: true, line: req.fallbackLine, source: "fallback" };
  }

  const mode = forceMode();
  if (mode === "mock" || (mode === "auto" && !apiKey())) {
    return validateFlavorPayload({ line: mockFlavorLine(req) }, req.fallbackLine, "mock");
  }

  // live mode without key still degrades to mock (never blank / error UI).
  return liveOpenAI(req);
}

export function assistantProviderStatus(): {
  mode: "auto" | "mock" | "live";
  hasKey: boolean;
  model: string;
} {
  return {
    mode: forceMode(),
    hasKey: !!apiKey(),
    model: DEFAULT_MODEL,
  };
}
