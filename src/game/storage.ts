import { createInitialState } from "./state";
import type { EndingId, GameState } from "./types";
import { SAVE_KEY, TITLE_WAVE_KEY } from "./types";

export function loadSave(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.sceneId || !parsed?.sessionId) return null;
    // Backfill counters added in later passes.
    if (parsed.counters && typeof parsed.counters.orbPokes !== "number") {
      parsed.counters.orbPokes = 0;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSave(state: GameState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Quota / private mode — fail quietly.
  }
}

export function clearSave() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return loadSave() !== null;
}

export function newGameSave(): GameState {
  const state = createInitialState();
  writeSave(state);
  return state;
}

/** Persistent title-screen memory after escape (survives clearSave). */
export function rememberTitleWave(ending?: EndingId) {
  if (typeof window === "undefined") return;
  if (ending !== "escape" && ending !== "secret") return;
  try {
    window.localStorage.setItem(
      TITLE_WAVE_KEY,
      JSON.stringify({ waved: true, ending, at: Date.now() }),
    );
  } catch {
    // ignore
  }
}

export function loadTitleWave(): { waved: boolean; ending?: EndingId } {
  if (typeof window === "undefined") return { waved: false };
  try {
    const raw = window.localStorage.getItem(TITLE_WAVE_KEY);
    if (!raw) return { waved: false };
    const parsed = JSON.parse(raw) as { waved?: boolean; ending?: EndingId };
    return { waved: !!parsed.waved, ending: parsed.ending };
  } catch {
    return { waved: false };
  }
}
