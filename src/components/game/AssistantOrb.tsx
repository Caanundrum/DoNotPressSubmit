"use client";

import { motion } from "framer-motion";
import type { OrbMood } from "@/lib/types";

const MOOD = {
  neutral: {
    core: "#9ef2ff",
    ring: "rgba(110,231,255,0.55)",
    speed: 12,
    scale: 1,
    jitter: 0,
  },
  listening: {
    core: "#b8f7ff",
    ring: "rgba(150,240,255,0.75)",
    speed: 7,
    scale: 1.06,
    jitter: 0,
  },
  amused: {
    core: "#7dffd2",
    ring: "rgba(120,255,210,0.7)",
    speed: 5,
    scale: 1.08,
    jitter: 2,
  },
  nervous: {
    core: "#ffd27a",
    ring: "rgba(255,180,80,0.65)",
    speed: 3.2,
    scale: 0.94,
    jitter: 5,
  },
  thinking: {
    core: "#8ec8ff",
    ring: "rgba(140,190,255,0.6)",
    speed: 9,
    scale: 1.02,
    jitter: 1,
  },
} as const;

export function AssistantOrb({
  mood,
  size = 140,
  label,
}: {
  mood: OrbMood;
  size?: number;
  label?: string;
}) {
  const m = MOOD[mood];

  return (
    <div className="relative flex flex-col items-center gap-3" style={{ width: size }}>
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={{
          y: [0, -6, 0],
          x: m.jitter ? [0, m.jitter, -m.jitter, 0] : 0,
          scale: m.scale,
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.45 },
        }}
      >
        <motion.div
          className="absolute inset-[-18%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${m.core}33 0%, transparent 65%)`,
            filter: "blur(8px)",
          }}
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-[8%] rounded-full border"
          style={{ borderColor: m.ring }}
          animate={{ rotate: 360 }}
          transition={{ duration: m.speed, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan" />
          <div className="absolute bottom-[18%] right-[8%] h-1.5 w-1.5 rounded-full bg-white/70" />
        </motion.div>

        <motion.div
          className="absolute inset-[18%] rounded-full border border-dashed border-white/25"
          animate={{ rotate: -360 }}
          transition={{ duration: m.speed * 1.4, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-[28%] rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${m.core} 35%, ${m.core}55 70%, transparent 100%)`,
            boxShadow: `0 0 30px ${m.core}88, inset 0 0 20px rgba(255,255,255,0.35)`,
          }}
          animate={{
            filter:
              mood === "nervous"
                ? ["brightness(1)", "brightness(1.35)", "brightness(0.85)", "brightness(1)"]
                : "brightness(1)",
          }}
          transition={{ duration: mood === "nervous" ? 0.55 : 0.4, repeat: Infinity }}
        />

        {/* shard accents */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <motion.div
            key={deg}
            className="absolute left-1/2 top-1/2 h-4 w-[2px] origin-bottom rounded-full bg-white/50"
            style={{ transform: `rotate(${deg}deg) translateY(-${size * 0.42}px)` }}
            animate={{ opacity: mood === "amused" ? [0.2, 1, 0.2] : [0.35, 0.7, 0.35] }}
            transition={{ duration: 2 + deg / 180, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {label ? (
        <div className="max-w-[220px] text-center font-mono text-[10px] tracking-[0.18em] text-[#c5d3e4]">
          {label}
        </div>
      ) : null}
    </div>
  );
}
