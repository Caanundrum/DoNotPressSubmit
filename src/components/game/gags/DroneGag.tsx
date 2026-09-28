"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { audio } from "@/lib/audio";

/**
 * REPLACEMENT FAILED — wordless idle drone prop (P0 #11 / #12).
 *
 * Idle: shape + motion only — no readable wallpaper.
 * Click: comedy label flashes inside the outline (then clears) + parent toast.
 *
 * Pathing contract (P0):
 * - Outline box stays ≥3% inside the viewport (no bottom/edge clip).
 * - Right-edge pins use `right`; near-bottom pins use `bottom`.
 * - Scene slots (DRONE_PATH_SLOTS) keep the box clear of forms, CTAs, and the orb.
 * - When gag text is visible, full "REPLACEMENT FAILED" + "RETRY // ALSO FAILED" stay inside the outline.
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
  const [gagOpen, setGagOpen] = useState(false);
  const leftPct = Number.parseFloat(String(slot?.left ?? "72"));
  const topPct = Number.parseFloat(String(slot?.top ?? "68"));
  const safeLeft = Number.isFinite(leftPct) ? leftPct : 72;
  const safeTop = Number.isFinite(topPct) ? topPct : 68;

  // Stamp footprint ≈ 200×118px → ~15.6vw × 14.8vh @ 1280×800.
  // Near-right: pin with `right` so the box grows left (never clips).
  // Near-bottom: pin with `bottom` so height never spills past the floor.
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

  useEffect(() => {
    if (!gagOpen) return;
    const t = window.setTimeout(() => setGagOpen(false), 2400);
    return () => window.clearTimeout(t);
  }, [gagOpen]);

  const fireGag = (e: MouseEvent) => {
    e.stopPropagation();
    setGagOpen(true);
    onReact?.();
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
      data-drone-gag={gagOpen ? "open" : "idle"}
    >
      {/* Own outline box — wordless idle; gag copy only after click. */}
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
            onTip?.(null);
            if (live) audio.play("hover", 0.12);
          }}
          onMouseLeave={() => onTip?.(null)}
          onClick={interactive ? fireGag : undefined}
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

        {/* Idle: abstract warn bars. Click: comedy labels inside outline, then clear. */}
        {gagOpen ? (
          <motion.button
            type="button"
            className={`mt-1.5 block w-full whitespace-normal border border-system-warn/40 bg-black/50 px-1.5 py-1 text-center font-mono text-[8px] leading-tight tracking-[0.12em] text-system-warn ${
              live ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={interactive ? fireGag : undefined}
            aria-label={interactive ? "Inspect REPLACEMENT FAILED memo" : undefined}
            tabIndex={interactive ? 0 : -1}
            data-drone-gag-copy="true"
          >
            REPLACEMENT FAILED
            <span className="mt-0.5 block w-full whitespace-nowrap text-center font-mono text-[7px] tracking-[0.1em] text-mist/55">
              RETRY // ALSO FAILED
            </span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            className={`mt-1.5 flex w-full flex-col items-center gap-1 border border-system-warn/25 bg-black/35 px-1.5 py-1.5 ${
              live ? "pointer-events-auto cursor-pointer hover:border-cyan/40" : "pointer-events-none"
            }`}
            animate={{ opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 5.5, repeat: Infinity }}
            onClick={interactive ? fireGag : undefined}
            aria-label={interactive ? "Inspect drone memo" : undefined}
            tabIndex={interactive ? 0 : -1}
            data-drone-idle-glyph="true"
          >
            <span className="h-1 w-[70%] rounded-full bg-system-warn/55" />
            <span className="h-0.5 w-[45%] rounded-full bg-mist/35" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
