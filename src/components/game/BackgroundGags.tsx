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
  onAmbientRef.current = onAmbient;

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
