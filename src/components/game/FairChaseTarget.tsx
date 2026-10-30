"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTimerRegistry } from "@/lib/useTimerRegistry";

/**
 * Evasive Chase Target — Q11 & setpiece controller:
 * - No free hover-freeze and no magnet pull toward the cursor.
 * - Proximity evasion: when pointer approaches within `dodgeRadiusPx` (default `110px`),
 *   the target actively dodges to a distant waypoint, followed by a brief `280ms`
 *   post-dodge recovery cooldown so a fast player can catch it on the recovery beat.
 * - Uses `useTimerRegistry` for all timers and enforces pixel edge insets (`enforcePixelInset`).
 */
export function FairChaseTarget({
  arenaRef,
  waypoints,
  idx,
  onIdxChange,
  disabled,
  hitPad = 24,
  stepIntervalMs = 1150,
  stepIntervalAfterFirstHitMs,
  hits = 0,
  edgeInsetPx = 10,
  dodgeRadiusPx = 110,
  dodgeCooldownMs = 280,
  onCatch,
  children,
}: {
  arenaRef: React.RefObject<HTMLElement | null>;
  waypoints: readonly { x: number; y: number }[];
  idx: number;
  onIdxChange: (updater: (prev: number) => number) => void;
  disabled?: boolean;
  /** Invisible hit expansion in px around visible child */
  hitPad?: number;
  stepIntervalMs?: number;
  stepIntervalAfterFirstHitMs?: number;
  hits?: number;
  /** Minimum pixel clearance from arena inner border on all 4 sides */
  edgeInsetPx?: number;
  /** Pointer proximity distance (px) that triggers an active evasive dodge */
  dodgeRadiusPx?: number;
  /** Post-dodge cooldown (ms) so fast players can catch the button on recovery */
  dodgeCooldownMs?: number;
  onCatch: () => void;
  children: React.ReactNode;
}) {
  const timers = useTimerRegistry();
  const targetRef = useRef<HTMLButtonElement | null>(null);
  const travelingRef = useRef(false);
  const dodgeCooldownRef = useRef(false);
  const [travelSec, setTravelSec] = useState(0.32);

  /** Clamp percentage so target + hitPad never cross within edgeInsetPx of arena border. */
  const clampPos = useCallback(
    (rawX: number, rawY: number) => {
      const arena = arenaRef.current;
      const btn = targetRef.current;
      if (!arena) {
        return {
          x: Math.max(8, Math.min(72, rawX)),
          y: Math.max(12, Math.min(68, rawY)),
        };
      }
      const r = arena.getBoundingClientRect();
      const bw = btn?.offsetWidth ?? 190;
      const bh = btn?.offsetHeight ?? 60;
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      const minX = ((edgeInsetPx + hitPad) / w) * 100;
      const maxX = Math.max(minX + 2, ((w - bw - edgeInsetPx - hitPad) / w) * 100);
      const minY = ((edgeInsetPx + hitPad) / h) * 100;
      const maxY = Math.max(minY + 2, ((h - bh - edgeInsetPx - hitPad) / h) * 100);
      return {
        x: Math.max(minX, Math.min(maxX, rawX)),
        y: Math.max(minY, Math.min(maxY, rawY)),
      };
    },
    [arenaRef, edgeInsetPx, hitPad],
  );

  const pos = waypoints[idx % waypoints.length] ?? { x: 24, y: 30 };
  const clamped = clampPos(pos.x, pos.y);
  const [nudge, setNudge] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  /** Hard post-transform pixel clamp so visible child never touches arena border. */
  const enforcePixelInset = useCallback(
    (nx: number, ny: number) => {
      const arena = arenaRef.current;
      const btn = targetRef.current;
      if (!arena || !btn) return { x: nx, y: ny };
      const ar = arena.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      const curDx = nx;
      const curDy = ny;
      const baseLeft = br.left - curDx;
      const baseRight = br.right - curDx;
      const baseTop = br.top - curDy;
      const baseBottom = br.bottom - curDy;
      const minLeft = ar.left + edgeInsetPx;
      const maxRight = ar.right - edgeInsetPx;
      const minTop = ar.top + edgeInsetPx;
      const maxBottom = ar.bottom - edgeInsetPx;
      let cx = nx;
      let cy = ny;
      if (baseLeft + cx < minLeft) cx = minLeft - baseLeft;
      if (baseRight + cx > maxRight) cx = maxRight - baseRight;
      if (baseTop + cy < minTop) cy = minTop - baseTop;
      if (baseBottom + cy > maxBottom) cy = maxBottom - baseBottom;
      return { x: cx, y: cy };
    },
    [arenaRef, edgeInsetPx],
  );

  const interval =
    hits > 0 && stepIntervalAfterFirstHitMs ? stepIntervalAfterFirstHitMs : stepIntervalMs;

  // Periodic patrol waypoint hop when idle
  useEffect(() => {
    if (disabled) return;
    const id = window.setInterval(() => {
      if (dodgeCooldownRef.current || travelingRef.current) return;
      travelingRef.current = true;
      setTravelSec(0.32);
      setNudge({ x: 0, y: 0 });
      onIdxChange((i) => (i + 1) % waypoints.length);
      timers.schedule(
        "patrol-travel",
        () => {
          travelingRef.current = false;
        },
        320,
      );
    }, interval);
    return () => {
      window.clearInterval(id);
    };
  }, [disabled, interval, onIdxChange, timers, waypoints.length]);

  // Active evasive dodge when pointer approaches within `dodgeRadiusPx` (110px)
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || disabled) return;

    const onMove = (e: PointerEvent) => {
      const btn = targetRef.current;
      if (!btn) return;
      if (travelingRef.current || dodgeCooldownRef.current) return;

      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      if (dist <= dodgeRadiusPx) {
        const ar = arena.getBoundingClientRect();
        // Pick the waypoint farthest from the approaching pointer
        let bestIdx = (idx + 1) % waypoints.length;
        let bestDist = -1;
        waypoints.forEach((wp, candidateIdx) => {
          if (candidateIdx === idx % waypoints.length) return;
          const candidateClamped = clampPos(wp.x, wp.y);
          const wx = ar.left + (candidateClamped.x / 100) * ar.width + r.width / 2;
          const wy = ar.top + (candidateClamped.y / 100) * ar.height + r.height / 2;
          const d = Math.hypot(e.clientX - wx, e.clientY - wy);
          if (d > bestDist) {
            bestDist = d;
            bestIdx = candidateIdx;
          }
        });

        travelingRef.current = true;
        dodgeCooldownRef.current = true;
        setTravelSec(0.22);
        setNudge(enforcePixelInset(0, 0));
        onIdxChange(() => bestIdx);

        // Travel finishes first (220ms), leaving a crisp recovery window before cooldown expires
        timers.schedule(
          "dodge-travel",
          () => {
            travelingRef.current = false;
          },
          210,
        );
        timers.schedule(
          "dodge-cooldown",
          () => {
            dodgeCooldownRef.current = false;
          },
          dodgeCooldownMs + 210,
        );
      }
    };

    arena.addEventListener("pointermove", onMove);
    return () => {
      arena.removeEventListener("pointermove", onMove);
    };
  }, [
    arenaRef,
    clampPos,
    disabled,
    dodgeCooldownMs,
    dodgeRadiusPx,
    enforcePixelInset,
    idx,
    onIdxChange,
    timers,
    waypoints,
  ]);

  const fire = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (disabled) return;
    // Brief post-catch cooldown so the next waypoint settles cleanly
    dodgeCooldownRef.current = true;
    timers.schedule(
      "post-catch-cooldown",
      () => {
        dodgeCooldownRef.current = false;
      },
      320,
    );
    onCatch();
  };

  return (
    <button
      ref={targetRef}
      type="button"
      disabled={disabled}
      onPointerDown={fire}
      data-chase-edge-inset={edgeInsetPx}
      style={{
        position: "absolute",
        left: `${clamped.x}%`,
        top: `${clamped.y}%`,
        padding: hitPad,
        margin: -hitPad,
        transform: `translate3d(${nudge.x}px, ${nudge.y}px, 0)`,
        transition: `left ${travelSec}s cubic-bezier(0.2, 0.9, 0.25, 1), top ${travelSec}s cubic-bezier(0.2, 0.9, 0.25, 1), transform 0.14s ease-out`,
        touchAction: "manipulation",
        background: "transparent",
      }}
      className="group cursor-pointer select-none focus:outline-none"
    >
      {children}
    </button>
  );
}
