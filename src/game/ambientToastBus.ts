/**
 * Single ambient click-memo bus — replace, never stack.
 * BackgroundGags / AmbientChrome / FacilityBackground / roamers all share one toast.
 */
type Listener = (line: string | null) => void;

let current: string | null = null;
let clearTimer: number | null = null;
const listeners = new Set<Listener>();

export function showAmbientToast(line: string, ms = 2400) {
  current = line;
  if (typeof window !== "undefined") {
    if (clearTimer != null) window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(() => {
      current = null;
      clearTimer = null;
      listeners.forEach((l) => l(null));
    }, ms);
  }
  listeners.forEach((l) => l(current));
}

export function subscribeAmbientToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
