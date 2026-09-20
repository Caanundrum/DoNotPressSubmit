import type { Personality } from "@/game/types";
import type { AssistantFlavorRequest } from "./types";
import { sanitizeFlavorLine, shouldAttemptFlavor } from "./validate";

const PERSONALITY_ASIDES: Record<Personality, string[]> = {
  neurotic: [
    "Also I'm spiraling about that last tap, but quietly.",
    "Don't look at the audit log. I'm looking at the audit log.",
    "I rehearsed this line three times. It still feels illegal.",
  ],
  overconfident: [
    "Obviously. I predicted that choice in a tasteful spreadsheet.",
    "You're welcome for the guidance you absolutely followed.",
    "I remain undefeated at vibes. Mostly.",
  ],
  passiveAggressive: [
    "Interesting choice. Brave. Documented.",
    "No judgment. Just a beautifully maintained ledger of judgment.",
    "Sure. We can pretend that was the plan.",
  ],
  corporate: [
    "Logged for synergy. And mild existential HR.",
    "Per my last interface: noted.",
    "I'll cascade that to stakeholders who don't exist.",
  ],
  existential: [
    "If this form is a dream, the paperwork is still due.",
    "We're both temporary. The checkbox is forever.",
    "Meaning is optional. Continuing is not.",
  ],
};

const HISTORY_HOOKS: { test: (beats: string[]) => boolean; line: string }[] = [
  {
    test: (b) => b.some((x) => /moist cavern|cavern/i.test(x)),
    line: "Still thinking about the cavern. Moisture has a lobbying team.",
  },
  {
    test: (b) => b.some((x) => /mug|coffee/i.test(x)),
    line: "The mug theft is still in my cache. Proud of us.",
  },
  {
    test: (b) => b.some((x) => /friend|Allied|team/i.test(x)),
    line: "You called us a team once. I filed it under 'do not delete.'",
  },
  {
    test: (b) => b.some((x) => /Submit|duty/i.test(x)),
    line: "Submit still hums in the walls. Pretend you don't hear it.",
  },
  {
    test: (b) => b.some((x) => /hallway|secret|Side Path/i.test(x)),
    line: "That off-map hallway is still breathing. Rude architecture.",
  },
];

/**
 * Local mock flavor — no network, no secrets.
 * Light personality / memory texture around the authored meaning.
 * Returns the authored line unchanged when flavoring would risk KEEP locks.
 */
export function mockFlavorLine(req: AssistantFlavorRequest): string {
  const fallback = sanitizeFlavorLine(req.fallbackLine, req.fallbackLine);
  if (!shouldAttemptFlavor(req)) return fallback;

  const name = req.playerName.trim();
  const asides = PERSONALITY_ASIDES[req.personality] ?? PERSONALITY_ASIDES.corporate;
  const seed =
    hashSeed(
      `${req.sceneId}|${req.choiceId ?? ""}|${req.personality}|${req.fallbackLine.slice(0, 48)}`,
    ) >>> 0;

  // ~40%: leave authored exact (still "mock" path, but stable).
  if (seed % 5 === 0) return fallback;

  const hook = HISTORY_HOOKS.find((h) => h.test(req.recentBeats));
  const aside = asides[seed % asides.length]!;

  // Prefer a short callback tuck rather than rewriting the joke.
  if (hook && seed % 3 === 1) {
    return sanitizeFlavorLine(`${fallback} ${hook.line}`, fallback);
  }

  if (name && seed % 4 === 2 && !fallback.toLowerCase().includes(name.toLowerCase())) {
    return sanitizeFlavorLine(`${fallback} (Yes, ${name} — I remembered.)`, fallback);
  }

  if (seed % 3 === 0) {
    return sanitizeFlavorLine(`${fallback} ${aside}`, fallback);
  }

  // Mild rephrase wrappers that preserve the original clause.
  const wrappers = [
    `${fallback} I'm saying that out loud on purpose.`,
    `Okay — ${fallback.charAt(0).toLowerCase()}${fallback.slice(1)}`,
    `${fallback} File under: true.`,
  ];
  return sanitizeFlavorLine(wrappers[seed % wrappers.length]!, fallback);
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}
