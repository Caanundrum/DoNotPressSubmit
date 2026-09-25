"use client";

import { motion } from "framer-motion";
import { audio } from "@/lib/audio";

/** REPLACEMENT FAILED — Phase 3 richer motion; P2 clickable memo label. */
export function DroneGag({
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
      className="pointer-events-none absolute left-[10%] top-[54%]"
      initial={{ opacity: 0, x: -48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ duration: 0.8 }}
    >
      <motion.button
        type="button"
        className={`relative h-10 w-[4.5rem] rounded-md border border-cyan/45 bg-[#132033]/92 shadow-[0_0_18px_rgba(110,231,255,0.12)] ${
          live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:bg-cyan/20" : ""
        }`}
        onMouseEnter={() => {
          onTip?.("DRONE LOG // replacement still failed");
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
        animate={{ y: [0, -5, 0], x: [0, 6, 18, 18, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, times: [0, 0.15, 0.35, 0.55, 0.75, 1] }}
        aria-label={interactive ? "Inspect drone memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="absolute -top-2 left-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute -top-2 right-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute inset-x-2 bottom-1.5 h-1 bg-white/25" />
        <div className="absolute inset-x-3 top-3 h-px bg-cyan/30" />
      </motion.button>

      <motion.div
        className="absolute -right-14 top-[-6px] h-5 w-5 rounded-full border border-white/25"
        animate={{
          backgroundColor: ["#6ee7ff", "#ffb020", "#6ee7ff", "#ffb020", "#ff4d6d", "#ffb020"],
          boxShadow: [
            "0 0 10px #6ee7ff",
            "0 0 10px #ffb020",
            "0 0 10px #6ee7ff",
            "0 0 10px #ffb020",
            "0 0 14px #ff4d6d",
            "0 0 10px #ffb020",
          ],
          scale: [1, 1, 1.05, 1, 0.9, 1],
        }}
        transition={{ duration: 5.5, times: [0, 0.2, 0.4, 0.55, 0.72, 1], repeat: Infinity }}
      />

      <motion.button
        type="button"
        className={`mt-3 border border-system-warn/40 bg-black/65 px-2 py-1 font-mono text-[9px] tracking-[0.22em] text-system-warn ${
          live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:text-cyan" : "pointer-events-none"
        }`}
        animate={{ opacity: [0, 1, 1, 0.85, 1], x: [0, 0, 0, 2, 0] }}
        transition={{ duration: 5.5, times: [0, 0.18, 0.55, 0.78, 1], repeat: Infinity }}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect REPLACEMENT FAILED memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        REPLACEMENT FAILED
      </motion.button>
      <motion.div
        className="mt-1 font-mono text-[8px] tracking-[0.16em] text-mist/55"
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 5.5, times: [0, 0.45, 0.55, 0.85, 1], repeat: Infinity }}
      >
        RETRY // ALSO FAILED
      </motion.div>
    </motion.div>
  );
}
