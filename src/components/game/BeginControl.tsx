"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

export function BeginControl({
  onBegin,
  onHoverChange,
}: {
  onBegin: () => void;
  onHoverChange: (hovering: boolean, ms: number) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const [hoverMs, setHoverMs] = useState(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!hovering) {
      setHoverMs(0);
      onHoverChange(false, 0);
      return;
    }
    const start = performance.now();
    const id = window.setInterval(() => {
      const ms = performance.now() - start;
      setHoverMs(ms);
      onHoverChange(true, ms);
    }, 120);
    return () => clearInterval(id);
  }, [hovering, onHoverChange]);

  return (
    <div className="relative flex flex-col items-center gap-3">
      <motion.button
        type="button"
        className="relative isolate overflow-hidden rounded-full px-12 py-5 text-lg tracking-[0.28em] text-white outline-none"
        style={{ fontFamily: "var(--font-display)", minWidth: 280 }}
        onHoverStart={() => {
          setHovering(true);
          audio.play("hover", 0.35);
        }}
        onHoverEnd={() => setHovering(false)}
        onTapStart={() => setPressed(true)}
        onTapCancel={() => setPressed(false)}
        onClick={() => {
          setPressed(true);
          audio.play("begin", 0.7);
          onBegin();
        }}
        animate={{
          scale: pressed ? 0.96 : hovering ? 1.03 : 1,
          y: pressed ? 2 : 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1d3a52] via-[#0d1a28] to-[#071018]" />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: hovering
              ? "0 0 0 1px rgba(110,231,255,0.7), 0 0 40px rgba(110,231,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)"
              : "0 0 0 1px rgba(110,231,255,0.35), 0 0 24px rgba(110,231,255,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        />
        <motion.span
          className="absolute inset-[-2px] rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #6ee7ff 60deg, transparent 120deg, transparent 180deg, #9ef2ff 240deg, transparent 300deg)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: 2,
            opacity: 0.85,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: hovering ? 2.5 : 6, repeat: Infinity, ease: "linear" }}
        />
        <span className="relative z-10">BEGIN ASSESSMENT</span>
        {hovering ? (
          <motion.span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(158,242,255,0.22),transparent_60%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        ) : null}
      </motion.button>

      <motion.div
        className="font-mono text-[10px] tracking-[0.24em] text-cyan/80"
        animate={{ opacity: hovering ? 1 : 0.35 }}
      >
        {hoverMs > 4500
          ? "COMMITMENT ISSUES DETECTED"
          : hovering
            ? "HUMAN APPEARS INTERESTED"
            : "AWAITING COMMITMENT"}
      </motion.div>
    </div>
  );
}
