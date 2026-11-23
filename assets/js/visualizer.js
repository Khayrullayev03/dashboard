(function () {
  "use strict";

  const box = document.querySelector("[data-viz]");
  const btn = document.querySelector("[data-viz-btn]");
  const menu = document.querySelector("[data-viz-menu]");
  const I18N = window.I18N;
  if (!box || !btn || !menu || !I18N) return;
  const { t } = I18N;
  const canvas = box.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const micBtn = menu.querySelector("[data-viz-mic]");
  const synthBtn = menu.querySelector("[data-viz-synth]");
  const fileBtn = menu.querySelector("[data-viz-file]");
  const toggleBtn = menu.querySelector("[data-viz-toggle]");
  const stopBtn = menu.querySelector("[data-viz-stop]");
  const trackEl = menu.querySelector("[data-viz-track]");
  const input = menu.querySelector("[data-viz-input]");
  const logo = document.querySelector("[data-home-logo]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toast = (msg) => window.APP && window.APP.toast && window.APP.toast(msg);

  let audio = null;
  let analyser = null;
  let source = null;
  let stream = null;
  let player = null;
  let playerSource = null;
  let synth = null;
  let synthOut = null;
  let spec = null;
  let low = null;
  let bassTap = null;
  let wave = null;
  let peakRef = 0.05;
  let recentPeak = 0;
  let pending = null;
  let mode = "idle";
  let raf = 0;
  let last = 0;
  let bars = [];
  let caps = [];
  let capV = [];
  let capT = [];
  let raw = [];
  let cols = 0;
  let w = 0;
  let h = 0;
  let pitch = 6;
  let fill = null;
  let glow = null;
  let ref = 0.7;
  let bassRef = 0.7;
  let bassEnv = 0;
  let kick = 0;
  let kickTarget = 0;
  let scoreAvg = 0;
  let fluxAvg = 0;
  let armed = true;
  let prevDb = null;
  let lastGlitch = 0;

  const LO = 20;
  const HI = 16000;
  const MIN_DB = -100;
  const SPAN_DB = 88;

  function size() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = box.clientWidth;
    h = box.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(0, Math.floor(w / 6));
    pitch = cols ? w / cols : 6;
    const keep = (arr, v) => Array.from({ length: cols }, (_, i) => (arr[i] != null ? arr[i] : v));
    bars = keep(bars, 0);
    caps = keep(caps, 0);
    capV = keep(capV, 0);
    capT = keep(capT, 0);
    raw = keep(raw, 0);
    fill = ctx.createLinearGradient(0, h, 0, 0);
    fill.addColorStop(0, "rgba(120,10,28,0.95)");
    fill.addColorStop(0.5, "#f2334a");
    fill.addColorStop(1, "#ffd3d9");
    glow = ctx.createLinearGradient(0, 0, w * 0.5, 0);
    glow.addColorStop(0, "rgba(242,51,74,0.55)");
    glow.addColorStop(1, "rgba(242,51,74,0)");
  }

  function context() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audio) {
      audio = new Ctx();
      analyser = audio.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.45;
      spec = new Float32Array(analyser.frequencyBinCount);
      low = audio.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 160;
      bassTap = audio.createAnalyser();
      bassTap.fftSize = 1024;
      low.connect(bassTap);
      wave = new Float32Array(bassTap.fftSize);
    }
    if (audio.state === "suspended") audio.resume().catch(() => {});
    return audio;
  }

  function detach() {
    if (source) {
      source.disconnect();
      source = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (player) player.pause();
    if (playerSource) playerSource.disconnect();
    if (synth) synth.stop();
    if (synthOut) synthOut.disconnect();
    if (analyser) analyser.disconnect();
  }

  function setMode(next) {
    mode = next;
    const live = mode !== "idle";
    btn.setAttribute("aria-pressed", String(live));
    if (live) document.documentElement.dataset.music = "on";
    else delete document.documentElement.dataset.music;
    stopBtn.hidden = !live;
    toggleBtn.hidden = mode !== "file" && mode !== "synth";
    trackEl.hidden = mode !== "file" && mode !== "synth";
    if (window.BG && window.BG.setLive) window.BG.setLive(live);
    if (!live) {
      reset(ref);
      if (window.BG && window.BG.setPulse) window.BG.setPulse(0);
      if (logo) logo.style.removeProperty("--beat");
    }
    syncToggle();
    start();
  }

  function paused() {
    return mode === "synth" ? !(synth && synth.playing) : !player || player.paused;
  }

  function syncToggle() {
    if (mode !== "file" && mode !== "synth") return;
    toggleBtn.textContent = paused() ? `▶ ${t("viz.play")}` : `❚❚ ${t("viz.pause")}`;
    if (mode === "synth") trackEl.textContent = t("viz.synthName");
  }

  function useSynth() {
    closeMenu();
    if (!window.SOUNDTRACK || !context()) return toast(t("viz.unsupported"));
    detach();
    if (!synthOut) synthOut = audio.createGain();
    synthOut.connect(analyser);
    synthOut.connect(low);
    analyser.connect(audio.destination);
    if (!synth) synth = window.SOUNDTRACK.create(audio, synthOut);
    synth.start();
    source = null;
    reset(0.7);
    setMode("synth");
    toast(t("viz.synthOn"));
  }

  async function useMic() {
    closeMenu();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !context())
      return toast(t("viz.unsupported"));
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      detach();
      stream = s;
      source = audio.createMediaStreamSource(stream);
      source.connect(analyser);
      source.connect(low);
      reset(0.55);
      setMode("mic");
      toast(t("viz.micOn"));
    } catch (e) {
      toast(t("viz.denied"));
    }
  }

  function useFile(file) {
    if (!file || !context()) return;
    detach();
    if (!player) {
      player = new Audio();
      player.crossOrigin = "anonymous";
      player.addEventListener("ended", () => stop());
      player.addEventListener("play", syncToggle);
      player.addEventListener("pause", syncToggle);
      playerSource = audio.createMediaElementSource(player);
    }
    if (player.src) URL.revokeObjectURL(player.src);
    player.src = URL.createObjectURL(file);
    playerSource.disconnect();
    playerSource.connect(analyser);
    playerSource.connect(low);
    analyser.disconnect();
    analyser.connect(audio.destination);
    source = null;
    trackEl.textContent = file.name;
    reset(0.7);
    player.play().catch(() => {});
    setMode("file");
    toast(t("viz.playing", { name: file.name.replace(/\.[^.]+$/, "").slice(0, 40) }));
  }

  function stop() {
    detach();
    if (analyser) analyser.disconnect();
    setMode("idle");
    toast(t("viz.off"));
  }

  function reset(level) {
    ref = level;
    bassRef = level;
    bassEnv = 0;
    kick = 0;
    kickTarget = 0;
    scoreAvg = 0;
    peakRef = 0.05;
    recentPeak = 0;
    pending = null;
    fluxAvg = 0;
    armed = true;
    prevDb = null;
  }

  function dbAt(x) {
    const j = Math.max(1, Math.min(spec.length - 2, Math.floor(x)));
    const f = Math.min(1, Math.max(0, x - j));
    const a = spec[j] > -200 ? spec[j] : -200;
    const b = spec[j + 1] > -200 ? spec[j + 1] : -200;
    return a + (b - a) * f;
  }

  function levels(now, dt) {
    analyser.getFloatFrequencyData(spec);
    const binHz = audio.sampleRate / analyser.fftSize;
    const ratio = HI / LO;
    let top = 0;
    let bassPow = 0;
    let bassBins = 0;
    for (let i = 0; i < cols; i++) {
      const f0 = LO * Math.pow(ratio, i / cols);
      const f1 = LO * Math.pow(ratio, (i + 1) / cols);
      const fc = Math.sqrt(f0 * f1);
      let db;
      if (f1 - f0 < binHz * 1.5) db = dbAt(fc / binHz);
      else {
        db = -200;
        const k1 = Math.min(spec.length - 1, Math.ceil(f1 / binHz));
        for (let k = Math.floor(f0 / binHz); k <= k1; k++) if (spec[k] > db) db = spec[k];
      }
      if (fc > 300) db += 2.5 * Math.log2(fc / 300);
      const v = Math.min(1, Math.max(0, (db - MIN_DB) / SPAN_DB));
      raw[i] = v;
      if (v > top) top = v;
    }
    const k0 = Math.max(1, Math.floor(LO / binHz));
    const k1 = Math.ceil(150 / binHz);
    if (!prevDb || prevDb.length !== k1 + 1) prevDb = new Float32Array(k1 + 1).fill(MIN_DB);
    let flux = 0;
    for (let k = k0; k <= k1; k++) {
      const db = Math.max(MIN_DB, spec[k] > -200 ? spec[k] : -200);
      bassPow += Math.pow(10, db / 10);
      const floored = Math.max(-72, db);
      flux += Math.max(0, floored - prevDb[k]);
      prevDb[k] = floored;
      bassBins++;
    }
    flux = (flux / bassBins) * Math.min(1.5, 16.7 / Math.max(4, dt));
    const bassDb = 10 * Math.log10(bassPow / Math.max(1, bassBins) + 1e-20);
    const bassRaw = Math.min(1, Math.max(0, (bassDb - MIN_DB) / SPAN_DB));

    const fall = Math.exp(-dt / 5000);
    ref = Math.max(top, ref * fall + (1 - fall) * 0.45, 0.45);
    bassRef = Math.max(bassRaw, bassRef * fall + (1 - fall) * 0.45, 0.45);
    const range = 0.5;
    const up = 1 - Math.exp(-dt / 20);
    const down = 1 - Math.exp(-dt / 170);
    for (let i = 0; i < cols; i++) {
      const a = raw[i - 1] != null ? raw[i - 1] : raw[i];
      const c = raw[i + 1] != null ? raw[i + 1] : raw[i];
      const smooth = a * 0.2 + raw[i] * 0.6 + c * 0.2;
      const target = Math.pow(Math.min(1, Math.max(0, (smooth - (ref - range)) / range)), 1.35);
      bars[i] += (target - bars[i]) * (target > bars[i] ? up : down);
      if (bars[i] >= caps[i]) {
        caps[i] = bars[i];
        capV[i] = 0;
        capT[i] = now + 240;
      } else if (now > capT[i]) {
        capV[i] += 0.000004 * dt;
        caps[i] = Math.max(bars[i], caps[i] - capV[i] * dt);
      }
    }

    const bass = Math.pow(Math.min(1, Math.max(0, (bassRaw - (bassRef - 0.42)) / 0.42)), 1.6);
    bassEnv += (bass - bassEnv) * (bass > bassEnv ? 1 - Math.exp(-dt / 18) : 1 - Math.exp(-dt / 220));
    bassTap.getFloatTimeDomainData(wave);
    let peak = 0;
    for (let k = 0; k < wave.length; k++) {
      const v = wave[k] < 0 ? -wave[k] : wave[k];
      if (v > peak) peak = v;
    }
    recentPeak = Math.max(peak, recentPeak * Math.exp(-dt / 80));
    peakRef = Math.max(recentPeak, peakRef * Math.exp(-dt / 4000), 0.02);
    const threshold = Math.max(1.6, fluxAvg * 2.4);
    if (flux < threshold * 0.5) armed = true;
    const onset = armed && flux > threshold && bass > 0.2 && now - lastGlitch > 120;
    fluxAvg += (flux - fluxAvg) * (1 - Math.exp(-dt / 350));
    kickTarget *= Math.exp(-dt / 150);
    if (onset) {
      lastGlitch = now;
      armed = false;
      const punch = Math.min(1, (flux / threshold - 1) * 0.4 + bass * 0.6);
      kickTarget = Math.max(kickTarget, punch);
      const loud = Math.min(1, recentPeak / peakRef);
      const score = loud * 0.7 + bass * 0.3;
      const strong = loud >= 0.72 && score >= Math.max(0.55, scoreAvg * 0.85);
      scoreAvg = scoreAvg ? scoreAvg * 0.8 + score * 0.2 : score;
      fire(strong, score, punch, bass);
      pending = strong ? null : { at: now, punch };
    } else if (pending) {
      const loud = Math.min(1, recentPeak / peakRef);
      if (loud >= 0.72 && bass > 0.3) {
        fire(true, loud * 0.7 + bass * 0.3, pending.punch, bass);
        pending = null;
      } else if (now - pending.at > 90) pending = null;
    }
    kick += (kickTarget - kick) * (1 - Math.exp(-dt / 30));
    const pulse = Math.min(1, Math.max(kick, bassEnv * 0.8));
    if (window.BG && window.BG.setPulse) window.BG.setPulse(pulse);
    if (logo && document.documentElement.dataset.view === "home") logo.style.setProperty("--beat", pulse.toFixed(3));
  }

  function fire(strong, score, punch, bass) {
    if (!window.APP || !window.APP.beat) return;
    window.APP.beat({
      strong,
      power: Math.min(1, score),
      strength: strong ? 2.2 + punch * 0.4 : Math.min(1.3, 0.7 + bass * 0.4 + punch * 0.3),
      ms: strong ? 240 + punch * 120 : 110 + bass * 100,
    });
  }

  function idle(now) {
    const s = now / 1000;
    for (let i = 0; i < cols; i++) {
      const v = 0.22 + 0.16 * Math.sin(i * 0.32 + s * 1.4) + 0.08 * Math.sin(i * 0.13 - s * 2.1);
      bars[i] = Math.max(0, v);
      caps[i] = 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (!cols) return;
    const live = mode !== "idle";
    const bw = Math.max(2, pitch - 2);
    const off = (pitch - bw) / 2;
    if (live && bassEnv > 0.02) {
      ctx.globalAlpha = Math.min(1, bassEnv);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w * 0.5, h);
    }
    ctx.globalAlpha = live ? 1 : 0.32;
    ctx.fillStyle = fill;
    for (let i = 0; i < cols; i++) {
      const bh = bars[i] * h;
      if (bh < 0.5) continue;
      ctx.fillRect(i * pitch + off, h - bh, bw, bh);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    for (let y = h - 3; y > 0; y -= 3) ctx.fillRect(0, y, w, 1);
    ctx.globalCompositeOperation = "source-over";
    if (!live) return;
    ctx.fillStyle = "#ffe3e7";
    for (let i = 0; i < cols; i++) {
      if (caps[i] < 0.04) continue;
      ctx.fillRect(i * pitch + off, Math.max(0, h - caps[i] * h - 2), bw, 1.5);
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const live = mode !== "idle";
    const dt = Math.min(64, now - last);
    if (!live && dt < 33) return;
    last = now;
    if (live && analyser) levels(now, dt);
    else idle(now);
    draw();
  }

  function start() {
    const visible = box.offsetWidth > 0 && !document.hidden;
    if ((reduceMotion || document.documentElement.dataset.perf === "lite") && mode === "idle") {
      cancelAnimationFrame(raf);
      raf = 0;
      idle(0);
      draw();
      return;
    }
    if (visible && !raf) raf = requestAnimationFrame(frame);
    if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function openMenu() {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });
  menu.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (event) => event.key === "Escape" && closeMenu());
  micBtn.addEventListener("click", useMic);
  fileBtn.addEventListener("click", () => {
    context();
    input.click();
  });
  input.addEventListener("change", () => {
    closeMenu();
    useFile(input.files && input.files[0]);
    input.value = "";
  });
  toggleBtn.addEventListener("click", () => {
    if (mode === "synth" && synth) {
      if (synth.playing) synth.stop();
      else synth.start();
      syncToggle();
      return;
    }
    if (!player) return;
    if (player.paused) player.play().catch(() => {});
    else player.pause();
  });
  if (synthBtn) synthBtn.addEventListener("click", useSynth);

  try {
    if (!localStorage.getItem("vizHint") && !reduceMotion)
      setTimeout(() => {
        if (mode !== "idle" || document.hidden) return;
        localStorage.setItem("vizHint", "1");
        btn.classList.add("is-hint");
        toast(t("viz.hint"));
        setTimeout(() => btn.classList.remove("is-hint"), 6000);
      }, 12000);
  } catch (e) {}
  stopBtn.addEventListener("click", () => {
    closeMenu();
    stop();
  });
  document.addEventListener("langchange", syncToggle);
  document.addEventListener("visibilitychange", start);
  document.addEventListener("perfchange", start);
  window.addEventListener("resize", () => {
    size();
    start();
  });

  size();
  start();
})();
