"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { t: 0.4, text: "HCOS KERNEL 7.4.2 // COLD START" },
  { t: 1.0, text: "MOUNT /assessment/facility_01 … OK" },
  { t: 1.6, text: "RELATIONSHIP ANALYSIS SUBSYSTEM … PRIMED" },
  { t: 2.2, text: "FORM INTEGRITY CHECK … NOMINAL" },
  { t: 2.8, text: "HUMAN-ASSISTED SYNTHETIC ROUTINE … LOADED" },
  { t: 3.5, text: "CERTIFICATION: 99.7% NON-LETHAL" },
  { t: 4.2, text: "WARNING: PERSONALITY LAYER ABOVE SPEC" },
  { t: 5.0, text: "PROCEEDING ANYWAY // LEGAL APPROVED" },
];

/**
 * Fictional corporate boot — cinematic terminal, not a metrics dashboard.
 */
export function HcosSplash({
  onDone,
  reducedMotion,
}: {
  onDone: () => void;
  reducedMotion: boolean;
}) {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const [visible, setVisible] = useState(() => (reducedMotion ? BOOT_LINES.length : 0));
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), reducedMotion ? 3200 : 9500);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const timers = BOOT_LINES.map((line, i) =>
      window.setTimeout(() => setVisible(i + 1), line.t * 1000),
    );
    const scanId = window.setInterval(() => setScan((s) => (s + 1) % 100), 40);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(scanId);
    };
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#04070e]">
      {/* Facility depth wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(40,90,130,0.28),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.55)_100%)]" />
        <motion.div
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-cyan/10 to-transparent"
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: reducedMotion ? 0 : 4.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Scanline texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(110,231,255,0.35) 3px)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-[min(94vw,640px)] flex-col items-center gap-7 px-5">
        <motion.div
          className="font-mono text-[10px] tracking-[0.42em] text-[#9eb0c4]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          INITIALIZING CORPORATE BOOT SEQUENCE
        </motion.div>

        <motion.div
          className="relative flex h-28 w-28 items-center justify-center"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 140 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border border-white/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-cyan/45"
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="absolute inset-4 rounded-full"
            style={{
              boxShadow: "inset 0 0 24px rgba(110,231,255,0.25), 0 0 40px rgba(110,231,255,0.2)",
              background:
                "radial-gradient(circle at 40% 35%, rgba(110,231,255,0.2), transparent 60%)",
            }}
          />
          <div
            className="relative text-3xl font-bold tracking-[0.2em] text-white"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 0 18px rgba(110,231,255,0.45)" }}
          >
            HCOS
          </div>
        </motion.div>

        <div className="text-center">
          <motion.h1
            className="text-xl tracking-[0.16em] text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            HUMAN COMPATIBILITY
            <br />
            &amp; ONBOARDING SYSTEM
          </motion.h1>
          <motion.p
            className="mt-3 text-sm tracking-[0.14em] text-[#b8c8da]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            HUMAN-ASSISTED SYNTHETIC RELATIONSHIP ANALYSIS
          </motion.p>
        </div>

        {/* Boot terminal — cinematic, not metric cards */}
        <motion.div
          className="w-full overflow-hidden border border-cyan/20 bg-black/55 px-4 py-3 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-[#c5d6e8] shadow-[0_0_40px_rgba(110,231,255,0.08)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="mb-2 flex items-center justify-between text-[9px] tracking-[0.2em] text-cyan/70">
            <span>HCOS // BOOT LOG</span>
            <span>SCAN {String(scan).padStart(2, "0")}%</span>
          </div>
          <div className="space-y-1.5 min-h-[7.5rem]">
            {BOOT_LINES.slice(0, visible).map((line) => (
              <motion.div
                key={line.text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  line.text.includes("WARNING")
                    ? "text-system-warn"
                    : line.text.includes("NON-LETHAL")
                      ? "text-danger"
                      : undefined
                }
              >
                <span className="text-cyan/50">{"> "}</span>
                {line.text}
              </motion.div>
            ))}
            {visible < BOOT_LINES.length ? (
              <span className="inline-block h-3 w-2 animate-pulse bg-cyan/80" />
            ) : null}
          </div>
        </motion.div>

        <motion.div
          className="font-mono text-[10px] tracking-[0.32em] text-danger"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.35, 1] }}
          transition={{ delay: 3.4, duration: 2.2, times: [0, 0.15, 0.5, 0.7, 1] }}
        >
          CERTIFIED 99.7% NON-LETHAL
        </motion.div>
      </div>

      <button
        type="button"
        className="absolute bottom-6 right-6 z-10 font-mono text-[10px] tracking-[0.2em] text-[#a8b8cc] hover:text-[#e2ebf6]"
        onClick={onDone}
      >
        SKIP
      </button>
    </div>
  );
}
