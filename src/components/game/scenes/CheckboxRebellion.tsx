"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";
import { FairChaseTarget } from "../FairChaseTarget";

const LABELS = [
  "I agree to the terms",
  "I agree to some terms",
  "I agree this checkbox is fleeing",
  "Fine. I agree. Catch me.",
];

export function CheckboxRebellion({ onComplete }: { onComplete: () => void }) {
  const [checks, setChecks] = useState(0);
  const [labelIdx, setLabelIdx] = useState(0);
  const needed = 3;

  return (
    <div className="relative h-[min(48vh,380px)] w-full overflow-hidden border border-cyan/25 bg-black/35">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] text-cyan">
        CHECKBOX REBELLION // {checks}/{needed}
      </div>
      <FairChaseTarget
        hits={checks}
        maxHits={needed}
        moveMs={1200}
        hitPad={16}
        className="absolute flex items-center gap-3 border border-white/25 bg-[#0c1420]/92 px-3 py-2"
        onHit={() => {
          audio.play("click", 0.45);
          const next = checks + 1;
          setChecks(next);
          setLabelIdx((i) => Math.min(LABELS.length - 1, i + 1));
          if (next >= needed) {
            setTimeout(onComplete, 450);
          }
        }}
      >
        <span
          className="relative flex h-5 w-5 shrink-0 items-center justify-center border"
          style={{
            borderColor: checks ? "rgba(110,231,255,0.8)" : "rgba(200,220,240,0.55)",
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
        <span className="font-mono text-[11px] tracking-[0.12em] text-[#e2ebf6]">
          {LABELS[labelIdx]}
        </span>
      </FairChaseTarget>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[10px] tracking-[0.16em] text-[#c5d3e4]">
        Interface arguing with itself. Click until consent stops sprinting.
      </div>
    </div>
  );
}
