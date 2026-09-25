"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

/**
 * Title / facility midground comedy.
 * P2: REPLACEMENT FAILED + printer departure toasts (Ambient fiddling) — keep.
 * Phase 3: richer sequences + corridor etiquette + containment flash.
 */
type GagId = "drone" | "coffee" | "printer" | "corridor" | "containment";

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
  corridor: {
    id: "corridor-etiquette",
    line: "Two drones practiced politeness until physics intervened.",
  },
  containment: {
    id: "containment-fine",
    line: "Containment plaque insists EVERYTHING IS FINE. Unprompted. Concerning.",
    secret: "fine-print",
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
  corridor: {
    id: "corridor-etiquette",
    touched: "Etiquette deadlock resolved by walking away. Logged.",
    missed: "Corridor drones left mid-after-you. Throughput still zero. Logged.",
  },
  containment: {
    id: "containment-fine",
    secret: "fine-print",
    touched: "Bay 03 stopped insisting. Briefly. Logged.",
    missed: "EVERYTHING IS FINE plaque dimmed itself off-stage. Logged.",
  },
};

const ORDER: GagId[] = ["drone", "coffee", "printer", "corridor", "containment"];

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
    corridor: false,
    containment: false,
  });
  const prevActive = useRef<GagId>("drone");
  const onAmbientRef = useRef(onAmbient);
  useEffect(() => {
    onAmbientRef.current = onAmbient;
  }, [onAmbient]);

  useEffect(() => {
    if (paused) return;
    let i = 0;
    const id = setInterval(() => {
      // Semi-random skip so players don't see every gag every visit.
      const step = Math.random() > 0.22 ? 1 : 2;
      i = (i + step) % ORDER.length;
      setActive(ORDER[i]!);
    }, 8500);
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
        {active === "corridor" && !paused ? (
          <CorridorGag
            key="corridor"
            interactive={live}
            onTip={setTip}
            onReact={() => react("corridor")}
          />
        ) : null}
        {active === "containment" && !paused ? (
          <ContainmentGag
            key="containment"
            interactive={live}
            onTip={setTip}
            onReact={() => react("containment")}
          />
        ) : null}
      </AnimatePresence>

      {/* Always-on micro gag — tiny robot secretly presses DO NOT PRESS */}
      {!paused ? (
        <div className="pointer-events-none absolute bottom-[18%] left-[42%] h-16 w-40">
          <motion.div
            className="absolute bottom-0 left-0 h-3 w-4 rounded-sm border border-metal/50 bg-[#1a2230]"
            animate={{ x: [0, 72, 72, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 16, repeat: Infinity, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
          >
            <span className="absolute -top-1 left-0.5 h-1.5 w-1.5 rounded-full bg-cyan/70" />
            <span className="absolute -top-1 right-0.5 h-1.5 w-1.5 rounded-full bg-cyan/40" />
          </motion.div>
          <motion.button
            type="button"
            className={`absolute bottom-1 left-[4.5rem] font-mono text-[9px] tracking-widest text-danger/85 ${
              live
                ? "pointer-events-auto cursor-pointer border border-transparent px-1 hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                : "pointer-events-none"
            }`}
            animate={{
              opacity: [0.15, 0.15, 1, 1, 0.35, 0.35],
              scale: [1, 1, 1, 0.92, 1, 1],
              textShadow: [
                "0 0 0 transparent",
                "0 0 0 transparent",
                "0 0 8px rgba(255,77,109,0.5)",
                "0 0 14px rgba(255,77,109,0.8)",
                "0 0 4px rgba(255,77,109,0.3)",
                "0 0 0 transparent",
              ],
            }}
            transition={{ duration: 16, repeat: Infinity, times: [0, 0.32, 0.38, 0.45, 0.55, 1] }}
            onClick={
              live
                ? (e) => {
                    e.stopPropagation();
                    audio.play("click", 0.3);
                    setFlash(
                      "Tiny robot pressed DO NOT PRESS. Facility filed an irony incident.",
                    );
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
        </div>
      ) : null}

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

/** REPLACEMENT FAILED — Phase 3 richer motion; P2 clickable memo label. */
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
      className="pointer-events-none absolute left-[10%] top-[54%]"
      initial={{ opacity: 0, x: -48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ duration: 0.8 }}
    >
      <motion.button
        type="button"
        className={`relative h-10 w-[4.5rem] rounded-md border border-cyan/45 bg-[#132033]/92 shadow-[0_0_18px_rgba(110,231,255,0.12)] ${
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
        animate={{ y: [0, -5, 0], x: [0, 6, 18, 18, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, times: [0, 0.15, 0.35, 0.55, 0.75, 1] }}
        aria-label={interactive ? "Inspect drone memo" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="absolute -top-2 left-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute -top-2 right-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#6ee7ff]" />
        <div className="absolute inset-x-2 bottom-1.5 h-1 bg-white/25" />
        <div className="absolute inset-x-3 top-3 h-px bg-cyan/30" />
      </motion.button>

      <motion.div
        className="absolute -right-14 top-[-6px] h-5 w-5 rounded-full border border-white/25"
        animate={{
          backgroundColor: ["#6ee7ff", "#ffb020", "#6ee7ff", "#ffb020", "#ff4d6d", "#ffb020"],
          boxShadow: [
            "0 0 10px #6ee7ff",
            "0 0 10px #ffb020",
            "0 0 10px #6ee7ff",
            "0 0 10px #ffb020",
            "0 0 14px #ff4d6d",
            "0 0 10px #ffb020",
          ],
          scale: [1, 1, 1.05, 1, 0.9, 1],
        }}
        transition={{ duration: 5.5, times: [0, 0.2, 0.4, 0.55, 0.72, 1], repeat: Infinity }}
      />

      <motion.button
        type="button"
        className={`mt-3 border border-system-warn/40 bg-black/65 px-2 py-1 font-mono text-[9px] tracking-[0.22em] text-system-warn ${
          live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:text-cyan" : "pointer-events-none"
        }`}
        animate={{ opacity: [0, 1, 1, 0.85, 1], x: [0, 0, 0, 2, 0] }}
        transition={{ duration: 5.5, times: [0, 0.18, 0.55, 0.78, 1], repeat: Infinity }}
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
      <motion.div
        className="mt-1 font-mono text-[8px] tracking-[0.16em] text-mist/55"
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 5.5, times: [0, 0.45, 0.55, 0.85, 1], repeat: Infinity }}
      >
        RETRY // ALSO FAILED
      </motion.div>
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
      className="pointer-events-none absolute right-[14%] top-[50%]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.button
        type="button"
        className={`flex items-end gap-3 border-0 bg-transparent p-0 ${
          live ? "pointer-events-auto cursor-pointer" : ""
        }`}
        animate={{ x: [0, 48, 96] }}
        transition={{ duration: 7, ease: "easeInOut" }}
        onMouseEnter={() => {
          onTip?.("HUMAN PERFORMANCE // mug in transit");
          if (live) audio.play("hover", 0.12);
        }}
