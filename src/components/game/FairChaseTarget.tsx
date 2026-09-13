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
 * patterned (not teleporter) motion, padded hitbox, hover pause + light magnetism.
 */
export function FairChaseTarget({
  children,
  className,
  style,
  hits,
  maxHits,
  onHit,
  arenaPadding = 8,
  moveMs = 900,
  hitPad = 14,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hits: number;
  maxHits: number;
  onHit: () => void;
  /** Keep target inset from arena edges (percent). */
  arenaPadding?: number;
  /** Base travel duration between waypoints. */
  moveMs?: number;
  /** Invisible padding around the visual (px) for a larger hit region. */
  hitPad?: number;
}) {
  const [pos, setPos] = useState<Pos>({ x: 42, y: 48 });
  const [hovering, setHovering] = useState(false);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const done = hits >= maxHits;
  const hoverRef = useRef(false);

  useEffect(() => {
    hoverRef.current = hovering;
  }, [hovering]);

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

  useEffect(() => {
    if (done || hovering) return;
    const t = window.setInterval(() => {
      if (hoverRef.current) return;
      nextWaypoint();
    }, Math.max(700, moveMs + hits * 80));
    return () => window.clearInterval(t);
  }, [done, hovering, hits, moveMs, nextWaypoint]);

  // Move on hit via the click handler (not an effect) to avoid cascading renders.
  const handleHit = () => {
    if (done) return;
    onHit();
    // Queue patterned flee after parent increments hits.
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

  return (
    <motion.button
      type="button"
      className={className}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        padding: hitPad,
        margin: -hitPad,
        ...style,
      }}
      animate={{
        x: magnet.x,
        y: magnet.y,
        scale: done ? 0.92 : hovering ? 1.04 : 1,
      }}
      transition={{
        x: { duration: hovering ? 0.35 : moveMs / 1000, ease: "easeInOut" },
        y: { duration: hovering ? 0.35 : moveMs / 1000, ease: "easeInOut" },
        scale: { duration: 0.18 },
      }}
      onHoverStart={() => {
        setHovering(true);
        setMagnet({ x: 0, y: 0 });
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
        const dx = (e.clientX - cx) * 0.12;
        const dy = (e.clientY - cy) * 0.12;
        setMagnet({
          x: Math.max(-10, Math.min(10, dx)),
          y: Math.max(-8, Math.min(8, dy)),
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
