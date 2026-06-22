export class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.masterGain = null;
  }

  ensureContext() {
    if (this.context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      this.enabled = false;
      return;
    }
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.12;
    this.masterGain.connect(this.context.destination);
  }

  playShoot() {
    this.playTone({ frequency: 680, duration: 0.045, type: 'square', gain: 0.16 });
  }

  playHit() {
    this.playTone({ frequency: 170, duration: 0.055, type: 'sawtooth', gain: 0.2 });
  }

  playUpgrade() {
    this.playTone({ frequency: 920, duration: 0.12, type: 'triangle', gain: 0.24 });
    window.setTimeout(() => this.playTone({ frequency: 1320, duration: 0.12, type: 'triangle', gain: 0.18 }), 90);
  }

  playDash() {
    this.playTone({ frequency: 260, duration: 0.07, type: 'triangle', gain: 0.22 });
  }

  playTone({ frequency, duration, type, gain }) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.context || !this.masterGain) return;

    const oscillator = this.context.createOscillator();
    const noteGain = this.context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    noteGain.gain.setValueAtTime(gain, this.context.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(noteGain);
    noteGain.connect(this.masterGain);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}
