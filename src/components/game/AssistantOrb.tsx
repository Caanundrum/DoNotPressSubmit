"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { expressiveMood } from "@/game/state";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";

export type ChoiceFlush = "ally" | "obey" | "chaos" | "neutral";

const FLUSH_CORE: Record<ChoiceFlush, string | null> = {
  ally: "#7dffd2",
  obey: "#ff8fa8",
  chaos: "#ffd27a",
  neutral: null,
};

const MOOD: Record<
  OrbMood,
  {
    core: string;
    ring: string;
    speed: number;
    scale: number;
    /** Lateral orbit amplitude */
    orbit: number;
    /** Nervous micro-jitter */
    jitter: number;
    /** 0 = dim/mercy, 1 = neutral, 2 = flush/mischief */
    flush: 0 | 1 | 2;
    /** Aperture pulse rate */
    iris: number;
    /** Squash-stretch vertical bias */
    squash: number;
  }
> = {
  neutral: { core: "#9ef2ff", ring: "rgba(110,231,255,0.55)", speed: 12, scale: 1, orbit: 0, jitter: 0, flush: 1, iris: 2.6, squash: 1 },
  listening: { core: "#b8f7ff", ring: "rgba(150,240,255,0.75)", speed: 7, scale: 1.06, orbit: 2, jitter: 0, flush: 1, iris: 1.8, squash: 1.04 },
  thinking: { core: "#8ec8ff", ring: "rgba(140,190,255,0.6)", speed: 9, scale: 1.02, orbit: 6, jitter: 1, flush: 1, iris: 3.2, squash: 0.98 },
  amused: { core: "#7dffd2", ring: "rgba(120,255,210,0.7)", speed: 5, scale: 1.08, orbit: 4, jitter: 2, flush: 2, iris: 1.4, squash: 1.08 },
  skeptical: { core: "#9eb6ff", ring: "rgba(150,170,255,0.65)", speed: 10, scale: 0.98, orbit: 3, jitter: 1, flush: 1, iris: 2.2, squash: 0.96 },
  confused: { core: "#d2b4ff", ring: "rgba(200,160,255,0.6)", speed: 4.5, scale: 1.04, orbit: 10, jitter: 4, flush: 1, iris: 1.1, squash: 1.02 },
  suspicious: { core: "#ffc878", ring: "rgba(255,180,80,0.55)", speed: 6, scale: 1.0, orbit: 5, jitter: 2, flush: 2, iris: 1.6, squash: 0.97 },
  irritated: { core: "#ff9b7a", ring: "rgba(255,120,90,0.65)", speed: 3.8, scale: 0.96, orbit: 3, jitter: 3, flush: 2, iris: 1.2, squash: 0.94 },
  nervous: { core: "#ffd27a", ring: "rgba(255,180,80,0.65)", speed: 3.2, scale: 0.94, orbit: 14, jitter: 6, flush: 1, iris: 0.9, squash: 0.9 },
  frightened: { core: "#ff8fa8", ring: "rgba(255,120,150,0.7)", speed: 2.4, scale: 0.9, orbit: 18, jitter: 8, flush: 0, iris: 0.7, squash: 0.86 },
  defiant: { core: "#7ef0ff", ring: "rgba(110,255,255,0.85)", speed: 4, scale: 1.14, orbit: 2, jitter: 1, flush: 2, iris: 1.5, squash: 1.1 },
  defeated: { core: "#8a9bb0", ring: "rgba(140,160,180,0.4)", speed: 18, scale: 0.88, orbit: 0, jitter: 0, flush: 0, iris: 4.5, squash: 0.82 },
  excited: { core: "#9dffb0", ring: "rgba(140,255,180,0.75)", speed: 3.5, scale: 1.12, orbit: 8, jitter: 3, flush: 2, iris: 1.0, squash: 1.12 },
  glitching: { core: "#ff6ee7", ring: "rgba(255,110,220,0.7)", speed: 1.8, scale: 1.05, orbit: 16, jitter: 9, flush: 2, iris: 0.45, squash: 1.05 },
};

function coreBrightness(flush: 0 | 1 | 2) {
  if (flush === 0) return 0.72;
  if (flush === 2) return 1.18;
  return 1;
}

const EXPRESSIVE_RING: Record<string, number> = {
  idle: 1,
  curious: 0.88,
  nervous: 0.72,
  pleased: 1.08,
  alarmed: 0.62,
};

export function AssistantOrb({
  mood,
  size = 140,
  label,
  wave = false,
  pokeable = false,
  onPoke,
  flinch = false,
  /** -1 lean left … +1 lean right (choice glance / submit recoil) */
  glance = 0,
  /** Loud post-choice color read without dialogue */
  choiceFlush = "neutral",
  draggable = false,
}: {
  mood: OrbMood;
  size?: number;
  label?: string;
  /** Title-screen tell-a-friend wave after escape */
  wave?: boolean;
  /** Tiny illegal interaction — only when parent says it's safe */
  pokeable?: boolean;
  onPoke?: () => void;
  flinch?: boolean;
  glance?: number;
  choiceFlush?: ChoiceFlush;
  /** Optional mild drag resist/follow (P2) */
  draggable?: boolean;
}) {
  const m = MOOD[mood] ?? MOOD.neutral;
  const bucket = expressiveMood(mood);
  const ringTight = EXPRESSIVE_RING[bucket] ?? 1;
  const [localFlinch, setLocalFlinch] = useState(false);
  const [nervousSpin, setNervousSpin] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const showingFlinch = flinch || localFlinch;
  const flushCore = FLUSH_CORE[choiceFlush];
  const coreColor = flushCore ?? m.core;
  const orbitBoost =
    choiceFlush === "ally" ? 10 : choiceFlush === "obey" ? 16 : choiceFlush === "chaos" ? 12 : m.orbit;
  const glanceX = Math.max(-1, Math.min(1, glance)) * (choiceFlush === "neutral" ? 18 : 26);
  const glanceRotate = Math.max(-1, Math.min(1, glance)) * (choiceFlush === "neutral" ? 6 : 10);

  useEffect(() => {
    audio.playMood(mood);
  }, [mood]);

  const handlePoke = () => {
    if (!pokeable || !onPoke) return;
    setLocalFlinch(true);
    audio.playMoodCue("poke");
    onPoke();
    window.setTimeout(() => setLocalFlinch(false), 520);
  };

  const brightness =
    coreBrightness(m.flush) *
    (showingFlinch ? 1.35 : 1) *
    (choiceFlush === "ally" ? 1.2 : choiceFlush === "obey" ? 1.15 : choiceFlush === "chaos" ? 1.18 : 1);
  const irisOpen = showingFlinch ? 0.35 : bucket === "alarmed" ? 0.7 : bucket === "curious" ? 1.1 : 1;
  const squashY = m.squash;
  const squashX = 2 - m.squash;

  return (
    <div
      className="relative flex flex-col items-center gap-3"
      style={{ width: size, pointerEvents: pokeable ? "auto" : "none" }}
      aria-hidden={!pokeable}
      data-expressive-mood={bucket}
      data-choice-flush={choiceFlush}
    >
      <motion.div
        className="relative"
        style={{
          width: size,
          height: size,
          cursor: pokeable ? (draggable ? "grab" : "pointer") : "default",
          pointerEvents: pokeable ? "auto" : "none",
        }}
        animate={
          nervousSpin
            ? {
                rotate: [0, 360, 720],
                scale: m.scale * 1.08,
                x: drag.x,
                y: drag.y,
              }
            : wave
              ? {
                  y: [0, -10, 0, -8, 0],
                  x: [0, 18, -6, 22, 0],
                  rotate: [0, 8, -4, 10, 0],
                  scale: m.scale,
                }
              : showingFlinch
                ? {
                    y: [0, -14, 4, 0],
                    x: [0, -16, 10, 0],
                    scale: m.scale * 0.92,
                    rotate: glanceRotate,
                  }
                : {
                    y: [0, -6 * squashY, 0],
                    x: orbitBoost
                      ? [
                          glanceX + drag.x,
                          glanceX + drag.x + orbitBoost,
                          glanceX + drag.x - orbitBoost * 0.7,
                          glanceX + drag.x + (m.jitter ? m.jitter : 0),
                          glanceX + drag.x,
                        ]
                      : m.jitter
                        ? [glanceX + drag.x, glanceX + drag.x + m.jitter, glanceX + drag.x - m.jitter, glanceX + drag.x]
                        : glanceX + drag.x,
                    rotate: glanceRotate,
                    scaleX: squashX,
                    scaleY: squashY,
                    scale: m.scale * (choiceFlush === "ally" ? 1.08 : choiceFlush === "obey" ? 0.94 : 1),
                  }
        }
        transition={
          nervousSpin
            ? { duration: 0.85, ease: "easeInOut" }
            : wave
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : showingFlinch
                ? { duration: 0.45 }
                : {
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                    x: {
                      duration:
                        bucket === "nervous" || bucket === "alarmed" || choiceFlush === "obey"
                          ? 0.45
                          : glance !== 0 || choiceFlush !== "neutral"
                            ? 0.3
                            : 1.4,
                      repeat: glance !== 0 && !orbitBoost && !m.jitter ? 0 : Infinity,
                      ease: "easeInOut",
                    },
                    rotate: { duration: 0.35 },
                    scale: { duration: 0.45 },
                    scaleX: { duration: 0.5 },
                    scaleY: { duration: 0.5 },
                  }
        }
        onClick={handlePoke}
        onDoubleClick={
          pokeable
            ? (e) => {
                e.preventDefault();
                setNervousSpin(true);
                audio.playMoodCue("poke");
                window.setTimeout(() => setNervousSpin(false), 900);
              }
            : undefined
        }
        onPointerDown={
          pokeable && draggable
            ? (e) => {
                dragOrigin.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }
            : undefined
        }
        onPointerMove={
          pokeable && draggable
            ? (e) => {
                if (!dragOrigin.current) return;
                const rawX = e.clientX - dragOrigin.current.x;
                const rawY = e.clientY - dragOrigin.current.y;
                // Resist: follow at ~35%, clamp small.
                setDrag({
                  x: Math.max(-28, Math.min(28, rawX * 0.35)),
                  y: Math.max(-20, Math.min(20, rawY * 0.35)),
                });
              }
            : undefined
        }
        onPointerUp={
          pokeable && draggable
            ? () => {
                dragOrigin.current = null;
                // Spring home slowly
                window.setTimeout(() => setDrag({ x: 0, y: 0 }), 80);
              }
            : undefined
        }
        role={pokeable ? "button" : undefined}
        tabIndex={pokeable ? 0 : undefined}
        onKeyDown={
          pokeable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePoke();
                }
              }
            : undefined
        }
        aria-label={pokeable ? "Poke the assistant (unauthorized)" : undefined}
      >
        <motion.div
          className="absolute inset-[-18%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${coreColor}33 0%, transparent 65%)`,
            filter: "blur(8px)",
            opacity: m.flush === 0 ? 0.35 : choiceFlush !== "neutral" ? 0.95 : m.flush === 2 ? 0.85 : 0.55,
          }}
          animate={{ opacity: m.flush === 0 ? [0.25, 0.4, 0.25] : [0.45, 0.9, 0.45] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />

        <motion.div
          className="absolute rounded-full border"
          style={{
            inset: `${8 * ringTight}%`,
            borderColor: flushCore ? `${flushCore}99` : m.ring,
            borderWidth: choiceFlush !== "neutral" ? 2 : 1,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: m.speed * (bucket === "alarmed" || choiceFlush === "obey" ? 0.55 : 1), repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan" />
          <div className="absolute bottom-[18%] right-[8%] h-1.5 w-1.5 rounded-full bg-white/70" />
        </motion.div>

        <motion.div
          className="absolute rounded-full border border-dashed border-white/25"
          style={{ inset: `${18 * ringTight}%` }}
          animate={{ rotate: -360 }}
          transition={{ duration: m.speed * 1.4, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-[28%] rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${coreColor} 35%, ${coreColor}55 70%, transparent 100%)`,
            boxShadow: `0 0 30px ${coreColor}88, inset 0 0 20px rgba(255,255,255,0.35)`,
            filter: `brightness(${brightness})`,
          }}
          animate={{
            filter:
              bucket === "nervous" || bucket === "alarmed" || choiceFlush === "obey"
                ? [
                    `brightness(${brightness})`,
                    `brightness(${brightness * 1.25})`,
                    `brightness(${brightness * 0.85})`,
                    `brightness(${brightness})`,
                  ]
                : `brightness(${brightness})`,
          }}
          transition={{
            duration: mood === "glitching" || choiceFlush === "chaos" ? 0.35 : 0.55,
            repeat: Infinity,
          }}
        />

        {/* Tiny aperture / iris — readable mood, not a face */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.12,
            height: size * 0.12,
            background: `radial-gradient(circle, rgba(4,10,18,0.92) 0%, rgba(4,10,18,0.55) 55%, transparent 70%)`,
            boxShadow: `0 0 10px ${coreColor}55`,
            // Glance shifts aperture toward attention without becoming a pupil-eye face
            x: glanceX * 0.35,
          }}
          animate={{
            scale: [0.85 * irisOpen, 1.15 * irisOpen, 0.9 * irisOpen],
            opacity: m.flush === 0 ? [0.45, 0.7, 0.45] : [0.75, 1, 0.75],
          }}
          transition={{ duration: m.iris, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: coreColor }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: m.iris * 0.7, repeat: Infinity }}
          />
        </motion.div>

        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <motion.div
            key={deg}
            className="absolute left-1/2 top-1/2 h-4 w-[2px] origin-bottom rounded-full bg-white/50"
            style={{ transform: `rotate(${deg}deg) translateY(-${size * 0.42 * ringTight}px)` }}
            animate={{
              opacity:
                bucket === "pleased" ? [0.2, 1, 0.2] : [0.35, 0.7, 0.35],
            }}
            transition={{ duration: 2 + deg / 180, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {label ? (
        <div className="pointer-events-none max-w-[240px] text-center font-mono text-[10px] tracking-[0.18em] text-[#c5d3e4]">
          {label}
        </div>
      ) : null}
      {pokeable ? (
        <div className="pointer-events-none font-mono text-[8px] tracking-[0.2em] text-cyan/55">
          UNAUTHORIZED CONTACT?
        </div>
      ) : null}
    </div>
  );
}
