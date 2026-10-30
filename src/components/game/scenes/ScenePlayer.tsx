"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveClimaxEnding } from "@/game/endings";
import {
  defaultAnchorForMood,
  orbStageStyle,
  panelVariants,
  assistantSafeSide,
} from "@/game/motion";
import { getScene } from "@/game/scenes";
import { applyEffects, pathResidueKind, resolveAiLine } from "@/game/state";
import { rememberTitleEnding } from "@/game/storage";
import type { ChoiceDef, GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";
import { useTimerRegistry } from "@/lib/useTimerRegistry";
import { endingLineId, pokeLineId, sceneLineId, voiceMoodFromOrb } from "@/lib/voiceIds";
import { FacilityBackground } from "../FacilityBackground";
import { AssessmentReport } from "./AssessmentReport";
import { EndingSequence } from "./EndingSequence";
import { ScenePlayerView } from "./ScenePlayerView";
import {
  applyAmbientClick,
  applyOrbPoke,
  applyRoamerCatch,
  choiceGlance,
  choiceMoodFlash,
} from "./sceneAmbient";
import type { ChoiceFlush } from "../AssistantOrb";
import type { GlassPhase } from "./GlassStitchOverlay";

/**
 * Compute readable post-selection hold duration scaled to reaction text length
 * (~16ms/char typing + ~42ms/char reading time, clamped between 2600ms and 4800ms).
 */
export function computeReactionHoldMs(reactionText?: string | null): number {
  if (!reactionText) return 900;
  return Math.min(4800, Math.max(2600, 1200 + reactionText.length * 42));
}

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
  const timers = useTimerRegistry();
  const [selected, setSelected] = useState<string | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [canSkipReaction, setCanSkipReaction] = useState(false);
  /** Reaction / poke lines are scene-scoped — never leak into the next beat. */
  const [lineSceneId, setLineSceneId] = useState(sceneId);
  const [showLate, setShowLate] = useState(() => !scene?.choices?.some((c) => c.late));
  const [lateHint, setLateHint] = useState(false);
  const [panelShake, setPanelShake] = useState(false);
  const [hoverChoice, setHoverChoice] = useState<string | null>(null);
  const [pokeFlinch, setPokeFlinch] = useState(false);
  const [pokeNotice, setPokeNotice] = useState<string | null>(null);
  /** Separate channel for background easter-egg remarks so they never overwrite aiLine. */
  const [ambientAside, setAmbientAside] = useState<string | null>(null);
  const [companionReady, setCompanionReady] = useState(false);
  const [watchedPulse, setWatchedPulse] = useState(false);
  const [glassPhase, setGlassPhase] = useState<GlassPhase>("idle");
  const [chamberStatus, setChamberStatus] = useState<string | null>(null);
  const [choiceFlush, setChoiceFlush] = useState<ChoiceFlush>("neutral");
  const [choiceGlanceBoost, setChoiceGlanceBoost] = useState(0);
  const pendingAdvanceRef = useRef<(() => void) | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const go = useCallback(
    (base: GameState, nextId: string, patch?: Partial<GameState>) => {
      pendingAdvanceRef.current = null;
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

  const onSkipReaction = useCallback(() => {
    if (!canSkipReaction || !pendingAdvanceRef.current) return;
    timers.clear("advance");
    timers.clear("can-skip-reaction");
    const advance = pendingAdvanceRef.current;
    pendingAdvanceRef.current = null;
    setCanSkipReaction(false);
    audio.play("click", 0.35);
    advance();
  }, [canSkipReaction, timers]);

  useEffect(() => {
    if (!scene?.choices?.some((c) => c.late)) return;
    timers.schedule("late-hint", () => setLateHint(true), 900);
    timers.schedule("late-reveal", () => setShowLate(true), 1600);
    return () => {
      timers.clear("late-hint");
      timers.clear("late-reveal");
    };
  }, [scene, timers]);

  // Per-scene bubble: clear sticky reaction / poke lines when the beat changes.
  useEffect(() => {
    timers.clearAll();
    pendingAdvanceRef.current = null;
    setReaction(null);
    setCanSkipReaction(false);
    setPokeNotice(null);
    setAmbientAside(null);
    setSelected(null);
    setLineSceneId(sceneId);
    setShowLate(!getScene(sceneId)?.choices?.some((c) => c.late));
    setLateHint(false);
    setCompanionReady(false);
    setWatchedPulse(false);
    setGlassPhase("idle");
    setChoiceFlush("neutral");
    setChoiceGlanceBoost(0);
  }, [sceneId, timers]);

  useEffect(() => {
    if (scene?.kind !== "companion") return;
    timers.schedule(
      "companion-ready",
      () => setCompanionReady(true),
      scene.companion === "wait" ? 2200 : 1400,
    );
    timers.schedule("companion-pulse", () => setWatchedPulse(true), 650);
    return () => {
      timers.clear("companion-ready");
      timers.clear("companion-pulse");
    };
  }, [scene, timers]);

  const aiLine = useMemo(() => {
    if (!scene) return "";
    const sceneOwned = lineSceneId === sceneId;
    // Post-selection reactions always outrank temporary orb poke notices.
    if (sceneOwned && reaction) return reaction;
    if (sceneOwned && pokeNotice) return pokeNotice;
    return resolveAiLine(scene.aiLine, scene.aiLineIf, state.flags);
  }, [scene, sceneId, lineSceneId, reaction, pokeNotice, state.flags]);

  const spotlight = !!scene?.spotlight || scene?.kind === "companion" || scene?.orbAnchor === "spotlight";
  const orbAnchor =
    scene?.orbAnchor ??
    (spotlight ? "spotlight" : defaultAnchorForMood(systemMood(scene?.kind, state.aiMood)));
  const buryAssistant = !!scene?.buryAssistant || scene?.kind === "system";
  const safeSide = assistantSafeSide(orbAnchor, spotlight);
  const orbStyle = orbStageStyle(
    orbAnchor,
    systemMood(scene?.kind, state.aiMood),
    spotlight,
  );
  const panelMotion = scene?.panelMotion ?? "settle";
  const panelVar = panelVariants(panelMotion);
  const choiceMotion = scene?.choiceMotion ?? "static";
  const pokeable =
    scene?.kind !== "system" &&
    scene?.kind !== "climax" &&
    scene?.kind !== "ending" &&
    scene?.kind !== "report" &&
    scene?.orbPokeable !== false &&
    (scene?.kind !== "setpiece" || scene?.orbPokeable === true) &&
    (!buryAssistant || scene?.orbPokeable === true);

  useEffect(() => {
    if (!scene || scene.kind === "report" || scene.kind === "system") {
      speech.cancel();
      return;
    }
    if (pokeNotice && !reaction) {
      speech.speakLine({
        lineId: pokeLineId(pokeNotice),
        text: pokeNotice,
        orbMood: state.aiMood,
      });
      return () => speech.cancel();
    }
    if (!aiLine) return;
    const lineId =
      scene.kind === "ending" && scene.endingId
        ? endingLineId(scene.endingId)
        : sceneLineId(scene.id);
    speech.speakLine({
      lineId,
      text: aiLine,
      orbMood: state.aiMood,
      mood: voiceMoodFromOrb(state.aiMood),
    });
    return () => speech.cancel();
  }, [aiLine, scene, pokeNotice, reaction, state.aiMood]);

  const onAmbient = useCallback(
    (id: string, secret?: string) => {
      const current = stateRef.current;
      const next = applyAmbientClick(current, id, secret);
      stateRef.current = next;
      onState(next);
      const asides: Record<string, string> = {
        "chamber-07": "Session telemetry blinked at you. Rude architecture.",
        "dashed-frame": "Dashes mean 'temporary.' Everything here is temporary.",
        "everything-fine": "Status lies for a living. Relatable.",
        "queue-counter": "Empty queues still bill hours.",
        "coffee-mug": "Coffee is the only honest chemical in this room.",
        "kill-path": "You saw the kill path. That's the Submit hallway with better branding.",
        "do-not-press": "Propaganda that begs to be poked. Amateur hour.",
        "monitor-frame": "Pretty frame. Expensive liar.",
        "server-bars": "The stacks like an audience. Don't encourage them.",
        "rail-glow": "Even the rails gossip.",
        "replacement-failed": "That drone and I share a performance review.",
        "printer-scissors": "Scissors en route is never a good memo.",
        "corridor-etiquette": "Corridor etiquette: infinite politeness, zero throughput.",
        "containment-fine": "Unsolicited reassurance from Bay 03. Don't trust architecture.",
      };
      const aside = asides[id];
      if (aside) {
        // Render in separate ASIDE // INTERJECTION channel so active question prompt is never erased.
        setAmbientAside(aside);
        timers.schedule("ambient-aside", () => setAmbientAside(null), 3200);
      }
    },
    [onState, timers],
  );

  const onRoamer = useCallback(
    (kind: string, secret?: string) => {
      const current = stateRef.current;
      const next = applyRoamerCatch(current, kind, secret);
      stateRef.current = next;
      onState(next);
    },
    [onState],
  );

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
          onContinue={() => {
            if (scene.endingId) rememberTitleEnding(scene.endingId);
            go(state, "report");
          }}
        />
      </div>
    );
  }

  const systemLock = scene.kind === "system";
  const companion = scene.kind === "companion";

  const onOrbPoke = () => {
    if (!pokeable) return;
    setPokeFlinch(true);
    timers.schedule("poke-flinch", () => setPokeFlinch(false), 520);
    const current = stateRef.current;
    const pokes = (current.counters.orbPokes ?? 0) + 1;
    const currentLine =
      pokeNotice ?? reaction ?? resolveAiLine(scene?.aiLine, scene?.aiLineIf, current.flags);
    const { next, notice, glassEvent, chamberStatus: status } = applyOrbPoke(
      current,
      pokes,
      currentLine,
    );
    stateRef.current = next;
    onState(next);
    setLineSceneId(sceneId);
    setPokeNotice(notice);
    // Auto-restore active question prompt after 2600ms so orb pokes never permanently erase the prompt.
    timers.schedule("poke-notice", () => setPokeNotice(null), 2600);

    if (glassEvent === "crack" || glassEvent === "stitch") {
      setPanelShake(true);
      timers.schedule("panel-shake", () => setPanelShake(false), 600);
      if (glassEvent === "crack") {
        setGlassPhase("crack");
        timers.schedule(
          "glass-phase",
          () => {
            setGlassPhase((p) => (p === "crack" ? "idle" : p));
          },
          4500,
        );
      } else {
        setGlassPhase("stitch");
        const holdMs = next.flags.orbFiledTicket ? 5500 : 6500;
        timers.schedule(
          "glass-phase",
          () => {
            setGlassPhase("idle");
          },
          holdMs,
        );
      }
    }
    if (status) {
      setChamberStatus(status);
      timers.schedule("chamber-status", () => setChamberStatus(null), 3600);
    }
  };

  const finishCompanion = (choiceId?: string) => {
    if (selected) return;
    if (!scene.next && !(choiceId && scene.choices)) return;
    audio.play("click", 0.4);
    setPokeNotice(null);
    timers.clear("poke-notice");

    let next = state;
    let nextId = scene.next;
    let reactionText: string | undefined;

    if (choiceId && scene.choices) {
      const choice = scene.choices.find((c) => c.id === choiceId);
      if (choice) {
        setSelected(choice.id);
        next = applyEffects(state, choice.effects, choice.id);
        nextId = choice.next;
        reactionText = choice.effects?.aiLine;
        if (choice.effects?.mood) {
          next = { ...next, aiMood: choice.effects.mood };
        }
        onState(next);
      }
    } else {
      setSelected("companion-wait");
      next = {
        ...state,
        counters: {
          ...state.counters,
          waitedForAI: state.counters.waitedForAI + 1,
        },
        relationshipScore: state.relationshipScore + 1,
        history: [...state.history, `companion:${scene.companion ?? "beat"}`],
      };
    }

    if (!nextId) return;
    const targetNextId = nextId;

    if (reactionText) {
      setLineSceneId(sceneId);
      setReaction(reactionText);
      const delay = computeReactionHoldMs(reactionText);
      const doAdvance = () => go(next, targetNextId, { aiMood: next.aiMood });
      pendingAdvanceRef.current = doAdvance;
      timers.schedule("can-skip-reaction", () => setCanSkipReaction(true), 450);
      timers.schedule("advance", doAdvance, delay);
    } else {
      go(next, targetNextId, { aiMood: next.aiMood });
    }
  };

  const pickChoice = (choice: ChoiceDef) => {
    if (selected) return;
    audio.play("click", 0.5);
    setSelected(choice.id);
    // Immediately clear any orb poke notice so post-selection reaction is never blocked.
    setPokeNotice(null);
    timers.clear("poke-notice");

    const flash = choiceMoodFlash(choice);
    setChoiceFlush(flash.flush);
    setChoiceGlanceBoost(flash.glance);
    timers.schedule(
      "choice-flush",
      () => {
        setChoiceFlush("neutral");
        setChoiceGlanceBoost(0);
      },
      1600,
    );

    let next = applyEffects(state, choice.effects, choice.id);
    const reactionText = choice.effects?.aiLine;
    if (reactionText) {
      setLineSceneId(sceneId);
      setReaction(reactionText);
    }
    if (choice.unauthorized || choice.danger) {
      setPanelShake(true);
      timers.schedule("panel-shake", () => setPanelShake(false), 600);
    }
    if (choice.effects?.mood) {
      next = { ...next, aiMood: choice.effects.mood };
      onState(next);
    } else if (flash.mood !== "neutral") {
      next = { ...next, aiMood: flash.mood };
      onState(next);
    }

    const delay = computeReactionHoldMs(reactionText);
    const doAdvance = () => {
      go(next, choice.next, { aiMood: choice.effects?.mood ?? next.aiMood });
    };
    pendingAdvanceRef.current = doAdvance;
    if (reactionText) {
      timers.schedule("can-skip-reaction", () => setCanSkipReaction(true), 450);
    }
    timers.schedule("advance", doAdvance, delay);
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

  const onEscapingHit = (hits: number) => {
    setLineSceneId(sceneId);
    setPokeNotice(null);
    timers.clear("poke-notice");
    if (hits >= 3) {
      setReaction("All 3 hits archived. The button finally looks embarrassed.");
    } else if (hits === 2) {
      setReaction("Two hits in. One more and we file it under fiction.");
    } else if (hits === 1) {
      setReaction("Hit one. It's less smug already.");
    }
  };

  const onPopupCleared = () => {
    setLineSceneId(sceneId);
    setPokeNotice(null);
    timers.clear("poke-notice");
    setReaction("Notices cleared. I'll take the win.");
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
  const hoverLanguage = scene.act === 1 || scene.act === 3 || scene.act === 5;
  const residue = pathResidueKind(state);
  const hoveredChoice = visibleChoices.find((c) => c.id === hoverChoice);
  const glance =
    choiceGlanceBoost !== 0
      ? choiceGlanceBoost
      : choiceGlance(scene.act, hoverChoice, hoveredChoice);
  const showTicket = !!state.flags.orbFiledTicket;

  return (
    <ScenePlayerView
      scene={scene}
      state={state}
      systemLock={systemLock}
      companion={companion}
      hoverLanguage={hoverLanguage}
      residue={residue}
      pokeable={pokeable}
      orbStyle={orbStyle}
      orbAnchor={orbAnchor}
      spotlight={spotlight}
      buryAssistant={buryAssistant}
      safeSide={safeSide}
      aiLine={aiLine}
      ambientAside={ambientAside}
      reactionActive={!!reaction}
      canSkipReaction={canSkipReaction}
      onSkipReaction={onSkipReaction}
      glance={glance}
      pokeFlinch={pokeFlinch}
      companionReady={companionReady}
      watchedPulse={watchedPulse}
      panelMotion={panelMotion}
      panelVar={panelVar}
      panelShake={panelShake}
      hasLatePending={hasLatePending}
      lateHint={lateHint}
      visibleChoices={visibleChoices}
      choiceMotion={choiceMotion}
      selected={selected}
      hoverChoice={hoverChoice}
      glassPhase={glassPhase}
      chamberStatus={chamberStatus}
      choiceFlush={choiceFlush}
      showTicket={showTicket}
      onAmbient={onAmbient}
      onRoamer={onRoamer}
      onOrbPoke={onOrbPoke}
      finishCompanion={finishCompanion}
      pickChoice={pickChoice}
      setHoverChoice={setHoverChoice}
      onState={onState}
      continueDialogue={continueDialogue}
      onSetpieceDone={onSetpieceDone}
      onPopupCleared={onPopupCleared}
      onEscapingHit={onEscapingHit}
      onClimax={onClimax}
      finishSystem={finishSystem}
    />
  );
}

function systemMood(kind: string | undefined, mood: OrbMood): OrbMood {
  return kind === "system" ? "nervous" : mood;
}
