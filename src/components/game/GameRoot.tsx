"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createInitialState } from "@/game/state";
import { clearSave, loadSave, loadTitleWave, writeSave } from "@/game/storage";
import type { GameState, OrbMood, ShellPhase } from "@/game/types";
import { SKIP_INTRO_KEY } from "@/game/types";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";
import { AudioEnableControl } from "./AudioEnableControl";
import { ChaosSplash } from "./ChaosSplash";
import { HcosSplash } from "./HcosSplash";
import { TitleScreen } from "./TitleScreen";
import { ScenePlayer } from "./scenes/ScenePlayer";

export function GameRoot() {
  const [phase, setPhase] = useState<ShellPhase>("chaos");
  const [orbMood, setOrbMood] = useState<OrbMood>("neutral");
  const [game, setGame] = useState<GameState | null>(null);
  const [hasContinue, setHasContinue] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!loadSave();
  });
  const [titleWave, setTitleWave] = useState(() => {
    if (typeof window === "undefined") return false;
    return loadTitleWave().waved;
  });
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
    speech.cancel();
  }, [phase]);

  useEffect(() => {
    if (game && phase === "playing") {
      writeSave(game);
    }
  }, [game, phase]);

  const warmAudio = useCallback(() => {
    audio.unlock();
  }, []);

  const goTitle = useCallback(() => {
    setPhase("title");
    window.localStorage.setItem(SKIP_INTRO_KEY, "1");
    if (!audio.isMuted()) {
      audio.play("ambience", 0.22);
    }
    setHasContinue(!!loadSave());
    setTitleWave(loadTitleWave().waved);
  }, []);

  const onHoverChange = useCallback((hovering: boolean, ms: number) => {
    if (!hovering) {
      setOrbMood("neutral");
      return;
    }
    setOrbMood(ms > 4500 ? "amused" : "listening");
  }, []);

  const beginNew = useCallback(() => {
    warmAudio();
    speech.cancel();
    clearSave();
    const next = createInitialState();
    setGame(next);
    writeSave(next);
    setHasContinue(true);
    setOrbMood("neutral");
    setPhase("playing");
  }, [warmAudio]);

  const continueAssessment = useCallback(() => {
    warmAudio();
    speech.cancel();
    const saved = loadSave();
    if (!saved) {
      beginNew();
      return;
    }
    setGame(saved);
    setHasContinue(true);
    setOrbMood(saved.aiMood);
    setPhase("playing");
  }, [warmAudio, beginNew]);

  const finishChaos = useCallback(() => {
    warmAudio();
    setPhase("hcos");
  }, [warmAudio]);

  const updateGame = useCallback((next: GameState) => {
    setGame(next);
    setOrbMood(next.aiMood);
  }, []);

  const returnTitle = useCallback(() => {
    speech.cancel();
    setPhase("title");
    setHasContinue(!!loadSave());
    setTitleWave(loadTitleWave().waved);
    setOrbMood(loadTitleWave().waved ? "excited" : "neutral");
  }, []);

  const replay = useCallback(() => {
    speech.cancel();
    clearSave();
    const next = createInitialState();
    setGame(next);
    writeSave(next);
    setHasContinue(true);
    setOrbMood("neutral");
    setPhase("playing");
  }, []);

  const showAudioCorner = phase === "playing" || phase === "hcos";

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
          <motion.div
            key="chaos"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ChaosSplash reducedMotion={reducedMotion} onDone={finishChaos} />
          </motion.div>
        ) : null}

        {phase === "hcos" ? (
          <motion.div
            key="hcos"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
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
            <TitleScreen
              orbMood={orbMood}
              onBegin={beginNew}
              onContinue={hasContinue ? continueAssessment : undefined}
              onHoverChange={onHoverChange}
              escapedBefore={!!loadSave()?.ending && loadSave()?.ending === "escape"}
              assistantWaving={titleWave}
            />
          </motion.div>
        ) : null}

        {phase === "playing" && game ? (
          <motion.div
            key="playing"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <ScenePlayer
              state={game}
              onState={updateGame}
              onTitle={returnTitle}
              onNewGame={replay}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="vignette" />
      <div className="scanlines" />
    </div>
  );
}
