"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { audio } from "@/lib/audio";

type Popup = { id: number; x: number; y: number; label: string; z: number };

const LABELS = [
  "NOTICE: CONTINUE",
  "COMPLIANCE REQUIRED",
  "ASSISTANT MUTE SUGGESTED",
  "FORM INTEGRITY LOW",
  "PLEASE DISMISS",
  "PLEASE DO NOT DISMISS",
  "THIS NOTICE HAS CHILDREN",
  "URGENCY.EXE IS PREGNANT",
  "DISMISS ME. I DARE YOU",
];

/** Non-overlapping-ish grid slots so dismiss stays hittable. */
const SLOTS: { x: number; y: number }[] = [
  { x: 8, y: 18 },
  { x: 38, y: 22 },
  { x: 66, y: 18 },
  { x: 14, y: 46 },
  { x: 44, y: 50 },
  { x: 70, y: 44 },
  { x: 26, y: 68 },
  { x: 56, y: 66 },
];

export function PopupWar({ onComplete }: { onComplete: () => void }) {
  const [popups, setPopups] = useState<Popup[]>(() => [
    { id: 1, x: SLOTS[0]!.x, y: SLOTS[0]!.y, label: LABELS[0]!, z: 1 },
    { id: 2, x: SLOTS[1]!.x, y: SLOTS[1]!.y, label: LABELS[1]!, z: 2 },
  ]);
  const [closed, setClosed] = useState(0);
  const [topZ, setTopZ] = useState(3);
  const [focusId, setFocusId] = useState<number | null>(2);
  const needed = 8;

  const progress = useMemo(() => Math.min(needed, closed), [closed]);

  const slotFor = (index: number) => SLOTS[index % SLOTS.length]!;

  const dismiss = (id: number) => {
    audio.play("click", 0.4);
    setPopups((prev) => {
      const next = prev.filter((p) => p.id !== id);
      const newlyClosed = closed + 1;
      setClosed(newlyClosed);
      if (newlyClosed >= needed) {
        setTimeout(onComplete, 400);
        return next;
      }
      // Spawn more — System escalation, but into free-ish slots
      const spawnCount = newlyClosed < 3 ? 1 : newlyClosed < 6 ? 2 : 1;
      const spawned: Popup[] = [];
      let z = topZ;
      for (let i = 0; i < spawnCount; i++) {
        z += 1;
        const slot = slotFor(newlyClosed + i + next.length);
        spawned.push({
          id: Date.now() + i + Math.random(),
          x: slot.x,
          y: slot.y,
          label: LABELS[(newlyClosed + i) % LABELS.length]!,
          z,
        });
      }
      setTopZ(z);
      const merged = [...next, ...spawned].slice(0, 6);
      // Always keep one clear primary on top
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
        POPUP WAR // CLEARED {progress}/{needed}
      </div>
      <AnimatePresence>
        {popups.map((p) => {
          const isPrimary = p.id === focusId;
          return (
            <motion.div
              key={p.id}
              className="absolute w-[min(200px,42%)] border bg-black/92 p-3 shadow-[0_0_24px_rgba(255,255,255,0.12)]"
              style={{
                left: `${p.x}%`,
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
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onPointerDown={() => bringForward(p.id)}
            >
              <div className="font-mono text-[9px] tracking-[0.2em] text-[#e8eef8]">
                {p.label}
              </div>
              <button
                type="button"
                className="mt-3 w-full border px-2 py-2 font-mono text-[10px] tracking-[0.18em] text-white transition hover:bg-white/15"
                style={{
                  borderColor: isPrimary
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.4)",
                  background: isPrimary ? "rgba(255,255,255,0.12)" : "transparent",
                }}
                onClick={() => dismiss(p.id)}
              >
                DISMISS
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {popups.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.2em] text-[#c5d3e4]">
          CASCADE CLEARED
        </div>
      ) : null}
    </div>
  );
}
