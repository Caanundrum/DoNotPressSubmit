"use client";

import { type TargetAndTransition } from "framer-motion";
import {
  dialogueDocksAbove,
  dialogueDocksBeside,
  dialogueDocksLeft,
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
import type { ChoiceFlush } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";
import {
  SceneTransition,
  transitionForEnvironment,
} from "../effects/SceneTransition";
import { FacilityBackground } from "../FacilityBackground";
import { PathResidue } from "../PathResidue";
import { GlassStitchOverlay, type GlassPhase } from "./GlassStitchOverlay";
import { ScenePlayerViewAssistant } from "./ScenePlayerViewAssistant";
import { ScenePlayerViewPanels } from "./ScenePlayerViewPanels";

export type ScenePlayerViewProps = {
  scene: SceneDef;
  state: GameState;
  systemLock: boolean;
  companion: boolean;
  hoverLanguage: boolean;
  residue: "chaos" | "obedient" | "neutral";
  pokeable: boolean;
  orbStyle: {
    left?: string;
    right?: string;
    top: string;
    transform: string;
    size: number;
  };
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
  const dockBeside = dialogueDocksBeside(orbAnchor);
  const assistantZ = buryAssistant ? "z-[15]" : "z-[42]";
  const panelZ = buryAssistant || scene.kind === "setpiece" ? "z-30" : "z-[28]";
  const assistantLayout = dockLeft
    ? "flex-row-reverse items-start"
    : dockBeside
      ? "flex-row items-start"
      : dockAbove
        ? "flex-col-reverse items-center"
        : "flex-col items-center";
  const bubbleMax = spotlight
    ? "min(220px, 30vw)"
    : dockLeft
      ? "min(180px, 24vw)"
      : dockBeside
        ? "min(220px, 28vw)"
        : dockAbove
          ? "min(240px, 36vw)"
          : "min(200px, 26vw)";
  const orbStatusLabel =
    orbAnchor === "pace"
      ? "ASSISTANT // DRIFT"
      : spotlight
        ? "ASSISTANT // LIVE"
        : undefined;

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      data-assistant-safe={buryAssistant ? "gag" : safeSide}
      data-bury-assistant={buryAssistant ? "true" : "false"}
    >
      <SceneTransition
        key={scene.id}
        family={transitionForEnvironment(scene.environment, scene.kind)}
      />
      <FacilityBackground
        intensity={systemLock ? 0.4 : 1}
        systemLock={systemLock}
        environment={scene.environment}
        anomalyLevel={scene.anomalyLevel ?? state.act}
        hoverLanguage={hoverLanguage}
        onAmbient={systemLock ? undefined : onAmbient}
      />
      <BackgroundGags
        paused={systemLock || scene.environment === "sterile"}
        hoverLanguage={hoverLanguage}
        suppressToasts={scene.kind === "setpiece" || scene.kind === "climax"}
        spotlight={spotlight}
        companion={companion}
        safeSide={safeSide}
        orbAnchor={typeof orbAnchor === "string" ? orbAnchor : undefined}
        onAmbient={onAmbient}
      />
      <PathResidue kind={residue} />
      <GlassStitchOverlay phase={glassPhase} ticket={showTicket} />
      {!systemLock && scene.kind !== "climax" ? (
        <AmbientChrome
          act={scene.act}
          paused={
            systemLock ||
            scene.environment === "sterile" ||
            scene.kind === "setpiece"
          }
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

      <div className="pointer-events-none absolute left-3 top-3 z-[5] max-w-[min(70%,720px)] sm:left-4 sm:top-4">
        <div className="break-words font-mono text-[9px] leading-snug tracking-[0.12em] text-[#d8e4f2] sm:text-[10px] sm:tracking-[0.16em]">
          {`HCOS // ACT ${scene.act} // ${scene.formId ?? scene.id.toUpperCase()}`}
        </div>
        <div className="mt-0.5 font-mono text-[9px] leading-snug tracking-[0.12em] text-[#d0dcec] sm:text-[10px] sm:tracking-[0.16em]">
          {chamberStatus
            ? chamberStatus
            : residue === "chaos"
              ? "STAGE // CONTAMINATED"
              : residue === "obedient"
                ? "STAGE // COMPLIANT"
                : "STAGE // LIVE"}
        </div>
      </div>

      <ScenePlayerViewAssistant
        p={p}
        assistantZ={assistantZ}
        assistantLayout={assistantLayout}
        dockLeft={dockLeft}
        dockBeside={dockBeside}
        dockAbove={dockAbove}
        bubbleMax={bubbleMax}
        orbStatusLabel={orbStatusLabel}
      />
      <ScenePlayerViewPanels p={p} panelZ={panelZ} />
    </div>
  );
}
