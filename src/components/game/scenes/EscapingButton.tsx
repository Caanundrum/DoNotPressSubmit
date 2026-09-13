"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

export function EscapingButton({ onComplete }: { onComplete: () => void }) {
  const [hits, setHits] = useState(0);
  const [pos, setPos] = useState({ x: 42, y: 48 });

  useEffect(() => {
    if (hits >= 3) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [hits, onComplete]);

  const flee = () => {
    audio.play("click", 0.35);
    setHits((h) => h + 1);
    setPos({
      x: 12 + Math.random() * 70,
      y: 28 + Math.random() * 45,
    });
  };

  return (
    <div className="relative h-[min(56vh,460px)] w-full overflow-hidden border border-danger/30 bg-black/35">
      <div className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.22em] text-danger/80">
        CONTAINMENT // HITS {hits}/3
      </div>
      <motion.div
        className="pointer-events-none absolute inset-x-8 top-10 h-px bg-cyan/30"
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
      <motion.button
        type="button"
        className="absolute border border-danger/70 bg-gradient-to-b from-[#4a1520] to-[#1a080c] px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-[#ffd0d8] shadow-[0_0_30px_rgba(255,77,109,0.35)]"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, fontFamily: "var(--font-display)" }}
        animate={{ x: [-2, 2, -1, 0], rotate: hits > 0 ? [-1, 1, 0] : 0 }}
        transition={{ duration: 0.35 }}
        onClick={flee}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
      >
        DO NOT ARCHIVE
      </motion.button>
      <div className="absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#b7c6d8]">
        Assistant: herding rails online. Click the runaway control.
      </div>
    </div>
  );
}
