import type { ChoiceMotion, OrbAnchor, OrbMood, PanelMotion } from "./types";

/** Pixel / percent stage positions for the assistant. */
export function orbStageStyle(anchor: OrbAnchor | undefined, mood: OrbMood): {
  left: string;
  top: string;
  transform: string;
  size: number;
} {
  const jitter =
    mood === "nervous" || mood === "frightened" || mood === "glitching" ? 1 : 0;

  switch (anchor ?? "dock-left") {
    case "dock-right":
      return { left: "78%", top: "58%", transform: "translate(-50%, -50%)", size: 132 };
    case "listen":
      return { left: "18%", top: "42%", transform: "translate(-50%, -50%)", size: 150 };
    case "pace":
      return { left: "50%", top: "78%", transform: "translate(-50%, -50%)", size: 120 };
    case "flee":
      return { left: "88%", top: "18%", transform: "translate(-50%, -50%)", size: 96 };
    case "loom":
      return { left: "50%", top: "28%", transform: "translate(-50%, -50%)", size: 190 };
    case "hide":
      return { left: "6%", top: "82%", transform: "translate(-50%, -50%)", size: 78 };
    case "overhead":
      return { left: "72%", top: "12%", transform: "translate(-50%, -50%)", size: 110 };
    case "center":
      return { left: "50%", top: "46%", transform: "translate(-50%, -50%)", size: 160 };
    case "dock-left":
    default:
      return {
        left: `${14 + jitter}%`,
        top: "62%",
        transform: "translate(-50%, -50%)",
        size: 140,
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

export function panelLayoutClass(motion: PanelMotion | undefined): string {
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

export function choiceEnter(motion: ChoiceMotion | undefined, index: number) {
  switch (motion) {
    case "restless":
      return {
        initial: { opacity: 0, y: 16 + index * 4, x: index % 2 ? 12 : -12 },
        animate: {
          opacity: 1,
          y: [0, -3, 2, 0],
          x: [0, index % 2 ? 4 : -4, 0],
        },
      };
    case "scatter":
      return {
        initial: {
          opacity: 0,
          x: (index % 2 ? 1 : -1) * (40 + index * 18),
          y: -20 + index * 10,
          rotate: (index % 2 ? 1 : -1) * 4,
        },
        animate: { opacity: 1, x: 0, y: 0, rotate: 0 },
      };
    case "slide-in":
      return {
        initial: { opacity: 0, x: -50 - index * 12 },
        animate: { opacity: 1, x: 0 },
      };
    case "dodge":
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, x: [0, 6, -6, 0] },
      };
    default:
      return {
        initial: { opacity: 0, y: 12 },
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
