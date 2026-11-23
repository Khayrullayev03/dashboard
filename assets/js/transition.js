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
    return { w, h, dpr, colors, bg, origin, target, label: target === "home" ? "cd ~" : `cd ~/${target}` };
  }

  function cover(st, x = 0, y = 0, w = st.w, h = st.h, src = st.bg) {
    const sx = clamp(x, 0, st.w);
    const sy = clamp(y, 0, st.h);
    const sw = clamp(x + w, 0, st.w) - sx;
    const sh = clamp(y + h, 0, st.h) - sy;
    if (sw <= 0 || sh <= 0) return;
    ctx.drawImage(src, sx * st.dpr, sy * st.dpr, sw * st.dpr, sh * st.dpr, sx, sy, sw, sh);
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

  const rack = {
    cover: 540,
    hold: 260,
    reveal: 500,
    init(st) {
      st.unit = st.w < 600 ? 34 : 44;
      st.n = Math.ceil(st.h / st.unit);
    },
    onStart(st) {
      for (let i = 0; i < 6; i++) later(i * 70, () => sound((s) => s.tone(1300 - i * 90, 0.03, "square", 0.02)));
    },
    onSwap: () => sound((s) => s.beep()),
    unitAt(st, i, x) {
      const { w } = st;
      const y = i * st.unit;
      const u = st.unit;
      ctx.fillStyle = "#0e0b0d";
      ctx.fillRect(x, y, w, u - 2);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(x, y, w, 1);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(x, y + u - 3, w, 1);
      ctx.font = `600 ${u < 40 ? 11 : 12}px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = st.colors.muted;
      ctx.fillText("◦", x + 8, y + u / 2);
      ctx.fillText("◦", x + w - 16, y + u / 2);
      ctx.fillStyle = st.colors.text;
      ctx.fillText(`srv-${pad(i + 1)}  1U`, x + 28, y + u / 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let k = 0; k < 18; k++) ctx.fillRect(x + w * 0.34 + k * 7, y + u * 0.3, 2, u * 0.4);
      const tick = Math.floor(performance.now() / 120);
      for (let k = 0; k < 4; k++) {
        const on = hash(i * 13 + k * 7 + tick) > 0.45;
        ctx.fillStyle = k === 0 ? st.colors.bright : on ? st.colors.accent : "rgba(242,51,74,0.18)";
        ctx.beginPath();
        ctx.arc(x + w - 110 + k * 18, y + u / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    drawCover(st, p) {
      for (let i = 0; i < st.n; i++) {
        const local = clamp((p - (i / st.n) * 0.55) / 0.45);
        if (local > 0) this.unitAt(st, i, st.w * (1 - out(local)));
      }
    },
    drawHold(st, p) {
      cover(st);
      for (let i = 0; i < st.n; i++) this.unitAt(st, i, 0);
      const mid = Math.floor(st.n / 2) * st.unit;
      ctx.fillStyle = "rgba(5,5,6,0.85)";
      ctx.fillRect(st.w / 2 - 200, mid - 2, 400, st.unit - 2);
      command(st, st.label, p, mid + st.unit / 2 - 2);
    },
    drawReveal(st, p) {
      for (let i = 0; i < st.n; i++) {
        const local = clamp((p - (i / st.n) * 0.5) / 0.5);
        this.unitAt(st, i, -st.w * inn(local));
      }
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

  const radar = {
    cover: 440,
    hold: 640,
    reveal: 540,
    onStart: () => {
      sound((s) => s.tone(1046, 0.09, "sine", 0.04));
      later(160, () => sound((s) => s.tone(1046, 0.09, "sine", 0.025)));
    },
    onSwap: () => sound((s) => s.tone(1400, 0.16, "sine", 0.03)),
    far(st, x, y) {
      return Math.max(
        Math.hypot(x, y),
        Math.hypot(st.w - x, y),
        Math.hypot(x, st.h - y),
        Math.hypot(st.w - x, st.h - y)
      );
    },
    rings(st, x, y, r, alpha) {
      ctx.strokeStyle = st.colors.accent;
      [1, 0.72, 0.46].forEach((k, i) => {
        ctx.globalAlpha = alpha * [0.9, 0.4, 0.25][i];
        ctx.lineWidth = i ? 1 : 2;
        ctx.beginPath();
        ctx.arc(x, y, r * k, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    },
    drawCover(st, p) {
      const { x, y } = st.origin;
      const r = inOut(p) * this.far(st, x, y);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      cover(st);
      ctx.restore();
      this.rings(st, x, y, r, 1);
    },
    drawHold(st, p) {
      cover(st);
      const { w, h } = st;
      const cx = w / 2;
      const cy = h / 2 - (h < 700 ? 70 : 80);
      const R = Math.min(110, w * 0.25);
      ctx.strokeStyle = "rgba(242,51,74,0.35)";
      ctx.lineWidth = 1;
      [1, 0.66, 0.33].forEach((k) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * k, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
      const a = p * Math.PI * 2.4 - Math.PI / 2;
      for (let k = 0; k < 14; k++) {
        ctx.strokeStyle = `rgba(242,51,74,${0.7 - k * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a - k * 0.05) * R, cy + Math.sin(a - k * 0.05) * R);
        ctx.stroke();
      }
      ctx.fillStyle = st.colors.bright;
      ctx.beginPath();
      ctx.arc(cx + R * 0.42, cy - R * 0.3, p > 0.5 ? 4 : 0, 0, Math.PI * 2);
      ctx.fill();
      const list = [
        "traceroute → visitor",
        " 1  192.168.1.1     2 ms",
        " 2  10.12.0.1       7 ms",
        " 3  core.uz-ix     12 ms",
        " 4  → you · ✓",
      ];
      const size = w < 600 ? 12 : 14;
      lines(st, list, p, Math.max(16, cx - (w < 600 ? 140 : 170)), cy + R + 26, size, size + 8);
    },
    drawReveal(st, p) {
      const cx = st.w / 2;
      const cy = st.h / 2;
      const r = out(p) * this.far(st, cx, cy);
      cover(st);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      this.rings(st, cx, cy, r, 1 - p * 0.6);
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

  const EFFECTS = { home: boot, services: rack, about: scan, info: radar, who: logs, contact: plane };

  function play(ms, draw) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / ms);
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
      .then(() => play(fx.hold, (p) => fx.drawHold(st, p)))
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

  window.TRANSITION = { run };
})();
