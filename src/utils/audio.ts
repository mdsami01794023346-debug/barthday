import { MusicPreset } from '../types/scene';

interface NoteEvent {
  time: number;
  freq: number;
  dur: number;
  chord?: number[];
}

const SAMPLE_RATE = 22050;

// "Happy Birthday to You" in C major / G7 (warm music-box & piano arrangement)
const HAPPY_BIRTHDAY_EVENTS: { loopDuration: number; events: NoteEvent[] } = {
  loopDuration: 13.6,
  events: [
    // Phrase 1: Hap-py Birth-day to you
    { time: 0.0, freq: 392.0, dur: 0.34, chord: [130.81, 196.0, 261.63] },
    { time: 0.36, freq: 392.0, dur: 0.16 },
    { time: 0.54, freq: 440.0, dur: 0.5, chord: [130.81, 164.81, 196.0] },
    { time: 1.06, freq: 392.0, dur: 0.5 },
    { time: 1.58, freq: 523.25, dur: 0.5, chord: [98.0, 146.83, 196.0] },
    { time: 2.1, freq: 493.88, dur: 0.98 },

    // Phrase 2: Hap-py Birth-day to you
    { time: 3.2, freq: 392.0, dur: 0.34, chord: [98.0, 146.83, 174.61] },
    { time: 3.56, freq: 392.0, dur: 0.16 },
    { time: 3.74, freq: 440.0, dur: 0.5, chord: [98.0, 146.83, 196.0] },
    { time: 4.26, freq: 392.0, dur: 0.5 },
    { time: 4.78, freq: 587.33, dur: 0.5, chord: [130.81, 164.81, 196.0] },
    { time: 5.3, freq: 523.25, dur: 0.98 },

    // Phrase 3: Hap-py Birth-day dear [Name]
    { time: 6.4, freq: 392.0, dur: 0.34, chord: [130.81, 164.81, 196.0] },
    { time: 6.76, freq: 392.0, dur: 0.16 },
    { time: 6.94, freq: 783.99, dur: 0.5, chord: [130.81, 196.0, 233.08] },
    { time: 7.46, freq: 659.25, dur: 0.5 },
    { time: 7.98, freq: 523.25, dur: 0.5, chord: [87.31, 130.81, 174.61] },
    { time: 8.5, freq: 493.88, dur: 0.5 },
    { time: 9.02, freq: 440.0, dur: 0.84 },

    // Phrase 4: Hap-py Birth-day to you
    { time: 9.95, freq: 698.46, dur: 0.34, chord: [87.31, 130.81, 174.61] },
    { time: 10.31, freq: 698.46, dur: 0.16 },
    { time: 10.49, freq: 659.25, dur: 0.5, chord: [130.81, 164.81, 196.0] },
    { time: 11.01, freq: 523.25, dur: 0.5, chord: [98.0, 146.83, 174.61] },
    { time: 11.53, freq: 587.33, dur: 0.5 },
    { time: 12.05, freq: 523.25, dur: 1.25, chord: [130.81, 164.81, 196.0] },
  ],
};

// Romantic music-box arpeggio (Fmaj7 -> G6 -> Em7 -> Am9)
const ROMANTIC_EVENTS: { loopDuration: number; events: NoteEvent[] } = {
  loopDuration: 11.52,
  events: [
    // Fmaj7
    { time: 0.0, freq: 349.23, dur: 0.55, chord: [174.61, 220.0] },
    { time: 0.48, freq: 440.0, dur: 0.55 },
    { time: 0.96, freq: 523.25, dur: 0.55 },
    { time: 1.44, freq: 659.25, dur: 0.55 },
    { time: 1.92, freq: 523.25, dur: 0.55 },
    { time: 2.4, freq: 440.0, dur: 0.55 },
    // G6
    { time: 2.88, freq: 392.0, dur: 0.55, chord: [196.0, 246.94] },
    { time: 3.36, freq: 493.88, dur: 0.55 },
    { time: 3.84, freq: 587.33, dur: 0.55 },
    { time: 4.32, freq: 659.25, dur: 0.55 },
    { time: 4.8, freq: 587.33, dur: 0.55 },
    { time: 5.28, freq: 493.88, dur: 0.55 },
    // Em7
    { time: 5.76, freq: 329.63, dur: 0.55, chord: [164.81, 196.0] },
    { time: 6.24, freq: 392.0, dur: 0.55 },
    { time: 6.72, freq: 493.88, dur: 0.55 },
    { time: 7.2, freq: 587.33, dur: 0.55 },
    { time: 7.68, freq: 493.88, dur: 0.55 },
    { time: 8.16, freq: 392.0, dur: 0.55 },
    // Am9
    { time: 8.64, freq: 220.0, dur: 0.55, chord: [110.0, 164.81] },
    { time: 9.12, freq: 329.63, dur: 0.55 },
    { time: 9.6, freq: 440.0, dur: 0.55 },
    { time: 10.08, freq: 523.25, dur: 0.55 },
    { time: 10.56, freq: 659.25, dur: 0.55 },
    { time: 11.04, freq: 523.25, dur: 0.55 },
  ],
};

function encodePcmWavBlobUrl(mix: Float32Array): string {
  const totalSamples = mix.length;
  let peak = 0.001;
  for (let i = 0; i < totalSamples; i++) {
    const abs = Math.abs(mix[i]);
    if (abs > peak) peak = abs;
  }
  const scale = 0.88 / peak;

  const wavBuffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(wavBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  let byteOffset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, mix[i] * scale));
    view.setInt16(byteOffset, Math.round(clamped * 32767), true);
    byteOffset += 2;
  }

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function synthesizeWavBlobUrl(preset: MusicPreset): string {
  const track = preset === 'romantic' ? ROMANTIC_EVENTS : HAPPY_BIRTHDAY_EVENTS;
  const totalSamples = Math.floor(track.loopDuration * SAMPLE_RATE);
  const mix = new Float32Array(totalSamples);

  for (const ev of track.events) {
    const startIdx = Math.floor(ev.time * SAMPLE_RATE);
    const tailSec = ev.dur + 0.55;
    const len = Math.floor(tailSec * SAMPLE_RATE);
    const w = 2 * Math.PI * ev.freq;

    for (let i = 0; i < len; i++) {
      const idx = (startIdx + i) % totalSamples;
      const t = i / SAMPLE_RATE;
      const attack = Math.min(1, t / 0.012);
      const decay = Math.exp(-3.0 * t);
      const env = attack * decay;
      const sample =
        (Math.sin(w * t) +
          0.38 * Math.sin(2 * w * t) * Math.exp(-2.2 * t) +
          0.14 * Math.sin(3 * w * t) * Math.exp(-4.0 * t) +
          0.05 * Math.sin(4 * w * t) * Math.exp(-6.0 * t)) *
        0.55 *
        env;
      mix[idx] += sample;
    }

    if (ev.chord) {
      const chordLen = Math.floor(1.55 * SAMPLE_RATE);
      for (const cf of ev.chord) {
        const cw = 2 * Math.PI * cf;
        for (let i = 0; i < chordLen; i++) {
          const idx = (startIdx + i) % totalSamples;
          const t = i / SAMPLE_RATE;
          const cAttack = Math.min(1, t / 0.055);
          const cDecay = Math.exp(-1.75 * t);
          mix[idx] += (Math.sin(cw * t) + 0.2 * Math.sin(2 * cw * t)) * 0.14 * cAttack * cDecay;
        }
      }
    }
  }

  return encodePcmWavBlobUrl(mix);
}

export type CountdownCue = 3 | 2 | 1 | 0;

function synthesizeCountdownCueUrl(cue: CountdownCue): string {
  if (cue === 0) {
    // Warm celebratory Cmaj sparkle chord when countdown finishes
    const duration = 0.72;
    const totalSamples = Math.floor(duration * SAMPLE_RATE);
    const mix = new Float32Array(totalSamples);
    const notes = [
      { freq: 523.25, delay: 0.0 },
      { freq: 659.25, delay: 0.035 },
      { freq: 783.99, delay: 0.07 },
      { freq: 1046.5, delay: 0.105 },
    ];
    for (const n of notes) {
      const start = Math.floor(n.delay * SAMPLE_RATE);
      const w = 2 * Math.PI * n.freq;
      for (let i = start; i < totalSamples; i++) {
        const t = (i - start) / SAMPLE_RATE;
        const env = Math.min(1, t / 0.008) * Math.exp(-4.8 * t);
        mix[i] +=
          (Math.sin(w * t) + 0.3 * Math.sin(2 * w * t) * Math.exp(-7 * t)) *
          0.35 *
          env;
      }
    }
    return encodePcmWavBlobUrl(mix);
  }

  // Rising crystal bell tick: 3 (C5) -> 2 (D5) -> 1 (E5)
  const freqMap: Record<1 | 2 | 3, number> = {
    3: 523.25,
    2: 587.33,
    1: 659.25,
  };
  const duration = 0.34;
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const mix = new Float32Array(totalSamples);
  const w = 2 * Math.PI * freqMap[cue];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.006) * Math.exp(-9.5 * t);
    mix[i] =
      (Math.sin(w * t) +
        0.38 * Math.sin(2 * w * t) * Math.exp(-12 * t) +
        0.14 * Math.sin(3 * w * t) * Math.exp(-18 * t)) *
      0.75 *
      env;
  }
  return encodePcmWavBlobUrl(mix);
}

/**
 * Plays synthesized WAV music and countdown chimes via HTMLAudioElement so
 * iPhone Safari, Android Chrome, and cross-origin iframe previews play loud,
 * clear media audio reliably.
 */
class AmbientMelodyPlayer {
  private audio: HTMLAudioElement | null = null;
  private cueAudio: HTMLAudioElement | null = null;
  private urls: Partial<Record<MusicPreset, string>> = {};
  private cueUrls: Partial<Record<CountdownCue, string>> = {};
  private currentPreset: MusicPreset = 'birthday';
  private isPlaying = false;
  private primed = false;

  private getOrCreateAudio(preset: MusicPreset): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.urls[preset]) {
      this.urls[preset] = synthesizeWavBlobUrl(preset);
    }
    if (!this.audio) {
      const el = new Audio(this.urls[preset]);
      el.loop = true;
      el.volume = 1.0;
      el.preload = 'auto';
      el.setAttribute('playsinline', 'true');
      this.audio = el;
      this.currentPreset = preset;
    } else if (this.currentPreset !== preset) {
      const wasPlaying = this.isPlaying;
      this.audio.pause();
      this.audio.src = this.urls[preset]!;
      this.audio.currentTime = 0;
      this.currentPreset = preset;
      if (wasPlaying) {
        void this.audio.play().catch(() => {});
      }
    }
    return this.audio;
  }

  private getOrCreateCueAudio(cue: CountdownCue): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.cueUrls[cue]) {
      this.cueUrls[cue] = synthesizeCountdownCueUrl(cue);
    }
    if (!this.cueAudio) {
      const el = new Audio(this.cueUrls[cue]);
      el.loop = false;
      el.volume = 0.92;
      el.preload = 'auto';
      el.setAttribute('playsinline', 'true');
      this.cueAudio = el;
    } else {
      this.cueAudio.pause();
      this.cueAudio.src = this.cueUrls[cue]!;
      this.cueAudio.currentTime = 0;
    }
    return this.cueAudio;
  }

  public setPreset(preset: MusicPreset): void {
    if (preset === this.currentPreset) return;
    this.getOrCreateAudio(preset);
  }

  public playCountdownCue(cue: CountdownCue): Promise<boolean> {
    const el = this.getOrCreateCueAudio(cue);
    if (!el) return Promise.resolve(false);
    return el
      .play()
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Unlocks both the countdown chime element and main music element inside a
   * single user gesture during the 3-2-1 intro without starting music early.
   */
  public unlockDuringCountdown(currentCue: CountdownCue, preset: MusicPreset = this.currentPreset): Promise<boolean> {
    const musicEl = this.getOrCreateAudio(preset);
    if (musicEl && !this.primed && !this.isPlaying) {
      musicEl.muted = true;
      void musicEl
        .play()
        .then(() => {
          if (!this.isPlaying) {
            musicEl.pause();
            musicEl.currentTime = 0;
          }
          musicEl.muted = false;
          this.primed = true;
        })
        .catch(() => {
          musicEl.muted = false;
        });
    }
    return this.playCountdownCue(currentCue);
  }

  public start(preset: MusicPreset = this.currentPreset): Promise<boolean> {
    const el = this.getOrCreateAudio(preset);
    if (!el) return Promise.resolve(false);
    el.muted = false;
    this.isPlaying = true;
    return el
      .play()
      .then(() => {
        this.isPlaying = true;
        this.primed = true;
        return true;
      })
      .catch(() => {
        this.isPlaying = false;
        return false;
      });
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying && !!this.audio && !this.audio.paused;
  }
}

export const ambientPlayer = new AmbientMelodyPlayer();
