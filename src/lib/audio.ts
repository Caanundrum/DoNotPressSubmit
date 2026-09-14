"use client";

import type { OrbMood } from "@/game/types";

type Cue =
  | "logo"
  | "click"
  | "begin"
  | "hover"
  | "system"
  | "ambience"
  | "stopAmbience";

type MoodCue = "poke" | "mercy" | "mischief" | "nervous" | "glitch";

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
  private ctx: AudioContext | null = null;
  private lastMood: OrbMood | null = null;
  private lastMoodAt = 0;

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
    this.ensureCtx();
    this.emit();
  }

  private ensureCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
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

  /** Soft mood chirp when the assistant's emotional state changes. */
  playMood(mood: OrbMood) {
    if (typeof window === "undefined" || this.muted) return;
    const now = Date.now();
    if (this.lastMood === mood && now - this.lastMoodAt < 900) return;
    this.lastMood = mood;
    this.lastMoodAt = now;

    if (mood === "nervous" || mood === "frightened") {
      this.playMoodCue("nervous");
    } else if (mood === "amused" || mood === "excited" || mood === "defiant") {
      this.playMoodCue("mischief");
    } else if (mood === "defeated") {
      this.playMoodCue("mercy");
    } else if (mood === "glitching") {
      this.playMoodCue("glitch");
    }
  }

  playMoodCue(kind: MoodCue) {
    if (typeof window === "undefined" || this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (kind) {
      case "poke":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.24);
        break;
      case "nervous":
        osc.type = "sine";
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.linearRampToValueAtTime(290, now + 0.12);
        osc.frequency.linearRampToValueAtTime(360, now + 0.22);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case "mischief":
        osc.type = "sine";
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.14);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      case "mercy":
        osc.type = "sine";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.35);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.42);
        break;
      case "glitch":
        osc.type = "square";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.setValueAtTime(440, now + 0.05);
        osc.frequency.setValueAtTime(90, now + 0.1);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
    }
  }
}

export const audio = new AudioDirector();
