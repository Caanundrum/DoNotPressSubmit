"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { audio } from "@/lib/audio";

type Popup = { id: number; x: number; y: number; label: string };

const LABELS = [
  "NOTICE: CONTINUE",
  "COMPLIANCE REQUIRED",
  "ASSISTANT MUTE SUGGESTED",
  "FORM INTEGRITY LOW",
  "PLEASE DISMISS",
  "PLEASE DO NOT DISMISS",
];

export function PopupWar({ onComplete }: { onComplete: () => void }) {
  const [popups, setPopups] = useState<Popup[]>(() => [
    { id: 1, x: 28, y: 30, label: LABELS[0]! },
    { id: 2, x: 52, y: 42, label: LABELS[1]! },
  ]);
  const [closed, setClosed] = useState(0);
  const needed = 8;

  const progress = useMemo(() => Math.min(needed, closed), [closed]);

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
      // Spawn more — System escalation
      const spawnCount = newlyClosed < 3 ? 1 : newlyClosed < 6 ? 2 : 1;
      const spawned: Popup[] = [];
      for (let i = 0; i < spawnCount; i++) {
        spawned.push({
          id: Date.now() + i + Math.random(),
          x: 10 + Math.random() * 70,
          y: 18 + Math.random() * 55,
          label: LABELS[(newlyClosed + i) % LABELS.length]!,
        });
      }
      return [...next, ...spawned].slice(0, 10);
    });
  };

  return (
    <div className="relative h-[300px] w-full overflow-hidden border border-white/25 bg-black/40">
      <div className="absolute left-3 top-3 z-20 font-mono text-[10px] tracking-[0.22em] text-system-warn">
        POPUP WAR // CLEARED {progress}/{needed}
      </div>
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            className="absolute z-10 w-[180px] border border-white/70 bg-black/90 p-3 shadow-[0_0_24px_rgba(255,255,255,0.12)]"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="font-mono text-[9px] tracking-[0.2em] text-white/80">{p.label}</div>
            <button
              type="button"
              className="mt-3 w-full border border-white/40 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white hover:bg-white/10"
              onClick={() => dismiss(p.id)}
            >
              DISMISS
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
