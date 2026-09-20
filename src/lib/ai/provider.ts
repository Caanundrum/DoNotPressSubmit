import { mockFlavorLine } from "./mock";
import type { AssistantFlavorRequest, AssistantFlavorResponse } from "./types";
import { shouldAttemptFlavor, validateFlavorPayload } from "./validate";

/**
 * Simulated assistant flavor only — no network, no API keys, no LLM backends.
 * Authored fallback is sacred; local mock seasons eligible beats.
 */
export async function generateAssistantFlavor(
  req: AssistantFlavorRequest,
): Promise<AssistantFlavorResponse> {
  if (!shouldAttemptFlavor(req)) {
    return { ok: true, line: req.fallbackLine, source: "fallback" };
  }
  return validateFlavorPayload({ line: mockFlavorLine(req) }, req.fallbackLine, "mock");
}

export function assistantProviderStatus(): {
  mode: "simulated";
  hasKey: false;
  networkCalls: false;
} {
  return {
    mode: "simulated",
    hasKey: false,
    networkCalls: false,
  };
}
