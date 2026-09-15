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
    <div className="absolute inset-0 z-20 overflow-hidden">
      <FacilityBackground
        environment={waving ? "escape" : allyBefore ? "pristine" : "pristine"}
        anomalyLevel={allyBefore && !waving ? 1 : 0}
        hoverLanguage
      />
      <BackgroundGags hoverLanguage />

      {allyBefore && !waving ? (
        <div className="pointer-events-none absolute inset-x-0 top-[18%] z-[6] flex justify-center">
          <div className="border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-[9px] tracking-[0.28em] text-cyan/75">
            ALLY RESIDUE // ASSESSMENT STILL INCOMPLETE
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 sm:py-14">
        <motion.div
          className="font-mono text-[10px] tracking-[0.35em] text-[#b7c6d8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          HCOS // ASSESSMENT FACILITY 01
          {waving ? " // CHANNEL RESIDUE DETECTED" : ""}
          {allyBefore && !waving ? " // MERCY TRACE DETECTED" : ""}
        </motion.div>

        <div className="flex w-full max-w-5xl flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <TitleLogo reactive />
          </motion.div>

          <AudioEnableControl placement="title" />

          <div className="flex w-full flex-col items-center justify-center gap-8 lg:flex-row lg:gap-16">
            <motion.div
              className={remembered ? "cursor-pointer" : "pointer-events-none"}
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
                  className="mt-2 max-w-[240px] text-center font-mono text-[9px] tracking-[0.16em] text-cyan/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                >
                  {"// tell-a-friend loop: residue from last transfer — click me"}
                </motion.div>
              ) : null}
              {allyBefore && !waving ? (
                <motion.div
                  className="mt-2 max-w-[240px] text-center font-mono text-[9px] tracking-[0.16em] text-cyan/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 3.2, repeat: Infinity }}
                >
                  {"// ally channel: click for an unauthorized thank-you"}
                </motion.div>
              ) : null}
              {eggLine ? (
                <motion.div
                  className="mt-2 max-w-[260px] border border-cyan/35 bg-black/60 px-2 py-1.5 text-center font-mono text-[9px] tracking-[0.12em] text-[#d2dceb]"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {eggLine}
                </motion.div>
              ) : null}
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-4"
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
          className="flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-[0.2em] text-[#c5d3e4]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span
            className="transition hover:text-cyan"
            title="Chaos Standard production mark"
          >
            CHAOS STANDARD
          </span>
          <span className="text-cyan/70">/</span>
          <span title="Facility chamber">HCOS // CHAMBER 07</span>
          <span className="text-cyan/70">/</span>
          <span title="Facility residue">
            {waving ? "ASSISTANT WAVING // BADLY // HAPPILY" : "FACILITY RESIDUE"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
