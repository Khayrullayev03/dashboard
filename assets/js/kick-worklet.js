// Kick-drum detector that runs on the audio thread, so dropped video frames never hide a kick.
// A kick is a sudden jump of energy in 35–150 Hz (which also catches the kick's falling pitch) that
// the band around 350 Hz does not share; bass notes bring harmonics there, so they are ignored.
// Posts { t: onset time in AudioContext seconds, level: 0..1 } once the hit has peaked.

function biquad(type, f0, q) {
  const w = (2 * Math.PI * f0) / sampleRate;
  const al = Math.sin(w) / (2 * q);
  const c = Math.cos(w);
  let b0;
  let b1;
  let b2;
  if (type === "lowpass") {
    b0 = (1 - c) / 2;
    b1 = 1 - c;
    b2 = (1 - c) / 2;
  } else if (type === "highpass") {
    b0 = (1 + c) / 2;
    b1 = -(1 + c);
    b2 = (1 + c) / 2;
  } else {
    b0 = al;
    b1 = 0;
    b2 = -al;
  }
  const a0 = 1 + al;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * c) / a0, a2: (1 - al) / a0, z1: 0, z2: 0 };
}

function filter(f, x) {
  const y = f.b0 * x + f.z1;
  f.z1 = f.b1 * x - f.a1 * y + f.z2;
  f.z2 = f.b2 * x - f.a2 * y;
  return y;
}

const N = 512;
const HOP = 256;
const BACK = 6;

class KickDetector extends AudioWorkletProcessor {
  constructor() {
    super();
    this.hp = biquad("highpass", 35, 0.7);
    this.lp = biquad("lowpass", 150, 0.8);
    this.mid = biquad("bandpass", 350, 0.9);
    this.sq = new Float32Array(N);
    this.sqm = new Float32Array(N);
    this.sum = 0;
    this.summ = 0;
    this.i = 0;
    this.n = 0;
    this.hist = new Float32Array(BACK + 1);
    this.h = 0;
    this.kSlow = 0;
    this.mSlow = 0;
    this.kPeak = 1e-6;
    this.armed = true;
    this.last = -1e9;
    this.lastE = 0;
    this.hit = null;
    this.dt = (HOP / sampleRate) * 1000;
  }

  step(timeMs) {
    const e = Math.max(0, this.sum / N);
    const m = Math.max(0, this.summ / N);
    const back = this.hist[(this.h + 1) % (BACK + 1)];
    this.hist[this.h] = e;
    this.h = (this.h + 1) % (BACK + 1);
    const dt = this.dt;
    const ref = this.kPeak;
    const ratio = e / (this.kSlow + 1e-7);
    const midRatio = m / (this.mSlow + 1e-7);
    this.kPeak = Math.max(e, this.kPeak * Math.exp(-dt / 6000), 1e-6);
    if (ratio < 1.25) this.armed = true;
    const loud = e / this.kPeak;

    if (this.hit) {
      // wait for the hit to peak (max 30 ms) to know how strong it is
      if (e >= this.hit.peak) this.hit.peak = e;
      else if (e < this.hit.peak * 0.92 || timeMs - this.hit.at > 30) {
        this.port.postMessage({ t: this.hit.at / 1000, level: Math.min(1, Math.sqrt(this.hit.peak / this.hit.ref)) });
        this.hit = null;
      }
    } else {
      const free = timeMs - this.last > 150 || e > this.lastE * 1.8;
      const rising = e > back * 1.45 && loud > 0.4;
      if (
        free &&
        rising &&
        ((this.armed && ratio > 1.9 && ratio > midRatio) || (!this.armed && e > this.lastE * 1.8))
      ) {
        this.armed = false;
        this.last = timeMs;
        this.lastE = e;
        this.hit = { at: timeMs, peak: e, ref: Math.max(ref, e) };
      }
    }
    const a = 1 - Math.exp(-dt / 450);
    this.kSlow += (e - this.kSlow) * a;
    this.mSlow += (m - this.mSlow) * a;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    const left = input[0];
    const right = input[1];
    const start = currentTime;
    for (let k = 0; k < left.length; k++) {
      const x = right ? (left[k] + right[k]) * 0.5 : left[k];
      const s = filter(this.lp, filter(this.hp, x));
      const m = filter(this.mid, x);
      const ss = s * s;
      const mm = m * m;
      this.sum += ss - this.sq[this.i];
      this.summ += mm - this.sqm[this.i];
      this.sq[this.i] = ss;
      this.sqm[this.i] = mm;
      this.i = (this.i + 1) % N;
      if (++this.n % HOP === 0) this.step((start + k / sampleRate) * 1000);
      if (this.n % (N * 128) === 0) {
        // re-sum now and then so float rounding in the running sums cannot drift
        this.sum = this.sq.reduce((x, y) => x + y, 0);
        this.summ = this.sqm.reduce((x, y) => x + y, 0);
      }
    }
    return true;
  }
}

registerProcessor("kick-detector", KickDetector);
