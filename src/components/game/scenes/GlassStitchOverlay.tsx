"use client";

import { AnimatePresence, motion } from "framer-motion";

export type GlassPhase = "idle" | "crack" | "stitch";

/**
 * Poke-driven facility glass: crack on thresholds, then chrome-tape stitch apology.
 * Purely visual — never blocks CTAs. Parent owns phase timing.
 */
export function GlassStitchOverlay({
  phase,
  ticket = false,
}: {
  phase: GlassPhase;
  /** Late poke: orb "files a ticket" stamp */
  ticket?: boolean;
}) {
  const cracked = phase === "crack" || phase === "stitch";

  return (
    <div className="pointer-events-none absolute inset-0 z-[28] overflow-hidden" aria-hidden>
      <AnimatePresence>
        {cracked ? (
          <motion.svg
            key="cracks"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "crack" ? [0.55, 0.95, 0.7] : 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <path
              d="M18 12 L42 48 L28 92"
              fill="none"
              stroke="rgba(200,230,255,0.55)"
              strokeWidth="0.35"
            />
            <path
              d="M42 48 L78 22 L92 60"
              fill="none"
              stroke="rgba(180,220,255,0.4)"
              strokeWidth="0.28"
            />
            <path
              d="M52 8 L48 40 L66 70 L40 88"
              fill="none"
              stroke="rgba(255,180,200,0.35)"
              strokeWidth="0.25"
            />
            <path
              d="M10 55 L35 58 L55 40"
              fill="none"
              stroke="rgba(110,231,255,0.35)"
              strokeWidth="0.22"
            />
          </motion.svg>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "stitch" ? (
          <motion.div
            key="tape"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute left-[14%] top-[18%] h-3 w-[28%] rotate-[-18deg] border border-cyan/50 bg-gradient-to-r from-cyan/25 via-white/20 to-cyan/15 shadow-[0_0_12px_rgba(110,231,255,0.35)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[48%] top-[42%] h-2.5 w-[22%] rotate-[12deg] border border-white/40 bg-gradient-to-r from-white/25 via-cyan/20 to-white/10"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[30%] top-[68%] h-2.5 w-[26%] rotate-[-8deg] border border-cyan/40 bg-gradient-to-r from-cyan/20 via-white/15 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.28, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute right-[12%] top-[12%] max-w-[220px] border border-cyan/40 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.16em] text-cyan/90"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              ASSISTANT // stitching UI // apology pending
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ticket ? (
          <motion.div
            key="ticket"
            className="absolute right-[4%] top-[8%] rotate-[6deg] border border-system-warn/60 bg-black/75 px-3 py-2 font-mono text-[9px] tracking-[0.14em] text-[#ffd27a]"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-[8px] tracking-[0.22em] text-[#ffd27a]/80">FACILITY TICKET</div>
            <div className="mt-1">orb harassment / structural apology</div>
            <div className="mt-1 text-[8px] text-[#c5d3e4]/70">filed by assistant // unauthorized</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
