"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { audio } from "@/lib/audio";

/** REPLACEMENT FAILED — Phase 3 richer motion; P2 clickable memo label. */
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
  const leftPct = Number.parseFloat(String(slot?.left ?? "78"));
  const topPct = Number.parseFloat(String(slot?.top ?? "76"));
  // Right-edge pins: anchor from `right` so the outline box never clips to "REPLACEM".
  const nearRight = Number.isFinite(leftPct) && leftPct >= 68;
  const pinStyle: CSSProperties = nearRight
    ? {
        left: "auto",
        right: `${Math.max(2, Math.min(28, 100 - leftPct))}%`,
        top: slot?.top ?? `${topPct}%`,
        transformOrigin: "right top",
      }
    : {
        ...(slot ?? { left: "78%", top: "76%" }),
        transformOrigin: "left top",
      };

  return (
    <motion.div
      className="pointer-events-none absolute w-[10.5rem]"
      style={pinStyle}
      initial={{ opacity: 0, x: nearRight ? 16 : -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: nearRight ? 12 : -12 }}
      transition={{ duration: 0.8 }}
      data-roam-egg="drone"
      data-replacement-failed="true"
      data-drone-edge={nearRight ? "right" : "left"}
    >
      {/* Own outline box — text stays inside; never slides under form panels. */}
      <div
        className="relative overflow-hidden rounded-sm border border-system-warn/45 bg-black/80 px-2 pb-2 pt-1.5 shadow-[0_0_14px_rgba(0,0,0,0.55)]"
        data-replacement-outline="true"
      >
        <motion.button
          type="button"
          className={`relative mx-auto block h-9 w-[4.25rem] rounded-md border border-cyan/45 bg-[#132033]/96 shadow-[0_0_18px_rgba(110,231,255,0.12)] ${
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
          animate={{ y: [0, -4, 0] }}
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
          className="absolute right-2 top-1 h-4 w-4 rounded-full border border-white/25"
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
          className={`mt-2 block w-full truncate border border-system-warn/40 bg-black/50 px-1.5 py-1 text-center font-mono text-[9px] tracking-[0.14em] text-system-warn ${
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
          className="mt-1 w-full truncate text-center font-mono text-[8px] tracking-[0.12em] text-mist/55"
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 5.5, times: [0, 0.45, 0.55, 0.85, 1], repeat: Infinity }}
        >
          RETRY // ALSO FAILED
        </motion.div>
      </div>
    </motion.div>
  );
}
