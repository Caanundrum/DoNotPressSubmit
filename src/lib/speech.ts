"use client";

/**
 * Browser Web Speech delivery for scripted AI / System lines.
 * Speech is presentation only — dialogue strings remain authoritative.
 */

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  /** Slightly colder / facility tone for System beats */
  system?: boolean;
};

class SpeechDirector {
  private enabled = false;
  private speaking = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voicesReady = false;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.cancel();
  }

  isEnabled() {
    return this.enabled;
  }

  private ensureVoices() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      this.voicesReady = true;
      // Prefer crisp English voices; Google/Microsoft tend to read UI copy cleanly.
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

    // Small defer helps some browsers after cancel().
    window.setTimeout(() => {
      if (!this.enabled) return;
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
