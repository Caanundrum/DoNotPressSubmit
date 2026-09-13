"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import type { OrbMood, WorkChoice } from "@/lib/types";
import { AssistantOrb } from "./AssistantOrb";
import { BackgroundGags } from "./BackgroundGags";
import { FacilityBackground } from "./FacilityBackground";

const OPTIONS: { id: Exclude<WorkChoice, null>; label: string; late?: boolean }[] = [
  { id: "quiet", label: "Quiet office" },
  { id: "collaborative", label: "Collaborative office" },
  { id: "remote", label: "Remote" },
  { id: "cavern", label: "Moist cavern", late: true },
];

export function AssessmentScene({
  orbMood,
  choice,
  systemActive,
  onMood,
  onChoice,
  onSystem,
}: {
  orbMood: OrbMood;
  choice: WorkChoice;
  systemActive: boolean;
  onMood: (mood: OrbMood) => void;
  onChoice: (choice: Exclude<WorkChoice, null>) => void;
  onSystem: () => void;
}) {
  const [showCavern, setShowCavern] = useState(false);
  const [aiLine, setAiLine] = useState(
    "Welcome. This assessment is perfectly ordinary. Please select your preferred work environment.",
  );
  const [panelShake, setPanelShake] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowCavern(true);
      setAiLine((prev) =>
        prev.startsWith("Welcome")
          ? "I don't remember adding that."
          : prev,
      );
      onMood("nervous");
    }, 2200);
    return () => clearTimeout(t);
    // One-shot cavern reveal for the vertical slice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (id: Exclude<WorkChoice, null>) => {
    if (choice || systemActive) return;
    audio.play("click", 0.5);
    onChoice(id);
    if (id === "cavern") {
      onMood("amused");
      setAiLine("Of course you did.");
      setPanelShake(true);
      setTimeout(() => setPanelShake(false), 700);
      setTimeout(() => {
        onMood("nervous");
        setAiLine("…that was not supposed to be funny.");
      }, 1600);
      setTimeout(() => {
        onSystem();
      }, 3200);
    } else {
      onMood("listening");
      setAiLine("Noted. A conventional selection. How refreshing.");
      setTimeout(() => {
        onMood("thinking");
        setAiLine("Still… something about this room feels edited.");
      }, 1800);
      setTimeout(() => onSystem(), 3600);
    }
  };

  const displayLine = systemActive ? "…" : aiLine;

  return (
    <div className="absolute inset-0 z-20">
      <FacilityBackground intensity={systemActive ? 0.4 : 1} systemLock={systemActive} />
      <BackgroundGags paused={systemActive} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-4 py-8 lg:flex-row lg:items-end lg:justify-center lg:gap-12 lg:pb-16">
        <motion.div
          className="order-2 lg:order-1"
          animate={systemActive ? { x: [-4, 4, -2, 0], filter: "saturate(0.7)" } : { x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <AssistantOrb mood={systemActive ? "nervous" : orbMood} size={150} />
          <motion.div
            className="glass-panel mt-4 max-w-xs px-4 py-3 text-sm leading-relaxed text-[#d7e6f5]"
            key={displayLine}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-1 font-mono text-[10px] tracking-[0.22em] text-cyan/70">
              ASSISTANT
            </div>
            {displayLine}
          </motion.div>
        </motion.div>

        <motion.div
          className="glass-panel order-1 w-full max-w-xl p-6 sm:p-8 lg:order-2"
          animate={
            panelShake
              ? { rotate: [-0.6, 0.6, -0.3, 0], y: [0, -4, 0] }
              : systemActive
                ? { y: [0, -12, 0], scale: [1, 0.985, 1] }
                : { y: 0 }
          }
          transition={{ duration: panelShake ? 0.5 : 0.8 }}
          style={{
            transformOrigin: "center bottom",
          }}
        >
          <div className="mb-1 font-mono text-[10px] tracking-[0.28em] text-mist/70">
            FORM 01 // ENVIRONMENT PREFERENCE
          </div>
          <h2
            className="mb-6 text-2xl tracking-[0.12em] text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Preferred work environment
          </h2>

          <div className="grid gap-3">
            {OPTIONS.map((opt) => {
              if (opt.late && !showCavern) return null;
              const selected = choice === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  disabled={!!choice || systemActive}
                  onClick={() => pick(opt.id)}
                  onHoverStart={() => {
                    if (!choice) {
                      audio.play("hover", 0.25);
                      onMood("listening");
                    }
                  }}
                  className="group relative overflow-hidden border px-4 py-4 text-left transition disabled:cursor-default"
                  style={{
                    borderColor: selected
                      ? "rgba(110,231,255,0.7)"
                      : opt.id === "cavern"
                        ? "rgba(110,231,255,0.35)"
                        : "rgba(170,200,230,0.16)",
                    background: selected
                      ? "linear-gradient(90deg, rgba(40,90,120,0.45), rgba(20,30,45,0.5))"
                      : "rgba(8,12,20,0.45)",
                  }}
                  initial={opt.late ? { opacity: 0, y: 18, scale: 0.96 } : false}
                  animate={opt.late ? { opacity: 1, y: 0, scale: 1 } : undefined}
                  whileHover={!choice ? { x: 4 } : undefined}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="text-lg tracking-[0.08em] text-[#e8eef8]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {opt.label}
                    </span>
                    {opt.id === "cavern" ? (
                      <span className="font-mono text-[9px] tracking-widest text-cyan/70">
                        UNAUTHORIZED?
                      </span>
                    ) : null}
                  </div>
                  {opt.id === "cavern" ? (
                    <motion.span
                      className="pointer-events-none absolute right-8 top-2 h-2 w-2 rounded-full bg-cyan/80"
                      animate={{ y: [0, 18], opacity: [1, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }}
                    />
                  ) : null}
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-0 bg-cyan/10 transition-all group-hover:w-full" />
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {choice ? (
              <motion.div
                className="mt-5 font-mono text-[11px] tracking-[0.18em] text-mist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                RESPONSE LOGGED // LOCAL ONLY
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
