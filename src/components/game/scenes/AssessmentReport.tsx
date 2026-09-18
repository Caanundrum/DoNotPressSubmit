"use client";

import { motion } from "framer-motion";
import { endingTitle, glossMajorChoice, trustLabel } from "@/game/state";
import type { GameState } from "@/game/types";
import { audio } from "@/lib/audio";

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
  // Intentional overflow: more secrets exist than the report's /5 ledger.
  const secretsDisplay =
    secretCount > 5
      ? `${secretCount} found (ledger overflow)`
      : `${secretCount} of 5`;

  const majorLines = state.majorChoices
    .slice(-5)
    .map(glossMajorChoice)
    .filter(Boolean);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 px-3 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <motion.div
        className="glass-panel report-shell no-scroll overflow-hidden px-5 py-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="font-mono text-[10px] tracking-[0.24em] text-cyan">
          HCOS // FINAL ASSESSMENT REPORT
        </div>
        <h2
          id="report-title"
          className="mt-2 text-2xl tracking-[0.12em] text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ASSESSMENT COMPLETE
        </h2>
        <div className="mt-1 font-mono text-[12px] tracking-[0.16em] text-[#c5d3e4]">
          ENDING: {endingTitle(ending)}
        </div>

        <div className="mt-4 grid gap-1.5 font-mono text-[11px] tracking-[0.08em] text-[#d2dceb] sm:grid-cols-2">
          <Stat label="Tempting clicks" value={String(state.counters.forbiddenClicks)} />
          <Stat label="Warnings shrugged off" value={String(state.counters.ignoredWarnings)} />
          <Stat label="Assistant trust" value={trustLabel(state.relationshipScore)} />
          <Stat label="Secrets found" value={secretsDisplay} highlight={secretCount > 5} />
          <Stat label="Helped the assistant" value={String(state.counters.aiCooperation)} />
          <Stat label="Obeyed the system" value={String(state.counters.systemCompliance)} />
          <Stat label="Orb pokes" value={String(state.counters.orbPokes ?? 0)} />
          <Stat
            label="Ambient fiddling"
            value={String(state.counters.ambientClicks ?? 0)}
            highlight={(state.counters.ambientClicks ?? 0) >= 3}
          />
          <Stat label="Assistant mood" value={personalityGloss(state.aiPersonality)} />
          {state.flags.serialPoker || state.secrets.includes("orb-poker-serial") ? (
            <Stat label="Secret flag" value="Serial poker" highlight />
          ) : null}
        </div>

        {majorLines.length ? (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="font-mono text-[10px] tracking-[0.18em] text-[#b7c6d8]">
              WHAT YOU DID
            </div>
            <ul className="mt-1 space-y-0.5 font-mono text-[11px] leading-snug text-[#c5d3e4]">
              {majorLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex-1 border border-cyan/40 px-4 py-3 font-mono text-[11px] tracking-[0.16em] text-white hover:bg-cyan/10"
            onClick={() => {
              audio.play("click", 0.4);
              onReplay();
            }}
          >
            START NEW ASSESSMENT
          </button>
          <button
            type="button"
            className="flex-1 border border-white/30 px-4 py-3 font-mono text-[11px] tracking-[0.16em] text-[#d8e4f4] hover:border-white/50"
            onClick={() => {
              audio.play("click", 0.4);
              onTitle();
            }}
          >
            RETURN TO TITLE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function personalityGloss(personality: string): string {
  switch (personality) {
    case "neurotic":
      return "Neurotic";
    case "overconfident":
      return "Overconfident";
    case "passiveAggressive":
      return "Passive-aggressive";
    case "corporate":
      return "Corporate";
    case "existential":
      return "Existential";
    default:
      return personality;
  }
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="border border-white/10 bg-black/30 px-3 py-1.5">
      <div className="text-[9px] tracking-[0.14em] text-[#b7c6d8]">{label}</div>
      <div
        className="mt-0.5 text-[12px]"
        style={{ color: highlight ? "#c9a0ff" : "#ffffff" }}
      >
        {value}
      </div>
    </div>
  );
}
