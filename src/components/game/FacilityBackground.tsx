"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BAR_LAYOUTS,
  CHAMBER_SLOTS,
  DASHED_SLOTS,
  pickBarLayout,
  pickSlotDistant,
  roamIntervalMs,
  STATUS_SLOTS,
  TITLE_BAR_LAYOUTS,
  TITLE_CHAMBER_SLOTS,
  TITLE_DASHED_SLOTS,
  type FacilityBar,
  type RoamSlot,
} from "@/game/ambientRoam";
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
  /** Title medium density — fewer bars, one panel, softer chrome. In-game unchanged. */
  calm = false,
  onAmbient,
}: {
  intensity?: number;
  systemLock?: boolean;
  environment?: EnvironmentPreset;
  anomalyLevel?: number;
  /** Soft hover copy on decorative panels (title + select acts) */
  hoverLanguage?: boolean;
  calm?: boolean;
  /** When set, CHAMBER / dashed chrome become live eggs — never fake-clickable. */
  onAmbient?: AmbientFn;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Quieter parallax — still alive, not jarring.
  const sx = useSpring(mx, { stiffness: 22, damping: 28 });
  const sy = useSpring(my, { stiffness: 22, damping: 28 });
  const farX = useTransform(sx, (v) => v * -3);
  const midX = useTransform(sx, (v) => v * -7);
  const midY = useTransform(sy, (v) => v * -4);
  const nearX = useTransform(sx, (v) => v * -11);
  const [flash, setFlash] = useState<string | null>(null);
  const [tinted, setTinted] = useState<string | null>(null);
  const chamberPool = calm ? TITLE_CHAMBER_SLOTS : CHAMBER_SLOTS;
  const dashedPool = calm ? TITLE_DASHED_SLOTS : DASHED_SLOTS;
  const barPool = calm ? TITLE_BAR_LAYOUTS : BAR_LAYOUTS;
  const [chamberSlot, setChamberSlot] = useState<RoamSlot>(chamberPool[0]!);
  const [statusSlot, setStatusSlot] = useState<RoamSlot>(STATUS_SLOTS[0]!);
  const [dashedSlot, setDashedSlot] = useState<RoamSlot>(dashedPool[0]!);
  const [barLayoutIndex, setBarLayoutIndex] = useState(0);
  const [bars, setBars] = useState<FacilityBar[]>(() => barPool[0]!);
  /** Title calm: only one midground panel visible at a time. */
  const [panelFocus, setPanelFocus] = useState<"chamber" | "dashed">("chamber");
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

  // CHAMBER 07 / status / dashed / tall bars relocate — same behavior title + in-game.
  // Distant picks so 45–90s idle shots show clear re-anchors (not opacity-only).
  useEffect(() => {
    if (systemLock || sterile) return;
    let timer: number;
    const tick = () => {
      setChamberSlot((prev) => pickSlotDistant(chamberPool, prev));
      setStatusSlot((prev) => pickSlotDistant(STATUS_SLOTS, prev));
      setDashedSlot((prev) => pickSlotDistant(dashedPool, prev));
      setBarLayoutIndex((prevIdx) => {
        const next = pickBarLayout(prevIdx, barPool);
        setBars(next.bars);
        return next.index;
      });
      if (calm) {
        setPanelFocus((prev) => (prev === "chamber" ? "dashed" : "chamber"));
      }
      // Slower roam — still relocates, less frantic.
      timer = window.setTimeout(tick, roamIntervalMs(calm ? 18000 : 18000, calm ? 30000 : 32000));
    };
    timer = window.setTimeout(tick, roamIntervalMs(calm ? 14000 : 14000, calm ? 22000 : 22000));
    return () => clearTimeout(timer);
  }, [systemLock, sterile, calm, chamberPool, dashedPool, barPool]);

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
        {[...bars].map((bar, i) => (
          <div
            key={`bar-${i}`}
            className="absolute bottom-[18%] w-[7%] rounded-t-md"
            data-roam-egg={`facility-bar-${i}`}
            data-bar-layout={barLayoutIndex}
            style={{
              left: bar.left,
              height: `${bar.heightPct}%`,
              opacity: sterile
                ? 0.28
                : calm
                  ? 0.2 + (i % 2) * 0.05
                  : 0.28 + (i % 3) * 0.05,
              background: sterile
                ? "linear-gradient(to top, #222833, #3a4252)"
                : "linear-gradient(to top, #152033, #2a3d5cb3)",
              boxShadow: "none",
              transition: "left 1.8s ease-in-out, height 1.8s ease-in-out, opacity 0.9s ease",
              transform:
                peel && i % 2 === 0
                  ? `translateY(${3 + i * 0.5}px) rotate(${(i - 3) * 0.2}deg)`
                  : undefined,
            }}
          >
            <motion.div
              className="absolute inset-x-2 top-4 h-1 rounded"
              style={{
                background: sterile ? "rgba(255,255,255,0.2)" : "rgba(110,231,255,0.28)",
              }}
              animate={{
                opacity: systemLock ? 0.7 : flicker ? [0.12, 0.55, 0.18, 0.5, 0.12] : [0.15, 0.45, 0.15],
              }}
              transition={{
                duration: flicker ? 2.4 + i * 0.15 : 4.5 + i * 0.35,
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
          className="absolute top-[34%] h-2 w-28 rounded-full bg-cyan/10"
          animate={{ x: sterile ? "40%" : ["-10%", "110%"] }}
          transition={{
            duration: sterile ? 0 : 58 / Math.max(0.35, intensity),
            repeat: sterile ? 0 : Infinity,
            ease: "linear",
          }}
          style={{ left: 0 }}
        />
        <motion.div
          className="absolute top-[48%] h-1.5 w-20 rounded-full bg-white/8"
          animate={{ x: sterile ? "55%" : ["110%", "-20%"] }}
          transition={{
            duration: sterile ? 0 : 74 / Math.max(0.35, intensity),
            repeat: sterile ? 0 : Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ x: midX, y: midY }} data-ambient-roam="facility">
        {/* CHAMBER 07 — relocates on semi-random timings when live. Title calm: one panel at a time. */}
        {(!calm || panelFocus === "chamber") ? (
        <button
          type="button"
          disabled={!live}
          className={`absolute h-44 w-28 border border-white/10 bg-white/5 text-left backdrop-blur-[2px] transition ${
            live
              ? "pointer-events-auto cursor-pointer hover:border-cyan/50 hover:bg-cyan/10"
              : "pointer-events-none"
          } ${tinted === "chamber-07" ? "border-cyan bg-cyan/15" : ""}`}
          style={{
            left: chamberSlot.left,
            top: chamberSlot.top,
            transition: "left 1.8s ease-in-out, top 1.8s ease-in-out, opacity 0.9s ease",
            opacity: calm ? 0.55 : 0.72,
          }}
          data-roam-egg="chamber-07"
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
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: anomalyLevel >= 4 ? 2.4 : 5.5, repeat: Infinity }}
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
        ) : null}

        {live && !calm ? (
          <button
            type="button"
            className={`pointer-events-auto absolute z-[1] h-8 w-28 cursor-pointer border border-transparent bg-transparent ${
              tinted === "everything-fine" ? "border-cyan/40 bg-cyan/10" : "hover:border-cyan/30 hover:bg-black/20"
            }`}
            style={{
              left: statusSlot.left,
              top: statusSlot.top,
              transition: "left 1.8s ease-in-out, top 1.8s ease-in-out",
            }}
            data-roam-egg="everything-fine"
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

        {live && !calm ? (
          <button
            type="button"
            className={`pointer-events-auto absolute z-[1] h-8 w-28 cursor-pointer border border-transparent bg-transparent ${
              tinted === "queue-counter" ? "border-cyan/40 bg-cyan/10" : "hover:border-cyan/30 hover:bg-black/20"
            }`}
            style={{
              left: statusSlot.left,
              top: `calc(${statusSlot.top} + 2rem)`,
              transition: "left 1.8s ease-in-out, top 1.8s ease-in-out",
            }}
            data-roam-egg="queue-counter"
            aria-label="Inspect queue tally"
            onClick={(e) => {
              e.stopPropagation();
              fireAmbient(
                "queue-counter",
                "Queue incremented by zero. Theater of patience continues.",
              );
            }}
