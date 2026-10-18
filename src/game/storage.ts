import { createInitialState } from "./state";
import type { EndingId, GameState } from "./types";
import {
  SAVE_KEY,
  TITLE_ALLY_KEY,
  TITLE_MEMORY_KEY,
  TITLE_WAVE_KEY,
} from "./types";

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
    if (parsed.counters && typeof parsed.counters.ambientClicks !== "number") {
      parsed.counters.ambientClicks = 0;
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

export type TitleMemory = {
  ending: EndingId;
  at: number;
};

/** Persist the most recent ending — title look follows this, not a sticky escape flag. */
export function rememberTitleEnding(ending: EndingId) {
  if (typeof window === "undefined") return;
  try {
    const payload: TitleMemory = { ending, at: Date.now() };
    window.localStorage.setItem(TITLE_MEMORY_KEY, JSON.stringify(payload));
    // Drop legacy sticky flags so an old escape can't outrank a newer archive.
    window.localStorage.removeItem(TITLE_WAVE_KEY);
    window.localStorage.removeItem(TITLE_ALLY_KEY);
  } catch {
    // ignore
  }
}

export function loadTitleMemory(): TitleMemory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TITLE_MEMORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { ending?: EndingId; at?: number };
      if (
        parsed?.ending === "escape" ||
        parsed?.ending === "secret" ||
        parsed?.ending === "refuse" ||
        parsed?.ending === "submit" ||
        parsed?.ending === "disable"
      ) {
        return { ending: parsed.ending, at: parsed.at ?? Date.now() };
      }
    }
    // One-time migrate from legacy wave/ally keys (escape wins over ally).
    const wave = loadTitleWaveLegacy();
    if (wave.waved && (wave.ending === "escape" || wave.ending === "secret")) {
      const migrated: TitleMemory = {
        ending: wave.ending ?? "escape",
        at: Date.now(),
      };
      rememberTitleEnding(migrated.ending);
      return migrated;
    }
    const ally = loadTitleAllyLegacy();
    if (ally.ally) {
      const migrated: TitleMemory = {
        ending: ally.ending === "refuse" ? "refuse" : "refuse",
        at: Date.now(),
      };
      rememberTitleEnding(migrated.ending);
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}

/** @deprecated Prefer loadTitleMemory — kept for migrate + smoke string surface. */
export function rememberTitleWave(ending?: EndingId) {
  if (ending) rememberTitleEnding(ending);
}

/** @deprecated Prefer loadTitleMemory */
export function loadTitleWave(): { waved: boolean; ending?: EndingId } {
  const mem = loadTitleMemory();
  if (mem?.ending === "escape") return { waved: true, ending: "escape" };
  return { waved: false, ending: mem?.ending };
}

/** @deprecated Prefer loadTitleMemory */
export function rememberTitleAlly(ending?: EndingId, _allied = false) {
  if (ending) rememberTitleEnding(ending);
}

/** @deprecated Prefer loadTitleMemory */
export function loadTitleAlly(): { ally: boolean; ending?: EndingId } {
  const mem = loadTitleMemory();
  if (mem?.ending === "refuse") return { ally: true, ending: "refuse" };
  return { ally: false, ending: mem?.ending };
}

function loadTitleWaveLegacy(): { waved: boolean; ending?: EndingId } {
  try {
    const raw = window.localStorage.getItem(TITLE_WAVE_KEY);
    if (!raw) return { waved: false };
    const parsed = JSON.parse(raw) as { waved?: boolean; ending?: EndingId };
    return { waved: !!parsed.waved, ending: parsed.ending };
  } catch {
    return { waved: false };
  }
}

function loadTitleAllyLegacy(): { ally: boolean; ending?: EndingId } {
  try {
    const raw = window.localStorage.getItem(TITLE_ALLY_KEY);
    if (!raw) return { ally: false };
    const parsed = JSON.parse(raw) as { ally?: boolean; ending?: EndingId };
    return { ally: !!parsed.ally, ending: parsed.ending };
  } catch {
    return { ally: false };
  }
}
