import type { ChoiceMotion, OrbAnchor, OrbMood, PanelMotion } from "./types";

/** Which viewport edge the assistant occupies — forms must leave it alone unless buryAssistant. */
export type AssistantSafeSide = "left" | "right" | "bottom";

export function assistantSafeSide(
  anchor: OrbAnchor | undefined,
  spotlight = false,
): AssistantSafeSide {
  if (spotlight || anchor === "spotlight") return "left";
  switch (anchor) {
    case "dock-right":
    case "loom":
    case "overhead":
    case "flee":
      return "right";
    case "pace":
      return "bottom";
    case "hide":
    case "avoid-submit":
    case "listen":
    case "center":
    case "dock-left":
    default:
      return "left";
  }
}

/** Dialogue docks above the orb when the orb sits low — prevents edge clipping. */
export function dialogueDocksAbove(anchor: OrbAnchor | string | undefined): boolean {
  return anchor === "hide" || anchor === "avoid-submit";
}

/** Right-edge anchors: bubble must grow toward center, never past the viewport. */
export function dialogueDocksLeft(anchor: OrbAnchor | string | undefined): boolean {
  return (
    anchor === "dock-right" ||
    anchor === "loom" ||
    anchor === "overhead" ||
    anchor === "flee"
  );
}

/**
 * Floor-band anchors (Form 01C pace): bubble sits in the left column below the orb —
 * never on top of drifting/pinned answers.
 */
export function dialogueDocksBeside(anchor: OrbAnchor | string | undefined): boolean {
  return anchor === "pace";
}

/** Pixel / percent stage positions for the assistant. */
export function orbStageStyle(
  anchor: OrbAnchor | undefined,
  mood: OrbMood,
  spotlight = false,
): {
  left?: string;
  right?: string;
  top: string;
  /** Prefer edge pins — framer-motion x/y overrides CSS translate(-50%). */
  transform: string;
  size: number;
} {
  const jitter =
    mood === "nervous" || mood === "frightened" || mood === "glitching" ? 1 : 0;

  // Safe-zone dock: orb + rings + status label fully on-screen with a few px margin.
  // Right docks pin with `right` so FM transform overrides can't shove chrome off-frame.
  if (spotlight || anchor === "spotlight") {
    return { left: "2.5%", top: "11%", transform: "none", size: 116 };
  }

  switch (anchor ?? "dock-left") {
    case "dock-right":
      // Right column — ≥24px edge pad; bubble stacks cleanly below orb in right column.
      return { right: "2.5%", top: "13%", transform: "none", size: 96 };
    case "listen":
      // Left dock, clear of restless CTAs and stage header.
      return { left: "2.5%", top: "13%", transform: "none", size: 104 };
    case "pace":
      // Form 01C — left gutter beside shortened form; bubble stacks below orb in left column.
      return { left: "2.5%", top: "14%", transform: "none", size: 84 };
    case "flee":
      return { right: "2.5%", top: "12%", transform: "none", size: 88 };
    case "loom":
      // Act III hazard etc. — full orb+bubble inside frame.
      return { right: "2.5%", top: "13%", transform: "none", size: 102 };
    case "hide":
      // Buried corner — gag allowlist only; ≥24px inside frame so rings never clip.
      return { left: "3%", top: "48%", transform: "none", size: 72 };
    case "overhead":
      // Right/high; ≥24px edge pad for rings + bubble.
      return { right: "2.5%", top: "12%", transform: "none", size: 90 };
    case "center":
      return { left: "2.5%", top: "14%", transform: "none", size: 108 };
    case "avoid-submit":
      // Mid-left dock — bubble above stays in the climax safe column (not under Decision).
      return { left: "2.5%", top: "44%", transform: "none", size: 96 };
    case "dock-left":
    default:
      return {
        left: `${2.5 + jitter * 0.5}%`,
        top: "14%",
        transform: "none",
        size: 102,
      };
  }
}

export function panelVariants(motion: PanelMotion | undefined) {
  switch (motion ?? "settle") {
    case "slide-left":
      return {
        initial: { opacity: 0, x: -120, rotate: -1.5 },
        animate: { opacity: 1, x: 0, rotate: 0 },
      };
    case "slide-right":
      return {
        initial: { opacity: 0, x: 140, rotate: 1.2 },
        animate: { opacity: 1, x: 0, rotate: 0 },
      };
    case "rise":
      return {
        initial: { opacity: 0, y: 90, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
      };
    case "drop":
      return {
        initial: { opacity: 0, y: -80, scale: 1.04 },
        animate: { opacity: 1, y: 0, scale: 1 },
      };
    case "drift":
      return {
        // Keep ±4px so mobile Last Notes / Last Words never clip the right rim.
        initial: { opacity: 0, x: -12, y: 12 },
        animate: { opacity: 1, x: [0, 4, -3, 0], y: [0, -3, 2, 0] },
      };
    case "scatter":
      return {
        initial: { opacity: 0, scale: 0.7, rotate: -6 },
        animate: { opacity: 1, scale: 1, rotate: [0, 1.5, -1, 0] },
      };
    case "reanchor":
      return {
        initial: { opacity: 0.4, y: -40, x: 40 },
        animate: { opacity: 1, y: 0, x: 0 },
      };
    case "pressure":
      return {
        initial: { opacity: 0, scale: 1.12 },
        animate: { opacity: 1, scale: [1.08, 1, 1.02, 1] },
      };
    case "edge":
      return {
        initial: { opacity: 0, x: 60, y: 40 },
        animate: { opacity: 1, x: 0, y: 0 },
      };
    case "settle":
    default:
      return {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
      };
  }
}

/**
 * Assessment panel stage layout.
 * Non-gag forms never enter the reserved assistant safe region.
 * buryAssistant=true: intentional fiction (System silencing / burying the assistant).
 * Climax is NOT bury — the plea bubble must stay readable beside Decision.
 */
export function panelLayoutClass(
  motion: PanelMotion | undefined,
  spotlight = false,
  opts?: { buryAssistant?: boolean; safeSide?: AssistantSafeSide; climax?: boolean },
): string {
  const bury = !!opts?.buryAssistant;
  const side = opts?.safeSide ?? "left";
  const climax = !!opts?.climax;

  // Climax: Decision panel leaves a left column for the avoid-submit orb + plea bubble.
  // Full-bleed used to cover "You promised…" / "Please don't press it." (rev11 P0).
  if (climax) {
    return "left-[min(36vw,380px)] right-[1.5%] top-[7%] bottom-[2%] w-auto max-w-[min(62vw,900px)] max-h-[min(90dvh,720px)]";
  }

  if (bury) {
    // Full-stage gag layouts — may cover / bury the assistant on purpose.
    if (spotlight) {
      return "right-[2%] bottom-[4%] w-[min(92vw,520px)]";
    }
    switch (motion) {
      case "edge":
        return "left-[2%] top-[10%] w-[min(96vw,720px)]";
      case "pressure":
        return "left-[1.5%] right-[1.5%] top-[10%] mx-auto w-[min(97vw,1180px)]";
      case "reanchor":
        return "right-[2%] top-[10%] w-[min(96vw,760px)]";
      case "drift":
        return "left-[2%] bottom-[5%] w-[min(96vw,900px)]";
      case "scatter":
        return "left-[2%] top-[12%] w-[min(96vw,980px)]";
      case "slide-right":
        return "right-[2%] top-[12%] w-[min(96vw,820px)]";
      case "slide-left":
        return "left-[2%] top-[12%] w-[min(96vw,820px)]";
      case "drop":
        return "left-[1.5%] right-[1.5%] top-[6%] mx-auto w-[min(97vw,1120px)]";
      case "rise":
        return "left-[1.5%] right-[1.5%] bottom-[4%] mx-auto w-[min(97vw,1120px)]";
      default:
        return "left-[1.5%] right-[1.5%] top-[9%] mx-auto w-[min(97vw,1140px)]";
    }
  }

  // Reserved assistant column / floor — form layouts cannot enter.
  // Wider left/right reserve so poke-stress bubbles never cover Q/A.
  // top-[12%] clears SOUND ON corner control (few px gap, no kiss).
  const leaveLeft =
    "left-[min(37vw,380px)] right-[2%] max-w-[min(61vw,840px)]";
  const leaveRight =
    "left-[2%] right-[min(37vw,380px)] max-w-[min(61vw,820px)]";
  // Form 01C floor/side: leave a left gutter for orb+bubble (never over answers/helper).
  // Taller leaveBottom so Form 06 subtitle + options aren't clipped at 1280×800.
  // overflow-visible during/after transition — never mid-word clip options.
  const leaveBottom =
    "left-[min(37vw,380px)] right-[2%] top-[10%] bottom-auto max-h-[min(72vh,580px)] max-w-[min(61vw,860px)] overflow-visible";

  if (spotlight) {
    // Form sits strictly in the right 61vw column opposite the left spotlight orb+bubble column.
    return `${leaveLeft} top-[12%] bottom-auto w-auto`;
  }

  if (side === "bottom") {
    switch (motion) {
      case "rise":
      case "drift":
      case "scatter":
        return `${leaveBottom} w-auto`;
      case "pressure":
      case "drop":
        return `${leaveBottom} w-auto`;
      default:
        return `${leaveBottom} w-auto`;
    }
  }

  const band = side === "right" ? leaveRight : leaveLeft;

  switch (motion) {
    case "edge":
      return `${band} top-[12%] w-auto`;
    case "pressure":
      return `${band} top-[12%] w-auto`;
    case "reanchor":
      return `${band} top-[12%] w-auto`;
    case "drift":
      return `${band} top-[12%] bottom-auto w-auto`;
    case "scatter":
      return `${band} top-[12%] w-auto`;
    case "slide-right":
      return `${band} top-[12%] w-auto`;
    case "slide-left":
      return `${band} top-[12%] w-auto`;
    case "drop":
      return `${band} top-[12%] w-auto`;
    case "rise":
      return `${band} top-[12%] bottom-auto w-auto`;
    default:
      return `${band} top-[12%] w-auto`;
  }
}

export function choiceEnter(motion: ChoiceMotion | undefined, index: number) {
  switch (motion) {
    case "restless":
      // Opacity-only enter — no x/y shift that swallows the first click (Layer 03 / rev5 P0).
      return {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
        },
      };
    case "scatter":
      // Softer enter — keep start offsets small so mobile Loyalty / Damage never clip.
      return {
        initial: {
          opacity: 0,
          x: (index % 2 ? 1 : -1) * (4 + index * 2),
          y: -4 + index,
          rotate: (index % 2 ? 1 : -1) * 1,
        },
        animate: { opacity: 1, x: 0, y: 0, rotate: 0 },
      };
    case "slide-in":
      return {
        initial: { opacity: 0, x: -36 - index * 8 },
        animate: { opacity: 1, x: 0 },
      };
    case "dodge":
      return {
        initial: { opacity: 0, scale: 0.94 },
        // Tiny in-place sway — ±2px so Duplicate / Attention never walk past the card rim at 390px.
        animate: { opacity: 1, scale: 1, x: [0, 2, -2, 0] },
      };
    default:
      return {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      };
  }
}

export function defaultAnchorForMood(mood: OrbMood): OrbAnchor {
  switch (mood) {
    case "listening":
      return "listen";
    case "frightened":
    case "nervous":
      return "flee";
    case "defiant":
    case "excited":
      return "loom";
    case "defeated":
      return "hide";
    case "thinking":
    case "suspicious":
      return "pace";
    case "glitching":
      return "overhead";
    case "irritated":
      return "dock-right";
    default:
      return "dock-left";
  }
}
