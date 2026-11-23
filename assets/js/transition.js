(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GLYPHS = "01<>/\\[]{}=+*#%&@$ABCDEFXYZ░▒▓";
  const CELL_W = 11;
  const CELL_H = 18;
  const COVER_MS = 400;
  const HOLD_MS = 220;
  const REVEAL_MS = 560;

  const canvas = document.createElement("canvas");
  canvas.className = "page-wipe";
  canvas.setAttribute("aria-hidden", "true");
  canvas.hidden = true;
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");

  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const rand = (s) => {
    const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  let job = null;

  function setup(origin) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(w / CELL_W);
    const rows = Math.ceil(h / CELL_H);
    const ox = origin.x / CELL_W;
    const oy = origin.y / CELL_H;
    const far = Math.max(
      Math.hypot(ox, oy * 1.6),
      Math.hypot(cols - ox, oy * 1.6),
      Math.hypot(ox, (rows - oy) * 1.6),
      Math.hypot(cols - ox, (rows - oy) * 1.6)
    );
    const delay = new Float32Array(cols * rows);
    const dim = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        delay[i] = (Math.hypot(x - ox, (y - oy) * 1.6) / far) * 0.78 + rand(i) * 0.14;
        dim[i] = rand(i + 7.3) < 0.1 ? 1 : 0;
      }
    }
    return {
      w,
      h,
      cols,
      rows,
      delay,
      dim,
      colors: {
        bg: css("--bg", "#050506"),
        accent: css("--accent", "#f2334a"),
        bright: css("--bright", "#f6f6f8"),
        muted: css("--muted", "#8f9198"),
      },
    };
  }

  function frame(grid, p, covering) {
    const { cols, delay, dim, colors, w, h } = grid;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `600 13px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";
    const front = 0.1;
    ctx.fillStyle = colors.bg;
    for (let i = 0; i < delay.length; i++) {
      const d = delay[i];
      const filled = covering ? p >= d + front : p < d;
      if (filled) ctx.fillRect((i % cols) * CELL_W, ((i / cols) | 0) * CELL_H, CELL_W + 0.5, CELL_H + 0.5);
    }
    for (let i = 0; i < delay.length; i++) {
      const d = delay[i];
      const x = (i % cols) * CELL_W;
      const y = ((i / cols) | 0) * CELL_H;
      const edge = p >= d && p < d + front;
      if (edge) {
        const k = (p - d) / front;
        ctx.fillStyle = k < 0.35 ? colors.bright : colors.accent;
        ctx.globalAlpha = covering ? 1 - k * 0.4 : 0.6 + k * 0.4;
        ctx.fillText(glyph(), x + 1, y + 2);
        ctx.globalAlpha = 1;
      } else if (dim[i] && (covering ? p >= d + front : p < d)) {
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.18;
        ctx.fillText(glyph(), x + 1, y + 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  function label(grid, text, p) {
    const { w, h, colors } = grid;
    const shown = text.slice(0, Math.ceil(text.length * Math.min(1, p * 1.6)));
    ctx.font = `700 ${Math.max(16, Math.min(26, w / 40))}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "middle";
    const full = ctx.measureText(text).width;
    const x = (w - full) / 2;
    const y = h / 2;
    ctx.fillStyle = colors.accent;
    ctx.fillText("$ ", x - ctx.measureText("$ ").width, y);
    ctx.fillStyle = colors.bright;
    ctx.fillText(shown, x, y);
    if (Math.floor(performance.now() / 260) % 2 === 0) {
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x + ctx.measureText(shown).width + 2, y - 11, 11, 22);
    }
  }

  function animate(ms, draw) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / ms);
        draw(p);
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  function run(origin, text, swap) {
    if (reduceMotion || !ctx) {
      swap();
      return Promise.resolve();
    }
    if (job) {
      if (job.phase === "cover") {
        job.swap = swap;
        job.text = text;
      } else swap();
      return job.done;
    }
    const grid = setup(origin);
    const current = { phase: "cover", swap, text };
    job = current;
    canvas.hidden = false;
    current.done = animate(COVER_MS, (p) => frame(grid, ease(p) * (1 + 0.1), true))
      .then(() =>
        animate(HOLD_MS, (p) => {
          frame(grid, 1.2, true);
          label(grid, current.text, p);
        })
      )
      .then(() => {
        current.phase = "reveal";
        current.swap();
        return animate(REVEAL_MS, (p) => frame(grid, ease(p) * 1.1, false));
      })
      .then(() => {
        ctx.clearRect(0, 0, grid.w, grid.h);
        canvas.hidden = true;
        job = null;
      });
    return current.done;
  }

  window.TRANSITION = { run };
})();
