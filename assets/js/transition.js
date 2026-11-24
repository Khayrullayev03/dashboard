(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GLYPHS = "01<>/\\[]{}=+*#%&@$ABCDEFXYZ░▒▓";
  const FONT = '"JetBrains Mono", monospace';

  const canvas = document.createElement("canvas");
  canvas.className = "page-wipe";
  canvas.setAttribute("aria-hidden", "true");
  canvas.hidden = true;
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");

  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const hash = (s) => {
    const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const out = (p) => 1 - Math.pow(1 - p, 3);
  const inn = (p) => p * p * p;
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const sound = (fn) => window.SOUND && window.SOUND.enabled && fn(window.SOUND);
  const later = (ms, fn) => setTimeout(fn, ms);

  function layer(w, h, dpr, paint) {
    const c = document.createElement("canvas");
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(g);
    return c;
  }

  function setup(origin, target) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = {
      bg: css("--bg", "#050506"),
      accent: css("--accent", "#f2334a"),
      bright: css("--bright", "#f6f6f8"),
      text: css("--text", "#d8d9dd"),
      muted: css("--muted", "#8f9198"),
    };
    const bg = layer(w, h, dpr, (g) => {
      g.fillStyle = colors.bg;
      g.fillRect(0, 0, w, h);
      g.font = `600 13px ${FONT}`;
      g.textBaseline = "top";
      g.fillStyle = colors.accent;
      for (let y = 0, i = 0; y < h; y += 18) {
        for (let x = 0; x < w; x += 11, i++) {
          if (hash(i) < 0.09) {
            g.globalAlpha = 0.1 + hash(i + 3) * 0.12;
            g.fillText(GLYPHS[(hash(i + 9) * GLYPHS.length) | 0], x, y);
          }
        }
      }
      g.globalAlpha = 1;
    });
    const base = layer(w, h, dpr, (g) => {
      g.fillStyle = colors.bg;
      g.fillRect(0, 0, w, h);
      const top = g.createRadialGradient(w * 0.7, 0, 0, w * 0.7, 0, Math.max(w, h) * 1.1);
      top.addColorStop(0, "rgba(40,6,12,0.9)");
      top.addColorStop(1, "rgba(5,5,6,0)");
      g.fillStyle = top;
      g.fillRect(0, 0, w, h);
      [
        [0.1, 0.28, 0.38, "rgba(242,51,74,0.13)"],
        [0.92, 0.78, 0.34, "rgba(150,20,70,0.16)"],
      ].forEach(([fx, fy, r, c]) => {
        const aura = g.createRadialGradient(w * fx, h * fy, 0, w * fx, h * fy, Math.max(w, h) * r);
        aura.addColorStop(0, c);
        aura.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = aura;
        g.fillRect(0, 0, w, h);
      });
    });
    const live = [...document.querySelectorAll("canvas.ascii-bg")];
    return { w, h, dpr, colors, bg, base, live, origin, target, label: target === "home" ? "cd ~" : `cd ~/${target}` };
  }

  function cover(st, x = 0, y = 0, w = st.w, h = st.h, src = st.bg) {
    const sx = clamp(x, 0, st.w);
    const sy = clamp(y, 0, st.h);
    const sw = clamp(x + w, 0, st.w) - sx;
    const sh = clamp(y + h, 0, st.h) - sy;
    if (sw <= 0 || sh <= 0) return;
    if (src !== st.bg) {
      ctx.drawImage(src, sx * st.dpr, sy * st.dpr, sw * st.dpr, sh * st.dpr, sx, sy, sw, sh);
      return;
    }
    ctx.drawImage(st.base, sx * st.dpr, sy * st.dpr, sw * st.dpr, sh * st.dpr, sx, sy, sw, sh);
    st.live.forEach((c) => {
      const k = c.width / st.w;
      if (k > 0) ctx.drawImage(c, sx * k, sy * k, sw * k, sh * k, sx, sy, sw, sh);
    });
  }

  function command(st, text, p, y = st.h / 2) {
    const size = Math.max(16, Math.min(26, st.w / 40));
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.textBaseline = "middle";
    const shown = text.slice(0, Math.ceil(text.length * clamp(p * 1.7)));
    const full = ctx.measureText(text).width;
    const x = (st.w - full) / 2;
    ctx.fillStyle = st.colors.accent;
    ctx.fillText("$ ", x - ctx.measureText("$ ").width, y);
    ctx.fillStyle = st.colors.bright;
    ctx.fillText(shown, x, y);
    if (Math.floor(performance.now() / 260) % 2 === 0) {
      ctx.fillStyle = st.colors.accent;
      ctx.fillRect(x + ctx.measureText(shown).width + 2, y - size * 0.45, size * 0.45, size * 0.9);
    }
  }

  function lines(st, list, p, x, y, size = 14, gap = 22) {
    ctx.font = `600 ${size}px ${FONT}`;
    ctx.textBaseline = "top";
    const total = list.reduce((n, l) => n + l.length, 0);
    let budget = Math.floor(total * clamp(p * 1.25));
    list.forEach((line, i) => {
      if (budget <= 0) return;
      const part = line.slice(0, budget);
      budget -= line.length;
      const ok = part.indexOf("[ OK ]");
      if (ok === 0) {
        ctx.fillStyle = st.colors.accent;
        ctx.fillText(part.slice(0, 6), x, y + i * gap);
        ctx.fillStyle = st.colors.text;
        ctx.fillText(part.slice(6), x + ctx.measureText("[ OK ]").width, y + i * gap);
      } else {
        ctx.fillStyle = i === 0 ? st.colors.bright : st.colors.text;
        ctx.fillText(part, x, y + i * gap);
      }
    });
  }

  const wave = {
    cover: 400,
    hold: 220,
    reveal: 560,
    init(st) {
      const cols = Math.ceil(st.w / 11);
      const rows = Math.ceil(st.h / 18);
      const ox = st.origin.x / 11;
      const oy = st.origin.y / 18;
      const far = Math.max(
        Math.hypot(ox, oy * 1.6),
        Math.hypot(cols - ox, oy * 1.6),
        Math.hypot(ox, (rows - oy) * 1.6),
        Math.hypot(cols - ox, (rows - oy) * 1.6)
      );
      st.cols = cols;
      st.delay = new Float32Array(cols * rows);
      for (let i = 0; i < st.delay.length; i++) {
        st.delay[i] = (Math.hypot((i % cols) - ox, (((i / cols) | 0) - oy) * 1.6) / far) * 0.78 + hash(i) * 0.14;
      }
    },
    grid(st, p, covering) {
      const front = 0.1;
      ctx.font = `600 13px ${FONT}`;
      ctx.textBaseline = "top";
      for (let i = 0; i < st.delay.length; i++) {
        const d = st.delay[i];
        const x = (i % st.cols) * 11;
        const y = ((i / st.cols) | 0) * 18;
        if (covering ? p >= d + front : p < d) cover(st, x, y, 11, 18);
        else if (p >= d && p < d + front) {
          ctx.fillStyle = (p - d) / front < 0.35 ? st.colors.bright : st.colors.accent;
          ctx.fillText(glyph(), x + 1, y + 2);
        }
      }
    },
    drawCover(st, p) {
      this.grid(st, inOut(p) * 1.1, true);
    },
    drawHold(st, p) {
      cover(st);
      command(st, st.label, p);
    },
    drawReveal(st, p) {
      this.grid(st, inOut(p) * 1.1, false);
    },
  };

  const boot = {
    cover: 420,
    hold: 620,
    reveal: 480,
    onStart: () => sound((s) => s.tone(180, 0.35, "sawtooth", 0.02)),
    onSwap: () => sound((s) => s.tone(660, 0.14, "triangle", 0.04)),
    drawCover(st, p) {
      const q = inOut(p);
      const { w, h } = st;
      if (q < 0.8) {
        const band = (1 - q / 0.8) * h;
        const top = (h - band) / 2;
        cover(st, 0, 0, w, top);
        cover(st, 0, top + band, w, h - top - band);
        ctx.fillStyle = st.colors.bright;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, top - 1, w, 2);
        ctx.fillRect(0, top + band - 1, w, 2);
        ctx.globalAlpha = 1;
      } else {
        cover(st);
        const k = (q - 0.8) / 0.2;
        const lw = Math.max(6, w * (1 - k));
        ctx.shadowColor = st.colors.bright;
        ctx.shadowBlur = 24;
        ctx.fillStyle = st.colors.bright;
        ctx.fillRect((w - lw) / 2, h / 2 - 1, lw, 2);
        ctx.shadowBlur = 0;
      }
    },
    drawHold(st, p) {
      cover(st);
      const { w, h } = st;
      ctx.shadowColor = st.colors.bright;
      ctx.shadowBlur = 18;
      ctx.fillStyle = st.colors.bright;
      ctx.globalAlpha = Math.max(0, 1 - p * 3);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      const list = [
        "anvar-os 2.0 · boot",
        "[ OK ] kernel",
        "[ OK ] network · LAN · VPN",
        `[ OK ] services · ${((window.PORTFOLIO || {}).services || []).length} units`,
        "[ OK ] moon.render",
        "login: anvarjon ✓",
      ];
      const size = w < 600 ? 13 : 15;
      const x = Math.max(20, w / 2 - (w < 600 ? 150 : 190));
      lines(st, list, p, x, h / 2 - list.length * 12, size, size + 9);
      const step = Math.floor(p * list.length * 1.25);
      if (step !== this.step) {
        this.step = step;
        sound((s) => s.key());
      }
    },
    drawReveal(st, p) {
      const q = out(p);
      const { w, h } = st;
      cover(st);
      ctx.globalCompositeOperation = "destination-out";
      let bw = w;
      let bh = Math.max(2, ((q - 0.25) / 0.75) * h);
      if (q < 0.25) {
        bw = Math.max(6, (w * q) / 0.25);
        bh = 2;
      }
      ctx.fillRect((w - bw) / 2, (h - bh) / 2, bw, bh);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = st.colors.bright;
      ctx.globalAlpha = 1 - q;
      ctx.fillRect((w - bw) / 2, (h - bh) / 2 - 1, bw, 2);
      ctx.fillRect((w - bw) / 2, (h + bh) / 2 - 1, bw, 2);
      ctx.globalAlpha = 1;
    },
  };

  const fiber = {
    cover: 560,
    hold: 640,
    reveal: 640,
    init(st) {
      const { w, h, origin } = st;
      st.far = Math.max(
        Math.hypot(origin.x, origin.y),
        Math.hypot(w - origin.x, origin.y),
        Math.hypot(origin.x, h - origin.y),
        Math.hypot(w - origin.x, h - origin.y)
      );
      st.strands = Array.from({ length: w < 700 ? 34 : 56 }, (_, i) => {
        const a = (i / (w < 700 ? 34 : 56)) * Math.PI * 2 + (hash(i * 3.3) - 0.5) * 0.25;
        return { a, speed: 0.7 + hash(i * 7.1) * 0.6, lag: hash(i * 1.9) * 0.25, hot: hash(i * 5.5) > 0.7 };
      });
      st.rowH = 22;
      st.rows = Array.from({ length: Math.ceil(h / st.rowH) }, (_, i) => ({
        lag: hash(i * 4.7) * 0.32,
        speed: 1 + hash(i * 8.3) * 0.45,
      }));
    },
    onStart: () => {
      for (let i = 0; i < 5; i++) later(i * 60, () => sound((s) => s.tone(700 + i * 160, 0.05, "sine", 0.025)));
    },
    onSwap: () => sound((s) => s.tone(1200, 0.18, "triangle", 0.03)),
    strands(st, p, alpha) {
      const { origin, far } = st;
      st.strands.forEach((f, i) => {
        const local = clamp((p - f.lag) / (1 - f.lag));
        if (local <= 0) return;
        const len = out(local) * far * f.speed * 1.15;
        const x2 = origin.x + Math.cos(f.a) * len;
        const y2 = origin.y + Math.sin(f.a) * len;
        const g = ctx.createLinearGradient(origin.x, origin.y, x2, y2);
        g.addColorStop(0, "rgba(242,51,74,0)");
        g.addColorStop(0.75, f.hot ? "rgba(255,150,165,0.55)" : "rgba(242,51,74,0.45)");
        g.addColorStop(1, f.hot ? "rgba(255,255,255,0.95)" : "rgba(255,120,135,0.9)");
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = g;
        ctx.lineWidth = f.hot ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        const k = (performance.now() / 600 + i * 0.37) % 1;
        ctx.fillStyle = st.colors.bright;
        ctx.beginPath();
        ctx.arc(
          origin.x + Math.cos(f.a) * len * k,
          origin.y + Math.sin(f.a) * len * k,
          f.hot ? 2.4 : 1.6,
          0,
          Math.PI * 2
        );
        ctx.fill();
        if (f.hot) {
          ctx.shadowColor = st.colors.bright;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(x2, y2, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      ctx.globalAlpha = 1;
    },
    drawCover(st, p) {
      const { origin, far } = st;
      ctx.save();
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, inOut(clamp(p * 1.1)) * far, 0, Math.PI * 2);
      ctx.clip();
      cover(st);
      ctx.restore();
      this.strands(st, p, 1);
    },
    drawHold(st, p) {
      cover(st);
      this.strands(st, 1, 1 - out(p));
      const services = ((window.PORTFOLIO || {}).services || []).map((s) => s.id);
      const pick = services.slice(0, 6);
      const list = [
        "$ systemctl start services",
        ...pick.map((id) => `[ OK ] Started ${id}.service`),
        `● ${services.length} units active`,
      ];
      const size = st.w < 600 ? 13 : 15;
      const x = Math.max(18, st.w / 2 - (st.w < 600 ? 150 : 200));
      lines(st, list, p * 1.15, x, st.h / 2 - list.length * ((size + 9) / 2), size, size + 9);
    },
    drawReveal(st, p) {
      const { w, rowH } = st;
      st.rows.forEach((r, i) => {
        const y = i * rowH;
        const local = clamp((p - r.lag) / (1 - r.lag));
        const x = inOut(clamp(local * r.speed)) * (w + 200) - 40;
        cover(st, Math.max(0, x), y, w - Math.max(0, x), rowH);
        if (local <= 0 || x > w + 40) return;
        const g = ctx.createLinearGradient(x - 160, 0, x, 0);
        g.addColorStop(0, "rgba(242,51,74,0)");
        g.addColorStop(1, "rgba(255,170,180,0.95)");
        ctx.fillStyle = g;
        ctx.fillRect(x - 160, y + rowH / 2 - 1, 160, 2);
        ctx.shadowColor = st.colors.bright;
        ctx.shadowBlur = 12;
        ctx.fillStyle = st.colors.bright;
        ctx.fillRect(x - 3, y + rowH / 2 - 2, 6, 4);
        ctx.shadowBlur = 0;
      });
    },
  };

  const scan = {
    cover: 300,
    hold: 420,
    reveal: 780,
    onStart: () => sound((s) => s.tone(900, 0.6, "sine", 0.015)),
    onSwap: () => later(520, () => sound((s) => s.tone(1500, 0.1, "triangle", 0.04))),
    drawCover(st, p) {
      ctx.globalAlpha = out(p);
      cover(st);
      ctx.globalAlpha = 1;
    },
    drawHold(st, p) {
      cover(st);
      const { w, h } = st;
      ctx.font = `700 ${w < 600 ? 15 : 18}px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = st.colors.accent;
      ctx.fillText("IDENTITY SCAN", w / 2, h / 2 - 34);
      ctx.fillStyle = st.colors.muted;
      ctx.font = `600 13px ${FONT}`;
      ctx.fillText("subject: anvarjon · sysadmin", w / 2, h / 2 + 34);
      ctx.textAlign = "left";
      const bw = Math.min(320, w - 60);
      const x = (w - bw) / 2;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(x, h / 2 - 5, bw, 10);
      ctx.fillStyle = st.colors.accent;
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 14;
      ctx.fillRect(x, h / 2 - 5, bw * out(p), 10);
      ctx.shadowBlur = 0;
    },
    drawReveal(st, p) {
      const { w, h } = st;
      const beam = inOut(p) * (w + 60) - 30;
      cover(st, beam, 0, w - beam, h);
      const grad = ctx.createLinearGradient(beam - 120, 0, beam, 0);
      grad.addColorStop(0, "rgba(242,51,74,0)");
      grad.addColorStop(1, "rgba(242,51,74,0.28)");
      ctx.fillStyle = grad;
      ctx.fillRect(beam - 120, 0, 120, h);
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 24;
      ctx.fillStyle = st.colors.accent;
      ctx.fillRect(beam - 1, 0, 3, h);
      ctx.shadowBlur = 0;
      ctx.font = `600 13px ${FONT}`;
      ctx.textBaseline = "top";
      for (let y = 0; y < h; y += 18) {
        ctx.fillStyle = Math.random() < 0.3 ? st.colors.bright : st.colors.accent;
        ctx.fillText(glyph(), beam - 14, y);
      }
      const labels = [
        ["IDENTITY: VERIFIED ✓", 0.3],
        ["ROLE: SYSADMIN", 0.48],
        ["ACCESS: GRANTED", 0.66],
      ];
      const fade = 1 - clamp((p - 0.82) / 0.18);
      ctx.font = `700 ${w < 600 ? 14 : 18}px ${FONT}`;
      ctx.textBaseline = "middle";
      labels.forEach(([text, f]) => {
        const x = Math.max(20, w * 0.1);
        const y = h * f;
        let shown = "";
        for (let i = 0; i < text.length; i++) {
          if (x + ctx.measureText(text.slice(0, i + 1)).width < beam - 20) shown = text.slice(0, i + 1);
        }
        if (!shown) return;
        ctx.globalAlpha = fade;
        ctx.fillStyle = "rgba(5,5,6,0.82)";
        ctx.fillRect(x - 10, y - 16, ctx.measureText(shown).width + 20, 32);
        ctx.fillStyle = shown.includes("✓") || shown.includes("GRANTED") ? st.colors.accent : st.colors.bright;
        ctx.fillText(shown, x, y);
        ctx.globalAlpha = 1;
      });
    },
  };

  const globe = {
    cover: 420,
    hold: 1700,
    reveal: 720,
    init(st) {
      const small = st.w < 700;
      st.R = Math.min(st.w, st.h) * (small ? 0.34 : 0.3);
      st.cx = small ? st.w / 2 : st.w / 2 - st.R * 0.55;
      st.cy = small ? st.h * 0.36 : st.h / 2;
      st.cw = small ? 7 : 8;
      st.chh = small ? 11 : 13;
      st.t0 = performance.now();
      st.spinMs = this.cover + this.hold * 0.55;
      st.geo = null;
      const fallback = { lat: 41.3, lon: 69.24, city: "Tashkent", country: "Uzbekistan", ip: null };
      const geo = window.GEO;
      const estimate = geo && geo.estimate ? geo.estimate() : fallback;
      const timer = setTimeout(() => {
        if (!st.geo) st.geo = estimate;
      }, 900);
      if (geo && geo.locate)
        geo
          .locate()
          .then((r) => {
            if (!st.geo || !st.geo.ip) st.geo = r && Number.isFinite(r.lat) ? r : estimate;
            clearTimeout(timer);
          })
          .catch(() => (st.geo = estimate));
      else st.geo = fallback;
      st.target = { lat: 41.3, lon: 69.24 };
    },
    onStart: () => sound((s) => s.tone(220, 0.5, "sine", 0.02)),
    onSwap: () => sound((s) => s.tone(1400, 0.16, "sine", 0.03)),
    state(st) {
      const e = performance.now() - st.t0;
      const s = clamp(e / st.spinMs);
      const t = st.geo || st.target;
      const lon1 = (t.lon * Math.PI) / 180;
      const lat1 = (t.lat * Math.PI) / 180;
      const lam = lon1 - (1 - out(s)) * Math.PI * 2 * 1.7;
      const phi = 0.35 + (clamp(lat1, -0.7, 0.7) - 0.35) * out(s);
      return { e, s, lam, phi, lat1, lon1 };
    },
    project(g, lat, lon) {
      const c = Math.sin(g.phi) * Math.sin(lat) + Math.cos(g.phi) * Math.cos(lat) * Math.cos(lon - g.lam);
      const x = Math.cos(lat) * Math.sin(lon - g.lam);
      const y = Math.cos(g.phi) * Math.sin(lat) - Math.sin(g.phi) * Math.cos(lat) * Math.cos(lon - g.lam);
      return { x, y, visible: c > 0 };
    },
    draw(st, g, cx, cy, R, scale, alpha) {
      const MAP = window.WORLD_MAP_LARGE;
      const cw = st.cw * scale;
      const ch = st.chh * scale;
      const ramp = " .:-=+*#%@";
      ctx.font = `700 ${(cw / 0.6).toFixed(2)}px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.globalAlpha = alpha;
      const halo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
      halo.addColorStop(0, "rgba(242,51,74,0.28)");
      halo.addColorStop(1, "rgba(242,51,74,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();
      const sinP = Math.sin(g.phi);
      const cosP = Math.cos(g.phi);
      const r0 = Math.max(0, Math.floor((cy - R) / ch));
      const r1 = Math.min(Math.ceil(st.h / ch), Math.ceil((cy + R) / ch));
      const c0 = Math.max(0, Math.floor((cx - R) / cw));
      const c1 = Math.min(Math.ceil(st.w / cw), Math.ceil((cx + R) / cw));
      const colors = [st.colors.muted, "rgba(242,51,74,0.55)", st.colors.accent, st.colors.bright];
      for (let row = r0; row < r1; row++) {
        const sy = row * ch + ch / 2;
        const y = (cy - sy) / R;
        let run = "";
        let runColor = -1;
        let runX = 0;
        const flush = () => {
          if (run.trim() && runColor >= 0) {
            ctx.fillStyle = colors[runColor];
            ctx.fillText(run, runX, sy);
          }
          run = "";
        };
        for (let col = c0; col < c1; col++) {
          const sx = col * cw;
          const x = (sx + cw / 2 - cx) / R;
          const rho2 = x * x + y * y;
          let chr = " ";
          let color = 0;
          if (rho2 <= 1) {
            const z = Math.sqrt(1 - rho2);
            const lat = Math.asin(clamp(z * sinP + y * cosP, -1, 1));
            const lon = g.lam + Math.atan2(x, z * cosP - y * sinP);
            const latD = (lat * 180) / Math.PI;
            const lonD = (((lon * 180) / Math.PI + 540) % 360) - 180;
            const mr = Math.round(((MAP.latTop - latD) / (MAP.latTop - MAP.latBottom)) * (MAP.rows - 1));
            const mc = Math.round(((lonD + 180) / 360) * (MAP.cols - 1));
            const land = mr >= 0 && mr < MAP.rows && MAP.lines[mr][mc] && MAP.lines[mr][mc] !== " ";
            const light = clamp(0.2 + 0.8 * (z * 0.75 - x * 0.25 + y * 0.25));
            if (land) {
              chr = ramp[Math.max(3, Math.round(light * (ramp.length - 1)))];
              color = light > 0.9 ? 3 : light > 0.45 ? 2 : 1;
            } else {
              const grid = Math.abs(latD % 30) < 1.6 || Math.abs(lonD % 30) < 1.6;
              if (grid && light > 0.15) {
                chr = "·";
                color = 0;
              } else if (rho2 > 0.94) {
                chr = ":";
                color = 1;
              }
            }
          }
          if (color !== runColor || chr === " ") {
            flush();
            runColor = chr === " " ? -1 : color;
            runX = sx;
          }
          run += chr;
        }
        flush();
      }
      ctx.strokeStyle = "rgba(242,51,74,0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    marker(st, g, cx, cy, R, lockK) {
      const pt = this.project(g, g.lat1, g.lon1);
      if (!pt.visible) return null;
      const px = cx + pt.x * R;
      const py = cy - pt.y * R;
      if (lockK <= 0) return { px, py };
      ctx.strokeStyle = "rgba(242,51,74,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.15, py);
      ctx.lineTo(cx + R * 1.15, py);
      ctx.moveTo(px, cy - R * 1.15);
      ctx.lineTo(px, cy + R * 1.15);
      ctx.stroke();
      const size = 70 - 48 * out(clamp(lockK * 1.6));
      ctx.strokeStyle = st.colors.bright;
      ctx.lineWidth = 2;
      const b = 10;
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].forEach(([sx, sy]) => {
        const x = px + sx * size;
        const y = py + sy * size;
        ctx.beginPath();
        ctx.moveTo(x, y - sy * b);
        ctx.lineTo(x, y);
        ctx.lineTo(x - sx * b, y);
        ctx.stroke();
      });
      for (let k = 0; k < 3; k++) {
        const ring = ((performance.now() / 900 + k / 3) % 1) * 46;
        ctx.strokeStyle = `rgba(242,51,74,${0.8 - ring / 60})`;
        ctx.beginPath();
        ctx.arc(px, py, ring, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 16;
      ctx.fillStyle = Math.floor(performance.now() / 250) % 2 ? st.colors.bright : st.colors.accent;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      return { px, py };
    },
    panel(st, g) {
      const geo = st.geo;
      const small = st.w < 700;
      const x = small ? Math.max(18, st.w / 2 - 150) : st.cx + st.R + 60;
      const y = small ? st.cy + st.R + 34 : st.cy - 80;
      const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;
      const rows = [["› trace visitor…", 0, st.colors.text]];
      if (g.s > 0.35) rows.push([`› ip   ${geo ? geo.ip || "n/a" : "resolving…"}`, 0.35, st.colors.bright]);
      if (g.s > 0.6)
        rows.push([
          `› geo  ${geo ? [geo.city, geo.country].filter(Boolean).join(", ") || "—" : "…"}`,
          0.6,
          st.colors.bright,
        ]);
      if (g.s > 0.8 && geo) rows.push([`› ${fmt(geo.lat, "N", "S")}, ${fmt(geo.lon, "E", "W")}`, 0.8, st.colors.text]);
      const size = small ? 13 : 16;
      ctx.font = `600 ${size}px ${FONT}`;
      ctx.textBaseline = "top";
      rows.forEach(([text, at, color], i) => {
        const k = clamp((g.s - at) / 0.15);
        ctx.fillStyle = color;
        ctx.fillText(text.slice(0, Math.ceil(text.length * k)), x, y + i * (size + 10));
      });
      if (g.s >= 1) {
        ctx.font = `800 ${small ? 20 : 28}px ${FONT}`;
        ctx.fillStyle = st.colors.accent;
        ctx.shadowColor = st.colors.accent;
        ctx.shadowBlur = 18;
        if (Math.floor(performance.now() / 300) % 4) ctx.fillText("LOCATED ✓", x, y + rows.length * (size + 10) + 12);
        ctx.shadowBlur = 0;
        if (!st.locked) {
          st.locked = true;
          sound((s) => s.tone(1568, 0.12, "triangle", 0.04));
        }
      }
    },
    drawCover(st, p) {
      const { x, y } = st.origin;
      const far = Math.max(
        Math.hypot(x, y),
        Math.hypot(st.w - x, y),
        Math.hypot(x, st.h - y),
        Math.hypot(st.w - x, st.h - y)
      );
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, inOut(p) * far, 0, Math.PI * 2);
      ctx.clip();
      cover(st);
      ctx.restore();
      const g = this.state(st);
      this.draw(st, g, st.cx, st.cy, st.R * (0.6 + 0.4 * out(p)), 1, out(p));
    },
    drawHold(st, p) {
      cover(st);
      const g = this.state(st);
      this.draw(st, g, st.cx, st.cy, st.R, 1, 1);
      this.marker(st, g, st.cx, st.cy, st.R, g.s >= 1 ? (g.e - st.spinMs) / (this.hold * 0.45) : 0);
      this.panel(st, g);
    },
    drawReveal(st, p) {
      const g = this.state(st);
      const pt = this.project(g, g.lat1, g.lon1);
      const px = st.cx + pt.x * st.R;
      const py = st.cy - pt.y * st.R;
      const far = Math.max(
        Math.hypot(px, py),
        Math.hypot(st.w - px, py),
        Math.hypot(px, st.h - py),
        Math.hypot(st.w - px, st.h - py)
      );
      cover(st);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(px, py, inn(p) * far * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      const k = 1 + 5 * inn(p);
      this.draw(st, g, px + (st.cx - px) * k, py + (st.cy - py) * k, st.R * k, k, 1 - out(p));
    },
  };

  const logs = {
    cover: 440,
    hold: 300,
    reveal: 640,
    init(st) {
      const pages = ["/", "/services", "/about", "/info", "/who", "/contact"];
      const srcs = ["Telegram", "Instagram", "Google", "direct", "LinkedIn", "WhatsApp"];
      const places = ["Tashkent", "Samarkand", "Moscow", "Istanbul", "Dubai", "Almaty"];
      st.lineH = 18;
      st.rows = Math.ceil(st.h / st.lineH) + 8;
      st.log = Array.from({ length: st.rows + 12 }, (_, i) => {
        const r = (k) => hash(i * 7 + k);
        const t = 9 * 3600 + i * 37;
        return [
          `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}  GET ${pages[(r(1) * 6) | 0].padEnd(10)} 200  `,
          srcs[(r(2) * 6) | 0],
          `  · ${places[(r(3) * 6) | 0]}`,
        ];
      });
      st.cw = 11;
      st.ncols = Math.ceil(st.w / st.cw);
      st.speed = Array.from({ length: st.ncols }, (_, i) => 0.9 + hash(i + 50) * 0.9);
      st.lag = Array.from({ length: st.ncols }, (_, i) => hash(i + 90) * 0.3);
    },
    onStart: () => {
      for (let i = 0; i < 8; i++) later(i * 45, () => sound((s) => s.key()));
    },
    onSwap: () => sound((s) => s.tone(300, 0.35, "sawtooth", 0.012)),
    row(st, g, i, y) {
      const [a, b, c] = st.log[i % st.log.length];
      g.font = `600 13px ${FONT}`;
      g.textBaseline = "middle";
      g.fillStyle = st.colors.bg;
      g.fillRect(0, y, st.w, st.lineH);
      g.fillStyle = st.colors.muted;
      g.fillText(a, 14, y + st.lineH / 2);
      const x = 14 + g.measureText(a).width;
      g.fillStyle = st.colors.accent;
      g.fillText(b, x, y + st.lineH / 2);
      g.fillStyle = st.colors.text;
      g.fillText(c, x + g.measureText(b).width, y + st.lineH / 2);
    },
    drawCover(st, p) {
      const n = Math.floor(out(p) * (st.rows + 1));
      for (let i = 0; i < n; i++) this.row(st, ctx, i, i * st.lineH);
    },
    drawHold(st, p) {
      const shift = p * 10;
      const base = Math.floor(shift);
      const off = (shift - base) * st.lineH;
      for (let i = 0; i < st.rows; i++) this.row(st, ctx, i + base, i * st.lineH - off);
      ctx.fillStyle = "rgba(5,5,6,0.9)";
      ctx.fillRect(st.w / 2 - 210, st.h / 2 - 24, 420, 48);
      command(st, st.label, p);
      if (!st.snapshot)
        st.snapshot = layer(st.w, st.h, st.dpr, (g) => {
          for (let i = 0; i < st.rows; i++) this.row(st, g, i + 10, i * st.lineH);
        });
    },
    drawReveal(st, p) {
      ctx.font = `600 13px ${FONT}`;
      ctx.textBaseline = "top";
      for (let c = 0; c < st.ncols; c++) {
        const local = clamp((p - st.lag[c]) / (1 - st.lag[c]));
        const head = local * st.speed[c] * st.h * 1.2;
        const x = c * st.cw;
        cover(st, x, head, st.cw, st.h - head, st.snapshot);
        if (head < st.h + 60 && local > 0) {
          for (let k = 0; k < 5; k++) {
            const y = head - k * 18;
            if (y < -18) break;
            ctx.globalAlpha = k ? 0.6 - k * 0.11 : 1;
            ctx.fillStyle = k ? st.colors.accent : st.colors.bright;
            ctx.fillText(glyph(), x, y);
          }
          ctx.globalAlpha = 1;
        }
      }
    },
  };

  const plane = {
    cover: 360,
    hold: 560,
    reveal: 600,
    init(st) {
      st.a = { x: -140, y: st.h * 0.8 };
      st.b = { x: st.w + 140, y: st.h * 0.2 };
      st.angle = Math.atan2(st.b.y - st.a.y, st.b.x - st.a.x);
      st.nx = Math.sin(st.angle);
      st.ny = -Math.cos(st.angle);
    },
    onStart: () => sound((s) => s.tone(520, 0.4, "sine", 0.02)),
    onSwap: () => {
      sound((s) => s.tone(1046, 0.1, "triangle", 0.04));
      later(110, () => sound((s) => s.tone(1318, 0.14, "triangle", 0.04)));
    },
    drawCover(st, p) {
      ctx.globalAlpha = out(p);
      cover(st);
      ctx.globalAlpha = 1;
    },
    at(st, k) {
      return { x: st.a.x + (st.b.x - st.a.x) * k, y: st.a.y + (st.b.y - st.a.y) * k };
    },
    drawHold(st, p) {
      cover(st);
      const k = inOut(p);
      const pos = this.at(st, k);
      ctx.strokeStyle = st.colors.bright;
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.a.x, st.a.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = st.colors.accent;
      for (let t = 0; t < k; t += 0.012) {
        const d = this.at(st, t);
        ctx.fillRect(d.x + st.nx * 10, d.y + st.ny * 10, 2, 2);
      }
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(st.angle);
      ctx.font = `700 ${st.w < 600 ? 13 : 16}px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = st.colors.bright;
      [" _____", " \\    `-.__", "  >-------_>", " /____.-'"].forEach((line, i) =>
        ctx.fillText(line, -110, (i - 1.5) * 17)
      );
      ctx.fillStyle = st.colors.accent;
      ctx.fillText("-------", -77, 0.5 * 17);
      ctx.restore();
    },
    half(st, side, d) {
      const far = Math.max(st.w, st.h) * 3;
      const ax = st.a.x - Math.cos(st.angle) * far;
      const ay = st.a.y - Math.sin(st.angle) * far;
      const bx = st.b.x + Math.cos(st.angle) * far;
      const by = st.b.y + Math.sin(st.angle) * far;
      const ox = st.nx * side * d;
      const oy = st.ny * side * d;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + st.nx * side * far, by + st.ny * side * far);
      ctx.lineTo(ax + st.nx * side * far, ay + st.ny * side * far);
      ctx.closePath();
      ctx.clip();
      cover(st);
      ctx.restore();
      ctx.strokeStyle = st.colors.accent;
      ctx.globalAlpha = 1 - clamp(d / (st.h * 0.4));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax + ox, ay + oy);
      ctx.lineTo(bx + ox, by + oy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    drawReveal(st, p) {
      const d = inOut(p) * Math.max(st.w, st.h) * 0.75;
      this.half(st, 1, d);
      this.half(st, -1, d);
      const a = p < 0.15 ? p / 0.15 : 1 - clamp((p - 0.55) / 0.35);
      ctx.globalAlpha = a;
      ctx.font = `700 ${st.w < 600 ? 16 : 20}px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(5,5,6,0.85)";
      ctx.fillRect(st.w / 2 - 120, st.h / 2 - 22, 240, 44);
      ctx.fillStyle = st.colors.accent;
      ctx.fillText("[ delivered ✓ ]", st.w / 2, st.h / 2);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    },
  };

  const call = {
    cover: 420,
    hold: 640,
    reveal: 620,
    onStart: () =>
      sound((s) => {
        s.tone(425, 0.18, "sine", 0.03);
        later(260, () => s.tone(425, 0.18, "sine", 0.03));
      }),
    onSwap: () => sound((s) => s.tone(1300, 0.08, "triangle", 0.04)),
    drawCover(st, p) {
      const { w, h, origin } = st;
      const reach = Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y));
      const r = out(p) * reach;
      ctx.save();
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, Math.max(1, r), 0, Math.PI * 2);
      ctx.clip();
      cover(st);
      ctx.restore();
      ctx.strokeStyle = st.colors.accent;
      ctx.lineWidth = 2;
      for (let k = 0; k < 4; k++) {
        const rr = r - k * 34;
        if (rr <= 0) continue;
        ctx.globalAlpha = (1 - k / 4) * (1 - p * 0.4);
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    drawHold(st, p) {
      cover(st);
      const { w, h } = st;
      const mid = h / 2 + 30;
      const span = w * out(clamp(p * 1.4));
      ctx.lineWidth = 2;
      ctx.strokeStyle = st.colors.accent;
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let x = 0; x <= span; x += 3) {
        const env = Math.sin((x / w) * Math.PI);
        const voice = 0.55 + 0.45 * Math.sin(x * 0.012 + p * 9);
        const y = mid + Math.sin(x * 0.05 + p * 22) * 34 * env * voice + Math.sin(x * 0.23 + p * 47) * 7 * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      const msgs = ["INVITE sip:B@voip", "100 Trying", "180 Ringing", "200 OK"];
      const n = Math.min(msgs.length, 1 + Math.floor(p * msgs.length * 1.1));
      const top = mid - 150;
      ctx.font = `700 ${w < 600 ? 14 : 17}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < n; i++) {
        const last = i === n - 1;
        ctx.globalAlpha = last ? 1 : 0.45;
        ctx.fillStyle = last && i === msgs.length - 1 ? st.colors.accent : last ? st.colors.bright : st.colors.muted;
        const arrow = i % 2 ? "<--  " : "-->  ";
        ctx.fillText(arrow + msgs[i], w / 2, top + i * 28);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
    },
    drawReveal(st, p) {
      const { w, h } = st;
      const cx = w / 2;
      const cy = h / 2 + 30;
      const r = inOut(p) * Math.hypot(w, h) * 0.6;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2, true);
      ctx.clip("evenodd");
      cover(st);
      ctx.restore();
      ctx.strokeStyle = st.colors.accent;
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 1 - p;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  };

  function coverRects(st, add) {
    ctx.save();
    ctx.beginPath();
    const any = add((x, y, w, h) => ctx.rect(x, y, w, h));
    if (any !== false) {
      ctx.clip();
      cover(st);
    }
    ctx.restore();
  }

  function glowLine(st, x, y, w, h, color) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
  }

  const crt = {
    cover: 440,
    hold: 360,
    reveal: 640,
    onStart: () => sound((s) => s.tone(140, 0.3, "sawtooth", 0.02)),
    onSwap: () => sound((s) => s.tone(2600, 0.05, "square", 0.02)),
    drawCover(st, p) {
      const { w, h } = st;
      const cy = h / 2;
      if (p < 0.72) {
        const band = Math.max(2, h * (1 - out(p / 0.72)));
        cover(st, 0, 0, w, cy - band / 2);
        cover(st, 0, cy + band / 2, w, h - cy - band / 2);
        ctx.globalAlpha = clamp(p * 2);
        ctx.fillStyle = "rgba(255,240,244,0.12)";
        ctx.fillRect(0, cy - band / 2, w, band);
        glowLine(st, 0, cy - band / 2 - 1, w, 2, st.colors.bright);
        glowLine(st, 0, cy + band / 2 - 1, w, 2, st.colors.bright);
        ctx.globalAlpha = 1;
        return;
      }
      cover(st);
      const k = (p - 0.72) / 0.28;
      const lw = Math.max(6, w * (1 - out(k)));
      glowLine(st, (w - lw) / 2, cy - 1.5, lw, 3, st.colors.bright);
    },
    drawHold(st, p) {
      cover(st);
      const { w, h } = st;
      const r = 3 + Math.sin(p * Math.PI) * 5;
      ctx.shadowColor = st.colors.accent;
      ctx.shadowBlur = 30;
      ctx.fillStyle = st.colors.bright;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      command(st, st.label, p, h / 2 + 60);
    },
    drawReveal(st, p) {
      const { w, h } = st;
      const cy = h / 2;
      if (p < 0.3) {
        cover(st);
        const lw = w * out(p / 0.3);
        glowLine(st, (w - lw) / 2, cy - 1.5, lw, 3, st.colors.bright);
        return;
      }
      const k = (p - 0.3) / 0.7;
      const band = h * out(k);
      cover(st, 0, 0, w, cy - band / 2);
      cover(st, 0, cy + band / 2, w, h - cy - band / 2);
      ctx.globalAlpha = (1 - k) * 0.5;
      for (let y = cy - band / 2; y < cy + band / 2; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, y, w, 1);
      }
      if (Math.random() < 0.35) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(0, cy - band / 2, w, band);
      }
      ctx.globalAlpha = 1 - k;
      glowLine(st, 0, cy - band / 2 - 1, w, 2, st.colors.accent);
      glowLine(st, 0, cy + band / 2 - 1, w, 2, st.colors.accent);
      ctx.globalAlpha = 1;
    },
  };

  const tear = {
    cover: 380,
    hold: 420,
    reveal: 560,
    onStart: () => sound((s) => s.tone(90, 0.18, "square", 0.03)),
    onSwap: () => sound((s) => s.tone(1800, 0.06, "sawtooth", 0.02)),
    init(st) {
      const bands = [];
      let y = 0;
      while (y < st.h) {
        const bh = Math.min(st.h - y, 18 + Math.random() * 70);
        bands.push({ y, h: bh, dir: Math.random() < 0.5 ? -1 : 1, d: Math.random() * 0.35 });
        y += bh;
      }
      st.bands = bands;
    },
    edge(st, x, y, h, dir) {
      ctx.fillStyle = "rgba(242,51,74,0.9)";
      ctx.fillRect(x - dir * 4, y, 3, h);
      ctx.fillStyle = "rgba(90,210,255,0.75)";
      ctx.fillRect(x + dir * 2, y, 2, h);
      ctx.font = `700 13px ${FONT}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = st.colors.bright;
      for (let gy = y; gy < y + h - 12; gy += 18) ctx.fillText(glyph(), x - dir * 16 - 4, gy);
    },
    slide(st, p, covering) {
      const { w } = st;
      st.bands.forEach((b) => {
        const k = clamp((p - b.d) / 0.65);
        const off = covering ? (1 - out(k)) * w : out(k) * w;
        const x0 = b.dir > 0 ? -off : off;
        const left = Math.max(0, x0);
        const right = Math.min(w, x0 + w);
        if (right > left) cover(st, left, b.y, right - left, b.h);
        if (k > 0 && k < 1) this.edge(st, b.dir > 0 ? right : left, b.y, b.h, b.dir > 0 ? 1 : -1);
      });
    },
    drawCover(st, p) {
      this.slide(st, p, true);
    },
    drawHold(st, p) {
      cover(st);
      const { w } = st;
      for (let i = 0; i < 4; i++) {
        const b = st.bands[(Math.random() * st.bands.length) | 0];
        const shift = (Math.random() * 2 - 1) * 26;
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "rgba(242,51,74,0.5)";
        ctx.fillRect(0, b.y, w, 2);
        ctx.fillStyle = "rgba(90,210,255,0.4)";
        ctx.fillRect(shift, b.y + b.h - 2, w, 2);
        ctx.globalAlpha = 1;
      }
      command(st, st.label, p);
    },
    drawReveal(st, p) {
      this.slide(st, p, false);
    },
  };

  const rain = {
    cover: 520,
    hold: 380,
    reveal: 620,
    onStart: () => sound((s) => s.tone(660, 0.4, "sine", 0.012)),
    onSwap: () => sound((s) => s.tone(990, 0.08, "triangle", 0.03)),
    init(st) {
      const cw = 12;
      st.cw = cw;
      st.drops = Array.from({ length: Math.ceil(st.w / cw) }, () => ({
        d: Math.random() * 0.45,
        s: 0.8 + Math.random() * 0.5,
      }));
    },
    glyphs(st, x, y0, y1, head) {
      ctx.font = `700 14px ${FONT}`;
      ctx.textBaseline = "top";
      for (let y = Math.max(0, y1 - 18 * 9); y < y1; y += 18) {
        if (y < y0) continue;
        const t = (y1 - y) / (18 * 9);
        ctx.fillStyle = t < 0.12 && head ? st.colors.bright : `rgba(242,51,74,${(0.9 - t * 0.8).toFixed(2)})`;
        ctx.fillText(glyph(), x + 1, y);
      }
    },
    drawCover(st, p) {
      const { h, cw } = st;
      const heads = [];
      coverRects(st, (rect) => {
        st.drops.forEach((c, i) => {
          const k = clamp(((p - c.d) / 0.55) * c.s);
          const head = k * (h + 40);
          heads.push(head);
          if (head > 0) rect(i * cw, 0, cw, head);
        });
      });
      st.drops.forEach((c, i) => heads[i] > 0 && heads[i] < h + 40 && this.glyphs(st, i * cw, 0, heads[i], true));
    },
    drawHold(st, p) {
      cover(st);
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < st.drops.length; i += 3) {
        const y = ((p * 1.4 + st.drops[i].d) % 1) * (st.h + 160);
        this.glyphs(st, i * st.cw, 0, y, true);
      }
      ctx.globalAlpha = 1;
      command(st, st.label, p);
    },
    drawReveal(st, p) {
      const { h, cw } = st;
      const tails = [];
      coverRects(st, (rect) => {
        st.drops.forEach((c, i) => {
          const k = clamp(((p - c.d) / 0.55) * c.s);
          const tail = k * (h + 40);
          tails.push(tail);
          if (tail < h) rect(i * cw, tail, cw, h - tail);
        });
      });
      st.drops.forEach(
        (c, i) => tails[i] > 0 && tails[i] < h && this.glyphs(st, i * cw, tails[i], tails[i] + 18 * 3, false)
      );
    },
  };

  const decrypt = {
    cover: 420,
    hold: 560,
    reveal: 640,
    onStart: () => sound((s) => s.tone(320, 0.2, "square", 0.015)),
    onSwap: () => sound((s) => s.tone(1500, 0.1, "triangle", 0.035)),
    init(st) {
      const HEX = "0123456789abcdef";
      const ch = 18;
      const cols = Math.ceil(st.w / 8.4);
      st.rowH = ch;
      st.rows = Array.from({ length: Math.ceil(st.h / ch) }, () =>
        Array.from({ length: cols }, (_, i) => (i % 3 === 2 ? " " : HEX[(Math.random() * 16) | 0])).join("")
      );
      const plain = "GET /info HTTP/2 · 200 OK · visitor verified · tls1.3 · aes-256-gcm · ";
      st.plain = plain.repeat(Math.ceil(cols / plain.length) + 1).slice(0, cols);
      st.HEX = HEX;
    },
    mutate(st) {
      for (let k = 0; k < 6; k++) {
        const r = (Math.random() * st.rows.length) | 0;
        const row = st.rows[r];
        const i = (Math.random() * row.length) | 0;
        if (row[i] === " ") continue;
        st.rows[r] = row.slice(0, i) + st.HEX[(Math.random() * 16) | 0] + row.slice(i + 1);
      }
    },
    text(st, r, y, str, color, alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillText(str, 0, y + 2);
      ctx.globalAlpha = 1;
    },
    drawCover(st, p) {
      const { w } = st;
      const n = st.rows.length;
      const widths = st.rows.map((_, r) => w * clamp((p - (r / n) * 0.55) / 0.45));
      coverRects(st, (rect) => widths.forEach((cw, r) => cw > 0 && rect(0, r * st.rowH, cw, st.rowH)));
      ctx.font = `600 14px ${FONT}`;
      ctx.textBaseline = "top";
      widths.forEach((cw, r) => {
        if (cw <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, r * st.rowH, cw, st.rowH);
        ctx.clip();
        this.text(st, r, r * st.rowH, st.rows[r], st.colors.accent, 0.55);
        ctx.restore();
      });
    },
    drawHold(st, p) {
      cover(st);
      this.mutate(st);
      ctx.font = `600 14px ${FONT}`;
      ctx.textBaseline = "top";
      st.rows.forEach((row, r) => this.text(st, r, r * st.rowH, row, st.colors.accent, 0.4));
      const { w, h } = st;
      const bw = Math.min(420, w - 40);
      const x = (w - bw) / 2;
      const y = h / 2 - 50;
      ctx.fillStyle = "rgba(5,5,6,0.9)";
      ctx.fillRect(x - 16, y - 16, bw + 32, 112);
      ctx.strokeStyle = st.colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 16, y - 16, bw + 32, 112);
      ctx.font = `700 ${w < 600 ? 14 : 17}px ${FONT}`;
      ctx.fillStyle = st.colors.bright;
      ctx.fillText("AES-256-GCM · decrypt", x, y);
      ctx.font = `600 13px ${FONT}`;
      ctx.fillStyle = st.colors.muted;
      ctx.fillText(`key 0x${st.rows[0].replace(/ /g, "").slice(0, 16)}…`, x, y + 28);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(x, y + 58, bw, 10);
      glowLine(st, x, y + 58, bw * out(p), 10, st.colors.accent);
    },
    drawReveal(st, p) {
      const n = st.rows.length;
      const state = st.rows.map((_, r) => clamp((p - (r / n) * 0.6) / 0.4));
      coverRects(st, (rect) => state.forEach((k, r) => k < 0.55 && rect(0, r * st.rowH, st.w, st.rowH)));
      ctx.font = `600 14px ${FONT}`;
      ctx.textBaseline = "top";
      state.forEach((k, r) => {
        if (k >= 0.55) return;
        if (k > 0) this.text(st, r, r * st.rowH, st.plain, st.colors.bright, 0.9);
        else this.text(st, r, r * st.rowH, st.rows[r], st.colors.accent, 0.4);
      });
    },
  };

  const shatter = {
    cover: 560,
    hold: 320,
    reveal: 700,
    onStart: () => sound((s) => s.tone(520, 0.12, "triangle", 0.025)),
    onSwap: () => sound((s) => s.tone(1250, 0.12, "sine", 0.035)),
    init(st) {
      const size = document.documentElement.dataset.perf === "lite" ? 34 : st.w < 700 ? 22 : 28;
      const cols = Math.ceil(st.w / size);
      const rows = Math.ceil(st.h / size);
      st.size = size;
      st.parts = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = Math.random() * Math.PI * 2;
          const dist = 0.4 + Math.random() * 0.8;
          st.parts.push({
            x: c * size,
            y: r * size,
            d: Math.random() * 0.45,
            fx: Math.cos(a) * st.w * dist,
            fy: Math.sin(a) * st.h * dist,
            g: glyph(),
          });
        }
      }
    },
    draw(st, p, covering) {
      const { size } = st;
      const flying = [];
      coverRects(st, (rect) =>
        st.parts.forEach((pt) => {
          const k = clamp((p - pt.d) / 0.5);
          const settled = covering ? k >= 1 : k <= 0;
          if (settled) rect(pt.x, pt.y, size, size);
          else if (k > 0 && k < 1) flying.push([pt, covering ? 1 - out(k) : inn(k), k]);
        })
      );
      ctx.font = `700 ${size - 8}px ${FONT}`;
      ctx.textBaseline = "top";
      const groups = new Map();
      flying.forEach((item) => {
        const k = item[2];
        const alpha = Math.round((covering ? clamp(k * 3) : 1 - k) * 4) / 4;
        if (!alpha) return;
        const key = `${k < 0.3 ? "b" : "a"}${alpha}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });
      groups.forEach((items, key) => {
        ctx.globalAlpha = Number(key.slice(1));
        ctx.fillStyle = key[0] === "b" ? st.colors.bright : st.colors.accent;
        items.forEach(([pt, f]) => ctx.fillText(pt.g, pt.x + pt.fx * f + 4, pt.y + pt.fy * f + 3));
      });
      ctx.globalAlpha = 1;
    },
    drawCover(st, p) {
      this.draw(st, p, true);
    },
    drawHold(st, p) {
      cover(st);
      command(st, st.label, p);
    },
    drawReveal(st, p) {
      this.draw(st, p, false);
    },
  };

  const EFFECTS = { home: crt, services: tear, voip: call, about: rain, info: decrypt, who: logs, contact: shatter };

  function play(ms, draw) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => {
        const p = clamp((now - start) / ms);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(p);
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  let job = null;

  function run(origin, target, swap) {
    if (reduceMotion || !ctx) {
      swap();
      return Promise.resolve();
    }
    if (job) {
      if (job.phase === "cover") job.swap = swap;
      else swap();
      return job.done;
    }
    const fx = EFFECTS[target] || wave;
    const st = setup(origin, target);
    if (fx.init) fx.init(st);
    const current = { phase: "cover", swap };
    job = current;
    canvas.hidden = false;
    if (fx.onStart) fx.onStart(st);
    current.done = play(fx.cover, (p) => fx.drawCover(st, p))
      .then(() => {
        return play(fx.hold, (p) => fx.drawHold(st, p));
      })
      .then(() => {
        current.phase = "reveal";
        current.swap();
        if (fx.onSwap) fx.onSwap(st);
        return play(fx.reveal, (p) => fx.drawReveal(st, p));
      })
      .then(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.hidden = true;
        job = null;
      });
    return current.done;
  }

  window.TRANSITION = {
    run,
    get busy() {
      return Boolean(job);
    },
  };
})();
