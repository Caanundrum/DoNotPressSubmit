"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { audio } from "@/lib/audio";

/**
 * REPLACEMENT FAILED — Phase 3 richer motion; P2 clickable memo label.
 *
 * Pathing contract (P0):
 * - Full "REPLACEMENT FAILED" + "RETRY // ALSO FAILED" stay inside the outline box.
 * - Box stays ≥3% inside the viewport (no bottom/edge clip).
 * - Right-edge pins use `right`; near-bottom pins use `bottom` so height never spills.
 * - Scene slots (DRONE_PATH_SLOTS) keep the box clear of forms, CTAs, and the orb.
 */
export function DroneGag({
  interactive,
  onTip,
  onReact,
  slot,
}: {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
  /** Roaming anchor — relocates between appearances (not opacity-only). */
  slot?: CSSProperties;
}) {
  const live = !!interactive;
  const leftPct = Number.parseFloat(String(slot?.left ?? "72"));
  const topPct = Number.parseFloat(String(slot?.top ?? "68"));
  const safeLeft = Number.isFinite(leftPct) ? leftPct : 72;
  const safeTop = Number.isFinite(topPct) ? topPct : 68;

  // Stamp footprint ≈ 200×118px → ~15.6vw × 14.8vh @ 1280×800.
  // Near-right: pin with `right` so the box grows left (never clips to "REPL").
  // Near-bottom: pin with `bottom` so RETRY // ALSO FAILED never clips.
  const nearRight = safeLeft >= 55;
  const nearBottom = safeTop >= 58;
  const rightPct = Math.max(2.5, Math.min(30, 100 - safeLeft));
  // Keep ≥3% floor clearance even when slot top is aggressive.
  const bottomPct = nearBottom
    ? Math.max(3, Math.min(22, 100 - safeTop - 15))
    : 3;

  const pinStyle: CSSProperties = {
    left: nearRight ? "auto" : `${Math.max(2, Math.min(78, safeLeft))}%`,
    right: nearRight ? `${rightPct}%` : "auto",
    top: nearBottom ? "auto" : `${Math.max(2, Math.min(72, safeTop))}%`,
    bottom: nearBottom ? `${bottomPct}%` : "auto",
    transformOrigin: nearRight ? "right top" : "left top",
    maxWidth: "min(12.5rem, 22vw)",
  };

  return (
    <motion.div
      className="pointer-events-none absolute w-[12.5rem]"
      style={pinStyle}
      initial={{ opacity: 0, x: nearRight ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: nearRight ? 10 : -10 }}
      transition={{ duration: 0.75 }}
      data-roam-egg="drone"
      data-replacement-failed="true"
      data-drone-edge={nearRight ? "right" : "left"}
      data-drone-floor={nearBottom ? "bottom" : "top"}
    >
      {/* Own outline box — text stays inside; never slides under form panels. */}
      <div
        className="relative overflow-hidden rounded-sm border border-system-warn/45 bg-black/80 px-2 pb-1.5 pt-1.5 shadow-[0_0_14px_rgba(0,0,0,0.55)]"
        data-replacement-outline="true"
      >
        <motion.button
          type="button"
          className={`relative mx-auto block h-8 w-[4rem] rounded-md border border-cyan/45 bg-[#132033]/96 shadow-[0_0_18px_rgba(110,231,255,0.12)] ${
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
          // Small bob only — no long lateral slide that crosses the orb / under forms.
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          aria-label={interactive ? "Inspect drone memo" : undefined}
          tabIndex={interactive ? 0 : -1}
        >
          <div className="absolute -top-2 left-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
          <div className="absolute -top-2 right-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
          <div className="absolute inset-x-2 bottom-1.5 h-1 bg-white/25" />
          <div className="absolute inset-x-3 top-3 h-px bg-cyan/30" />
        </motion.button>

        <motion.div
          className="absolute right-2 top-1 h-3.5 w-3.5 rounded-full border border-white/25"
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
          className={`mt-1.5 block w-full whitespace-normal border border-system-warn/40 bg-black/50 px-1.5 py-1 text-center font-mono text-[8px] leading-tight tracking-[0.12em] text-system-warn ${
            live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:text-cyan" : "pointer-events-none"
          }`}
          animate={{ opacity: [0.85, 1, 1, 0.9, 1] }}
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
          title="REPLACEMENT FAILED"
        >
          REPLACEMENT FAILED
        </motion.button>
        <motion.div
          className="mt-0.5 w-full whitespace-nowrap text-center font-mono text-[7px] tracking-[0.1em] text-mist/55"
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 5.5, times: [0, 0.45, 0.55, 0.85, 1], repeat: Infinity }}
        >
          RETRY // ALSO FAILED
        </motion.div>
      </div>
    </motion.div>
  );
}
