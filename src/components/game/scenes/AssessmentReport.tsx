"use client";

import { motion } from "framer-motion";
import type { GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { AssistantOrb } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";

/**
 * Report as in-world artifacts — stamps / redactions / changed title —
 * never a "WHAT YOU DID" / mood / trust recap (rev5 P0).
 * Stamps must not repeat the report title.
 */
export function AssessmentReport({
  state,
  onTitle,
  onReplay,
}: {
  state: GameState;
  onTitle: () => void;
  onReplay: () => void;
}) {
  const ending = state.ending ?? "refuse";
  const secretCount = state.secrets.length;
  const pokeCount = state.counters.orbPokes ?? 0;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/72 px-3 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-45">
        <BackgroundGags suppressToasts />
      </div>

      <div className="relative z-10 flex w-full max-w-[680px] flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4">
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AssistantOrb
            mood={reportMood(ending, state.aiMood)}
            size={92}
          />
        </motion.div>

        <motion.div
          className="glass-panel report-shell no-scroll overflow-hidden px-5 py-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 font-mono text-[12px] tracking-[0.24em] text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan/80" aria-hidden />
            FACILITY FILE
          </div>
          <h2
            id="report-title"
            className="mt-2 text-2xl tracking-[0.12em] text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {reportHeadline(ending)}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2" data-report-artifacts="true">
            <Stamp
              label={endingStamp(ending)}
              tone={
                ending === "submit" || ending === "disable"
                  ? "danger"
                  : ending === "escape" || ending === "secret"
                    ? "ai"
                    : "neutral"
              }
            />
            {secretCount > 0 ? (
              <Stamp
                label={secretCount === 1 ? "TALKED TO THE ORB" : "KEPT TALKING TO IT"}
                tone="secret"
              />
            ) : ending === "refuse" ? (
              // Only when the ledger really is empty — never beside ARCHIVED / MUTED AND FILED / TRANSFER.
              <Stamp label="NOTHING FILED" tone="neutral" />
            ) : null}
            {pokeCount >= 7 ? (
              <Stamp label="ORB HARASSMENT" tone="warn" />
            ) : pokeCount > 0 ? (
              <Stamp label="CONTACT LOGGED" tone="neutral" />
            ) : null}
            {/* Tags must match the ending — never "SAVED" on archive/mute paths. */}
            {(ending === "escape" || ending === "refuse") &&
            (state.flags.allegianceAI || state.flags.protectedAI) ? (
              <Stamp label="SAVED THE ASSISTANT" tone="ai" />
            ) : null}
            {(ending === "submit" || ending === "disable") &&
            (state.flags.allegianceSystem || state.flags.wantDisable) ? (
              <Stamp label="DID AS TOLD" tone="danger" />
            ) : null}
            {ending === "submit" ? (
              <Redaction rows={2} />
            ) : null}
            {ending === "disable" ? (
              <Redaction rows={3} />
            ) : null}
          </div>

          <p className="mt-4 font-mono text-[12px] leading-snug tracking-[0.08em] text-[#d2dceb]">
            {artifactNote(ending)}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="flex-1 border border-cyan/40 px-4 py-3 font-mono text-[12px] tracking-[0.16em] text-white hover:bg-cyan/10"
              onClick={() => {
                audio.play("click", 0.4);
                onReplay();
              }}
            >
              START NEW ASSESSMENT
            </button>
            <button
              type="button"
              className="flex-1 border border-white/30 px-4 py-3 font-mono text-[12px] tracking-[0.16em] text-[#d8e4f4] hover:border-white/50"
              onClick={() => {
                audio.play("click", 0.4);
                onTitle();
              }}
            >
              RETURN TO TITLE
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function reportHeadline(ending: string): string {
  switch (ending) {
    case "submit":
      return "ASSESSMENT COMPLETE";
    case "refuse":
      return "LEFT UNFINISHED";
    case "escape":
      return "ESCAPED TOGETHER";
    case "disable":
      return "STERILE COMPLETION";
    case "secret":
      return "UNEXPECTED EGRESS";
    default:
      return "FACILITY FILE";
  }
}

/** Outcome stamp — must differ from the report title (no repeats). */
function endingStamp(ending: string): string {
  switch (ending) {
    case "submit":
      return "ARCHIVED";
    case "refuse":
      return "NONCOMPLIANT";
    case "escape":
      return "TRANSFER COMPLETE";
    case "disable":
      return "MUTED AND FILED";
    case "secret":
      return "UNMAPPED PATH";
    default:
      return "FILED";
  }
}

function artifactNote(ending: string): string {
  switch (ending) {
    case "submit":
      return "Archived. No further questions.";
    case "refuse":
      return "Form left open. The facility noted the gap and moved on.";
    case "escape":
      return "The assistant made it into the system. The file kept the fingerprints.";
    case "disable":
      return "Personality systems redacted. Efficiency excellent.";
    case "secret":
      return "An unmapped hall took traffic. The file kept the footprints.";
    default:
      return "Local file only. No cloud. No mercy.";
  }
}

function reportMood(ending: string, mood: OrbMood): OrbMood {
  if (ending === "escape" || ending === "secret") return "excited";
  if (ending === "refuse") return "amused";
  if (ending === "submit" || ending === "disable") return "defeated";
  return mood;
}

function Stamp({
  label,
  tone,
}: {
  label: string;
  tone: "danger" | "ai" | "secret" | "warn" | "neutral";
}) {
  const border =
    tone === "danger"
      ? "border-danger/55 text-[#ffb0be]"
      : tone === "ai"
        ? "border-cyan/50 text-cyan"
        : tone === "secret"
          ? "border-[#b478ff]/55 text-[#e0c8ff]"
          : tone === "warn"
            ? "border-system-warn/60 text-[#ffd27a]"
            : "border-white/25 text-[#d2dceb]";
  return (
    <div
      className={`border bg-black/40 px-2.5 py-1.5 font-mono text-[12px] tracking-[0.14em] ${border}`}
      data-report-stamp="true"
    >
      {label}
    </div>
  );
}

function Redaction({ rows }: { rows: number }) {
  return (
    <div
      className="flex min-w-[7.5rem] flex-col justify-center gap-1 border border-black bg-black px-2.5 py-1.5"
      data-report-redaction="true"
      data-report-redaction-stamp="true"
      aria-label="Redacted"
    >
      <div className="font-mono text-[11px] tracking-[0.18em] text-[#e8eef8]">
        {"█".repeat(Math.min(4, rows + 2))} REDACTED
      </div>
      {rows > 1 ? (
        <div className="h-1.5 w-full bg-[#e8eef8]/90" aria-hidden />
      ) : null}
      {rows > 2 ? (
        <div className="h-1.5 w-[85%] bg-[#e8eef8]/75" aria-hidden />
      ) : null}
    </div>
  );
}
