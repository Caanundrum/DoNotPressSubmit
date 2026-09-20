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
        <motion.div
          className="h-11 w-2 rounded bg-metal/55"
          animate={{ rotate: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <div className="relative h-8 w-7 rounded-b-md rounded-t-sm border border-white/35 bg-gradient-to-b from-[#5a3a24] to-[#2a180e] hover:border-cyan/50">
          <div className="absolute -right-2 top-1 h-4 w-2 rounded-r-full border border-white/30" />
          <motion.div
            className="absolute inset-x-1 top-1 h-1 rounded bg-[#c4a882]/50"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
        <motion.div
          className="h-11 w-2 rounded bg-metal/55"
          animate={{ rotate: [0, 2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </motion.button>
      <motion.div
        className="mt-2 max-w-[240px] border border-cyan/35 bg-black/55 px-2 py-1 font-mono text-[9px] tracking-wider text-cyan"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 6, times: [0, 0.2, 0.75, 1] }}
      >
        HUMAN PERFORMANCE ENHANCEMENT COMPOUND DETECTED
      </motion.div>
    </motion.div>
  );
}

/** Printer — Phase 3 paper cascade + scissors drone; P2 clickable SCISSORS label. */
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
      className="pointer-events-none absolute bottom-[10%] left-[54%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className={`relative h-14 w-24 border border-white/25 bg-[#182235]/92 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
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
        <div className="m-1.5 h-2.5 bg-cyan/35" />
        <div className="mx-2 mt-2 h-1 bg-white/25" />
        <div className="mx-3 mt-1.5 h-1 bg-white/15" />
        <motion.div
          className="absolute -right-1 top-2 h-2 w-2 rounded-full bg-system-warn"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </button>

      <motion.div
        className="ml-4 origin-top bg-gradient-to-b from-white/95 to-white/70 shadow-[2px_0_8px_rgba(0,0,0,0.25)]"
        style={{ width: 30 }}
        animate={{ height: [10, 70, 140, 170] }}
        transition={{ duration: 7, ease: "easeInOut", times: [0, 0.35, 0.7, 1] }}
      >
        <div className="space-y-2 p-1 opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-px bg-[#9aa6b8]/70" />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute left-[7.5rem] top-[9.5rem] h-3 w-16 origin-left bg-white/80"
        initial={{ scaleX: 0, rotate: 0 }}
        animate={{ scaleX: [0, 0, 1], rotate: [0, 0, 12] }}
        transition={{ duration: 7, times: [0, 0.65, 1] }}
      />

      <motion.div
        className="absolute left-[9rem] top-[2.5rem] flex items-center gap-1"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: [0, 0, 1, 1], x: [40, 40, 0, -8] }}
        transition={{ duration: 7, times: [0, 0.55, 0.7, 1] }}
      >
        <div className="h-4 w-6 rounded-sm border border-cyan/40 bg-[#1a2838]" />
        <div className="relative h-3 w-4">
          <div className="absolute left-0 top-0 h-2 w-2 rounded-full border border-danger/70" />
          <div className="absolute right-0 top-0 h-2 w-2 rounded-full border border-danger/70" />
          <div className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-danger/70" />
        </div>
      </motion.div>

      <motion.button
        type="button"
        className={`mt-2 border border-cyan/25 bg-black/55 px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-mist/75 ${
          live ? "pointer-events-auto cursor-pointer hover:border-cyan hover:text-cyan" : "pointer-events-none"
        }`}
        animate={{ opacity: [0, 0, 1, 1, 0.6] }}
        transition={{ duration: 7, times: [0, 0.4, 0.55, 0.85, 1] }}
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

function CorridorGag({
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
      className="pointer-events-none absolute left-[38%] top-[58%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        className={`relative h-16 w-44 border-0 bg-transparent p-0 ${
          live ? "pointer-events-auto cursor-pointer" : ""
        }`}
        onMouseEnter={() => {
          onTip?.("CORRIDOR // etiquette deadlock");
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
        aria-label={interactive ? "Inspect corridor etiquette" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="absolute inset-x-4 top-0 h-px bg-white/15" />
        <motion.div
          className="absolute left-2 top-4 h-7 w-10 rounded border border-cyan/35 bg-[#152033]/90"
          animate={{ x: [0, 18, 0, 18, 0, -30] }}
          transition={{ duration: 6.5, times: [0, 0.18, 0.36, 0.54, 0.72, 1], repeat: Infinity }}
        />
        <motion.div
          className="absolute right-2 top-4 h-7 w-10 rounded border border-white/30 bg-[#1a2434]/90"
          animate={{ x: [0, -18, 0, -18, 0, 30] }}
          transition={{ duration: 6.5, times: [0, 0.18, 0.36, 0.54, 0.72, 1], repeat: Infinity }}
        />
      </motion.button>
      <motion.div
        className="mt-1 text-center font-mono text-[8px] tracking-[0.18em] text-mist/60"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        AFTER YOU // AFTER YOU
      </motion.div>
    </motion.div>
  );
}

function ContainmentGag({
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
      className="pointer-events-none absolute right-[22%] top-[24%]"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        className={`h-20 w-28 border border-white/15 bg-[#0a1420]/75 p-2 text-left ${
          live ? "pointer-events-auto cursor-pointer hover:border-system-warn/50" : ""
        }`}
        onMouseEnter={() => {
          onTip?.("CONTAINMENT // unsolicited reassurance");
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
        animate={{
          boxShadow: [
            "0 0 0 rgba(255,176,32,0)",
            "0 0 28px rgba(255,176,32,0.35)",
            "0 0 0 rgba(255,176,32,0)",
          ],
        }}
        transition={{ duration: 4.5, repeat: Infinity }}
        aria-label={interactive ? "Inspect containment plaque" : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <div className="font-mono text-[8px] tracking-[0.2em] text-mist/50">BAY 03</div>
        <motion.div
          className="mt-3 font-mono text-[9px] tracking-[0.16em] text-system-warn"
          animate={{ opacity: [0.25, 1, 1, 0.25] }}
          transition={{ duration: 4.5, times: [0, 0.15, 0.7, 1], repeat: Infinity }}
        >
          EVERYTHING IS FINE
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
