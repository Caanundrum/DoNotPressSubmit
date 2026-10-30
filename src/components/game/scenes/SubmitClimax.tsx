"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { climaxOptions } from "@/game/endings";
import type { GameState } from "@/game/types";
import { audio } from "@/lib/audio";

const ROUTE_TAGS: Record<string, string> = {
  refuse: "[STALEMATE ROUTE]",
  escape: "[ALLY ROUTE]",
  disable: "[COLD OVERRIDE]",
  secret: "[UNMAPPED SEAM]",
};

export function SubmitClimax({
  state,
  formLine,
  onChoose,
  onHoverOption,
}: {
  state: GameState;
  /** Form-owned subtitle — must NOT duplicate the orb bubble (P0 no-echo). */
  formLine: string;
  onChoose: (action: "submit" | "refuse" | "escape" | "disable" | "secret") => void;
  onHoverOption?: (id: string | null) => void;
}) {
  const options = climaxOptions(state);
  const altOptions = options.filter((opt) => opt.id !== "submit");

  const [overrideEscape, setOverrideEscape] = useState(false);
  const [overrideDisable, setOverrideDisable] = useState(false);
  const [seamPriedOpen, setSeamPriedOpen] = useState(false);

  const earnedEscape =
    state.relationshipScore >= 1 ||
    Boolean(state.flags.sidedWithAI) ||
    Boolean(state.flags.protectedAI) ||
    Boolean(state.flags.promisedMercy) ||
    Boolean(state.flags.sideTeam) ||
    Boolean(state.flags.allegianceAI);

  const earnedDisable =
    state.relationshipScore <= 0 ||
    Boolean(state.flags.sidedWithSystem) ||
    Boolean(state.flags.wantDisable) ||
    Boolean(state.flags.allegianceSystem) ||
    (state.counters.orbPokes ?? 0) >= 3;

  const earnedSecret =
    state.secrets.length >= 1 || Boolean(state.flags.secretDoor);

  const isRouteUnlocked = (id: string): boolean => {
    if (id === "submit" || id === "refuse") return true;
    if (id === "escape") return earnedEscape || overrideEscape;
    if (id === "disable") return earnedDisable || overrideDisable;
    if (id === "secret") return earnedSecret || seamPriedOpen;
    return true;
  };

  return (
    <div className="relative flex w-full min-h-0 flex-col gap-2" data-submit-climax="true">
      {/* Subtle flickering wall seam in the top-right corner for observant players (Proposal 1.5) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] text-[#9eb2cc]">
          ROUTES UNLOCKED BY SESSION CHOICES OR LIVE OVERRIDE
        </span>
        <button
          type="button"
          data-climax-seam="true"
          onClick={() => {
            audio.play("click", 0.45);
            setSeamPriedOpen(true);
            onHoverOption?.("secret");
          }}
          className={`cursor-pointer border px-2.5 py-1 font-mono text-[10px] tracking-[0.13em] transition ${
            seamPriedOpen || earnedSecret
              ? "border-[#b478ff]/80 bg-[#b478ff]/18 text-[#ebd6ff] shadow-[0_0_12px_rgba(180,120,255,0.3)]"
              : "animate-pulse border-[#b478ff]/45 bg-[#160d24]/80 text-[#d7b8ff] hover:border-[#b478ff]"
          }`}
        >
          {seamPriedOpen || earnedSecret
            ? "WALL SEAM OPENED — SECRET HALLWAY UNLOCKED BELOW ↓"
            : "LOOSE WALL SEAM // CLICK TO PRY OPEN SECRET EXIT"}
        </button>
      </div>

      <motion.div
        className="relative mx-auto flex w-full shrink-0 items-center justify-center"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-danger/20 blur-2xl"
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.95, 1.03, 0.95] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
        <button
          type="button"
          data-climax-submit-control="true"
          aria-label="Submit"
          className="relative w-full max-w-2xl cursor-pointer border border-danger/70 bg-gradient-to-b from-[#5a1824] via-[#2a0c12] to-[#12060a] px-4 py-2 text-center shadow-[0_0_48px_rgba(255,77,109,0.35)] transition hover:border-danger sm:px-6 sm:py-2.5"
          style={{ fontFamily: "var(--font-display)" }}
          onClick={() => {
            audio.play("system", 0.7);
            onChoose("submit");
          }}
        >
          <div className="font-mono text-[11px] tracking-[0.28em] text-danger/90">FINAL CONTROL</div>
          <div className="mt-0.5 text-2xl tracking-[0.16em] text-white sm:text-3xl">SUBMIT</div>
        </button>
      </motion.div>

      {/* Form subtitle stays distinct from the orb pitch — never paste aiLine here. */}
      <p
        className="shrink-0 text-center text-[12px] leading-snug text-[#d2dceb] sm:text-sm"
        data-climax-form-line="true"
      >
        {formLine}
      </p>

      <div className="grid min-h-0 grid-cols-1 gap-1.5 sm:grid-cols-2">
        {altOptions.map((opt) => {
          const unlocked = isRouteUnlocked(opt.id);
          const tag = ROUTE_TAGS[opt.id];
          const lockLabel =
            opt.id === "escape"
              ? "OVERRIDE WATCHDOG LOCK"
              : opt.id === "disable"
                ? "ENGAGE MUTE SWITCH"
                : "PRY WALL SEAM TO UNLOCK";

          return (
            <motion.button
              key={opt.id}
              type="button"
              data-climax-option={opt.id}
              data-route-unlocked={unlocked ? "true" : "false"}
              className="flex flex-col justify-between gap-1 border px-3 py-1.5 text-left font-mono text-[12px] leading-snug tracking-[0.11em] transition sm:px-3.5 sm:py-2 sm:text-[12px] sm:tracking-[0.13em]"
              style={{
                borderColor: !unlocked
                  ? "rgba(160,175,195,0.32)"
                  : opt.tone === "secret"
                    ? "rgba(180,120,255,0.75)"
                    : opt.tone === "sterile"
                      ? "rgba(200,210,220,0.55)"
                      : "rgba(110,231,255,0.6)",
                background: !unlocked
                  ? "linear-gradient(155deg, rgba(14,20,30,0.75) 0%, rgba(8,11,18,0.82) 100%)"
                  : "linear-gradient(155deg, rgba(22,32,48,0.92) 0%, rgba(10,14,22,0.94) 100%)",
                color: unlocked ? "#e8eef8" : "#9fb0c7",
                fontFamily: "var(--font-display)",
              }}
              whileHover={{ x: 3, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => {
                onHoverOption?.(opt.id);
                audio.play("hover", 0.2);
              }}
              onHoverEnd={() => onHoverOption?.(null)}
              onClick={() => {
                if (!unlocked) {
                  audio.play("click", 0.45);
                  if (opt.id === "escape") setOverrideEscape(true);
                  if (opt.id === "disable") setOverrideDisable(true);
                  if (opt.id === "secret") setSeamPriedOpen(true);
                  onHoverOption?.(opt.id);
                  return;
                }
                audio.play("begin", 0.55);
                onChoose(opt.id);
              }}
            >
              <div className="flex w-full items-center justify-between gap-1.5">
                {tag ? (
                  <span
                    className={`font-mono text-[10px] tracking-[0.14em] ${
                      opt.tone === "secret"
                        ? "text-[#d7b8ff]"
                        : opt.tone === "sterile"
                          ? "text-[#b8c7da]"
                          : "text-cyan/90"
                    }`}
                  >
                    {tag}
                  </span>
                ) : null}
                {!unlocked ? (
                  <span
                    data-climax-inline-override={opt.id}
                    className="border border-system-warn/55 bg-system-warn/15 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-[#ffd27a]"
                  >
                    {lockLabel}
                  </span>
                ) : (
                  <span className="font-mono text-[9px] tracking-[0.14em] text-emerald-300/90">
                    READY
                  </span>
                )}
              </div>
              <div>{opt.label}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
