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
  return (
    anchor === "pace" ||
    anchor === "hide" ||
    anchor === "avoid-submit" ||
    anchor === "dock-left" ||
    anchor === "listen" ||
    anchor === "center"
  );
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

/** Pixel / percent stage positions for the assistant. */
export function orbStageStyle(
  anchor: OrbAnchor | undefined,
  mood: OrbMood,
  spotlight = false,
): {
  left: string;
  top: string;
  transform: string;
  size: number;
} {
  const jitter =
    mood === "nervous" || mood === "frightened" || mood === "glitching" ? 1 : 0;

  // Safe-zone dock: orb + dialogue fully on-screen after every non-gag advance.
  // Inset aggressively so Act I Form 01 / listen and Act II right docks never clip.
  if (spotlight || anchor === "spotlight") {
    return { left: "16%", top: "30%", transform: "translate(-50%, -50%)", size: 188 };
  }

  switch (anchor ?? "dock-left") {
    case "dock-right":
      // Dialogue docks left of orb — keep both inside the right safe column.
      return { left: "84%", top: "36%", transform: "translate(-50%, -50%)", size: 118 };
    case "listen":
      // Form 01 etc. — left dock, clear of restless CTAs and stage header.
      return { left: "14%", top: "40%", transform: "translate(-50%, -50%)", size: 136 };
    case "pace":
      // Stay above the floor so orb+dialogue clear the viewport at 1280×800.
      // Keep x travel small — wide pace loops were clipping dialogue off-stage.
      return { left: "50%", top: "66%", transform: "translate(-50%, -50%)", size: 108 };
    case "flee":
      return { left: "82%", top: "18%", transform: "translate(-50%, -50%)", size: 96 };
    case "loom":
      // Act III hazard etc. — keep full orb+bubble inside frame at 1280×800.
      return { left: "82%", top: "26%", transform: "translate(-50%, -50%)", size: 140 };
    case "hide":
      // Buried corner — gag allowlist only; still keep bubble on-screen.
      return { left: "14%", top: "74%", transform: "translate(-50%, -50%)", size: 78 };
    case "overhead":
      return { left: "82%", top: "16%", transform: "translate(-50%, -50%)", size: 104 };
    case "center":
      return { left: "15%", top: "34%", transform: "translate(-50%, -50%)", size: 148 };
    case "avoid-submit":
      return { left: "14%", top: "68%", transform: "translate(-50%, -50%)", size: 118 };
    case "dock-left":
    default:
      return {
        left: `${14 + jitter}%`,
        top: "46%",
        transform: "translate(-50%, -50%)",
        size: 132,
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
        initial: { opacity: 0, x: -20, y: 20 },
        animate: { opacity: 1, x: [0, 10, -8, 0], y: [0, -6, 4, 0] },
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
 * buryAssistant=true: intentional fiction (System silencing / burying / climax).
 */
export function panelLayoutClass(
  motion: PanelMotion | undefined,
  spotlight = false,
  opts?: { buryAssistant?: boolean; safeSide?: AssistantSafeSide; climax?: boolean },
): string {
  const bury = !!opts?.buryAssistant;
  const side = opts?.safeSide ?? "left";
  const climax = !!opts?.climax;

  // Climax: reclaim nearly the full stage so every ending fits in one glance @ 1280×800.
  if (climax) {
    return "left-[1.5%] right-[1.5%] top-[7%] bottom-[2%] mx-auto w-[min(97%,1100px)] max-h-[min(90dvh,720px)]";
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
  // Slightly taller left reserve so Act III setpiece chase panels never bury docked orb.
  const leaveLeft =
    "left-[min(32vw,340px)] right-[2%] max-w-[min(66vw,880px)]";
  const leaveRight =
    "left-[2%] right-[min(34vw,360px)] max-w-[min(66vw,880px)]";
  const leaveBottom =
    "left-[2%] right-[2%] top-[6%] bottom-auto max-h-[min(58vh,520px)] max-w-[min(92vw,980px)] mx-auto";

  if (spotlight) {
    // Form retreats opposite the spotlight orb (left safe zone). Stay readable.
    return "right-[2%] bottom-[5%] w-[min(64vw,480px)] max-w-[calc(100%-min(32vw,320px))]";
  }

  if (side === "bottom") {
    switch (motion) {
      case "rise":
      case "drift":
        return `${leaveBottom} w-[min(92vw,980px)]`;
      case "pressure":
      case "drop":
        return `${leaveBottom} w-[min(94vw,1040px)]`;
      default:
        return `${leaveBottom} w-[min(90vw,900px)]`;
    }
  }

  const band = side === "right" ? leaveRight : leaveLeft;

  switch (motion) {
    case "edge":
      return side === "right"
        ? "left-[2%] top-[10%] w-[min(66vw,660px)] right-[min(30vw,320px)]"
        : "left-[min(30vw,320px)] top-[10%] w-[min(66vw,660px)]";
    case "pressure":
      return `${band} top-[9%] w-auto`;
    case "reanchor":
      return side === "right"
        ? "left-[2%] top-[10%] w-[min(66vw,680px)]"
        : "right-[2%] top-[10%] w-[min(66vw,680px)] left-[min(30vw,320px)]";
    case "drift":
      return `${band} top-[10%] bottom-auto w-auto`;
    case "scatter":
      return `${band} top-[10%] w-auto`;
    case "slide-right":
      // Prefer the free side even if the motion name says right.
      return side === "right"
        ? "left-[2%] top-[10%] w-[min(64vw,700px)]"
        : "right-[2%] top-[10%] w-[min(64vw,700px)] left-[min(30vw,320px)]";
    case "slide-left":
      return side === "left"
        ? "left-[min(30vw,320px)] top-[10%] w-[min(64vw,700px)]"
        : "left-[2%] top-[10%] w-[min(64vw,700px)] right-[min(30vw,320px)]";
    case "drop":
      return `${band} top-[7%] w-auto`;
    case "rise":
      return `${band} top-[8%] bottom-auto w-auto`;
    default:
      return `${band} top-[8%] w-auto`;
  }
}

export function choiceEnter(motion: ChoiceMotion | undefined, index: number) {
  switch (motion) {
    case "restless":
      return {
        initial: { opacity: 0, y: 12 + index * 3, x: index % 2 ? 8 : -8 },
        animate: {
          opacity: 1,
          y: [0, -2, 1.5, 0],
          x: [0, index % 2 ? 3 : -3, 0],
        },
      };
    case "scatter":
      return {
        initial: {
          opacity: 0,
          x: (index % 2 ? 1 : -1) * (28 + index * 12),
          y: -12 + index * 6,
          rotate: (index % 2 ? 1 : -1) * 3,
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
        // Opacity stays 1 — only x loops (SceneChoiceList locks opacity during repeat).
        animate: { opacity: 1, scale: 1, x: [0, 4, -4, 0] },
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
