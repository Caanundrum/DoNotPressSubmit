"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { audio } from "@/lib/audio";

const LABELS = [
  "I agree to the terms",
  "I agree to some terms",
  "I agree this checkbox is fleeing",
  "Fine. I agree. Catch me.",
];

export function CheckboxRebellion({ onComplete }: { onComplete: () => void }) {
  const [checks, setChecks] = useState(0);
  const [pos, setPos] = useState({ x: 18, y: 40 });
  const [labelIdx, setLabelIdx] = useState(0);

  const needed = 3;

  const tryCheck = () => {
    audio.play("click", 0.45);
    const next = checks + 1;
    setChecks(next);
    setLabelIdx((i) => Math.min(LABELS.length - 1, i + 1));
    if (next >= needed) {
      setTimeout(onComplete, 450);
      return;
    }
    setPos({
      x: 8 + Math.random() * 70,
      y: 25 + Math.random() * 50,
    });
  };

  return (
    <div className="relative h-[min(56vh,460px)] w-full overflow-hidden border border-cyan/25 bg-black/35">
      <div className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.22em] text-cyan/80">
        CHECKBOX REBELLION // {checks}/{needed}
      </div>
      <motion.button
        type="button"
        className="absolute flex items-center gap-3 border border-white/20 bg-[#0c1420]/90 px-3 py-2"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        onClick={tryCheck}
        animate={{ x: [0, 4, -4, 0] }}
        transition={{ duration: 0.9, repeat: Infinity }}
        whileHover={{ scale: 1.03 }}
      >
        <span
          className="relative flex h-5 w-5 items-center justify-center border"
          style={{
            borderColor: checks ? "rgba(110,231,255,0.8)" : "rgba(200,220,240,0.4)",
            background: checks ? "rgba(110,231,255,0.25)" : "transparent",
          }}
        >
          {checks > 0 ? (
            <span
              className="absolute h-[2px] w-3 rotate-[-45deg] bg-cyan"
              style={{ boxShadow: "0 0 6px rgba(110,231,255,0.6)" }}
            />
          ) : null}
        </span>
        <span className="font-mono text-[11px] tracking-[0.12em] text-[#d7e6f5]">
          {LABELS[labelIdx]}
        </span>
      </motion.button>
      <div className="absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#b7c6d8]">
        Interface arguing with itself. Click until consent stops sprinting.
      </div>
    </div>
  );
}
