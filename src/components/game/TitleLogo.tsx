"use client";

import { motion } from "framer-motion";

export function TitleLogo({
  reactive = false,
  compact = false,
}: {
  reactive?: boolean;
  /** Tighter vertical footprint so title footer clears 1280×800. */
  compact?: boolean;
}) {
  return (
    <div className="relative select-none text-center">
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
      <motion.div
        className={
          compact
            ? "relative mx-auto mt-2 inline-flex items-center justify-center px-6 py-1.5"
            : "relative mx-auto mt-3 inline-flex items-center justify-center px-8 py-2"
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
      >
        <span
          className={
            compact
              ? "text-[clamp(1.5rem,5vw,3.1rem)] font-extrabold tracking-[0.26em] text-[#ff8aa0]"
              : "text-[clamp(1.8rem,6vw,3.8rem)] font-extrabold tracking-[0.28em] text-[#ff8aa0]"
          }
          style={{ fontFamily: "var(--font-display)", textShadow: "0 0 24px rgba(255,77,109,0.45)" }}
        >
          SUBMIT
        </span>
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4px]">
          <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent [animation:sweep_3.5s_linear_infinite]" />
        </span>
      </motion.div>
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
    </div>
  );
}
