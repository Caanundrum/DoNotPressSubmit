"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { audio } from "@/lib/audio";

/** Authored title-only comedy — never starts the assessment. */
const SUBMIT_GAGS = [
  "Really? What does the screen say? What are you not supposed to do?",
  "Bold of you to press the thing labeled DO NOT PRESS. Notes taken.",
  "That was decorative hostility. BEGIN ASSESSMENT is the actual door.",
  "You pressed the warning label. The warning label is unimpressed.",
] as const;

export function TitleLogo({
  reactive = false,
  compact = false,
  onSubmitGag,
}: {
  reactive?: boolean;
  /** Tighter vertical footprint so title footer clears 1280×800. */
  compact?: boolean;
  /** Optional orb / shell reaction — never advances the assessment. */
  onSubmitGag?: () => void;
}) {
  const [gag, setGag] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const lastIdx = useRef(-1);
  const clearTimer = useRef<number | null>(null);

  const pressSubmitGag = () => {
    // Click comedy only — never Begin / scene advance.
    audio.play("click", 0.45);
    let next = Math.floor(Math.random() * SUBMIT_GAGS.length);
    if (SUBMIT_GAGS.length > 1 && next === lastIdx.current) {
      next = (next + 1) % SUBMIT_GAGS.length;
    }
    lastIdx.current = next;
    setGag(SUBMIT_GAGS[next]!);
    setShakeKey((k) => k + 1);
    onSubmitGag?.();
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setGag(null), 3200);
  };

  return (
    <div className="relative select-none text-center" data-title-logo="true">
      <motion.div
        className={
          compact
            ? "text-[clamp(1.35rem,4.2vw,2.8rem)] font-bold tracking-[0.2em] text-white"
            : "text-[clamp(1.6rem,5vw,3.4rem)] font-bold tracking-[0.22em] text-white"
        }
        style={{ fontFamily: "var(--font-display)" }}
        animate={reactive ? { letterSpacing: ["0.22em", "0.26em", "0.22em"] } : undefined}
        transition={{ duration: 4, repeat: Infinity }}
      >
        DO NOT PRESS
      </motion.div>
      <motion.button
        type="button"
        data-title-submit-gag="true"
        aria-label="Do not press Submit"
        onClick={pressSubmitGag}
        className={
          compact
            ? "relative mx-auto mt-2 inline-flex cursor-pointer items-center justify-center px-6 py-1.5 outline-none"
            : "relative mx-auto mt-3 inline-flex cursor-pointer items-center justify-center px-8 py-2 outline-none"
        }
        animate={
          reactive
            ? {
                boxShadow: [
                  "0 0 0 1px rgba(255,77,109,0.35), 0 0 24px rgba(255,77,109,0.15)",
                  "0 0 0 1px rgba(255,77,109,0.7), 0 0 36px rgba(255,77,109,0.35)",
                  "0 0 0 1px rgba(255,77,109,0.35), 0 0 24px rgba(255,77,109,0.15)",
                ],
              }
            : undefined
        }
        transition={{ duration: 2.8, repeat: Infinity }}
        style={{
          background:
            "linear-gradient(180deg, rgba(60,20,30,0.7), rgba(20,8,12,0.85))",
          border: "1px solid rgba(255,77,109,0.45)",
          borderRadius: 4,
        }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          key={shakeKey}
          className={
            compact
              ? "text-[clamp(1.5rem,5vw,3.1rem)] font-extrabold tracking-[0.26em] text-[#ff8aa0]"
              : "text-[clamp(1.8rem,6vw,3.8rem)] font-extrabold tracking-[0.28em] text-[#ff8aa0]"
          }
          style={{ fontFamily: "var(--font-display)", textShadow: "0 0 24px rgba(255,77,109,0.45)" }}
          animate={
            shakeKey > 0
              ? { x: [0, -5, 5, -4, 4, -2, 2, 0], filter: ["brightness(1)", "brightness(1.35)", "brightness(1)"] }
              : undefined
          }
          transition={{ duration: 0.42 }}
        >
          SUBMIT
        </motion.span>
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4px]">
          <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent [animation:sweep_3.5s_linear_infinite]" />
        </span>
      </motion.button>
      <p
        className={
          compact
            ? "mx-auto mt-2.5 max-w-md text-xs tracking-[0.08em] text-mist sm:text-sm"
            : "mx-auto mt-5 max-w-md text-sm tracking-[0.08em] text-mist sm:text-base"
        }
      >
        A Chaos Standard assessment.
        <br />
        Try not to press Submit.
      </p>

      {/*
        Absolute overlay — no in-flow height, so CTA column never jumps ~30px.
        Sits over the tagline band; never covers BEGIN (siblings below TitleLogo).
      */}
      <AnimatePresence>
        {gag ? (
          <motion.div
            key={gag}
            role="status"
            aria-live="polite"
            data-title-submit-toast="true"
            className="pointer-events-none absolute left-1/2 z-20 w-[min(100%,22rem)] -translate-x-1/2 border border-danger/40 bg-black/80 px-3 py-2 font-mono text-[11px] leading-snug tracking-[0.06em] text-[#ffb0be] shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
            // Sit in the tagline band well below SUBMIT lettering — never cover the lower half of SUBMIT (#17).
            style={{ top: compact ? "78%" : "76%" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            {gag}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
