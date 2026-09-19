"use client";

import { AnimatePresence, motion } from "framer-motion";

export type GlassPhase = "idle" | "crack" | "stitch";

/**
 * Poke-driven facility glass: crack on thresholds, then chrome-tape stitch apology.
 * Purely visual — never blocks CTAs. Parent owns phase timing.
 * Renders ABOVE the assessment panel so cracks/tape are unmistakable.
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
    <div className="pointer-events-none absolute inset-0 z-[36] overflow-hidden" aria-hidden>
      <AnimatePresence>
        {cracked ? (
          <motion.svg
            key="cracks"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "crack" ? [0.75, 1, 0.85] : 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <path
              d="M18 12 L42 48 L28 92"
              fill="none"
              stroke="rgba(200,230,255,0.85)"
              strokeWidth="0.55"
            />
            <path
              d="M42 48 L78 22 L92 60"
              fill="none"
              stroke="rgba(180,220,255,0.7)"
              strokeWidth="0.45"
            />
            <path
              d="M52 8 L48 40 L66 70 L40 88"
              fill="none"
              stroke="rgba(255,180,200,0.65)"
              strokeWidth="0.4"
            />
            <path
              d="M10 55 L35 58 L55 40"
              fill="none"
              stroke="rgba(110,231,255,0.7)"
              strokeWidth="0.38"
            />
            <path
              d="M70 70 L88 88 M74 82 L92 74"
              fill="none"
              stroke="rgba(255,210,140,0.55)"
              strokeWidth="0.32"
            />
            {/* Impact star at primary fracture */}
            <circle cx="42" cy="48" r="1.2" fill="rgba(255,255,255,0.55)" />
            <circle cx="42" cy="48" r="2.8" fill="none" stroke="rgba(110,231,255,0.45)" strokeWidth="0.25" />
          </motion.svg>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "crack" ? (
          <motion.div
            key="crack-flash"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.12] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              background:
                "radial-gradient(ellipse at 42% 48%, rgba(110,231,255,0.22), transparent 55%)",
            }}
          />
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
              className="absolute left-[14%] top-[18%] h-3.5 w-[30%] rotate-[-18deg] border border-cyan/70 bg-gradient-to-r from-cyan/40 via-white/35 to-cyan/25 shadow-[0_0_18px_rgba(110,231,255,0.55)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[48%] top-[42%] h-3 w-[24%] rotate-[12deg] border border-white/55 bg-gradient-to-r from-white/40 via-cyan/30 to-white/15 shadow-[0_0_14px_rgba(255,255,255,0.25)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[30%] top-[68%] h-3 w-[28%] rotate-[-8deg] border border-cyan/55 bg-gradient-to-r from-cyan/35 via-white/25 to-transparent shadow-[0_0_12px_rgba(110,231,255,0.4)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.28, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            {/* Chrome suture across the title strip */}
            <motion.div
              className="absolute left-[2%] right-[2%] top-[3%] h-2 border-y border-cyan/50 bg-gradient-to-r from-transparent via-cyan/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "center" }}
            />
            <motion.div
              className="absolute right-[10%] top-[10%] max-w-[260px] border border-cyan/55 bg-black/80 px-2.5 py-2 font-mono text-[10px] tracking-[0.16em] text-cyan shadow-[0_0_16px_rgba(110,231,255,0.35)]"
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
            className="absolute right-[4%] top-[8%] rotate-[6deg] border border-system-warn/70 bg-black/80 px-3 py-2 font-mono text-[9px] tracking-[0.14em] text-[#ffd27a] shadow-[0_0_14px_rgba(255,178,70,0.35)]"
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
