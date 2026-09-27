"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AssistantOrb } from "./AssistantOrb";
import { AudioEnableControl } from "./AudioEnableControl";
import { BackgroundGags } from "./BackgroundGags";
import { BeginControl } from "./BeginControl";
import { FacilityBackground } from "./FacilityBackground";
import { TitleLogo } from "./TitleLogo";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";

/**
 * Medium-density cinematic title:
 * brand + headline + one vertical CTA column + orb.
 * Ambient life stays sparse (1–2 beats), away from the CTA stack.
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
  const [eggClicks, setEggClicks] = useState(0);
  const [residueLine, setResidueLine] = useState<string | null>(null);

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
    setResidueLine(lines[Math.min(n - 1, lines.length - 1)] ?? lines[0]!);
    window.setTimeout(() => setResidueLine(null), 2600);
  };

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      data-title-cinematic="true"
      data-title-density="medium"
    >
      <FacilityBackground
        calm
        environment={waving ? "escape" : allyBefore ? "pristine" : "pristine"}
        anomalyLevel={allyBefore && !waving ? 1 : 0}
        hoverLanguage
        onAmbient={() => {
          // Keep eggs live for secret/ledger bumps; do not park comedy copy under the orb.
          audio.play("click", 0.22);
        }}
      />
      <BackgroundGags
        calm
        hoverLanguage
        onAmbient={() => {
          audio.play("click", 0.22);
        }}
      />

      {allyBefore && !waving ? (
        <div className="pointer-events-none absolute inset-x-0 top-[14%] z-[6] flex justify-center">
          <div className="border border-cyan/25 bg-cyan/5 px-3 py-1 font-mono text-[9px] tracking-[0.28em] text-cyan/70">
            ALLY RESIDUE // ASSESSMENT STILL INCOMPLETE
          </div>
        </div>
      ) : null}

      {/*
        Composition: brand stack + one vertical CTA column.
        Orb docks bottom-left (few px off edge) — present, not fighting CTAs.
        shrink-0 chrome + min-h-0 middle so footer clears 1280×800.
      */}
      <div className="relative z-10 flex h-full min-h-0 flex-col items-center px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-7">
        <motion.div
          className="shrink-0 font-mono text-[9px] tracking-[0.28em] text-[#d0dcec]/70 sm:text-[10px] sm:tracking-[0.35em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          HCOS // ASSESSMENT FACILITY 01
          {waving ? " // CHANNEL RESIDUE DETECTED" : ""}
          {allyBefore && !waving ? " // MERCY TRACE DETECTED" : ""}
        </motion.div>

        <div className="flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 overflow-hidden py-3 sm:gap-8">
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <TitleLogo reactive compact />
          </motion.div>

          {/* One clear vertical CTA column: Unmute → Begin → Continue */}
          <motion.div
            className="flex shrink-0 flex-col items-center gap-5 sm:gap-6"
            data-title-cta-column="true"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AudioEnableControl placement="title" />
            <BeginControl onBegin={onBegin} onHoverChange={onHoverChange} />
            {onContinue ? (
              <button
                type="button"
                className="border border-white/20 px-5 py-2.5 font-mono text-[11px] tracking-[0.24em] text-[#d2dceb]/90 transition hover:border-cyan/40"
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

        <motion.div
          className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 pb-0.5 font-mono text-[8px] tracking-[0.16em] text-[#d8e4f2]/55 sm:text-[9px] sm:tracking-[0.2em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          data-title-footer="true"
        >
          <span title="Chaos Standard production mark">CHAOS STANDARD</span>
          <span className="text-cyan/50">/</span>
          <span title="Facility chamber">HCOS // CHAMBER 07</span>
        </motion.div>
      </div>

      {/* Orb: present, clear of CTA column, a few px off the bottom edge */}
      <motion.div
        className={`absolute bottom-3 left-4 z-20 sm:bottom-4 sm:left-6 ${
          remembered ? "cursor-pointer" : "pointer-events-none"
        }`}
        data-title-orb-dock="true"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
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
          size={96}
          mood={waving ? "excited" : allyBefore ? "amused" : orbMood}
          wave={waving}
          label={
            waving
              ? "ASSISTANT WAVING"
              : allyBefore
                ? "ASSISTANT REMEMBERS"
                : "ASSISTANT ONLINE"
          }
        />
        {waving ? (
          <motion.div
            className="mt-1 max-w-[180px] text-center font-mono text-[8px] tracking-[0.12em] text-cyan/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            {"// residue — click me"}
          </motion.div>
        ) : null}
        {allyBefore && !waving ? (
          <motion.div
            className="mt-1 max-w-[180px] text-center font-mono text-[8px] tracking-[0.12em] text-cyan/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            {"// ally channel — click"}
          </motion.div>
        ) : null}
        {residueLine ? (
          <motion.div
            className="mt-1.5 max-w-[200px] border border-cyan/25 bg-black/45 px-2 py-1 text-center font-mono text-[8px] tracking-[0.1em] text-[#d0dcec]/85"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.9, y: 0 }}
          >
            {residueLine}
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
