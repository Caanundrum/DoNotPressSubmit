"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { FairChaseTarget } from "../FairChaseTarget";

export function EscapingButton({ onComplete }: { onComplete: () => void }) {
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (hits >= 3) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [hits, onComplete]);

  return (
    <div className="relative h-[min(48vh,380px)] w-full overflow-hidden border border-danger/30 bg-black/35">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] text-[#ff9aab]">
        CONTAINMENT // HITS {hits}/3
      </div>
      <motion.div
        className="pointer-events-none absolute inset-x-8 top-10 h-px bg-cyan/30"
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
      <FairChaseTarget
        hits={hits}
        maxHits={3}
        moveMs={1100}
        hitPad={18}
        className="absolute border border-danger/70 bg-gradient-to-b from-[#4a1520] to-[#1a080c] px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-[#ffd0d8] shadow-[0_0_30px_rgba(255,77,109,0.35)]"
        style={{ fontFamily: "var(--font-display)" }}
        onHit={() => {
          audio.play("click", 0.35);
          setHits((h) => h + 1);
        }}
      >
        DO NOT ARCHIVE
      </FairChaseTarget>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#c5d3e4]">
        Assistant: herding rails online. Click the runaway control.
      </div>
    </div>
  );
}
