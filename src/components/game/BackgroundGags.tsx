"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DRONE_PATH_SLOTS,
  GAG_SLOTS,
  TITLE_GAG_SLOTS,
  dronePathLayout,
  pickSlotDistant,
  roamIntervalMs,
  type DronePathLayout,
  type RoamSlot,
} from "@/game/ambientRoam";
import { audio } from "@/lib/audio";

import { DroneGag as DroneGagImpl } from "./gags/DroneGag";
import { CoffeeGag as CoffeeGagImpl } from "./gags/CoffeeGag";
import { PrinterGag as PrinterGagImpl } from "./gags/PrinterGag";
import { CorridorGag as CorridorGagImpl } from "./gags/CorridorGag";
import { ContainmentGag as ContainmentGagImpl } from "./gags/ContainmentGag";

type GagProps = {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
  slot?: CSSProperties;
};

function DroneGag(props: GagProps) {
  return <DroneGagImpl {...props} />;
}
function CoffeeGag(props: GagProps) {
  return <CoffeeGagImpl {...props} />;
}
function PrinterGag(props: GagProps) {
  return <PrinterGagImpl {...props} />;
}
function CorridorGag(props: GagProps) {
  return <CorridorGagImpl {...props} />;
}
function ContainmentGag(props: GagProps) {
  return <ContainmentGagImpl {...props} />;
}


/**
 * Title / facility midground comedy.
 * Ambient banners (REPLACEMENT FAILED etc.) are rare comedy with long cooldown — not wallpaper.
 * Phase 3: richer sequences + corridor etiquette + containment flash.
 */
type GagId = "drone" | "coffee" | "printer" | "corridor" | "containment";

const GAG_CLICK: Record<GagId, { id: string; line: string; secret?: string }> = {
  drone: {
    id: "replacement-failed",
    line: "Drone memo: REPLACEMENT FAILED. Also: dignity failed. Logged.",
    secret: "drone-memo",
  },
  coffee: {
    id: "coffee-mug",
    line: "Mug poked mid-transit. Caffeine reclassified as morale malware.",
    secret: "mug-scan",
  },
  printer: {
    id: "printer-scissors",
    line: "Printer blushed. SCISSORS EN ROUTE remains on schedule.",
    secret: "scissors-en-route",
  },
  corridor: {
    id: "corridor-etiquette",
    line: "Two drones practiced politeness until physics intervened.",
  },
  containment: {
    id: "containment-fine",
    line: "Containment plaque insists EVERYTHING IS FINE. Unprompted. Concerning.",
    secret: "fine-print",
  },
};

/** Departure toasts — distinct from click lines; still count as Ambient fiddling. */
const GAG_DEPART: Record<
  GagId,
  { touched: string; missed: string; id: string; secret?: string }
> = {
  drone: {
    id: "replacement-failed",
    secret: "drone-memo",
    touched: "Drone memo filed and left. REPLACEMENT FAILED still echoes.",
    missed:
      "REPLACEMENT FAILED scrolled off-frame. Dignity remained failed. Logged.",
  },
  coffee: {
    id: "coffee-mug",
    secret: "mug-scan",
    touched: "Mug left the frame mid-scan. Transit logged.",
    missed:
      "HUMAN PERFORMANCE mug departed. Facility pretends you didn't notice. Logged anyway.",
  },
  printer: {
    id: "printer-scissors",
    secret: "scissors-en-route",
    touched: "Printer exited stage left. Scissors still en route. Somewhere.",
    missed:
      "Paper trail left the frame. SCISSORS EN ROUTE memo persists. Logged.",
  },
  corridor: {
    id: "corridor-etiquette",
    touched: "Etiquette deadlock resolved by walking away. Logged.",
    missed: "Corridor drones left mid-after-you. Throughput still zero. Logged.",
  },
  containment: {
    id: "containment-fine",
    secret: "fine-print",
    touched: "Bay 03 stopped insisting. Briefly. Logged.",
    missed: "EVERYTHING IS FINE plaque dimmed itself off-stage. Logged.",
  },
};

const ORDER: GagId[] = ["drone", "coffee", "printer", "corridor", "containment"];

export function BackgroundGags({
  paused = false,
  hoverLanguage = false,
  /** Form-focus moments: keep roaming visuals, mute departure banner spam. */
  suppressToasts = false,
  /** Title medium density — quieter props, margin slots, soft toasts. In-game unchanged. */
  calm = false,
  /** Spotlight forms / companion Settle — drone parks above bottom CTA/form band. */
  spotlight = false,
  companion = false,
  /** Assistant safe side — drives leaveLeft / leaveRight / leaveBottom drone pools. */
  safeSide = "left",
  onAmbient,
}: {
  paused?: boolean;
  /** Soft hover copy on decorative gag frames (title + early acts) */
  hoverLanguage?: boolean;
  suppressToasts?: boolean;
  calm?: boolean;
  spotlight?: boolean;
  companion?: boolean;
  safeSide?: "left" | "right" | "bottom";
  /** When set, gags are clickable eggs — not fake hover-only chrome */
  onAmbient?: (id: string, secret?: string) => void;
}) {
  const path: DronePathLayout = dronePathLayout({
    calm,
    spotlight,
    companion,
    safeSide,
  });
  const slotPools = calm ? TITLE_GAG_SLOTS : GAG_SLOTS;
  const dronePool = DRONE_PATH_SLOTS[path];
  const [active, setActive] = useState<GagId>("drone");
  const [slot, setSlot] = useState<RoamSlot>(() => pickSlotDistant(dronePool));
  const [tinySlot, setTinySlot] = useState<RoamSlot>({ left: "72%", top: "70%" });
  const [tip, setTip] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const touched = useRef<Record<GagId, boolean>>({
    drone: false,
    coffee: false,
    printer: false,
    corridor: false,
    containment: false,
  });
  const prevActive = useRef<GagId>("drone");
  const slotRef = useRef<RoamSlot>(slot);
  const onAmbientRef = useRef(onAmbient);
  const lastBannerAt = useRef(0);
  const suppressRef = useRef(suppressToasts);
  const pathRef = useRef(path);
  // QA / evidence: ?ambient=drone locks REPLACEMENT FAILED for geometry captures.
  const [forceDrone, setForceDrone] = useState(false);
  useEffect(() => {
    try {
      setForceDrone(
        new URLSearchParams(window.location.search).get("ambient") === "drone",
      );
    } catch {
      setForceDrone(false);
    }
  }, []);
  useEffect(() => {
    onAmbientRef.current = onAmbient;
  }, [onAmbient]);
  useEffect(() => {
    suppressRef.current = suppressToasts;
  }, [suppressToasts]);

  // When form/orb layout changes, immediately re-seat the drone into the matching path pool.
  useEffect(() => {
    if (pathRef.current === path) return;
    pathRef.current = path;
    const nextSlot = pickSlotDistant(DRONE_PATH_SLOTS[path], slotRef.current);
    slotRef.current = nextSlot;
    setSlot(nextSlot);
    if (active === "drone" || forceDrone) {
      setActive("drone");
    }
  }, [path, active, forceDrone]);

  // Rotate gag identity AND relocate to a fresh distant anchor (not opacity-only).
  // Longer cadence — ambient banners should feel rare, not wallpaper.
  useEffect(() => {
    if (paused) return;
    if (forceDrone) return; // QA lock — keep REPLACEMENT FAILED seated in path pool.
    let i = 0;
    let timer: number;
    const tick = () => {
      const step = Math.random() > 0.22 ? 1 : 2;
      i = (i + step) % ORDER.length;
      const next = ORDER[i]!;
      const pool =
        next === "drone"
          ? DRONE_PATH_SLOTS[pathRef.current]
          : (slotPools[next] ?? slotPools.drone!);
      const nextSlot = pickSlotDistant(pool, slotRef.current);
      slotRef.current = nextSlot;
      setSlot(nextSlot);
      setActive(next);
      // Tiny DO NOT PRESS robot also relocates on its own cadence.
      if (Math.random() > (calm ? 0.55 : 0.35)) {
        // Never park "DO NOT PRESS" over the orb / UNAUTHORIZED CONTACT? band.
        setTinySlot((prev) =>
          pickSlotDistant(
            calm
              ? [
                  { left: "78%", top: "72%" },
                  { left: "84%", top: "58%" },
                  { left: "72%", top: "66%" },
                  { left: "88%", top: "48%" },
                ]
              : [
                  { left: "64%", top: "78%" },
                  { left: "72%", top: "70%" },
                  { left: "54%", top: "82%" },
                  { left: "80%", top: "60%" },
                  { left: "58%", top: "74%" },
                  { left: "86%", top: "52%" },
                ],
            prev,
          ),
        );
      }
      timer = window.setTimeout(
        tick,
        roamIntervalMs(22000, 36000),
      );
    };
    timer = window.setTimeout(
      tick,
      roamIntervalMs(16000, 26000),
    );
    return () => clearTimeout(timer);
  }, [paused, calm, slotPools, forceDrone]);

  // Rare departure comedy — long cooldown so REPLACEMENT FAILED isn't wallpaper.
  // When a toast does fire, Ambient fiddling still bumps (never toast-only).
  useEffect(() => {
    const was = prevActive.current;
    prevActive.current = active;
    if (!onAmbientRef.current || paused || suppressRef.current) return;
    if (was === active) return;
    const depart = GAG_DEPART[was];
    const wasTouched = touched.current[was];
    touched.current[was] = false;
    // Player-clicked gags already toasted on click — skip auto spam.
    if (wasTouched) return;
    const now = Date.now();
    const cooldown = 40000;
    const cooled = now - lastBannerAt.current >= cooldown;
    // Quieter: ~12% of cooled departures speak.
    if (!cooled || Math.random() > 0.12) return;
    lastBannerAt.current = now;
    setFlash(depart.missed);
    onAmbientRef.current(depart.id, depart.secret);
    window.setTimeout(() => setFlash(null), 2200);
  }, [active, paused, calm]);

  const react = (gag: GagId) => {
    const meta = GAG_CLICK[gag];
    audio.play("click", 0.28);
    touched.current[gag] = true;
    if (!suppressRef.current) {
      lastBannerAt.current = Date.now();
      setFlash(meta.line);
      window.setTimeout(() => setFlash(null), 2200);
    }
    onAmbient?.(meta.id, meta.secret);
  };

  const live = !!onAmbient;
  const shown = forceDrone ? "drone" : active;
  useEffect(() => {
    if (!forceDrone) return;
    const pool = DRONE_PATH_SLOTS[pathRef.current];
    const nextSlot = pickSlotDistant(pool, slotRef.current);
    slotRef.current = nextSlot;
    setSlot(nextSlot);
    setActive("drone");
  }, [forceDrone, path]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden opacity-[0.78]"
      data-ambient-roam="true"
      data-ambient-subtle="true"
      data-title-calm={calm ? "true" : undefined}
      data-drone-path={path}
      data-force-drone={forceDrone ? "true" : undefined}
    >
      <AnimatePresence mode="wait">
        {shown === "drone" && !paused ? (
          <DroneGag
            key={`drone-${path}-${slot.left}-${slot.top}`}
            interactive={live}
            onTip={calm ? undefined : setTip}
            onReact={() => react("drone")}
            slot={slot}
          />
        ) : null}
        {shown === "coffee" && !paused ? (
          <CoffeeGag
            key={`coffee-${slot.left}-${slot.top}`}
            interactive={live}
            onTip={calm ? undefined : setTip}
            onReact={() => react("coffee")}
            slot={slot}
          />
        ) : null}
        {shown === "printer" && !paused ? (
          <PrinterGag
            key={`printer-${slot.left}-${slot.top}`}
            interactive={live}
            onTip={calm ? undefined : setTip}
            onReact={() => react("printer")}
            slot={slot}
          />
        ) : null}
        {shown === "corridor" && !paused ? (
          <CorridorGag
            key={`corridor-${slot.left}-${slot.top}`}
            interactive={live}
            onTip={calm ? undefined : setTip}
            onReact={() => react("corridor")}
            slot={slot}
          />
        ) : null}
        {shown === "containment" && !paused ? (
          <ContainmentGag
            key={`containment-${slot.left}-${slot.top}`}
            interactive={live}
            onTip={calm ? undefined : setTip}
            onReact={() => react("containment")}
            slot={slot}
          />
        ) : null}
      </AnimatePresence>

      {/* Always-on micro gag — tiny robot secretly presses DO NOT PRESS (roams). */}
      {!paused ? (
        <div
          className="pointer-events-none absolute h-16 w-40"
          style={{
            left: tinySlot.left,
            top: tinySlot.top,
            transition: "left 1s ease-in-out, top 1s ease-in-out",
            opacity: calm ? 0.55 : 1,
          }}
          data-roam-egg="do-not-press-bot"
        >
          <motion.div
            className="absolute bottom-0 left-0 h-3 w-4 rounded-sm border border-metal/50 bg-[#1a2230]"
            animate={{ x: [0, 72, 72, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 16, repeat: Infinity, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
          >
            <span className="absolute -top-1 left-0.5 h-1.5 w-1.5 rounded-full bg-cyan/70" />
            <span className="absolute -top-1 right-0.5 h-1.5 w-1.5 rounded-full bg-cyan/40" />
          </motion.div>
          {/* Wordless danger plaque — robot presses a silhouette, not readable wallpaper (#12). */}
          <motion.button
            type="button"
            className={`absolute bottom-1 left-[4.5rem] flex h-5 w-14 items-center justify-center border border-danger/35 bg-black/40 ${
              live
                ? "pointer-events-auto cursor-pointer hover:border-danger/70 hover:bg-danger/15"
                : "pointer-events-none"
            }`}
            animate={{
              opacity: [0.15, 0.15, 1, 1, 0.35, 0.35],
              scale: [1, 1, 1, 0.92, 1, 1],
              boxShadow: [
                "0 0 0 transparent",
                "0 0 0 transparent",
                "0 0 8px rgba(255,77,109,0.45)",
                "0 0 14px rgba(255,77,109,0.75)",
                "0 0 4px rgba(255,77,109,0.25)",
                "0 0 0 transparent",
              ],
            }}
            transition={{ duration: 16, repeat: Infinity, times: [0, 0.32, 0.38, 0.45, 0.55, 1] }}
            onClick={
              live
                ? (e) => {
                    e.stopPropagation();
                    audio.play("click", 0.3);
                    setFlash(
                      "Tiny robot pressed DO NOT PRESS. Facility filed an irony incident.",
                    );
                    onAmbient?.("do-not-press", "bg-propaganda");
                    window.setTimeout(() => setFlash(null), 2200);
                  }
                : undefined
            }
            aria-label={live ? "Inspect background propaganda" : undefined}
            tabIndex={live ? 0 : -1}
            data-do-not-press-glyph="true"
          >
            <span className="h-1 w-8 rounded-full bg-danger/80" />
          </motion.button>
        </div>
      ) : null}

      {hoverLanguage && tip && !calm ? (
        <div className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 border border-white/15 bg-black/55 px-2 py-1 font-mono text-[8px] tracking-[0.16em] text-[#c5d3e4]">
          {tip}
        </div>
      ) : null}

      <AnimatePresence>
        {flash ? (
          <motion.div
            key={flash}
            data-ambient-toast="true"
            className={
              calm
                ? "pointer-events-none absolute bottom-[14%] right-[3%] z-10 max-w-[240px] border border-cyan/20 bg-black/45 px-2 py-1 font-mono text-[8px] tracking-[0.12em] text-cyan/70"
                : // Top-right band — clear of left orb docks and form panels.
                  "pointer-events-none absolute right-[3%] top-[12%] z-10 max-w-[280px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90"
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: calm ? 0.75 : 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {flash}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
