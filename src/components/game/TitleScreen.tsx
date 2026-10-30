"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { POKE_WORLD } from "@/game/aiLifeLocks";
import type { BeginSeed, EndingId, OrbMood } from "@/game/types";
import { AssistantOrb } from "./AssistantOrb";
import { BeginControl } from "./BeginControl";
import { TitleLogo } from "./TitleLogo";
import {
  GlassStitchOverlay,
  type GlassPhase,
} from "./scenes/GlassStitchOverlay";
import { audio } from "@/lib/audio";
import { useTimerRegistry } from "@/lib/useTimerRegistry";

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

/** Fresh-title poke banter — real bubble lines (not a grey caption). */
const FRESH_POKE_LINES = [
  "The archive doesn't poke back. You do.",
  "Quiet room. Loud finger.",
];

/** Third poke always cracks — must speak, not silent FX. */
const CRACK_POKE_LINE = "Glass complains. That fingerprint is yours.";

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
        "Still here. Still on your side.",
        "Someone keeps printing my complaints with a smiley face.",
        "Session remembers mercy. Awkwardly.",
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

function titlePokeLine(ending: EndingId | null, pokeN: number): string {
  if (pokeN === POKE_WORLD.crack) return CRACK_POKE_LINE;
  const pool = ending ? memoryPokeLines(ending) : FRESH_POKE_LINES;
  // Skip the crack slot in the pool so click 1–2 stay distinct from click 3.
  const idx = pokeN > POKE_WORLD.crack ? pokeN - 2 : pokeN - 1;
  return pool[Math.max(0, Math.min(idx, pool.length - 1))] ?? pool[0]!;
}

/**
 * Clean cinematic title screen (Findings #1, #2, #3, #5):
 * Focused opening UI without background prop clutter (background props begin at Q1).
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
  const [pokeLine, setPokeLine] = useState<string | null>(null);
  const [gagReact, setGagReact] = useState(false);
  const [titlePokes, setTitlePokes] = useState(0);
  const [glassPhase, setGlassPhase] = useState<GlassPhase>("idle");
  const [pokeFlinch, setPokeFlinch] = useState(false);
  const timers = useTimerRegistry();

  const onSubmitGag = () => {
    setGagReact(true);
    timers.schedule("gag-react", () => setGagReact(false), 700);
  };

  const onTitleOrbPoke = () => {
    const n = titlePokes + 1;
    setTitlePokes(n);
    setPokeFlinch(true);
    timers.schedule("poke-flinch", () => setPokeFlinch(false), 520);
    audio.play("click", 0.35);

    const line = titlePokeLine(lastEnding, n);
    setPokeLine(line);
    timers.schedule("poke-line", () => setPokeLine(null), 3200);

    if (n === POKE_WORLD.crack) {
      setGlassPhase("crack");
      timers.schedule(
        "glass-phase",
        () => {
          setGlassPhase((p) => (p === "crack" ? "idle" : p));
        },
        4500,
      );
    } else if (n === POKE_WORLD.stitch) {
      setGlassPhase("stitch");
      timers.schedule(
        "glass-phase",
        () => {
          setGlassPhase("idle");
        },
        6500,
      );
    } else if (n >= POKE_WORLD.ticket) {
      setGlassPhase("stitch");
      timers.schedule(
        "glass-phase",
        () => {
          setGlassPhase("idle");
        },
        5500,
      );
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      data-title-cinematic="true"
      data-title-density="clean"
      data-title-cta-column-host="true"
      data-title-memory={lastEnding ?? "none"}
    >
      {/* Subtle atmospheric title gradient — zero background prop clutter */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(18, 38, 60, 0.45) 0%, rgba(8, 15, 26, 0.85) 62%, #050911 100%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col items-center px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-7 max-sm:pb-3 max-sm:pt-8"
        data-title-main-column="true"
      >
        <div className="flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 overflow-hidden py-3 sm:gap-8 max-sm:justify-start max-sm:pt-6 max-sm:pb-[7.5rem]">
          <motion.div
            className="pointer-events-auto shrink-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
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
            transition={{ delay: 0.45 }}
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
          className="pointer-events-auto flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 pb-1 font-mono text-[12px] tracking-[0.16em] text-[#c5d4e8]/78 sm:text-[10px] sm:tracking-[0.22em] max-sm:relative max-sm:z-[46] max-sm:mt-auto max-sm:pb-[0.35rem]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          data-title-footer="true"
        >
          <a
            href="https://chaosstandard.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Chaos Standard"
            className="tracking-[0.22em] text-[var(--cs-hazard-orange)] transition-colors hover:text-cyan"
            data-chaos-brand-footer="true"
          >
            CHAOS STANDARD
          </a>
        </motion.div>
      </div>

      {/* Assistant Orb dock */}
      <motion.div
        className={
          escaped
            ? "absolute bottom-24 right-8 z-[45] select-none sm:bottom-12 sm:right-12 max-sm:bottom-[5.75rem] max-sm:right-8"
            : "absolute bottom-24 left-6 z-[45] select-none sm:bottom-8 sm:left-8 max-sm:bottom-[5.75rem] max-sm:left-6"
        }
        data-title-orb-dock="true"
        data-title-orb-edge-pad="32"
        data-title-orb-escape={escaped ? "true" : "false"}
        data-title-orb-above-props="true"
        data-title-orb-above-footer="true"
        data-title-orb-in-frame="true"
        style={{ userSelect: "none" }}
        initial={{ opacity: 0, y: 12 }}
        animate={
          pokeFlinch
            ? { opacity: 1, y: [0, -8, 2, 0], x: escaped ? [0, -2, 1, 0] : [0, 2, -1, 0] }
            : { opacity: 1, y: 0, x: 0 }
        }
        transition={pokeFlinch ? { duration: 0.45 } : { delay: 0.55 }}
      >
        <AssistantOrb
          size={escaped ? 108 : 96}
          mood={titleOrbMood(lastEnding, orbMood, gagReact, pokeFlinch)}
          wave={escaped}
          flinch={gagReact || pokeFlinch}
          pokeable
          onPoke={onTitleOrbPoke}
          label={undefined}
        />
        {!pokeLine ? (
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
          </div>
        ) : null}
        {pokeLine ? (
          <motion.div
            className="glass-panel assistant-bubble title-poke-bubble relative mt-3 max-w-[min(260px,72vw)] border border-cyan/45 bg-black/75 px-2.5 py-1.5 text-left text-[#f0f7ff] shadow-[0_0_24px_rgba(110,231,255,0.14)]"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            data-residue-toast="true"
            data-title-poke-bubble="true"
            data-assistant-bubble="true"
            data-bubble-tail="true"
          >
            <div
              className="mb-1 flex select-none items-center gap-1.5"
              aria-hidden
              data-bubble-speaker-mark="true"
            >
              <span className="h-1 w-1 rounded-full bg-cyan/75" />
              <span className="h-px w-4 bg-cyan/40" />
            </div>
            <div className="break-words text-[13px] font-medium leading-relaxed text-[#f0f7ff] sm:text-[15px]">
              {pokeLine}
            </div>
          </motion.div>
        ) : null}
      </motion.div>

      {/* Top-of-stack broken screen overlay — renders over title UI and orb bubble */}
      <GlassStitchOverlay
        phase={glassPhase}
        ticket={titlePokes >= POKE_WORLD.ticket && glassPhase === "stitch"}
        layerClass="z-[9999]"
        fullStage
      />
    </div>
  );
}
