"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { POKE_WORLD } from "@/game/aiLifeLocks";
import { showAmbientToast } from "@/game/ambientToastBus";
import type { BeginSeed, EndingId, OrbMood } from "@/game/types";
import { AssistantOrb } from "./AssistantOrb";
import { BackgroundGags } from "./BackgroundGags";
import { BeginControl } from "./BeginControl";
import { FacilityBackground } from "./FacilityBackground";
import { TitleLogo } from "./TitleLogo";
import {
  GlassStitchOverlay,
  type GlassPhase,
} from "./scenes/GlassStitchOverlay";
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

function titleEnv(ending: EndingId | null): "escape" | "pristine" | "archive" | "sterile" {
  if (ending === "escape") return "escape";
  if (ending === "secret") return "escape";
  if (ending === "submit") return "archive";
  if (ending === "disable") return "sterile";
  return "pristine";
}

function titleOrbMood(
  ending: EndingId | null,
  base: OrbMood,
  gagReact: boolean,
  pokeFlinch: boolean,
): OrbMood {
  if (gagReact) return "amused";
  if (pokeFlinch) return "irritated";
  if (ending === "escape") return "excited";
  if (ending === "secret") return "glitching";
  if (ending === "refuse") return "amused";
  if (ending === "submit" || ending === "disable") return "defeated";
  return base;
}

function memoryPokeLines(ending: EndingId): string[] {
  switch (ending) {
    case "escape":
      return [
        "Something pokes back.",
        "SYSTEM: Stop encouraging it.",
      ];
    case "secret":
      return [
        "Something pokes back from a wrong angle.",
        "The hall left a fingerprint. Softly.",
      ];
    case "refuse":
      return [
        "Ally channel: still incomplete, still grateful.",
        "Refuse memo reprinted with a smiley. Against policy.",
        "Facility remembers mercy. Awkwardly.",
      ];
    case "submit":
    case "disable":
      return [
        "The archive doesn't poke back. You do.",
        "Quiet room. Loud finger.",
      ];
    default:
      return ["Something notices."];
  }
}

/**
 * Calm cinematic title: dim facility life + sparse roaming eggs + orb.
 * Sound toggle lives in GameRoot corner (overhaul). SUBMIT gag may start on click 3.
 * Title look follows the most recent ending — escaped wave only after escape.
 */
export function TitleScreen({
  orbMood,
  onBegin,
  onContinue,
  onHoverChange,
  lastEnding = null,
}: {
  orbMood: OrbMood;
  onBegin: (seed?: BeginSeed) => void;
  onContinue?: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
  lastEnding?: EndingId | null;
}) {
  const escaped = lastEnding === "escape";
  const remembered = lastEnding != null;
  const [eggClicks, setEggClicks] = useState(0);
  const [memoryLine, setMemoryLine] = useState<string | null>(null);
  const [gagReact, setGagReact] = useState(false);
  const [titlePokes, setTitlePokes] = useState(0);
  const [glassPhase, setGlassPhase] = useState<GlassPhase>("idle");
  const [pokeFlinch, setPokeFlinch] = useState(false);
  const glassTimer = useRef<number | null>(null);

  const onMemoryClick = () => {
    if (!lastEnding) return;
    audio.play("click", 0.35);
    const n = eggClicks + 1;
    setEggClicks(n);
    const lines = memoryPokeLines(lastEnding);
    setMemoryLine(lines[Math.min(n - 1, lines.length - 1)] ?? lines[0]!);
    window.setTimeout(() => setMemoryLine(null), 2600);
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
      data-title-memory={lastEnding ?? "none"}
    >
      <FacilityBackground
        calm
        environment={titleEnv(lastEnding)}
        anomalyLevel={
          escaped ? 2 : lastEnding === "secret" ? 3 : lastEnding === "refuse" ? 1 : 0
        }
        hoverLanguage
        onAmbient={(id) => {
          if (id && !TITLE_PROP_TOAST[id]) {
            showAmbientToast(TITLE_PROP_TOAST.default!, 2200);
          }
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-30" data-title-gag-layer="true">
        <BackgroundGags
          calm
          hoverLanguage
          onAmbient={() => {
            // react() already shows the gag toast — keep interactive live.
          }}
        />
      </div>

      {/* Ending memory is orb mood / wave only — no banner chrome. */}

      <div className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col items-center px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-7">
        <motion.div
          className="shrink-0 px-14 text-center font-mono text-[12px] tracking-[0.28em] text-[#d0dcec]/70 sm:px-0 sm:text-[10px] sm:tracking-[0.35em]"
          data-title-facility-line="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ASSESSMENT FACILITY 01
        </motion.div>

        <div className="flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 overflow-hidden py-3 sm:gap-8">
          <motion.div
            className="pointer-events-auto shrink-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <TitleLogo
              reactive
              compact
              onSubmitGag={onSubmitGag}
              onEagerBegin={onBegin}
            />
          </motion.div>

          <motion.div
            className="pointer-events-auto flex shrink-0 flex-col items-center gap-5 sm:gap-6"
            data-title-cta-column="true"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BeginControl onBegin={() => onBegin()} onHoverChange={onHoverChange} />
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
            CHAMBER 07
          </span>
        </motion.div>
      </div>

      <GlassStitchOverlay
        phase={glassPhase}
        ticket={titlePokes >= POKE_WORLD.ticket && glassPhase === "stitch"}
        layerClass="z-[8]"
        fullStage
      />

      {/* Escape tell: orb waves from a new dock + a small prop out of place (show, don't tell). */}
      {escaped ? (
        <motion.div
          className="pointer-events-none absolute left-[8%] top-[18%] z-[12] select-none"
          data-title-escape-prop="true"
          initial={{ opacity: 0, rotate: -8, y: 8 }}
          animate={{ opacity: 0.95, rotate: [-6, -2, -7], y: [0, -3, 0] }}
          transition={{ delay: 0.4, duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <div
            className="border border-cyan/35 bg-black/55 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] text-cyan/85 shadow-[0_0_18px_rgba(80,255,200,0.18)]"
            style={{ transform: "rotate(-8deg)" }}
          >
            MUG // MISFILED
          </div>
        </motion.div>
      ) : null}

      <motion.div
        className={
          escaped
            ? "absolute bottom-10 right-8 z-20 select-none sm:bottom-12 sm:right-12"
            : "absolute bottom-8 left-8 z-20 select-none"
        }
        data-title-orb-dock="true"
        data-title-orb-edge-pad="32"
        data-title-orb-escape={escaped ? "true" : "false"}
        style={{ userSelect: "none" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <AssistantOrb
          size={escaped ? 108 : 96}
          mood={titleOrbMood(lastEnding, orbMood, gagReact, pokeFlinch)}
          wave={escaped}
          flinch={gagReact || pokeFlinch}
          pokeable
          onPoke={() => {
            onTitleOrbPoke();
            if (remembered) onMemoryClick();
          }}
          label={undefined}
        />
        {!memoryLine ? (
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
              className="select-none font-mono text-[12px] tracking-[0.16em] text-cyan/80 sm:text-[11px]"
              style={{ userSelect: "none", textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
              data-title-orb-hint-copy="true"
            >
              poke soft
            </div>
          </div>
        ) : null}
        {memoryLine ? (
          <motion.div
            className="glass-panel assistant-bubble mt-2 max-w-[min(240px,70vw)] border border-cyan/40 bg-black/70 px-3 py-2 text-left font-mono text-[12px] leading-snug tracking-[0.06em] text-[#e8eef8] shadow-[0_0_18px_rgba(110,231,255,0.16)] sm:text-[13px]"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            data-residue-toast="true"
            data-title-poke-bubble="true"
          >
            {memoryLine}
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
