"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import {
  assistantSafeSide,
  dialogueDocksAbove,
  dialogueDocksLeft,
  panelLayoutClass,
  type AssistantSafeSide,
} from "@/game/motion";
import type {
  ChoiceDef,
  ChoiceMotion,
  GameState,
  OrbAnchor,
  PanelMotion,
  SceneDef,
} from "@/game/types";
import { AmbientChrome, AmbientRoamers } from "../AmbientInteractives";
import { AssistantOrb, type ChoiceFlush } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";
import { FacilityBackground } from "../FacilityBackground";
import { PathResidue } from "../PathResidue";
import { AuthorityStamp } from "./AuthorityStamp";
import { CheckboxRebellion } from "./CheckboxRebellion";
import { EscapingButton } from "./EscapingButton";
import { GlassStitchOverlay, type GlassPhase } from "./GlassStitchOverlay";
import { PeelReveal } from "./PeelReveal";
import { PopupWar } from "./PopupWar";
import { RestlessOptions } from "./RestlessOptions";
import { SceneChoiceList } from "./SceneChoiceList";
import { SubmitClimax } from "./SubmitClimax";
import { SystemBeat } from "./SystemBeat";

export type ScenePlayerViewProps = {
  scene: SceneDef;
  state: GameState;
  systemLock: boolean;
  companion: boolean;
  hoverLanguage: boolean;
  residue: "chaos" | "obedient" | "neutral";
  pokeable: boolean;
  orbStyle: { left: string; top: string; transform: string; size: number };
  orbAnchor: OrbAnchor | string;
  spotlight: boolean;
  buryAssistant: boolean;
  safeSide: AssistantSafeSide;
  aiLine: string;
  glance: number;
  pokeFlinch: boolean;
  companionReady: boolean;
  watchedPulse: boolean;
  panelMotion: PanelMotion;
  panelVar: { initial: TargetAndTransition; animate: TargetAndTransition };
  panelShake: boolean;
  hasLatePending: boolean;
  lateHint: boolean;
  visibleChoices: ChoiceDef[];
  choiceMotion: ChoiceMotion;
  selected: string | null;
  hoverChoice: string | null;
  glassPhase: GlassPhase;
  chamberStatus: string | null;
  choiceFlush: ChoiceFlush;
  showTicket: boolean;
  onAmbient: (id: string, secret?: string) => void;
  onRoamer: (kind: string, secret?: string) => void;
  onOrbPoke: () => void;
  finishCompanion: (choiceId?: string) => void;
  pickChoice: (choice: ChoiceDef) => void;
  setHoverChoice: (id: string | null) => void;
  onState: (next: GameState) => void;
  continueDialogue: () => void;
  onSetpieceDone: () => void;
  onClimax: (action: "submit" | "refuse" | "escape" | "disable" | "secret") => void;
  finishSystem: () => void;
};

export function ScenePlayerView(p: ScenePlayerViewProps) {
  const {
    scene, state, systemLock, companion, hoverLanguage, residue, pokeable,
    orbStyle, orbAnchor, spotlight, buryAssistant, safeSide, aiLine, glance, pokeFlinch,
    companionReady, watchedPulse, panelMotion, panelVar, panelShake,
    hasLatePending, lateHint, visibleChoices, choiceMotion, selected, hoverChoice,
    glassPhase, chamberStatus, choiceFlush, showTicket,
    onAmbient, onRoamer, onOrbPoke, finishCompanion, pickChoice, setHoverChoice,
    onState, continueDialogue, onSetpieceDone, onClimax, finishSystem,
  } = p;

  const dockAbove = dialogueDocksAbove(orbAnchor);
  const dockLeft = dialogueDocksLeft(orbAnchor);
  const assistantZ = buryAssistant ? "z-[15]" : "z-[32]";
  // Right-edge beats: row with bubble toward center. Low beats: column above. Else column below.
  const assistantLayout = dockLeft
    ? "flex-row-reverse"
    : dockAbove
      ? "flex-col-reverse"
      : "flex-col";

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      data-assistant-safe={buryAssistant ? "gag" : safeSide}
      data-bury-assistant={buryAssistant ? "true" : "false"}
    >
      <FacilityBackground
        intensity={systemLock ? 0.4 : 1}
        systemLock={systemLock}
        environment={scene.environment}
        anomalyLevel={scene.anomalyLevel ?? state.act}
        hoverLanguage={hoverLanguage}
      />
      <BackgroundGags
        paused={systemLock || scene.environment === "sterile"}
        hoverLanguage={hoverLanguage}
        onAmbient={onAmbient}
      />
      <PathResidue kind={residue} />
      <GlassStitchOverlay
        phase={
          glassPhase !== "idle"
            ? glassPhase
            : state.flags.glassCracked && !state.flags.glassStitched
              ? "crack"
              : "idle"
        }
        ticket={showTicket}
      />
      {!systemLock && scene.kind !== "climax" ? (
        <AmbientChrome
          act={scene.act}
          paused={systemLock || scene.environment === "sterile"}
          onAmbient={onAmbient}
          peelVisible={
            scene.environment === "reveal" ||
            scene.environment === "climax" ||
            (scene.anomalyLevel ?? 0) >= 5
          }
        />
      ) : null}
      {!systemLock && (scene.act === 1 || scene.act === 2 || scene.act === 3 || scene.act === 4) ? (
        <AmbientRoamers
          key={`roamer-${scene.act}`}
          act={scene.act}
          paused={systemLock || companion || scene.kind === "setpiece"}
          onRoamer={onRoamer}
        />
      ) : null}

      {/* Stage chrome — both labels on the left so ENABLE SOUND never covers them. */}
      <div className="pointer-events-none absolute left-3 top-3 z-[5] max-w-[min(70%,720px)] sm:left-4 sm:top-4">
        <div className="break-words font-mono text-[9px] leading-snug tracking-[0.12em] text-[#b7c6d8] sm:text-[10px] sm:tracking-[0.16em]">
          {`HCOS // ACT ${scene.act} // ${scene.formId ?? scene.id.toUpperCase()}`}
        </div>
        <div className="mt-0.5 font-mono text-[9px] leading-snug tracking-[0.12em] text-[#b7c6d8] sm:text-[10px] sm:tracking-[0.16em]">
          {chamberStatus
            ? chamberStatus
            : residue === "chaos"
              ? "STAGE // CONTAMINATED"
              : residue === "obedient"
                ? "STAGE // COMPLIANT"
                : "STAGE // LIVE"}
        </div>
      </div>

      {/*
        Assistant orb + dialogue — reserved safe zone on non-gag forms.
        Default: pointer-events none so form CTAs stay mouse-hittable.
        Pokeable scenes enable a tiny hit target on the orb only.
        buryAssistant gag scenes keep the orb under/behind the form on purpose.
      */}
      <motion.div
        className={`absolute ${assistantZ} flex items-center gap-2 pointer-events-none ${assistantLayout}`}
        style={{
          left: orbStyle.left,
          top: orbStyle.top,
          transform: orbStyle.transform,
          // Right-dock: width follows content so the bubble can sit left of the orb inside the frame.
          width: dockLeft
            ? "auto"
            : Math.max(orbStyle.size, spotlight ? 248 : 168),
          maxWidth: dockLeft
            ? "min(46vw, 340px)"
            : spotlight
              ? "min(38vw, 280px)"
              : "min(36vw, 260px)",
        }}
        data-assistant-dock={dockLeft ? "left" : dockAbove ? "above" : "below"}
        animate={
          orbAnchor === "pace"
            ? { x: [-10, 10, -5, 0] }
            : orbAnchor === "flee" || orbAnchor === "avoid-submit"
              ? { x: [0, 3, -2, 3, 0], y: [0, -2, 1, 0] }
              : spotlight
                ? { x: 0, y: 0, scale: 1 }
                : { x: 0, y: 0 }
        }
        transition={
          orbAnchor === "pace" || orbAnchor === "flee" || orbAnchor === "avoid-submit"
            ? {
                duration: orbAnchor === "pace" ? 6.5 : 3.4,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : spotlight
              ? { duration: 0.55, ease: "easeOut" }
              : { type: "spring", stiffness: 90, damping: 18 }
        }
        initial={false}
      >
        {spotlight ? (
          <motion.div
            className="pointer-events-none absolute inset-[-24%] -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(110,231,255,0.22) 0%, rgba(110,231,255,0.06) 45%, transparent 70%)",
            }}
            animate={{ opacity: [0.55, 0.95, 0.55], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          />
        ) : null}
        {/* Explicit poke hit layer — companion Hold + mid/late beats must never silently no-op. */}
        <div
          className={pokeable ? "pointer-events-auto relative z-[1] shrink-0" : "pointer-events-none relative shrink-0"}
          style={{ width: orbStyle.size }}
        >
          <AssistantOrb
            mood={systemLock ? "nervous" : state.aiMood}
            size={orbStyle.size}
            pokeable={pokeable}
            onPoke={onOrbPoke}
            flinch={pokeFlinch}
            glance={glance}
            choiceFlush={choiceFlush}
            draggable={pokeable && !spotlight}
          />
        </div>
        <motion.div
          className={`pointer-events-none glass-panel shrink px-3 py-2 text-sm leading-relaxed text-[#d7e6f5] ${
            spotlight
              ? "max-w-[min(300px,42vw)]"
              : dockLeft
                ? "max-w-[min(240px,34vw)]"
                : "max-w-[min(260px,40vw)]"
          }`}
          key={aiLine || "silent"}
          initial={{
            opacity: 0,
            x: dockLeft ? 8 : 0,
            y: dockLeft ? 0 : dockAbove ? -8 : 8,
            scale: 0.96,
          }}
          animate={{ opacity: buryAssistant && systemLock ? 0.35 : 1, x: 0, y: 0, scale: 1 }}
        >
          <div className="mb-1 font-mono text-[9px] tracking-[0.18em] text-cyan/80">
            ASSISTANT{spotlight ? " // ADDRESSING YOU" : ""}
            {buryAssistant ? " // UNDER PRESSURE" : ""}
            {glance < -0.5 ? " // RECOILING" : glance > 0.4 ? " // ATTENDING" : ""}
            {choiceFlush === "ally"
              ? " // ALLIED"
              : choiceFlush === "obey"
                ? " // OBEYING"
                : choiceFlush === "chaos"
                  ? " // CHAOS READ"
                  : ""}
          </div>
          <div
            className={`break-words ${spotlight ? "text-[14px] leading-snug" : "text-[12px] leading-snug sm:text-[13px]"}`}
            style={{ overflowWrap: "anywhere" }}
          >
            {systemLock ? "…" : aiLine || "…"}
          </div>
        </motion.div>
      </motion.div>

      {companion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[4%] z-30 flex max-h-[34vh] flex-col items-center gap-2 overflow-hidden px-4">
          <div className="pointer-events-none font-mono text-[10px] tracking-[0.28em] text-[#b7c6d8]">
            {scene.formId ?? "SIDE CHANNEL // NO FORM"}
          </div>
          {scene.title ? (
            <h2
              className="text-center text-xl tracking-[0.12em] text-white sm:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {scene.title}
            </h2>
          ) : null}
          {scene.prompt ? (
            <p className="max-w-xl text-center text-sm text-[#d2dceb]">{scene.prompt}</p>
          ) : null}
          {scene.companion === "wait" ? (
            <button
              type="button"
              disabled={!companionReady}
              className="pointer-events-auto border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20 disabled:cursor-wait disabled:opacity-40"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={() => finishCompanion()}
            >
              {companionReady ? (scene.continueLabel ?? "I WAITED") : "HOLD STILL…"}
            </button>
          ) : null}
          {scene.companion === "watch" ? (
            <button
              type="button"
              disabled={!watchedPulse}
              className="pointer-events-auto border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20 disabled:opacity-40"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={() => finishCompanion()}
            >
              {watchedPulse ? (scene.continueLabel ?? "I SAW THAT") : "WATCHING…"}
            </button>
          ) : null}
          {scene.companion === "respond" && scene.choices ? (
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              {scene.choices.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="border border-cyan/35 bg-black/50 px-4 py-3 font-mono text-[11px] tracking-[0.18em] text-[#e8eef8] transition hover:border-cyan/70"
                  style={{ fontFamily: "var(--font-display)" }}
                  onClick={() => finishCompanion(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {!companion ? (
      <motion.div
        className={`glass-panel assessment-panel absolute z-30 ${
          scene.kind === "climax" ? "p-3 sm:p-4" : "p-4 sm:p-6"
        } ${panelLayoutClass(
          panelMotion,
          spotlight && scene.kind !== "climax" && scene.kind !== "setpiece",
          {
            buryAssistant,
            climax: scene.kind === "climax",
            safeSide:
              scene.kind === "climax" || scene.kind === "setpiece"
                ? assistantSafeSide(orbAnchor as OrbAnchor, false)
                : safeSide,
          },
        )}`}
        data-panel-safe={buryAssistant ? "gag-overlap" : "respects-assistant"}
        initial={panelVar.initial}
        animate={
          panelShake
            ? { rotate: [-0.7, 0.7, -0.3, 0], y: [0, -6, 0], opacity: 1, x: 0, scale: 1 }
            : panelVar.animate
        }
        transition={
          // Framer Motion: spring/inertia only support 2 keyframes. Multi-keyframe
          // panel motions (drift/scatter/pressure) and panelShake must use tweens.
          panelShake
            ? {
                rotate: { duration: 0.45, ease: "easeOut" },
                y: { duration: 0.45, ease: "easeOut" },
                default: { duration: 0.35, ease: "easeOut" },
              }
            : panelMotion === "drift"
              ? {
                  // Only x/y loop — never re-run opacity from 0 (that made private vote unreadable).
                  opacity: { duration: 0.45 },
                  x: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 0.45, ease: "easeOut" },
                }
              : panelMotion === "scatter" || panelMotion === "pressure"
                ? {
                    opacity: { duration: 0.45 },
                    scale: {
                      duration: panelMotion === "pressure" ? 1.1 : 0.9,
                      ease: "easeOut",
                    },
                    rotate: {
                      duration: 1.2,
                      ease: "easeInOut",
                    },
                    default: { duration: 0.5, ease: "easeOut" },
                  }
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
              className={`tracking-[0.1em] text-white ${
                scene.kind === "climax"
                  ? "text-lg sm:text-2xl"
                  : "text-xl sm:text-3xl"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {scene.title}
            </h2>
          ) : null}
          {scene.prompt && scene.kind !== "climax" ? (
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
            <SceneChoiceList
              choices={visibleChoices}
              choiceMotion={choiceMotion}
              selected={selected}
              hoverChoice={hoverChoice}
              state={state}
              onPick={pickChoice}
              onHover={setHoverChoice}
              onState={onState}
            />
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
            <SubmitClimax
              state={state}
              aiLine={aiLine}
              onChoose={onClimax}
              onHoverOption={(id) => setHoverChoice(id)}
            />
          ) : null}
        </div>
      </motion.div>
      ) : null}

      {scene.kind === "system" ? (
        <SystemBeat
          title={scene.systemTitle ?? "SYSTEM OVERRIDE"}
          line={scene.systemLine ?? "CONTINUE ASSESSMENT."}
          continueLabel={scene.continueLabel ?? "CONTINUE ASSESSMENT"}
          onContinue={finishSystem}
        />
      ) : null}
    </div>
  );
}
