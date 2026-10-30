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
  OrbMood,
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
  ambientAside?: string | null;
  reactionActive?: boolean;
  canSkipReaction?: boolean;
  onSkipReaction?: () => void;
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
  onPopupCleared?: () => void;
  onEscapingHit?: (hits: number) => void;
  onBeatLine?: (line: string, mood?: OrbMood) => void;
  onCompanionReady?: () => void;
  onClimax: (action: "submit" | "refuse" | "escape" | "disable" | "secret") => void;
  finishSystem: () => void;
};

export function ScenePlayerView(p: ScenePlayerViewProps) {
  const {
    scene, state, systemLock, companion, hoverLanguage, residue,
    orbAnchor, spotlight, buryAssistant, safeSide,
    glassPhase, showTicket,
    onAmbient, onRoamer,
  } = p;

  const dockAbove = dialogueDocksAbove(orbAnchor) && !spotlight;
  const dockLeft = dialogueDocksLeft(orbAnchor);
  const dockBeside = dialogueDocksBeside(orbAnchor) || spotlight;
  const assistantZ = systemLock
    ? "z-[52]"
    : scene.kind === "climax"
      ? "z-[42]"
      : buryAssistant
        ? "z-[15]"
        : "z-[42]";
  const panelZ =
    scene.kind === "climax"
      ? "z-[28]"
      : buryAssistant || scene.kind === "setpiece"
        ? "z-30"
        : "z-[28]";
  const assistantLayout = dockLeft
    ? "flex-row-reverse items-start"
    : dockBeside
      ? "flex-row items-start"
      : dockAbove
        ? "flex-col-reverse items-center"
        : "flex-col items-center";
  const bubbleMax = spotlight
    ? "min(340px, 44vw)"
    : dockLeft
      ? "min(280px, 34vw)"
      : dockBeside
        ? "min(260px, 32vw)"
        : dockAbove
          ? "min(320px, 42vw)"
          : "min(240px, 30vw)";
  const orbStatusLabel = undefined;

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      data-assistant-safe={buryAssistant ? "gag" : safeSide}
      data-bury-assistant={buryAssistant ? "true" : "false"}
      data-mobile-bubble-dock="true"
      data-companion-scene={companion ? "true" : "false"}
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
      {!systemLock && scene.kind !== "climax" ? (
        <AmbientChrome
          act={scene.act}
          paused={
            systemLock ||
            scene.environment === "sterile" ||
            scene.kind === "setpiece" ||
            companion
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

      {/* Top-left studio attribution mark — persistent clickable link to Chaos Standard */}
      <div
        className="pointer-events-auto absolute left-3 top-3 z-[35] flex max-w-[calc(100%-7.5rem)] items-center gap-2 sm:left-4 sm:top-4 sm:max-w-none"
        data-facility-mark="true"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-cyan/70 shadow-[0_0_6px_rgba(110,231,255,0.45)]"
          aria-hidden
        />
        <span className="h-px w-4 bg-cyan/35" aria-hidden />
        <a
          href="https://chaosstandard.com"
          target="_blank"
          rel="noopener noreferrer"
          data-chaos-brand-header="true"
          className="font-mono text-[9px] tracking-[0.22em] text-[#c5d4e8]/65 uppercase transition-colors hover:text-cyan"
        >
          CHAOS STANDARD
        </a>
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

      {/* Top-of-stack broken screen overlay — renders above form panel & AI speech bubble */}
      <GlassStitchOverlay
        phase={glassPhase}
        ticket={showTicket}
        layerClass="z-[9999]"
        fullStage
      />
    </div>
  );
}
