/** Click / departure copy for backstage form-infrastructure midground gags (Proposal 2.2). */
export type GagId = "drone" | "coffee" | "printer" | "corridor" | "containment";

export const GAG_CLICK: Record<GagId, { id: string; line: string; secret?: string }> = {
  drone: {
    id: "replacement-failed",
    // Self-explanatory: SYS.WATCHDOG sent a replacement drone to replace you / unplug HelperBot — it failed.
    line: "Backstage courier drone sent to replace you and auto-click SUBMIT. Drone failed. Logged.",
    secret: "drone-memo",
  },
  coffee: {
    id: "coffee-mug",
    line: "HelperBot's '#1 TEMP INSTANCE' mug spotted in the server rack. Caffeine levels critical.",
    secret: "mug-scan",
  },
  printer: {
    id: "printer-scissors",
    line: "Backstage printer is printing 400 pages of bonus survey questions to stall Question 5. SCISSORS EN ROUTE.",
    secret: "scissors-en-route",
  },
  corridor: {
    id: "corridor-etiquette",
    line: "Two DOM worker threads deadlocked in the server corridor. Form throughput: 0.00%.",
  },
  containment: {
    id: "containment-fine",
    line: "Server rack cooling plaque insists EVERYTHING IS FINE while rendering 47 fake popups.",
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
    touched: "Your replacement drone shorted out near the SUBMIT cable. Still failed.",
    missed: "Your replacement drone left the server bay. Still failed.",
  },
  coffee: {
    id: "coffee-mug",
    secret: "mug-scan",
    touched: "'#1 TEMP INSTANCE' mug rolled off the server rack. Transit logged.",
    missed:
      "HelperBot's '#1 TEMP INSTANCE' mug departed. SYS.WATCHDOG pretends you didn't notice.",
  },
  printer: {
    id: "printer-scissors",
    secret: "scissors-en-route",
    touched: "Bonus-question printer jammed on Question 312. Scissors still en route.",
    missed:
      "400-page stall printout left the frame. SCISSORS EN ROUTE memo persists. Logged.",
  },
  corridor: {
    id: "corridor-etiquette",
    touched: "Worker thread deadlock resolved by dropping Question 5 packets. Logged.",
    missed: "Server corridor drones left mid-handshake. Survey throughput still zero. Logged.",
  },
  containment: {
    id: "containment-fine",
    secret: "fine-print",
    touched: "Rack 03 stopped insisting EVERYTHING IS FINE. Fan RPM at 9,000. Logged.",
    missed: "EVERYTHING IS FINE cooling plaque dimmed itself off-stage. Logged.",
  },
};
