"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import {
  assistantSafeSide,
  dialogueDocksAbove,
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
import { AssistantOrb } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";
import { FacilityBackground } from "../FacilityBackground";
import { PathResidue } from "../PathResidue";
import { AuthorityStamp } from "./AuthorityStamp";
import { CheckboxRebellion } from "./CheckboxRebellion";
import { EscapingButton } from "./EscapingButton";
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
    onAmbient, onRoamer, onOrbPoke, finishCompanion, pickChoice, setHoverChoice,
    onState, continueDialogue, onSetpieceDone, onClimax, finishSystem,
  } = p;

  const dockAbove = dialogueDocksAbove(orbAnchor);
  const assistantZ = buryAssistant ? "z-[15]" : "z-[32]";

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
      />
      <PathResidue kind={residue} />
      {!systemLock && scene.kind !== "climax" ? (
        <AmbientChrome
          act={scene.act}
          paused={systemLock || scene.environment === "sterile"}
          onAmbient={onAmbient}
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

      {/* Stage chrome — decorative, never intercepts clicks */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.28em] text-[#b7c6d8]">
          {`HCOS // ACT ${scene.act} // ${scene.formId ?? scene.id.toUpperCase()}`}
        </div>
        <div className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.22em] text-[#b7c6d8]">
          {residue === "chaos"
            ? "FACILITY STAGE // CONTAMINATED"
            : residue === "obedient"
              ? "FACILITY STAGE // COMPLIANT"
              : "FACILITY STAGE // LIVE"}
        </div>
      </div>

      {/*
        Assistant orb + dialogue — reserved safe zone on non-gag forms.
        Default: pointer-events none so form CTAs stay mouse-hittable.
        Pokeable scenes enable a tiny hit target on the orb only.
        buryAssistant gag scenes keep the orb under/behind the form on purpose.
      */}
      <motion.div
        className={`absolute ${assistantZ} flex items-center gap-2 ${
          dockAbove ? "flex-col-reverse" : "flex-col"
        } ${pokeable ? "" : "pointer-events-none"}`}
        style={{
          left: orbStyle.left,
          top: orbStyle.top,
          transform: orbStyle.transform,
          width: Math.max(orbStyle.size, spotlight ? 260 : 180),
          maxWidth: "min(42vw, 300px)",
          pointerEvents: pokeable ? "auto" : "none",
        }}
        data-assistant-dock={dockAbove ? "above" : "below"}
        animate={
          orbAnchor === "pace"
            ? { x: [-20, 20, -10, 0] }
            : orbAnchor === "flee" || orbAnchor === "avoid-submit"
              ? { x: [0, 6, -4, 8, 0], y: [0, -4, 3, 0] }
              : spotlight
                ? { x: 0, y: [0, -4, 0], scale: 1 }
                : { x: 0, y: 0 }
        }
        transition={
          orbAnchor === "pace" || orbAnchor === "flee" || orbAnchor === "avoid-submit"
            ? {
                duration: orbAnchor === "pace" ? 6.5 : 3.4,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { type: "spring", stiffness: 90, damping: 18 }
        }
        initial={false}
        layout
      >
        {spotlight ? (
          <motion.div
            className="pointer-events-none absolute inset-[-30%] -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(110,231,255,0.22) 0%, rgba(110,231,255,0.06) 45%, transparent 70%)",
            }}
            animate={{ opacity: [0.55, 0.95, 0.55], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          />
        ) : null}
        <AssistantOrb
          mood={systemLock ? "nervous" : state.aiMood}
          size={orbStyle.size}
          pokeable={pokeable}
          onPoke={onOrbPoke}
          flinch={pokeFlinch}
          glance={glance}
        />
        <motion.div
          className={`pointer-events-none glass-panel overflow-hidden px-3 py-2 text-sm leading-relaxed text-[#d7e6f5] ${
            spotlight ? "max-w-[min(280px,40vw)] max-h-[26vh]" : "max-w-[min(210px,34vw)] max-h-[20vh]"
          }`}
          key={aiLine || "silent"}
          initial={{ opacity: 0, y: dockAbove ? -8 : 8, scale: 0.96 }}
          animate={{ opacity: buryAssistant && systemLock ? 0.35 : 1, y: 0, scale: 1 }}
        >
          <div className="mb-1 font-mono text-[9px] tracking-[0.22em] text-cyan/80">
            ASSISTANT{spotlight ? " // ADDRESSING YOU" : ""}
            {buryAssistant ? " // UNDER PRESSURE" : ""}
            {glance < -0.5 ? " // RECOILING" : glance > 0.4 ? " // ATTENDING" : ""}
          </div>
          <div className={`overflow-hidden ${spotlight ? "text-[15px]" : "text-[13px]"}`}>
            {systemLock ? "…" : aiLine || "…"}
          </div>
        </motion.div>
      </motion.div>

      {companion ? (
        <div className="absolute inset-x-0 bottom-[6%] z-30 flex flex-col items-center gap-3 px-4">
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
              className="border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20 disabled:cursor-wait disabled:opacity-40"
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
              className="border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20 disabled:opacity-40"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={() => finishCompanion()}
            >
              {watchedPulse ? (scene.continueLabel ?? "I SAW THAT") : "WATCHING…"}
            </button>
          ) : null}
          {scene.companion === "respond" && scene.choices ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
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
        className={`glass-panel assessment-panel absolute z-30 p-4 sm:p-6 ${panelLayoutClass(
          panelMotion,
          spotlight && scene.kind !== "climax" && scene.kind !== "setpiece",
          {
            buryAssistant,
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
            : spotlight && scene.kind !== "climax" && scene.kind !== "setpiece"
              ? { ...panelVar.animate, opacity: 0.55, filter: "brightness(0.72)" }
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
          onContinue={finishSystem}
        />
      ) : null}
    </div>
  );
}
