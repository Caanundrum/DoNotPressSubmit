"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

type Slot = { id: string; label: string; x: number; row: number };

/**
 * Keep chips inside the craft box.
 * Width budget leaves room for full 2-line wrap (never ellipsis).
 * Rows are spaced so a wrapped + PINNED chip never overlaps the next lane.
 */
const X_MIN = 4;
const X_MAX = 48;
/** Vertical lane tops (%) — ≥22pt gaps so wrap + PINNED badge never collide. */
const ROWS = [16, 42, 68];
/** Pin parking X per row — staggered so pinned chips never share a stack. */
const PIN_X = [6, 10, 14];

function clampX(x: number) {
  return Math.min(X_MAX, Math.max(X_MIN, x));
}

/** Act I kinetic gag: options drift slowly; hover pauses; pin three. */
export function RestlessOptions({ onComplete }: { onComplete: () => void }) {
  const [pins, setPins] = useState(0);
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([
    { id: "a", label: "I read the instructions", x: 8, row: 0 },
    { id: "b", label: "I skimmed them professionally", x: 26, row: 1 },
    { id: "c", label: "Instructions are a suggestion", x: 14, row: 2 },
  ]);

  useEffect(() => {
    if (pins < 3) return;
    const t = setTimeout(onComplete, 450);
    return () => clearTimeout(t);
  }, [pins, onComplete]);

  // Horizontal-only drift in fixed rows — never stack on top of each other.
  useEffect(() => {
    if (pins >= 3) return;
    const t = window.setInterval(() => {
      setSlots((prev) =>
        prev.map((s, i) => {
          if (pinned[s.id] || hoverId === s.id) return { ...s, x: clampX(s.x) };
          const phase = (Date.now() / 1400 + i) % (Math.PI * 2);
          return { ...s, x: clampX(s.x + Math.sin(phase) * 0.85) };
        }),
      );
    }, 180);
    return () => window.clearInterval(t);
  }, [pins, pinned, hoverId]);

  const pin = (id: string) => {
    if (pins >= 3 || pinned[id]) return;
    audio.play("click", 0.4);
    setPinned((p) => ({ ...p, [id]: true }));
    setPins((p) => p + 1);
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          // Park in this chip's own row lane — never share X with another pinned row.
          return { ...s, x: clampX(PIN_X[s.row] ?? X_MIN) };
        }
        if (pinned[s.id]) return { ...s, x: clampX(PIN_X[s.row] ?? s.x) };
        // Nudge unpinned siblings so they don't sit under the new pin.
        return { ...s, x: clampX(X_MIN + 18 + ((s.x + 11) % (X_MAX - X_MIN - 18))) };
      }),
    );
  };

  return (
    <div
      className="relative h-[min(42vh,320px)] w-full overflow-hidden border border-cyan/25 bg-black/40"
      data-restless-options="true"
    >
      <div className="absolute left-3 top-2 z-10 font-mono text-[10px] tracking-[0.22em] text-cyan">
        CALIBRATION DRIFT // PINNED {pins}/3
      </div>
      {slots.map((s, i) => {
        const isPinned = !!pinned[s.id];
        const top = ROWS[s.row] ?? ROWS[i] ?? 50;
        return (
          <motion.button
            key={s.id}
            type="button"
            className="absolute w-[min(52%,280px)] border px-3 py-2 text-left font-mono text-[11px] leading-snug tracking-[0.12em] text-[#e2ebf6]"
            style={{
              left: `${s.x}%`,
              top: `${top}%`,
              fontFamily: "var(--font-display)",
              padding: "10px 12px",
              borderColor: isPinned ? "rgba(110,231,255,0.7)" : "rgba(200,220,240,0.28)",
              background: isPinned
                ? "rgba(40,90,120,0.45)"
                : "rgba(12,20,32,0.92)",
              zIndex: isPinned ? 2 : 1,
            }}
            data-restless-chip={s.id}
            data-restless-pinned={isPinned ? "true" : "false"}
            animate={{
              x: isPinned || hoverId === s.id ? 0 : [0, i % 2 ? 3 : -3, 0],
              scale: hoverId === s.id ? 1.02 : 1,
            }}
            transition={{
              duration: hoverId === s.id ? 0.25 : 1.8 + i * 0.2,
              repeat: isPinned || hoverId === s.id ? 0 : Infinity,
            }}
            onHoverStart={() => setHoverId(s.id)}
            onHoverEnd={() => setHoverId((h) => (h === s.id ? null : h))}
            onClick={() => pin(s.id)}
          >
            {/* Full label — wrap, never ellipsize (P0 #11). */}
            <span className="block whitespace-normal break-words">{s.label}</span>
            {isPinned ? (
              <span className="mt-0.5 block font-mono text-[9px] tracking-widest text-cyan">
                PINNED
              </span>
            ) : null}
          </motion.button>
        );
      })}
      <div className="pointer-events-none absolute bottom-2 left-3 right-3 z-[3] border-t border-white/5 bg-black/55 px-0 pt-1.5 font-mono text-[10px] tracking-[0.16em] text-[#c5d3e4]">
        Click each drifting answer until the form admits it has a preference.
      </div>
    </div>
  );
}
