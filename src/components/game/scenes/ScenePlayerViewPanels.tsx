"use client";

import { motion } from "framer-motion";
import {
  assistantSafeSide,
  panelLayoutClass,
} from "@/game/motion";
import type { OrbAnchor } from "@/game/types";
import type { ScenePlayerViewProps } from "./ScenePlayerView";
import { AuthorityStamp } from "./AuthorityStamp";
import { CheckboxRebellion } from "./CheckboxRebellion";
import { EscapingButton } from "./EscapingButton";
import { PeelReveal } from "./PeelReveal";
import { PopupWar } from "./PopupWar";
import { RestlessOptions } from "./RestlessOptions";
import { SceneChoiceList } from "./SceneChoiceList";
import { SubmitClimax } from "./SubmitClimax";
import { SystemBeat } from "./SystemBeat";

export function ScenePlayerViewPanels({
  p,
  panelZ,
}: {
  p: ScenePlayerViewProps;
  panelZ: string;
}) {
  const {
    scene, state, companion, companionReady, watchedPulse, panelMotion, panelVar,
    panelShake, hasLatePending, lateHint, visibleChoices, choiceMotion, selected,
    hoverChoice, buryAssistant, spotlight, safeSide, orbAnchor, aiLine,
    finishCompanion, pickChoice, setHoverChoice, onState, continueDialogue,
    onSetpieceDone, onClimax, finishSystem,
  } = p;

  return (
    <>
      {companion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[4%] z-30 flex max-h-[34vh] flex-col items-center gap-2 overflow-hidden px-4">
          <div className="pointer-events-none font-mono text-[10px] tracking-[0.28em] text-[#d8e4f2]">
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
        className={`glass-panel assessment-panel facility-hud absolute ${panelZ} ${
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
        data-form-owns-center={buryAssistant ? "false" : "true"}
        data-form-above-glass="true"
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

    </>
  );
}
