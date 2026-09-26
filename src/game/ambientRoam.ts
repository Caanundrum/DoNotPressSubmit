/**
 * Roaming ambient eggs — props relocate to new anchors on semi-random timings.
 * Opacity-only fades on fixed anchors are not enough; linger 45–90s must reveal
 * new positions and events (punch list P0).
 */

export type RoamSlot = { left: string; top: string };

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
];

export const STATUS_SLOTS: RoamSlot[] = [
  { left: "6%", top: "36%" },
  { left: "82%", top: "30%" },
  { left: "8%", top: "58%" },
  { left: "74%", top: "64%" },
];

export const DASHED_SLOTS: RoamSlot[] = [
  { left: "72%", top: "28%" },
  { left: "8%", top: "30%" },
  { left: "78%", top: "52%" },
  { left: "12%", top: "58%" },
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

/** Semi-random linger: ~7–14s between gag/slot changes. */
export function roamIntervalMs(min = 7000, max = 14000): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
