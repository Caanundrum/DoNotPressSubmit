"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import type { GamePhase, OrbMood, WorkChoice } from "@/lib/types";
import { AssessmentScene } from "./AssessmentScene";
import { ChaosSplash } from "./ChaosSplash";
import { HcosSplash } from "./HcosSplash";
import { SystemInterruption } from "./SystemInterruption";
import { TitleScreen } from "./TitleScreen";

const SKIP_KEY = "dnps-skip-intros";

export function GameRoot() {
  const [phase, setPhase] = useState<GamePhase>("chaos");
  const [orbMood, setOrbMood] = useState<OrbMood>("neutral");
  const [choice, setChoice] = useState<WorkChoice>(null);
  const [systemActive, setSystemActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    if (window.localStorage.getItem(SKIP_KEY) === "1") {
      // After first viewing, intros are skippable faster via button; still show title.
    }
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const armAudio = useCallback(() => {
    if (armed) return;
    setArmed(true);
    audio.unlock();
  }, [armed]);

  const goTitle = useCallback(() => {
    setPhase("title");
    audio.play("ambience", 0.22);
    window.localStorage.setItem(SKIP_KEY, "1");
  }, []);

  const onHoverChange = useCallback((hovering: boolean, ms: number) => {
    if (!hovering) {
      setOrbMood("neutral");
      return;
    }
    setOrbMood(ms > 4500 ? "amused" : "listening");
  }, []);

  const begin = useCallback(() => {
    armAudio();
    setPhase("assessment");
    setOrbMood("neutral");
    setChoice(null);
    setSystemActive(false);
  }, [armAudio]);

  return (
    <div
      className="game-shell"
      onPointerDown={armAudio}
      onKeyDown={armAudio}
      role="application"
      aria-label="DO NOT PRESS SUBMIT"
    >
      <AnimatePresence mode="wait">
        {phase === "chaos" ? (
          <motion.div key="chaos" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <ChaosSplash
              reducedMotion={reducedMotion}
              onDone={() => {
                armAudio();
                setPhase("hcos");
              }}
            />
          </motion.div>
        ) : null}

        {phase === "hcos" ? (
          <motion.div key="hcos" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <HcosSplash reducedMotion={reducedMotion} onDone={goTitle} />
          </motion.div>
        ) : null}

        {phase === "title" ? (
          <motion.div
            key="title"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "brightness(1.4)" }}
            transition={{ duration: 0.6 }}
          >
            <TitleScreen orbMood={orbMood} onBegin={begin} onHoverChange={onHoverChange} />
          </motion.div>
        ) : null}

        {phase === "assessment" || phase === "system" || phase === "complete" ? (
          <motion.div
            key="assessment"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <AssessmentScene
              orbMood={orbMood}
              choice={choice}
              systemActive={systemActive}
              onMood={setOrbMood}
              onChoice={setChoice}
              onSystem={() => {
                setSystemActive(true);
                setPhase("system");
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {phase === "system" ? (
        <SystemInterruption
          onDone={() => {
            setPhase("complete");
            setOrbMood("nervous");
          }}
        />
      ) : null}

      {phase === "complete" ? (
        <motion.div
          className="absolute bottom-8 left-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 border border-cyan/30 bg-black/75 px-5 py-4 text-center backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="font-mono text-[10px] tracking-[0.28em] text-cyan/80">
            PHASE 1 VERTICAL SLICE COMPLETE
          </div>
          <p className="mt-2 text-sm text-mist">
            Intro → title → assessment → System interruption. Full game content comes after this gate.
          </p>
          <button
            type="button"
            className="mt-4 border border-white/20 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-white hover:border-cyan/50"
            onClick={() => {
              audio.play("click", 0.4);
              setChoice(null);
              setSystemActive(false);
              setOrbMood("neutral");
              setPhase("title");
            }}
          >
            RETURN TO TITLE
          </button>
        </motion.div>
      ) : null}

      <div className="vignette" />
      <div className="scanlines" />
    </div>
  );
}
