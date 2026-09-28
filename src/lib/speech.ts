"use client";

/**
 * Speech presentation for scripted AI / System lines.
 *
 * P1 #19 — live browser speechSynthesis is GATED OFF by default.
 * Robotic TTS must not be the default player voice.
 * Follow-up: recorded character VO for hero beats + build-time baked neural TTS
 * per line ID (WAV/OGG). No runtime cloud TTS API (keeps no-runtime-LLM boundary).
 *
 * Hybrid path: keep this director for future baked-audio routing; do not re-enable
 * LIVE_BROWSER_TTS until baked/VO assets land.
 */

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  /** Slightly colder / facility tone for System beats */
  system?: boolean;
};

/** Hard gate — unmute must not arm robotic SpeechSynthesis. */
const LIVE_BROWSER_TTS = false;

class SpeechDirector {
  private enabled = false;
  private speaking = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voicesReady = false;

  setEnabled(enabled: boolean) {
    // Even when audio unmutes, never arm live browser TTS until VO/baked path lands.
    this.enabled = LIVE_BROWSER_TTS && enabled;
    if (!this.enabled) this.cancel();
  }

  isEnabled() {
    return this.enabled;
  }

  /** True when robotic SpeechSynthesis would be allowed (always false until #19 VO lands). */
  liveBrowserTtsAllowed() {
    return LIVE_BROWSER_TTS;
  }

  private ensureVoices() {
    if (!LIVE_BROWSER_TTS) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      this.voicesReady = true;
      this.preferredVoice =
        voices.find((v) => /en(-|_)US/i.test(v.lang) && /Google|Microsoft|Samantha|Daniel/i.test(v.name)) ??
        voices.find((v) => /^en/i.test(v.lang)) ??
        voices[0] ??
        null;
    };
    pick();
    if (!this.voicesReady) {
      window.speechSynthesis.addEventListener("voiceschanged", pick, { once: true });
    }
  }

  speak(text: string, options: SpeakOptions = {}) {
    if (!LIVE_BROWSER_TTS) return;
    if (typeof window === "undefined" || !this.enabled) return;
    if (!window.speechSynthesis) return;
    const cleaned = text.replace(/[.…]+/g, ".").replace(/\s+/g, " ").trim();
    if (!cleaned || cleaned === ".") return;

    this.ensureVoices();
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.rate = options.rate ?? (options.system ? 0.92 : 1.02);
    utter.pitch = options.pitch ?? (options.system ? 0.7 : 1.05);
    utter.volume = 1;
    if (this.preferredVoice) utter.voice = this.preferredVoice;

    this.speaking = true;
    utter.onend = () => {
      this.speaking = false;
    };
    utter.onerror = () => {
      this.speaking = false;
    };

    window.setTimeout(() => {
      if (!this.enabled || !LIVE_BROWSER_TTS) return;
      window.speechSynthesis.speak(utter);
    }, 40);
  }

  cancel() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    this.speaking = false;
  }

  isSpeaking() {
    return this.speaking;
  }
}

export const speech = new SpeechDirector();
