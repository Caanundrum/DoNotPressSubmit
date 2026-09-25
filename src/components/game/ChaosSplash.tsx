"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { audio } from "@/lib/audio";

export function ChaosSplash({
  onDone,
  reducedMotion,
}: {
  onDone: () => void;
  reducedMotion: boolean;
}) {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    audio.play("logo", 0.45);
    const t = setTimeout(() => onDoneRef.current(), reducedMotion ? 1800 : 5200);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,70,100,0.35),transparent_55%)]" />
      <motion.div
        className="absolute h-px w-[min(52vw,420px)] bg-gradient-to-r from-transparent via-cyan/80 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: reducedMotion ? 0.4 : 1.2, times: [0, 0.2, 0.8, 1] }}
      />
      <motion.div
        className="absolute h-[min(52vw,420px)] w-px bg-gradient-to-b from-transparent via-cyan/35 to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: reducedMotion ? 0.4 : 1.4, delay: 0.15, times: [0, 0.2, 0.8, 1] }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-28 w-28">
          {/* Assembling geometric mark */}
          <motion.div
            className="absolute inset-3 rounded-[28%] border border-cyan/70"
            initial={{ rotate: -18, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7, type: "spring", stiffness: 120 }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[22%] bg-gradient-to-br from-cyan/30 to-transparent"
            style={{ boxShadow: "0 0 40px rgba(110,231,255,0.35)" }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.55 }}
          />
          <motion.div
            className="absolute left-[18%] top-[22%] h-3 w-3 rounded-sm bg-cyan"
            initial={{ x: -40, y: -30, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.45 }}
          />
          {/* Wrong piece, then correction */}
          <motion.div
            className="absolute right-[18%] bottom-[24%] h-3 w-8 rounded-sm bg-system-warn"
            initial={{ x: 50, y: 40, opacity: 0, rotate: 25 }}
            animate={{
              x: [50, 8, 8, 0],
              y: [40, -6, -6, 0],
              opacity: [0, 1, 1, 1],
              rotate: [25, 12, 12, 0],
              backgroundColor: ["#ffb020", "#ffb020", "#6ee7ff", "#6ee7ff"],
            }}
            transition={{ delay: 1.1, duration: reducedMotion ? 0.4 : 1.6, times: [0, 0.35, 0.55, 1] }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[-8px] rounded-full border border-cyan/10"
            animate={{ rotate: -360, opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <div
            className="text-glow text-2xl tracking-[0.35em] text-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CHAOS STANDARD
          </div>
          <motion.div
            className="mt-3 font-mono text-[10px] tracking-[0.28em] text-[#c5d3e4]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: 2.4, duration: 2.2, times: [0, 0.15, 0.75, 1] }}
          >
            VISUAL INTEGRITY: ACCEPTABLE
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: reducedMotion ? 1.6 : 5.1, times: [0, 0.88, 1] }}
      />

      <button
        type="button"
        className="absolute bottom-6 right-6 z-20 font-mono text-[10px] tracking-[0.2em] text-[#b4c2d4] hover:text-[#e8eef8]"
        onClick={onDone}
      >
        SKIP
      </button>
    </div>
  );
}
