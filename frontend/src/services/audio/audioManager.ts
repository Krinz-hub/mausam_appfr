import { Platform } from 'react-native';
import { AudioEventType } from '../../design/audio';

class AudioManager {
  private muted: boolean = false;
  private volume: number = 0.85;
  private webAudioCtx: any = null;

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          this.webAudioCtx = new AudioContext();
        }
      } catch (e) {
        // AudioContext not supported
      }
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public async play(event: AudioEventType): Promise<void> {
    if (this.muted) return;

    if (Platform.OS === 'web' && this.webAudioCtx) {
      try {
        if (this.webAudioCtx.state === 'suspended') {
          await this.webAudioCtx.resume();
        }
        this.playSynthesizedWebChime(event);
      } catch (err) {
        // Ignore audio playback error
      }
    }
  }

  private playSynthesizedWebChime(event: AudioEventType) {
    if (!this.webAudioCtx) return;
    const ctx = this.webAudioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (event) {
      case 'selection': {
        // Soft wooden / bubble click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.04);
        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'progress': {
        // Warm rising interval
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.25 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'success': {
        // Bright cheerful major triad chord
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.setValueAtTime(freq, now + i * 0.05);
          chordGain.gain.setValueAtTime(0.18 * this.volume, now + i * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now + i * 0.05);
          chordOsc.stop(now + i * 0.05 + 0.35);
        });
        break;
      }
      case 'feedback_positive': {
        // Uplifting pleasant ding
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.14);
        gain.gain.setValueAtTime(0.25 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }
      case 'feedback_negative': {
        // Soft gentle acknowledge double-tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(370, now + 0.08);
        gain.gain.setValueAtTime(0.18 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'error': {
        // Gentle low double-tap
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'notification': {
        // Soft chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15);
        gain.gain.setValueAtTime(0.3 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }
}

export const audioManager = new AudioManager();
