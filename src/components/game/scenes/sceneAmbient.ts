import type { GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";

export function applyOrbPoke(
  state: GameState,
  pokes: number,
): { next: GameState; notice: string } {
  const secrets = [...state.secrets];
  if (pokes >= 7 && !secrets.includes("orb-poker-serial")) {
    secrets.push("orb-poker-serial");
  }
  const next: GameState = {
    ...state,
    counters: {
      ...state.counters,
      orbPokes: pokes,
      forbiddenClicks: state.counters.forbiddenClicks + 1,
      secretsFound: secrets.length,
    },
    flags: {
      ...state.flags,
      pokedAssistant: true,
      ...(pokes >= 7 ? { serialPoker: true } : {}),
    },
    secrets,
    relationshipScore: state.relationshipScore + (pokes === 1 ? 1 : pokes === 7 ? 1 : 0),
    aiMood: (pokes >= 7 ? "glitching" : pokes >= 3 ? "irritated" : "nervous") as OrbMood,
    history: [...state.history, `poke:${pokes}`],
  };

  let notice: string;
  if (pokes === 1) {
    notice = "Hey— soft. I'm not a stress ball with a security clearance.";
  } else if (pokes === 2) {
    notice = "Okay that registered. System is going to write a memo titled 'unauthorized contact.'";
  } else if (pokes === 3) {
    notice = "SYSTEM NOTICE: ASSISTANT SURFACE CONTACT LOGGED. Please stop helping.";
    audio.play("system", 0.35);
  } else if (pokes >= 7) {
    notice =
      "SECRET FLAG: SERIAL POKER. You've turned affection into a felony. I'm weirdly honored.";
    audio.play("system", 0.4);
  } else {
    notice = "Still logging. Still judging. Still oddly fond.";
  }

  return { next, notice };
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
