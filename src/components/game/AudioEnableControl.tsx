"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";

/**
 * Corner mute/unmute only — title CTA unmute button removed (overhaul).
 * Procedural SFX + ambience; baked VO stays disabled via speech controller.
 */
export function AudioEnableControl({
  placement = "corner",
}: {
  placement?: "title" | "corner";
}) {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    return audio.subscribe((s) => {
      setMuted(s.muted);
      // Arms SFX/ambience path; VO speakLine remains a no-op.
      speech.setEnabled(!s.muted);
      if (s.muted) speech.cancel();
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

  // Title placement retired — always render corner chrome.
  void placement;

  return (
    <button
      type="button"
      data-sound-corner="true"
      onClick={() => (muted ? enable() : mute())}
      className="pointer-events-auto absolute right-3 top-3 z-50 border border-white/25 bg-black/60 px-2.5 py-1.5 font-mono text-[12px] tracking-[0.2em] text-[#d8e4f4] backdrop-blur-sm transition hover:border-cyan/50 hover:text-white sm:text-[10px]"
      aria-pressed={!muted}
      aria-label={muted ? "Enable sound" : "Mute sound"}
    >
      {muted ? "ENABLE SOUND" : "SOUND ON"}
    </button>
  );
}
