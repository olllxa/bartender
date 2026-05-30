export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this._ready = false;
    this._pourSource = null;
    this._bgmSources = [];
  }

  _ensure() {
    if (!this._ready) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.4;
      this.sfxGain.connect(this.masterGain);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.1;
      this.bgmGain.connect(this.masterGain);
      this._ready = true;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    this._ensure();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.frequency.value = 900;
    osc.type = 'sine';
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  startPour() {
    this._ensure();
    if (!this.ctx) return;
    this.stopPour();
    const sr = this.ctx.sampleRate;
    const len = sr * 0.5;
    const buf = this.ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.6 + Math.sin(i / sr * 120) * 0.2;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 500 + Math.random() * 200;
    f.Q.value = 0.5;
    const g = this.ctx.createGain();
    g.gain.value = 0.12;
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxGain);
    src.start();
    this._pourSource = { src, g };
  }

  stopPour() {
    if (this._pourSource) {
      try { this._pourSource.src.stop(); } catch (e) { /* ignore */ }
      this._pourSource = null;
    }
  }

  playShake() {
    this._ensure();
    if (!this.ctx) return;
    const dur = 0.9;
    const sr = this.ctx.sampleRate;
    const len = sr * dur;
    const buf = this.ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const env = Math.max(0, Math.sin(t * Math.PI / dur));
      const mod = 0.5 + 0.5 * Math.sin(t * 55);
      d[i] = (Math.random() * 2 - 1) * env * mod * 0.4;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3500;
    f.Q.value = 4;
    const g = this.ctx.createGain();
    g.gain.value = 0.2;
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxGain);
    src.start();
  }

  playServe() {
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0.15, 0.08].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 1200 + i * 400;
      osc.type = 'sine';
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.08, t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.12);
    });
  }

  playSuccess() {
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'sine';
      const g = this.ctx.createGain();
      const start = t + i * 0.12;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.2, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  playFail() {
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.5);
    osc.type = 'sawtooth';
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.linearRampToValueAtTime(0.1, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playLevelUp() {
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'triangle';
      const g = this.ctx.createGain();
      const start = t + i * 0.1;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.15, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  playLevelDown() {
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [300, 250, 200];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      const g = this.ctx.createGain();
      const start = t + i * 0.15;
      g.gain.setValueAtTime(0.1, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  startBGM() {
    this._ensure();
    if (!this.ctx || this._bgmSources.length > 0) return;
    const root = 65.41;
    const harmonics = [1, 2, 2.5, 3, 4.2];
    harmonics.forEach((mult, i) => {
      const osc = this.ctx.createOscillator();
      osc.frequency.value = root * mult;
      osc.type = 'sine';
      const g = this.ctx.createGain();
      g.gain.value = 0.015 / (i + 1);
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.04;
      const lfoG = this.ctx.createGain();
      lfoG.gain.value = 0.005;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      osc.connect(g);
      g.connect(this.bgmGain);
      osc.start();
      lfo.start();
      this._bgmSources.push({ osc, lfo, g });
    });
  }

  stopBGM() {
    this._bgmSources.forEach(({ osc, lfo, g }) => {
      try { osc.stop(); } catch (e) { /* ignore */ }
      try { lfo.stop(); } catch (e) { /* ignore */ }
    });
    this._bgmSources = [];
  }

  dispose() {
    this.stopBGM();
    this.stopPour();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this._ready = false;
  }
}
