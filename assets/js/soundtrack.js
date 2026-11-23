(function () {
  "use strict";

  const BPM = 124;
  const STEP = 60 / BPM / 4;
  const BARS = 32;
  const ROOTS = [45, 41, 38, 40];
  const CHORDS = [
    [57, 60, 64],
    [53, 57, 60],
    [50, 53, 57],
    [52, 56, 59],
  ];
  const ARP = [0, 2, 1, 2, 0, 2, 1, 3];
  const hz = (note) => 440 * Math.pow(2, (note - 69) / 12);

  function create(ctx, output) {
    const master = ctx.createGain();
    master.gain.value = 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    master.connect(comp);
    comp.connect(output);

    const music = ctx.createGain();
    music.connect(master);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = STEP * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(music);

    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    let step = 0;
    let nextTime = 0;
    let timer = 0;
    let playing = false;

    function env(gain, t, peak, attack, decay) {
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    }

    function kick(t, level) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(44, t + 0.12);
      env(g, t, level, 0.002, 0.42);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 0.5);
      music.gain.cancelScheduledValues(t);
      music.gain.setValueAtTime(0.35, t);
      music.gain.linearRampToValueAtTime(1, t + STEP * 3);
    }

    function hat(t, level, open) {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 7500;
      const g = ctx.createGain();
      env(g, t, level, 0.001, open ? 0.22 : 0.05);
      src.connect(hp);
      hp.connect(g);
      g.connect(music);
      src.start(t, Math.random() * 0.5);
      src.stop(t + 0.3);
    }

    function clap(t) {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1700;
      bp.Q.value = 0.9;
      const g = ctx.createGain();
      env(g, t, 0.5, 0.002, 0.18);
      src.connect(bp);
      bp.connect(g);
      g.connect(music);
      g.connect(delay);
      src.start(t, Math.random() * 0.5);
      src.stop(t + 0.3);
    }

    function bass(t, note, accent) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 6;
      lp.frequency.setValueAtTime(accent ? 900 : 520, t);
      lp.frequency.exponentialRampToValueAtTime(140, t + STEP * 1.6);
      const g = ctx.createGain();
      env(g, t, accent ? 0.42 : 0.3, 0.004, STEP * 1.7);
      [-7, 7].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = hz(note);
        osc.detune.value = cents;
        osc.connect(lp);
        osc.start(t);
        osc.stop(t + STEP * 2);
      });
      lp.connect(g);
      g.connect(music);
    }

    function pad(t, chord, length) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(500, t);
      lp.frequency.linearRampToValueAtTime(1500, t + length * 0.6);
      lp.frequency.linearRampToValueAtTime(700, t + length);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.6);
      g.gain.setValueAtTime(0.07, t + length - 0.5);
      g.gain.linearRampToValueAtTime(0.0001, t + length);
      chord.forEach((note) =>
        [-9, 9].forEach((cents) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.value = hz(note);
          osc.detune.value = cents;
          osc.connect(lp);
          osc.start(t);
          osc.stop(t + length + 0.05);
        })
      );
      lp.connect(g);
      g.connect(music);
      g.connect(delay);
    }

    function arp(t, note, level) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = hz(note);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2600;
      const g = ctx.createGain();
      env(g, t, level, 0.003, STEP * 0.9);
      osc.connect(lp);
      lp.connect(g);
      g.connect(music);
      g.connect(delay);
      osc.start(t);
      osc.stop(t + STEP * 1.2);
    }

    function schedule(i, t) {
      const bar = Math.floor(i / 16) % BARS;
      const s = i % 16;
      const chordIndex = Math.floor(bar / 2) % 4;
      const intro = bar < 1;
      const breakdown = bar >= 24 && bar < 28;
      const drop = bar >= 28;
      const full = bar >= 12;

      if (s === 0 && bar % 2 === 0) pad(t, CHORDS[chordIndex], STEP * 32);
      if (!intro && !breakdown && s % 4 === 0) kick(t, s === 0 || s === 8 ? 1 : 0.62);
      if (drop && (s === 14 || (bar === 31 && s >= 12))) kick(t, 0.38);
      if (!breakdown && s % 4 === 2) hat(t, intro ? 0.08 : 0.14, s === 10 && full);
      if ((full || drop) && !breakdown && s % 2 === 1) hat(t, 0.05, false);
      if (full && !breakdown && (s === 4 || s === 12)) clap(t);
      if (!intro && !breakdown && s % 4 !== 0) bass(t, ROOTS[chordIndex] + 12, s % 4 === 2);
      if ((full || breakdown) && s % 2 === 0) {
        const chord = CHORDS[chordIndex];
        arp(t, chord[ARP[(s / 2) % ARP.length] % chord.length] + 12, breakdown ? 0.05 : 0.035);
      }
    }

    function tick() {
      while (nextTime < ctx.currentTime + 0.12) {
        schedule(step, nextTime);
        step++;
        nextTime += STEP;
      }
    }

    return {
      get playing() {
        return playing;
      },
      start() {
        if (playing) return;
        playing = true;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0.85, ctx.currentTime);
        nextTime = ctx.currentTime + 0.08;
        tick();
        timer = setInterval(tick, 25);
      },
      stop() {
        if (!playing) return;
        playing = false;
        clearInterval(timer);
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      },
      dispose() {
        this.stop();
        setTimeout(() => {
          try {
            comp.disconnect();
          } catch (e) {}
        }, 400);
      },
    };
  }

  window.SOUNDTRACK = { create };
})();
