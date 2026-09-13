"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";

const AUTO_MS = 14000;

export function SystemInterruption({
  onDone,
}: {
  onDone: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(AUTO_MS / 1000));
  const dismissedRef = useRef(false);

  useEffect(() => {
    audio.play("system", 0.75);
    speech.speak("System override. Continue assessment.", { system: true });

    const tick = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    const auto = window.setTimeout(() => {
      if (!dismissedRef.current) onDone();
    }, AUTO_MS);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(auto);
      speech.cancel();
    };
    // Mount-once interruption sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const continueAssessment = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    audio.play("click", 0.45);
    speech.cancel();
    onDone();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center pt-[14%] sm:pt-[16%]">
      {/* Physical room effect: hard white bars + amber warning wash */}
      <motion.div
        className="pointer-events-none absolute inset-0"
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
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      />

      {/* Ceiling rails slamming into alignment */}
      {[18, 28, 38].map((top, i) => (
        <motion.div
          key={top}
          className="pointer-events-none absolute left-[8%] right-[8%] h-px bg-white/70"
          style={{ top: `${top}%` }}
          initial={{ x: i % 2 ? 80 : -80, opacity: 0 }}
          animate={{ x: 0, opacity: 0.85 }}
          transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}
        />
      ))}

      <motion.div
        className="relative z-10 w-[min(92vw,640px)] border border-white/70 bg-black/85 px-6 py-5 shadow-[0_0_60px_rgba(255,255,255,0.25)]"
        initial={{ opacity: 0, y: -30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 160 }}
        role="alertdialog"
        aria-labelledby="system-override-title"
        aria-describedby="system-override-body"
      >
        <div className="font-mono text-[10px] tracking-[0.4em] text-system-warn">
          SYSTEM OVERRIDE
        </div>
        <div
          id="system-override-title"
          className="mt-3 text-2xl tracking-[0.2em] text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ASSESSMENT INTERRUPTED
        </div>
        <div
          id="system-override-body"
          className="mt-3 font-mono text-[11px] tracking-[0.16em] text-[#c8d4e6]"
        >
          UNAUTHORIZED ENVIRONMENT OPTION FLAGGED // ASSISTANT SILENCED
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={continueAssessment}
            className="border border-white/80 bg-white/10 px-5 py-3 font-mono text-[12px] tracking-[0.28em] text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CONTINUE ASSESSMENT
          </button>
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#aebcce]">
            AUTO-RESUME IN {secondsLeft}s
          </div>
        </div>
      </motion.div>

      {/* Shockwave rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 4 + i, opacity: 0 }}
          transition={{ delay: 0.2 + i * 0.15, duration: 1.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
