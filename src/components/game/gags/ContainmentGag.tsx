"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { audio } from "@/lib/audio";

/** Containment plaque — wordless idle; comedy copy only via parent toast on click. */
export function ContainmentGag({
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
      style={slot ?? { left: "78%", top: "24%" }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      data-roam-egg="containment"
    >
      <motion.button
        type="button"
        className={`h-20 w-28 border border-white/15 bg-[#0a1420]/75 p-2 text-left ${
          live ? "pointer-events-auto cursor-pointer hover:border-system-warn/50" : ""
        }`}
        onMouseEnter={() => {
          onTip?.(null);
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
        animate={{
          boxShadow: [
            "0 0 0 rgba(255,176,32,0)",
            "0 0 28px rgba(255,176,32,0.35)",
            "0 0 0 rgba(255,176,32,0)",
          ],
        }}
        transition={{ duration: 4.5, repeat: Infinity }}
        aria-label={interactive ? "Inspect containment plaque" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="h-1 w-8 rounded-full bg-mist/35" />
        <motion.div
          className="mt-4 h-2 w-full rounded-sm bg-system-warn/45"
          animate={{ opacity: [0.25, 1, 1, 0.25] }}
          transition={{ duration: 4.5, times: [0, 0.15, 0.7, 1], repeat: Infinity }}
        />
        <div className="mt-2 h-0.5 w-2/3 rounded-full bg-mist/25" />
      </motion.button>
    </motion.div>
  );
}
