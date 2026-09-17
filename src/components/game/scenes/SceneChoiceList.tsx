"use client";

import { AnimatePresence, motion } from "framer-motion";
import { choiceEnter } from "@/game/motion";
import type { ChoiceDef, ChoiceMotion, GameState } from "@/game/types";
import { audio } from "@/lib/audio";

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
  return (
    <div
      className={
        choiceMotion === "scatter"
          ? "relative grid min-h-[140px] gap-2 sm:grid-cols-2"
          : "grid gap-2"
      }
    >
      <AnimatePresence>
        {choices.map((opt, index) => {
          const isSelected = selected === opt.id;
          const isHover = hoverChoice === opt.id;
          const enter = choiceEnter(choiceMotion, index);
          const motionPaused =
            !!selected || isHover || choiceMotion === "static" || choiceMotion === "scatter";
          return (
            <motion.button
              key={opt.id}
              type="button"
              disabled={!!selected}
              onClick={() => onPick(opt)}
              onHoverStart={() => {
                if (selected) return;
                onHover(opt.id);
                audio.play("hover", 0.25);
                if (state.aiMood === "neutral") {
                  onState({ ...state, aiMood: "listening" });
                }
              }}
              onHoverEnd={() => onHover(null)}
              className="group relative overflow-hidden border px-4 py-3 text-left transition disabled:cursor-default sm:py-3.5"
              style={{
                borderColor: isSelected
                  ? "rgba(110,231,255,0.85)"
                  : opt.secret
                    ? "rgba(180,120,255,0.65)"
                    : opt.unauthorized || opt.danger
                      ? "rgba(110,231,255,0.55)"
                      : "rgba(190,215,240,0.48)",
                background: isSelected
                  ? "linear-gradient(90deg, rgba(40,90,120,0.75), rgba(20,30,45,0.85))"
                  : "linear-gradient(155deg, rgba(22,32,48,0.92) 0%, rgba(10,14,22,0.94) 100%)",
                boxShadow: isSelected
                  ? "0 0 0 1px rgba(110,231,255,0.35), 0 0 24px rgba(110,231,255,0.2)"
                  : "0 0 0 1px rgba(0,0,0,0.35) inset, 0 8px 24px rgba(0,0,0,0.35)",
              }}
              initial={opt.late ? { opacity: 0, y: 14, scale: 0.97 } : enter.initial}
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
                      ? { opacity: 1, y: 0, scale: 1 }
                      : enter.animate
              }
              transition={{
                delay: index * 0.04,
                duration:
                  choiceMotion === "restless" || choiceMotion === "dodge" ? 2.8 : 0.4,
                repeat:
                  !motionPaused &&
                  (choiceMotion === "restless" || choiceMotion === "dodge")
                    ? Infinity
                    : 0,
              }}
              whileHover={!selected ? { x: 3 } : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="text-base tracking-[0.08em] text-[#e8eef8] sm:text-lg"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {opt.label}
                </span>
                {opt.unauthorized ? (
                  <span className="font-mono text-[9px] tracking-widest text-cyan">
                    UNAUTHORIZED?
                  </span>
                ) : null}
                {opt.secret ? (
                  <span className="font-mono text-[9px] tracking-widest text-[#d0b4ff]">
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
              <span className="pointer-events-none absolute inset-y-0 left-0 w-0 bg-cyan/10 transition-all group-hover:w-full" />
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
