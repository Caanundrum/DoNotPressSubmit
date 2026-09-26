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
 * Visual chrome is always clamped fully inside the interaction frame.
 */
export function FairChaseTarget({
  children,
  className,
  style,
  hits,
  maxHits,
  onHit,
  arenaPadding = 14,
  moveMs = 1400,
  hitPad = 22,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hits: number;
  maxHits: number;
  onHit: () => void;
  /** Keep target inset from arena edges (percent of arena). */
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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const halfPctRef = useRef({ x: 8, y: 10 });

  useEffect(() => {
    hoverRef.current = hovering;
  }, [hovering]);

  useEffect(() => {
    nearRef.current = near;
  }, [near]);

  const measureHalfPct = useCallback(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!wrap || !btn || !parent) return halfPctRef.current;
    const pr = parent.getBoundingClientRect();
    if (pr.width <= 0 || pr.height <= 0) return halfPctRef.current;
    // Painted chrome size (button content box), not the expanded hit pad.
    const paintedW = Math.max(24, btn.offsetWidth);
    const paintedH = Math.max(24, btn.offsetHeight);
    const next = {
      x: (paintedW / 2 / pr.width) * 100,
      y: (paintedH / 2 / pr.height) * 100,
    };
    halfPctRef.current = next;
    return next;
  }, []);

  const clampPos = useCallback(
    (raw: Pos): Pos => {
      const half = measureHalfPct();
      const padX = Math.max(arenaPadding, half.x + 1);
      const padY = Math.max(arenaPadding, half.y + 1);
      return {
        x: Math.min(100 - padX, Math.max(padX, raw.x)),
        y: Math.min(100 - padY, Math.max(padY, raw.y)),
      };
    },
    [arenaPadding, measureHalfPct],
  );

  const clampMagnet = useCallback(
    (rawPos: Pos, mag: { x: number; y: number }) => {
      const wrap = wrapRef.current;
      const parent = wrap?.offsetParent as HTMLElement | null;
      if (!wrap || !parent) return mag;
      const pr = parent.getBoundingClientRect();
      if (pr.width <= 0 || pr.height <= 0) return mag;
      const half = measureHalfPct();
      const cx = (rawPos.x / 100) * pr.width;
      const cy = (rawPos.y / 100) * pr.height;
      const halfPxX = (half.x / 100) * pr.width;
      const halfPxY = (half.y / 100) * pr.height;
      const maxX = Math.max(0, pr.width - halfPxX - cx);
      const minX = Math.min(0, halfPxX - cx);
      const maxY = Math.max(0, pr.height - halfPxY - cy);
      const minY = Math.min(0, halfPxY - cy);
      return {
        x: Math.min(maxX, Math.max(minX, mag.x)),
        y: Math.min(maxY, Math.max(minY, mag.y)),
      };
    },
    [measureHalfPct],
  );

  const nextWaypoint = useCallback(() => {
    const half = measureHalfPct();
    const padX = Math.max(arenaPadding, half.x + 1);
    const padY = Math.max(arenaPadding, half.y + 1);
    const spanX = Math.max(8, 100 - padX * 2);
    const spanY = Math.max(8, 100 - padY * 2);
    const step = (hits % 4) + 1;
    setPos(
      clampPos({
        x: padX + ((step * 17 + hits * 11) % spanX),
        y: padY + ((step * 23 + hits * 13) % spanY),
      }),
    );
    setMagnet({ x: 0, y: 0 });
  }, [arenaPadding, clampPos, hits, measureHalfPct]);

  useEffect(() => {
    measureHalfPct();
    setPos((p) => clampPos(p));
  }, [clampPos, hits, measureHalfPct]);

  useEffect(() => {
    if (done || hovering) return;
    const interval = near ? Math.max(1100, moveMs + 400 + hits * 60) : Math.max(900, moveMs + hits * 100);
    const t = window.setInterval(() => {
      if (hoverRef.current) return;
      nextWaypoint();
    }, interval);
    return () => window.clearInterval(t);
  }, [done, hovering, near, hits, moveMs, nextWaypoint]);

  useEffect(() => {
    if (done) return;
    const onMove = (e: PointerEvent) => {
      const btn = btnRef.current;
      if (!btn || hoverRef.current) {
        setNear(false);
        return;
      }
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      setNear(dist < 96);
      if (dist < 96 && dist > 0) {
        const pull = Math.max(0, 1 - dist / 96) * 14;
        const dx = ((e.clientX - cx) / dist) * pull;
        const dy = ((e.clientY - cy) / dist) * pull;
        setMagnet(
          clampMagnet(pos, {
            x: Math.max(-14, Math.min(14, dx)),
            y: Math.max(-12, Math.min(12, dy)),
          }),
        );
      } else if (!hoverRef.current) {
        setMagnet({ x: 0, y: 0 });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [clampMagnet, done, pos]);

  const handleHit = () => {
    if (done) return;
    onHit();
    window.setTimeout(() => {
      const half = measureHalfPct();
      const padX = Math.max(arenaPadding, half.x + 1);
      const padY = Math.max(arenaPadding, half.y + 1);
      const spanX = Math.max(8, 100 - padX * 2);
      const spanY = Math.max(8, 100 - padY * 2);
      const step = ((hits + 1) % 4) + 1;
      setPos(
        clampPos({
          x: padX + ((step * 17 + (hits + 1) * 11) % spanX),
          y: padY + ((step * 23 + (hits + 1) * 13) % spanY),
        }),
      );
      setMagnet({ x: 0, y: 0 });
    }, 0);
  };

  const travelSec = hovering
    ? 0.45
    : near
      ? (moveMs / 1000) * 1.65
      : moveMs / 1000;

  return (
    <motion.div
      ref={wrapRef}
      className="absolute"
      style={{ margin: 0, padding: 0 }}
      animate={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        x: `calc(-50% + ${magnet.x}px)`,
        y: `calc(-50% + ${magnet.y}px)`,
        scale: done ? 0.92 : hovering ? 1.06 : near ? 1.03 : 1,
      }}
      transition={{
        left: { duration: travelSec, ease: "easeInOut" },
        top: { duration: travelSec, ease: "easeInOut" },
        x: { duration: hovering ? 0.2 : 0.28, ease: "easeOut" },
        y: { duration: hovering ? 0.2 : 0.28, ease: "easeOut" },
        scale: { duration: 0.16 },
      }}
    >
      <button
        ref={btnRef}
        type="button"
        className={className}
        style={{
          padding: hitPad,
          margin: -hitPad,
          boxSizing: "content-box",
          ...style,
        }}
        onMouseEnter={() => {
          setHovering(true);
          setNear(true);
          setMagnet({ x: 0, y: 0 });
          const wrap = wrapRef.current;
          const parent = wrap?.offsetParent as HTMLElement | null;
          const btn = btnRef.current;
          if (btn && parent) {
            const er = btn.getBoundingClientRect();
            const pr = parent.getBoundingClientRect();
            if (pr.width > 0 && pr.height > 0) {
              setPos(
                clampPos({
                  x: ((er.left + er.width / 2 - pr.left) / pr.width) * 100,
                  y: ((er.top + er.height / 2 - pr.top) / pr.height) * 100,
                }),
              );
            }
          }
        }}
        onMouseLeave={() => {
          setHovering(false);
          setMagnet({ x: 0, y: 0 });
        }}
        onPointerMove={(e) => {
          if (done) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * 0.22;
          const dy = (e.clientY - cy) * 0.22;
          setMagnet(
            clampMagnet(pos, {
              x: Math.max(-12, Math.min(12, dx)),
              y: Math.max(-10, Math.min(10, dy)),
            }),
          );
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleHit();
        }}
      >
        {children}
      </button>
    </motion.div>
  );
}
