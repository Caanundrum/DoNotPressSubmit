"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveClimaxEnding } from "@/game/endings";
import {
  choiceEnter,
  defaultAnchorForMood,
  orbStageStyle,
  panelLayoutClass,
  panelVariants,
} from "@/game/motion";
import { getScene } from "@/game/scenes";
import { applyEffects, resolveAiLine } from "@/game/state";
import type { ChoiceDef, GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";
import { AssistantOrb } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";
import { FacilityBackground } from "../FacilityBackground";
import { AssessmentReport } from "./AssessmentReport";
import { AuthorityStamp } from "./AuthorityStamp";
import { CheckboxRebellion } from "./CheckboxRebellion";
import { EndingSequence } from "./EndingSequence";
import { EscapingButton } from "./EscapingButton";
import { PeelReveal } from "./PeelReveal";
import { PopupWar } from "./PopupWar";
import { RestlessOptions } from "./RestlessOptions";
import { SubmitClimax } from "./SubmitClimax";

export function ScenePlayer({
  state,
  onState,
  onTitle,
  onNewGame,
}: {
  state: GameState;
  onState: (next: GameState) => void;
  onTitle: () => void;
  onNewGame: () => void;
}) {
  return (
    <ScenePlayerInner
      key={state.sceneId}
      state={state}
      sceneId={state.sceneId}
      onState={onState}
      onTitle={onTitle}
      onNewGame={onNewGame}
    />
  );
}

function ScenePlayerInner({
  state,
  sceneId,
  onState,
  onTitle,
  onNewGame,
}: {
  state: GameState;
  sceneId: string;
  onState: (next: GameState) => void;
  onTitle: () => void;
  onNewGame: () => void;
}) {
  const scene = getScene(sceneId);
  const [selected, setSelected] = useState<string | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [showLate, setShowLate] = useState(() => !scene?.choices?.some((c) => c.late));
  const [lateHint, setLateHint] = useState(false);
  const [panelShake, setPanelShake] = useState(false);
  const [hoverChoice, setHoverChoice] = useState<string | null>(null);
  const advanceTimer = useRef<number | null>(null);

  const go = useCallback(
    (base: GameState, nextId: string, patch?: Partial<GameState>) => {
      const nextScene = getScene(nextId);
      onState({
        ...base,
        ...patch,
        sceneId: nextId,
        act: nextScene?.act ?? base.act,
        aiMood: (patch?.aiMood ?? nextScene?.aiMood ?? base.aiMood) as OrbMood,
      });
    },
    [onState],
  );

  useEffect(() => {
    if (!scene?.choices?.some((c) => c.late)) return;
    // Soft diegetic tell before the unauthorized option materializes.
    const hint = window.setTimeout(() => setLateHint(true), 900);
    const reveal = window.setTimeout(() => setShowLate(true), 1600);
    return () => {
      window.clearTimeout(hint);
      window.clearTimeout(reveal);
    };
  }, [scene]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const aiLine = useMemo(() => {
    if (!scene) return "";
    if (reaction) return reaction;
    return resolveAiLine(scene.aiLine, scene.aiLineIf, state.flags);
  }, [scene, reaction, state.flags]);

  const orbAnchor =
    scene?.orbAnchor ?? defaultAnchorForMood(systemMood(scene?.kind, state.aiMood));
  const orbStyle = orbStageStyle(orbAnchor, systemMood(scene?.kind, state.aiMood));
  const panelMotion = scene?.panelMotion ?? "settle";
  const panelVar = panelVariants(panelMotion);
  const choiceMotion = scene?.choiceMotion ?? "static";

  useEffect(() => {
    if (!scene || scene.kind === "report" || scene.kind === "system") {
      speech.cancel();
      return;
    }
    if (!aiLine) return;
    speech.speak(aiLine);
    return () => speech.cancel();
  }, [aiLine, scene]);

  if (!scene) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-[#c5d3e4]">
        Scene missing: {state.sceneId}
      </div>
    );
  }

  if (scene.kind === "report") {
    return (
      <div className="absolute inset-0 z-20 overflow-hidden">
        <FacilityBackground environment="archive" anomalyLevel={0} intensity={0.4} />
        <AssessmentReport state={state} onTitle={onTitle} onReplay={onNewGame} />
      </div>
    );
  }

  if (scene.kind === "ending" && scene.endingId) {
    return (
      <div className="absolute inset-0 z-20 overflow-hidden">
        <FacilityBackground
          environment={scene.environment}
          anomalyLevel={scene.anomalyLevel ?? 0}
          intensity={0.5}
        />
        <EndingSequence
          endingId={scene.endingId}
          aiLine={aiLine}
          environment={scene.environment}
          onContinue={() => go(state, "report")}
        />
      </div>
    );
  }

  const systemLock = scene.kind === "system";

  const pickChoice = (choice: ChoiceDef) => {
    if (selected) return;
    audio.play("click", 0.5);
    setSelected(choice.id);
    let next = applyEffects(state, choice.effects, choice.id);
    if (choice.effects?.aiLine) {
      setReaction(choice.effects.aiLine);
    }
    if (choice.unauthorized || choice.danger) {
      setPanelShake(true);
      setTimeout(() => setPanelShake(false), 600);
    }
    if (choice.effects?.mood) {
      next = { ...next, aiMood: choice.effects.mood };
      onState(next);
    }
    // Visible select beat before advance — player sees registration.
    const delay = choice.effects?.aiLine ? 1900 : 1100;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      go(next, choice.next, { aiMood: choice.effects?.mood ?? next.aiMood });
    }, delay);
  };

  const continueDialogue = () => {
    if (!scene.next) return;
    audio.play("click", 0.4);
    go(state, scene.next);
  };

  const finishSystem = () => {
    if (!scene.next) return;
    audio.play("click", 0.45);
    speech.cancel();
    go(state, scene.next);
  };

  const onSetpieceDone = () => {
    if (!scene.next) return;
    go(
      {
        ...state,
        counters: {
          ...state.counters,
          forbiddenClicks:
            state.counters.forbiddenClicks +
            (scene.setpiece === "escaping-button" || scene.setpiece === "authority-stamp"
              ? 1
              : 0),
        },
        history: [...state.history, scene.setpiece ?? scene.id],
      },
      scene.next,
    );
  };

  const onClimax = (action: "submit" | "refuse" | "escape" | "disable" | "secret") => {
    const resolved = resolveClimaxEnding(state, action);
    const next: GameState = {
      ...state,
      ending: resolved.ending,
      majorChoices: [...state.majorChoices, `climax:${action}`],
      history: [...state.history, `climax:${action}`],
      counters: {
        ...state.counters,
        systemCompliance:
          state.counters.systemCompliance + (action === "submit" || action === "disable" ? 1 : 0),
        aiCooperation:
          state.counters.aiCooperation +
          (action === "refuse" || action === "escape" || action === "secret" ? 1 : 0),
        attemptedEscape:
          state.counters.attemptedEscape + (action === "escape" || action === "secret" ? 1 : 0),
        secretsFound:
          action === "secret" && !state.secrets.includes("side-path-taken")
            ? state.secrets.length + 1
            : state.counters.secretsFound,
      },
      secrets:
        action === "secret" && !state.secrets.includes("side-path-taken")
          ? [...state.secrets, "side-path-taken"]
          : state.secrets,
      flags: {
        ...state.flags,
        climaxSubmit: action === "submit",
        climaxRefuse: action === "refuse",
      },
      aiMood: (action === "submit" || action === "disable" ? "defeated" : "excited") as OrbMood,
    };
    go(next, resolved.sceneId, { ending: resolved.ending, aiMood: next.aiMood });
  };

  const visibleChoices = scene.choices?.filter((c) => !c.late || showLate) ?? [];
  const hasLatePending = !!scene.choices?.some((c) => c.late) && !showLate;

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      <FacilityBackground
        intensity={systemLock ? 0.4 : 1}
        systemLock={systemLock}
        environment={scene.environment}
        anomalyLevel={scene.anomalyLevel ?? state.act}
      />
      <BackgroundGags paused={systemLock || scene.environment === "sterile"} />

      {/* Stage chrome — decorative, never intercepts clicks */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.28em] text-[#b7c6d8]">
          {`HCOS // ACT ${scene.act} // ${scene.formId ?? scene.id.toUpperCase()}`}
        </div>
        <div className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.22em] text-[#b7c6d8]">
          {"FACILITY STAGE // LIVE"}
        </div>
      </div>

      {/*
        Assistant orb + dialogue: visual layer ONLY.
        pointer-events none so form CTAs under/near the orb stay mouse-hittable.
      */}
      <motion.div
        className="pointer-events-none absolute z-[15] flex flex-col items-center gap-2"
        style={{
          left: orbStyle.left,
          top: orbStyle.top,
          transform: orbStyle.transform,
          width: Math.max(orbStyle.size, 180),
        }}
        animate={
          orbAnchor === "pace"
            ? { x: [-28, 28, -14, 0] }
            : orbAnchor === "flee"
              ? { x: [0, 8, -6, 12, 0], y: [0, -6, 4, 0] }
              : { x: 0, y: 0 }
        }
        transition={
          orbAnchor === "pace" || orbAnchor === "flee"
            ? { duration: orbAnchor === "pace" ? 6.5 : 3.4, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 90, damping: 18 }
        }
        initial={false}
        layout
        aria-hidden
      >
        <AssistantOrb mood={systemLock ? "nervous" : state.aiMood} size={orbStyle.size} />
        <motion.div
          className="glass-panel max-w-[220px] px-3 py-2 text-sm leading-relaxed text-[#d7e6f5]"
          key={aiLine || "silent"}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <div className="mb-1 font-mono text-[9px] tracking-[0.22em] text-cyan/80">
            ASSISTANT
          </div>
          <div className="text-[13px]">{systemLock ? "…" : aiLine || "…"}</div>
        </motion.div>
      </motion.div>

      {/* Assessment panel — interactive layer above decorative orb */}
      <motion.div
        className={`glass-panel assessment-panel absolute z-30 p-4 sm:p-6 ${panelLayoutClass(panelMotion)}`}
        initial={panelVar.initial}
        animate={
          panelShake
            ? { rotate: [-0.7, 0.7, -0.3, 0], y: [0, -6, 0], opacity: 1, x: 0, scale: 1 }
            : panelVar.animate
        }
        transition={
          panelMotion === "drift"
            ? { duration: 9, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 120, damping: 18 }
        }
        style={{ pointerEvents: "auto" }}
      >
        <div className="assessment-panel-inner">
          {scene.formId ? (
            <div className="font-mono text-[10px] tracking-[0.28em] text-[#c5d3e4]">
              {scene.formId}
            </div>
          ) : null}
          {scene.title ? (
            <h2
              className="text-xl tracking-[0.12em] text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {scene.title}
            </h2>
          ) : null}
          {scene.prompt ? (
            <p className="max-w-3xl text-sm leading-snug text-[#d2dceb] sm:text-base">
              {scene.prompt}
            </p>
          ) : null}

          {hasLatePending && lateHint ? (
            <div className="pointer-events-none font-mono text-[9px] tracking-[0.2em] text-cyan/70">
              {"// residual field noise — something wants to be an option"}
            </div>
          ) : null}

          {scene.kind === "choice" ? (
            <div
              className={
                choiceMotion === "scatter"
                  ? "relative grid min-h-[140px] gap-2 sm:grid-cols-2"
                  : "grid gap-2"
              }
            >
              <AnimatePresence>
                {visibleChoices.map((opt, index) => {
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
                      onClick={() => pickChoice(opt)}
                      onHoverStart={() => {
                        if (selected) return;
                        setHoverChoice(opt.id);
                        audio.play("hover", 0.25);
                        if (state.aiMood === "neutral") {
                          onState({ ...state, aiMood: "listening" });
                        }
                      }}
                      onHoverEnd={() =>
                        setHoverChoice((h) => (h === opt.id ? null : h))
                      }
                      className="group relative overflow-hidden border px-4 py-3 text-left transition disabled:cursor-default sm:py-3.5"
                      style={{
                        borderColor: isSelected
                          ? "rgba(110,231,255,0.85)"
                          : opt.secret
                            ? "rgba(180,120,255,0.5)"
                            : opt.unauthorized || opt.danger
                              ? "rgba(110,231,255,0.4)"
                              : "rgba(170,200,230,0.2)",
                        background: isSelected
                          ? "linear-gradient(90deg, rgba(40,90,120,0.55), rgba(20,30,45,0.6))"
                          : "rgba(8,12,20,0.5)",
                        boxShadow: isSelected
                          ? "0 0 0 1px rgba(110,231,255,0.35), 0 0 24px rgba(110,231,255,0.2)"
                          : undefined,
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
                      {/* Soft diegetic tell on secret/late options */}
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
          ) : null}

          {scene.kind === "dialogue" ? (
            <button
              type="button"
              className="mt-1 border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={continueDialogue}
            >
              {scene.continueLabel ?? "CONTINUE"}
            </button>
          ) : null}

          {scene.kind === "setpiece" && scene.setpiece === "escaping-button" ? (
            <EscapingButton onComplete={onSetpieceDone} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "popup-war" ? (
            <PopupWar onComplete={onSetpieceDone} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "checkbox-rebellion" ? (
            <CheckboxRebellion onComplete={onSetpieceDone} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "restless-options" ? (
            <RestlessOptions onComplete={onSetpieceDone} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "authority-stamp" ? (
            <AuthorityStamp onComplete={onSetpieceDone} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "peel-reveal" ? (
            <PeelReveal onComplete={onSetpieceDone} />
          ) : null}

          {scene.kind === "climax" ? (
            <SubmitClimax state={state} aiLine={aiLine} onChoose={onClimax} />
          ) : null}
        </div>
      </motion.div>

      {scene.kind === "system" ? (
        <SystemBeat
          title={scene.systemTitle ?? "SYSTEM OVERRIDE"}
          line={scene.systemLine ?? "CONTINUE ASSESSMENT."}
          onContinue={finishSystem}
        />
      ) : null}
    </div>
  );
}

function systemMood(kind: string | undefined, mood: OrbMood): OrbMood {
  return kind === "system" ? "nervous" : mood;
}

function SystemBeat({
  title,
  line,
  onContinue,
}: {
  title: string;
  line: string;
  onContinue: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(16);
  const [armed, setArmed] = useState(false);
  const interacting = useRef(false);
  const fired = useRef(false);

  const safeContinue = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    audio.play("system", 0.75);
    speech.speak(line, { system: true });
    // Grace period before auto-resume arms — avoids mid-click auto-fire.
    const arm = window.setTimeout(() => setArmed(true), 1800);
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (interacting.current) return s;
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => {
      window.clearTimeout(arm);
      window.clearInterval(tick);
      speech.cancel();
    };
  }, [line]);

  useEffect(() => {
    if (!armed || secondsLeft > 0) return;
    if (interacting.current) return;
    safeContinue();
  }, [armed, secondsLeft, safeContinue]);

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center overflow-hidden pt-[8%] sm:pt-[10%]">
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ backgroundColor: "rgba(255,255,255,0)" }}
        animate={{
          backgroundColor: [
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.18)",
            "rgba(255,176,32,0.12)",
            "rgba(255,176,32,0.08)",
          ],
        }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
      />
      {[18, 28, 38].map((top, i) => (
        <motion.div
          key={top}
          className="pointer-events-none absolute left-[4%] right-[4%] h-px bg-white/70"
          style={{ top: `${top}%` }}
          initial={{ x: i % 2 ? 80 : -80, opacity: 0 }}
          animate={{ x: 0, opacity: 0.85 }}
          transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}
        />
      ))}
      <motion.div
        className="relative z-10 w-[min(94vw,680px)] overflow-hidden border border-white/70 bg-black/90 px-5 py-5 shadow-[0_0_60px_rgba(255,255,255,0.25)]"
        initial={{ opacity: 0, y: -30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 160 }}
        role="alertdialog"
      >
        <div className="font-mono text-[10px] tracking-[0.4em] text-system-warn">{title}</div>
        <div
          className="mt-3 text-xl tracking-[0.2em] text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {line}
        </div>
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onPointerDown={() => {
              interacting.current = true;
            }}
            onPointerUp={() => {
              interacting.current = false;
            }}
            onPointerLeave={() => {
              interacting.current = false;
            }}
            onFocus={() => {
              interacting.current = true;
            }}
            onBlur={() => {
              interacting.current = false;
            }}
            onClick={safeContinue}
            className="border border-white/80 bg-white/10 px-5 py-3 font-mono text-[12px] tracking-[0.28em] text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CONTINUE ASSESSMENT
          </button>
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#c5d3e4]">
            {armed ? `AUTO-RESUME IN ${secondsLeft}s` : "AWAITING ACKNOWLEDGEMENT…"}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
