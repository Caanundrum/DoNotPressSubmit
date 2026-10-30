"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { choiceEnter } from "@/game/motion";
import type { ChoiceDef, ChoiceMotion, GameState } from "@/game/types";
import { audio } from "@/lib/audio";
import { useTimerRegistry } from "@/lib/useTimerRegistry";

/** Ignore clicks while the panel/choices finish settling (Allegiance mis-clicks). */
const CHOICE_ARM_MS = 320;

export function SceneChoiceList({
  choices,
  choiceMotion,
  selected,
  hoverChoice,
  state,
  onPick,
  onHover,
  onState,
}: {
  choices: ChoiceDef[];
  choiceMotion: ChoiceMotion;
  selected: string | null;
  hoverChoice: string | null;
  state: GameState;
  onPick: (c: ChoiceDef) => void;
  onHover: (id: string | null) => void;
  onState: (s: GameState) => void;
}) {
  const timers = useTimerRegistry();
  const [armed, setArmed] = useState(false);
  const choiceKey = choices.map((c) => c.id).join("|");

  useEffect(() => {
    setArmed(false);
    timers.schedule("choice-arm", () => setArmed(true), CHOICE_ARM_MS);
    return () => timers.clear("choice-arm");
  }, [choiceKey, timers]);

  return (
    <div
      className={
        choiceMotion === "scatter"
          ? "relative grid min-h-[140px] gap-1.5 overflow-visible sm:grid-cols-2 sm:gap-2"
          : "grid gap-1.5 overflow-visible pb-1 sm:gap-2"
      }
      data-choice-count={choices.length}
      data-choices-armed={armed ? "true" : "false"}
      data-choice-arm-ms={CHOICE_ARM_MS}
    >
      <AnimatePresence>
        {choices.map((opt, index) => {
          const isSelected = selected === opt.id;
          const isHover = hoverChoice === opt.id;
          const enter = choiceEnter(choiceMotion, index);
          const motionPaused =
            !!selected || isHover || choiceMotion === "static" || choiceMotion === "scatter";
          const locked = !!selected || !armed;
          return (
            <motion.button
              key={opt.id}
              type="button"
              disabled={locked}
              onClick={() => {
                if (!armed || selected) return;
                onPick(opt);
              }}
              onHoverStart={() => {
                if (selected || !armed) return;
                onHover(opt.id);
                audio.play("hover", 0.25);
                if (state.aiMood === "neutral") {
                  onState({ ...state, aiMood: "listening" });
                }
              }}
              onHoverEnd={() => onHover(null)}
              className="group relative max-w-full overflow-visible border px-3 py-2.5 text-left transition disabled:cursor-default disabled:opacity-100 sm:px-4 sm:py-3.5"
              style={{
                // Teal hover border ONLY under the pointer (P1 #15) — danger/unauthorized
                // get a quiet default tell, never a permanent "hovered" cyan rim.
                borderColor: isSelected
                  ? "rgba(110,231,255,0.9)"
                  : isHover
                    ? "rgba(110,231,255,0.85)"
                    : opt.secret
                      ? "rgba(180,120,255,0.55)"
                      : opt.unauthorized || opt.danger
                        ? "rgba(255,140,160,0.42)"
                        : "rgba(200,220,240,0.58)",
                background: isSelected
                  ? "linear-gradient(90deg, rgba(40,90,120,0.88), rgba(16,24,36,0.96))"
                  : "linear-gradient(155deg, rgba(28,40,58,0.98) 0%, rgba(10,14,22,1) 100%)",
                boxShadow: isSelected
                  ? "0 0 0 1px rgba(110,231,255,0.4), 0 0 24px rgba(110,231,255,0.22)"
                  : isHover
                    ? "0 0 0 1px rgba(110,231,255,0.35), 0 0 18px rgba(110,231,255,0.16)"
                    : "0 0 0 1px rgba(0,0,0,0.5) inset, 0 10px 28px rgba(0,0,0,0.45)",
                color: "#f4f7fb",
              }}
              data-choice-hover={isHover ? "true" : "false"}
              data-choice-id={opt.id}
              initial={opt.late ? { opacity: 0, y: 8, scale: 0.98 } : enter.initial}
              animate={
                isSelected
                  ? { opacity: 1, x: 0, y: 0, scale: 1.01 }
                  : motionPaused
                    ? {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: isHover ? 1.015 : 1,
                      }
                    : opt.late
                      ? { opacity: 1, y: 0, scale: 1, x: 0 }
                      : {
                          // Keep opacity locked at 1 during restless/dodge loops.
                          ...enter.animate,
                          opacity: 1,
                        }
              }
              transition={{
                // Bubble leads; choices stagger in after the line reads (overhaul).
                delay: 0.35 + index * 0.05,
                opacity: { duration: 0.35 },
                duration:
                  choiceMotion === "dodge" ? 2.8 : choiceMotion === "restless" ? 0.35 : 0.4,
                // Restless settles after enter — looping x/y ate the first click (Layer 03).
                repeat:
                  !motionPaused && choiceMotion === "dodge" ? Infinity : 0,
                repeatType: "loop",
              }}
              whileHover={!selected ? { x: 1 } : undefined}
            >
              <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
                <span
                  className="min-w-0 flex-1 whitespace-normal break-words text-[15px] font-medium leading-snug tracking-[0.08em] text-[#f4f7fb] sm:text-lg"
                  style={{ fontFamily: "var(--font-display)", overflowWrap: "anywhere" }}
                >
                  {opt.hoverLabel && (isHover || isSelected) ? (
                    <span className="flex flex-col gap-1" data-choice-hover-sabotage="true">
                      <span className="line-through decoration-[#ff5c7a]/80 text-xs text-[#9cb0c9]/70">
                        {opt.label}
                      </span>
                      <span className="text-cyan">{opt.hoverLabel}</span>
                    </span>
                  ) : (
                    opt.label
                  )}
                </span>
                {opt.hoverLabel && (isHover || isSelected) ? (
                  <span
                    data-choice-hover-badge="true"
                    className="shrink-0 rounded-sm border border-cyan/55 bg-cyan/15 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.18em] text-cyan uppercase"
                  >
                    {opt.hoverBadge ?? "EDITED BY ASSISTANT"}
                  </span>
                ) : null}
                {opt.unauthorized ? (
                  <span className="font-mono text-[9px] tracking-widest text-cyan">
                    UNAUTHORIZED?
                  </span>
                ) : null}
                {opt.secret ? (
                  <span
                    className="shrink-0 whitespace-nowrap font-mono text-[12px] tracking-[0.18em] text-[#e0c8ff]"
                    style={{ textShadow: "0 0 8px rgba(180,120,255,0.35)" }}
                    data-side-path-tag="true"
                  >
                    SIDE PATH
                  </span>
                ) : null}
                {isSelected ? (
                  <span className="font-mono text-[9px] tracking-widest text-cyan">
                    LOGGED
                  </span>
                ) : null}
              </div>
              {opt.id === "env-cavern" ? (
                <motion.span
                  className="pointer-events-none absolute right-8 top-2 h-2 w-2 rounded-full bg-cyan/80"
                  animate={{ y: [0, 18], opacity: [1, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }}
                />
              ) : null}
              {(opt.secret || opt.late) && !isSelected ? (
                <span className="pointer-events-none absolute bottom-1 right-2 font-mono text-[8px] tracking-[0.18em] text-cyan/45">
                  {"···"}
                </span>
              ) : null}
              {/* CSS group-hover alone can lag behind dodge motion hit-tests — drive wash from hoverChoice. */}
              <span
                className="pointer-events-none absolute inset-y-0 left-0 bg-cyan/10 transition-all"
                style={{ width: isHover && !selected ? "100%" : "0%" }}
              />
            </motion.button>
          );
        })}
      </AnimatePresence>
      {selected ? (
        <motion.div
          className="mt-1 font-mono text-[11px] tracking-[0.18em] text-cyan"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          RESPONSE LOGGED // LOCAL ONLY
        </motion.div>
      ) : null}
    </div>
  );
}
