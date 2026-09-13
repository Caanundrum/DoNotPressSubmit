"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { FairChaseTarget } from "../FairChaseTarget";

/** Act II gag: System authority stamp skitters; player stamps it down thrice. */
export function AuthorityStamp({ onComplete }: { onComplete: () => void }) {
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (hits < 3) return;
    const t = setTimeout(onComplete, 500);
    return () => clearTimeout(t);
  }, [hits, onComplete]);

  return (
    <div className="relative h-[min(46vh,360px)] w-full overflow-hidden border border-system-warn/40 bg-black/45">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] text-system-warn">
        AUTHORITY STAMP // IMPRESSIONS {hits}/3
      </div>
      <motion.div
        className="pointer-events-none absolute inset-8 border border-dashed border-white/15"
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <FairChaseTarget
        hits={hits}
        maxHits={3}
        moveMs={1000}
        hitPad={20}
        className="absolute flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/80 bg-black/80 font-mono text-[10px] tracking-[0.18em] text-white shadow-[0_0_28px_rgba(255,176,32,0.35)]"
        style={{ fontFamily: "var(--font-display)" }}
        onHit={() => {
          audio.play("system", 0.45);
          setHits((h) => h + 1);
        }}
      >
        <span style={{ transform: `rotate(${hits * 25}deg)` }}>APPROVED</span>
      </FairChaseTarget>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#c5d3e4]">
        Catch the rubber stamp before it certifies nonsense.
      </div>
    </div>
  );
}
