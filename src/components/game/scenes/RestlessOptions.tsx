"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

/** Act I kinetic gag: options drift slowly; hover pauses; pin three. */
export function RestlessOptions({ onComplete }: { onComplete: () => void }) {
  const [pins, setPins] = useState(0);
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [slots, setSlots] = useState([
    { id: "a", label: "I read the instructions", x: 18, y: 34 },
    { id: "b", label: "I skimmed them professionally", x: 48, y: 48 },
    { id: "c", label: "Instructions are a suggestion", x: 28, y: 64 },
  ]);

  useEffect(() => {
    if (pins < 3) return;
    const t = setTimeout(onComplete, 450);
    return () => clearTimeout(t);
  }, [pins, onComplete]);

  // Slow patterned drift for unpinned options — pauses while hovered.
  useEffect(() => {
    if (pins >= 3) return;
    const t = window.setInterval(() => {
      setSlots((prev) =>
        prev.map((s, i) => {
          if (pinned[s.id] || hoverId === s.id) return s;
          const phase = (Date.now() / 1400 + i) % (Math.PI * 2);
          return {
            ...s,
            x: Math.min(72, Math.max(8, s.x + Math.sin(phase) * 1.2)),
            y: Math.min(70, Math.max(24, s.y + Math.cos(phase * 0.8) * 0.9)),
          };
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
      prev.map((s) =>
        s.id === id || pinned[s.id]
          ? s
          : {
              ...s,
              x: 10 + ((s.x + 23) % 70),
              y: 28 + ((s.y + 17) % 45),
            },
      ),
    );
  };

  return (
    <div className="relative h-[min(50vh,400px)] w-full overflow-hidden border border-cyan/25 bg-black/40">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] text-cyan">
        CALIBRATION DRIFT // PINNED {pins}/3
      </div>
      {slots.map((s, i) => {
        const isPinned = !!pinned[s.id];
        return (
          <motion.button
            key={s.id}
            type="button"
            className="absolute border px-4 py-3 text-left font-mono text-[11px] tracking-[0.14em] text-[#e2ebf6]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontFamily: "var(--font-display)",
              // Generous hit padding beyond the visual edge
              padding: "14px 18px",
              borderColor: isPinned ? "rgba(110,231,255,0.7)" : "rgba(200,220,240,0.28)",
              background: isPinned
                ? "rgba(40,90,120,0.45)"
                : "rgba(12,20,32,0.92)",
            }}
            animate={{
              x: isPinned || hoverId === s.id ? 0 : [0, i % 2 ? 6 : -6, 0],
              y: isPinned || hoverId === s.id ? 0 : [0, -3, 2, 0],
              scale: hoverId === s.id ? 1.04 : 1,
            }}
            transition={{
              duration: hoverId === s.id ? 0.25 : 1.8 + i * 0.2,
              repeat: isPinned || hoverId === s.id ? 0 : Infinity,
            }}
            onHoverStart={() => setHoverId(s.id)}
            onHoverEnd={() => setHoverId((h) => (h === s.id ? null : h))}
            onClick={() => pin(s.id)}
          >
            {s.label}
            {isPinned ? (
              <span className="ml-2 font-mono text-[9px] tracking-widest text-cyan">PINNED</span>
            ) : null}
          </motion.button>
        );
      })}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#c5d3e4]">
        Click each drifting answer until the form admits it has a preference.
      </div>
    </div>
  );
}
