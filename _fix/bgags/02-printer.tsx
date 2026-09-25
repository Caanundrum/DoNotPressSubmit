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

