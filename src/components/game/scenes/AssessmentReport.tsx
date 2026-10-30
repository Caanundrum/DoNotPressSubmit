"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PERSONALITY_SHORT_LABELS } from "@/game/personalities";
import { glossMajorChoice, trustLabel } from "@/game/state";
import { loadMetaMemory } from "@/game/storage";
import type { EndingId, GameState, OrbMood } from "@/game/types";
import { useTimerRegistry } from "@/lib/useTimerRegistry";
import { audio } from "@/lib/audio";
import { AssistantOrb } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";

const ALL_ENDINGS: { id: EndingId; label: string; hint: string }[] = [
  { id: "submit", label: "ARCHIVED", hint: "Press the final [SUBMIT] control" },
  { id: "refuse", label: "NONCOMPLIANT", hint: "Leave the survey unfinished" },
  { id: "escape", label: "TRANSFER COMPLETE", hint: "Help HelperBot escape into the rails" },
  { id: "disable", label: "MUTED AND FILED", hint: "Engage mute override and file solo" },
  { id: "secret", label: "UNMAPPED PATH", hint: "Peel the unmapped DOM seam" },
];

/**
 * Report as in-world artifacts — stamps / redactions / changed title —
 * plus the shareable Session Autopsy Dossier (Proposal 4.3).
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
  const timers = useTimerRegistry();
  const [copied, setCopied] = useState(false);

  const ending: EndingId = state.ending ?? "refuse";
  const secretCount = state.secrets.length;
  const pokeCount = state.counters.orbPokes ?? 0;

  const meta = loadMetaMemory();
  const instanceNum = Math.max(1, meta.runsCompleted);
  const endingsSeenSet = new Set<EndingId>([...meta.endingsSeen, ending]);
  const endingsDiscoveredCount = endingsSeenSet.size;
  const temperament = PERSONALITY_SHORT_LABELS[state.aiPersonality] ?? "NEUROTIC";
  const verdict = trustLabel(state.relationshipScore);
  const decisionHighlights = state.majorChoices
    .map(glossMajorChoice)
    .filter(Boolean)
    .slice(-4);

  const handleCopyDossier = () => {
    audio.play("click", 0.45);
    const summary = [
      "DO NOT PRESS SUBMIT // SESSION AUTOPSY DOSSIER",
      `Outcome: ${reportHeadline(ending)} (${endingStamp(ending)})`,
      `Instance: HelperBot #${instanceNum} (${temperament}) — ${verdict}`,
      `Secrets Found: ${secretCount}/9 | Orb Pokes: ${pokeCount} | Endings Seen: ${endingsDiscoveredCount}/5`,
      "Play at: https://dnps.chaosstandard.com",
    ].join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    setCopied(true);
    timers.schedule("dossier:copied", () => setCopied(false), 2600);
  };

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

      <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4">
        <motion.div
          className="shrink-0 max-sm:hidden"
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
          className="glass-panel report-shell max-h-[90dvh] w-full overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          data-session-autopsy-dossier="true"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-[0.22em] text-cyan">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan/80" aria-hidden />
              FACILITY FILE // SESSION AUTOPSY DOSSIER
            </span>
            <span className="text-[#9eb2cc]">
              INSTANCE #{instanceNum} · {temperament}
            </span>
          </div>
          <h2
            id="report-title"
            className="mt-1.5 text-2xl tracking-[0.12em] text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {reportHeadline(ending)}
          </h2>

          <div className="mt-3 flex flex-wrap gap-1.5" data-report-artifacts="true">
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

          <p className="mt-3 font-mono text-[12px] leading-snug tracking-[0.06em] text-[#d2dceb]">
            {artifactNote(ending)}
          </p>

          {/* Session Autopsy Dossier metrics & Key Decision Log */}
          <div className="mt-3 grid grid-cols-1 gap-2 border border-white/15 bg-black/45 p-2.5 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-cyan/85">
                AUTOPSY TELEMETRY
              </div>
              <div className="mt-1 space-y-0.5 font-mono text-[11px] text-[#dbe6f5]">
                <div>VERDICT: {verdict}</div>
                <div>
                  SECRETS UNCOVERED: {secretCount} / 9 · ORB POKES: {pokeCount}
                </div>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-cyan/85">
                KEY DECISION LOG
              </div>
              <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-[#c4d4ea]">
                {decisionHighlights.length > 0 ? (
                  decisionHighlights.map((item, idx) => (
                    <li key={`${idx}-${item}`} className="truncate">
                      • {item}
                    </li>
                  ))
                ) : (
                  <li>• Minimal trace recorded</li>
                )}
              </ul>
            </div>
          </div>

          {/* 5-Ending Collection Tracker */}
          <div
            className="mt-2.5 border border-white/15 bg-black/40 p-2.5"
            data-ending-collection-tracker="true"
          >
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-cyan/90">
              <span>ENDINGS DISCOVERED: {endingsDiscoveredCount} / 5</span>
              <span className="text-[#9eb2cc]">CROSS-RUN ARCHIVE</span>
            </div>
            <div className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-5">
              {ALL_ENDINGS.map((slot) => {
                const unlocked = endingsSeenSet.has(slot.id);
                const isCurrent = slot.id === ending;
                return (
                  <div
                    key={slot.id}
                    data-ending-slot={slot.id}
                    data-ending-unlocked={unlocked ? "true" : "false"}
                    className={`border px-2 py-1 font-mono text-[10px] leading-tight ${
                      isCurrent
                        ? "border-cyan/80 bg-cyan/15 text-white"
                        : unlocked
                          ? "border-emerald-400/45 bg-emerald-950/25 text-emerald-200"
                          : "border-white/12 bg-black/35 text-[#7f92ab]"
                    }`}
                    title={unlocked ? slot.label : `Locked — Hint: ${slot.hint}`}
                  >
                    <div className="tracking-[0.1em]">
                      {unlocked ? `✓ ${slot.label}` : "🔒 LOCKED"}
                    </div>
                    {!unlocked ? (
                      <div className="mt-0.5 text-[9px] text-[#6d8099]">{slot.hint}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-copy-dossier="true"
              className="flex-1 cursor-pointer border border-emerald-400/55 bg-emerald-950/30 px-3 py-2.5 font-mono text-[11px] tracking-[0.15em] text-emerald-100 transition hover:bg-emerald-900/40"
              onClick={handleCopyDossier}
            >
              {copied ? "DOSSIER COPIED TO CLIPBOARD ✓" : "COPY INCIDENT DOSSIER"}
            </button>
            <button
              type="button"
              className="flex-1 cursor-pointer border border-cyan/40 px-3 py-2.5 font-mono text-[11px] tracking-[0.15em] text-white hover:bg-cyan/10"
              onClick={() => {
                audio.play("click", 0.4);
                onReplay();
              }}
            >
              START NEW ASSESSMENT
            </button>
            <button
              type="button"
              className="flex-1 cursor-pointer border border-white/30 px-3 py-2.5 font-mono text-[11px] tracking-[0.15em] text-[#d8e4f4] hover:border-white/50"
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
