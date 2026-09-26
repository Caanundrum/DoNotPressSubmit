"use client";

import { AnimatePresence, motion } from "framer-motion";

export type GlassPhase = "idle" | "crack" | "stitch";

/**
 * Poke-driven facility glass: readable spiderweb shatter, then chrome-tape stitch.
 * Purely visual — never blocks CTAs.
 * Renders BEHIND the assessment panel (form owns readable Q/A) so cracks never bury copy.
 * Parent owns phase timing; idle clears all fracture lines (flags must not re-show crack).
 */
export function GlassStitchOverlay({
  phase,
  ticket = false,
}: {
  phase: GlassPhase;
  /** Late poke: orb "files a ticket" stamp — only while stitch ladder is visible */
  ticket?: boolean;
}) {
  const showFracture = phase === "crack" || phase === "stitch";
  const healing = phase === "stitch";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[22] overflow-hidden"
      aria-hidden
      data-glass-phase={phase}
      data-glass-behind-form="true"
    >
      <AnimatePresence>
        {showFracture ? (
          <motion.svg
            key="glass-fracture"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: healing ? [0.9, 0.45, 0.2] : [0, 1, 0.92],
            }}
            exit={{ opacity: 0, transition: { duration: 0.55 } }}
            transition={{ duration: healing ? 1.1 : 0.45 }}
          >
            <defs>
              <filter id="glass-depth" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.15" result="blur" />
                <feOffset dx="0.15" dy="0.2" result="off" />
                <feMerge>
                  <feMergeNode in="off" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="impact-glow" cx="38%" cy="44%" r="18%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="40%" stopColor="rgba(110,231,255,0.25)" />
                <stop offset="100%" stopColor="rgba(110,231,255,0)" />
              </radialGradient>
            </defs>

            {/* Soft impact bloom */}
            <circle cx="38" cy="44" r="14" fill="url(#impact-glow)" opacity={healing ? 0.35 : 0.7} />

            {/* Dark under-cracks for depth */}
            <g
              fill="none"
              stroke="rgba(4,8,16,0.75)"
              strokeWidth="0.55"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glass-depth)"
            >
              <path d="M38 44 L31 28 L22 18 L18 8" />
              <path d="M38 44 L48 29 L61 18 L72 9" />
              <path d="M38 44 L52 48 L71 42 L88 36" />
              <path d="M38 44 L46 58 L54 74 L58 92" />
              <path d="M38 44 L28 56 L16 68 L8 82" />
              <path d="M38 44 L24 40 L11 34 L3 28" />
            </g>

            {/* Bright fracture edges — jagged spiderweb, not HUD rulers */}
            <g
              fill="none"
              stroke="rgba(230,245,255,0.92)"
              strokeWidth="0.38"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M38 44 L33.5 31 L27 21 L22 18 L18.5 11 L16 6" />
              <path d="M38 44 L44 34 L51 26 L61 18 L68 12 L74 7" />
              <path d="M38 44 L47 46 L58 45 L71 42 L82 38 L91 34" />
              <path d="M38 44 L43 53 L49 64 L54 74 L57 84 L59 94" />
              <path d="M38 44 L31 52 L22 61 L16 68 L11 76 L6 86" />
              <path d="M38 44 L29 41 L18 37 L11 34 L5 30 L1 26" />
            </g>

            {/* Secondary branches / spiderweb forks */}
            <g
              fill="none"
              stroke="rgba(170,210,240,0.72)"
              strokeWidth="0.28"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M27 21 L21 24 L15 22" />
              <path d="M27 21 L30 15 L28 9" />
              <path d="M51 26 L56 22 L55 15" />
              <path d="M51 26 L55 32 L62 31" />
              <path d="M58 45 L62 52 L68 50" />
              <path d="M58 45 L64 40 L70 42" />
              <path d="M49 64 L44 68 L45 76" />
              <path d="M49 64 L55 66 L58 72" />
              <path d="M22 61 L18 58 L12 60" />
              <path d="M22 61 L26 66 L24 74" />
              <path d="M18 37 L14 42 L8 41" />
              <path d="M33.5 31 L38 28 L41 31" />
              <path d="M43 53 L48 52 L50 56" />
              <path d="M71 42 L76 46 L82 44" />
            </g>

            {/* Tertiary hairlines */}
            <g
              fill="none"
              stroke="rgba(110,231,255,0.45)"
              strokeWidth="0.18"
              strokeLinecap="round"
            >
              <path d="M22 18 L19 14" />
              <path d="M61 18 L65 14" />
              <path d="M54 74 L59 78" />
              <path d="M16 68 L12 72" />
              <path d="M11 34 L7 31" />
              <path d="M82 38 L87 41" />
              <path d="M44 34 L47 30" />
              <path d="M31 52 L28 55" />
            </g>

            {/* Impact star / chip */}
            <g>
              <circle cx="38" cy="44" r="1.6" fill="rgba(255,255,255,0.75)" />
              <circle
                cx="38"
                cy="44"
                r="3.4"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="0.3"
              />
              <path
                d="M38 40.2 L38.7 42.8 L41.4 42.8 L39.2 44.4 L40 47 L38 45.4 L36 47 L36.8 44.4 L34.6 42.8 L37.3 42.8 Z"
                fill="rgba(200,235,255,0.35)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.15"
              />
            </g>
          </motion.svg>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "crack" ? (
          <motion.div
            key="crack-flash"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            style={{
              background:
                "radial-gradient(ellipse at 38% 44%, rgba(255,255,255,0.28), rgba(110,231,255,0.12) 35%, transparent 58%)",
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
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            data-glass-stitch="true"
          >
            {/* Tape strips stitch along major fracture rays */}
            <motion.div
              className="absolute left-[22%] top-[22%] h-3.5 w-[26%] rotate-[-32deg] border border-cyan/70 bg-gradient-to-r from-cyan/45 via-white/40 to-cyan/25 shadow-[0_0_18px_rgba(110,231,255,0.55)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[38%] top-[40%] h-3 w-[28%] rotate-[6deg] border border-white/55 bg-gradient-to-r from-white/45 via-cyan/30 to-white/15 shadow-[0_0_14px_rgba(255,255,255,0.25)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.48, delay: 0.12, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[28%] top-[52%] h-3 w-[24%] rotate-[38deg] border border-cyan/55 bg-gradient-to-r from-cyan/40 via-white/28 to-transparent shadow-[0_0_12px_rgba(110,231,255,0.4)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute left-[18%] top-[40%] h-2.5 w-[20%] rotate-[-8deg] border border-cyan/50 bg-gradient-to-r from-cyan/30 via-white/20 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
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
        {ticket && phase === "stitch" ? (
          <motion.div
            key="ticket"
            className="absolute right-[4%] top-[8%] rotate-[6deg] border border-system-warn/70 bg-black/80 px-3 py-2 font-mono text-[9px] tracking-[0.14em] text-[#ffd27a] shadow-[0_0_14px_rgba(255,178,70,0.35)]"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            data-glass-ticket="true"
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
