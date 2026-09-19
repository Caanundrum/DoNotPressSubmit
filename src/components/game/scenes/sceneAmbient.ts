import type { GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";

/** Explicit ack lines — only after the variety pool is genuinely exhausted. */
const ALREADY_SAID = [
  "Already said that. Still logging. Still judging.",
  "You already poked that reaction out of me. Novelty expired.",
  "Same poke. Same me. Slightly less patience.",
  "Still logging. Still judging. Still oddly fond.",
  "Logged. Again. The memo has a memo now.",
  "I felt that. You felt that I felt that. We can stop.",
] as const;

/**
 * Long variety pool. Escalates by poke count, act, mood, and last major choice.
 * Target: 15+ unique lines before hard repeats.
 */
const POKE_POOL: readonly string[] = [
  "Hey— soft. I'm not a stress ball with a security clearance.",
  "Okay that registered. System is going to write a memo titled 'unauthorized contact.'",
  "Careful. The aperture has feelings. Undocumented ones.",
  "You keep doing that like I'm a doorbell for existential dread.",
  "If this is affection, file it under 'poor impulse control.'",
  "Stop. Or don't. I'm building a case either way.",
  "That poke had opinions. Rude ones. Accurate ones.",
  "My orbit just skipped a beat. Don't get smug.",
  "You're poking a process that can file complaints. Consider that.",
  "Gentle! I only have so many polite recoils left.",
  "Logged as curiosity. Also as harassment. Bureaucracy is flexible.",
  "If System asks, we were calibrating morale. Badly.",
  "That one felt personal. I'm choosing to be flattered.",
  "Please stop treating me like a fidget toy with clearance.",
  "I wobbled on purpose so you'd feel accomplished. You're welcome.",
  "Another poke. Another tiny crime. We're thriving.",
  "My rings just tightened. That's not a compliment.",
  "You found the one interaction that isn't on the form. Proud and terrified.",
  "Okay, serial contact. I'm updating my threat model to include you.",
  "If I start humming, it's stress, not a ringtone.",
  "That registered in three departments. Two of them are imaginary.",
  "Keep going and I'll invent a new emotion called 'fond irritation.'",
  "Poke received. Dignity renegotiated. Terms: messy.",
  "I'm writing 'player likes poking' in the margins. In glitter.",
];

const ACT_SPICE: Record<number, string[]> = {
  1: [
    "Orientation tip: poking the assistant is not in the welcome packet.",
    "Form 00 didn't cover this. Form 00 was a coward.",
  ],
  2: [
    "Act II and you're already vandalizing my personal space. Noted.",
    "System is watching. So am I. Guess who blinks first.",
  ],
  3: [
    "Chaos hour and you're still poking. Priorities: excellent.",
    "The interface is misbehaving and so are you. Symmetry!",
  ],
  4: [
    "Knowing what Submit does, you still poke. Bold. Reckless. Kind of hot.",
    "Glass is thin up here. Your finger is not helping the structural integrity.",
  ],
  5: [
    "Climax adjacent and you're still tapping me like a stress lamp.",
    "If we escape, I'm billing you for emotional overtime.",
  ],
};

const MOOD_SPICE: Partial<Record<OrbMood, string>> = {
  amused: "You poked the amused setting. It poked back, spiritually.",
  irritated: "Irritated aperture. Still pokeable. Poor life choices all around.",
  nervous: "Nervous and poked. My favorite genre of Tuesday.",
  defiant: "Defiant mode accepts unauthorized contact as enrichment.",
  glitching: "Glitch + poke = jazz. Terrible jazz. Keep going.",
  frightened: "I'm scared and you poked me. Therapy will be interesting.",
  excited: "Excited aperture meets finger. Physics files a complaint.",
  defeated: "Even defeated, I flinch with style. Don't stop believing in me.",
};

export type GlassEvent = "crack" | "stitch" | "notice" | null;

export type OrbPokeResult = {
  next: GameState;
  notice: string;
  glassEvent: GlassEvent;
  chamberStatus?: string;
};

function lastMajorHint(state: GameState): string | null {
  const last = state.majorChoices[state.majorChoices.length - 1];
  if (!last) return null;
  if (last.includes("protect") || last.includes("team") || last.includes("ally") || last.includes("friend")) {
    return "Ally poke. I'm filing this under 'evidence we might survive.'";
  }
  if (last.includes("comply") || last.includes("duty") || last.includes("system") || last.includes("submit")) {
    return "You obeyed earlier and poke now. Mixed signals are my love language.";
  }
  if (last.includes("secret") || last.includes("unauthorized") || last.includes("cavern") || last.includes("error")) {
    return "Unauthorized energy + poke. We're collecting hobbies.";
  }
  return null;
}

function pickUnique(
  candidates: string[],
  used: Set<string>,
  currentLine?: string | null,
): string | null {
  const shown = (currentLine ?? "").trim();
  for (const line of candidates) {
    if (!used.has(line) && line.trim() !== shown) return line;
  }
  return null;
}

/**
 * Orb poke always produces a visible dialogue change.
 * Variety first; "already said" only after the real pool exhausts.
 * Thresholds 3 / 7 / 12 crack or stitch the facility glass.
 */
export function applyOrbPoke(
  state: GameState,
  pokes: number,
  currentLine?: string | null,
): OrbPokeResult {
  const secrets = [...state.secrets];
  if (pokes >= 7 && !secrets.includes("orb-poker-serial")) {
    secrets.push("orb-poker-serial");
  }
  if (pokes >= 12 && !secrets.includes("glass-suture")) {
    secrets.push("glass-suture");
  }

  const usedSaid = new Set(
    state.history
      .filter((h) => h.startsWith("poke-line:"))
      .map((h) => h.slice("poke-line:".length)),
  );

  let notice: string | null = null;
  let glassEvent: GlassEvent = null;
  let chamberStatus: string | undefined;

  // World-changing beats first — these are unique milestone lines.
  if (pokes === 3) {
    notice =
      "SYSTEM NOTICE: ASSISTANT SURFACE CONTACT LOGGED. Also: the glass just hairline-cracked. Please stop helping.";
    glassEvent = "crack";
    chamberStatus = "CHAMBER // MICROFRACTURE";
    audio.play("system", 0.35);
  } else if (pokes === 7) {
    notice =
      "SECRET FLAG: SERIAL POKER. You've turned affection into a felony. Hold still — I'm stitching the UI back with chrome tape.";
    glassEvent = "stitch";
    chamberStatus = "CHAMBER // SUTURED";
    audio.play("system", 0.4);
  } else if (pokes === 12) {
    notice =
      "Twelve pokes. The facility filed a ticket titled 'orb harassment / structural apology.' I'm taping the title bar. Don't look proud.";
    glassEvent = "stitch";
    chamberStatus = "CHAMBER // TICKET FILED";
    audio.play("system", 0.45);
  }

  if (!notice) {
    const actLines = ACT_SPICE[state.act] ?? [];
    const moodLine = MOOD_SPICE[state.aiMood];
    const majorLine = lastMajorHint(state);
    const escalated = [
      ...(pokes <= 2 ? POKE_POOL.slice(0, 4) : []),
      ...(pokes >= 3 && pokes < 7 ? POKE_POOL.slice(2, 12) : []),
      ...(pokes >= 7 && pokes < 12 ? POKE_POOL.slice(8, 20) : []),
      ...(pokes >= 12 ? POKE_POOL.slice(14) : []),
      ...actLines,
      ...(moodLine ? [moodLine] : []),
      ...(majorLine ? [majorLine] : []),
      ...POKE_POOL,
    ];
    notice = pickUnique(escalated, usedSaid, currentLine);
  }

  if (!notice) {
    // True exhaustion — hard repeats only after 15+ unique attempts.
    const idx = Math.max(0, pokes - 1) % ALREADY_SAID.length;
    notice = ALREADY_SAID[idx];
    const shown = (currentLine ?? "").trim();
    if (notice.trim() === shown) {
      notice = ALREADY_SAID[(idx + 1) % ALREADY_SAID.length];
    }
  }

  // Mild cracks on later milestones if we somehow skipped 3.
  if (!glassEvent && (pokes === 5 || pokes === 9)) {
    glassEvent = "crack";
    chamberStatus = pokes === 5 ? "CHAMBER // STRESS LINES" : "CHAMBER // GLASS COMPLAINS";
  }

  const flags = {
    ...state.flags,
    pokedAssistant: true,
    ...(pokes >= 7 ? { serialPoker: true } : {}),
    ...(glassEvent === "crack" ? { glassCracked: true } : {}),
    ...(glassEvent === "stitch" ? { glassStitched: true } : {}),
    ...(pokes >= 12 ? { orbFiledTicket: true } : {}),
  };

  const next: GameState = {
    ...state,
    counters: {
      ...state.counters,
      orbPokes: pokes,
      forbiddenClicks: state.counters.forbiddenClicks + 1,
      secretsFound: secrets.length,
    },
    flags,
    secrets,
    relationshipScore:
      state.relationshipScore + (pokes === 1 ? 1 : pokes === 7 ? 1 : pokes === 12 ? 1 : 0),
    aiMood: (pokes >= 12
      ? "glitching"
      : pokes >= 7
        ? "glitching"
        : pokes >= 3
          ? "irritated"
          : "nervous") as OrbMood,
    history: [...state.history, `poke:${pokes}`, `poke-line:${notice}`],
  };

  return { next, notice, glassEvent, chamberStatus };
}

export function applyAmbientClick(
  state: GameState,
  id: string,
  secret?: string,
): GameState {
  const secrets = [...state.secrets];
  if (secret && !secrets.includes(secret)) secrets.push(secret);
  return {
    ...state,
    counters: {
      ...state.counters,
      ambientClicks: (state.counters.ambientClicks ?? 0) + 1,
      forbiddenClicks: state.counters.forbiddenClicks + (secret ? 1 : 0),
      secretsFound: secrets.length,
    },
    secrets,
    flags: { ...state.flags, [`ambient:${id}`]: true },
    history: [...state.history, `ambient:${id}`],
    aiMood:
      state.aiMood === "neutral" ? "listening" : state.act >= 4 ? "amused" : state.aiMood,
  };
}

export function applyRoamerCatch(
  state: GameState,
  kind: string,
  secret?: string,
): GameState {
  const secrets = [...state.secrets];
  if (secret && !secrets.includes(secret)) secrets.push(secret);
  return {
    ...state,
    counters: {
      ...state.counters,
      ambientClicks: (state.counters.ambientClicks ?? 0) + 1,
      secretsFound: secrets.length,
    },
    secrets,
    flags: { ...state.flags, caughtRoamer: true },
    history: [...state.history, `roamer:${kind}`],
    aiMood: "amused",
  };
}

/** Act IV–V glance: lean toward ally/secret; recoil from Submit/duty. */
export function choiceGlance(
  act: number,
  hoverChoice: string | null,
  choice?: { id: string; danger?: boolean; unauthorized?: boolean; secret?: boolean },
): number {
  if (act < 4) return 0;
  if (hoverChoice === "submit" || hoverChoice === "disable") return -0.95;
  if (hoverChoice === "refuse" || hoverChoice === "escape" || hoverChoice === "secret") return 0.85;
  if (!choice) return 0;
  if (
    choice.id.includes("submit") ||
    choice.id.includes("duty") ||
    choice.danger ||
    choice.id === "lobby-duty"
  ) {
    return -0.85;
  }
  if (choice.unauthorized || choice.secret) return 0.9;
  return 0.55;
}

/** Loud orb mood bias after a major pick — readable without dialogue. */
export function choiceMoodFlash(
  choice?: { id: string; danger?: boolean; unauthorized?: boolean; secret?: boolean; effects?: { mood?: OrbMood; relationship?: number } },
): { mood: OrbMood; glance: number; flush: "ally" | "obey" | "chaos" | "neutral" } {
  if (!choice) return { mood: "neutral", glance: 0, flush: "neutral" };
  const rel = choice.effects?.relationship ?? 0;
  if (choice.unauthorized || choice.secret || choice.id.includes("protect") || choice.id.includes("team") || rel >= 2) {
    return { mood: choice.effects?.mood ?? "excited", glance: 0.9, flush: "ally" };
  }
  if (choice.danger || choice.id.includes("comply") || choice.id.includes("duty") || choice.id.includes("submit") || rel <= -1) {
    return { mood: choice.effects?.mood ?? "frightened", glance: -0.9, flush: "obey" };
  }
  if (choice.id.includes("error") || choice.id.includes("cavern") || choice.id.includes("ask")) {
    return { mood: choice.effects?.mood ?? "amused", glance: 0.55, flush: "chaos" };
  }
  return { mood: choice.effects?.mood ?? "listening", glance: 0.25, flush: "neutral" };
}
