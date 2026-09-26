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
      style={{
        // Yield over the form column — fracture stays in facility margins/left stage.
        WebkitMaskImage:
          "linear-gradient(90deg, #000 0%, #000 52%, rgba(0,0,0,0.35) 68%, transparent 82%), linear-gradient(180deg, #000 0%, #000 72%, rgba(0,0,0,0.4) 88%, transparent 100%)",
        maskImage:
          "linear-gradient(90deg, #000 0%, #000 52%, rgba(0,0,0,0.35) 68%, transparent 82%), linear-gradient(180deg, #000 0%, #000 72%, rgba(0,0,0,0.4) 88%, transparent 100%)",
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
    >
      <AnimatePresence>
        {showFracture ? (
          <motion.svg
            key="glass-fracture"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            initial={{ opacity: 0 }}
            animate={{
              opacity: healing ? [0.95, 0.4, 0.15] : [0, 1, 0.94],
            }}
            exit={{ opacity: 0, transition: { duration: 0.55 } }}
            transition={{ duration: healing ? 1.1 : 0.45 }}
          >
            <defs>
              <filter id="glass-depth" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="blur" />
                <feOffset dx="0.2" dy="0.25" result="off" />
                <feMerge>
                  <feMergeNode in="off" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="impact-glow" cx="34%" cy="42%" r="22%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                <stop offset="35%" stopColor="rgba(110,231,255,0.28)" />
                <stop offset="100%" stopColor="rgba(110,231,255,0)" />
              </radialGradient>
            </defs>

            <circle cx="34" cy="42" r="16" fill="url(#impact-glow)" opacity={healing ? 0.3 : 0.75} />

            {/* Dark under-cracks */}
            <g
              fill="none"
              stroke="rgba(4,8,16,0.8)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="miter"
              filter="url(#glass-depth)"
            >
              <path d="M34 42 L30 33 L24 24 L19 16 L14 9 L11 4" />
              <path d="M34 42 L41 34 L49 27 L58 19 L67 12 L76 6" />
              <path d="M34 42 L44 44 L55 43 L66 39 L78 35 L90 31" />
              <path d="M34 42 L39 52 L45 63 L50 74 L54 85 L56 96" />
              <path d="M34 42 L26 51 L17 60 L11 69 L6 79 L2 90" />
              <path d="M34 42 L24 39 L14 35 L7 30 L2 24" />
              <path d="M34 42 L38 36 L42 29 L40 21 L44 14" />
              <path d="M34 42 L28 45 L22 48 L18 55 L12 58" />
            </g>

            {/* Bright jagged spiderweb — many kinks so it reads as shatter, not HUD rulers */}
            <g
              fill="none"
              stroke="rgba(235,248,255,0.95)"
              strokeWidth="0.42"
              strokeLinecap="round"
              strokeLinejoin="miter"
            >
              <path d="M34 42 L31.2 35.5 L27.5 29 L24 24.2 L20.5 18 L17.8 12.5 L14.2 7 L11 3.5" />
              <path d="M34 42 L38.5 36.5 L43 32 L49 27.5 L55.5 21.5 L62 16 L69 11 L75.5 6.5" />
              <path d="M34 42 L40.5 43.2 L48 44 L56 42.5 L64 40 L73 36.5 L82 33 L91 29.5" />
              <path d="M34 42 L37.5 49 L41.5 56.5 L46 64 L50 72.5 L53 81 L55.5 89 L57 97" />
              <path d="M34 42 L28.5 48.5 L22.5 55 L17 61.5 L12.5 68 L8 76 L4.5 84 L1.5 92" />
              <path d="M34 42 L27.5 40 L20 37.5 L13.5 34 L8 30 L3.5 25 L0.5 21" />
              <path d="M34 42 L37 37.5 L40.5 32 L39 26.5 L42.5 21 L41 15.5 L45 10" />
              <path d="M34 42 L29.5 45.5 L24 48 L20.5 53.5 L15 56 L11 61.5 L6 64" />
            </g>

            {/* Secondary forks */}
            <g
              fill="none"
              stroke="rgba(175,215,245,0.78)"
              strokeWidth="0.3"
              strokeLinecap="round"
              strokeLinejoin="miter"
            >
              <path d="M24 24.2 L19.5 26.5 L14 24.8 L11 28" />
              <path d="M24 24.2 L26.5 19 L25 13.5 L28 10" />
              <path d="M49 27.5 L53.5 24 L53 17.5 L57 14" />
              <path d="M49 27.5 L53 32.5 L59 31 L62 36" />
              <path d="M56 42.5 L60 48.5 L67 47 L70 53" />
              <path d="M56 42.5 L62 38 L68 40.5 L74 37" />
              <path d="M46 64 L41.5 68 L42.5 76 L37 78" />
              <path d="M46 64 L52 66.5 L55 73 L61 74" />
              <path d="M17 61.5 L13 58 L7 60.5 L4 55" />
              <path d="M17 61.5 L21 67 L19 74 L24 78" />
              <path d="M13.5 34 L9.5 38.5 L4 37 L1 42" />
              <path d="M31.2 35.5 L35 32.5 L38 35.5 L41 31" />
              <path d="M41.5 56.5 L46.5 55 L48.5 60 L53 58" />
              <path d="M73 36.5 L78 41 L85 39 L88 44" />
              <path d="M40.5 32 L44 34.5 L47 30" />
              <path d="M28.5 48.5 L25 52 L28 56" />
            </g>

            {/* Tertiary hairlines */}
            <g fill="none" stroke="rgba(110,231,255,0.5)" strokeWidth="0.18" strokeLinecap="round">
              <path d="M20.5 18 L17 14.5" />
              <path d="M58 19 L62.5 15" />
              <path d="M50 74 L55 78.5" />
              <path d="M12.5 68 L8 72" />
              <path d="M8 30 L4 26.5" />
              <path d="M82 33 L87 36.5" />
              <path d="M43 32 L46.5 28" />
              <path d="M22.5 55 L19 58.5" />
              <path d="M37 37.5 L40 40" />
              <path d="M64 40 L68 43.5" />
            </g>

            {/* Impact star / chip */}
            <g>
              <circle cx="34" cy="42" r="1.7" fill="rgba(255,255,255,0.85)" />
              <circle
                cx="34"
                cy="42"
                r="3.6"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="0.32"
              />
              <path
                d="M34 37.8 L34.8 40.8 L38 40.8 L35.5 42.6 L36.4 45.6 L34 43.8 L31.6 45.6 L32.5 42.6 L30 40.8 L33.2 40.8 Z"
                fill="rgba(200,235,255,0.4)"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="0.16"
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
