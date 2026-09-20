"use client";

import { motion } from "framer-motion";
import type { EnvironmentPreset } from "@/game/types";

export type TransitionFamily =
  | "mechanical"
  | "glass"
  | "glitch"
  | "blackout"
  | "push"
  | "dissolve"
  | "system-force";

/** Pick an authored transition family from narrative environment. */
export function transitionForEnvironment(
  environment: EnvironmentPreset | undefined,
  kind?: string,
): TransitionFamily {
  if (kind === "system") return "system-force";
  if (kind === "ending") return "blackout";
  switch (environment) {
    case "conflict":
      return "glitch";
    case "reveal":
      return "glass";
    case "climax":
      return "push";
    case "sterile":
      return "blackout";
    case "escape":
      return "dissolve";
    case "anomaly":
      return "mechanical";
    default:
      return "mechanical";
  }
}

const STATUS: Record<TransitionFamily, string> = {
  mechanical: "HERDING CONTROLS…",
  glass: "RESEATING THE VIEW…",
  glitch: "CONTAINMENT RECALIBRATING…",
  blackout: "LOADING COMPLIANCE…",
  push: "PUSHING THE NEXT FORM…",
  dissolve: "SWEEPING RESIDUE…",
  "system-force": "SYSTEM OVERRIDE IN PROGRESS…",
};

function StatusLine({ family }: { family: TransitionFamily }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-[18%] z-[49] flex justify-center"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }}
      transition={{ duration: 0.55, times: [0, 0.15, 0.7, 1] }}
      aria-hidden
    >
      <span className="border border-cyan/35 bg-black/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-cyan/90">
        {STATUS[family]}
      </span>
    </motion.div>
  );
}

/**
 * Full-viewport authored scene transition.
 * Brief (≈0.4–0.55s), pointer-events none, no scrollbars.
 * Diegetic status line so multi-beat anims never read as a dead blank.
 */
export function SceneTransition({
  family,
  reducedMotion = false,
}: {
  family: TransitionFamily;
  reducedMotion?: boolean;
}) {
  if (reducedMotion) {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-[48] bg-black"
        initial={{ opacity: 0.45 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        aria-hidden
      >
        <StatusLine family={family} />
      </motion.div>
    );
  }

  switch (family) {
    case "glitch":
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-[rgba(255,77,109,0.12)] mix-blend-screen"
            animate={{ x: [0, -6, 4, -2, 0], opacity: [0.6, 1, 0.4, 0.9, 0] }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent 0 8px, rgba(110,231,255,0.08) 8px 9px)",
            }}
            animate={{ x: [0, 12, -8, 0], opacity: [0.8, 1, 0.5, 0] }}
            transition={{ duration: 0.42 }}
          />
          <div className="chromatic-flash absolute inset-0" />
          <StatusLine family={family} />
        </motion.div>
      );

    case "glass":
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden"
          aria-hidden
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-[55%] origin-left border-r border-cyan/30 bg-[#0a1220]/85 backdrop-blur-md"
            initial={{ rotateY: 0, x: 0, opacity: 1 }}
            animate={{ rotateY: -72, x: "-12%", opacity: 0 }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-[55%] origin-right border-l border-white/20 bg-[#0c1524]/8 backdrop-blur-md"
            initial={{ rotateY: 0, x: 0, opacity: 1 }}
            animate={{ rotateY: 72, x: "12%", opacity: 0 }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          />
          <StatusLine family={family} />
        </motion.div>
      );

    case "blackout":
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          aria-hidden
        >
          <StatusLine family={family} />
        </motion.div>
      );

    case "push":
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden"
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_55%,rgba(255,77,109,0.35),transparent_50%),#05070c]"
            initial={{ scale: 1.15, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="light-sweep absolute inset-y-0 left-0 w-1/3"
            initial={{ x: "-40%", opacity: 0.9 }}
            animate={{ x: "220%", opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
          <StatusLine family={family} />
        </motion.div>
      );

    case "dissolve":
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden"
          aria-hidden
        >
          {[...Array(12)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-cyan/70"
              style={{
                left: `${8 + (i * 7) % 84}%`,
                top: `${12 + (i * 13) % 70}%`,
              }}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 0.2, y: -40 - (i % 5) * 8 }}
              transition={{ duration: 0.42, delay: i * 0.02 }}
            />
          ))}
          <motion.div
            className="absolute inset-0 bg-[rgba(80,255,200,0.08)]"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
          <StatusLine family={family} />
        </motion.div>
      );

    case "system-force":
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden bg-white"
          initial={{ opacity: 0.95 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-x-[8%] top-[42%] h-px bg-black/40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
          <StatusLine family={family} />
        </motion.div>
      );

    case "mechanical":
    default:
      return (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden"
          aria-hidden
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-[42%] border-b border-cyan/25 bg-[#070d16]/92"
            initial={{ y: 0 }}
            animate={{ y: "-105%" }}
            transition={{ duration: 0.45, ease: [0.45, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[42%] border-t border-white/15 bg-[#050910]/92"
            initial={{ y: 0 }}
            animate={{ y: "105%" }}
            transition={{ duration: 0.45, ease: [0.45, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute left-[6%] top-[46%] h-1 w-16 rounded bg-cyan/50"
            initial={{ opacity: 1, scaleX: 1 }}
            animate={{ opacity: 0, scaleX: 0.2 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          />
          <StatusLine family={family} />
        </motion.div>
      );
  }
}
