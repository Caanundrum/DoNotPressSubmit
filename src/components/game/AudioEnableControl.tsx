"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";

export function AudioEnableControl({
  placement = "title",
}: {
  placement?: "title" | "corner";
}) {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    return audio.subscribe((s) => {
      setMuted(s.muted);
      speech.setEnabled(!s.muted);
    });
  }, []);

  const enable = () => {
    audio.enableSound();
    speech.setEnabled(true);
  };

  const mute = () => {
    audio.setMuted(true);
    speech.setEnabled(false);
    speech.cancel();
  };

  if (placement === "corner") {
    return (
      <button
        type="button"
        onClick={() => (muted ? enable() : mute())}
        className="pointer-events-auto absolute right-4 top-4 z-50 border border-white/25 bg-black/55 px-3 py-2 font-mono text-[10px] tracking-[0.22em] text-[#d8e4f4] backdrop-blur-sm transition hover:border-cyan/50 hover:text-white"
        aria-pressed={!muted}
        aria-label={muted ? "Enable sound" : "Mute sound"}
      >
        {muted ? "ENABLE SOUND" : "SOUND ON"}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => (muted ? enable() : mute())}
      className="pointer-events-auto border px-5 py-3 font-mono text-[11px] tracking-[0.28em] transition"
      style={{
        borderColor: muted ? "rgba(110,231,255,0.55)" : "rgba(170,200,230,0.28)",
        background: muted
          ? "linear-gradient(180deg, rgba(40,90,120,0.45), rgba(8,12,20,0.7))"
          : "rgba(8,12,20,0.55)",
        color: muted ? "#e8f7ff" : "#c5d4e8",
        boxShadow: muted ? "0 0 28px rgba(110,231,255,0.18)" : "none",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute and enable sound" : "Mute sound"}
    >
      {muted ? "UNMUTE / ENABLE SOUND" : "SOUND ENABLED — TAP TO MUTE"}
    </motion.button>
  );
}
