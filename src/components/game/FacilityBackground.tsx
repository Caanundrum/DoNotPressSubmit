"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import type { EnvironmentPreset } from "@/game/types";
import { audio } from "@/lib/audio";

const GRADE: Record<EnvironmentPreset, string> = {
  pristine: "hue-rotate(0deg) saturate(1)",
  anomaly: "hue-rotate(-8deg) saturate(1.1)",
  conflict: "hue-rotate(12deg) saturate(1.25) contrast(1.05)",
  reveal: "hue-rotate(-20deg) saturate(0.85) brightness(0.92)",
  climax: "hue-rotate(0deg) saturate(1.35) contrast(1.1)",
  sterile: "grayscale(0.85) brightness(1.05) contrast(1.15)",
  escape: "hue-rotate(160deg) saturate(1.2)",
  archive: "saturate(0.5) brightness(0.75)",
};

type AmbientFn = (id: string, secret?: string) => void;

export function FacilityBackground({
  intensity = 1,
  systemLock = false,
  environment = "pristine",
  anomalyLevel = 0,
  hoverLanguage = false,
  onAmbient,
}: {
  intensity?: number;
  systemLock?: boolean;
  environment?: EnvironmentPreset;
  anomalyLevel?: number;
  /** Soft hover copy on decorative panels (title + select acts) */
  hoverLanguage?: boolean;
  /** When set, CHAMBER / dashed chrome become live eggs — never fake-clickable. */
  onAmbient?: AmbientFn;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const farX = useTransform(sx, (v) => v * -8);
  const midX = useTransform(sx, (v) => v * -18);
  const midY = useTransform(sy, (v) => v * -10);
  const nearX = useTransform(sx, (v) => v * -28);
  const [flash, setFlash] = useState<string | null>(null);
  const [tinted, setTinted] = useState<string | null>(null);
  const live = !!onAmbient && !systemLock;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const flicker = environment === "anomaly" || environment === "conflict" || anomalyLevel >= 2;
  const peel = environment === "reveal" || environment === "climax";
  const sterile = environment === "sterile";
  const escape = environment === "escape";

  // hoverLanguage retained for API compat (title screen soft tips handled elsewhere).
  void hoverLanguage;

  const fireAmbient = (id: string, line: string, secret?: string) => {
    if (!live) return;
    audio.play("click", 0.3);
    setFlash(line);
    setTinted(id);
    onAmbient?.(id, secret);
    window.setTimeout(() => setFlash(null), 2400);
    window.setTimeout(() => setTinted((t) => (t === id ? null : t)), 900);
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ filter: GRADE[environment] }}
    >
      <motion.div className="absolute inset-0" style={{ x: farX }}>
        <div
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            background: sterile
              ? "linear-gradient(to top, #10141c, #181e28 80%, transparent)"
              : escape
                ? "linear-gradient(to top, #04181a, #0b1524cc 80%, transparent)"
                : "linear-gradient(to top, #0a1220, #0b1524cc 80%, transparent)",
          }}
        />
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-[18%] w-[7%] rounded-t-md"
            style={{
              left: `${8 + i * 12}%`,
              height: `${28 + ((i * 17) % 33)}%`,
              opacity: sterile ? 0.35 : 0.55 + (i % 3) * 0.1,
              background: sterile
                ? "linear-gradient(to top, #222833, #3a4252)"
                : "linear-gradient(to top, #152033, #2a3d5cb3)",
              boxShadow: sterile ? "none" : "inset 0 0 20px rgba(110,231,255,0.08)",
              transform:
                peel && i % 2 === 0
                  ? `translateY(${6 + i}px) rotate(${(i - 3) * 0.4}deg)`
                  : undefined,
            }}
          >
            <motion.div
              className="absolute inset-x-2 top-4 h-1 rounded"
              style={{
                background: sterile ? "rgba(255,255,255,0.25)" : "rgba(110,231,255,0.4)",
              }}
              animate={{
                opacity: systemLock ? 1 : flicker ? [0.15, 1, 0.2, 0.9, 0.15] : [0.2, 0.9, 0.2],
              }}
              transition={{
                duration: flicker ? 1.2 + i * 0.1 : 2 + i * 0.3,
                repeat: Infinity,
              }}
            />
            <div className="absolute inset-x-3 bottom-6 space-y-1">
              {[...Array(4)].map((__, r) => (
                <div key={r} className="h-px bg-white/10" />
              ))}
            </div>
          </div>
        ))}
        <motion.div
          className="absolute top-[34%] h-2 w-28 rounded-full bg-cyan/20"
          animate={{ x: sterile ? "40%" : ["-10%", "110%"] }}
          transition={{
            duration: sterile ? 0 : 28 / intensity,
            repeat: sterile ? 0 : Infinity,
            ease: "linear",
          }}
          style={{ left: 0 }}
        />
        <motion.div
          className="absolute top-[48%] h-1.5 w-20 rounded-full bg-white/15"
          animate={{ x: sterile ? "55%" : ["110%", "-20%"] }}
          transition={{
            duration: sterile ? 0 : 36 / intensity,
            repeat: sterile ? 0 : Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ x: midX, y: midY }}>
        {/* CHAMBER 07 — live when onAmbient provided; otherwise inert (no fake cursor). */}
        <button
          type="button"
          disabled={!live}
          className={`absolute left-[6%] top-[22%] h-44 w-28 border border-white/10 bg-white/5 text-left backdrop-blur-[2px] transition ${
            live
              ? "pointer-events-auto cursor-pointer hover:border-cyan/50 hover:bg-cyan/10"
              : "pointer-events-none"
          } ${tinted === "chamber-07" ? "border-cyan bg-cyan/15" : ""}`}
          aria-label={live ? "Inspect CHAMBER 07" : undefined}
          tabIndex={live ? 0 : -1}
          onMouseEnter={() => {
            if (live) audio.play("hover", 0.12);
          }}
          onClick={() =>
            fireAmbient(
              "chamber-07",
              "Queue still empty. Facility pretends that is fine.",
            )
          }
        >
          <div className="m-2 h-full border border-cyan/20 bg-[#0a1524]/70 p-2 font-mono text-[9px] tracking-widest text-cyan/70">
            <div>CHAMBER 07</div>
            <motion.div
              className="mt-3"
              style={{ color: anomalyLevel >= 4 ? "#ff4d6d" : "#ffb020" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: anomalyLevel >= 4 ? 1.2 : 3.5, repeat: Infinity }}
            >
              {anomalyLevel >= 6
                ? "STRUCTURE EXPOSED"
                : anomalyLevel >= 3
                  ? "EVERYTHING IS FINE?"
                  : "EVERYTHING IS FINE"}
            </motion.div>
            <div className="mt-auto pt-16 text-mist/60">
              QUEUE: {Math.min(99, anomalyLevel * 3)}
            </div>
          </div>
        </button>

        {live ? (
          <button
            type="button"
            className={`pointer-events-auto absolute left-[6%] top-[36%] z-[1] h-8 w-28 cursor-pointer border border-transparent bg-transparent ${
              tinted === "everything-fine" ? "border-cyan/40 bg-cyan/10" : "hover:border-cyan/30 hover:bg-black/20"
            }`}
            aria-label="Inspect status plaque"
            onClick={(e) => {
              e.stopPropagation();
              fireAmbient(
                "everything-fine",
                "EVERYTHING IS FINE toggled to EVERYTHING IS… negotiating.",
                "fine-print",
              );
            }}
          />
        ) : null}

        {live ? (
          <button
            type="button"
            className={`pointer-events-auto absolute left-[6%] top-[44%] z-[1] h-8 w-28 cursor-pointer border border-transparent bg-transparent ${
              tinted === "queue-counter" ? "border-cyan/40 bg-cyan/10" : "hover:border-cyan/30 hover:bg-black/20"
            }`}
            aria-label="Inspect queue tally"
            onClick={(e) => {
              e.stopPropagation();
              fireAmbient(
                "queue-counter",
                "Queue incremented by zero. Theater of patience continues.",
              );
            }}
          />
        ) : null}

        <button
          type="button"
          disabled={!live}
          className={`absolute right-[8%] top-[28%] h-36 w-40 border border-white/10 bg-gradient-to-b from-white/10 to-transparent text-left transition ${
            live
              ? "pointer-events-auto cursor-pointer hover:border-cyan/45 hover:from-cyan/15"
              : "pointer-events-none"
          } ${
            tinted === "dashed-frame" || tinted === "monitor-frame" || tinted === "kill-path"
              ? "border-cyan/60 from-cyan/20"
              : ""
          }`}
          aria-label={live ? "Inspect dashed frame" : undefined}
          tabIndex={live ? 0 : -1}
          onMouseEnter={() => {
            if (live) audio.play("hover", 0.12);
          }}
          onClick={() =>
            fireAmbient(
              peel ? "kill-path" : "dashed-frame",
              peel
                ? "KILL PATH means the Submit route System prefers: polite, labeled, terminal for me. Not a metaphor. A floor plan."
                : "Dashed border admits it's decorative. Rare honesty.",
              peel ? "kill-path-read" : undefined,
            )
          }
        >
          <motion.div
            className="absolute inset-3 border border-dashed border-white/20"
            animate={{
              rotate: systemLock || sterile ? 0 : peel ? [0, 3, -4, 1, 0] : [0, 1.5, -1.5, 0],
            }}
            transition={{ duration: peel ? 4 : 8, repeat: Infinity }}
          />
          {peel ? (
            <div className="absolute inset-x-4 top-4 space-y-1 font-mono text-[8px] tracking-widest text-danger/80">
              <div>KILL PATH // VISIBLE</div>
              <div className="text-[7px] tracking-[0.14em] text-danger/60">
                = Submit route System prefers // terminal for assistant
              </div>
            </div>
          ) : null}
          <div className="absolute inset-x-4 bottom-4 h-8 bg-cyan/10" />
        </button>

        <div className="absolute left-0 right-0 top-[62%] h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
        <div className="absolute left-0 right-0 top-[68%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {anomalyLevel >= 3 ? (
          <motion.div
            className="absolute left-[30%] top-[40%] h-24 w-px bg-gradient-to-b from-transparent via-system-warn to-transparent"
            animate={{ opacity: [0.2, 0.9, 0.2], scaleY: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        ) : null}
      </motion.div>

      <motion.div className="absolute inset-0" style={{ x: nearX }}>
        {[...Array(sterile ? 4 : 18)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/40"
            style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 90}%` }}
            animate={{
              y: sterile ? 0 : [0, -30, 0],
              opacity: sterile ? 0.08 : [0.1, 0.55, 0.1],
            }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <div
          className="absolute inset-x-[10%] top-[12%] h-24 rounded-[40%] blur-3xl"
          style={{
            background:
              environment === "climax"
                ? "rgba(255,77,109,0.12)"
                : escape
                  ? "rgba(80,255,200,0.12)"
                  : "rgba(110,231,255,0.05)",
          }}
        />
      </motion.div>

      <div className="absolute left-[20%] top-0 h-full w-24 rotate-6 bg-gradient-to-b from-cyan/10 via-transparent to-transparent blur-2xl" />
      <div className="absolute right-[28%] top-0 h-full w-16 -rotate-3 bg-gradient-to-b from-white/8 via-transparent to-transparent blur-2xl" />

      {environment === "climax" ? (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,77,109,0.18),transparent_45%)]"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      ) : null}

      {flash ? (
        <div className="pointer-events-none absolute bottom-[6%] left-1/2 z-[12] max-w-[min(90vw,420px)] -translate-x-1/2 border border-cyan/40 bg-black/80 px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-[#d2dceb]">
          {flash}
        </div>
      ) : null}
    </div>
  );
}
