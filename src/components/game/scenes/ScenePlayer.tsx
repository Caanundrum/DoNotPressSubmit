"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [panelShake, setPanelShake] = useState(false);
  const [dodgeNudge, setDodgeNudge] = useState(0);

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
    const t = setTimeout(() => setShowLate(true), 1600);
    return () => clearTimeout(t);
  }, [scene]);

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
      <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-mist">
        Scene missing: {state.sceneId}
      </div>
    );
  }

  if (scene.kind === "report") {
    return (
      <div className="absolute inset-0 z-20">
        <FacilityBackground environment="archive" anomalyLevel={0} intensity={0.4} />
        <AssessmentReport state={state} onTitle={onTitle} onReplay={onNewGame} />
      </div>
    );
  }

  if (scene.kind === "ending" && scene.endingId) {
    return (
      <div className="absolute inset-0 z-20">
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
    const delay = choice.effects?.aiLine ? 1700 : 750;
    setTimeout(() => {
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

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      <FacilityBackground
        intensity={systemLock ? 0.4 : 1}
        systemLock={systemLock}
        environment={scene.environment}
        anomalyLevel={scene.anomalyLevel ?? state.act}
      />
      <BackgroundGags paused={systemLock || scene.environment === "sterile"} />

      {/* Full-viewport facility stage — no max-width card shell */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.28em] text-[#9eb0c4]/80">
          {`HCOS // ACT ${scene.act} // ${scene.formId ?? scene.id.toUpperCase()}`}
        </div>
        <div className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.22em] text-[#9eb0c4]/70">
          {"FACILITY STAGE // LIVE"}
        </div>
      </div>

      {/* Moving assistant + speech bubble (speech tracks orb) */}
      <motion.div
        className="absolute z-30 flex flex-col items-center gap-3"
        style={{
          left: orbStyle.left,
          top: orbStyle.top,
          transform: orbStyle.transform,
          width: Math.max(orbStyle.size, 200),
        }}
        animate={
          orbAnchor === "pace"
            ? { x: [-40, 40, -20, 0] }
            : orbAnchor === "flee"
              ? { x: [0, 12, -8, 18, 0], y: [0, -10, 6, 0] }
              : { x: 0, y: 0 }
        }
        transition={
          orbAnchor === "pace" || orbAnchor === "flee"
            ? { duration: orbAnchor === "pace" ? 5.5 : 2.8, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 90, damping: 18 }
        }
        initial={false}
        layout
      >
        <AssistantOrb
          mood={systemLock ? "nervous" : state.aiMood}
          size={orbStyle.size}
        />
        <motion.div
          className="glass-panel pointer-events-none max-w-[240px] px-3 py-2 text-sm leading-relaxed text-[#d7e6f5]"
          key={aiLine || "silent"}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <div className="mb-1 font-mono text-[9px] tracking-[0.22em] text-cyan/70">
            ASSISTANT
          </div>
          <div className="text-[13px]">{systemLock ? "…" : aiLine || "…"}</div>
        </motion.div>
      </motion.div>

      {/* Assessment panel — free on the stage */}
      <motion.div
        className={`glass-panel absolute z-20 max-h-[86vh] overflow-y-auto p-6 sm:p-9 ${panelLayoutClass(panelMotion)}`}
        initial={panelVar.initial}
        animate={
          panelShake
            ? { rotate: [-0.7, 0.7, -0.3, 0], y: [0, -6, 0], opacity: 1, x: 0, scale: 1 }
            : panelVar.animate
        }
        transition={
          panelMotion === "drift"
            ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 120, damping: 18 }
        }
        style={{ pointerEvents: "auto" }}
      >
        {scene.formId ? (
          <div className="mb-1 font-mono text-[10px] tracking-[0.28em] text-[#c5d3e4]">
            {scene.formId}
          </div>
        ) : null}
        {scene.title ? (
          <h2
            className="mb-3 text-2xl tracking-[0.12em] text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {scene.title}
          </h2>
        ) : null}
        {scene.prompt ? (
          <p className="mb-5 max-w-3xl text-base leading-relaxed text-[#d2dceb] sm:text-lg">
            {scene.prompt}
          </p>
        ) : null}

        {scene.kind === "choice" ? (
          <div
            className={
              choiceMotion === "scatter"
                ? "relative grid min-h-[200px] gap-3 sm:grid-cols-2"
                : "grid gap-3"
            }
          >
            <AnimatePresence>
              {visibleChoices.map((opt, index) => {
                const isSelected = selected === opt.id;
                const enter = choiceEnter(choiceMotion, index);
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    disabled={!!selected}
                    onClick={() => pickChoice(opt)}
                    onHoverStart={() => {
                      if (!selected) {
                        audio.play("hover", 0.25);
                        if (choiceMotion === "dodge") {
                          setDodgeNudge((n) => n + 1);
                        }
                        if (state.aiMood === "neutral") {
                          onState({ ...state, aiMood: "listening" });
                        }
                      }
                    }}
                    className="group relative overflow-hidden border px-4 py-4 text-left transition disabled:cursor-default"
                    style={{
                      borderColor: isSelected
                        ? "rgba(110,231,255,0.7)"
                        : opt.secret
                          ? "rgba(180,120,255,0.45)"
                          : opt.unauthorized || opt.danger
                            ? "rgba(110,231,255,0.35)"
                            : "rgba(170,200,230,0.16)",
                      background: isSelected
                        ? "linear-gradient(90deg, rgba(40,90,120,0.45), rgba(20,30,45,0.5))"
                        : "rgba(8,12,20,0.45)",
                    }}
                    initial={opt.late ? { opacity: 0, y: 18, scale: 0.96 } : enter.initial}
                    animate={
                      choiceMotion === "dodge" && !selected
                        ? {
                            opacity: 1,
                            x: (dodgeNudge + index) % 2 ? 14 : -10,
                            y: enter.animate && "y" in enter.animate ? 0 : 0,
                          }
                        : opt.late
                          ? { opacity: 1, y: 0, scale: 1 }
                          : enter.animate
                    }
                    transition={{
                      delay: index * 0.05,
                      duration: choiceMotion === "restless" ? 2.4 : 0.45,
                      repeat: choiceMotion === "restless" && !selected ? Infinity : 0,
                    }}
                    whileHover={!selected && choiceMotion !== "dodge" ? { x: 4 } : undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-lg tracking-[0.08em] text-[#e8eef8] sm:text-xl"
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
                        <span className="font-mono text-[9px] tracking-widest text-[#c9a0ff]">
                          SIDE PATH
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
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-0 bg-cyan/10 transition-all group-hover:w-full" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {selected ? (
              <div className="mt-2 font-mono text-[11px] tracking-[0.18em] text-[#c5d3e4]">
                RESPONSE LOGGED // LOCAL ONLY
              </div>
            ) : null}
          </div>
        ) : null}

        {scene.kind === "dialogue" ? (
          <button
            type="button"
            className="mt-2 border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20"
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
  const [secondsLeft, setSecondsLeft] = useState(14);

  useEffect(() => {
    audio.play("system", 0.75);
    speech.speak(line, { system: true });
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const auto = window.setTimeout(onContinue, 14000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(auto);
      speech.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center pt-[10%] sm:pt-[12%]">
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
        className="relative z-10 w-[min(96vw,720px)] border border-white/70 bg-black/85 px-6 py-5 shadow-[0_0_60px_rgba(255,255,255,0.25)]"
        initial={{ opacity: 0, y: -30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 160 }}
        role="alertdialog"
      >
        <div className="font-mono text-[10px] tracking-[0.4em] text-system-warn">{title}</div>
        <div
          className="mt-3 text-2xl tracking-[0.2em] text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {line}
        </div>
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onContinue}
            className="border border-white/80 bg-white/10 px-5 py-3 font-mono text-[12px] tracking-[0.28em] text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CONTINUE ASSESSMENT
          </button>
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#aebcce]">
            AUTO-RESUME IN {secondsLeft}s
          </div>
        </div>
      </motion.div>
    </div>
  );
}
