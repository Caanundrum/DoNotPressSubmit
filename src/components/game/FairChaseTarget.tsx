"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Pos = { x: number; y: number };

/**
 * Mischievous moving control that stays mouse-fair:
 * smooth patterned motion (never teleports), padded hitbox,
 * hover freeze + near-pointer slowdown, light magnetism.
 */
export function FairChaseTarget({
  children,
  className,
  style,
  hits,
  maxHits,
  onHit,
  arenaPadding = 10,
  moveMs = 1400,
  hitPad = 22,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hits: number;
  maxHits: number;
  onHit: () => void;
  /** Keep target inset from arena edges (percent). */
  arenaPadding?: number;
  /** Base travel duration between waypoints (slower = fairer). */
  moveMs?: number;
  /** Invisible padding around the visual (px) for a larger hit region. */
  hitPad?: number;
}) {
  const [pos, setPos] = useState<Pos>({ x: 42, y: 48 });
  const [hovering, setHovering] = useState(false);
  const [near, setNear] = useState(false);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const done = hits >= maxHits;
  const hoverRef = useRef(false);
  const nearRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    hoverRef.current = hovering;
  }, [hovering]);

  useEffect(() => {
    nearRef.current = near;
  }, [near]);

  const nextWaypoint = useCallback(() => {
    const pad = arenaPadding;
    const span = 100 - pad * 2;
    // Patterned zigzag rather than pure random teleport chaos.
    const step = (hits % 4) + 1;
    setPos({
      x: pad + ((step * 17 + hits * 11) % span),
      y: pad + 12 + ((step * 23 + hits * 13) % Math.max(18, span - 20)),
    });
  }, [arenaPadding, hits]);

  // Ambient roam — pauses fully on hover; slows when pointer is near.
  useEffect(() => {
    if (done || hovering) return;
    const interval = near ? Math.max(1100, moveMs + 400 + hits * 60) : Math.max(900, moveMs + hits * 100);
    const t = window.setInterval(() => {
      if (hoverRef.current) return;
      nextWaypoint();
    }, interval);
    return () => window.clearInterval(t);
  }, [done, hovering, near, hits, moveMs, nextWaypoint]);

  // Arena-level proximity: soften motion before the cursor even lands on the control.
  useEffect(() => {
    if (done) return;
    const onMove = (e: PointerEvent) => {
      const el = btnRef.current;
      if (!el || hoverRef.current) {
        setNear(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      // Soft catch radius ~ half a thumb; pulls + slows before contact.
      setNear(dist < 96);
      if (dist < 96 && dist > 0) {
        const pull = Math.max(0, 1 - dist / 96) * 14;
        const dx = ((e.clientX - cx) / dist) * pull;
        const dy = ((e.clientY - cy) / dist) * pull;
        setMagnet({
          x: Math.max(-14, Math.min(14, dx)),
          y: Math.max(-12, Math.min(12, dy)),
        });
      } else if (!hoverRef.current) {
        setMagnet({ x: 0, y: 0 });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [done]);

  const handleHit = () => {
    if (done) return;
    onHit();
    // Queue patterned flee after parent increments hits — still smooth-animated.
    window.setTimeout(() => {
      const pad = arenaPadding;
      const span = 100 - pad * 2;
      const step = ((hits + 1) % 4) + 1;
      setPos({
        x: pad + ((step * 17 + (hits + 1) * 11) % span),
        y: pad + 12 + ((step * 23 + (hits + 1) * 13) % Math.max(18, span - 20)),
      });
    }, 0);
  };

  // Hover freezes travel; near slows; otherwise ease between waypoints.
  const travelSec = hovering
    ? 0.45
    : near
      ? (moveMs / 1000) * 1.65
      : moveMs / 1000;

  return (
    <motion.button
      ref={btnRef}
      type="button"
      className={className}
      style={{
        padding: hitPad,
        margin: -hitPad,
        // Expand the interactive box without growing the painted chrome.
        boxSizing: "content-box",
        ...style,
      }}
      animate={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        x: magnet.x,
        y: magnet.y,
        scale: done ? 0.92 : hovering ? 1.06 : near ? 1.03 : 1,
      }}
      transition={{
        left: { duration: travelSec, ease: "easeInOut" },
        top: { duration: travelSec, ease: "easeInOut" },
        x: { duration: hovering ? 0.2 : 0.28, ease: "easeOut" },
        y: { duration: hovering ? 0.2 : 0.28, ease: "easeOut" },
        scale: { duration: 0.16 },
      }}
      onHoverStart={() => {
        setHovering(true);
        setNear(true);
        setMagnet({ x: 0, y: 0 });
        // Freeze mid-flight: pin to the visual position under the cursor.
        const el = btnRef.current;
        const parent = el?.offsetParent as HTMLElement | null;
        if (el && parent) {
          const er = el.getBoundingClientRect();
          const pr = parent.getBoundingClientRect();
          if (pr.width > 0 && pr.height > 0) {
            setPos({
              x: ((er.left + er.width / 2 - pr.left) / pr.width) * 100,
              y: ((er.top + er.height / 2 - pr.top) / pr.height) * 100,
            });
          }
        }
      }}
      onHoverEnd={() => {
        setHovering(false);
        setMagnet({ x: 0, y: 0 });
      }}
      onPointerMove={(e) => {
        if (done) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // Stronger on-target magnetism so a normal mouse finishes the click.
        const dx = (e.clientX - cx) * 0.22;
        const dy = (e.clientY - cy) * 0.22;
        setMagnet({
          x: Math.max(-12, Math.min(12, dx)),
          y: Math.max(-10, Math.min(10, dy)),
        });
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleHit();
      }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </motion.button>
  );
}
