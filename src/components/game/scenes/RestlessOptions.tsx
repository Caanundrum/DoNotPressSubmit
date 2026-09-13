"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

/** Act I kinetic gag: options jitter; player must pin three before they settle. */
export function RestlessOptions({ onComplete }: { onComplete: () => void }) {
  const [pins, setPins] = useState(0);
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

  const pin = (id: string) => {
    if (pins >= 3) return;
    audio.play("click", 0.4);
    setPins((p) => p + 1);
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id
          ? s
          : {
              ...s,
              x: 10 + Math.random() * 70,
              y: 28 + Math.random() * 50,
            },
      ),
    );
  };

  return (
    <div className="relative h-[min(52vh,420px)] w-full overflow-hidden border border-cyan/25 bg-black/40">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] text-cyan/80">
        CALIBRATION DRIFT // PINNED {pins}/3
      </div>
      {slots.map((s, i) => (
        <motion.button
          key={s.id}
          type="button"
          className="absolute border border-white/20 bg-[#0c1420]/92 px-4 py-3 text-left font-mono text-[11px] tracking-[0.14em] text-[#d7e6f5]"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontFamily: "var(--font-display)" }}
          animate={{
            x: pins >= 3 ? 0 : [0, i % 2 ? 8 : -8, 0],
            y: pins >= 3 ? 0 : [0, -4, 3, 0],
          }}
          transition={{ duration: 1.1 + i * 0.15, repeat: Infinity }}
          onClick={() => pin(s.id)}
          whileHover={{ scale: 1.03 }}
        >
          {s.label}
        </motion.button>
      ))}
      <div className="absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#b7c6d8]">
        Click each drifting answer until the form admits it has a preference.
      </div>
    </div>
  );
}
