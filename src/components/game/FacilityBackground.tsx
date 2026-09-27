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

/* partial upload 0 */
