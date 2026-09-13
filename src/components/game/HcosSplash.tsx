"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function HcosSplash({
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
    const t = setTimeout(() => onDoneRef.current(), reducedMotion ? 1600 : 4200);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  const metrics = [
    "RELATIONSHIP ANALYSIS: PRIMED",
    "CERTIFIED 99.7% NON-LETHAL",
    "FORM INTEGRITY: NOMINAL",
    "HUMAN-ASSISTED SYNTHETIC ROUTINE",
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#060910]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[8%] top-[18%] h-40 w-40 rounded-full bg-cyan/10 blur-3xl" />
        <div className="absolute bottom-[12%] right-[10%] h-48 w-48 rounded-full bg-system-warn/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-[min(92vw,560px)] flex-col items-center gap-8 px-6">
        <motion.div
          className="font-mono text-[10px] tracking-[0.42em] text-[#c2d0e0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          INITIALIZING CORPORATE BOOT SEQUENCE
        </motion.div>

        <motion.div
          className="relative flex h-24 w-24 items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring" }}
        >
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-2 rounded-full border border-cyan/40" />
          <div
            className="text-3xl font-bold tracking-widest text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            HCOS
          </div>
        </motion.div>

        <div className="text-center">
          <motion.h1
            className="text-xl tracking-[0.18em] text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            HUMAN COMPATIBILITY
            <br />
            &amp; ONBOARDING SYSTEM
          </motion.h1>
          <motion.p
            className="mt-3 text-sm tracking-[0.12em] text-[#c8d4e4]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            HUMAN-ASSISTED SYNTHETIC RELATIONSHIP ANALYSIS
          </motion.p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {metrics.map((m, i) => (
            <motion.div
              key={m}
              className="border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-[#d0dcea]"
              initial={{ opacity: 0, x: i % 2 ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.18 }}
            >
              {m}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="font-mono text-[10px] tracking-[0.3em] text-danger"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 2.1, duration: 1.4, times: [0, 0.2, 0.55, 1] }}
        >
          CERTIFIED 99.7% NON-LETHAL
        </motion.div>
      </div>

      <button
        type="button"
        className="absolute bottom-6 right-6 z-10 font-mono text-[10px] tracking-[0.2em] text-[#a8b8cc] hover:text-[#e2ebf6]"
        onClick={onDone}
      >
        SKIP
      </button>
    </div>
  );
}
