"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
 * Visual chrome is always clamped fully inside the interaction frame
 * with at least `edgeInsetPx` clearance on every edge (Consent ≥12px).
 */
export function FairChaseTarget({
  children,
  className,
  style,
  hits,
  maxHits,
  onHit,
  arenaPadding = 14,
  edgeInsetPx = 12,
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
  /** Minimum chrome-to-edge gap in px (Consent must stay ≥12px inside). */
  edgeInsetPx?: number;
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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const halfPctRef = useRef({ x: 8, y: 10 });
  const edgePctRef = useRef({ x: 4, y: 4 });
  const posRef = useRef(pos);
  const travelingRef = useRef(false);
  const travelTimer = useRef<number | null>(null);
  const enforceRef = useRef<() => void>(() => {});

  useEffect(() => {
    hoverRef.current = hovering;
  }, [hovering]);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(
    () => () => {
      if (travelTimer.current != null) window.clearTimeout(travelTimer.current);
    },
    [],
  );

  const measureHalfPct = useCallback(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!wrap || !btn || !parent) return halfPctRef.current;
    const pr = parent.getBoundingClientRect();
    if (pr.width <= 0 || pr.height <= 0) return halfPctRef.current;
    // Layout box (not scaled transform) — scale is applied after clamp.
    const paintedW = Math.max(24, btn.offsetWidth);
    const paintedH = Math.max(24, btn.offsetHeight);
    const next = {
      x: (paintedW / 2 / pr.width) * 100,
      y: (paintedH / 2 / pr.height) * 100,
    };
    edgePctRef.current = {
      x: (edgeInsetPx / pr.width) * 100,
      y: (edgeInsetPx / pr.height) * 100,
    };
    halfPctRef.current = next;
    return next;
  }, [edgeInsetPx]);

  const clampPos = useCallback(
    (raw: Pos): Pos => {
      const half = measureHalfPct();
      const edge = edgePctRef.current;
      const padX = Math.max(arenaPadding, half.x + edge.x);
      const padY = Math.max(arenaPadding, half.y + edge.y);
      return {
        x: Math.min(100 - padX, Math.max(padX, raw.x)),
        y: Math.min(100 - padY, Math.max(padY, raw.y)),
      };
    },
    [arenaPadding, measureHalfPct],
  );

  const enforcePixelInset = useCallback(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!wrap || !btn || !parent) return;
    const pr = parent.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    if (pr.width <= 0 || pr.height <= 0 || br.width <= 0) return;

    let dx = 0;
    let dy = 0;
    const leftGap = br.left - pr.left;
    const rightGap = pr.right - br.right;
    const topGap = br.top - pr.top;
    const bottomGap = pr.bottom - br.bottom;
    if (leftGap < edgeInsetPx) dx += edgeInsetPx - leftGap;
    if (rightGap < edgeInsetPx) dx -= edgeInsetPx - rightGap;
    if (topGap < edgeInsetPx) dy += edgeInsetPx - topGap;
    if (bottomGap < edgeInsetPx) dy -= edgeInsetPx - bottomGap;
    if (dx === 0 && dy === 0) return;

    setPos((p) =>
      clampPos({
        x: p.x + (dx / pr.width) * 100,
        y: p.y + (dy / pr.height) * 100,
      }),
    );
    setMagnet({ x: 0, y: 0 });
  }, [clampPos, edgeInsetPx]);

  useEffect(() => {
    enforceRef.current = enforcePixelInset;
  }, [enforcePixelInset]);

  const beginTravel = useCallback((sec: number) => {
    travelingRef.current = true;
    setMagnet({ x: 0, y: 0 });
    if (travelTimer.current != null) window.clearTimeout(travelTimer.current);
    travelTimer.current = window.setTimeout(() => {
      travelingRef.current = false;
      enforceRef.current();
    }, Math.max(80, sec * 1000 + 60));
  }, []);

  const clampMagnet = useCallback(
    (mag: { x: number; y: number }) => {
      // Constrain against the LIVE painted box, not the destination pos —
      // destination-based magnet overshoots mid-animation after a catch.
      const wrap = wrapRef.current;
      const btn = btnRef.current;
      const parent = wrap?.offsetParent as HTMLElement | null;
      if (!wrap || !btn || !parent) return { x: 0, y: 0 };
      const pr = parent.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      if (pr.width <= 0 || pr.height <= 0) return { x: 0, y: 0 };
      const maxX = Math.max(0, pr.right - edgeInsetPx - br.right);
      const minX = Math.min(0, pr.left + edgeInsetPx - br.left);
      const maxY = Math.max(0, pr.bottom - edgeInsetPx - br.bottom);
      const minY = Math.min(0, pr.top + edgeInsetPx - br.top);
      return {
        x: Math.min(maxX, Math.max(minX, mag.x)),
        y: Math.min(maxY, Math.max(minY, mag.y)),
      };
    },
    [edgeInsetPx],
  );

  const nextWaypoint = useCallback(() => {
    const half = measureHalfPct();
    const edge = edgePctRef.current;
    const padX = Math.max(arenaPadding, half.x + edge.x);
    const padY = Math.max(arenaPadding, half.y + edge.y);
    const spanX = Math.max(8, 100 - padX * 2);
    const spanY = Math.max(8, 100 - padY * 2);
    const step = (hits % 4) + 1;
    const travel = moveMs / 1000;
    beginTravel(travel);
    setPos(
      clampPos({
        x: padX + ((step * 17 + hits * 11) % spanX),
        y: padY + ((step * 23 + hits * 13) % spanY),
      }),
    );
  }, [arenaPadding, beginTravel, clampPos, hits, measureHalfPct, moveMs]);

  useLayoutEffect(() => {
    measureHalfPct();
    setPos((p) => clampPos(p));
  }, [clampPos, hits, measureHalfPct]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      enforcePixelInset();
      window.setTimeout(enforcePixelInset, 40);
      window.setTimeout(enforcePixelInset, 200);
    });
    return () => window.cancelAnimationFrame(id);
  }, [hits, pos, magnet, enforcePixelInset]);

  useEffect(() => {
    if (done || hovering) return;
    const interval = near ? Math.max(1100, moveMs + 400 + hits * 60) : Math.max(900, moveMs + hits * 100);
    const t = window.setInterval(() => {
      if (hoverRef.current || travelingRef.current) return;
      nextWaypoint();
    }, interval);
    return () => window.clearInterval(t);
  }, [done, hovering, near, hits, moveMs, nextWaypoint]);

  useEffect(() => {
    if (done) return;
    const onMove = (e: PointerEvent) => {
      const btn = btnRef.current;
      if (!btn || hoverRef.current || travelingRef.current) {
        if (!hoverRef.current) setNear(false);
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
          clampMagnet({
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
  }, [clampMagnet, done]);

  const handleHit = () => {
    if (done) return;
    onHit();
    // Post-catch: short snap travel with magnet locked — no mid-flight clip.
    const travel = 0.35;
    window.setTimeout(() => {
      const half = measureHalfPct();
      const edge = edgePctRef.current;
      const padX = Math.max(arenaPadding, half.x + edge.x);
      const padY = Math.max(arenaPadding, half.y + edge.y);
      const spanX = Math.max(8, 100 - padX * 2);
      const spanY = Math.max(8, 100 - padY * 2);
      const step = ((hits + 1) % 4) + 1;
      beginTravel(travel);
      setPos(
        clampPos({
          x: padX + ((step * 17 + (hits + 1) * 11) % spanX),
          y: padY + ((step * 23 + (hits + 1) * 13) % spanY),
        }),
      );
      window.requestAnimationFrame(() => enforcePixelInset());
    }, 0);
  };

  const travelSec = travelingRef.current
    ? 0.35
    : hovering
      ? 0.45
      : near
        ? (moveMs / 1000) * 1.65
        : moveMs / 1000;

  return (
    <motion.div
      ref={wrapRef}
      className="absolute"
      style={{ margin: 0, padding: 0 }}
      data-chase-edge-inset={edgeInsetPx}
      animate={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        x: `calc(-50% + ${magnet.x}px)`,
        y: `calc(-50% + ${magnet.y}px)`,
        // No scale while traveling — scale inflated the box past the clamp.
        scale: done ? 0.92 : travelingRef.current ? 1 : hovering ? 1.04 : near ? 1.02 : 1,
      }}
      transition={{
        left: { duration: travelSec, ease: "easeInOut" },
        top: { duration: travelSec, ease: "easeInOut" },
        x: { duration: hovering ? 0.2 : 0.2, ease: "easeOut" },
        y: { duration: hovering ? 0.2 : 0.2, ease: "easeOut" },
        scale: { duration: 0.14 },
      }}
      onAnimationComplete={() => enforcePixelInset()}
    >
      <button
        ref={btnRef}
        type="button"
        className={className}
        style={{
          padding: hitPad,
          boxSizing: "content-box",
          ...style,
        }}
        onMouseEnter={() => {
          if (travelingRef.current) return;
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
              window.requestAnimationFrame(() => enforcePixelInset());
            }
          }
        }}
        onMouseLeave={() => {
          setHovering(false);
          setMagnet({ x: 0, y: 0 });
          window.requestAnimationFrame(() => enforcePixelInset());
        }}
        onPointerMove={(e) => {
          if (done || travelingRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * 0.22;
          const dy = (e.clientY - cy) * 0.22;
          setMagnet(
            clampMagnet({
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
