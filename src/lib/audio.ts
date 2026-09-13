"use client";

type Cue =
  | "logo"
  | "click"
  | "begin"
  | "hover"
  | "system"
  | "ambience"
  | "stopAmbience";

const FILES: Record<Exclude<Cue, "stopAmbience">, string> = {
  logo: "/audio/logo-sting.wav",
  click: "/audio/ui-click.wav",
  begin: "/audio/begin.wav",
  hover: "/audio/hover.wav",
  system: "/audio/system.wav",
  ambience: "/audio/ambience.wav",
};

class AudioDirector {
  private unlocked = false;
  private cache = new Map<string, HTMLAudioElement>();
  private ambience: HTMLAudioElement | null = null;
  private muted = false;

  unlock() {
    if (this.unlocked || typeof window === "undefined") return;
    this.unlocked = true;
    // Warm a silent play path after first gesture.
    void this.play("click", 0.001);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stopAmbience();
  }

  private get(src: string) {
    let el = this.cache.get(src);
    if (!el) {
      el = new Audio(src);
      el.preload = "auto";
      this.cache.set(src, el);
    }
    return el;
  }

  play(cue: Cue, volume = 1) {
    if (typeof window === "undefined" || this.muted) return;
    if (cue === "stopAmbience") {
      this.stopAmbience();
      return;
    }
    if (cue === "ambience") {
      if (!this.ambience) {
        this.ambience = this.get(FILES.ambience);
        this.ambience.loop = true;
      }
      this.ambience.volume = Math.min(0.35, volume);
      void this.ambience.play().catch(() => undefined);
      return;
    }
    const el = this.get(FILES[cue]).cloneNode(true) as HTMLAudioElement;
    el.volume = Math.min(1, volume);
    void el.play().catch(() => undefined);
  }

  stopAmbience() {
    if (!this.ambience) return;
    this.ambience.pause();
    this.ambience.currentTime = 0;
  }
}

export const audio = new AudioDirector();
