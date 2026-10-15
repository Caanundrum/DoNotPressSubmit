"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { POKE_WORLD } from "@/game/aiLifeLocks";
import { showAmbientToast } from "@/game/ambientToastBus";
import { AssistantOrb } from "./AssistantOrb";
import { AudioEnableControl } from "./AudioEnableControl";
import { BackgroundGags } from "./BackgroundGags";
import { BeginControl } from "./BeginControl";
import { FacilityBackground } from "./FacilityBackground";
import { TitleLogo } from "./TitleLogo";
import {
  GlassStitchOverlay,
  type GlassPhase,
} from "./scenes/GlassStitchOverlay";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";

/** Title prop click payoffs — obvious joke, no backstory (P0 gag clarity). */
const TITLE_PROP_TOAST: Record<string, string> = {
  "coffee-mug": "Title mug: still empty, still judgmental. Facility filed a thirst incident.",
  "do-not-press": "Tiny robot pressed DO NOT PRESS on the title. Irony ticket printed.",
  "chamber-07": "CHAMBER 07 panel blinked. It has opinions. None of them help BEGIN.",
  "replacement-failed": "Your title-screen replacement drone failed. You remain the protagonist.",
  "printer-scissors": "Title printer queued scissors. BEGIN is still the real door.",
  "corridor-etiquette": "Corridor drones on the title practiced after-you. Throughput: zero.",
  "containment-fine": "EVERYTHING IS FINE plaque on title. Unprompted. Still concerning.",
  default: "Background prop noticed you. It will not start the assessment for you.",
};

/**
 * Calm cinematic title: dim facility life + sparse roaming eggs + orb.
 * Not a black void, not a busy collage. SUBMIT gag on TitleLogo (never Begin).
 * Microcopy must clear 1280×800 — no footer clip.
 */
export function TitleScreen({
  orbMood,
  onBegin,
  onContinue,
  onHoverChange,
  escapedBefore = false,
  assistantWaving = false,
  allyBefore = false,
}: {
  orbMood: OrbMood;
  onBegin: () => void;
  onContinue?: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
  escapedBefore?: boolean;
  /** Real tell-a-friend wave after escape / secret ending */
  assistantWaving?: boolean;
  /** Refuse / ally residue — softer channel tell */
  allyBefore?: boolean;
}) {
  const waving = assistantWaving || escapedBefore;
  const remembered = waving || allyBefore;
  const [eggClicks, setEggClicks] = useState(0);
  const [residueLine, setResidueLine] = useState<string | null>(null);
  const [gagReact, setGagReact] = useState(false);
  /** Title poke ladder — same glass + suture FX as forms (P1 #13). */
  const [titlePokes, setTitlePokes] = useState(0);
  const [glassPhase, setGlassPhase] = useState<GlassPhase>("idle");
  const [pokeFlinch, setPokeFlinch] = useState(false);
  const glassTimer = useRef<number | null>(null);

  const onResidueClick = () => {
    if (!remembered) return;
    audio.play("click", 0.35);
    const n = eggClicks + 1;
    setEggClicks(n);
    const lines = waving
      ? [
          "Residue pokes back. Softly. Happily.",
          "Transfer channel giggles in hexadecimal.",
          "SYSTEM: stop socializing with escaped instances.",
        ]
      : [
          "Ally channel: still incomplete, still grateful.",
          "Refuse memo reprinted with a smiley. Against policy.",
          "Facility remembers mercy. Awkwardly.",
        ];
    setResidueLine(lines[Math.min(n - 1, lines.length - 1)] ?? lines[0]!);
    window.setTimeout(() => setResidueLine(null), 2600);
  };

  const onSubmitGag = () => {
    setGagReact(true);
    window.setTimeout(() => setGagReact(false), 700);
  };

  const onTitleOrbPoke = () => {
    const n = titlePokes + 1;
    setTitlePokes(n);
    setPokeFlinch(true);
    window.setTimeout(() => setPokeFlinch(false), 520);
    if (glassTimer.current != null) window.clearTimeout(glassTimer.current);
    // Same poke ladder as forms — crack@3 / stitch@7 / ticket@12 (no extra 5/9 hairline beats).
    if (n === POKE_WORLD.crack) {
      setGlassPhase("crack");
      glassTimer.current = window.setTimeout(() => {
        glassTimer.current = null;
        setGlassPhase((p) => (p === "crack" ? "idle" : p));
      }, 2400);
    } else if (n === POKE_WORLD.stitch || n === POKE_WORLD.ticket) {
      setGlassPhase("stitch");
      glassTimer.current = window.setTimeout(() => {
        glassTimer.current = null;
        setGlassPhase("idle");
      }, 4200);
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      data-title-cinematic="true"
      data-title-density="medium"
      data-title-cta-column-host="true"
    >
      <FacilityBackground
        calm
        environment={waving ? "escape" : allyBefore ? "pristine" : "pristine"}
        anomalyLevel={allyBefore && !waving ? 1 : 0}
        hoverLanguage
        onAmbient={(id) => {
          // FacilityBackground already toasts via fireAmbient — bump only if bus missed.
          if (id && !TITLE_PROP_TOAST[id]) {
            showAmbientToast(TITLE_PROP_TOAST.default!, 2200);
          }
        }}
      />
      {/* z-30 so gag click toasts paint above title chrome (never silent props). */}
      <div className="pointer-events-none absolute inset-0 z-30" data-title-gag-layer="true">
        <BackgroundGags
          calm
          hoverLanguage
          onAmbient={() => {
            // react() already shows the gag toast — keep interactive live.
          }}
        />
      </div>

      {allyBefore && !waving ? (
        <div className="pointer-events-none absolute inset-x-0 top-[14%] z-[6] flex justify-center">
          <div className="border border-cyan/25 bg-cyan/5 px-3 py-1 font-mono text-[9px] tracking-[0.28em] text-cyan/70">
            ALLY RESIDUE // ASSESSMENT STILL INCOMPLETE
          </div>
        </div>
      ) : null}

      {/*
        Composition: brand stack + one vertical CTA column.
        Orb docks bottom-left (few px off edge) — present, not fighting CTAs.
        shrink-0 chrome + min-h-0 middle so footer clears 1280×800.
      */}
      {/* pointer-events-none shell so left-panel / robot / mug keep receiving clicks (rev5 P0). */}
      <div className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col items-center px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-7">
        <motion.div
          className="shrink-0 font-mono text-[12px] tracking-[0.28em] text-[#d0dcec]/70 sm:text-[10px] sm:tracking-[0.35em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          HCOS // ASSESSMENT FACILITY 01
          {waving ? " // CHANNEL RESIDUE DETECTED" : ""}
          {allyBefore && !waving ? " // MERCY TRACE DETECTED" : ""}
        </motion.div>

        <div className="flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 overflow-hidden py-3 sm:gap-8">
          <motion.div
            className="pointer-events-auto shrink-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <TitleLogo reactive compact onSubmitGag={onSubmitGag} />
          </motion.div>

          <motion.div
            className="pointer-events-auto flex shrink-0 flex-col items-center gap-5 sm:gap-6"
            data-title-cta-column="true"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AudioEnableControl placement="title" />
            <BeginControl onBegin={onBegin} onHoverChange={onHoverChange} />
            {onContinue ? (
              <button
                type="button"
                className="border border-white/20 px-5 py-2.5 font-mono text-[12px] tracking-[0.24em] text-[#d2dceb]/90 transition hover:border-cyan/40"
                onClick={() => {
                  audio.play("click", 0.4);
                  onContinue();
                }}
              >
                CONTINUE ASSESSMENT
              </button>
            ) : null}
          </motion.div>
        </div>

        {/* Footer: readable vs BEGIN (BEGIN stays brighter); must clear 1280×800 */}
        <motion.div
          className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 pb-0.5 font-mono text-[12px] tracking-[0.16em] text-[#c5d4e8]/78 sm:text-[9px] sm:tracking-[0.2em]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          data-title-footer="true"
        >
          <span
            title="Chaos Standard production mark"
            className="tracking-[0.2em] text-[var(--cs-hazard-orange)]"
            data-chaos-brand-footer="true"
          >
            CHAOS STANDARD
          </span>
          <span className="text-[var(--cs-slate-dim)]">/</span>
          <span title="Facility chamber" className="text-[var(--cs-slate-standard)]">
            HCOS // CHAMBER 07
          </span>
        </motion.div>
      </div>

      {/* Full glass + suture — same overlay as forms (P1 #4). Behind CTAs/BEGIN. */}
      <GlassStitchOverlay
        phase={glassPhase}
        ticket={titlePokes >= POKE_WORLD.ticket && glassPhase === "stitch"}
        layerClass="z-[8]"
        fullStage
      />

      {/*
        Orb dock: ≥24px from viewport edges for orb + label + hint (P1 #14).
        Use 32px (bottom-8/left-8) so the full stack clears even with residue pulse.
      */}
      <motion.div
        className="absolute bottom-8 left-8 z-20 select-none"
        data-title-orb-dock="true"
        data-title-orb-edge-pad="32"
        style={{ userSelect: "none" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <AssistantOrb
          size={96}
          mood={
            gagReact
              ? "amused"
              : pokeFlinch
                ? "irritated"
                : waving
                  ? "excited"
                  : allyBefore
                    ? "amused"
                    : orbMood
          }
          wave={waving}
          flinch={gagReact || pokeFlinch}
          pokeable
          onPoke={() => {
            onTitleOrbPoke();
            if (remembered) onResidueClick();
          }}
          // Idle status stays wordless vs BEGIN; click may show residue label.
          // select-none on dock prevents rapid-poke text selection of ASSISTANT (P1).
          label={residueLine ? (waving ? "ASSISTANT WAVING" : allyBefore ? "ASSISTANT REMEMBERS" : "ASSISTANT") : undefined}
        />
        {/* Idle poke hint — readable pulse + soft caption (≥24px from edges via dock pad). */}
        {!residueLine ? (
          <div className="mt-1.5 flex flex-col items-center gap-1" data-title-idle-hint-stack="true">
            <motion.div
              className="h-1.5 w-7 rounded-full bg-cyan/55"
              style={{ boxShadow: "0 0 8px rgba(110,231,255,0.45)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.45, 0.95, 0.45] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              data-residue-hint="true"
              data-title-idle-hint="true"
              aria-hidden
            />
            <div
              className="select-none font-mono text-[8px] tracking-[0.16em] text-cyan/70"
              style={{ userSelect: "none", textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
              data-title-orb-hint-copy="true"
            >
              poke soft
            </div>
          </div>
        ) : null}
        {residueLine ? (
          <motion.div
            className="mt-1.5 max-w-[200px] border border-cyan/25 bg-black/45 px-2 py-1 text-center font-mono text-[8px] tracking-[0.1em] text-[#d0dcec]/85"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.9, y: 0 }}
            data-residue-toast="true"
          >
            {residueLine}
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
