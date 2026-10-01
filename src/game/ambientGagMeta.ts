/** Click / departure copy for ambient midground gags. */
export type GagId = "drone" | "coffee" | "printer" | "corridor" | "containment";

export const GAG_CLICK: Record<GagId, { id: string; line: string; secret?: string }> = {
  drone: {
    id: "replacement-failed",
    line: "Drone memo: REPLACEMENT FAILED. Also: dignity failed. Logged.",
    secret: "drone-memo",
  },
  coffee: {
    id: "coffee-mug",
    line: "Mug poked mid-transit. Caffeine reclassified as morale malware.",
    secret: "mug-scan",
  },
  printer: {
    id: "printer-scissors",
    line: "Printer blushed. SCISSORS EN ROUTE remains on schedule.",
    secret: "scissors-en-route",
  },
  corridor: {
    id: "corridor-etiquette",
    line: "Two drones practiced politeness until physics intervened.",
  },
  containment: {
    id: "containment-fine",
    line: "Containment plaque insists EVERYTHING IS FINE. Unprompted. Concerning.",
    secret: "fine-print",
  },
};

/** Departure toasts — distinct from click lines; still count as Ambient fiddling. */
export const GAG_DEPART: Record<
  GagId,
  { touched: string; missed: string; id: string; secret?: string }
> = {
  drone: {
    id: "replacement-failed",
    secret: "drone-memo",
    touched: "Drone memo filed and left. REPLACEMENT FAILED still echoes.",
    missed:
      "REPLACEMENT FAILED scrolled off-frame. Dignity remained failed. Logged.",
  },
  coffee: {
    id: "coffee-mug",
    secret: "mug-scan",
    touched: "Mug left the frame mid-scan. Transit logged.",
    missed:
      "HUMAN PERFORMANCE mug departed. Facility pretends you didn't notice. Logged anyway.",
  },
  printer: {
    id: "printer-scissors",
    secret: "scissors-en-route",
    touched: "Printer exited stage left. Scissors still en route. Somewhere.",
    missed:
      "Paper trail left the frame. SCISSORS EN ROUTE memo persists. Logged.",
  },
  corridor: {
    id: "corridor-etiquette",
    touched: "Etiquette deadlock resolved by walking away. Logged.",
    missed: "Corridor drones left mid-after-you. Throughput still zero. Logged.",
  },
  containment: {
    id: "containment-fine",
    secret: "fine-print",
    touched: "Bay 03 stopped insisting. Briefly. Logged.",
    missed: "EVERYTHING IS FINE plaque dimmed itself off-stage. Logged.",
  },
};

