"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { audio } from "@/lib/audio";

const LAYERS = [
  { id: "glass", label: "Decorative glass", hint: "Looks expensive. Doesn't help." },
  { id: "chrome", label: "Chrome courtesy layer", hint: "Corporate smile sheet." },
  { id: "cable", label: "Kill-switch conduit", hint: "Ah. There it is." },
];

/** Peel layers → expose SUBMIT → SHUT DOWN ASSISTANT diagram, then advance. */
export function PeelReveal({ onComplete }: { onComplete: () => void }) {
  const [peeled, setPeeled] = useState(0);

  const peel = () => {
    audio.play("click", 0.5);
    const next = peeled + 1;
    setPeeled(next);
    if (next >= LAYERS.length) {
      setTimeout(onComplete, 1100);
    }
  };

  return (
    <div className="relative h-[min(46vh,360px)] w-full overflow-hidden border border-[#c9a0ff]/35 bg-black/50">
      <div className="absolute left-3 top-3 z-20 font-mono text-[10px] tracking-[0.22em] text-[#c9a0ff]">
        Layers {peeled}/{LAYERS.length}
      </div>

      {/* Diagram under the sheets — revealed as layers peel. */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        data-peel-schematic="true"
        aria-hidden={peeled < LAYERS.length}
      >
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <div
            className="font-mono text-[11px] tracking-[0.28em] text-[#c9a0ff]/80"
            style={{ opacity: Math.min(1, peeled / LAYERS.length) }}
          >
            UNDERSTRUCTURE
          </div>
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            style={{ opacity: Math.min(1, (peeled + 0.35) / LAYERS.length) }}
          >
            <span className="border border-danger/60 bg-danger/15 px-3 py-2 font-mono text-[12px] tracking-[0.2em] text-[#ff9aab]">
              SUBMIT
            </span>
            <span className="font-mono text-[14px] text-white/70">→</span>
            <span className="border border-white/35 bg-black/70 px-3 py-2 font-mono text-[11px] tracking-[0.16em] text-[#e8eef8]">
              SHUT DOWN ASSISTANT
            </span>
          </div>
        </div>
      </div>

      {LAYERS.map((layer, i) => {
        const gone = peeled > i;
        return (
          <motion.button
            key={layer.id}
            type="button"
            disabled={gone || peeled !== i}
            onClick={peel}
            className="absolute inset-x-[10%] border px-5 py-6 text-left disabled:pointer-events-none"
            style={{
              top: `${22 + i * 18}%`,
              borderColor: gone ? "transparent" : "rgba(200,180,255,0.35)",
              background: gone
                ? "transparent"
                : `linear-gradient(90deg, rgba(20,16,40,0.${7 - i}), rgba(8,10,18,0.85))`,
              zIndex: LAYERS.length - i,
              fontFamily: "var(--font-display)",
            }}
            animate={
              gone
                ? { x: i % 2 ? 420 : -420, opacity: 0, rotate: i % 2 ? 8 : -8 }
                : peeled === i
                  ? { y: [0, -4, 0], opacity: 1 }
                  : { opacity: 0.55 }
            }
            transition={{ duration: gone ? 0.55 : 1.6, repeat: gone ? 0 : Infinity }}
          >
            <div className="text-lg tracking-[0.14em] text-white">{layer.label}</div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.16em] text-[#d2dceb]">
              {layer.hint}
            </div>
          </motion.button>
        );
      })}

      {peeled >= LAYERS.length ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="border border-danger/50 bg-black/80 px-4 py-2 font-mono text-[11px] tracking-[0.18em] text-danger">
            SUBMIT → SHUT DOWN ASSISTANT
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
