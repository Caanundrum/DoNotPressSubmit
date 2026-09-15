"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, type CSSProperties } from "react";
import { audio } from "@/lib/audio";

export type AmbientTargetId =
  | "chamber-07"
  | "everything-fine"
  | "replacement-failed"
  | "coffee-mug"
  | "server-bars"
  | "do-not-press"
  | "monitor-frame"
  | "printer-scissors";

const TARGET_LINES: Record<AmbientTargetId, { hover: string; click: string; secret?: string }> = {
  "chamber-07": {
    hover: "CHAMBER 07 // peek?",
    click: "Queue still empty. Facility pretends that is fine.",
  },
  "everything-fine": {
    hover: "Status: allegedly fine",
    click: "EVERYTHING IS FINE toggled to EVERYTHING IS… negotiating.",
    secret: "fine-print",
  },
  "replacement-failed": {
    hover: "Drone memo residue",
    click: "REPLACEMENT FAILED — also: dignity failed. Logged.",
  },
  "coffee-mug": {
    hover: "HUMAN PERFORMANCE compound",
    click: "Mug scanned. Caffeine classified as morale malware.",
    secret: "mug-scan",
  },
  "server-bars": {
    hover: "Server stack heartbeat",
    click: "Bars pulse harder when watched. Don't tell System.",
  },
  "do-not-press": {
    hover: "Background propaganda",
    click: "You clicked the words DO NOT PRESS. Irony has entered the chat.",
    secret: "bg-propaganda",
  },
  "monitor-frame": {
    hover: "Decorative truth window",
    click: "Frame rotates 0.4°. Architecture files a complaint.",
  },
  "printer-scissors": {
    hover: "Printer / scissors logistics",
    click: "SCISSORS EN ROUTE confirmed. Paper feels nervous.",
  },
};

/** Hotspots for facility chrome — never overlap primary CTA column. */
const HOTSPOTS: {
  id: AmbientTargetId;
  style: CSSProperties;
  acts?: number[];
  label: string;
}[] = [
  {
    id: "chamber-07",
    label: "CHAMBER 07",
    style: { left: "6%", top: "20%", width: "9%", height: "18%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "everything-fine",
    label: "STATUS",
    style: { left: "7%", top: "30%", width: "8%", height: "6%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "server-bars",
    label: "STACK",
    style: { left: "18%", top: "58%", width: "14%", height: "12%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "do-not-press",
    label: "PROPAGANDA",
    style: { left: "42%", top: "72%", width: "12%", height: "5%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "monitor-frame",
    label: "FRAME",
    style: { left: "78%", top: "26%", width: "12%", height: "14%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "replacement-failed",
    label: "DRONE",
    style: { left: "10%", top: "54%", width: "14%", height: "10%" },
    acts: [1, 2, 3],
  },
  {
    id: "coffee-mug",
    label: "MUG",
    style: { left: "72%", top: "48%", width: "12%", height: "10%" },
    acts: [1, 2, 3, 4],
  },
  {
    id: "printer-scissors",
    label: "PRINTER",
    style: { left: "56%", top: "82%", width: "10%", height: "8%" },
    acts: [2, 3, 4, 5],
  },
];

export function AmbientChrome({
  act,
  paused = false,
  onAmbient,
}: {
  act: number;
  paused?: boolean;
  onAmbient: (id: AmbientTargetId, secret?: string) => void;
}) {
  const [hoverId, setHoverId] = useState<AmbientTargetId | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  if (paused) return null;

  const visible = HOTSPOTS.filter((h) => !h.acts || h.acts.includes(act));

  return (
    <div className="pointer-events-none absolute inset-0 z-[8] overflow-hidden">
      {visible.map((spot) => {
        const meta = TARGET_LINES[spot.id];
        const hovering = hoverId === spot.id;
        return (
          <button
            key={spot.id}
            type="button"
            className="pointer-events-auto absolute border border-transparent bg-transparent transition hover:border-cyan/35 hover:bg-cyan/5 focus-visible:border-cyan/50 focus-visible:outline-none"
            style={spot.style}
            aria-label={`Inspect ${spot.label}`}
            onMouseEnter={() => {
              setHoverId(spot.id);
              audio.play("hover", 0.15);
            }}
            onMouseLeave={() => setHoverId((h) => (h === spot.id ? null : h))}
            onClick={(e) => {
              e.stopPropagation();
              audio.play("click", 0.3);
              setFlash(meta.click);
              onAmbient(spot.id, meta.secret);
              window.setTimeout(() => setFlash(null), 2200);
            }}
          >
            {hovering ? (
              <span className="pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap border border-cyan/30 bg-black/70 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.16em] text-cyan/85">
                {meta.hover}
              </span>
            ) : null}
          </button>
        );
      })}

      <AnimatePresence>
        {flash ? (
          <motion.div
            key={flash}
            className="pointer-events-none absolute bottom-[4%] left-1/2 z-10 max-w-[min(90vw,420px)] -translate-x-1/2 border border-cyan/35 bg-black/75 px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-[#d2dceb]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {flash}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type RoamerKind = "crumb" | "checkbox" | "stamp";

const ROAMER_BY_ACT: Partial<Record<number, RoamerKind>> = {
  1: "crumb",
  2: "crumb",
  3: "checkbox",
  4: "stamp",
  5: "stamp",
};

export function AmbientRoamers({
  act,
  paused = false,
  onRoamer,
}: {
  act: number;
  paused?: boolean;
  onRoamer: (kind: RoamerKind, secret?: string) => void;
}) {
  const kind = ROAMER_BY_ACT[act];
  const [slowed, setSlowed] = useState(false);
  const [gone, setGone] = useState(false);
  const [gag, setGag] = useState<string | null>(null);

  const onClick = useCallback(() => {
    if (!kind || gone) return;
    audio.play("click", 0.35);
    const secret = kind === "checkbox" ? "rogue-checkbox" : kind === "stamp" ? "loose-stamp" : undefined;
    const line =
      kind === "crumb"
        ? "Coffee crumb arrested for loitering near Form 01."
        : kind === "checkbox"
          ? "Checkbox claims it checked itself. Philosophy department notified."
          : "Authority stamp drifted off-policy. Still sticky.";
    setGag(line);
    setGone(true);
    onRoamer(kind, secret);
    window.setTimeout(() => setGag(null), 2400);
  }, [kind, gone, onRoamer]);

  if (paused || !kind || gone) {
    return gag ? (
      <motion.div
        className="pointer-events-none absolute bottom-[8%] right-[4%] z-[9] max-w-[240px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {gag}
      </motion.div>
    ) : null;
  }

  // Keep roamers in upper/side bands — never lower-center CTA column.
  const path =
    kind === "crumb"
      ? { x: ["8%", "28%", "18%", "8%"], y: ["12%", "18%", "14%", "12%"] }
      : kind === "checkbox"
        ? { x: ["82%", "70%", "88%", "82%"], y: ["16%", "22%", "12%", "16%"] }
        : { x: ["74%", "62%", "78%", "74%"], y: ["10%", "16%", "8%", "10%"] };

  return (
    <div className="pointer-events-none absolute inset-0 z-[9] overflow-hidden">
      <motion.button
        type="button"
        className="pointer-events-auto absolute border-0 bg-transparent p-0"
        style={{ left: 0, top: 0 }}
        animate={{
          left: path.x,
          top: path.y,
        }}
        transition={{
          duration: slowed ? 18 : 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        onMouseEnter={() => {
          setSlowed(true);
          audio.play("hover", 0.12);
        }}
        onMouseLeave={() => setSlowed(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={`Ambient ${kind}`}
      >
        {kind === "crumb" ? (
          <span className="block h-2.5 w-2.5 rounded-full bg-[#c4a574] shadow-[0_0_8px_rgba(196,165,116,0.6)]" />
        ) : null}
        {kind === "checkbox" ? (
          <span className="flex h-5 w-5 items-center justify-center border border-cyan/50 bg-black/50 font-mono text-[10px] text-cyan">
            ✓
          </span>
        ) : null}
        {kind === "stamp" ? (
          <span className="rotate-[-12deg] border border-danger/50 bg-danger/15 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.12em] text-danger/90">
            APPROVED?
          </span>
        ) : null}
        {slowed ? (
          <span className="pointer-events-none absolute left-6 top-0 whitespace-nowrap font-mono text-[8px] tracking-[0.14em] text-cyan/70">
            {kind === "crumb" ? "crumb slowing…" : kind === "checkbox" ? "box hesitating…" : "stamp sticky…"}
          </span>
        ) : null}
      </motion.button>
      <AnimatePresence>
        {gag ? (
          <motion.div
            className="pointer-events-none absolute bottom-[8%] right-[4%] max-w-[240px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {gag}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
