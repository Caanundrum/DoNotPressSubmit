"use client";

import { useRef, useState } from "react";
import { audio } from "@/lib/audio";
import { useTimerRegistry } from "@/lib/useTimerRegistry";
import { FairChaseTarget } from "../FairChaseTarget";

const WAYPOINTS = [
  { x: 10, y: 18 },
  { x: 54, y: 14 },
  { x: 58, y: 50 },
  { x: 14, y: 54 },
  { x: 34, y: 20 },
  { x: 46, y: 48 },
  { x: 18, y: 36 },
  { x: 52, y: 30 },
] as const;

export function EscapingButton({
  onComplete,
  onHit,
}: {
  onComplete: () => void;
  onHit?: (hits: number) => void;
}) {
  const timers = useTimerRegistry();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [hits, setHits] = useState(0);
  const [idx, setIdx] = useState(0);
  const [taunt, setTaunt] = useState("DO NOT CLICK");
  const doneRef = useRef(false);
  const needed = 3;

  const catchIt = () => {
    if (doneRef.current) return;
    audio.play("click", 0.5);
    const next = hits + 1;
    setHits(next);
    onHit?.(next);
    setIdx((i) => (i + 3) % WAYPOINTS.length);
    if (next === 1) setTaunt("HEY — STOP");
    if (next === 2) setTaunt("ONE MORE PINS IT");
    if (next >= needed) {
      doneRef.current = true;
      setTaunt("CONTAINED");
      timers.schedule("complete", () => onComplete(), 650);
    }
  };

  return (
    <div
      ref={arenaRef}
      className="relative mt-2 h-48 w-full overflow-hidden rounded-sm border border-white/15 bg-black/50"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,92,122,0.22), transparent 65%)",
        }}
      />

      <FairChaseTarget
        arenaRef={arenaRef}
        waypoints={WAYPOINTS}
        idx={idx}
        onIdxChange={setIdx}
        disabled={hits >= needed}
        hitPad={26}
        stepIntervalMs={950}
        stepIntervalAfterFirstHitMs={780}
        dodgeRadiusPx={110}
        dodgeCooldownMs={280}
        hits={hits}
        onCatch={catchIt}
      >
        <span
          style={{ minWidth: 168, minHeight: 54 }}
          className="flex items-center justify-center rounded-sm border-2 border-[#ff5c7a] bg-[#ff5c7a]/22 px-5 py-3 font-mono text-xs tracking-[0.2em] text-white shadow-[0_0_26px_rgba(255,92,122,0.45)] transition group-hover:scale-105 group-hover:border-white group-hover:bg-[#ff5c7a]/35"
        >
          {taunt} ({hits}/{needed})
        </span>
      </FairChaseTarget>

      <div className="pointer-events-none absolute right-3 bottom-2 left-3 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-[#b8c6d8]">
        <span>TARGET EVADING // HITS: {hits}/{needed}</span>
        <span>TRACK &amp; CATCH ON RECOVERY</span>
      </div>
    </div>
  );
}
