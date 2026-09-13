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

type Listener = (state: { unlocked: boolean; muted: boolean }) => void;

class AudioDirector {
  private unlocked = false;
  private cache = new Map<string, HTMLAudioElement>();
  private ambience: HTMLAudioElement | null = null;
  /** Start muted until the player explicitly enables sound. */
  private muted = true;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  getState() {
    return { unlocked: this.unlocked, muted: this.muted };
  }

  isUnlocked() {
    return this.unlocked;
  }

  isMuted() {
    return this.muted;
  }

  /** Warm the AudioContext path after a user gesture (does not unmute). */
  unlock() {
    if (this.unlocked || typeof window === "undefined") return;
    this.unlocked = true;
    void this.playSilentWarmup();
    this.emit();
  }

  private async playSilentWarmup() {
    try {
      const el = this.get(FILES.click);
      el.volume = 0.001;
      await el.play();
      el.pause();
      el.currentTime = 0;
    } catch {
      // Gesture may still be required for later cues.
    }
  }

  /** Explicit player opt-in for SFX, ambience, and speech. */
  enableSound() {
    this.unlock();
    this.muted = false;
    this.emit();
    this.play("click", 0.45);
    this.play("ambience", 0.22);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stopAmbience();
    this.emit();
  }

  toggleMuted() {
    if (this.muted) {
      this.enableSound();
    } else {
      this.setMuted(true);
    }
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
