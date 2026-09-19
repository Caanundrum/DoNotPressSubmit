"use client";

import { motion } from "framer-motion";
import { climaxOptions } from "@/game/endings";
import type { GameState } from "@/game/types";
import { audio } from "@/lib/audio";

export function SubmitClimax({
  state,
  aiLine,
  onChoose,
  onHoverOption,
}: {
  state: GameState;
  aiLine: string;
  onChoose: (action: "submit" | "refuse" | "escape" | "disable" | "secret") => void;
  onHoverOption?: (id: string | null) => void;
}) {
  const options = climaxOptions(state);

  return (
    <div className="relative flex w-full min-h-0 flex-col gap-2">
      <motion.div
        className="relative mx-auto flex w-full shrink-0 items-center justify-center"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-danger/20 blur-2xl"
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.95, 1.03, 0.95] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
        <div
          className="relative w-full max-w-2xl border border-danger/70 bg-gradient-to-b from-[#5a1824] via-[#2a0c12] to-[#12060a] px-4 py-2.5 text-center shadow-[0_0_48px_rgba(255,77,109,0.35)] sm:px-6 sm:py-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <div className="font-mono text-[9px] tracking-[0.28em] text-danger/90">FINAL CONTROL</div>
          <div className="mt-0.5 text-2xl tracking-[0.16em] text-white sm:text-3xl">SUBMIT</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#ffc2cc]">
            BEAUTIFUL · TEMPTING · TERRIBLE
          </div>
        </div>
      </motion.div>

      {/* Orb already shows the pitch — keep a one-line reminder, never a second essay. */}
      <p className="shrink-0 text-center text-[12px] leading-snug text-[#d2dceb] sm:text-sm">
        {aiLine}
      </p>

      <div
        className={`grid min-h-0 gap-1.5 ${
          options.length <= 2
            ? "grid-cols-1 sm:grid-cols-2"
            : options.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            className="border px-3 py-2 text-left font-mono text-[10px] leading-snug tracking-[0.12em] transition sm:px-3.5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.14em]"
            style={{
              borderColor:
                opt.tone === "danger"
                  ? "rgba(255,77,109,0.7)"
                  : opt.tone === "secret"
                    ? "rgba(180,120,255,0.65)"
                    : opt.tone === "sterile"
                      ? "rgba(200,210,220,0.55)"
                      : "rgba(110,231,255,0.55)",
              background:
                opt.tone === "danger"
                  ? "linear-gradient(90deg, rgba(90,20,35,0.78), rgba(20,10,14,0.88))"
                  : "linear-gradient(155deg, rgba(22,32,48,0.92) 0%, rgba(10,14,22,0.94) 100%)",
              color: "#e8eef8",
              fontFamily: "var(--font-display)",
            }}
            whileHover={{ x: 3, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => {
              onHoverOption?.(opt.id);
              audio.play("hover", 0.2);
            }}
            onHoverEnd={() => onHoverOption?.(null)}
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
