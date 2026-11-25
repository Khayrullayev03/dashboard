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
  let sense = null;
  let low = null;
  let kickTap = null;
  let midTap = null;
  let kickBuf = null;
  let midBuf = null;
  let detector = null;
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
  let ref = 0.7;
  let bassRef = 0.7;
  let bassEnv = 0;
  let kick = 0;
  let kickTarget = 0;
  let kSlow = 0;
  let mSlow = 0;
  let kPeak = 1e-6;
  let kPrev1 = 0;
  let kPrev2 = 0;
  let kArmed = true;
  let lastKick = 0;
  let lastKickE = 0;

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
      // Every source feeds `sense`, which splits into a sub band (kick drum) and a low-mid band (bass notes).
      sense = audio.createGain();
      const band = (type, frequency, q) => {
        const f = audio.createBiquadFilter();
        f.type = type;
        f.frequency.value = frequency;
        f.Q.value = q;
        return f;
      };
      const tap = () => {
        const a = audio.createAnalyser();
        a.fftSize = 512;
        return a;
      };
      const hp = band("highpass", 35, 0.7);
      low = band("lowpass", 150, 0.8);
      kickTap = tap();
      sense.connect(hp);
      hp.connect(low);
      low.connect(kickTap);
      const mid = band("bandpass", 350, 0.9);
      midTap = tap();
      sense.connect(mid);
      mid.connect(midTap);
      kickBuf = new Float32Array(kickTap.fftSize);
      midBuf = new Float32Array(midTap.fftSize);
      // The same detection on the audio thread, immune to dropped video frames.
      if (audio.audioWorklet && window.AudioWorkletNode)
        audio.audioWorklet
          .addModule("assets/js/kick-worklet.js")
          .then(() => {
            const node = new AudioWorkletNode(audio, "kick-detector", { outputChannelCount: [1] });
            const mute = audio.createGain();
            mute.gain.value = 0;
            sense.connect(node);
            node.connect(mute);
            mute.connect(audio.destination);
            node.port.onmessage = onKick;
            detector = node;
          })
          .catch(() => {});
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
    saveState();
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

  function useSynth(opts = {}) {
    closeMenu();
    if (!window.SOUNDTRACK || !context()) return opts.resume ? null : toast(t("viz.unsupported"));
    detach();
    if (!synthOut) synthOut = audio.createGain();
    synthOut.connect(analyser);
    synthOut.connect(sense);
    analyser.connect(audio.destination);
    if (!synth) synth = window.SOUNDTRACK.create(audio, synthOut);
    if (!opts.paused) synth.start(opts.step);
    source = null;
    reset(0.7);
    setMode("synth");
    if (!opts.resume) toast(t("viz.synthOn"));
    else if (!opts.paused) whenAllowed();
  }

  async function useMic(opts = {}) {
    closeMenu();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !context())
      return opts.resume ? null : toast(t("viz.unsupported"));
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      detach();
      stream = s;
      source = audio.createMediaStreamSource(stream);
      source.connect(analyser);
      source.connect(sense);
      reset(0.55);
      setMode("mic");
      if (opts.resume) whenAllowed();
      else toast(t("viz.micOn"));
    } catch (e) {
      if (!opts.resume) toast(t("viz.denied"));
    }
  }

  function useFile(file, opts = {}) {
    if (!file || !context()) return;
    const name = opts.name || file.name || "track";
    if (!opts.resume) saveTrack(file, name);
    detach();
    if (!player) {
      player = new Audio();
      player.crossOrigin = "anonymous";
      player.addEventListener("ended", () => stop());
      player.addEventListener("play", () => {
        syncToggle();
        saveState();
      });
      player.addEventListener("pause", () => {
        syncToggle();
        saveState();
      });
      playerSource = audio.createMediaElementSource(player);
    }
    if (player.src) URL.revokeObjectURL(player.src);
    player.src = URL.createObjectURL(file);
    playerSource.disconnect();
    playerSource.connect(analyser);
    playerSource.connect(sense);
    analyser.disconnect();
    analyser.connect(audio.destination);
    source = null;
    trackEl.textContent = name;
    reset(0.7);
    if (opts.pos > 0) player.addEventListener("loadedmetadata", () => (player.currentTime = opts.pos), { once: true });
    wantPlay = !opts.paused;
    if (wantPlay) player.play().catch(() => opts.resume && whenAllowed(true));
    setMode("file");
    if (!opts.resume) toast(t("viz.playing", { name: name.replace(/\.[^.]+$/, "").slice(0, 40) }));
    else if (wantPlay) whenAllowed();
  }

  /* ---------- keep the music going across page reloads ---------- */

  const STATE_KEY = "vizState";
  let wantPlay = false;
  let gestureArmed = false;

  // Browsers only let sound start after a click or key press; until then, wait for the first one.
  function whenAllowed(blocked) {
    const ready = () => audio && audio.state === "running" && !blocked;
    const arm = () => {
      if (ready() || gestureArmed) return;
      gestureArmed = true;
      toast(t("viz.resume"));
      const go = () => {
        ["pointerdown", "keydown", "touchend"].forEach((type) => document.removeEventListener(type, go, true));
        gestureArmed = false;
        context();
        if (mode === "file" && player && wantPlay) player.play().catch(() => {});
      };
      ["pointerdown", "keydown", "touchend"].forEach((type) => document.addEventListener(type, go, true));
    };
    if (blocked) arm();
    else setTimeout(arm, 350);
  }

  function saveState() {
    try {
      if (mode === "idle") return localStorage.removeItem(STATE_KEY);
      const state = {
        mode,
        paused: mode === "file" ? !wantPlay : mode === "synth" ? !(synth && synth.playing) : false,
        at: Date.now(),
      };
      if (mode === "synth" && synth) state.step = synth.step;
      if (mode === "file" && player) state.pos = player.currentTime || 0;
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function trackDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("no idb"));
      const req = indexedDB.open("viz", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("track");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function saveTrack(file, name) {
    if (file.size > 80 * 1024 * 1024) return;
    trackDb()
      .then((db) => db.transaction("track", "readwrite").objectStore("track").put({ blob: file, name }, "last"))
      .catch(() => {});
  }

  function loadTrack() {
    return trackDb().then(
      (db) =>
        new Promise((resolve) => {
          const req = db.transaction("track").objectStore("track").get("last");
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        })
    );
  }

  async function restore() {
    let state = null;
    try {
      state = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    } catch (e) {}
    if (!state || Date.now() - state.at > 3 * 3600 * 1000) return;
    if (state.mode === "synth") useSynth({ resume: true, step: state.step, paused: state.paused });
    else if (state.mode === "file") {
      const rec = await loadTrack().catch(() => null);
      if (rec && rec.blob) useFile(rec.blob, { resume: true, name: rec.name, pos: state.pos, paused: state.paused });
    } else if (state.mode === "mic" && navigator.permissions) {
      const perm = await navigator.permissions.query({ name: "microphone" }).catch(() => null);
      if (perm && perm.state === "granted") useMic({ resume: true });
    }
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
    kSlow = 0;
    mSlow = 0;
    kPeak = 1e-6;
    kPrev1 = 0;
    kPrev2 = 0;
    kArmed = true;
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
    for (let k = k0; k <= k1; k++) {
      const db = Math.max(MIN_DB, spec[k] > -200 ? spec[k] : -200);
      bassPow += Math.pow(10, db / 10);
      bassBins++;
    }
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
    if (mode === "synth") synthKicks(now);
    else if (!detector) detectKick(now, dt);
    kickTarget *= Math.exp(-dt / 160);
    kick += (kickTarget - kick) * (1 - Math.exp(-dt / 25));
    const pulse = Math.min(1, Math.max(kick, bassEnv * 0.45));
    if (window.BG && window.BG.setPulse) window.BG.setPulse(pulse);
    if (logo && document.documentElement.dataset.view === "home") logo.style.setProperty("--beat", pulse.toFixed(3));
  }

  const latency = () => Math.min(0.25, Math.max(0, (audio.outputLatency || 0) + (audio.baseLatency || 0)));

  // Kick from the audio-thread detector: show it when that moment actually reaches the speakers.
  function onKick(event) {
    if (mode !== "file" && mode !== "mic") return;
    const { t, level } = event.data;
    const wait = (t + (mode === "mic" ? 0 : latency()) - audio.currentTime) * 1000;
    const go = () => mode !== "idle" && hitKick(performance.now(), level);
    if (wait > 4) setTimeout(go, Math.min(wait, 300));
    else go();
  }

  // Site soundtrack: fire exactly on the scheduled kicks, compensating for output latency.
  function synthKicks(now) {
    if (!synth || !synth.takeHits) return;
    const at = audio.currentTime - latency();
    const hit = synth
      .takeHits(at)
      .filter((h) => at - h.t < 0.15)
      .pop();
    if (hit) hitKick(now, hit.level);
  }

  function energy(tap, buf) {
    tap.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return sum / buf.length;
  }

  // Own track / microphone: a kick is a sudden jump of low energy (35–150 Hz, which also catches the
  // kick's falling pitch) that the band around 350 Hz does not share. Bass notes bring harmonics
  // there, so they are ignored.
  function detectKick(now, dt) {
    const e = energy(kickTap, kickBuf);
    const m = energy(midTap, midBuf);
    const ratio = e / (kSlow + 1e-7);
    const midRatio = m / (mSlow + 1e-7);
    kPeak = Math.max(e, kPeak * Math.exp(-dt / 6000), 1e-6);
    if (ratio < 1.25) kArmed = true;
    const loud = e / kPeak;
    // a clearly bigger hit may override a recent weaker trigger (a bass note just before the kick)
    const free = now - lastKick > 150 || e > lastKickE * 1.8;
    if (kArmed && free && e > kPrev2 * 1.45 && ratio > 1.9 && loud > 0.4 && ratio > midRatio) {
      kArmed = false;
      lastKickE = e;
      hitKick(now, Math.min(1, Math.sqrt(loud)));
    } else if (!kArmed && free && e > lastKickE * 1.8 && e > kPrev2 * 1.45 && loud > 0.4) {
      lastKickE = e;
      hitKick(now, Math.min(1, Math.sqrt(loud)));
    }
    const slow = 1 - Math.exp(-dt / 450);
    kSlow += (e - kSlow) * slow;
    mSlow += (m - mSlow) * slow;
    kPrev2 = kPrev1;
    kPrev1 = e;
  }

  function hitKick(now, level) {
    lastKick = now;
    kickTarget = Math.max(kickTarget, 0.55 + level * 0.45);
    fire(level >= 0.85, level);
  }

  function fire(strong, level) {
    if (!window.APP || !window.APP.beat) return;
    window.APP.beat({
      strong,
      power: Math.min(1, 0.45 + level * 0.55),
      strength: strong ? 2.5 : 1.2 + level * 0.6,
      ms: strong ? 320 : 170 + level * 90,
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
    ctx.globalAlpha = live ? 1 : 0.32;
    ctx.fillStyle = fill;
    for (let i = 0; i < cols; i++) {
      const bh = bars[i] * h;
      if (bh < 0.5) continue;
      ctx.fillRect(i * pitch + off, h - bh, bw, bh);
    }
    if (live && kick > 0.05) {
      ctx.globalAlpha = Math.min(0.6, kick * 0.6);
      ctx.fillStyle = "#ffe3e7";
      for (let i = 0; i < cols; i++) {
        const bh = bars[i] * h;
        if (bh >= 0.5) ctx.fillRect(i * pitch + off, h - bh, bw, bh);
      }
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
      saveState();
      return;
    }
    if (!player) return;
    wantPlay = player.paused;
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

  setInterval(() => mode !== "idle" && !document.hidden && saveState(), 2000);
  window.addEventListener("pagehide", saveState);

  size();
  start();
  restore();
})();
