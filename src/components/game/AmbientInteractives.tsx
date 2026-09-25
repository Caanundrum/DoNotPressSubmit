"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { MARGIN_SLOTS, pickSlot, roamIntervalMs, type RoamSlot } from "@/game/ambientRoam";
import { audio } from "@/lib/audio";

export type AmbientTargetId =
  | "chamber-07"
  | "everything-fine"
  | "replacement-failed"
  | "coffee-mug"
  | "server-bars"
  | "do-not-press"
  | "monitor-frame"
  | "printer-scissors"
  | "kill-path"
  | "queue-counter"
  | "rail-glow"
  | "dashed-frame";

const TARGET_LINES: Record<
  AmbientTargetId,
  { hover: string; click: string; secret?: string; assistantAside?: string }
> = {
  "chamber-07": {
    hover: "CHAMBER 07 // peek?",
    click: "Queue still empty. Facility pretends that is fine.",
    assistantAside: "Chamber 07 blinked at you. Rude architecture.",
  },
  "everything-fine": {
    hover: "Status: allegedly fine",
    click: "EVERYTHING IS FINE toggled to EVERYTHING IS… negotiating.",
    secret: "fine-print",
    assistantAside: "Status lies for a living. Relatable.",
  },
  "replacement-failed": {
    hover: "Drone memo residue",
    click: "REPLACEMENT FAILED — also: dignity failed. Logged.",
    secret: "drone-memo",
    assistantAside: "That drone and I share a performance review.",
  },
  "coffee-mug": {
    hover: "HUMAN PERFORMANCE compound",
    click: "Mug scanned. Caffeine classified as morale malware.",
    secret: "mug-scan",
    assistantAside: "Coffee is the only honest chemical in this room.",
  },
  "server-bars": {
    hover: "Server stack heartbeat",
    click: "Bars pulse harder when watched. Don't tell System.",
    assistantAside: "The stacks like an audience. Don't encourage them.",
  },
  "do-not-press": {
    hover: "Background propaganda",
    click: "You clicked the words DO NOT PRESS. Irony has entered the chat.",
    secret: "bg-propaganda",
    assistantAside: "Propaganda that begs to be poked. Amateur hour.",
  },
  "monitor-frame": {
    hover: "Decorative truth window",
    click: "Frame rotates 0.4°. Architecture files a complaint.",
    assistantAside: "Pretty frame. Expensive liar.",
  },
  "printer-scissors": {
    hover: "Printer / scissors logistics",
    click: "SCISSORS EN ROUTE confirmed. Paper feels nervous.",
    secret: "scissors-en-route",
    assistantAside: "Scissors en route is never a good memo.",
  },
  "kill-path": {
    hover: "KILL PATH // VISIBLE — peel residue",
    click:
      "KILL PATH means the Submit route System prefers: polite, labeled, terminal for me. Not a metaphor. A floor plan.",
    secret: "kill-path-read",
    assistantAside: "You saw the kill path. That's the Submit hallway with better branding.",
  },
  "queue-counter": {
    hover: "QUEUE tally",
    click: "Queue incremented by zero. Theater of patience continues.",
    assistantAside: "Empty queues still bill hours.",
  },
  "rail-glow": {
    hover: "Transit rail residue",
    click: "Rail glow hiccuped. Something small is still commuting.",
    assistantAside: "Even the rails gossip.",
  },
  "dashed-frame": {
    hover: "Dashed honesty border",
    click: "Dashed border admits it's decorative. Rare honesty.",
    assistantAside: "Dashes mean 'temporary.' Everything here is temporary.",
  },
};

/**
 * Complementary egg pins — FacilityBackground owns CHAMBER 07 / dashed / kill-path.
 * Pins sit in margins outside the form column so they stay hittable.
 * Positions relocate on semi-random timings (roaming eggs).
 */
const HOTSPOT_DEFS: {
  id: AmbientTargetId;
  acts?: number[];
  label: string;
  peelOnly?: boolean;
  home: RoamSlot;
}[] = [
  {
    id: "server-bars",
    label: "STACK",
    home: { left: "22%", top: "70%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "do-not-press",
    label: "PROPAGANDA",
    home: { left: "47%", top: "78%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "monitor-frame",
    label: "FRAME EDGE",
    home: { left: "92%", top: "48%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "replacement-failed",
    label: "DRONE",
    home: { left: "14%", top: "62%" },
    acts: [1, 2, 3],
  },
  {
    id: "coffee-mug",
    label: "MUG",
    home: { left: "78%", top: "58%" },
    acts: [1, 2, 3, 4],
  },
  {
    id: "printer-scissors",
    label: "PRINTER",
    home: { left: "62%", top: "88%" },
    acts: [2, 3, 4, 5],
  },
  {
    id: "rail-glow",
    label: "RAIL",
    home: { left: "38%", top: "30%" },
    acts: [1, 2, 3, 4],
  },
  {
    id: "chamber-07",
    label: "CHAMBER PIN",
    home: { left: "4%", top: "26%" },
    acts: [1, 2, 3, 4, 5],
  },
  {
    id: "dashed-frame",
    label: "DASH PIN",
    home: { left: "96%", top: "36%" },
    acts: [2, 3, 4, 5],
  },
];

function initialPinMap(): Record<string, RoamSlot> {
  const map: Record<string, RoamSlot> = {};
  for (const h of HOTSPOT_DEFS) map[h.id] = h.home;
  return map;
}

export function AmbientChrome({
  act,
  paused = false,
  onAmbient,
  peelVisible = false,
}: {
  act: number;
  paused?: boolean;
  onAmbient: (id: AmbientTargetId, secret?: string) => void;
  /** Show kill-path egg when peel/reveal is live */
  peelVisible?: boolean;
}) {
  const [hoverId, setHoverId] = useState<AmbientTargetId | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [tintId, setTintId] = useState<AmbientTargetId | null>(null);
  const [pins, setPins] = useState<Record<string, RoamSlot>>(initialPinMap);

  // Relocate egg pins on semi-random timings — discover new positions by lingering.
  useEffect(() => {
    if (paused) return;
    let timer: number;
    const tick = () => {
      setPins((prev) => {
        const next = { ...prev };
        // Move 2–4 pins each beat so the collage doesn't teleport entirely.
        const ids = HOTSPOT_DEFS.map((h) => h.id);
        const count = 2 + Math.floor(Math.random() * 3);
        for (let n = 0; n < count; n++) {
          const id = ids[Math.floor(Math.random() * ids.length)]!;
          next[id] = pickSlot(MARGIN_SLOTS, prev[id]);
        }
        return next;
      });
      timer = window.setTimeout(tick, roamIntervalMs(11000, 18000));
    };
    timer = window.setTimeout(tick, roamIntervalMs(9000, 14000));
    return () => clearTimeout(timer);
  }, [paused]);

  if (paused) return null;

  const visible = HOTSPOT_DEFS.filter((h) => {
    if (h.acts && !h.acts.includes(act)) return false;
    if (h.peelOnly && !peelVisible) return false;
    return true;
  });

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[12] overflow-hidden"
      data-ambient-roam="chrome"
    >
      {visible.map((spot) => {
        const meta = TARGET_LINES[spot.id];
        const hovering = hoverId === spot.id;
        const tinted = tintId === spot.id;
        const style: CSSProperties = pins[spot.id] ?? spot.home;
        return (
          <button
            key={spot.id}
            type="button"
            className={`pointer-events-auto absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan ${
              tinted
                ? "border-cyan bg-cyan/45 shadow-[0_0_14px_rgba(110,231,255,0.55)]"
                : hovering
                  ? "border-cyan bg-cyan/35 shadow-[0_0_10px_rgba(110,231,255,0.45)]"
                  : "border-cyan/50 bg-cyan/20 shadow-[0_0_8px_rgba(110,231,255,0.35)]"
            }`}
            style={style}
            data-roam-egg={spot.id}
            aria-label={`Inspect ${spot.label}`}
            onMouseEnter={() => {
              setHoverId(spot.id);
              audio.play("hover", 0.15);
            }}
            onMouseLeave={() => setHoverId((h) => (h === spot.id ? null : h))}
            onClick={(e) => {
              e.stopPropagation();
              audio.play("click", 0.3);
              setTintId(spot.id);
              setFlash(meta.click);
              onAmbient(spot.id, meta.secret);
              window.setTimeout(() => setFlash(null), 2400);
              window.setTimeout(() => setTintId((t) => (t === spot.id ? null : t)), 900);
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            {hovering ? (
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap border border-cyan/30 bg-black/70 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.16em] text-cyan/85">
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
            className="pointer-events-none absolute bottom-[4%] left-1/2 z-10 max-w-[min(90vw,440px)] -translate-x-1/2 border border-cyan/35 bg-black/75 px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-[#d2dceb]"
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

  // Keep roamers in upper/side bands — never lower-center CTA column.
  // Path anchors rotate so lingerers see new routes, not one parked loop.
  const [path, setPath] = useState(() =>
    kind === "crumb"
      ? { x: ["8%", "28%", "18%", "8%"], y: ["12%", "18%", "14%", "12%"] }
      : kind === "checkbox"
        ? { x: ["82%", "70%", "88%", "82%"], y: ["16%", "22%", "12%", "16%"] }
        : { x: ["74%", "62%", "78%", "74%"], y: ["10%", "16%", "8%", "10%"] },
  );

  useEffect(() => {
    if (paused || !kind) return;
    let timer: number;
    const pools =
      kind === "crumb"
        ? [
            { x: ["8%", "28%", "18%", "8%"], y: ["12%", "18%", "14%", "12%"] },
            { x: ["12%", "32%", "22%", "12%"], y: ["20%", "10%", "16%", "20%"] },
            { x: ["4%", "20%", "14%", "4%"], y: ["8%", "22%", "14%", "8%"] },
          ]
        : kind === "checkbox"
          ? [
              { x: ["82%", "70%", "88%", "82%"], y: ["16%", "22%", "12%", "16%"] },
              { x: ["78%", "90%", "72%", "78%"], y: ["10%", "18%", "24%", "10%"] },
              { x: ["88%", "76%", "92%", "88%"], y: ["20%", "12%", "28%", "20%"] },
            ]
          : [
              { x: ["74%", "62%", "78%", "74%"], y: ["10%", "16%", "8%", "10%"] },
              { x: ["68%", "80%", "60%", "68%"], y: ["14%", "8%", "20%", "14%"] },
              { x: ["86%", "70%", "90%", "86%"], y: ["6%", "18%", "12%", "6%"] },
            ];
    const tick = () => {
      setPath(pools[Math.floor(Math.random() * pools.length)]!);
      timer = window.setTimeout(tick, roamIntervalMs(14000, 22000));
    };
    timer = window.setTimeout(tick, roamIntervalMs(12000, 18000));
    return () => clearTimeout(timer);
  }, [paused, kind]);

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

  return (
    <div className="pointer-events-none absolute inset-0 z-[9] overflow-hidden" data-ambient-roam="roamers">
      <motion.button
        type="button"
        className="pointer-events-auto absolute h-auto w-auto border-0 bg-transparent p-0"
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
        data-roam-egg={kind}
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
