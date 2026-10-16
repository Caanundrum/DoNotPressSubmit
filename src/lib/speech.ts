"use client";

/**
 * Speech presentation for scripted AI / System lines.
 *
 * Playability overhaul 2026-10-16 — baked `.wav` VO disabled (too robotic).
 * Call sites may still invoke `speakLine` / `speak`; they no-op (no fetch, no play,
 * no ambience duck). Procedural SFX stay on `audio` (`click`, `hover`, `begin`, …).
 *
 * No live `speechSynthesis` player path. No runtime cloud TTS.
 */

import { audio } from "@/lib/audio";
import {
  type VoiceMood,
  voiceAssetPath,
  voiceMoodFromOrb,
} from "@/lib/voiceIds";
import type { OrbMood } from "@/game/types";

export type SpeakLineOptions = {
  lineId: string;
  mood?: VoiceMood;
  /** Optional orb mood — mapped to VoiceMood when mood omitted. */
  orbMood?: OrbMood;
  /** Retained for call-site clarity / future caption sync; never sent to a TTS API. */
  text?: string;
  system?: boolean;
};

/** @deprecated Dead flag — live browser TTS is not a player path. Kept false for KEEP/smoke. */
export const LIVE_BROWSER_TTS = false;

/** Hard off — robotic baked VO must not play. */
const VO_PLAYBACK_ENABLED = false;

class SpeechDirector {
  private enabled = false;
  private speaking = false;
  private current: HTMLAudioElement | null = null;
  private unduckTimer: number | null = null;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!this.enabled) this.cancel();
  }

  isEnabled() {
    return this.enabled;
  }

  /** Robotic SpeechSynthesis is never a player path. */
  liveBrowserTtsAllowed() {
    return LIVE_BROWSER_TTS;
  }

  /**
   * Formerly played baked / recorded takes + ducked ambience.
   * Now a deliberate no-op (overhaul: disable robotic `.wav` VO).
   * Path helpers remain for bake-voice / KEEP markers.
   */
  speakLine(options: SpeakLineOptions) {
    if (!VO_PLAYBACK_ENABLED) return;
    if (typeof window === "undefined" || !this.enabled) return;

    const mood: VoiceMood =
      options.mood ?? voiceMoodFromOrb(options.orbMood) ?? (options.system ? "alarmed" : "calm");
    const src = voiceAssetPath(options.lineId, mood);

    this.cancel();

    const el = new Audio(src);
    el.preload = "auto";
    el.volume = options.system ? 0.92 : 0.85;
    this.current = el;
    this.speaking = true;

    audio.duckAmbience(0.28);

    const finish = () => {
      if (this.current !== el) return;
      this.speaking = false;
      this.current = null;
      this.scheduleUnduck(320);
    };

    el.addEventListener("ended", finish);
    el.addEventListener("error", finish);

    void el.play().catch(() => {
      finish();
    });
  }

  /**
   * Legacy signature — routes to baked path when a lineId is present; otherwise no-ops.
   * With VO_PLAYBACK_ENABLED false, always no-ops after the lineId gate.
   */
  speak(text: string, options: { system?: boolean; lineId?: string; mood?: VoiceMood; orbMood?: OrbMood } = {}) {
    if (!options.lineId) return;
    this.speakLine({
      lineId: options.lineId,
      text,
      system: options.system,
      mood: options.mood,
      orbMood: options.orbMood,
    });
  }

  private scheduleUnduck(ms: number) {
    if (this.unduckTimer != null) window.clearTimeout(this.unduckTimer);
    this.unduckTimer = window.setTimeout(() => {
      this.unduckTimer = null;
      if (!this.speaking) audio.unduckAmbience();
    }, ms);
  }

  cancel() {
    if (this.unduckTimer != null) {
      window.clearTimeout(this.unduckTimer);
      this.unduckTimer = null;
    }
    if (this.current) {
      try {
        this.current.pause();
        this.current.src = "";
      } catch {
        // ignore
      }
      this.current = null;
    }
    this.speaking = false;
    audio.unduckAmbience();
  }

  isSpeaking() {
    return this.speaking;
  }
}

export const speech = new SpeechDirector();
