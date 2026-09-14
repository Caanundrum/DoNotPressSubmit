"use client";

import { motion } from "framer-motion";
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
}: {
  orbMood: OrbMood;
  onBegin: () => void;
  onContinue?: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
  escapedBefore?: boolean;
  /** Real tell-a-friend wave after escape / secret ending */
  assistantWaving?: boolean;
}) {
  const waving = assistantWaving || escapedBefore;

  return (
    <div className="absolute inset-0 z-20">
      <FacilityBackground environment={waving ? "escape" : "pristine"} />
      <BackgroundGags />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 sm:py-14">
        <motion.div
          className="font-mono text-[10px] tracking-[0.35em] text-[#b7c6d8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          HCOS // ASSESSMENT FACILITY 01
          {waving ? " // CHANNEL RESIDUE DETECTED" : ""}
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
              className={waving ? "" : "pointer-events-none"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              aria-hidden={!waving}
            >
              <AssistantOrb
                mood={waving ? "excited" : orbMood}
                wave={waving}
                label={
                  waving
                    ? "ASSISTANT WAVING // BADLY // HAPPILY"
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
                  {"// tell-a-friend loop: residue from last transfer"}
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
          <span>CHAOS STANDARD</span>
          <span className="text-cyan/70">/</span>
          <span>PHASE 2 SCRIPTED GAME</span>
          <span className="text-cyan/70">/</span>
          <span>NO ACCOUNT REQUIRED</span>
        </motion.div>
      </div>
    </div>
  );
}
