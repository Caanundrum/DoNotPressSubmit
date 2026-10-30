"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createInitialState, emptyCounters } from "@/game/state";
import { clearSave, loadSave, loadTitleMemory, writeSave } from "@/game/storage";
import type { BeginSeed, EndingId, GameState, OrbMood, ShellPhase } from "@/game/types";
import { SKIP_INTRO_KEY } from "@/game/types";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";
import { AudioEnableControl } from "./AudioEnableControl";
import { ChaosSplash } from "./ChaosSplash";
import { HcosSplash } from "./HcosSplash";
import { TitleScreen } from "./TitleScreen";
import { ScenePlayer } from "./scenes/ScenePlayer";

function moodForTitleEnding(ending: EndingId | null): OrbMood {
  if (ending === "escape") return "excited";
  if (ending === "secret") return "glitching";
  if (ending === "refuse") return "amused";
  if (ending === "submit" || ending === "disable") return "defeated";
  return "neutral";
}

export function GameRoot() {
  const [phase, setPhase] = useState<ShellPhase>("chaos");
  const [orbMood, setOrbMood] = useState<OrbMood>("neutral");
  const [game, setGame] = useState<GameState | null>(null);
  const [hasContinue, setHasContinue] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = loadSave();
    if (!saved) return false;
    if (
      saved.ending ||
      saved.sceneId === "report" ||
      saved.sceneId.startsWith("ending-")
    ) {
      clearSave();
      return false;
    }
    return true;
  });
  const [lastEnding, setLastEnding] = useState<EndingId | null>(() => {
    if (typeof window === "undefined") return null;
    return loadTitleMemory()?.ending ?? null;
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

  /** Unlock + unmute procedural SFX/ambience on assessment start. */
  const armSound = useCallback(() => {
    audio.unlock();
    audio.enableSound();
    speech.setEnabled(true);
  }, []);

  const goTitle = useCallback(() => {
    setPhase("title");
    window.localStorage.setItem(SKIP_INTRO_KEY, "1");
    if (!audio.isMuted()) {
      audio.play("ambience", 0.22);
    }
    setHasContinue(!!loadSave());
    const ending = loadTitleMemory()?.ending ?? null;
    setLastEnding(ending);
    setOrbMood(moodForTitleEnding(ending));
  }, []);

  const onHoverChange = useCallback((hovering: boolean, ms: number) => {
    if (!hovering) {
      setOrbMood("neutral");
      return;
    }
    setOrbMood(ms > 4500 ? "amused" : "listening");
  }, []);

  const beginNew = useCallback(
    (seed?: BeginSeed) => {
      armSound();
      speech.cancel();
      clearSave();
      const counters = { ...emptyCounters(), ...seed?.counters };
      const next = createInitialState({
        flags: { ...seed?.flags },
        counters,
      });
      setGame(next);
      writeSave(next);
      setHasContinue(true);
      setOrbMood("neutral");
      // Corporate boot after Begin — not before title (overhaul).
      setPhase("hcos");
    },
    [armSound],
  );

  const finishHcos = useCallback(() => {
    setPhase("playing");
  }, []);

  const continueAssessment = useCallback(() => {
    armSound();
    speech.cancel();
    const saved = loadSave();
    if (!saved) {
      beginNew();
      return;
    }
    if (
      saved.ending ||
      saved.sceneId === "report" ||
      saved.sceneId.startsWith("ending-")
    ) {
      clearSave();
      beginNew();
      return;
    }
    setGame(saved);
    setHasContinue(true);
    setOrbMood(saved.aiMood);
    setPhase("playing");
  }, [armSound, beginNew]);

  /** Chaos → title directly (skip visible hcos until Begin). */
  const finishChaos = useCallback(() => {
    warmAudio();
    goTitle();
  }, [warmAudio, goTitle]);

  const updateGame = useCallback((next: GameState) => {
    setGame(next);
    setOrbMood(next.aiMood);
  }, []);

  const returnTitle = useCallback(() => {
    speech.cancel();
    const saved = loadSave();
    if (
      saved &&
      (saved.ending ||
        saved.sceneId === "report" ||
        saved.sceneId.startsWith("ending-"))
    ) {
      clearSave();
    }
    setPhase("title");
    setHasContinue(!!loadSave());
    const ending = loadTitleMemory()?.ending ?? null;
    setLastEnding(ending);
    setOrbMood(moodForTitleEnding(ending));
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

  // Corner toggle on title + hcos + playing (overhaul).
  const showAudioCorner = phase === "title" || phase === "playing" || phase === "hcos";

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
            <HcosSplash reducedMotion={reducedMotion} onDone={finishHcos} />
          </motion.div>
        ) : null}

        {phase === "title" ? (
          <motion.div
            key="title"
            className="absolute inset-0"
            initial={{ opacity: 0, filter: "brightness(0.6)" }}
            animate={{ opacity: 1, filter: "brightness(1)" }}
            exit={{ opacity: 0, filter: "brightness(1.45)", scale: 1.02 }}
            transition={{ duration: 0.75 }}
          >
            <TitleScreen
              orbMood={orbMood}
              onBegin={beginNew}
              onContinue={hasContinue ? continueAssessment : undefined}
              onHoverChange={onHoverChange}
              lastEnding={lastEnding}
            />
          </motion.div>
        ) : null}

        {phase === "playing" && game ? (
          <motion.div
            key={`playing-${game.sessionId}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04, filter: "brightness(1.3)" }}
            animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
            transition={{ duration: 0.85 }}
          >
            <ScenePlayer
              key={game.sessionId}
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
