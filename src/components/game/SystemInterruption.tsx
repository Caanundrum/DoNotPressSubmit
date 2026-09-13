"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { audio } from "@/lib/audio";

export function SystemInterruption({
  onDone,
}: {
  onDone: () => void;
}) {
  useEffect(() => {
    audio.play("system", 0.75);
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Physical room effect: hard white bars + amber warning wash */}
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundColor: "rgba(255,255,255,0)" }}
        animate={{
          backgroundColor: [
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.18)",
            "rgba(255,176,32,0.12)",
            "rgba(255,176,32,0.08)",
          ],
        }}
        transition={{ duration: 1.2 }}
      />

      <motion.div
        className="absolute inset-x-0 top-0 h-1 bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1 bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      />

      {/* Ceiling rails slamming into alignment */}
      {[18, 28, 38].map((top, i) => (
        <motion.div
          key={top}
          className="absolute left-[8%] right-[8%] h-px bg-white/70"
          style={{ top: `${top}%` }}
          initial={{ x: i % 2 ? 80 : -80, opacity: 0 }}
          animate={{ x: 0, opacity: 0.85 }}
          transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-[18%] w-[min(92vw,640px)] -translate-x-1/2 border border-white/70 bg-black/80 px-6 py-5 shadow-[0_0_60px_rgba(255,255,255,0.25)]"
        initial={{ opacity: 0, y: -30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 160 }}
      >
        <div className="font-mono text-[10px] tracking-[0.4em] text-system-warn">
          SYSTEM OVERRIDE
        </div>
        <div
          className="mt-3 text-2xl tracking-[0.2em] text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          CONTINUE ASSESSMENT.
        </div>
        <div className="mt-3 font-mono text-[11px] tracking-[0.16em] text-mist">
          UNAUTHORIZED ENVIRONMENT OPTION FLAGGED // ASSISTANT SILENCED
        </div>
      </motion.div>

      {/* Shockwave rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 4 + i, opacity: 0 }}
          transition={{ delay: 0.2 + i * 0.15, duration: 1.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
