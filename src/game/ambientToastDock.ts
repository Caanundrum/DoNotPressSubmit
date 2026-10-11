/** Path-aware ambient toast docking (Form 03B / leave* layouts). */
export function ambientToastClassName(path: string, calm: boolean): string {
  // Higher contrast + ≥24px bottom margin (P1 #7). Shared bus replaces — never stacks.
  const base =
    "pointer-events-none absolute z-10 max-w-[min(90vw,320px)] border border-cyan/45 bg-black/90 px-3 py-2 font-mono text-[11px] leading-snug tracking-[0.12em] text-[#e8f7ff] shadow-[0_6px_20px_rgba(0,0,0,0.55)]";
  if (calm) {
    return `${base} bottom-8 right-[3%] max-w-[260px]`;
  }
  if (path === "left") {
    // Form owns right — toast mid-left under stage header, clear of left orb.
    return `${base} left-[3%] top-[12%]`;
  }
  if (path === "overhead" || path === "right") {
    // Tall left form + right orb — floor mid band, clear of both (≥24px bottom).
    return `${base} bottom-8 left-[36%] -translate-x-1/2`;
  }
  if (path === "bottom") {
    // Form owns upper — toast lower-right, clear of floor orb.
    return `${base} bottom-8 right-[3%]`;
  }
  // Spotlight / default — top-right above bottom form/CTA band.
  return `${base} right-[3%] top-[12%]`;
}
