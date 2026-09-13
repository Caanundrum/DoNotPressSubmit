"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";
import type { GamePhase, OrbMood, WorkChoice } from "@/lib/types";
import { AssessmentScene } from "./AssessmentScene";
import { AudioEnableControl } from "./AudioEnableControl";
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
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // Cancel speech cleanly on every major phase change.
    speech.cancel();
  }, [phase]);

  const warmAudio = useCallback(() => {
    audio.unlock();
  }, []);

  const goTitle = useCallback(() => {
    setPhase("title");
    window.localStorage.setItem(SKIP_KEY, "1");
    // Ambience only after explicit unmute via AudioEnableControl.
    if (!audio.isMuted()) {
      audio.play("ambience", 0.22);
    }
  }, []);

  const onHoverChange = useCallback((hovering: boolean, ms: number) => {
    if (!hovering) {
      setOrbMood("neutral");
      return;
    }
    setOrbMood(ms > 4500 ? "amused" : "listening");
  }, []);

  const begin = useCallback(() => {
    warmAudio();
    speech.cancel();
    setPhase("assessment");
    setOrbMood("neutral");
    setChoice(null);
    setSystemActive(false);
  }, [warmAudio]);

  const showAudioCorner =
    phase === "assessment" || phase === "system" || phase === "complete" || phase === "hcos";

  return (
    <div
      className="game-shell"
      onPointerDown={warmAudio}
      onKeyDown={warmAudio}
      role="application"
      aria-label="DO NOT PRESS SUBMIT"
    >
      {showAudioCorner ? <AudioEnableControl placement="corner" /> : null}

      <AnimatePresence mode="wait">
        {phase === "chaos" ? (
          <motion.div key="chaos" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <ChaosSplash
              reducedMotion={reducedMotion}
              onDone={() => {
                warmAudio();
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
              hidden={phase === "complete"}
              onMood={setOrbMood}
              onChoice={setChoice}
              onSystem={() => {
                speech.cancel();
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
            speech.cancel();
            setPhase("complete");
            setOrbMood("nervous");
          }}
        />
      ) : null}

      {phase === "complete" ? (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/72 px-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="phase1-complete-title"
        >
          <motion.div
            className="w-[min(92vw,480px)] border border-cyan/35 bg-black/88 px-6 py-5 text-center shadow-[0_0_50px_rgba(110,231,255,0.12)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              id="phase1-complete-title"
              className="font-mono text-[10px] tracking-[0.28em] text-cyan"
            >
              PHASE 1 VERTICAL SLICE COMPLETE
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#d2dceb]">
              Intro → title → assessment → System interruption. Full game content comes after this gate.
            </p>
            <button
              type="button"
              className="mt-5 border border-white/30 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-white transition hover:border-cyan/55"
              onClick={() => {
                audio.play("click", 0.4);
                speech.cancel();
                setChoice(null);
                setSystemActive(false);
                setOrbMood("neutral");
                setPhase("title");
              }}
            >
              RETURN TO TITLE
            </button>
          </motion.div>
        </motion.div>
      ) : null}

      <div className="vignette" />
      <div className="scanlines" />
    </div>
  );
}
