"use client";

import { AnimatePresence, motion } from "framer-motion";

export type GlassPhase = "idle" | "crack" | "stitch";

/**
 * Top-of-stack full-viewport broken screen overlay (Finding #5):
 * Renders at position: fixed; inset: 0; pointer-events: none; z-[9999] so
 * spiderweb fractures, impact jolt, calibration repair tape, and damage tickets
 * visibly shatter OVER the center form panel, buttons, and AI speech bubble
 * without blocking pointer interaction.
 */
export function GlassStitchOverlay({
  phase,
  ticket = false,
  layerClass = "z-[9999]",
  fullStage = true,
}: {
  phase: GlassPhase;
  /** Late poke: orb "files a ticket" stamp — shown during stitch/ticket phase */
  ticket?: boolean;
  layerClass?: string;
  fullStage?: boolean;
}) {
  const showFracture = phase === "crack" || phase === "stitch";
  const healing = phase === "stitch";

  return (
    <motion.div
      className={`pointer-events-none fixed inset-0 overflow-hidden ${layerClass}`}
      aria-hidden
      data-glass-phase={phase}
      data-glass-top-overlay="true"
      data-glass-full-stage={fullStage ? "true" : "false"}
      animate={
        phase === "crack"
          ? {
              x: [0, -10, 12, -8, 6, -3, 0],
              y: [0, 6, -8, 5, -3, 0],
              scale: [1, 1.012, 0.996, 1],
            }
          : phase === "stitch"
            ? {
                x: [0, -5, 5, -2, 0],
                y: [0, 3, -3, 0],
                scale: 1,
              }
            : { x: 0, y: 0, scale: 1 }
      }
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <AnimatePresence>
        {showFracture ? (
          <motion.svg
            key="glass-fracture"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            initial={{ opacity: 0 }}
            animate={{
              opacity: healing ? [1, 0.88, 0.68] : [0, 1, 0.96],
            }}
            exit={{ opacity: 0, transition: { duration: 0.65 } }}
            transition={{ duration: healing ? 1.2 : 0.22 }}
          >
            <defs>
              <filter id="glass-depth" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
                <feOffset dx="2.5" dy="3" result="off" />
                <feMerge>
                  <feMergeNode in="off" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="impact-glow-main" cx="32%" cy="54%" r="38%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.82)" />
                <stop offset="22%" stopColor="rgba(110,231,255,0.42)" />
                <stop offset="65%" stopColor="rgba(110,231,255,0.12)" />
                <stop offset="100%" stopColor="rgba(110,231,255,0)" />
              </radialGradient>
              <radialGradient id="impact-glow-center" cx="62%" cy="46%" r="32%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="35%" stopColor="rgba(110,231,255,0.24)" />
                <stop offset="100%" stopColor="rgba(110,231,255,0)" />
              </radialGradient>
            </defs>

            {/* Primary impact shockwave near orb + secondary stress node right over the form */}
            <circle
              cx="512"
              cy="486"
              r="290"
              fill="url(#impact-glow-main)"
              opacity={healing ? 0.38 : 0.85}
            />
            <circle
              cx="992"
              cy="414"
              r="240"
              fill="url(#impact-glow-center)"
              opacity={healing ? 0.3 : 0.7}
            />

            {/* Deep dark shadow cracks across full 1600x900 viewport */}
            <g
              fill="none"
              stroke="rgba(2, 6, 14, 0.88)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="miter"
              filter="url(#glass-depth)"
            >
              {/* Primary rays shooting from left/orb across the center & right form panel */}
              <path d="M512 486 L640 438 L795 396 L992 414 L1185 352 L1390 278 L1575 190" />
              <path d="M512 486 L675 512 L860 548 L1055 524 L1260 585 L1465 650 L1590 710" />
              <path d="M512 486 L590 365 L710 260 L865 175 L1040 95 L1210 24" />
              <path d="M512 486 L575 610 L680 715 L820 795 L985 865 L1120 895" />
              <path d="M512 486 L380 410 L245 315 L120 210 L18 95" />
              <path d="M512 486 L360 555 L215 645 L95 745 L12 845" />
              <path d="M512 486 L435 340 L370 195 L310 65 L280 8" />
              <path d="M512 486 L455 640 L395 775 L340 890" />
              {/* Secondary node rays right over the form card (cx=992, cy=414) */}
              <path d="M992 414 L1065 290 L1160 175 L1285 70 L1380 12" />
              <path d="M992 414 L1085 525 L1190 645 L1315 770 L1440 885" />
              <path d="M992 414 L885 310 L780 215 L690 110" />
              <path d="M992 414 L910 555 L835 690 L765 835" />
            </g>

            {/* Razor-bright jagged spiderweb fracture lines */}
            <g
              fill="none"
              stroke="rgba(238, 250, 255, 0.96)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="miter"
            >
              <path d="M512 486 L578 462 L640 438 L718 415 L795 396 L892 408 L992 414 L1088 382 L1185 352 L1290 315 L1390 278 L1488 232 L1575 190" />
              <path d="M512 486 L592 498 L675 512 L768 532 L860 548 L958 534 L1055 524 L1158 556 L1260 585 L1364 618 L1465 650 L1590 710" />
              <path d="M512 486 L552 424 L590 365 L648 312 L710 260 L788 216 L865 175 L952 132 L1040 95 L1210 24" />
              <path d="M512 486 L544 548 L575 610 L628 664 L680 715 L752 756 L820 795 L904 832 L985 865 L1120 895" />
              <path d="M512 486 L446 448 L380 410 L312 362 L245 315 L182 262 L120 210 L18 95" />
              <path d="M512 486 L436 520 L360 555 L288 602 L215 645 L154 696 L95 745 L12 845" />
              <path d="M512 486 L472 412 L435 340 L402 268 L370 195 L310 65 L280 8" />
              <path d="M512 486 L482 564 L455 640 L424 708 L395 775 L340 890" />
              {/* Center-right form spiderweb */}
              <path d="M992 414 L1028 352 L1065 290 L1112 232 L1160 175 L1285 70 L1380 12" />
              <path d="M992 414 L1038 470 L1085 525 L1138 586 L1190 645 L1315 770 L1440 885" />
              <path d="M992 414 L938 362 L885 310 L832 262 L780 215 L690 110" />
              <path d="M992 414 L952 484 L910 555 L872 622 L835 690 L765 835" />
            </g>

            {/* Concentric spiderweb rings & cross-fractures */}
            <g
              fill="none"
              stroke="rgba(158, 242, 255, 0.82)"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="miter"
            >
              {/* Inner & outer web rings around primary impact (512, 486) */}
              <path d="M578 462 L552 424 L472 412 L446 448 L436 520 L482 564 L544 548 L592 498 Z" />
              <path d="M640 438 L590 365 L435 340 L380 410 L360 555 L455 640 L575 610 L675 512 Z" />
              <path d="M795 396 L710 260 L402 268 L245 315 L215 645 L424 708 L680 715 L860 548 Z" />
              {/* Web rings around form impact (992, 414) */}
              <path d="M892 408 L938 362 L1028 352 L1088 382 L1038 470 L958 534 L952 484 Z" />
              <path d="M795 396 L885 310 L1065 290 L1185 352 L1158 556 L1085 525 L910 555 L860 548 Z" />
              {/* Jagged forks across form choices */}
              <path d="M1185 352 L1245 395 L1330 382 L1410 425 L1520 410" />
              <path d="M1055 524 L1120 475 L1215 492 L1310 455" />
              <path d="M795 396 L845 455 L920 442 L992 414" />
              <path d="M675 512 L740 468 L815 488 L892 408" />
              <path d="M1260 585 L1340 535 L1435 555 L1540 515" />
            </g>

            {/* Fine cyan hairline splinters */}
            <g fill="none" stroke="rgba(110, 231, 255, 0.58)" strokeWidth="1.2" strokeLinecap="round">
              <path d="M640 438 L668 398 L705 412" />
              <path d="M892 408 L915 372 L948 385" />
              <path d="M1088 382 L1132 342 L1168 358" />
              <path d="M958 534 L988 578 L1032 562" />
              <path d="M768 532 L795 578 L838 565" />
              <path d="M1158 556 L1195 518 L1238 532" />
              <path d="M446 448 L412 478 L378 465" />
              <path d="M552 424 L585 392 L618 405" />
            </g>

            {/* Impact craters */}
            <g>
              <circle cx="512" cy="486" r="14" fill="rgba(255,255,255,0.92)" />
              <circle
                cx="512"
                cy="486"
                r="32"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2.5"
              />
              <circle cx="992" cy="414" r="9" fill="rgba(255,255,255,0.85)" />
              <circle
                cx="992"
                cy="414"
                r="22"
                fill="none"
                stroke="rgba(110,231,255,0.65)"
                strokeWidth="2"
              />
            </g>
          </motion.svg>
        ) : null}
      </AnimatePresence>

      {/* High-contrast impact flash */}
      <AnimatePresence>
        {phase === "crack" ? (
          <motion.div
            key="crack-flash"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0.18, 0.08] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
            style={{
              background:
                "radial-gradient(ellipse at 48% 48%, rgba(255,255,255,0.38), rgba(110,231,255,0.18) 42%, transparent 72%)",
            }}
          />
        ) : null}
      </AnimatePresence>

      {/* Staggered calibration repair tape strips across both orb & form card */}
      <AnimatePresence>
        {phase === "stitch" ? (
          <motion.div
            key="tape"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            data-glass-stitch="true"
          >
            <motion.div
              className="absolute left-[24%] top-[44%] flex h-6 w-[28%] rotate-[-16deg] items-center justify-center border border-cyan/80 bg-gradient-to-r from-cyan/55 via-white/45 to-cyan/35 font-mono text-[9px] tracking-[0.24em] text-black/80 shadow-[0_0_22px_rgba(110,231,255,0.6)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            >
              STRUCTURAL PATCH // 01
            </motion.div>
            <motion.div
              className="absolute left-[46%] top-[36%] flex h-6 w-[32%] rotate-[8deg] items-center justify-center border border-white/70 bg-gradient-to-r from-white/55 via-cyan/40 to-white/25 font-mono text-[9px] tracking-[0.24em] text-black/80 shadow-[0_0_20px_rgba(255,255,255,0.35)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            >
              DO NOT POKE THE GLASS
            </motion.div>
            <motion.div
              className="absolute left-[52%] top-[54%] flex h-5 w-[26%] rotate-[-22deg] items-center justify-center border border-cyan/70 bg-gradient-to-r from-cyan/50 via-white/35 to-cyan/20 font-mono text-[8px] tracking-[0.22em] text-black/75 shadow-[0_0_16px_rgba(110,231,255,0.45)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.56, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            >
              CALIBRATION TAPE
            </motion.div>
            <motion.div
              className="absolute left-[28%] top-[58%] h-4 w-[22%] rotate-[28deg] border border-cyan/65 bg-gradient-to-r from-cyan/45 via-white/30 to-transparent shadow-[0_0_14px_rgba(110,231,255,0.4)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.42, delay: 0.82, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.div
              className="absolute right-[6%] top-[10%] max-w-[300px] border border-cyan/70 bg-black/90 px-3.5 py-2.5 font-mono text-[11px] tracking-[0.16em] text-cyan shadow-[0_0_24px_rgba(110,231,255,0.45)]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              STITCHING VIEWPORT // APOLOGY PENDING
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ticket && phase === "stitch" ? (
          <motion.div
            key="ticket"
            className="absolute right-[5%] top-[20%] rotate-[5deg] border border-system-warn/80 bg-black/90 px-4 py-3 font-mono text-[10px] tracking-[0.14em] text-[#ffd27a] shadow-[0_0_24px_rgba(255,178,70,0.45)]"
            initial={{ opacity: 0, scale: 0.9, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            data-glass-ticket="true"
          >
            <div className="text-[9px] tracking-[0.22em] text-[#ffd27a]/90">
              DAMAGE TICKET // VIEWPORT FRACTURE
            </div>
            <div className="mt-1">orb harassment / structural apology</div>
            <div className="mt-1 text-[9px] text-[#c5d3e4]/80">
              filed by assistant // billed to user
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
