"use client";

import { motion } from "framer-motion";
import { climaxOptions } from "@/game/endings";
import type { GameState } from "@/game/types";
import { audio } from "@/lib/audio";

export function SubmitClimax({
  state,
  aiLine,
  onChoose,
}: {
  state: GameState;
  aiLine: string;
  onChoose: (action: "submit" | "refuse" | "escape" | "disable" | "secret") => void;
}) {
  const options = climaxOptions(state);

  return (
    <div className="relative w-full">
      <motion.div
        className="relative mx-auto mb-8 flex h-48 w-full items-center justify-center sm:h-56"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-danger/20 blur-3xl"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
        <div
          className="relative w-full max-w-3xl border border-danger/70 bg-gradient-to-b from-[#5a1824] via-[#2a0c12] to-[#12060a] px-10 py-10 text-center shadow-[0_0_80px_rgba(255,77,109,0.4)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <div className="font-mono text-[10px] tracking-[0.35em] text-danger/90">FINAL CONTROL</div>
          <div className="mt-2 text-5xl tracking-[0.2em] text-white sm:text-6xl">SUBMIT</div>
          <div className="mt-3 font-mono text-[10px] tracking-[0.18em] text-[#ffc2cc]">
            BEAUTIFUL · TEMPTING · TERRIBLE
          </div>
        </div>
      </motion.div>

      <p className="mb-5 text-center text-base text-[#d2dceb] sm:text-lg">{aiLine}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            className="border px-4 py-4 text-left font-mono text-[12px] tracking-[0.22em] transition"
            style={{
              borderColor:
                opt.tone === "danger"
                  ? "rgba(255,77,109,0.7)"
                  : opt.tone === "secret"
                    ? "rgba(180,120,255,0.55)"
                    : opt.tone === "sterile"
                      ? "rgba(200,210,220,0.45)"
                      : "rgba(110,231,255,0.45)",
              background:
                opt.tone === "danger"
                  ? "linear-gradient(90deg, rgba(90,20,35,0.55), rgba(20,10,14,0.6))"
                  : "rgba(8,12,20,0.55)",
              color: "#e8eef8",
              fontFamily: "var(--font-display)",
            }}
            whileHover={{ x: 4, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              audio.play(opt.id === "submit" ? "system" : "begin", opt.id === "submit" ? 0.7 : 0.55);
              onChoose(opt.id);
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
