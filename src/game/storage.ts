import { createInitialState } from "./state";
import type { GameState } from "./types";
import { SAVE_KEY } from "./types";

export function loadSave(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.sceneId || !parsed?.sessionId) return null;
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
