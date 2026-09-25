"use client";

import { motion } from "framer-motion";
import { audio } from "@/lib/audio";

export function ContainmentGag({
  interactive,
  onTip,
  onReact,
}: {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
}) {
  const live = !!interactive;
  return (
    <motion.div
      className="pointer-events-none absolute right-[22%] top-[24%]"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        className={`h-20 w-28 border border-white/15 bg-[#0a1420]/75 p-2 text-left ${
          live ? "pointer-events-auto cursor-pointer hover:border-system-warn/50" : ""
        }`}
        onMouseEnter={() => {
          onTip?.("CONTAINMENT // unsolicited reassurance");
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
        <div className="font-mono text-[8px] tracking-[0.2em] text-mist/50">BAY 03</div>
        <motion.div
          className="mt-3 font-mono text-[9px] tracking-[0.16em] text-system-warn"
          animate={{ opacity: [0.25, 1, 1, 0.25] }}
          transition={{ duration: 4.5, times: [0, 0.15, 0.7, 1], repeat: Infinity }}
        >
          EVERYTHING IS FINE
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
