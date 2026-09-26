/**
 * Roaming ambient eggs — props relocate to new anchors on semi-random timings.
 * Opacity-only fades on fixed anchors are not enough; linger 45–90s must reveal
 * new positions and events (punch list P0). Title uses the same pools as in-game.
 */

export type RoamSlot = { left: string; top: string };

/** One tall facility stack — left % + height % of viewport band. */
export type FacilityBar = { left: string; heightPct: number };

/** Margin / midground slots — avoid dead-center form / BEGIN CTA column. */
export const MARGIN_SLOTS: RoamSlot[] = [
  { left: "6%", top: "22%" },
  { left: "10%", top: "54%" },
  { left: "14%", top: "38%" },
  { left: "18%", top: "68%" },
  { left: "72%", top: "28%" },
  { left: "78%", top: "48%" },
  { left: "84%", top: "36%" },
  { left: "68%", top: "62%" },
  { left: "58%", top: "18%" },
  { left: "42%", top: "14%" },
  { left: "88%", top: "58%" },
  { left: "4%", top: "48%" },
];

export const GAG_SLOTS: Record<string, RoamSlot[]> = {
  drone: [
    { left: "10%", top: "54%" },
    { left: "72%", top: "42%" },
    { left: "8%", top: "28%" },
    { left: "58%", top: "62%" },
    { left: "80%", top: "58%" },
  ],
  coffee: [
    { left: "86%", top: "50%" },
    { left: "12%", top: "46%" },
    { left: "70%", top: "32%" },
    { left: "22%", top: "64%" },
  ],
  printer: [
    { left: "54%", top: "78%" },
    { left: "18%", top: "72%" },
    { left: "76%", top: "70%" },
    { left: "40%", top: "80%" },
  ],
  corridor: [
    { left: "38%", top: "58%" },
    { left: "62%", top: "52%" },
    { left: "28%", top: "64%" },
    { left: "48%", top: "40%" },
  ],
  containment: [
    { left: "78%", top: "24%" },
    { left: "12%", top: "20%" },
    { left: "60%", top: "16%" },
    { left: "86%", top: "40%" },
  ],
};

export const CHAMBER_SLOTS: RoamSlot[] = [
  { left: "6%", top: "22%" },
  { left: "78%", top: "18%" },
  { left: "4%", top: "48%" },
  { left: "70%", top: "52%" },
  { left: "10%", top: "66%" },
  { left: "84%", top: "42%" },
];

export const STATUS_SLOTS: RoamSlot[] = [
  { left: "6%", top: "36%" },
  { left: "82%", top: "30%" },
  { left: "8%", top: "58%" },
  { left: "74%", top: "64%" },
  { left: "88%", top: "48%" },
];

export const DASHED_SLOTS: RoamSlot[] = [
  { left: "72%", top: "28%" },
  { left: "8%", top: "30%" },
  { left: "78%", top: "52%" },
  { left: "12%", top: "58%" },
  { left: "62%", top: "16%" },
];

/**
 * Full skyline layouts for the tall facility bars — re-anchor as a set so
 * lingerers see a new silhouette (not opacity pulse on fixed pins).
 */
export const BAR_LAYOUTS: FacilityBar[][] = [
  [
    { left: "8%", heightPct: 28 },
    { left: "20%", heightPct: 45 },
    { left: "32%", heightPct: 33 },
    { left: "44%", heightPct: 52 },
    { left: "56%", heightPct: 38 },
    { left: "68%", heightPct: 48 },
    { left: "80%", heightPct: 31 },
  ],
  [
    { left: "4%", heightPct: 42 },
    { left: "14%", heightPct: 30 },
    { left: "26%", heightPct: 55 },
    { left: "50%", heightPct: 36 },
    { left: "62%", heightPct: 48 },
    { left: "74%", heightPct: 28 },
    { left: "88%", heightPct: 44 },
  ],
  [
    { left: "10%", heightPct: 36 },
    { left: "22%", heightPct: 50 },
    { left: "38%", heightPct: 28 },
    { left: "48%", heightPct: 46 },
    { left: "60%", heightPct: 34 },
    { left: "76%", heightPct: 54 },
    { left: "86%", heightPct: 32 },
  ],
  [
    { left: "6%", heightPct: 48 },
    { left: "18%", heightPct: 32 },
    { left: "30%", heightPct: 40 },
    { left: "54%", heightPct: 56 },
    { left: "66%", heightPct: 30 },
    { left: "78%", heightPct: 44 },
    { left: "90%", heightPct: 36 },
  ],
];

export function pickSlot(slots: RoamSlot[], avoid?: RoamSlot | null): RoamSlot {
  if (slots.length === 0) return { left: "10%", top: "40%" };
  if (slots.length === 1) return slots[0]!;
  let next = slots[Math.floor(Math.random() * slots.length)]!;
  let guard = 0;
  while (
    avoid &&
    next.left === avoid.left &&
    next.top === avoid.top &&
    guard++ < 8
  ) {
    next = slots[Math.floor(Math.random() * slots.length)]!;
  }
  return next;
}

/** Prefer a clearly different horizontal band so relocation reads on title idle shots. */
export function pickSlotDistant(slots: RoamSlot[], avoid?: RoamSlot | null): RoamSlot {
  if (!avoid || slots.length < 2) return pickSlot(slots, avoid);
  const avoidLeft = Number.parseFloat(avoid.left);
  const distant = slots.filter(
    (s) => Math.abs(Number.parseFloat(s.left) - avoidLeft) >= 25,
  );
  return pickSlot(distant.length > 0 ? distant : slots, avoid);
}

export function pickBarLayout(avoidIndex?: number): { index: number; bars: FacilityBar[] } {
  const n = BAR_LAYOUTS.length;
  if (n === 0) return { index: 0, bars: [] };
  let index = Math.floor(Math.random() * n);
  let guard = 0;
  while (avoidIndex !== undefined && index === avoidIndex && guard++ < 6) {
    index = Math.floor(Math.random() * n);
  }
  return { index, bars: BAR_LAYOUTS[index]! };
}

/** Semi-random linger: ~7–14s between gag/slot changes. */
export function roamIntervalMs(min = 7000, max = 14000): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
