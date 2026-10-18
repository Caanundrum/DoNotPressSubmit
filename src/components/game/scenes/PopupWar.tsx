"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { audio } from "@/lib/audio";

type Popup = { id: number; x: number; y: number; label: string; z: number };

const LABELS = [
  "NOTICE: CONTINUE",
  "COMPLIANCE REQUIRED",
  "ASSISTANT MUTE SUGGESTED",
  "FORM INTEGRITY LOW",
  "PLEASE DISMISS",
  "PLEASE DO NOT DISMISS",
  "DISMISS ME. I DARE YOU",
  "STILL NOT COMPLIANT",
  "DISMISS QUEUE OVERFLOW",
  "PRIORITY NOTICE",
];

/** Non-overlapping-ish grid slots so dismiss stays hittable. */
const SLOTS: { x: number; y: number }[] = [
  { x: 6, y: 14 },
  { x: 36, y: 16 },
  { x: 62, y: 14 },
  { x: 10, y: 40 },
  { x: 40, y: 44 },
  { x: 64, y: 38 },
  { x: 22, y: 62 },
  { x: 50, y: 60 },
];

export function PopupWar({
  onComplete,
  onCleared,
}: {
  onComplete: () => void;
  /** Fires when the board empties — swap the stale "Diplomacy failed…" bubble. */
  onCleared?: () => void;
}) {
  const [popups, setPopups] = useState<Popup[]>(() => [
    { id: 1, x: SLOTS[0]!.x, y: SLOTS[0]!.y, label: LABELS[0]!, z: 1 },
    { id: 2, x: SLOTS[1]!.x, y: SLOTS[1]!.y, label: LABELS[1]!, z: 2 },
  ]);
  const [closed, setClosed] = useState(0);
  const [topZ, setTopZ] = useState(3);
  const [focusId, setFocusId] = useState<number | null>(2);
  const [hoverDismiss, setHoverDismiss] = useState<number | null>(null);
  /** Dismissed labels never respawn — no "Compliance required" zombie pile (P1). */
  const dismissedLabels = useRef(new Set<string>());
  const labelCursor = useRef(2);
  const needed = 5;

  const progress = useMemo(() => Math.min(needed, closed), [closed]);

  const slotFor = (index: number) => SLOTS[index % SLOTS.length]!;

  const nextFreshLabel = () => {
    for (let i = 0; i < LABELS.length * 2; i++) {
      const label = LABELS[labelCursor.current % LABELS.length]!;
      labelCursor.current += 1;
      if (!dismissedLabels.current.has(label)) return label;
    }
    return `NOTICE // CASCADE ${labelCursor.current++}`;
  };

  const dismiss = (id: number) => {
    audio.play("click", 0.4);
    setPopups((prev) => {
      const victim = prev.find((p) => p.id === id);
      if (victim) dismissedLabels.current.add(victim.label);
      const next = prev.filter((p) => p.id !== id);
      const newlyClosed = closed + 1;
      setClosed(newlyClosed);
      // Final click clears leftovers so Closed N/5 matches an empty board.
      if (newlyClosed >= needed) {
        onCleared?.();
        setTimeout(onComplete, 700);
        return [];
      }
      // One spawn per dismiss — no mid-cascade double that leaves 3 up at 4/5.
      const spawned: Popup[] = [];
      let z = topZ + 1;
      const slot = slotFor(newlyClosed + next.length);
      spawned.push({
        id: Date.now() + Math.random(),
        x: slot.x,
        y: slot.y,
        label: nextFreshLabel(),
        z,
      });
      setTopZ(z);
      // Cap stack so the primary readable beat isn't buried.
      const merged = [...next, ...spawned].slice(0, 3);
      const primary = merged[merged.length - 1];
      if (primary) setFocusId(primary.id);
      return merged;
    });
  };

  const bringForward = (id: number) => {
    setTopZ((z) => {
      const nextZ = z + 1;
      setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, z: nextZ } : p)));
      setFocusId(id);
      return nextZ;
    });
  };

  return (
    <div className="relative h-[min(48vh,380px)] w-full overflow-hidden border border-white/25 bg-black/40">
      <div className="pointer-events-none absolute left-3 top-3 z-30 font-mono text-[10px] tracking-[0.22em] text-system-warn">
        Closed {progress}/{needed}
      </div>
      <AnimatePresence>
        {popups.map((p) => {
          const isPrimary = p.id === focusId;
          const dismissHot = hoverDismiss === p.id;
          return (
            <motion.div
              key={p.id}
              className="absolute w-[min(200px,48%)] border bg-black/92 p-3 shadow-[0_0_24px_rgba(255,255,255,0.12)]"
              data-popup-card="true"
              style={{
                // Keep DISMISS inside the arena — never run past the right edge on ~390px.
                left: `min(${p.x}%, calc(100% - min(200px, 48%) - 8px))`,
                top: `${p.y}%`,
                zIndex: p.z,
                borderColor: isPrimary
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.45)",
                boxShadow: isPrimary
                  ? "0 0 0 1px rgba(255,176,32,0.55), 0 0 28px rgba(255,176,32,0.2)"
                  : undefined,
              }}
              initial={{ opacity: 0, scale: 0.9, y: -6 }}
              animate={{
                opacity: 1,
                scale: dismissHot ? 1.02 : 1,
                x: dismissHot ? 0 : isPrimary ? [0, 3, -2, 0] : 0,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{
                x: {
                  duration: dismissHot ? 0.2 : 2.4,
                  repeat: dismissHot || !isPrimary ? 0 : Infinity,
                  ease: "easeInOut",
                },
                scale: { duration: 0.15 },
              }}
              onPointerDown={() => bringForward(p.id)}
            >
              <div className="font-mono text-[9px] tracking-[0.2em] text-[#e8eef8]">
                {p.label}
              </div>
              <button
                type="button"
                className="mt-3 w-full border px-3 py-3 font-mono text-[11px] tracking-[0.18em] text-white transition hover:bg-white/15"
                style={{
                  borderColor: isPrimary
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.4)",
                  background: isPrimary ? "rgba(255,255,255,0.12)" : "transparent",
                  minHeight: 44,
                }}
                onMouseEnter={() => setHoverDismiss(p.id)}
                onMouseLeave={() =>
                  setHoverDismiss((cur) => (cur === p.id ? null : cur))
                }
                onClick={() => dismiss(p.id)}
              >
                DISMISS
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {popups.length === 0 ? (
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.2em] text-[#c5d3e4]"
          data-popup-cleared="true"
        >
          Notices cleared. I'll take the win.
        </div>
      ) : null}
    </div>
  );
}
