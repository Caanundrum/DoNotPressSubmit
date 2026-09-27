"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

type Slot = { id: string; label: string; x: number; y: number };

/** Lane centers (% of craft box) — drifting answers stay in separate bands. */
const LANES: Record<string, number> = { a: 30, b: 48, c: 66 };
/** Keep pinned/drifting labels inside the answer box (account for ~220px chip width). */
const X_MIN = 4;
const X_MAX = 58;

function clampSlot(s: Slot): Slot {
  return {
    ...s,
    x: Math.min(X_MAX, Math.max(X_MIN, s.x)),
    y: Math.min(70, Math.max(26, s.y)),
  };
}

/** Act I kinetic gag: options drift slowly; hover pauses; pin three. */
export function RestlessOptions({ onComplete }: { onComplete: () => void }) {
  const [pins, setPins] = useState(0);
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([
    { id: "a", label: "I read the instructions", x: 10, y: LANES.a },
    { id: "b", label: "I skimmed them professionally", x: 28, y: LANES.b },
    { id: "c", label: "Instructions are a suggestion", x: 16, y: LANES.c },
  ]);

  useEffect(() => {
    if (pins < 3) return;
    const t = setTimeout(onComplete, 450);
    return () => clearTimeout(t);
  }, [pins, onComplete]);

  // Slow patterned drift for unpinned options — pauses while hovered.
  // Each id stays in its lane so answers never fully stack on top of each other.
  useEffect(() => {
    if (pins >= 3) return;
    const t = window.setInterval(() => {
      setSlots((prev) =>
        prev.map((s, i) => {
          if (pinned[s.id] || hoverId === s.id) return clampSlot(s);
          const phase = (Date.now() / 1400 + i) % (Math.PI * 2);
          const lane = LANES[s.id] ?? s.y;
          return clampSlot({
            ...s,
            x: s.x + Math.sin(phase) * 1.1,
            y: lane + Math.cos(phase * 0.8) * 2.2,
          });
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
          // Park pinned chips on the left of the craft box — never overrun the right edge.
          const order = Object.keys(pinned).length;
          return clampSlot({
            ...s,
            x: X_MIN + order * 2,
            y: LANES[s.id] ?? s.y,
          });
        }
        if (pinned[s.id]) return clampSlot(s);
        return clampSlot({
          ...s,
          x: X_MIN + ((s.x + 17) % (X_MAX - X_MIN)),
          y: LANES[s.id] ?? s.y,
        });
      }),
    );
  };

  return (
    <div className="relative h-[min(42vh,300px)] w-full overflow-hidden border border-cyan/25 bg-black/40">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] text-cyan">
        CALIBRATION DRIFT // PINNED {pins}/3
      </div>
      {slots.map((s, i) => {
        const isPinned = !!pinned[s.id];
        return (
          <motion.button
            key={s.id}
            type="button"
            className="absolute max-w-[min(42%,220px)] border px-3 py-2.5 text-left font-mono text-[11px] tracking-[0.14em] text-[#e2ebf6]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontFamily: "var(--font-display)",
              padding: "12px 14px",
              borderColor: isPinned ? "rgba(110,231,255,0.7)" : "rgba(200,220,240,0.28)",
              background: isPinned
                ? "rgba(40,90,120,0.45)"
                : "rgba(12,20,32,0.92)",
              zIndex: isPinned ? 2 : 1,
            }}
            animate={{
              x: isPinned || hoverId === s.id ? 0 : [0, i % 2 ? 4 : -4, 0],
              y: isPinned || hoverId === s.id ? 0 : [0, -2, 1.5, 0],
              scale: hoverId === s.id ? 1.03 : 1,
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
