"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function FacilityBackground({
  intensity = 1,
  systemLock = false,
}: {
  intensity?: number;
  systemLock?: boolean;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const farX = useTransform(sx, (v) => v * -8);
  const midX = useTransform(sx, (v) => v * -18);
  const midY = useTransform(sy, (v) => v * -10);
  const nearX = useTransform(sx, (v) => v * -28);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Far */}
      <motion.div className="absolute inset-0" style={{ x: farX }}>
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#0a1220] via-[#0b1524]/80 to-transparent" />
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-[18%] w-[7%] rounded-t-md bg-gradient-to-t from-[#152033] to-[#2a3d5c]/70"
            style={{
              left: `${8 + i * 12}%`,
              height: `${28 + ((i * 17) % 33)}%`,
              opacity: 0.55 + (i % 3) * 0.1,
              boxShadow: "inset 0 0 20px rgba(110,231,255,0.08)",
            }}
          >
            <motion.div
              className="absolute inset-x-2 top-4 h-1 rounded bg-cyan/40"
              animate={{ opacity: systemLock ? 1 : [0.2, 0.9, 0.2] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
            />
            <div className="absolute inset-x-3 bottom-6 space-y-1">
              {[...Array(4)].map((__, r) => (
                <div key={r} className="h-px bg-white/10" />
              ))}
            </div>
          </div>
        ))}
        {/* moving platforms */}
        <motion.div
          className="absolute top-[34%] h-2 w-28 rounded-full bg-cyan/20"
          animate={{ x: ["-10%", "110%"] }}
          transition={{ duration: 28 / intensity, repeat: Infinity, ease: "linear" }}
          style={{ left: 0 }}
        />
        <motion.div
          className="absolute top-[48%] h-1.5 w-20 rounded-full bg-white/15"
          animate={{ x: ["110%", "-20%"] }}
          transition={{ duration: 36 / intensity, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Mid architecture */}
      <motion.div className="absolute inset-0" style={{ x: midX, y: midY }}>
        <div className="absolute left-[6%] top-[22%] h-44 w-28 border border-white/10 bg-white/5 backdrop-blur-[2px]">
          <div className="m-2 h-full border border-cyan/20 bg-[#0a1524]/70 p-2 font-mono text-[9px] tracking-widest text-cyan/70">
            <div>CHAMBER 07</div>
            <motion.div
              className="mt-3 text-system-warn"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              EVERYTHING IS FINE
            </motion.div>
            <div className="mt-auto pt-16 text-mist/60">QUEUE: 0</div>
          </div>
        </div>

        <div className="absolute right-[8%] top-[28%] h-36 w-40 border border-white/10 bg-gradient-to-b from-white/10 to-transparent">
          <motion.div
            className="absolute inset-3 border border-dashed border-white/20"
            animate={{ rotate: systemLock ? 0 : [0, 1.5, -1.5, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="absolute inset-x-4 bottom-4 h-8 bg-cyan/10" />
        </div>

        {/* rails */}
        <div className="absolute left-0 right-0 top-[62%] h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
        <div className="absolute left-0 right-0 top-[68%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </motion.div>

      {/* Foreground glass / dust */}
      <motion.div className="absolute inset-0" style={{ x: nearX }}>
        {[...Array(18)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/40"
            style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 90}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.55, 0.1] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <div className="absolute inset-x-[10%] top-[12%] h-24 rounded-[40%] bg-cyan/5 blur-3xl" />
      </motion.div>

      {/* volumetric light shafts */}
      <div className="absolute left-[20%] top-0 h-full w-24 rotate-6 bg-gradient-to-b from-cyan/10 via-transparent to-transparent blur-2xl" />
      <div className="absolute right-[28%] top-0 h-full w-16 -rotate-3 bg-gradient-to-b from-white/8 via-transparent to-transparent blur-2xl" />
    </div>
  );
}
