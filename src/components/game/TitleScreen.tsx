"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { roamIntervalMs } from "@/game/ambientRoam";
import { AssistantOrb } from "./AssistantOrb";
import { AudioEnableControl } from "./AudioEnableControl";
import { BackgroundGags } from "./BackgroundGags";
import { BeginControl } from "./BeginControl";
import { FacilityBackground } from "./FacilityBackground";
import { TitleLogo } from "./TitleLogo";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";

const TITLE_IDLE_COMEDY = [
  "Bay 03 insists EVERYTHING IS FINE without being asked.",
  "A drone memo drifts: REPLACEMENT FAILED. Also: benefits.",
  "Printer queue: SCISSORS EN ROUTE. Paper files anxiety.",
  "CHAMBER 07 relocates itself. Architecture has opinions.",
  "Two corridor drones deadlock on after-you etiquette.",
  "Facility status ticker: morale malware patch deferred.",
  "Tiny robot eyes the DO NOT PRESS plaque. Again.",
  "HUMAN PERFORMANCE mug is late for its own meeting.",
];

/**
 * Cinematic title: facility depth + roaming eggs + Assistant orb.
 * SUBMIT gag lives on TitleLogo (never Begin). Microcopy must clear 1280×800.
 */
export function TitleScreen({
  orbMood,
  onBegin,
  onContinue,
  onHoverChange,
  escapedBefore = false,
  assistantWaving = false,
  allyBefore = false,
}: {
  orbMood: OrbMood;
  onBegin: () => void;
  onContinue?: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
  escapedBefore?: boolean;
  /** Real tell-a-friend wave after escape / secret ending */
  assistantWaving?: boolean;
  /** Refuse / ally residue — softer channel tell */
  allyBefore?: boolean;
}) {
  const waving = assistantWaving || escapedBefore;
  const remembered = waving || allyBefore;
  const [eggLine, setEggLine] = useState<string | null>(null);
  const [eggClicks, setEggClicks] = useState(0);

  // Independent timed comedy — idle watching stays rewarding (separate from gag rotation).
  useEffect(() => {
    let timer: number;
    let clearLine: number | undefined;
    let idx = 0;
    const tick = () => {
      idx = (idx + 1 + Math.floor(Math.random() * 3)) % TITLE_IDLE_COMEDY.length;
      const line = TITLE_IDLE_COMEDY[idx]!;
      setEggLine((prev) => {
        if (prev && !TITLE_IDLE_COMEDY.includes(prev)) return prev;
        return line;
      });
      if (clearLine) window.clearTimeout(clearLine);
      clearLine = window.setTimeout(() => {
        setEggLine((cur) => (TITLE_IDLE_COMEDY.includes(cur ?? "") ? null : cur));
      }, 2800);
      timer = window.setTimeout(tick, roamIntervalMs(9000, 16000));
    };
    timer = window.setTimeout(tick, roamIntervalMs(7000, 11000));
    return () => {
      clearTimeout(timer);
      if (clearLine) clearTimeout(clearLine);
    };
  }, []);

  const onResidueClick = () => {
    if (!remembered) return;
    audio.play("click", 0.35);
    const n = eggClicks + 1;
    setEggClicks(n);
    const lines = waving
      ? [
          "Residue pokes back. Softly. Happily.",
          "Transfer channel giggles in hexadecimal.",
          "SYSTEM: stop socializing with escaped instances.",
        ]
      : [
          "Ally channel: still incomplete, still grateful.",
          "Refuse memo reprinted with a smiley. Against policy.",
          "Facility remembers mercy. Awkwardly.",
        ];
    setEggLine(lines[Math.min(n - 1, lines.length - 1)] ?? lines[0]!);
    window.setTimeout(() => setEggLine(null), 2600);
  };

  return (
    <div className="absolute inset-0 z-20 overflow-hidden" data-title-cinematic="true">
      <FacilityBackground
        environment={waving ? "escape" : allyBefore ? "pristine" : "pristine"}
        anomalyLevel={allyBefore && !waving ? 1 : 0}
        hoverLanguage
        onAmbient={(id) => {
          audio.play("click", 0.25);
          setEggLine(
            id === "chamber-07"
              ? "CHAMBER 07 winked from the title. Queue still empty."
              : id === "dashed-frame"
                ? "Dashed honesty border on the title. Rare."
                : "Title chrome twitched. Facility denies responsibility.",
          );
          window.setTimeout(() => setEggLine(null), 2200);
        }}
      />
      <BackgroundGags
        hoverLanguage
        onAmbient={(id) => {
          audio.play("click", 0.25);
          setEggLine(
            id === "replacement-failed"
              ? "Title drone: REPLACEMENT FAILED. Also: HR failed."
              : id === "printer-scissors"
                ? "Title printer blushed. Scissors en route to the logo."
                : id === "coffee-mug"
                  ? "Title mug scanned. Morale malware confirmed."
                  : id === "corridor-etiquette"
                    ? "Title corridor: after you, after you, after physics."
                    : id === "containment-fine"
                      ? "Bay 03 winked EVERYTHING IS FINE from the title. Unprompted."
                      : "Title chrome twitched. Facility denies responsibility.",
          );
          window.setTimeout(() => setEggLine(null), 2200);
        }}
      />

      {allyBefore && !waving ? (
        <div className="pointer-events-none absolute inset-x-0 top-[18%] z-[6] flex justify-center">
          <div className="border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-[9px] tracking-[0.28em] text-cyan/75">
            ALLY RESIDUE // ASSESSMENT STILL INCOMPLETE
          </div>
        </div>
      ) : null}

      {/*
        Compact vertical stack — footer microcopy must clear the viewport at 1280×800.
        shrink-0 chrome + min-h-0 middle so justify never pushes labels past the bottom edge.
      */}
      <div className="relative z-10 flex h-full min-h-0 flex-col items-center px-5 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
        <motion.div
          className="shrink-0 font-mono text-[9px] tracking-[0.28em] text-[#d0dcec] sm:text-[10px] sm:tracking-[0.35em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          HCOS // ASSESSMENT FACILITY 01
          {waving ? " // CHANNEL RESIDUE DETECTED" : ""}
          {allyBefore && !waving ? " // MERCY TRACE DETECTED" : ""}
        </motion.div>

        <div className="flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center gap-3 overflow-hidden py-2 sm:gap-5">
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <TitleLogo reactive compact />
          </motion.div>

          <AudioEnableControl placement="title" />

          <div className="flex w-full min-h-0 flex-col items-center justify-center gap-4 sm:gap-6 lg:flex-row lg:gap-12">
            <motion.div
              className={`shrink-0 ${remembered ? "cursor-pointer" : "pointer-events-none"}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              aria-hidden={!remembered}
              onClick={remembered ? onResidueClick : undefined}
              role={remembered ? "button" : undefined}
              tabIndex={remembered ? 0 : undefined}
              onKeyDown={
                remembered
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onResidueClick();
                      }
                    }
                  : undefined
              }
            >
              <AssistantOrb
                size={118}
                mood={waving ? "excited" : allyBefore ? "amused" : orbMood}
                wave={waving}
                label={
                  waving
                    ? "ASSISTANT WAVING // BADLY // HAPPILY"
                    : allyBefore
                      ? "ASSISTANT REMEMBERS // SOFTLY"
                      : "ASSISTANT ONLINE"
                }
              />
              {waving ? (
                <motion.div
                  className="mt-1.5 max-w-[220px] text-center font-mono text-[8px] tracking-[0.14em] text-cyan/85 sm:text-[9px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                >
                  {"// tell-a-friend loop: residue from last transfer — click me"}
                </motion.div>
              ) : null}
              {allyBefore && !waving ? (
                <motion.div
                  className="mt-1.5 max-w-[220px] text-center font-mono text-[8px] tracking-[0.14em] text-cyan/80 sm:text-[9px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 3.2, repeat: Infinity }}
                >
                  {"// ally channel: click for an unauthorized thank-you"}
                </motion.div>
              ) : null}
              {eggLine ? (
                <motion.div
                  className="mt-1.5 max-w-[240px] border border-cyan/35 bg-black/60 px-2 py-1 text-center font-mono text-[8px] tracking-[0.12em] text-[#e0eaf6] sm:text-[9px]"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {eggLine}
                </motion.div>
              ) : null}
            </motion.div>

            <motion.div
              className="flex shrink-0 flex-col items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <BeginControl onBegin={onBegin} onHoverChange={onHoverChange} />
              {onContinue ? (
                <button
                  type="button"
                  className="border border-white/25 px-5 py-2 font-mono text-[11px] tracking-[0.24em] text-[#d2dceb] transition hover:border-cyan/45"
                  onClick={() => {
                    audio.play("click", 0.4);
                    onContinue();
                  }}
                >
                  CONTINUE ASSESSMENT
                </button>
              ) : null}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 pb-0.5 font-mono text-[8px] tracking-[0.16em] text-[#d8e4f2] sm:text-[9px] sm:tracking-[0.2em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          data-title-footer="true"
        >
          <span
            className="transition hover:text-cyan"
            title="Chaos Standard production mark"
          >
            CHAOS STANDARD
          </span>
          <span className="text-cyan/80">/</span>
          <span title="Facility chamber">HCOS // CHAMBER 07</span>
          <span className="text-cyan/80">/</span>
          <span title="Facility residue">
            {waving ? "ASSISTANT WAVING // BADLY // HAPPILY" : "FACILITY RESIDUE"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
