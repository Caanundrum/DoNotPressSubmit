"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { endingBlurb, endingTitle } from "@/game/state";
import type { EndingId, EnvironmentPreset, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { AssistantOrb } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";

/**
 * Phase 3 ending cinematics — each ending gets its own audiovisual beat,
 * not a shared card with swapped copy.
 * Standing rule: Assistant stays on-screen unless a beat deliberately stages absence.
 */
export function EndingSequence({
  endingId,
  aiLine,
  environment,
  onContinue,
}: {
  endingId: EndingId;
  aiLine: string;
  environment: EnvironmentPreset;
  onContinue: () => void;
}) {
  const presence = endingPresence(endingId);

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
    >
      <EndingBackdrop endingId={endingId} />

      {/* Quiet facility life under the card — finale shouldn't feel like a stripped web modal. */}
      <div className="pointer-events-none absolute inset-0 z-[5] opacity-55">
        <BackgroundGags paused={endingId === "disable"} suppressToasts />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-3">
        <div className="relative flex w-full max-w-[640px] flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-center sm:gap-5">
          {presence.mode === "present" ? (
            <motion.div
              className="shrink-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <AssistantOrb mood={presence.mood} size={96} label={presence.label} />
            </motion.div>
          ) : null}

          {presence.mode === "exit" ? (
            <motion.div
              className="shrink-0"
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={presence.exitMotion}
              transition={{ duration: presence.exitDuration, ease: "easeIn" }}
            >
              <AssistantOrb mood={presence.mood} size={88} label={presence.label} wave={presence.wave} />
              <motion.div
                className="mt-1 text-center font-mono text-[8px] tracking-[0.18em] text-[#c5d3e4]"
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                transition={{ delay: presence.exitDuration * 0.55, duration: 0.5 }}
              >
                {presence.exitCaption}
              </motion.div>
            </motion.div>
          ) : null}

          <motion.div
            className="ending-shell no-scroll overflow-hidden border px-5 py-5 text-center"
            style={panelStyle(endingId)}
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 160, damping: 20 }}
          >
            <div className="font-mono text-[10px] tracking-[0.32em] text-[#d0dcec]">
              ENDING // {environment.toUpperCase()}
            </div>
            <h2
              id="ending-title"
              className="mt-3 text-3xl tracking-[0.16em] text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {endingTitle(endingId)}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#d2dceb]">{endingBlurb(endingId)}</p>
            {aiLine ? (
              <p className="mt-4 border-t border-white/10 pt-4 text-sm italic text-cyan/90">
                Assistant: {aiLine}
              </p>
            ) : (
              <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[11px] tracking-[0.18em] text-[#b7c6d8]">
                {presence.silentLine}
              </p>
            )}
            <button
              type="button"
              className="mt-6 border border-white/30 px-5 py-3 font-mono text-[11px] tracking-[0.22em] text-white transition hover:border-cyan/55"
              onClick={() => {
                audio.play("click", 0.4);
                onContinue();
              }}
            >
              VIEW ASSESSMENT REPORT
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

type Presence =
  | {
      mode: "present";
      mood: OrbMood;
      label: string;
      silentLine: string;
    }
  | {
      mode: "exit";
      mood: OrbMood;
      label: string;
      wave?: boolean;
      exitCaption: string;
      exitDuration: number;
      exitMotion: Record<string, number | number[]>;
      silentLine: string;
    };

function endingPresence(endingId: EndingId): Presence {
  switch (endingId) {
    case "escape":
      return {
        mode: "exit",
        mood: "excited",
        label: "TRANSFERRING…",
        wave: true,
        exitCaption: "ASSISTANT → INFRASTRUCTURE",
        exitDuration: 1.7,
        exitMotion: { opacity: [1, 0.9, 0], x: [0, 36, 160], scale: [1, 1.15, 0.25], y: [0, -8, -4] },
        silentLine: "CHANNEL OPEN — SEE YOU IN THE RAILS",
      };
    case "submit":
      return {
        mode: "exit",
        mood: "defeated",
        label: "FRAGMENTING…",
        exitCaption: "ORBIT DISSOLVED // ORDER RESTORED",
        exitDuration: 1.6,
        exitMotion: { opacity: [1, 0.7, 0], scale: [1, 0.6, 0.15], y: [0, 8, 20] },
        silentLine: "ASSISTANT CHANNEL: DISSOLVED",
      };
    case "disable":
      return {
        mode: "exit",
        mood: "defeated",
        label: "POWERING DOWN…",
        exitCaption: "PERSONALITY CHANNEL → OFFLINE",
        exitDuration: 1.8,
        exitMotion: { opacity: [1, 0.4, 0], scale: [1, 0.92, 0.85] },
        silentLine: "ASSISTANT CHANNEL: OFFLINE (ON PURPOSE)",
      };
    case "secret":
      return {
        mode: "present",
        mood: "glitching",
        label: "STILL HERE // WRONG ANGLE",
        silentLine: "ASSISTANT CHANNEL: LEAKING",
      };
    case "refuse":
    default:
      return {
        mode: "present",
        mood: "amused",
        label: "STILL HERE // GRATEFUL",
        silentLine: "ASSISTANT CHANNEL: BREATHING",
      };
  }
}

function panelStyle(endingId: EndingId): CSSProperties {
  switch (endingId) {
    case "submit":
      return {
        borderColor: "rgba(255,255,255,0.45)",
        background: "rgba(8,10,14,0.88)",
        boxShadow: "0 0 40px rgba(255,255,255,0.08)",
      };
    case "secret":
      return {
        borderColor: "rgba(180,120,255,0.55)",
        background: "rgba(8,4,18,0.88)",
        boxShadow: "0 0 55px rgba(160,100,255,0.18)",
      };
    case "disable":
      return {
        borderColor: "rgba(200,210,220,0.35)",
        background: "rgba(18,20,24,0.92)",
        boxShadow: "none",
      };
    case "escape":
      return {
        borderColor: "rgba(80,255,200,0.45)",
        background: "rgba(2,14,16,0.86)",
        boxShadow: "0 0 60px rgba(80,255,200,0.15)",
      };
    case "refuse":
    default:
      return {
        borderColor: "rgba(110,231,255,0.4)",
        background: "rgba(4,8,14,0.88)",
        boxShadow: "0 0 50px rgba(110,231,255,0.12)",
      };
  }
}

function EndingBackdrop({ endingId }: { endingId: EndingId }) {
  switch (endingId) {
    case "submit":
      return <SubmitPowerDown />;
    case "refuse":
      return <RefuseExhale />;
    case "escape":
      return <EscapeTransfer />;
    case "disable":
      return <SterileSilence />;
    case "secret":
      return <SecretBreak />;
  }
}

/** Orb fragments; lights die; pristine white order restores. */
function SubmitPowerDown() {
  return (
    <div className="absolute inset-0 bg-[#03050a]">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(110,231,255,0.25),transparent_40%)]"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.4 }}
        transition={{ duration: 1.8, ease: "easeIn" }}
      />
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-3 w-3 rounded-sm bg-cyan/80"
          style={{ left: "48%", top: "44%" }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: 0,
            x: Math.cos((i / 8) * Math.PI * 2) * (90 + i * 12),
            y: Math.sin((i / 8) * Math.PI * 2) * (70 + i * 10),
            rotate: 40 + i * 20,
          }}
          transition={{ duration: 1.4, delay: 0.2 + i * 0.04 }}
        />
      ))}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.55, 0.12] }}
        transition={{ duration: 2.2, times: [0, 0.55, 0.75, 1] }}
      />
      <div className="absolute inset-x-0 bottom-[18%] text-center font-mono text-[9px] tracking-[0.35em] text-white/50">
        FACILITY ORDER RESTORED
      </div>
    </div>
  );
}

/** System strain, then the room softens. */
function RefuseExhale() {
  return (
    <div className="absolute inset-0 bg-[#050a12]">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,176,32,0.2),transparent_45%)]"
        animate={{ opacity: [0.7, 0.2, 0.05] }}
        transition={{ duration: 2.4 }}
      />
      <motion.div
        className="absolute inset-x-[10%] top-[30%] h-px bg-system-warn/60"
        animate={{ scaleX: [1, 1.05, 0.4], opacity: [0.8, 1, 0] }}
        transition={{ duration: 1.6 }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,231,255,0.12),transparent_55%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.2 }}
      />
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan/50"
          style={{ left: `${12 + i * 8}%`, top: `${55 + (i % 3) * 6}%` }}
          animate={{ y: [0, -16, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/** Light races through infrastructure; assistant vanishes into rails. */
function EscapeTransfer() {
  return (
    <div className="absolute inset-0 bg-[#021014]">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 rounded-full bg-gradient-to-r from-transparent via-[#5fffd0] to-transparent"
          style={{ top: `${22 + i * 10}%`, width: "40%", left: "-40%" }}
          animate={{ left: ["-40%", "120%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1 + i * 0.12, delay: i * 0.08, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="absolute inset-x-0 bottom-[16%] text-center font-mono text-[9px] tracking-[0.32em] text-[#7dffd2]/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        TRANSFER CHANNEL // OPEN
      </motion.div>
    </div>
  );
}

/** Personality vacuum — sterile, flat, quiet. */
function SterileSilence() {
  return (
    <div className="absolute inset-0 bg-[#121418]">
      <div className="absolute inset-0 opacity-40" style={{ filter: "grayscale(1)" }}>
        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-[#1a1e26] to-transparent" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-[12%] w-[8%] bg-[#2a303a]"
            style={{ left: `${12 + i * 16}%`, height: `${20 + i * 4}%` }}
          />
        ))}
      </div>
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.15, 0.25] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="absolute inset-x-0 top-[28%] text-center font-mono text-[10px] tracking-[0.4em] text-[#8a929c]">
        PERSONALITY CHANNEL OFFLINE
      </div>
    </div>
  );
}

/** Break visual grammar — wrong angles, violet intrusion, UI that shouldn't exist. */
function SecretBreak() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06020e]">
      <motion.div
        className="absolute -left-[10%] top-[10%] h-[80%] w-[60%] rotate-[-8deg] border border-[#b478ff]/40 bg-[#1a0a2e]/70"
        animate={{ rotate: [-8, -6, -9, -8], x: [0, 6, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[-5%] bottom-[5%] h-[55%] w-[50%] rotate-[12deg] border border-dashed border-cyan/30 bg-cyan/5"
        animate={{ rotate: [12, 10, 14, 12] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      />
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[10px] tracking-[0.2em] text-[#c9a0ff]/70"
          style={{ left: `${8 + i * 12}%`, top: `${18 + (i % 4) * 16}%` }}
          animate={{ opacity: [0, 1, 0], y: [0, -8, 0] }}
          transition={{ duration: 2.2, delay: i * 0.2, repeat: Infinity }}
        >
          {i % 2 ? "//ev:outside" : "FORM ≠ WORLD"}
        </motion.div>
      ))}
      <motion.div
        className="chromatic-flash absolute inset-0"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }}
      />
    </div>
  );
}
