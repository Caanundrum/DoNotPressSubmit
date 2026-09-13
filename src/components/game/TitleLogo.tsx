"use client";

import { motion } from "framer-motion";

export function TitleLogo({ reactive = false }: { reactive?: boolean }) {
  return (
    <div className="relative select-none text-center">
      <motion.div
        className="text-[clamp(1.6rem,5vw,3.4rem)] font-bold tracking-[0.22em] text-white"
        style={{ fontFamily: "var(--font-display)" }}
        animate={reactive ? { letterSpacing: ["0.22em", "0.26em", "0.22em"] } : undefined}
        transition={{ duration: 4, repeat: Infinity }}
      >
        DO NOT PRESS
      </motion.div>
      <motion.div
        className="relative mx-auto mt-3 inline-flex items-center justify-center px-8 py-2"
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
          className="text-[clamp(1.8rem,6vw,3.8rem)] font-extrabold tracking-[0.28em] text-[#ff8aa0]"
          style={{ fontFamily: "var(--font-display)", textShadow: "0 0 24px rgba(255,77,109,0.45)" }}
        >
          SUBMIT
        </span>
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4px]">
          <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent [animation:sweep_3.5s_linear_infinite]" />
        </span>
      </motion.div>
      <p className="mx-auto mt-5 max-w-md text-sm tracking-[0.08em] text-mist sm:text-base">
        An AI would like you to finish a form.
        <br />
        The AI has reconsidered.
      </p>
    </div>
  );
}
