"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type GagId = "drone" | "coffee" | "printer";

export function BackgroundGags({ paused = false }: { paused?: boolean }) {
  const [active, setActive] = useState<GagId>("drone");

  useEffect(() => {
    if (paused) return;
    const order: GagId[] = ["drone", "coffee", "printer"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % order.length;
      setActive(order[i]);
    }, 9000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <AnimatePresence mode="wait">
        {active === "drone" && !paused ? <DroneGag key="drone" /> : null}
        {active === "coffee" && !paused ? <CoffeeGag key="coffee" /> : null}
        {active === "printer" && !paused ? <PrinterGag key="printer" /> : null}
      </AnimatePresence>

      {/* Always-on micro gag */}
      <motion.div
        className="absolute bottom-[22%] left-[46%] font-mono text-[9px] tracking-widest text-danger/80"
        animate={{ opacity: paused ? 0.2 : [0, 0, 1, 1, 0] }}
        transition={{ duration: 14, repeat: Infinity, times: [0, 0.72, 0.76, 0.9, 1] }}
      >
        DO NOT PRESS
      </motion.div>
    </div>
  );
}

function DroneGag() {
  return (
    <motion.div
      className="absolute left-[12%] top-[58%]"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative h-8 w-14 rounded-md border border-cyan/40 bg-[#132033]/90"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <div className="absolute -top-2 left-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute -top-2 right-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute inset-x-2 bottom-1 h-1 bg-white/20" />
      </motion.div>
      <motion.div
        className="ml-16 mt-[-28px] h-3 w-3 rounded-full"
        animate={{
          backgroundColor: ["#6ee7ff", "#ffb020", "#6ee7ff", "#ffb020", "#6ee7ff"],
          boxShadow: [
            "0 0 8px #6ee7ff",
            "0 0 8px #ffb020",
            "0 0 8px #6ee7ff",
            "0 0 8px #ffb020",
            "0 0 8px #6ee7ff",
          ],
        }}
        transition={{ duration: 4.5, times: [0, 0.2, 0.45, 0.7, 1], repeat: Infinity }}
      />
      <motion.div
        className="mt-2 font-mono text-[9px] tracking-widest text-mist/70"
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        REPLACEMENT FAILED
      </motion.div>
    </motion.div>
  );
}

function CoffeeGag() {
  return (
    <motion.div
      className="absolute right-[16%] top-[52%]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="flex items-end gap-3"
        animate={{ x: [0, 40, 80] }}
        transition={{ duration: 7, ease: "easeInOut" }}
      >
        <div className="h-10 w-2 rounded bg-metal/50" />
        <div className="relative h-7 w-6 rounded-b-md rounded-t-sm border border-white/30 bg-gradient-to-b from-[#5a3a24] to-[#2a180e]">
          <div className="absolute -right-2 top-1 h-4 w-2 rounded-r-full border border-white/30" />
        </div>
        <div className="h-10 w-2 rounded bg-metal/50" />
      </motion.div>
      <motion.div
        className="mt-2 max-w-[220px] border border-cyan/30 bg-black/50 px-2 py-1 font-mono text-[9px] tracking-wider text-cyan"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 6, times: [0, 0.2, 0.75, 1] }}
      >
        HUMAN PERFORMANCE ENHANCEMENT COMPOUND DETECTED
      </motion.div>
    </motion.div>
  );
}

function PrinterGag() {
  return (
    <motion.div
      className="absolute bottom-[12%] left-[58%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-12 w-20 border border-white/20 bg-[#182235]/90">
        <div className="m-1 h-2 bg-cyan/30" />
        <div className="mx-2 mt-2 h-1 bg-white/20" />
      </div>
      <motion.div
        className="ml-3 origin-top bg-white/90"
        style={{ width: 28 }}
        animate={{ height: [8, 120] }}
        transition={{ duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="mt-2 font-mono text-[9px] tracking-widest text-mist/70"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 3.5, duration: 2.5 }}
      >
        SCISSORS EN ROUTE
      </motion.div>
    </motion.div>
  );
}
