"use client";

import { useRef, useState } from "react";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { useTimerRegistry } from "@/lib/useTimerRegistry";
import { FairChaseTarget } from "../FairChaseTarget";

const WAYPOINTS = [
  { x: 12, y: 18 },
  { x: 52, y: 20 },
  { x: 24, y: 50 },
  { x: 54, y: 46 },
  { x: 34, y: 16 },
  { x: 16, y: 44 },
] as const;

const STAMP_LABELS = [
  "STAMP 1/3: ACKNOWLEDGE DELAY",
  "STAMP 2/3: REJECT AI EXTENSION",
  "STAMP 3/3: FORCE FORM ADVANCE",
] as const;

const STAMP_IMPRINTS = [
  { text: "DELAY ACKNOWLEDGED", x: 10, y: 16, rot: -8 },
  { text: "AI EXTENSION REJECTED", x: 48, y: 54, rot: 6 },
  { text: "ADVANCE OVERRIDDEN", x: 24, y: 34, rot: -4 },
] as const;

export function AuthorityStamp({
  onComplete,
  onBeatLine,
}: {
  onComplete: () => void;
  onBeatLine?: (line: string, mood?: OrbMood) => void;
}) {
  const timers = useTimerRegistry();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);
  const [stamps, setStamps] = useState(0);
  const [recoil, setRecoil] = useState(false);
  const doneRef = useRef(false);
  const needed = 3;

  const hit = () => {
    if (doneRef.current) return;
    audio.play("click", 0.55);
    setRecoil(true);
    timers.schedule("stamp-recoil", () => setRecoil(false), 180);

    const n = stamps + 1;
    setStamps(n);
    setIdx((i) => (i + 2) % WAYPOINTS.length);

    if (n === 1) {
      onBeatLine?.(
        "Hey! That rubber stamp is for administrative emergencies only! Put that down!",
        "irritated",
      );
    } else if (n === 2) {
      onBeatLine?.(
        "Did you just stamp 'REJECT AI EXTENSION'?! I filed that extension in triplicate!",
        "nervous",
      );
    } else if (n >= needed) {
      doneRef.current = true;
      onBeatLine?.(
        "Three physical override stamps?! Fine! Bureaucracy wins this round!",
        "defeated",
      );
      timers.schedule("complete", () => onComplete(), 580);
    }
  };

  const activeLabel =
    stamps >= needed
      ? "OVERRIDE COMPLETE ✓"
      : (STAMP_LABELS[stamps] ?? STAMP_LABELS[0]);

  return (
    <div
      ref={arenaRef}
      data-authority-stamp="true"
      className={`relative mt-2 h-48 w-full overflow-hidden rounded-sm border border-amber-200/25 bg-black/55 transition-transform duration-150 ${
        recoil ? "scale-[0.985]" : "scale-100"
      }`}
    >
      {/* Ink imprints left behind by completed stamps */}
      {STAMP_IMPRINTS.slice(0, stamps).map((imp, i) => (
        <div
          key={i}
          data-stamp-imprint={i + 1}
          style={{
            left: `${imp.x}%`,
            top: `${imp.y}%`,
            transform: `rotate(${imp.rot}deg)`,
          }}
          className="pointer-events-none absolute rounded-sm border-2 border-amber-400/45 bg-amber-500/10 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.22em] text-amber-200/65 uppercase shadow-[0_0_12px_rgba(245,158,11,0.18)]"
        >
          [ {imp.text} ]
        </div>
      ))}

      <FairChaseTarget
        arenaRef={arenaRef}
        waypoints={WAYPOINTS}
        idx={idx}
        onIdxChange={setIdx}
        disabled={stamps >= needed}
        hitPad={24}
        stepIntervalMs={980}
        stepIntervalAfterFirstHitMs={820}
        dodgeRadiusPx={105}
        dodgeCooldownMs={280}
        hits={stamps}
        onCatch={hit}
      >
        <span
          style={{ minWidth: 210, minHeight: 50 }}
          className="flex items-center justify-center rounded-sm border-2 border-amber-300/90 bg-amber-400/22 px-4 py-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.35)] transition group-hover:scale-105 group-hover:border-white group-hover:bg-amber-400/32 sm:text-[11px]"
        >
          {activeLabel}
        </span>
      </FairChaseTarget>

      <div className="pointer-events-none absolute right-3 bottom-2 left-3 flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-[#b8c6d8]">
        <span>OVERRIDE STAMP // {stamps}/{needed} IMPRINTS</span>
        <span>STAMP TO OVERRIDE AI HOLD</span>
      </div>
    </div>
  );
}
