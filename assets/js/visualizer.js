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
  const fileBtn = menu.querySelector("[data-viz-file]");
  const toggleBtn = menu.querySelector("[data-viz-toggle]");
  const stopBtn = menu.querySelector("[data-viz-stop]");
  const trackEl = menu.querySelector("[data-viz-track]");
  const input = menu.querySelector("[data-viz-input]");
  const logo = document.querySelector("[data-home-logo]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RAMP = " ▁▂▃▄▅▆▇█";
  const toast = (msg) => window.APP && window.APP.toast && window.APP.toast(msg);

  let audio = null;
  let analyser = null;
  let source = null;
  let stream = null;
  let player = null;
  let playerSource = null;
  let bins = null;
  let mode = "idle";
  let raf = 0;
  let last = 0;
  let peak = 0.35;
  let beat = 0;
  let avgBass = 0;
  let prevHit = 0;
  let lastGlitch = 0;
  let bars = [];
  let cols = 0;
  let w = 0;
  let h = 0;

  function size() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = box.clientWidth;
    h = box.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(0, Math.floor(w / 8));
    bars = Array.from({ length: cols }, (_, i) => bars[i] || 0);
  }

  function context() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audio) {
      audio = new Ctx();
      analyser = audio.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.68;
      analyser.minDecibels = -85;
      analyser.maxDecibels = -20;
      bins = new Uint8Array(analyser.frequencyBinCount);
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
    if (analyser) analyser.disconnect();
  }

  function setMode(next) {
    mode = next;
    const live = mode !== "idle";
    btn.setAttribute("aria-pressed", String(live));
    if (live) document.documentElement.dataset.music = "on";
    else delete document.documentElement.dataset.music;
    stopBtn.hidden = !live;
    toggleBtn.hidden = mode !== "file";
    trackEl.hidden = mode !== "file";
    if (window.BG && window.BG.setLive) window.BG.setLive(live);
    if (!live) {
      beat = 0;
      if (window.BG && window.BG.setPulse) window.BG.setPulse(0);
      if (logo) logo.style.removeProperty("--beat");
    }
    syncToggle();
    start();
  }

  function syncToggle() {
    if (!player) return;
    toggleBtn.textContent = player.paused ? `▶ ${t("viz.play")}` : `❚❚ ${t("viz.pause")}`;
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
      peak = 0.25;
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
    analyser.disconnect();
    analyser.connect(audio.destination);
    source = null;
    trackEl.textContent = file.name;
    peak = 0.5;
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

  function levels() {
    analyser.getByteFrequencyData(bins);
    const rate = audio.sampleRate;
    const n = analyser.fftSize;
    const lo = 40;
    const hi = 12000;
    let max = 0;
    for (let i = 0; i < cols; i++) {
      const f0 = lo * Math.pow(hi / lo, i / cols);
      const f1 = lo * Math.pow(hi / lo, (i + 1) / cols);
      const a = Math.max(1, Math.floor((f0 * n) / rate));
      const b = Math.max(a + 1, Math.ceil((f1 * n) / rate));
      let v = 0;
      for (let k = a; k < b && k < bins.length; k++) v = Math.max(v, bins[k]);
      v = Math.pow(Math.max(0, (v / 255 - 0.12) / 0.88), 1.5);
      max = Math.max(max, v);
      bars[i] = Math.max(v, bars[i] * 0.86);
    }
    peak = Math.max(max, peak * 0.995, 0.25);
    let bass = 0;
    const b0 = Math.floor((40 * n) / rate);
    const b1 = Math.max(b0 + 1, Math.ceil((160 * n) / rate));
    for (let k = b0; k < b1; k++) bass += bins[k];
    bass = bass / (b1 - b0) / 255;
    avgBass = avgBass * 0.96 + bass * 0.04;
    const hit = Math.min(1, Math.max(0, (bass - avgBass * 1.04) * 6) + Math.max(0, bass - 0.75));
    beat = hit > beat ? hit : beat * 0.88;
    const now = performance.now();
    if (hit > 0.3 && hit - prevHit > 0.1 && now - lastGlitch > 160 && window.APP && window.APP.logoGlitch) {
      lastGlitch = now;
      window.APP.logoGlitch(0.8 + hit * 1.6, 150 + hit * 170);
    }
    prevHit = hit;
    if (window.BG && window.BG.setPulse) window.BG.setPulse(beat);
    if (logo && document.documentElement.dataset.view === "home") logo.style.setProperty("--beat", beat.toFixed(3));
  }

  function idle(now) {
    const s = now / 1000;
    for (let i = 0; i < cols; i++) {
      const v = 0.12 + 0.1 * Math.sin(i * 0.45 + s * 1.6) + 0.06 * Math.sin(i * 0.17 - s * 2.3);
      bars[i] = Math.max(0, v);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (!cols) return;
    const live = mode !== "idle";
    const rowH = h / 2;
    ctx.font = `700 ${(6.4 / 0.6).toFixed(2)}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "bottom";
    const scale = mode === "mic" ? 1 / peak : 1;
    for (let i = 0; i < cols; i++) {
      const level = Math.min(16, Math.round(Math.min(1, bars[i] * scale) * 16));
      if (!level) continue;
      const x = i * 8 + 0.8;
      const hot = level > 12;
      ctx.globalAlpha = live ? 1 : 0.35;
      ctx.fillStyle = live ? "rgba(242,51,74,0.95)" : "rgba(242,51,74,0.8)";
      ctx.fillText(RAMP[Math.min(8, level)], x, h);
      if (level > 8) {
        ctx.fillStyle = hot ? "#ffe3e7" : "rgba(255,140,155,0.95)";
        ctx.fillText(RAMP[level - 8], x, h - rowH);
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const live = mode !== "idle";
    if (now - last < (live ? 16 : 70)) return;
    last = now;
    if (live && analyser) levels();
    else idle(now);
    draw();
  }

  function start() {
    const visible = box.offsetWidth > 0 && !document.hidden;
    if (reduceMotion && mode === "idle") {
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
    if (!player) return;
    if (player.paused) player.play().catch(() => {});
    else player.pause();
  });
  stopBtn.addEventListener("click", () => {
    closeMenu();
    stop();
  });
  document.addEventListener("langchange", syncToggle);
  document.addEventListener("visibilitychange", start);
  window.addEventListener("resize", () => {
    size();
    start();
  });

  size();
  start();
})();
