"use client";

import { motion } from "framer-motion";
import { AssistantOrb } from "./AssistantOrb";
import { BackgroundGags } from "./BackgroundGags";
import { BeginControl } from "./BeginControl";
import { FacilityBackground } from "./FacilityBackground";
import { TitleLogo } from "./TitleLogo";
import type { OrbMood } from "@/lib/types";

export function TitleScreen({
  orbMood,
  onBegin,
  onHoverChange,
}: {
  orbMood: OrbMood;
  onBegin: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
}) {
  return (
    <div className="absolute inset-0 z-20">
      <FacilityBackground />
      <BackgroundGags />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 sm:py-14">
        <motion.div
          className="font-mono text-[10px] tracking-[0.35em] text-mist/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          HCOS // ASSESSMENT FACILITY 01
        </motion.div>

        <div className="flex w-full max-w-5xl flex-col items-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <TitleLogo reactive />
          </motion.div>

          <div className="flex w-full flex-col items-center justify-center gap-8 lg:flex-row lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <AssistantOrb mood={orbMood} label="ASSISTANT ONLINE" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <BeginControl onBegin={onBegin} onHoverChange={onHoverChange} />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-[0.2em] text-mist/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span>CHAOS STANDARD</span>
          <span className="text-cyan/40">/</span>
          <span>PHASE 1 VERTICAL SLICE</span>
          <span className="text-cyan/40">/</span>
          <span>NO ACCOUNT REQUIRED</span>
        </motion.div>
      </div>
    </div>
  );
}
