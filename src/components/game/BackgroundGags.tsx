"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

type GagId = "drone" | "coffee" | "printer";

const GAG_CLICK: Record<GagId, { id: string; line: string; secret?: string }> = {
  drone: {
    id: "replacement-failed",
    line: "Drone memo: REPLACEMENT FAILED. Also: dignity failed. Logged.",
    secret: "drone-memo",
  },
  coffee: {
    id: "coffee-mug",
    line: "Mug poked mid-transit. Caffeine reclassified as morale malware.",
    secret: "mug-scan",
  },
  printer: {
    id: "printer-scissors",
    line: "Printer blushed. SCISSORS EN ROUTE remains on schedule.",
    secret: "scissors-en-route",
  },
};

/** Departure toasts — distinct from click lines; still count as Ambient fiddling. */
const GAG_DEPART: Record<
  GagId,
  { touched: string; missed: string; id: string; secret?: string }
> = {
  drone: {
    id: "replacement-failed",
    secret: "drone-memo",
    touched: "Drone memo filed and left. REPLACEMENT FAILED still echoes.",
    missed:
      "REPLACEMENT FAILED scrolled off-frame. Dignity remained failed. Logged.",
  },
  coffee: {
    id: "coffee-mug",
    secret: "mug-scan",
    touched: "Mug left the frame mid-scan. Transit logged.",
    missed:
      "HUMAN PERFORMANCE mug departed. Facility pretends you didn't notice. Logged anyway.",
  },
  printer: {
    id: "printer-scissors",
    secret: "scissors-en-route",
    touched: "Printer exited stage left. Scissors still en route. Somewhere.",
    missed:
      "Paper trail left the frame. SCISSORS EN ROUTE memo persists. Logged.",
  },
};

export function BackgroundGags({
  paused = false,
  hoverLanguage = false,
  onAmbient,
}: {
  paused?: boolean;
  /** Soft hover copy on decorative gag frames (title + early acts) */
  hoverLanguage?: boolean;
  /** When set, gags are clickable eggs — not fake hover-only chrome */
  onAmbient?: (id: string, secret?: string) => void;
}) {
  const [active, setActive] = useState<GagId>("drone");
  const [tip, setTip] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const touched = useRef<Record<GagId, boolean>>({
    drone: false,
    coffee: false,
    printer: false,
  });
  const prevActive = useRef<GagId>("drone");
  const onAmbientRef = useRef(onAmbient);
  onAmbientRef.current = onAmbient;

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

  // P2: each rotating gag gets a dedicated departure ambient (toast + Ambient fiddling) —
  // never silent when it leaves the frame. Click already counted → toast only.
  useEffect(() => {
    const was = prevActive.current;
    prevActive.current = active;
    if (!onAmbientRef.current || paused) return;
    if (was === active) return;
    const depart = GAG_DEPART[was];
    const wasTouched = touched.current[was];
    setFlash(wasTouched ? depart.touched : depart.missed);
    if (!wasTouched) {
      onAmbientRef.current(depart.id, depart.secret);
    }
    touched.current[was] = false;
    window.setTimeout(() => setFlash(null), 2600);
  }, [active, paused]);

  const react = (gag: GagId) => {
    const meta = GAG_CLICK[gag];
    audio.play("click", 0.28);
    touched.current[gag] = true;
    setFlash(meta.line);
    onAmbient?.(meta.id, meta.secret);
    window.setTimeout(() => setFlash(null), 2200);
  };

  const live = !!onAmbient;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <AnimatePresence mode="wait">
        {active === "drone" && !paused ? (
          <DroneGag
            key="drone"
            interactive={live}
            onTip={setTip}
            onReact={() => react("drone")}
          />
        ) : null}
        {active === "coffee" && !paused ? (
          <CoffeeGag
            key="coffee"
            interactive={live}
            onTip={setTip}
            onReact={() => react("coffee")}
          />
        ) : null}
        {active === "printer" && !paused ? (
          <PrinterGag
            key="printer"
            interactive={live}
            onTip={setTip}
            onReact={() => react("printer")}
          />
        ) : null}
      </AnimatePresence>

      {/* Always-on micro gag — clickable when ambient live */}
      <motion.button
        type="button"
        className={`absolute bottom-[22%] left-[46%] font-mono text-[9px] tracking-widest text-danger/80 ${
          live
            ? "pointer-events-auto cursor-pointer border border-transparent px-1 hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
            : "pointer-events-none"
        }`}
        animate={{ opacity: paused ? 0.2 : [0, 0, 1, 1, 0] }}
        transition={{ duration: 14, repeat: Infinity, times: [0, 0.72, 0.76, 0.9, 1] }}
        onClick={
          live
            ? (e) => {
                e.stopPropagation();
                audio.play("click", 0.3);
                setFlash("You clicked DO NOT PRESS in the wallpaper. Irony logged.");
                onAmbient?.("do-not-press", "bg-propaganda");
                window.setTimeout(() => setFlash(null), 2200);
              }
            : undefined
        }
        aria-label={live ? "Inspect background propaganda" : undefined}
        tabIndex={live ? 0 : -1}
      >
        DO NOT PRESS
      </motion.button>

      {hoverLanguage && tip ? (
        <div className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 border border-white/15 bg-black/55 px-2 py-1 font-mono text-[8px] tracking-[0.16em] text-[#c5d3e4]">
          {tip}
        </div>
      ) : null}

      <AnimatePresence>
        {flash ? (
          <motion.div
            key={flash}
            className="pointer-events-none absolute bottom-[10%] left-[4%] z-10 max-w-[300px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {flash}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DroneGag({
  interactive,
  onTip,
  onReact,
}: {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
}) {
  const live = !!interactive;
  return (
    <motion.div
      className="pointer-events-none absolute left-[12%] top-[58%]"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.8 }}
    >
      <motion.button
        type="button"
        className={`relative h-8 w-14 rounded-md border border-cyan/40 bg-[#132033]/90 ${
          live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:bg-cyan/20" : ""
        }`}
        onMouseEnter={() => {
          onTip?.("DRONE LOG // replacement still failed");
          if (live) audio.play("hover", 0.12);
        }}
        onMouseLeave={() => onTip?.(null)}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        aria-label={interactive ? "Inspect drone memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="absolute -top-2 left-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute -top-2 right-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute inset-x-2 bottom-1 h-1 bg-white/20" />
      </motion.button>
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
      <motion.button
        type="button"
        className={`mt-2 border-0 bg-transparent p-0 font-mono text-[9px] tracking-widest text-mist/70 ${
          live ? "pointer-events-auto cursor-pointer hover:text-cyan" : "pointer-events-none"
        }`}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect REPLACEMENT FAILED memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        REPLACEMENT FAILED
      </motion.button>
    </motion.div>
  );
}

function CoffeeGag({
  interactive,
  onTip,
  onReact,
}: {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
}) {
  const live = !!interactive;

  return (
    <motion.div
      className="pointer-events-none absolute right-[16%] top-[52%]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.button
        type="button"
        className={`flex items-end gap-3 border-0 bg-transparent p-0 ${
          live ? "pointer-events-auto cursor-pointer" : ""
        }`}
        animate={{ x: [0, 40, 80] }}
        transition={{ duration: 7, ease: "easeInOut" }}
        onMouseEnter={() => {
          onTip?.("HUMAN PERFORMANCE // mug in transit");
          if (live) audio.play("hover", 0.12);
        }}
        onMouseLeave={() => onTip?.(null)}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect coffee mug" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="h-10 w-2 rounded bg-metal/50" />
        <div className="relative h-7 w-6 rounded-b-md rounded-t-sm border border-white/30 bg-gradient-to-b from-[#5a3a24] to-[#2a180e] hover:border-cyan/50">
          <div className="absolute -right-2 top-1 h-4 w-2 rounded-r-full border border-white/30" />
        </div>
        <div className="h-10 w-2 rounded bg-metal/50" />
      </motion.button>
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

function PrinterGag({
  interactive,
  onTip,
  onReact,
}: {
  interactive?: boolean;
  onTip?: (t: string | null) => void;
  onReact?: () => void;
}) {
  const live = !!interactive;
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[12%] left-[58%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className={`h-12 w-20 border border-white/20 bg-[#182235]/90 ${
          live
            ? "pointer-events-auto cursor-pointer hover:border-cyan/50 hover:bg-[#1c2a42]"
            : ""
        }`}
        onMouseEnter={() => {
          onTip?.("PRINT QUEUE // scissors en route");
          if (live) audio.play("hover", 0.12);
        }}
        onMouseLeave={() => onTip?.(null)}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect printer" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="m-1 h-2 bg-cyan/30" />
        <div className="mx-2 mt-2 h-1 bg-white/20" />
      </button>
      <motion.div
        className="ml-3 origin-top bg-white/90"
        style={{ width: 28 }}
        animate={{ height: [8, 120] }}
        transition={{ duration: 6, ease: "easeInOut" }}
      />
      <motion.button
        type="button"
        className={`mt-2 border-0 bg-transparent p-0 font-mono text-[9px] tracking-widest text-mist/70 ${
          live ? "pointer-events-auto cursor-pointer hover:text-cyan" : "pointer-events-none"
        }`}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 3.5, duration: 2.5 }}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onReact?.();
              }
            : undefined
        }
        aria-label={interactive ? "Inspect SCISSORS EN ROUTE memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        SCISSORS EN ROUTE
      </motion.button>
    </motion.div>
  );
}
