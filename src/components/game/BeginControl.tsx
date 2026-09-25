"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

type Burst = { id: number; x: number; y: number };

/**
 * Premium game start control — layered chassis, edge light, proximity reaction,
 * physical click, particle burst, and nearby-system wake. Not a styled HTML pill.
 */
export function BeginControl({
  onBegin,
  onHoverChange,
}: {
  onBegin: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [near, setNear] = useState(false);
  const [hoverMs, setHoverMs] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [armed, setArmed] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);

  const prox = useMotionValue(0);
  const proxSpring = useSpring(prox, { stiffness: 160, damping: 22 });

  useEffect(() => {
    if (!hovering) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const ms = performance.now() - start;
      setHoverMs(ms);
      onHoverChange(true, ms);
    }, 120);
    return () => clearInterval(id);
  }, [hovering, onHoverChange]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = Math.max(r.width, r.height) * 1.35;
      const t = Math.max(0, 1 - dist / radius);
      prox.set(t);
      setNear(t > 0.28);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [prox]);

  const setHover = (next: boolean) => {
    setHovering(next);
    if (!next) {
      setHoverMs(0);
      onHoverChange(false, 0);
    }
  };

  const fireBurst = () => {
    const id = ++burstId.current;
    setBursts((b) => [...b, { id, x: 0, y: 0 }]);
    window.setTimeout(() => {
      setBursts((b) => b.filter((p) => p.id !== id));
    }, 900);
  };

  const engage = () => {
    setPressed(true);
    setArmed(true);
    fireBurst();
    audio.play("begin", 0.7);
    window.setTimeout(() => onBegin(), 180);
  };

  const heat = hovering ? 1 : near ? 0.55 : 0;

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center gap-4">
      {/* Facility rails / power wake — reacts to proximity before hover */}
      <motion.div
        className="pointer-events-none absolute -inset-x-24 -top-14 h-10"
        style={{ opacity: proxSpring }}
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
        <div className="absolute inset-x-16 top-3 h-px bg-gradient-to-r from-transparent via-assistant/50 to-transparent" />
        <div className="light-sweep absolute inset-y-0 left-0 w-1/3 animate-[sweep_1.6s_linear_infinite]" />
      </motion.div>

      <motion.button
        type="button"
        className="relative isolate overflow-visible px-14 py-5 text-lg tracking-[0.3em] text-white outline-none"
        style={{
          fontFamily: "var(--font-display)",
          minWidth: 300,
          borderRadius: 6,
          clipPath:
            "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)",
        }}
        onHoverStart={() => {
          setHover(true);
          audio.play("hover", 0.35);
        }}
        onHoverEnd={() => setHover(false)}
        onTapStart={() => setPressed(true)}
        onTapCancel={() => setPressed(false)}
        onClick={engage}
        animate={{
          scale: pressed ? 0.97 : hovering ? 1.035 : near ? 1.015 : 1,
          y: pressed ? 3 : 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
      >
        {/* Chassis layers */}
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #2a4a66 0%, #122538 42%, #071018 100%)",
            clipPath: "inherit",
          }}
        />
        <span
          className="absolute inset-[2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.12), transparent 35%, rgba(0,0,0,0.35))",
            clipPath: "inherit",
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            boxShadow: hovering
              ? "0 0 0 1px rgba(110,231,255,0.85), 0 0 48px rgba(110,231,255,0.4), inset 0 1px 0 rgba(255,255,255,0.28)"
              : near
                ? "0 0 0 1px rgba(110,231,255,0.55), 0 0 32px rgba(110,231,255,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
                : "0 0 0 1px rgba(110,231,255,0.32), 0 0 20px rgba(110,231,255,0.14), inset 0 1px 0 rgba(255,255,255,0.16)",
            clipPath: "inherit",
          }}
        />

        {/* Animated edge light */}
        <motion.span
          className="pointer-events-none absolute inset-[-3px]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #6ee7ff 50deg, transparent 110deg, transparent 180deg, #9ef2ff 230deg, transparent 290deg)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: 3,
            opacity: 0.35 + heat * 0.55,
            clipPath: "inherit",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: hovering ? 2.2 : near ? 4 : 7, repeat: Infinity, ease: "linear" }}
        />

        {hovering || near ? (
          <motion.span
            className="pointer-events-none absolute inset-[-12px] border border-cyan/25"
            style={{ clipPath: "inherit" }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: [0.45, 0], scale: [1, 1.14] }}
            transition={{ duration: 1.35, repeat: Infinity }}
          />
        ) : null}

        <span className="relative z-10 drop-shadow-[0_0_12px_rgba(110,231,255,0.35)]">
          BEGIN ASSESSMENT
        </span>

        {(hovering || near) && (
          <motion.span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(158,242,255,0.2),transparent_62%)]"
            style={{ clipPath: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: heat }}
          />
        )}

        {/* Corner bolts */}
        {[
          "left-2 top-2",
          "right-2 top-2",
          "left-2 bottom-2",
          "right-2 bottom-2",
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute h-1.5 w-1.5 rounded-[1px] bg-cyan/50 ${pos}`}
            style={{
              boxShadow: near || hovering ? "0 0 6px rgba(110,231,255,0.7)" : undefined,
            }}
          />
        ))}
      </motion.button>

      {/* Click energy burst */}
      {bursts.map((b) => (
        <motion.div
          key={b.id}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20"
          initial={{ opacity: 1, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <span className="absolute -left-8 -top-8 h-16 w-16 rounded-full border border-cyan/60" />
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-assistant/40 blur-[2px]" />
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute left-0 top-0 h-1 w-1 rounded-full bg-cyan"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 56,
                y: Math.sin((i / 8) * Math.PI * 2) * 40,
                opacity: 0,
              }}
              transition={{ duration: 0.7 }}
            />
          ))}
        </motion.div>
      ))}

      {/* Nearby systems power-up strip */}
      <motion.div
        className="pointer-events-none flex items-center gap-2 font-mono text-[9px] tracking-[0.28em]"
        animate={{
          opacity: armed ? 1 : hovering ? 0.95 : near ? 0.7 : 0.35,
          color: armed ? "#9ef2ff" : "#6ee7ff",
        }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: armed || hovering || near ? "#6ee7ff" : "#3aa9c4",
            boxShadow: armed || hovering || near ? "0 0 8px #6ee7ff" : undefined,
          }}
        />
        {armed
          ? "FACILITY POWERING ASSESSMENT BAY"
          : hoverMs > 4500
            ? "COMMITMENT ISSUES DETECTED"
            : hovering
              ? "HUMAN APPEARS INTERESTED"
              : near
                ? "PROXIMITY LOCK WARMING"
                : "AWAITING COMMITMENT"}
      </motion.div>
    </div>
  );
}
