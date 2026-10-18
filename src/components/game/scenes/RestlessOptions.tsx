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
/** Keep chips inside the craft box at ~390px width (chip + left% must clear the right edge). */
const X_MAX = 26;
/**
 * Vertical lane tops (%) inside the craft box (footer is outside the drift area).
 * Gaps must fit a 2-line wrap + PINNED badge with clear air — esp. mobile ~390px.
 */
const ROWS = [4, 38, 72];
/** Pin parking X per row — staggered so pinned chips never share a vertical stack. */
const PIN_X = [4, 20, 10];

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
          return { ...s, x: clampX(PIN_X[s.row] ?? X_MIN) };
        }
        if (pinned[s.id]) return { ...s, x: clampX(PIN_X[s.row] ?? s.x) };
        return { ...s, x: clampX(X_MIN + 18 + ((s.x + 11) % (X_MAX - X_MIN - 18))) };
      }),
    );
  };

  return (
    <div
      className="relative flex h-[min(48vh,380px)] w-full flex-col border border-cyan/25 bg-black/40 max-sm:h-[min(50vh,380px)]"
      data-restless-options="true"
      data-restless-pin-lanes="true"
      data-restless-arena-border="true"
    >
      <div className="shrink-0 px-3 pt-2 font-mono text-[12px] tracking-[0.22em] text-cyan">
        Pinned {pins}/3
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden pb-1">
        {slots.map((s, i) => {
          const isPinned = !!pinned[s.id];
          const top = ROWS[s.row] ?? ROWS[i] ?? 50;
          return (
            <motion.button
              key={s.id}
              type="button"
              className="absolute w-[min(68%,260px)] border px-3 py-2 text-left font-mono text-[12px] leading-snug tracking-[0.12em] text-[#e2ebf6] max-sm:w-[min(58%,200px)] max-sm:py-1.5"
              style={{
                left: `${s.x}%`,
                top: `${top}%`,
                fontFamily: "var(--font-display)",
                padding: "10px 12px",
                borderColor: isPinned ? "rgba(110,231,255,0.7)" : "rgba(200,220,240,0.28)",
                background: isPinned
                  ? "rgba(40,90,120,0.45)"
                  : "rgba(12,20,32,0.92)",
                zIndex: isPinned ? 2 + s.row : 1,
              }}
              data-restless-chip={s.id}
              data-restless-pinned={isPinned ? "true" : "false"}
              data-restless-row={s.row}
              animate={{
                // Pinned cards settle hard — no x-drift / jitter after pin (P1).
                x: isPinned || hoverId === s.id ? 0 : [0, i % 2 ? 2 : -2, 0],
                scale: hoverId === s.id && !isPinned ? 1.02 : 1,
              }}
              transition={{
                duration: isPinned ? 0.2 : hoverId === s.id ? 0.25 : 2.2 + i * 0.2,
                repeat: isPinned || hoverId === s.id ? 0 : Infinity,
              }}
              onHoverStart={() => setHoverId(s.id)}
              onHoverEnd={() => setHoverId((h) => (h === s.id ? null : h))}
              onPointerDown={() => setHoverId(s.id)}
              onClick={() => pin(s.id)}
            >
              <span className="block whitespace-normal break-words">{s.label}</span>
              {isPinned ? (
                <span className="mt-0.5 block font-mono text-[10px] tracking-widest text-cyan max-sm:text-[10px]">
                  PINNED
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
      <div
        className="pointer-events-none shrink-0 border-t border-white/5 bg-black/70 px-3 pb-3 pt-3 font-mono text-[12px] leading-snug tracking-[0.12em] text-[#c5d3e4] max-sm:pb-3.5 max-sm:pt-3"
        data-restless-hint="true"
        data-restless-hint-pad="12"
      >
        Catch each answer to pin it.
      </div>
    </div>
  );
}
