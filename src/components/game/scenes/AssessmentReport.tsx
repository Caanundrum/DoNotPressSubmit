"use client";

import { motion } from "framer-motion";
import { endingTitle, trustLabel } from "@/game/state";
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

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <motion.div
        className="glass-panel w-[min(94vw,620px)] px-6 py-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="font-mono text-[10px] tracking-[0.32em] text-cyan">
          HCOS // FINAL ASSESSMENT REPORT
        </div>
        <h2
          id="report-title"
          className="mt-3 text-3xl tracking-[0.14em] text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ASSESSMENT COMPLETE
        </h2>
        <div className="mt-2 font-mono text-[12px] tracking-[0.2em] text-[#c5d3e4]">
          ENDING: {endingTitle(ending)}
        </div>

        <div className="mt-6 grid gap-2 font-mono text-[11px] tracking-[0.14em] text-[#d2dceb] sm:grid-cols-2">
          <Stat label="Forbidden clicks" value={String(state.counters.forbiddenClicks)} />
          <Stat label="Warnings ignored" value={String(state.counters.ignoredWarnings)} />
          <Stat label="Assistant trust" value={trustLabel(state.relationshipScore)} />
          <Stat
            label="Secrets found"
            value={`${state.secrets.length}/5`}
          />
          <Stat label="AI cooperation" value={String(state.counters.aiCooperation)} />
          <Stat label="System compliance" value={String(state.counters.systemCompliance)} />
          <Stat label="Personality" value={state.aiPersonality} />
          <Stat label="Session" value={state.sessionId.slice(0, 14)} />
        </div>

        {state.majorChoices.length ? (
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#a9b8ca]">
              MAJOR CHOICES
            </div>
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-[#c5d3e4]">
              {state.majorChoices.slice(-8).map((c) => (
                <li key={c}>{`// ${c}`}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="flex-1 border border-cyan/40 px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-white hover:bg-cyan/10"
            onClick={() => {
              audio.play("click", 0.4);
              onReplay();
            }}
          >
            START NEW ASSESSMENT
          </button>
          <button
            type="button"
            className="flex-1 border border-white/25 px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-[#d2dceb] hover:border-white/45"
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black/30 px-3 py-2">
      <div className="text-[9px] tracking-[0.2em] text-[#9aa6b8]">{label}</div>
      <div className="mt-1 text-[12px] text-white">{value}</div>
    </div>
  );
}
