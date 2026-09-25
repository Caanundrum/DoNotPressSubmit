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
