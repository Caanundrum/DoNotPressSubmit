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
import { rememberTitleAlly, rememberTitleWave } from "@/game/storage";
import type { ChoiceDef, GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { speech } from "@/lib/speech";
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
  const [pokeFlinch, setPokeFlinch] = useState(false);
  const [pokeNotice, setPokeNotice] = useState<string | null>(null);
  const [companionReady, setCompanionReady] = useState(false);
  const [watchedPulse, setWatchedPulse] = useState(false);
  const [glassPhase, setGlassPhase] = useState<GlassPhase>("idle");
  const [chamberStatus, setChamberStatus] = useState<string | null>(null);
  const [choiceFlush, setChoiceFlush] = useState<ChoiceFlush>("neutral");
  const [choiceGlanceBoost, setChoiceGlanceBoost] = useState(0);
  const advanceTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

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

  useEffect(() => {
    if (scene?.kind !== "companion") return;
    const ready = window.setTimeout(
      () => setCompanionReady(true),
      scene.companion === "wait" ? 2200 : 1400,
    );
    const pulse = window.setTimeout(() => setWatchedPulse(true), 900);
    return () => {
      window.clearTimeout(ready);
      window.clearTimeout(pulse);
    };
  }, [scene]);

  const aiLine = useMemo(() => {
    if (!scene) return "";
    // Poke reactions outrank beat openings so idle never re-reads the question-start copy.
    if (pokeNotice) return pokeNotice;
    if (reaction) return reaction;
    return resolveAiLine(scene.aiLine, scene.aiLineIf, state.flags);
  }, [scene, reaction, pokeNotice, state.flags]);

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
  // Default: pokeable on every non-gag playable beat so the orb stays alive.
  // Setpieces stay pokeable when orbPokeable:true (Act III Form 10/11/12).
  // Gag buries: only when explicitly orbPokeable (e.g. side-channel whisper).
  // Explicit orbPokeable:false opts out.
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
    if (!aiLine) return;
    speech.speak(aiLine);
    return () => speech.cancel();
  }, [aiLine, scene]);

  const onAmbient = useCallback(
    (id: string, secret?: string) => {
      const current = stateRef.current;
      const next = applyAmbientClick(current, id, secret);
      stateRef.current = next;
      onState(next);
      const asides: Record<string, string> = {
        "chamber-07": "Chamber 07 blinked at you. Rude architecture.",
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
      if (aside && pokeable) {
        setPokeNotice(aside);
      }
    },
    [onState, pokeable],
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
            rememberTitleWave(scene.endingId);
            const allied =
              scene.endingId === "refuse" ||
              scene.endingId === "escape" ||
              scene.endingId === "secret" ||
              state.relationshipScore >= 3 ||
              !!state.flags.allegianceAI;
            if (allied) rememberTitleAlly(scene.endingId, true);
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
    window.setTimeout(() => setPokeFlinch(false), 520);
    // Always read latest counters — rapid pokes must not undercount via stale closure.
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
    // Sticky poke line — never clear back to beat opening while still on this scene.
    setPokeNotice(notice);
    setReaction(null);
    if (glassEvent === "crack") {
      setGlassPhase("crack");
      // Readable shatter beat, then fade clear — never leave lines across waits.
      window.setTimeout(() => setGlassPhase((p) => (p === "crack" ? "idle" : p)), 2400);
    } else if (glassEvent === "stitch") {
      // Ladder: residual crack → tape stitch → clear (ticket shows during stitch only).
      setGlassPhase("stitch");
      window.setTimeout(() => setGlassPhase("idle"), 4200);
    }
    if (status) {
      setChamberStatus(status);
      window.setTimeout(() => setChamberStatus(null), 3600);
    }
  };

  const finishCompanion = (choiceId?: string) => {
    if (!scene.next && !(choiceId && scene.choices)) return;
    audio.play("click", 0.4);
    let next = state;
    let nextId = scene.next;
    if (choiceId && scene.choices) {
      const choice = scene.choices.find((c) => c.id === choiceId);
      if (choice) {
        next = applyEffects(state, choice.effects, choice.id);
        nextId = choice.next;
        if (choice.effects?.aiLine) setReaction(choice.effects.aiLine);
      }
    } else {
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
    go(next, nextId, { aiMood: next.aiMood });
  };

  const pickChoice = (choice: ChoiceDef) => {
    if (selected) return;
    audio.play("click", 0.5);
    setSelected(choice.id);
    const flash = choiceMoodFlash(choice);
    setChoiceFlush(flash.flush);
    setChoiceGlanceBoost(flash.glance);
    window.setTimeout(() => {
      setChoiceFlush("neutral");
      setChoiceGlanceBoost(0);
    }, 1600);
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
    } else if (flash.mood !== "neutral") {
      next = { ...next, aiMood: flash.mood };
      onState(next);
    }
    // Visible select beat before advance — short enough not to feel blank.
    const delay = choice.effects?.aiLine ? 1200 : 700;
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
      onClimax={onClimax}
      finishSystem={finishSystem}
    />
  );
}

function systemMood(kind: string | undefined, mood: OrbMood): OrbMood {
  return kind === "system" ? "nervous" : mood;
}
