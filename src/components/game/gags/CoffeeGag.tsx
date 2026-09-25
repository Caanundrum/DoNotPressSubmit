"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { audio } from "@/lib/audio";

export function CoffeeGag({
  interactive,
  onTip,
  onReact,
  slot,
}: {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
  slot?: CSSProperties;
}) {
  const live = !!interactive;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={slot ?? { left: "86%", top: "50%" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      data-roam-egg="coffee"
    >
      <motion.button
        type="button"
        className={`flex items-end gap-3 border-0 bg-transparent p-0 ${
          live ? "pointer-events-auto cursor-pointer" : ""
        }`}
        animate={{ x: [0, 48, 96] }}
        transition={{ duration: 7, ease: "easeInOut" }}
        onMouseEnter={() => {
          onTip?.("HUMAN PERFORMANCE // mug in transit");
          if (live) audio.play("hover", 0.12);
        }}
        onMouseLeave={() => onTip?.(null)}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect coffee mug" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <motion.div
          className="h-11 w-2 rounded bg-metal/55"
          animate={{ rotate: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <div className="relative h-8 w-7 rounded-b-md rounded-t-sm border border-white/35 bg-gradient-to-b from-[#5a3a24] to-[#2a180e] hover:border-cyan/50">
          <div className="absolute -right-2 top-1 h-4 w-2 rounded-r-full border border-white/30" />
          <motion.div
            className="absolute inset-x-1 top-1 h-1 rounded bg-[#c4a882]/50"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
        <motion.div
          className="h-11 w-2 rounded bg-metal/55"
          animate={{ rotate: [0, 2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </motion.button>
      <motion.div
        className="mt-2 max-w-[240px] border border-cyan/35 bg-black/55 px-2 py-1 font-mono text-[9px] tracking-wider text-cyan"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 6, times: [0, 0.2, 0.75, 1] }}
      >
        HUMAN PERFORMANCE ENHANCEMENT COMPOUND DETECTED
      </motion.div>
    </motion.div>
  );
}
