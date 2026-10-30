"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { useTimerRegistry } from "@/lib/useTimerRegistry";

const OPTIONS = [
  { id: "r1", label: "Option A — Definitely stable" },
  { id: "r2", label: "Option B — Calibrating politely" },
  { id: "r3", label: "Option C — Almost holding still" },
];

/**
 * Full-lane travel bounds (`3%` to `58%`) so chips traverse across the arena
 * while keeping the chip card inside the bordered frame on 390px+ viewports.
 */
const X_MIN = 3;
const X_MAX = 58;
const ROWS = [4, 38, 72];
const PIN_X = [4, 20, 10];

/**
 * Post-pin brief settle (`750ms`), pre-release wobble warning (`420ms`),
 * and repeated break-loose window (`2100ms`) whenever 1 or 2 chips are pinned.
 */
const STRAIN_AFTER_PIN_MS = 750;
const STRAIN_WARN_MS = 420;
const BREAK_LOOSE_WINDOW_MS = 2100;

const SLIP_TAUNTS = [
  "Whoops! Looks like that pin slipped. Take your time!",
  "Almost had all three! Slippery CSS today.",
  "Careful — these options have places to be and zero respect for cursor latency.",
  "Oh no, another pin popped loose! Two seconds is a long time in UI physics.",
];

type ChipState = {
  id: string;
  label: string;
  x: number;
  vx: number;
  baseY: number;
  yOffset: number;
  phase: number;
  freqX: number;
  freqY: number;
  pinned: boolean;
  pinnedOrder?: number;
};

export function RestlessOptions({
  onComplete,
  onBeatLine,
}: {
  onComplete: () => void;
  onBeatLine?: (line: string, mood?: OrbMood) => void;
}) {
  const timers = useTimerRegistry();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const pointerPctRef = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);
  const freezeUntilRef = useRef(0);
  const pinSeqRef = useRef(0);
  const tauntIdxRef = useRef(0);

  const [slots, setSlots] = useState<ChipState[]>(() =>
    OPTIONS.map((o, i) => ({
      ...o,
      x: 8 + i * 16,
      vx: (i % 2 === 0 ? 1 : -1) * (1.55 + i * 0.28),
      baseY: ROWS[i] ?? 12 + i * 28,
      yOffset: 0,
      phase: i * 1.9,
      freqX: 0.085 + i * 0.025,
      freqY: 0.11 + i * 0.03,
      pinned: false,
    })),
  );
  const [pins, setPins] = useState(0);
  const [strainingId, setStrainingId] = useState<string | null>(null);
  const [strainTick, setStrainTick] = useState(0);
  const needed = 3;

  // High-speed 30ms (~33fps) physics loop with full-lane travel, weave, and cursor proximity bursts
  useEffect(() => {
    const id = window.setInterval(() => {
      if (doneRef.current) return;
      const now = Date.now();
      const frozen = now < freezeUntilRef.current;
      const ptr = pointerPctRef.current;

      setSlots((prev) =>
        prev.map((s, idx) => {
          if (s.pinned || frozen) return s;

          const nextPhase = s.phase + 1;
          const waveSpeed = Math.sin(nextPhase * s.freqX) * 0.55;
          let burst = 1;

          if (ptr) {
            const chipCenterX = s.x + 18;
            const chipCenterY = s.baseY + s.yOffset + 10;
            const dx = chipCenterX - ptr.x;
            const dy = chipCenterY - ptr.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 26) {
              burst = 1.85;
              // Nudge velocity away from approaching cursor when inside proximity cone
              if (Math.abs(dx) > 2 && Math.sign(dx) !== Math.sign(s.vx)) {
                s = { ...s, vx: -s.vx };
              }
            }
          }

          let nx = s.x + (s.vx + waveSpeed) * burst;
          let nvx = s.vx;
          if (nx <= X_MIN) {
            nx = X_MIN;
            nvx = Math.abs(s.vx);
          } else if (nx >= X_MAX) {
            nx = X_MAX;
            nvx = -Math.abs(s.vx);
          }

          const maxWeave = idx === 1 ? 4.2 : 3.2;
          const nyOffset = Math.sin(nextPhase * s.freqY) * maxWeave;

          return {
            ...s,
            x: nx,
            vx: nvx,
            yOffset: nyOffset,
            phase: nextPhase,
          };
        }),
      );
    }, 30);
    return () => window.clearInterval(id);
  }, []);

  // Wobble ticker while a pinned chip is straining before snapping loose
  useEffect(() => {
    if (!strainingId) return;
    const id = window.setInterval(() => setStrainTick((t) => t + 1), 65);
    return () => window.clearInterval(id);
  }, [strainingId]);

  const scheduleBreakLoose = useCallback(() => {
    timers.clear("strain-warn");
    timers.clear("strain-release");
    setStrainingId(null);

    const warnAtMs = Math.max(400, BREAK_LOOSE_WINDOW_MS - STRAIN_WARN_MS);

    timers.schedule(
      "strain-warn",
      () => {
        if (doneRef.current) return;
        setSlots((current) => {
          const pinnedChips = current
            .filter((c) => c.pinned)
            .sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0));
          if (pinnedChips.length === 0 || pinnedChips.length >= needed) return current;
          const victim = pinnedChips[0];
          setStrainingId(victim.id);
          return current;
        });
      },
      warnAtMs,
    );

    timers.schedule(
      "strain-release",
      () => {
        if (doneRef.current) return;
        let releasedId: string | null = null;
        setSlots((current) => {
          const pinnedChips = current
            .filter((c) => c.pinned)
            .sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0));
          if (pinnedChips.length === 0 || pinnedChips.length >= needed) return current;
          const victim = pinnedChips[0];
          releasedId = victim.id;
          return current.map((s) =>
            s.id === victim.id
              ? {
                  ...s,
                  pinned: false,
                  pinnedOrder: undefined,
                  x: Math.min(X_MAX - 4, Math.max(X_MIN + 4, s.x + 12)),
                  vx: (Math.random() > 0.5 ? 1 : -1) * 1.95,
                }
              : s,
          );
        });

        setStrainingId(null);
        if (releasedId) {
          audio.play("system", 0.25);
          const line = SLIP_TAUNTS[tauntIdxRef.current % SLIP_TAUNTS.length];
          tauntIdxRef.current += 1;
          onBeatLine?.(line, "amused");
          setPins((prevPins) => {
            const nextPins = Math.max(0, prevPins - 1);
            if (nextPins > 0 && nextPins < needed && !doneRef.current) {
              scheduleBreakLoose();
            }
            return nextPins;
          });
        }
      },
      BREAK_LOOSE_WINDOW_MS,
    );
  }, [needed, onBeatLine, timers]);

  const pin = (optId: string) => {
    if (doneRef.current) return;
    const target = slots.find((s) => s.id === optId);
    if (!target || target.pinned) return;

    audio.play("click", 0.45);
    freezeUntilRef.current = Date.now() + STRAIN_AFTER_PIN_MS;
    pinSeqRef.current += 1;
    const order = pinSeqRef.current;

    const nextSlots = slots.map((s, idx) =>
      s.id === optId
        ? {
            ...s,
            pinned: true,
            pinnedOrder: order,
            x: PIN_X[idx] ?? 6,
            yOffset: 0,
          }
        : s,
    );
    setSlots(nextSlots);

    const nextPins = nextSlots.filter((s) => s.pinned).length;
    setPins(nextPins);
    setStrainingId(null);
    timers.clear("strain-warn");
    timers.clear("strain-release");

    if (nextPins >= needed) {
      doneRef.current = true;
      onBeatLine?.("Wait—you actually pinned all three?! Those were supposed to be greased!", "nervous");
      timers.schedule("complete", () => onComplete(), 520);
      return;
    }

    scheduleBreakLoose();
  };

  return (
    <div
      ref={arenaRef}
      className="relative mt-2 h-48 w-full overflow-hidden rounded-sm bg-black/50 p-2 sm:h-52"
      style={{
        border: "1px solid rgba(110,231,255,0.42)",
        boxShadow: "inset 0 -1px 0 rgba(110,231,255,0.45)",
      }}
      data-restless-options="true"
      data-restless-arena-border="true"
      data-restless-pin-lanes="true"
      onPointerMove={(e) => {
        const rect = arenaRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) return;
        pointerPctRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        };
      }}
      onPointerLeave={() => {
        pointerPctRef.current = null;
      }}
    >
      {slots.map((opt) => {
        const isStraining = opt.pinned && strainingId === opt.id;
        const wobbleX = isStraining ? (strainTick % 2 === 0 ? -4 : 4) : 0;
        const wobbleRot = isStraining ? (strainTick % 2 === 0 ? -1.8 : 1.8) : 0;
        const topPct = opt.pinned ? opt.baseY : Math.max(2, Math.min(78, opt.baseY + opt.yOffset));
        return (
          <button
            key={opt.id}
            type="button"
            disabled={opt.pinned}
            data-restless-chip={opt.id}
            data-restless-chip-wobble={isStraining ? "true" : undefined}
            onPointerDown={(e) => {
              e.stopPropagation();
              pin(opt.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              pin(opt.id);
            }}
            style={{
              left: `${opt.x}%`,
              top: `${topPct}%`,
              minHeight: 36,
              padding: "6px 12px",
              transform: isStraining
                ? `translateX(${wobbleX}px) rotate(${wobbleRot}deg)`
                : undefined,
              transition: opt.pinned
                ? "left 0.14s ease-out, top 0.14s ease-out, transform 0.06s linear"
                : "none",
            }}
            className={`absolute max-w-[min(86%,275px)] cursor-pointer border text-left font-mono text-[10px] leading-snug tracking-[0.08em] whitespace-normal break-words sm:max-w-[305px] sm:text-[11px] ${
              isStraining
                ? "border-amber-300/90 bg-amber-400/20 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.35)]"
                : opt.pinned
                  ? "border-cyan/70 bg-cyan/20 text-white shadow-[0_0_14px_rgba(110,231,255,0.22)]"
                  : "border-white/25 bg-[#0e1520]/95 text-[#d8e3f2] hover:border-cyan/75 hover:bg-cyan/15"
            }`}
          >
            {isStraining
              ? `STRAINING... // ${opt.label}`
              : opt.pinned
                ? `PINNED ✓ // ${opt.label}`
                : opt.label}
          </button>
        );
      })}
      <div
        className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-[#b8c6d8]"
        data-restless-hint-pad="16"
      >
        <span>
          {strainingId
            ? "HOLDING… PIN SLIPPING! LOCK THE NEXT ANSWER!"
            : "Catch each moving answer to pin it (~2.1s before pins slip)."}
        </span>
        <span data-restless-straining={strainingId ? "true" : "false"}>
          Pinned {pins}/{needed}
        </span>
      </div>
    </div>
  );
}
