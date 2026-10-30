"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  assistantSafeSide,
  panelLayoutClass,
} from "@/game/motion";
import type { OrbAnchor, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
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

/**
 * Rigged 5-Question Verification Progress Map (Proposal 2.1):
 * Visually tells the comedic story of a "quick 5-question survey" being stretched
 * into decimals, popup holds, and redacted denominators by the Assistant.
 */
export const DEFAULT_PROGRESS_LABELS: Record<string, string> = {
  "act1-name": "QUESTION 1 OF 5",
  "act1-restless": "QUESTION 2 OF 5",
  "act1-environment": "QUESTION 3 OF 5",
  "act1-stress": "QUESTION 4 OF 5",
  "act2-flicker": "QUESTION 4B OF 5",
  "act2-unauthorized": "QUESTION 4.5 OF 5",
  "act2-duplicate": "QUESTION 4.5 (REPRINT) OF 5",
  "act2-system-rebuke": "QUESTION 4.75 OF 5",
  "act2-companion-respond": "QUESTION 4.8 (OFF-RECORD) OF 5",
  "act2-compliance": "QUESTION 4.9 OF 5",
  "act3-escaping": "QUESTION 4.95 OF 5",
  "act3-popup": "QUESTION 4.99 (POPUP HOLD) OF 5",
  "act3-companion-wait": "QUESTION 4.999 (PAUSED) OF 5",
  "act3-checkbox": "QUESTION 4.9999 OF 5",
  "act3-aftermath": "QUESTION 5 OF 47",
  "act4-peel-set": "QUESTION 5 OF [REDACTED]",
  "act4-choice": "DIAGNOSTIC // LAYER BREACH",
  "act4-prep": "QUESTION 5 OF 5 (BLOCKED)",
  "act5-lobby": "FINAL STEP // DO NOT PRESS",
  "act5-climax": "QUESTION 5 OF 5 // SUBMIT READY",
};

const STILLNESS_REQUIRED_MS = 2500;
const POINTER_JITTER_THRESHOLD_PX = 8;

function CompanionWaitStillness({
  companionReady,
  continueLabel,
  onCompanionReady,
  onBeatLine,
  onFinish,
}: {
  companionReady: boolean;
  continueLabel?: string;
  onCompanionReady?: () => void;
  onBeatLine?: (line: string, mood?: OrbMood) => void;
  onFinish: () => void;
}) {
  const [stillMs, setStillMs] = useState(0);
  const [moveStrikes, setMoveStrikes] = useState(0);
  const [exasperatedUnlock, setExasperatedUnlock] = useState(false);
  const anchorRef = useRef<{ x: number; y: number } | null>(null);
  const lastStrikeAtRef = useRef(0);
  const strikesRef = useRef(0);
  const unlockedRef = useRef(companionReady);
  unlockedRef.current = companionReady;

  // 50ms progress ticker from 0ms to 2500ms while pointer remains still
  useEffect(() => {
    if (companionReady) {
      setStillMs(STILLNESS_REQUIRED_MS);
      return;
    }
    const id = window.setInterval(() => {
      if (unlockedRef.current) return;
      setStillMs((prev) => {
        const next = Math.min(STILLNESS_REQUIRED_MS, prev + 50);
        if (next >= STILLNESS_REQUIRED_MS && !unlockedRef.current) {
          unlockedRef.current = true;
          onCompanionReady?.();
        }
        return next;
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [companionReady, onCompanionReady]);

  // Real pointer-stillness & premature-click detector
  useEffect(() => {
    if (companionReady) return;

    const triggerViolation = () => {
      const now = Date.now();
      // 420ms cooldown between strikes so a single swipe registers as 1 strike
      if (now - lastStrikeAtRef.current < 420) return;
      lastStrikeAtRef.current = now;

      const nextStrike = strikesRef.current + 1;
      strikesRef.current = nextStrike;
      setMoveStrikes(nextStrike);
      setStillMs(0);
      audio.play("system", 0.25);

      if (nextStrike === 1) {
        onBeatLine?.(
          "You moved! I saw the cursor twitch! Hands off the mouse!",
          "irritated",
        );
      } else if (nextStrike === 2) {
        onBeatLine?.(
          "Still moving! Are you physically incapable of doing nothing for two and a half seconds?!",
          "nervous",
        );
      } else if (nextStrike >= 3) {
        unlockedRef.current = true;
        setExasperatedUnlock(true);
        setStillMs(STILLNESS_REQUIRED_MS);
        onBeatLine?.(
          "Fine! Twitchy human wins! Just click the button before you pull a muscle.",
          "defeated",
        );
        onCompanionReady?.();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (unlockedRef.current) return;
      if (!anchorRef.current) {
        anchorRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dist = Math.hypot(
        e.clientX - anchorRef.current.x,
        e.clientY - anchorRef.current.y,
      );
      if (dist >= POINTER_JITTER_THRESHOLD_PX) {
        anchorRef.current = { x: e.clientX, y: e.clientY };
        triggerViolation();
      }
    };

    const onPointerDown = () => {
      if (unlockedRef.current) return;
      triggerViolation();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [companionReady, onBeatLine, onCompanionReady]);

  const progressPct = companionReady
    ? 100
    : Math.min(100, Math.round((stillMs / STILLNESS_REQUIRED_MS) * 100));

  const buttonLabel = companionReady
    ? exasperatedUnlock
      ? "FINE, CLOSE ENOUGH"
      : (continueLabel ?? "I WAITED")
    : `HOLD STILL… (${progressPct}%)`;

  return (
    <div
      className="flex w-full max-w-xs flex-col items-center gap-2.5"
      data-companion-wait="true"
      data-stillness-progress={progressPct}
      data-move-strikes={moveStrikes}
    >
      {/* Live Pointer-Stillness Progress Bar */}
      <div className="w-full overflow-hidden rounded-sm border border-cyan/35 bg-black/60 p-0.5">
        <div
          className="h-1.5 bg-cyan transition-all duration-75"
          style={{
            width: `${progressPct}%`,
            boxShadow: "0 0 10px rgba(110,231,255,0.7)",
          }}
        />
      </div>

      {companionReady ? (
        <motion.div
          className="h-2 w-2 rounded-full bg-cyan"
          style={{ boxShadow: "0 0 16px rgba(110,231,255,0.85)" }}
          initial={{ scale: 0.6, opacity: 0.4 }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          data-companion-settled="true"
          aria-hidden
        />
      ) : (
        <div
          className="h-2 w-2 rounded-full bg-cyan/30"
          data-companion-settling="true"
          aria-hidden
        />
      )}

      <button
        type="button"
        disabled={!companionReady}
        className="pointer-events-auto border border-cyan/40 bg-cyan/10 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-white transition hover:bg-cyan/20 disabled:cursor-wait disabled:opacity-40"
        style={{ fontFamily: "var(--font-display)" }}
        onClick={() => onFinish()}
      >
        {buttonLabel}
      </button>

      {companionReady ? (
        <div
          className="font-mono text-[9px] tracking-[0.22em] text-cyan/75"
          data-companion-settle-cue="true"
        >
          Ready when you are.
        </div>
      ) : moveStrikes > 0 ? (
        <div className="font-mono text-[9px] tracking-[0.18em] text-[#ff8da1]">
          MOVEMENT STRIKES: {moveStrikes}/3 // HANDS OFF MOUSE
        </div>
      ) : null}
    </div>
  );
}

export function ScenePlayerViewPanels({
  p,
  panelZ,
}: {
  p: ScenePlayerViewProps;
  panelZ: string;
}) {
  const {
    scene, state, companion, companionReady, watchedPulse, panelMotion, panelVar,
    panelShake, visibleChoices, choiceMotion, selected,
    hoverChoice, buryAssistant, spotlight, safeSide, orbAnchor,
    reactionActive, canSkipReaction, onSkipReaction,
    finishCompanion, pickChoice, setHoverChoice, onState, continueDialogue,
    onSetpieceDone, onPopupCleared, onEscapingHit, onBeatLine, onCompanionReady,
    onClimax, finishSystem,
  } = p;
  const skippable = !!(reactionActive && canSkipReaction && onSkipReaction);
  const progressLabel = scene.progressLabel ?? DEFAULT_PROGRESS_LABELS[scene.id];

  return (
    <>
      {companion ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[10%] z-30 flex max-h-[38vh] flex-col items-center gap-2 overflow-hidden px-4"
          data-companion-stack="true"
          data-companion-bottom-safe="true"
        >
          <div className="pointer-events-none flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] tracking-[0.28em] text-[#d8e4f2]">
            <span>{scene.formId ?? "SIDE CHANNEL"}</span>
            {progressLabel ? (
              <span
                data-progress-header={progressLabel}
                className="rounded-sm border border-cyan/35 bg-cyan/10 px-2 py-0.5 text-[9px] tracking-[0.2em] text-cyan"
              >
                {progressLabel}
              </span>
            ) : null}
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
            <CompanionWaitStillness
              companionReady={companionReady}
              continueLabel={scene.continueLabel}
              onCompanionReady={onCompanionReady}
              onBeatLine={onBeatLine}
              onFinish={() => finishCompanion()}
            />
          ) : null}
          {scene.companion === "watch" ? (
            <button
              type="button"
              disabled={!watchedPulse}
              className="pointer-events-auto min-h-[48px] border border-cyan/55 bg-cyan/15 px-6 py-3.5 font-mono text-[12px] tracking-[0.2em] text-white shadow-[0_0_18px_rgba(110,231,255,0.18)] transition hover:bg-cyan/25 disabled:opacity-45"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={() => finishCompanion()}
              data-settle-cta="true"
            >
              {watchedPulse ? (scene.continueLabel ?? "YOU SETTLED. I NOTICED.") : "WATCHING THE ORBIT…"}
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
        data-panel-motion={panelMotion}
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
        style={{ pointerEvents: "auto", cursor: skippable ? "pointer" : undefined }}
        onClick={skippable ? onSkipReaction : undefined}
      >
        <div className="assessment-panel-inner">
          {(scene.formId || progressLabel) ? (
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.28em] text-[#c5d3e4]">
              <span>{scene.formId}</span>
              {progressLabel ? (
                <span
                  data-progress-header={progressLabel}
                  className="rounded-sm border border-cyan/35 bg-cyan/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-cyan"
                >
                  {progressLabel}
                </span>
              ) : null}
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

          {/* Side paths unlock silently — no residual-noise telegraph (rev5 P0). */}

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
              className="mt-1 max-w-full whitespace-normal border border-cyan/40 bg-cyan/10 px-4 py-3 text-center font-mono text-[11px] leading-tight tracking-[0.18em] text-white transition hover:bg-cyan/20 sm:px-5 sm:text-[12px] sm:tracking-[0.22em]"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={continueDialogue}
              data-dialogue-continue="true"
            >
              {scene.continueLabel ?? "CONTINUE"}
            </button>
          ) : null}

          {scene.kind === "setpiece" && scene.setpiece === "escaping-button" ? (
            <EscapingButton onComplete={onSetpieceDone} onHit={onEscapingHit} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "popup-war" ? (
            <PopupWar onComplete={onSetpieceDone} onCleared={onPopupCleared} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "checkbox-rebellion" ? (
            <CheckboxRebellion onComplete={onSetpieceDone} onBeatLine={onBeatLine} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "restless-options" ? (
            <RestlessOptions onComplete={onSetpieceDone} onBeatLine={onBeatLine} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "authority-stamp" ? (
            <AuthorityStamp onComplete={onSetpieceDone} onBeatLine={onBeatLine} />
          ) : null}
          {scene.kind === "setpiece" && scene.setpiece === "peel-reveal" ? (
            <PeelReveal onComplete={onSetpieceDone} />
          ) : null}

          {scene.kind === "climax" ? (
            <SubmitClimax
              state={state}
              formLine={scene.prompt ?? "FINAL CONTROL ARMED. SELECT A RESPONSE."}
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
