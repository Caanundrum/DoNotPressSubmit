"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

type Slot = { id: string; label: string; x: number; row: number };

/**
 * Keep chips inside the craft box.
 * Width budget leaves room for full 2-line wrap (never ellipsis).
 * Rows are spaced so a wrapped + PINNED chip never overlaps the next lane.
 */
const X_MIN = 4;
/** Keep chips inside the craft box at ~390px width (chip + left% must clear the right edge). */
const X_MAX = 26;
/**
 * Vertical lane tops (%) inside the craft box (footer is outside the drift area).
 * Gaps must fit a 2-line wrap + PINNED badge with clear air — esp. mobile ~390px.
 * Row 3 stays clear of the hint footer (rev17 P1 — no clip at 3/3).
 */
const ROWS = [2, 30, 58];
/** Pin parking X per row — staggered so pinned chips never share a vertical stack. */
const PIN_X = [4, 20, 10];

/**
 * Wobble before an intentional pin release so it doesn't feel like a lost click.
 * Hold long enough to READ the HOLDING telegraph (rev17 P1 — not a silent 1–2s drop).
 */
const STRAIN_WARN_MS = 2000;
const STRAIN_AFTER_PIN_MS = 2800;

function clampX(x: number) {
  return Math.min(X_MAX, Math.max(X_MIN, x));
}

/** Act I kinetic gag: options drift slowly; hover pauses; pin three. */
export function RestlessOptions({ onComplete }: { onComplete: () => void }) {
  const [pins, setPins] = useState(0);
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [strainingId, setStrainingId] = useState<string | null>(null);
  /** Bumps when strain starts so Framer restarts the chip keyframe (not just a border tint). */
  const [strainTick, setStrainTick] = useState(0);
  const didStrain = useRef(false);
  /** Once 3/3 is reached, pins are frozen forever — never regress to 2/3 (rev17 P0). */
  const lockedRef = useRef(false);
  const pinsRef = useRef(0);
  const strainWarnRef = useRef<number | null>(null);
  const strainReleaseRef = useRef<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([
    { id: "a", label: "I read the instructions", x: 8, row: 0 },
    { id: "b", label: "I skimmed them professionally", x: 26, row: 1 },
    { id: "c", label: "Instructions are a suggestion", x: 14, row: 2 },
  ]);

  const clearStrainTimers = () => {
    if (strainWarnRef.current != null) {
      window.clearTimeout(strainWarnRef.current);
      strainWarnRef.current = null;
    }
    if (strainReleaseRef.current != null) {
      window.clearTimeout(strainReleaseRef.current);
      strainReleaseRef.current = null;
    }
  };

  const lockCompletion = () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    setStrainingId(null);
    clearStrainTimers();
  };

  useEffect(() => {
    pinsRef.current = pins;
  }, [pins]);

  useEffect(() => {
    if (pins < 3) return;
    lockCompletion();
    const t = setTimeout(onComplete, 320);
    return () => clearTimeout(t);
    // lockCompletion is stable enough — only re-fire when pins hits 3
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, onComplete]);

  // Horizontal-only drift in fixed rows — never stack on top of each other.
  useEffect(() => {
    if (lockedRef.current || pins >= 3) return;
    const t = window.setInterval(() => {
      if (lockedRef.current) return;
      setSlots((prev) =>
        prev.map((s, i) => {
          if (pinned[s.id] || hoverId === s.id || strainingId === s.id) {
            return { ...s, x: clampX(s.x) };
          }
          const phase = (Date.now() / 1400 + i) % (Math.PI * 2);
          return { ...s, x: clampX(s.x + Math.sin(phase) * 0.85) };
        }),
      );
    }, 180);
    return () => window.clearInterval(t);
  }, [pins, pinned, hoverId, strainingId]);

  // One intentional pin-yank: wobble the answer chip itself first, then release.
  useEffect(() => {
    if (lockedRef.current || didStrain.current || pins !== 1) return;
    const pinnedIds = Object.keys(pinned).filter((id) => pinned[id]);
    if (pinnedIds.length !== 1) return;
    const target = pinnedIds[0];
    clearStrainTimers();
    strainWarnRef.current = window.setTimeout(() => {
      if (lockedRef.current || pinsRef.current >= 3) return;
      setStrainingId(target);
      setStrainTick((n) => n + 1);
      audio.play("hover", 0.2);
    }, STRAIN_AFTER_PIN_MS);
    strainReleaseRef.current = window.setTimeout(() => {
      // Fail closed: never unpin after a 3/3 lock (stale timer must not cheat).
      if (lockedRef.current || pinsRef.current >= 3) {
        setStrainingId(null);
        return;
      }
      setStrainingId(null);
      setPinned((p) => {
        const next = { ...p };
        delete next[target];
        return next;
      });
      setPins((p) => {
        if (lockedRef.current || p >= 3) return p;
        const next = Math.max(0, p - 1);
        pinsRef.current = next;
        return next;
      });
      didStrain.current = true;
      audio.play("click", 0.25);
    }, STRAIN_AFTER_PIN_MS + STRAIN_WARN_MS);
    return () => {
      clearStrainTimers();
    };
  }, [pins, pinned]);

  const pin = (id: string) => {
    if (lockedRef.current || pinsRef.current >= 3 || pinned[id] || strainingId === id) return;
    audio.play("click", 0.4);
    const nextPins = pinsRef.current + 1;
    pinsRef.current = nextPins;
    setPinned((p) => ({ ...p, [id]: true }));
    setPins(nextPins);
    if (nextPins >= 3) {
      lockCompletion();
    }
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, x: clampX(PIN_X[s.row] ?? X_MIN) };
        }
        if (pinned[s.id]) return { ...s, x: clampX(PIN_X[s.row] ?? s.x) };
        return { ...s, x: clampX(X_MIN + 18 + ((s.x + 11) % (X_MAX - X_MIN - 18))) };
      }),
    );
  };

  return (
    <div
      className="relative flex h-[min(52vh,400px)] w-full flex-col bg-black/40 max-sm:h-[min(50vh,380px)]"
      style={{
        // Explicit 1px rim — cyan/25 alone read as missing on phone screenshots.
        border: "1px solid rgba(110,231,255,0.42)",
        boxSizing: "border-box",
      }}
      data-restless-options="true"
      data-restless-pin-lanes="true"
      data-restless-arena-border="true"
      data-restless-strain-ms={STRAIN_WARN_MS}
      data-restless-strain-after-ms={STRAIN_AFTER_PIN_MS}
      data-restless-locked={locked ? "true" : "false"}
    >
      <div
        className="shrink-0 px-4 pt-2 font-mono text-[12px] tracking-[0.22em] text-cyan"
        data-restless-pin-count={pins}
      >
        Pinned {pins}/3
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-hidden pb-3"
        data-restless-arena="true"
      >
        {slots.map((s, i) => {
          const isPinned = !!pinned[s.id];
          const isStraining = strainingId === s.id;
          const top = ROWS[s.row] ?? ROWS[i] ?? 50;
          return (
            <motion.button
              key={isStraining ? `${s.id}-strain-${strainTick}` : s.id}
              type="button"
              className="absolute w-[min(68%,260px)] border px-3 py-2 text-left font-mono text-[12px] leading-snug tracking-[0.12em] text-[#e2ebf6] max-sm:w-[min(58%,200px)] max-sm:py-1.5"
              style={{
                left: `${s.x}%`,
                top: `${top}%`,
                fontFamily: "var(--font-display)",
                padding: "10px 12px",
                borderColor: isStraining
                  ? "rgba(255,120,90,0.95)"
                  : isPinned
                    ? "rgba(110,231,255,0.7)"
                    : "rgba(200,220,240,0.28)",
                background: isStraining
                  ? "rgba(110,40,24,0.72)"
                  : isPinned
                    ? "rgba(40,90,120,0.45)"
                    : "rgba(12,20,32,0.92)",
                boxShadow: isStraining
                  ? "0 0 0 1px rgba(255,140,100,0.55), 0 0 18px rgba(255,90,60,0.35)"
                  : undefined,
                zIndex: isPinned || isStraining ? 2 + s.row : 1,
              }}
              data-restless-chip={s.id}
              data-restless-pinned={isPinned ? "true" : "false"}
              data-restless-straining={isStraining ? "true" : "false"}
              data-restless-chip-wobble={isStraining ? "true" : "false"}
              data-restless-row={s.row}
              animate={
                isStraining
                  ? {
                      // Loud chip wobble — readable on 390px and desktop (rev17 P1).
                      x: [0, -10, 10, -8, 8, -6, 6, -3, 3, 0],
                      rotate: [0, -5, 5, -4.5, 4.5, -3, 3, -1.5, 1.5, 0],
                      scale: [1, 1.08, 0.95, 1.07, 0.96, 1.05, 0.98, 1.03, 1],
                    }
                  : {
                      // Pinned cards settle hard — no x-drift / jitter after pin (P1).
                      x: isPinned || hoverId === s.id ? 0 : [0, i % 2 ? 2 : -2, 0],
                      rotate: 0,
                      scale: hoverId === s.id && !isPinned ? 1.02 : 1,
                    }
              }
              transition={
                isStraining
                  ? { duration: STRAIN_WARN_MS / 1000, ease: "easeInOut" }
                  : {
                      duration: isPinned ? 0.2 : hoverId === s.id ? 0.25 : 2.2 + i * 0.2,
                      repeat: isPinned || hoverId === s.id ? 0 : Infinity,
                    }
              }
              onHoverStart={() => setHoverId(s.id)}
              onHoverEnd={() => setHoverId((h) => (h === s.id ? null : h))}
              onPointerDown={() => setHoverId(s.id)}
              onClick={() => pin(s.id)}
            >
              <span className="block whitespace-normal break-words">{s.label}</span>
              {isStraining ? (
                <span
                  className="mt-0.5 block font-mono text-[10px] tracking-widest text-[#ffb090] max-sm:text-[10px]"
                  data-restless-strain-label="true"
                >
                  HOLDING…
                </span>
              ) : isPinned ? (
                <span className="mt-0.5 block font-mono text-[10px] tracking-widest text-cyan max-sm:text-[10px]">
                  PINNED
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
      <div
        className="pointer-events-none shrink-0 border-t border-white/10 bg-black/70 px-4 pb-3 pt-2.5 font-mono text-[12px] leading-snug tracking-[0.12em] text-[#c5d3e4]"
        data-restless-hint="true"
        data-restless-hint-pad="16"
      >
        Catch each answer to pin it.
      </div>
    </div>
  );
}
