"use client";

import { motion } from "framer-motion";
import { AudioEnableControl } from "./AudioEnableControl";
import { BeginControl } from "./BeginControl";
import { TitleLogo } from "./TitleLogo";
import { audio } from "@/lib/audio";

/**
 * Clean title card only: brand + Begin/Continue + sound.
 * No Assistant, no facility chrome, no ambient eggs — those arrive after Begin.
 */
export function TitleScreen({
  onBegin,
  onContinue,
  onHoverChange,
}: {
  onBegin: () => void;
  onContinue?: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
}) {
  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      style={{ background: "var(--void)" }}
      data-title-clean="true"
    >
      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center gap-8 px-5 py-8 sm:gap-10 sm:px-6">
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          <TitleLogo reactive />
        </motion.div>

        <AudioEnableControl placement="title" />

        <motion.div
          className="flex shrink-0 flex-col items-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
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
  );
}
