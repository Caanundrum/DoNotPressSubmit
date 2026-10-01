/** Path-aware ambient toast docking (Form 03B / leave* layouts). */
export function ambientToastClassName(path: string, calm: boolean): string {
  if (calm) {
    return "pointer-events-none absolute bottom-[14%] right-[3%] z-10 max-w-[240px] border border-cyan/20 bg-black/45 px-2 py-1 font-mono text-[8px] tracking-[0.12em] text-cyan/70";
  }
  if (path === "left") {
    // Form owns right — toast mid-left under stage header, clear of left orb.
    return "pointer-events-none absolute left-[3%] top-[12%] z-10 max-w-[280px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90";
  }
  if (path === "overhead" || path === "right") {
    // Tall left form + right orb — floor mid band, clear of both.
    return "pointer-events-none absolute bottom-[8%] left-[36%] z-10 max-w-[280px] -translate-x-1/2 border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90";
  }
  if (path === "bottom") {
    // Form owns upper — toast lower-right, clear of floor orb.
    return "pointer-events-none absolute bottom-[6%] right-[3%] z-10 max-w-[280px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90";
  }
  // Spotlight / default — top-right above bottom form/CTA band.
  return "pointer-events-none absolute right-[3%] top-[12%] z-10 max-w-[280px] border border-cyan/30 bg-black/70 px-2 py-1.5 font-mono text-[9px] tracking-[0.14em] text-cyan/90";
}
