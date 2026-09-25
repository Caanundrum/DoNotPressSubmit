"use client";

import { motion } from "framer-motion";
import { audio } from "@/lib/audio";

/** Printer — Phase 3 paper cascade + scissors drone; P2 clickable SCISSORS label. */
export function PrinterGag({
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
      className="pointer-events-none absolute bottom-[10%] left-[54%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className={`relative h-14 w-24 border border-white/25 bg-[#182235]/92 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
          live
            ? "pointer-events-auto cursor-pointer hover:border-cyan/50 hover:bg-[#1c2a42]"
            : ""
        }`}
        onMouseEnter={() => {
          onTip?.("PRINT QUEUE // scissors en route");
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
        aria-label={interactive ? "Inspect printer" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="m-1.5 h-2.5 bg-cyan/35" />
        <div className="mx-2 mt-2 h-1 bg-white/25" />
        <div className="mx-3 mt-1.5 h-1 bg-white/15" />
        <motion.div
          className="absolute -right-1 top-2 h-2 w-2 rounded-full bg-system-warn"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </button>

      <motion.div
        className="ml-4 origin-top bg-gradient-to-b from-white/95 to-white/70 shadow-[2px_0_8px_rgba(0,0,0,0.25)]"
        style={{ width: 30 }}
        animate={{ height: [10, 70, 140, 170] }}
        transition={{ duration: 7, ease: "easeInOut", times: [0, 0.35, 0.7, 1] }}
      >
        <div className="space-y-2 p-1 opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-px bg-[#9aa6b8]/70" />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute left-[7.5rem] top-[9.5rem] h-3 w-16 origin-left bg-white/80"
        initial={{ scaleX: 0, rotate: 0 }}
        animate={{ scaleX: [0, 0, 1], rotate: [0, 0, 12] }}
        transition={{ duration: 7, times: [0, 0.65, 1] }}
      />

      <motion.div
        className="absolute left-[9rem] top-[2.5rem] flex items-center gap-1"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: [0, 0, 1, 1], x: [40, 40, 0, -8] }}
        transition={{ duration: 7, times: [0, 0.55, 0.7, 1] }}
      >
        <div className="h-4 w-6 rounded-sm border border-cyan/40 bg-[#1a2838]" />
        <div className="relative h-3 w-4">
          <div className="absolute left-0 top-0 h-2 w-2 rounded-full border border-danger/70" />
          <div className="absolute right-0 top-0 h-2 w-2 rounded-full border border-danger/70" />
          <div className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-danger/70" />
        </div>
      </motion.div>

      <motion.button
        type="button"
        className={`mt-2 border border-cyan/25 bg-black/55 px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-mist/75 ${
          live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:text-cyan" : "pointer-events-none"
        }`}
        animate={{ opacity: [0, 0, 1, 1, 0.6] }}
        transition={{ duration: 7, times: [0, 0.4, 0.55, 0.85, 1] }}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect SCISSORS EN ROUTE memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        SCISSORS EN ROUTE
      </motion.button>
    </motion.div>
  );
}
