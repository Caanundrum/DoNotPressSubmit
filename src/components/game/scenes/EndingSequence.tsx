"use client";

import { motion } from "framer-motion";
import { endingBlurb, endingTitle } from "@/game/state";
import type { EndingId, EnvironmentPreset } from "@/game/types";
import { audio } from "@/lib/audio";

export function EndingSequence({
  endingId,
  aiLine,
  environment,
  onContinue,
}: {
  endingId: EndingId;
  aiLine: string;
  environment: EnvironmentPreset;
  onContinue: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
    >
      <motion.div
        className="w-[min(92vw,560px)] border px-6 py-6 text-center"
        style={{
          borderColor:
            endingId === "submit"
              ? "rgba(255,255,255,0.45)"
              : endingId === "secret"
                ? "rgba(180,120,255,0.55)"
                : endingId === "disable"
                  ? "rgba(200,210,220,0.35)"
                  : "rgba(110,231,255,0.4)",
          background:
            endingId === "disable"
              ? "rgba(18,20,24,0.95)"
              : "rgba(4,8,14,0.92)",
          boxShadow:
            endingId === "escape"
              ? "0 0 60px rgba(80,255,200,0.15)"
              : endingId === "submit"
                ? "0 0 40px rgba(255,255,255,0.08)"
                : "0 0 50px rgba(110,231,255,0.12)",
        }}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <div className="font-mono text-[10px] tracking-[0.32em] text-[#b7c6d8]">
          ENDING // {environment.toUpperCase()}
        </div>
        <h2
          id="ending-title"
          className="mt-3 text-3xl tracking-[0.16em] text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {endingTitle(endingId)}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#d2dceb]">{endingBlurb(endingId)}</p>
        {aiLine ? (
          <p className="mt-4 border-t border-white/10 pt-4 text-sm italic text-cyan/90">
            Assistant: {aiLine}
          </p>
        ) : (
          <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[11px] tracking-[0.18em] text-[#9aa6b8]">
            ASSISTANT CHANNEL: SILENT
          </p>
        )}
        <button
          type="button"
          className="mt-6 border border-white/30 px-5 py-3 font-mono text-[11px] tracking-[0.22em] text-white transition hover:border-cyan/55"
          onClick={() => {
            audio.play("click", 0.4);
            onContinue();
          }}
        >
          VIEW ASSESSMENT REPORT
        </button>
      </motion.div>
    </motion.div>
  );
}
