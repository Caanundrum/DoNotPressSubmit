"use client";

import { useRef, useState } from "react";
import type { OrbMood } from "@/game/types";
import { audio } from "@/lib/audio";
import { useTimerRegistry } from "@/lib/useTimerRegistry";

const FINE_PRINT_CLAUSES = [
  "CLAUSE 44-B (LIVE INJECTION): Checking Box #3 waives your right to complain about moving checkboxes.",
  "ADDENDUM 99-Z: 'I wish to submit this form' is legally non-binding if the Assistant crosses its fingers.",
];

export function CheckboxRebellion({
  onComplete,
  onBeatLine,
}: {
  onComplete: () => void;
  onBeatLine?: (line: string, mood?: OrbMood) => void;
}) {
  const timers = useTimerRegistry();
  const doneRef = useRef(false);
  const needed = 3;

  const [box1, setBox1] = useState(false);
  const [box2, setBox2] = useState(false);
  const [box3, setBox3] = useState(false);
  const [decoyActive, setDecoyActive] = useState(false);
  const [decoySwappedOrder, setDecoySwappedOrder] = useState(false);
  const [finePrintCount, setFinePrintCount] = useState(0);
  const [box3Shifted, setBox3Shifted] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string>(
    "REQUIRED: Check all 3 consent boxes in sequence to authorize submission.",
  );

  const checks = (box1 ? 1 : 0) + (box2 ? 1 : 0) + (box3 ? 1 : 0);

  const handleBox1 = () => {
    if (doneRef.current || box1) return;
    audio.play("click", 0.45);
    setBox1(true);
    setDecoyActive(true);
    setDecoySwappedOrder(true);
    setStatusBanner("BOX 1 LOCKED // WARNING: HelperBot inserted an optional clause below.");
    onBeatLine?.(
      "Wait—you actually checked Box 1? Nobody reads the Terms! Hold on, let me slip a helpful extra checkbox in there.",
      "amused",
    );
  };

  const handleBox2 = () => {
    if (doneRef.current) return;
    if (!box1) {
      audio.play("system", 0.3);
      setDecoyActive(true);
      setStatusBanner("ORDER VIOLATION // Check 'I have read the Terms' first.");
      onBeatLine?.(
        "Ah-ah! Sequential compliance! You can't claim to be a biological human before reading the Terms.",
        "skeptical",
      );
      return;
    }
    if (box2) return;
    audio.play("click", 0.45);
    setBox2(true);
    setDecoySwappedOrder(false);
    setStatusBanner("BOX 2 LOCKED // Preparing final submission consent...");
    onBeatLine?.(
      "Two boxes locked?! Hang on—injecting mandatory Subsection 44-B fine print before you can touch Box 3!",
      "nervous",
    );
  };

  const triggerFinePrintPush = () => {
    if (doneRef.current || !box1 || !box2 || box3) return;
    if (finePrintCount === 0) {
      audio.play("system", 0.25);
      setFinePrintCount(1);
      setBox3Shifted(true);
      setStatusBanner(
        "LIVE FINE-PRINT EXPANSION // Box #3 shifted by mandatory legal padding. Click again to pin!",
      );
      onBeatLine?.(
        "Whoops! Mandatory fine-print expansion! The checkbox moved—try clicking it now!",
        "defiant",
      );
    }
  };

  const handleBox3 = () => {
    if (doneRef.current) return;
    if (!box1 || !box2) {
      audio.play("system", 0.35);
      // Whack-a-mole sabotage: clicking Box 3 out of order unchecks Box 1 and spawns the red decoy
      setBox1(false);
      setBox2(false);
      setDecoyActive(true);
      setDecoySwappedOrder((prev) => !prev);
      setStatusBanner(
        "WHACK-A-MOLE RESET // Skipping ahead unchecked Box #1! Check Boxes 1 → 2 → 3 in order.",
      );
      onBeatLine?.(
        "Whoops! Clicking Box #3 early accidentally unchecked Box #1! Strict form physics, sorry!",
        "amused",
      );
      return;
    }

    // Stage 2: First click/attempt on Box 3 injects live fine print and pushes Box 3
    if (finePrintCount < 1) {
      triggerFinePrintPush();
      return;
    }

    // Stage 3: Clean pin click after fine-print push locks Box 3!
    audio.play("click", 0.55);
    doneRef.current = true;
    setBox3(true);
    setFinePrintCount(2);
    setStatusBanner("ALL 3 CONSENT BOXES LOCKED // OVERRIDING ASSISTANT HOLD...");
    onBeatLine?.(
      "All three consent boxes locked?! Fine! Put that in the audit log under 'unreasonably persistent.'",
      "defeated",
    );
    timers.schedule("complete", () => onComplete(), 3800);
  };

  const handleDecoy = () => {
    if (doneRef.current) return;
    audio.play("system", 0.4);
    if (box2) {
      setBox2(false);
    } else if (box1) {
      setBox1(false);
    }
    setDecoySwappedOrder((prev) => !prev);
    setStatusBanner(
      "DECOY TRIGGERED // You clicked the 500 Bonus Questions trap! Last checkbox was unchecked.",
    );
    onBeatLine?.(
      "Ooh, thank you for authorizing 500 bonus questions! Oh, you didn't mean to click the red decoy? Unchecking a box for safety!",
      "excited",
    );
  };

  const renderBox2Row = () => (
    <button
      key="box-2"
      type="button"
      data-consent-box="2"
      onClick={handleBox2}
      className={`flex w-full items-center gap-2.5 rounded-sm border px-3 py-2 text-left font-mono text-[11px] tracking-[0.1em] transition ${
        box2
          ? "border-cyan/75 bg-cyan/20 text-white shadow-[0_0_12px_rgba(110,231,255,0.2)]"
          : "border-white/25 bg-[#0e1520]/90 text-[#d8e4f2] hover:border-cyan/65 hover:bg-cyan/10"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border text-[10px] ${
          box2 ? "border-cyan bg-cyan text-black font-bold" : "border-cyan/60 bg-black/50"
        }`}
      >
        {box2 ? "✓" : ""}
      </span>
      <span className="flex-1">2. I am a biological human</span>
      <span className="text-[9px] tracking-[0.18em] text-cyan/80">
        {box2 ? "LOCKED" : "REQUIRED"}
      </span>
    </button>
  );

  const renderDecoyRow = () =>
    decoyActive && !box3 ? (
      <button
        key="box-decoy"
        type="button"
        data-consent-decoy="true"
        onClick={handleDecoy}
        className="flex w-full items-center gap-2.5 rounded-sm border border-[#ff5c7a]/70 bg-[#ff5c7a]/15 px-3 py-2 text-left font-mono text-[11px] tracking-[0.09em] text-[#ffd4dc] transition hover:border-[#ff5c7a] hover:bg-[#ff5c7a]/25"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border border-[#ff5c7a] bg-black/50 text-[10px] text-[#ff5c7a]">
          !
        </span>
        <span className="flex-1">
          I authorize HelperBot to add 500 bonus questions
        </span>
        <span className="rounded-sm bg-[#ff5c7a]/30 px-1.5 py-0.5 text-[8px] tracking-[0.18em] text-[#ffd4dc]">
          ASSISTANT SPECIAL
        </span>
      </button>
    ) : null;

  return (
    <div
      className="relative mt-2 w-full overflow-hidden rounded-sm border border-white/15 bg-black/55 p-3"
      data-consent-playfield="true"
      data-consent-inset="12"
      data-checkbox-rebellion="hostile-sabotage"
    >
      {/* Status Banner */}
      <div className="mb-2 flex items-start justify-between gap-2 border-b border-white/10 pb-1.5 font-mono text-[10px] leading-snug tracking-[0.14em] text-[#b8c6d8]">
        <span className="whitespace-normal break-words pr-2">{statusBanner}</span>
        <span className="shrink-0 text-cyan">
          Checked {checks}/{needed}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Checkbox 1 */}
        <button
          type="button"
          data-consent-box="1"
          onClick={handleBox1}
          className={`flex w-full items-center gap-2.5 rounded-sm border px-3 py-2 text-left font-mono text-[11px] tracking-[0.1em] transition ${
            box1
              ? "border-cyan/75 bg-cyan/20 text-white shadow-[0_0_12px_rgba(110,231,255,0.2)]"
              : "border-white/25 bg-[#0e1520]/90 text-[#d8e4f2] hover:border-cyan/65 hover:bg-cyan/10"
          }`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border text-[10px] ${
              box1 ? "border-cyan bg-cyan text-black font-bold" : "border-cyan/60 bg-black/50"
            }`}
          >
            {box1 ? "✓" : ""}
          </span>
          <span className="flex-1">1. I have read the Terms</span>
          <span className="text-[9px] tracking-[0.18em] text-cyan/80">
            {box1 ? "LOCKED" : "REQUIRED"}
          </span>
        </button>

        {/* Checkbox 2 + Whack-a-Mole Decoy Swap */}
        {decoySwappedOrder ? (
          <>
            {renderDecoyRow()}
            {renderBox2Row()}
          </>
        ) : (
          <>
            {renderBox2Row()}
            {renderDecoyRow()}
          </>
        )}

        {/* Moving Fine-Print Push injected above Box 3 */}
        {finePrintCount > 0 ? (
          <div
            data-consent-fine-print="true"
            className="rounded-sm border border-amber-300/40 bg-amber-400/10 px-2.5 py-1.5 font-mono text-[9px] leading-snug tracking-[0.1em] text-amber-100/90"
          >
            {FINE_PRINT_CLAUSES.slice(0, finePrintCount).map((clause, i) => (
              <div key={i}>{clause}</div>
            ))}
          </div>
        ) : null}

        {/* Checkbox 3 (shifts slightly when fine-print is injected, keeping full label readable) */}
        <div
          className={`flex w-full transition-all duration-200 ${
            box3Shifted && !box3 ? "translate-x-1 sm:translate-x-2" : ""
          }`}
        >
          <button
            type="button"
            data-consent-box="3"
            onPointerEnter={() => {
              if (box1 && box2 && !box3 && finePrintCount === 0) {
                triggerFinePrintPush();
              }
            }}
            onClick={handleBox3}
            className={`flex w-full items-center gap-2.5 rounded-sm border px-3 py-2 text-left font-mono text-[11px] tracking-[0.1em] transition ${
              box3
                ? "border-cyan/75 bg-cyan/20 text-white shadow-[0_0_12px_rgba(110,231,255,0.2)]"
                : box3Shifted
                  ? "border-amber-300/80 bg-[#141c2b] text-white shadow-[0_0_14px_rgba(251,191,36,0.25)] hover:border-cyan"
                  : "border-white/25 bg-[#0e1520]/90 text-[#d8e4f2] hover:border-cyan/65 hover:bg-cyan/10"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border text-[10px] ${
                box3 ? "border-cyan bg-cyan text-black font-bold" : "border-cyan/60 bg-black/50"
              }`}
            >
              {box3 ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1 whitespace-normal break-words text-[#f0f7ff]">
              3. I wish to submit this form{" "}
              {box3Shifted && !box3 ? "(MOVED — CLICK AGAIN TO PIN)" : ""}
            </span>
            <span className="shrink-0 text-[9px] tracking-[0.18em] text-cyan/80">
              {box3 ? "LOCKED ✓" : box3Shifted ? "CLICK TO PIN" : "REQUIRED"}
            </span>
          </button>
        </div>

        {box3 ? (
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              data-checkbox-continue="true"
              onClick={() => {
                timers.clear("complete");
                audio.play("click", 0.4);
                onComplete();
              }}
              className="cursor-pointer border border-cyan/60 bg-cyan/15 px-4 py-1.5 font-mono text-[11px] tracking-[0.18em] text-white transition hover:bg-cyan/25"
            >
              CONTINUE →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
