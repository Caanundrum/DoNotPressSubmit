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
