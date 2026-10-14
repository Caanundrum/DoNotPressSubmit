"use client";

import { useEffect, useRef } from "react";
import { audio } from "@/lib/audio";

export function ChaosSplash({
  onDone,
  reducedMotion,
}: {
  onDone: () => void;
  reducedMotion: boolean;
}) {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    audio.play("logo", 0.4);
    const ms = reducedMotion ? 1200 : 3000;
    const t = window.setTimeout(() => onDoneRef.current(), ms);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onDoneRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [reducedMotion]);

  return (
    <div
      className="absolute inset-0 z-50 flex cursor-pointer select-none items-center justify-center bg-[#05070A]"
      onClick={() => onDoneRef.current()}
      role="dialog"
      aria-modal="true"
      aria-label="Chaos Standard"
      data-chaos-splash="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/chaos-splash-card.png"
        alt="Chaos Standard"
        className="w-full max-w-3xl"
        draggable={false}
      />
      <button
        type="button"
        className="absolute right-4 top-4 rounded bg-white/10 px-2.5 py-1 text-[11px] text-white"
        onClick={(e) => {
          e.stopPropagation();
          onDoneRef.current();
        }}
      >
        SKIP
      </button>
    </div>
  );
}
