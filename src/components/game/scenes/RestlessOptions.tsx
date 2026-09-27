"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

type Slot = { id: string; label: string; x: number; row: number };

/** Keep chips inside the craft box (account for ~42%/220px chip width). */
const X_MIN = 4;
const X_MAX = 50;
/** Fixed vertical rows (%) — answers never share a band, so they can't fully hide each other. */
const ROWS = [28, 52, 76];

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
          const order = Object.keys(pinned).length;
          return { ...s, x: clampX(X_MIN + order * 2) };
        }
        if (pinned[s.id]) return { ...s, x: clampX(s.x) };
        return { ...s, x: clampX(X_MIN + ((s.x + 17) % (X_MAX - X_MIN))) };
      }),
    );
  };

  return (
    <div className="relative h-[min(36vh,280px)] w-full overflow-hidden border border-cyan/25 bg-black/40">
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
            className="absolute max-w-[min(42%,220px)] border px-3 py-2 text-left font-mono text-[11px] tracking-[0.14em] text-[#e2ebf6]"
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
            <span className="block truncate">{s.label}</span>
            {isPinned ? (
              <span className="mt-0.5 block font-mono text-[9px] tracking-widest text-cyan">
                PINNED
              </span>
            ) : null}
          </motion.button>
        );
      })}
      <div className="pointer-events-none absolute bottom-2 left-3 right-3 z-[3] font-mono text-[10px] tracking-[0.16em] text-[#c5d3e4]">
        Click each drifting answer until the form admits it has a preference.
      </div>
    </div>
  );
}
