"use client";

import { motion } from "framer-motion";

/** Visual residue of chaos vs obedient paths (Act III+). Never blocks clicks. */
export function PathResidue({
  kind,
}: {
  kind: "chaos" | "obedient" | "neutral";
}) {
  if (kind === "neutral") return null;

  if (kind === "chaos") {
    return (
      <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 60% 40%, rgba(255,77,109,0.12), transparent 55%)",
            mixBlendMode: "screen",
          }}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 4.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,77,109,0.06) 3px, rgba(255,77,109,0.06) 4px)",
          }}
          animate={{ backgroundPositionY: ["0px", "8px"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-3 border border-danger/25" />
        <motion.div
          className="absolute right-[6%] top-[18%] rotate-[-8deg] font-mono text-[11px] tracking-[0.35em] text-danger/55"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          UNAUTHORIZED
        </motion.div>
      </div>
    );
  }

  // obedient
  return (
    <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 40% 30%, rgba(110,231,255,0.08), transparent 50%)",
        }}
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <div className="absolute inset-4 border border-cyan/20" />
      <div className="absolute left-[5%] top-[14%] font-mono text-[9px] tracking-[0.28em] text-cyan/45">
        COMPLIANT CHANNEL
      </div>
      <motion.div
        className="absolute bottom-[10%] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-cyan/35 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.8, repeat: Infinity }}
      />
    </div>
  );
}
