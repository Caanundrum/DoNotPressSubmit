"use client";

import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

/**
 * Chaos Standard studio splash — ported from Chaos_Standard_Home StudioSplashReveal.
 * CRT electron-beam unzip → Bewildered Terminal mark → wordmark glide → fade to HCOS.
 * Timing / motion / composition match Home; skip via click / Esc / Space / Enter / SKIP.
 */
type AnimationStep =
  | "idle"
  | "beam"
  | "blossom"
  | "stabilize"
  | "wordmark"
  | "complete"
  | "fadeout";

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

  const [step, setStep] = useState<AnimationStep>("idle");
  const [telemetry, setTelemetry] = useState("SYS.BOOT_SEQUENCE // CRT_WARMUP");

  useEffect(() => {
    if (reducedMotion) {
      setStep("complete");
      setTelemetry("CHAOS_STANDARD // CALIBRATION_COMPLETE");
      audio.play("logo", 0.4);
      const t = window.setTimeout(() => onDoneRef.current(), 1400);
      return () => window.clearTimeout(t);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onDoneRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Coordinated continuous timeline — matches Home StudioSplashReveal.
    const t1 = window.setTimeout(() => {
      setStep("beam");
      setTelemetry("ELECTRON_BEAM // STABILIZING HORIZONTAL SWEEP");
      audio.play("logo", 0.35);
    }, 200);
    const t2 = window.setTimeout(() => {
      setStep("blossom");
      setTelemetry("DEFLECTION_COILS // RASTER EXPANSION NOMINAL");
    }, 650);
    const t3 = window.setTimeout(() => {
      setStep("stabilize");
      setTelemetry("BEWILDERED_AI_INTERFACE // ONLINE");
      audio.play("hover", 0.25);
    }, 1250);
    const t4 = window.setTimeout(() => {
      setStep("wordmark");
      setTelemetry("CHAOS_STANDARD // COGNITIVE_DISSONANCE_NOMINAL");
      audio.play("logo", 0.5);
    }, 1650);
    const t5 = window.setTimeout(() => {
      setStep("complete");
      setTelemetry("CHAOS_STANDARD // CALIBRATION_COMPLETE");
    }, 2450);
    const t6 = window.setTimeout(() => setStep("fadeout"), 3850);
    const t7 = window.setTimeout(() => onDoneRef.current(), 4450);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
      window.clearTimeout(t6);
      window.clearTimeout(t7);
    };
  }, [reducedMotion]);

  const isRevealed = step !== "idle" && step !== "beam";
  const isWordmarkVisible =
    step === "wordmark" || step === "complete" || step === "fadeout";

  return (
    <div
      className={`absolute inset-0 z-50 flex cursor-pointer select-none flex-col items-center justify-center overflow-hidden bg-[var(--cs-pitch-black)] transition-opacity duration-700 ${
        step === "fadeout" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onClick={() => onDoneRef.current()}
      role="dialog"
      aria-modal="true"
      aria-label="Chaos Standard Reveal"
      data-chaos-splash="true"
      data-chaos-splash-step={step}
    >
      {/* Top telemetry */}
      <div className="absolute left-0 right-0 top-0 z-20 flex h-12 items-center justify-between border-b border-white/5 bg-[#030406]/90 px-5 backdrop-blur-md sm:h-14 sm:px-6">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--cs-slate-standard)]">
          CHAOS_STANDARD // REVEAL_SEQUENCE
        </div>
        <button
          type="button"
          className="rounded bg-white/10 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.12em] text-[var(--cs-text-main)] transition hover:bg-[var(--cs-hazard-orange)] hover:text-[var(--cs-pitch-black)]"
          onClick={(e) => {
            e.stopPropagation();
            onDoneRef.current();
          }}
          data-chaos-splash-skip="true"
        >
          SKIP INTRO
        </button>
      </div>

      {/* Bottom telemetry */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex h-12 items-center justify-between border-t border-white/5 bg-[#030406]/90 px-5 backdrop-blur-md sm:h-14 sm:px-6">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--cs-hazard-orange)]">
          &gt; {telemetry}
        </div>
        <div className="hidden font-mono text-[10px] text-[var(--cs-slate-dim)] sm:block">
          PRESS [ESC] OR CLICK ANYWHERE
        </div>
      </div>

      {/* Ambient hazard radial */}
      <div
        className={`pointer-events-none absolute h-[min(72vw,720px)] w-[min(72vw,720px)] rounded-full blur-[140px] transition-all duration-1000 ${
          step === "idle"
            ? "scale-50 opacity-0"
            : step === "beam"
              ? "scale-75 bg-[var(--cs-hazard-orange)]/10 opacity-40"
              : step === "blossom"
                ? "scale-95 bg-[var(--cs-hazard-orange)]/25 opacity-70"
                : step === "wordmark"
                  ? "scale-110 bg-[var(--cs-hazard-orange)]/35 opacity-90"
                  : "scale-100 bg-[var(--cs-hazard-orange)]/20 opacity-80"
        }`}
        aria-hidden
      />

      <div className="relative z-10 flex max-w-xl flex-col items-center px-4 text-center">
        {/* Bewildered Terminal — CRT clip-path unzip */}
        <div className="relative flex w-48 items-center justify-center sm:w-56">
          <div
            style={{
              clipPath: isRevealed ? "inset(0% 0% 0% 0%)" : "inset(49.2% 0% 49.2% 0%)",
              transition:
                "clip-path 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease-out",
              opacity: step === "idle" ? 0 : step === "beam" ? 0.35 : 1,
              filter: "drop-shadow(0 15px 35px rgba(255,106,0,0.35))",
            }}
            className="h-auto w-full"
            data-chaos-mark="true"
          >
            {/* SVG ships on forge; PNG preferred when present (local/evidence). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/chaos-symbol-dark.svg"
              alt="Chaos Standard Terminal"
              className="block h-auto w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Electron beam streak → vertical blossom */}
          <div
            style={{
              transform: step === "idle" ? "scaleX(0)" : "scaleX(1)",
              opacity:
                step === "idle"
                  ? 0
                  : step === "beam"
                    ? 1
                    : step === "blossom"
                      ? 0.4
                      : 0,
              height:
                step === "blossom" ||
                step === "stabilize" ||
                step === "wordmark" ||
                step === "complete" ||
                step === "fadeout"
                  ? "92%"
                  : "3px",
              transition:
                step === "beam"
                  ? "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease"
                  : "height 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease-out",
            }}
            className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--cs-hazard-orange)] shadow-[0_0_25px_#FF6A00,0_0_50px_#FF6A00]"
            aria-hidden
          />
        </div>

        {/* Wordmark glide — Home dual-tone CHAOS (hazard) + STANDARD (slate) */}
        <div
          style={{
            transform: isWordmarkVisible
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.95)",
            opacity: isWordmarkVisible ? 1 : 0,
            transition:
              "transform 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease-out",
            filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.9))",
          }}
          className="mt-4 flex w-72 flex-col items-center sm:w-96"
          data-chaos-wordmark="true"
        >
          <div className="flex flex-col items-center" data-chaos-wordmark-fallback="true">
            <div
              className="text-glow-hazard text-3xl font-extrabold tracking-[0.28em] text-[var(--cs-hazard-orange)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              CHAOS
            </div>
            <div
              className="mt-1 text-lg font-semibold tracking-[0.42em] text-[var(--cs-slate-standard)] sm:text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              STANDARD
            </div>
          </div>
        </div>

        <div
          style={{
            opacity: step === "complete" || step === "fadeout" ? 1 : 0,
            transition: "opacity 600ms ease-out",
          }}
          className="mt-6 font-mono text-[11px] tracking-[0.3em] text-[var(--cs-slate-standard)]"
          data-chaos-tagline="true"
        >
          A CHAOS STANDARD GAME
        </div>
      </div>
    </div>
  );
}
