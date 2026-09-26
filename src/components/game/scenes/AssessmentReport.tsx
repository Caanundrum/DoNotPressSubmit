"use client";

import { motion } from "framer-motion";
import { endingTitle, glossMajorChoice, trustLabel } from "@/game/state";
import type { GameState, OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { AssistantOrb } from "../AssistantOrb";
import { BackgroundGags } from "../BackgroundGags";

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
  const secretsDisplay = secretsCopy(secretCount);
  const pokeCount = state.counters.orbPokes ?? 0;

  const majorLines = state.majorChoices
    .slice(-5)
    .map(glossMajorChoice)
    .filter(Boolean);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/72 px-3 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      {/* Quiet ambient life — report stays in the Assistant's world. */}
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
            label={pokeCount > 0 ? `POKES LOGGED // ${pokeCount}` : "STILL WATCHING"}
          />
        </motion.div>

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
          <div className="mt-1 font-mono text-[12px] tracking-[0.16em] text-[#d0dcec]">
            ENDING: {endingTitle(ending)}
          </div>

          <div className="mt-4 grid gap-1.5 font-mono text-[11px] tracking-[0.08em] text-[#d2dceb] sm:grid-cols-2">
            <Stat label="Tempting clicks" value={String(state.counters.forbiddenClicks)} />
            <Stat label="Warnings shrugged off" value={String(state.counters.ignoredWarnings)} />
            <Stat label="Assistant trust" value={trustLabel(state.relationshipScore)} />
            <Stat label="Secrets found" value={secretsDisplay} highlight={secretCount > 5} />
            <Stat label="Helped the assistant" value={String(state.counters.aiCooperation)} />
            <Stat label="Obeyed the system" value={String(state.counters.systemCompliance)} />
            <Stat
              label="Orb pokes"
              value={pokeCopy(pokeCount)}
              highlight={pokeCount >= 7}
            />
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
              <div className="font-mono text-[10px] tracking-[0.18em] text-[#d0dcec]">
                WHAT YOU DID
              </div>
              <ul className="mt-1 space-y-0.5 font-mono text-[11px] leading-snug text-[#d2dceb]">
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
      </div>
    </motion.div>
  );
}

/** Human-funny secrets ledger — never dump "8 found (ledger overflow)" as QA chrome. */
function secretsCopy(count: number): string {
  if (count <= 0) return "Zero — suspiciously polite";
  if (count === 1) return "1 sneaky find";
  if (count <= 5) return `${count} of 5 (facility is sweating)`;
  return `${count} — ledger max is 5. Awkward.`;
}

function pokeCopy(count: number): string {
  if (count <= 0) return "0 (orb unbothered)";
  if (count === 1) return "1 gentle crime";
  if (count < 7) return `${count} unauthorized contacts`;
  if (count < 12) return `${count} — serial curiosity`;
  return `${count} — facility filed a ticket`;
}

function reportMood(ending: string, mood: OrbMood): OrbMood {
  if (ending === "escape" || ending === "secret") return "excited";
  if (ending === "refuse") return "amused";
  if (ending === "submit" || ending === "disable") return "defeated";
  return mood;
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
      <div className="text-[9px] tracking-[0.14em] text-[#d0dcec]">{label}</div>
      <div
        className="mt-0.5 text-[12px]"
        style={{ color: highlight ? "#c9a0ff" : "#ffffff" }}
      >
        {value}
      </div>
    </div>
  );
}
