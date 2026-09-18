"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";

export function SystemBeat({
  title,
  line,
  continueLabel = "CONTINUE ASSESSMENT",
  onContinue,
}: {
  title: string;
  line: string;
  continueLabel?: string;
  onContinue: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(16);
  const [armed, setArmed] = useState(false);
  const interacting = useRef(false);
  const fired = useRef(false);

  const safeContinue = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    audio.play("system", 0.75);
    speech.speak(line, { system: true });
    const arm = window.setTimeout(() => setArmed(true), 1800);
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (interacting.current) return s;
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => {
      window.clearTimeout(arm);
      window.clearInterval(tick);
      speech.cancel();
    };
  }, [line]);

  useEffect(() => {
    if (!armed || secondsLeft > 0) return;
    if (interacting.current) return;
    safeContinue();
  }, [armed, secondsLeft, safeContinue]);

  return (
    <div className="absolute inset-0 z-50 flex max-w-full items-start justify-center overflow-hidden px-3 pt-[5%] sm:pt-[7%]">
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
        className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
      />
      {[18, 28, 38].map((top, i) => (
        <motion.div
          key={top}
          className="pointer-events-none absolute left-[4%] right-[4%] h-px bg-white/70"
          style={{ top: `${top}%` }}
          // Opacity-only enter — x-slides were widening past the stage and reopening H-overflow.
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.15 + i * 0.1 }}
        />
      ))}
      <motion.div
        className="system-beat-shell relative z-10 max-w-full overflow-hidden border border-white/70 bg-black/90 px-3 py-4 shadow-[0_0_60px_rgba(255,255,255,0.25)] sm:px-5 sm:py-5"
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 160 }}
        role="alertdialog"
      >
        <div className="max-w-full font-mono text-[10px] tracking-[0.16em] text-system-warn break-words sm:tracking-[0.22em]">
          {title}
        </div>
        <div
          className="mt-3 max-w-full break-words text-base leading-snug tracking-[0.02em] text-white sm:text-lg sm:tracking-[0.04em]"
          style={{ fontFamily: "var(--font-display)", overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          {line}
        </div>
        <div className="mt-4 flex max-w-full flex-col items-stretch gap-2.5">
          <button
            type="button"
            onPointerDown={() => {
              interacting.current = true;
            }}
            onPointerUp={() => {
              interacting.current = false;
            }}
            onPointerLeave={() => {
              interacting.current = false;
            }}
            onFocus={() => {
              interacting.current = true;
            }}
            onBlur={() => {
              interacting.current = false;
            }}
            onClick={safeContinue}
            className="max-w-full border border-white/80 bg-white/10 px-4 py-3 font-mono text-[11px] tracking-[0.14em] text-white transition break-words hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-[12px] sm:tracking-[0.18em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {continueLabel}
          </button>
          <div className="font-mono text-[10px] tracking-[0.12em] text-[#c5d3e4]">
            {armed ? `AUTO-RESUME IN ${secondsLeft}s` : "AWAITING ACKNOWLEDGEMENT…"}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
