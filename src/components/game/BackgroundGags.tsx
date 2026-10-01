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
    setSlot(nextSlo