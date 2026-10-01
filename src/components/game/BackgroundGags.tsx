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
import { GAG_CLICK, GAG_DEPART, type GagId } from "@/game/ambientGagMeta";
import { ambientToastClassName } from "@/game/ambientToastDock";

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
  /** Orb anchor — overhead/loom/flee select the Form 03B floor-band path. */
  orbAnchor,
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
  orbAnchor?: string;
  /** When set, gags are clickable eggs — not fake hover-only chrome */
  onAmbient?: (id: string, secret?: string) => void;
}) {
  const path: DronePathLayout = dronePathLayout({
    calm,
    spotlight,
    companion,
    safeSide,
    orbAnchor,
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

      {/* tiny robot relocated - restored below */}

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
            data-toast-path={path}
            className={ambientToastClassName(path, calm)}
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
