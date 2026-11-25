(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const lowPower =
    window.matchMedia("(max-width: 820px), (pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;
  const lite = () => lowPower || root.dataset.perf === "lite";
  const canvas = document.createElement("canvas");
  canvas.className = "ascii-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const RAMP = " .:-=+*#%@";
  const MOON_RAMP = " .:;+x*%#@";
  const RAIN = "01<>/\\[]{}=+*#$%&ABCDEFXYZ";
  const FONT_PX = 13;
  const LINE_PX = 18;
  const GLOW_RADIUS = 140;

  let colors = {};
  let width = 0;
  let height = 0;
  let cellW = 8;
  let cols = 0;
  let rows = 0;
  let pointerX = -9999;
  let pointerY = -9999;
  let mode = "contour";
  // Intro eclipse: the moon starts covered and the shadow slides off when BG.eclipse() runs.
  const introAhead = !reduceMotion && /^#?(home)?$/.test(location.hash);
  const eclipse = { start: introAhead ? Infinity : -1, dur: 1, since: performance.now() };
  const easeSine = (p) => 0.5 - Math.cos(Math.PI * p) / 2;
  function eclipseProgress(now) {
    if (eclipse.start === Infinity && now - eclipse.since > 5000) eclipse.start = now;
    if (eclipse.start === Infinity) return 0;
    if (eclipse.start < 0) return 1;
    const p = (now - eclipse.start) / eclipse.dur;
    if (p >= 1) eclipse.start = -1;
    return Math.min(1, Math.max(0, p));
  }
  let scene = "home";
  let drops = [];

  const TEX_W = 180;
  const TEX_H = 90;
  const tex = new Float32Array(TEX_W * TEX_H);
  (function buildMoon() {
    let seed = 20261123;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let y = 0; y < TEX_H; y++) {
      for (let x = 0; x < TEX_W; x++) {
        const u = (x / TEX_W) * Math.PI * 2;
        const v = (y / TEX_H) * Math.PI;
        tex[y * TEX_W + x] =
          0.72 + 0.08 * Math.sin(u * 3 + v * 2) + 0.06 * Math.sin(u * 7 - v * 5) + 0.05 * Math.sin(u * 13 + v * 11);
      }
    }
    const stamp = (cu, cv, r, depth, rim) => {
      for (let y = 0; y < TEX_H; y++) {
        for (let x = 0; x < TEX_W; x++) {
          let du = Math.abs(x / TEX_W - cu);
          du = Math.min(du, 1 - du) * 2;
          const d = Math.hypot(du, y / TEX_H - cv) / r;
          if (d < 1) tex[y * TEX_W + x] -= depth * (1 - d * d);
          else if (d < 1.25 && rim) tex[y * TEX_W + x] += rim * (1 - (d - 1) / 0.25);
        }
      }
    };
    [
      [0.18, 0.38, 0.2],
      [0.32, 0.55, 0.16],
      [0.62, 0.42, 0.22],
      [0.78, 0.6, 0.14],
      [0.47, 0.3, 0.12],
    ].forEach(([u, v, r]) => stamp(u, v, r, 0.38, 0));
    for (let i = 0; i < 40; i++) stamp(rand(), 0.15 + rand() * 0.7, 0.03 + rand() * 0.07, 0.34, 0.2);
    for (let i = 0; i < tex.length; i++) tex[i] = Math.min(1, Math.max(0.05, tex[i]));
  })();

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    colors = {
      dim: v("--field-dim", "rgba(214,215,219,0.075)"),
      red: v("--field-red", "rgba(242,51,74,0.2)"),
      hot: v("--field-hot", "rgba(245,246,248,0.32)"),
      moon1: v("--moon-1", "rgba(120,8,26,0.55)"),
      moon2: v("--moon-2", "rgba(205,24,48,0.8)"),
      moon3: v("--moon-3", "rgba(255,110,120,0.95)"),
      glow: v("--moon-glow", "rgba(200,16,40,0.28)"),
      star: v("--star", "rgba(245,220,225,0.6)"),
      cloud: v("--cloud", "rgba(90,24,34,0.5)"),
      edge: v("--moon-edge", "rgba(40,0,8,0.6)"),
      sea: v("--moon-sea", "rgba(20,0,4,0.55)"),
      head: "#fff4f5",
      trail: v("--accent", "#f2334a"),
    };
  }

  function resize() {
    // The faint field is drawn at 1x; only the moon gets extra pixels on HiDPI screens.
    const dpr = lite() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `500 ${FONT_PX}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    cellW = ctx.measureText("0").width || 8;
    sizeLayer(dpr);
    cols = Math.ceil(width / cellW) + 1;
    rows = Math.ceil(height / LINE_PX) + 1;
    drops = Array.from({ length: cols }, () => ({
      y: Math.random() * -rows,
      speed: 0.25 + Math.random() * 0.6,
      len: 6 + Math.random() * 14,
    }));
  }

  function moonGeometry() {
    const mobile = width < 720;
    const home = scene === "home";
    if (home) {
      const logoEl = document.querySelector("[data-home-logo]");
      const rect = logoEl && logoEl.getBoundingClientRect();
      if (rect && rect.width > 0) {
        return {
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
          R: Math.max(rect.width * 0.64, Math.min(width, height) * (mobile ? 0.48 : 0.42)),
        };
      }
    }
    let R = mobile ? width * (home ? 0.4 : 0.3) : Math.min(width, height) * (home ? 0.27 : 0.22);
    let cx = mobile ? width * 0.72 : home ? width * 0.82 : width - R * 0.45;
    let cy = mobile ? height * (home ? 0.24 : 0.16) : home ? height * 0.42 : R * 0.95 + 40;
    if (pointerX > -9000) {
      cx -= (pointerX - width / 2) * 0.02;
      cy -= (pointerY - height / 2) * 0.02;
    }
    return { cx, cy, R };
  }

  const hash2 = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  let sprite = null;
  let spriteKey = "";

  function moonSprites(R) {
    const key = `${Math.round(R / 6)}`;
    if (sprite && spriteKey === key) return sprite;
    spriteKey = key;
    const gs = 0.25;
    const gsz = Math.max(2, Math.ceil(R * 4.8 * gs));
    const glow = document.createElement("canvas");
    glow.width = glow.height = gsz;
    const g = glow.getContext("2d");
    const gc = gsz / 2;
    const halo = g.createRadialGradient(gc, gc, R * 0.6 * gs, gc, gc, gc);
    halo.addColorStop(0, colors.glow);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, gsz, gsz);

    const dsz = Math.max(2, Math.ceil(R));
    const disc = document.createElement("canvas");
    disc.width = disc.height = dsz;
    const d = disc.getContext("2d");
    const r = dsz / 2;
    d.beginPath();
    d.arc(r, r, r, 0, Math.PI * 2);
    d.clip();
    const body = d.createRadialGradient(r - r * 0.35, r - r * 0.35, r * 0.05, r, r, r);
    body.addColorStop(0, colors.moon3);
    body.addColorStop(0.45, colors.moon2);
    body.addColorStop(1, colors.edge);
    d.fillStyle = body;
    d.fillRect(0, 0, dsz, dsz);
    [
      [-0.28, -0.12, 0.34],
      [0.22, 0.18, 0.28],
      [0.05, -0.42, 0.18],
      [-0.1, 0.45, 0.22],
    ].forEach(([bx, by, br]) => {
      const sea = d.createRadialGradient(r + r * bx, r + r * by, 0, r + r * bx, r + r * by, r * br);
      sea.addColorStop(0, colors.sea);
      sea.addColorStop(1, "rgba(0,0,0,0)");
      d.fillStyle = sea;
      d.fillRect(0, 0, dsz, dsz);
    });
    sprite = { glow, disc };
    return sprite;
  }

  function put(c, text, py) {
    const n = text.length;
    let a = 0;
    while (a < n && text.charCodeAt(a) === 32) a++;
    if (a === n) return;
    let b = n;
    while (text.charCodeAt(b - 1) === 32) b--;
    c.fillText(a || b < n ? text.slice(a, b) : text, a * cellW, py);
  }

  const layer = document.createElement("canvas");
  layer.className = "ascii-bg ascii-moon";
  layer.setAttribute("aria-hidden", "true");
  canvas.before(layer);
  const lctx = layer.getContext("2d");
  const light = document.createElement("div");
  light.className = "moon-light";
  light.setAttribute("aria-hidden", "true");
  layer.after(light);
  let lightR = 0;
  let lightX = 0;
  let lightY = 0;
  let lightScale = -1;
  let lightAlpha = -1;
  let moonScale = 1;
  let layerAt = -1e9;
  let layerGeo = null;

  function sizeLayer(dpr) {
    layer.width = Math.round(width * dpr);
    layer.height = Math.round(height * dpr);
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.font = ctx.font;
    lctx.textBaseline = "top";
    layerAt = -1e9;
  }

  function invalidate() {
    layerAt = -1e9;
  }

  let flashAt = -1e9;
  let flashPower = 0;

  function placeLight(moon, grow, flash) {
    if (Math.abs(moon.R - lightR) > 0.5 || Math.abs(moon.cx - lightX) > 0.5 || Math.abs(moon.cy - lightY) > 0.5) {
      lightR = moon.R;
      lightX = moon.cx;
      lightY = moon.cy;
      light.style.width = light.style.height = `${Math.round(moon.R * 2)}px`;
      light.style.left = `${Math.round(moon.cx - moon.R)}px`;
      light.style.top = `${Math.round(moon.cy - moon.R)}px`;
      layer.style.transformOrigin = `${Math.round(moon.cx)}px ${Math.round(moon.cy)}px`;
    }
    const k = grow * (1 + flash * 0.3);
    if (Math.abs(k - lightScale) > 0.004) {
      lightScale = k;
      light.style.transform = `scale(${k.toFixed(3)})`;
    }
    const alpha = Math.min(1, Math.max(flash, pulse * 0.22));
    if (Math.abs(alpha - lightAlpha) > 0.01) {
      lightAlpha = alpha;
      light.style.opacity = alpha.toFixed(3);
    }
    if (Math.abs(grow - moonScale) > 0.002) {
      moonScale = grow;
      layer.style.scale = grow === 1 ? "" : grow.toFixed(3);
    }
  }

  function flashLevel(now) {
    return flashPower * Math.exp(-(now - flashAt) / 190);
  }

  function cloudAt(x, y, rowFrac, now) {
    const band = Math.sin(y * 0.55 + 1.3) * Math.sin(x * 0.045 + now * 0.00006 + y * 0.9);
    return band > 0.82 && rowFrac < 0.75 ? band : 0;
  }

  function moonCell(d2, cloud) {
    return d2 < 1 || (!cloud && (d2 < 1.14 || (d2 > 1.4 && d2 < 1.52))) || (cloud && d2 < 4);
  }

  function drawMoon(now, moon, art, e) {
    const home = scene === "home";
    const moonAlpha = home ? 1 : 0.45;
    const rot = now * 0.000012;
    const shadow = e > 0.001;
    const sOff = 0.16 + (1 - e) * 2.4;
    lctx.clearRect(0, 0, width, height);
    lctx.globalAlpha =
      Math.min(1, moonAlpha * (0.82 + 0.18 * Math.sin(now * 0.0012))) * (shadow ? 0.5 + 0.5 * (1 - e) : 1);
    const gr = moon.R * 2.4;
    lctx.drawImage(art.glow, moon.cx - gr, moon.cy - gr, gr * 2, gr * 2);
    lctx.globalAlpha = moonAlpha * (home ? 0.75 : 0.5) * (home ? 0.42 : 0.3);
    lctx.drawImage(art.disc, moon.cx - moon.R, moon.cy - moon.R, moon.R * 2, moon.R * 2);
    if (shadow) {
      lctx.save();
      lctx.globalCompositeOperation = "destination-out";
      lctx.globalAlpha = 0.93;
      lctx.beginPath();
      lctx.arc(moon.cx + sOff * moon.R, moon.cy, moon.R * 1.03, 0, Math.PI * 2);
      lctx.fill();
      lctx.restore();
    }

    const y0 = Math.max(0, Math.floor((moon.cy - moon.R * 2) / LINE_PX));
    const y1 = Math.min(rows, Math.ceil((moon.cy + moon.R * 2) / LINE_PX) + 1);
    for (let y = y0; y < y1; y++) {
      const py = y * LINE_PX;
      const rowFrac = y / rows;
      let m1 = "";
      let m2 = "";
      let m3 = "";
      let cloud = "";
      for (let x = 0; x < cols; x++) {
        const px = x * cellW + cellW / 2;
        const dx = (px - moon.cx) / moon.R;
        const dy = (py + LINE_PX / 2 - moon.cy) / moon.R;
        const d2 = dx * dx + dy * dy;
        const band = cloudAt(x, y, rowFrac, now);
        let mc = " ";
        let ml = 0;
        let cc = " ";
        let shaded = 0;
        if (shadow && d2 < 1.12) {
          const ex = dx - sOff;
          const sd = ex * ex + dy * dy;
          shaded = sd < 1.06 ? 1 : sd < 1.22 && d2 < 1 ? 2 : 0;
        }
        if (shaded === 1) {
          if (d2 < 1) {
            if (hash2(x, y) > 0.8) {
              mc = ".";
              ml = 1;
            }
          } else if (e > 0.2) {
            mc = hash2(y, x) > 0.5 ? "·" : "*";
            ml = 2;
          }
        } else if (shaded === 2) {
          mc = hash2(x, y) > 0.4 ? "@" : "%";
          ml = 3;
        } else if (d2 < 1) {
          const z = Math.sqrt(1 - d2);
          const light = Math.max(0, -dx * 0.55 - dy * 0.45 + z * 0.7);
          let lon = Math.atan2(dx, z) / (Math.PI * 2) + rot;
          lon -= Math.floor(lon);
          const lat = Math.asin(Math.max(-1, Math.min(1, dy))) / Math.PI + 0.5;
          const texel = tex[Math.min(TEX_H - 1, (lat * TEX_H) | 0) * TEX_W + ((lon * TEX_W) | 0)];
          const b = Math.min(1, (0.05 + 0.95 * Math.pow(light, 1.15)) * texel * (0.55 + 0.45 * z) * 1.25);
          if (band) {
            cc = band > 0.9 ? "≈" : "~";
          } else if (d2 > 0.9 && light > 0.12) {
            mc = light > 0.45 ? "@" : "%";
            ml = light > 0.45 ? 3 : 2;
          } else if (home && d2 < 0.5 && hash2(x, y) > (d2 - 0.3) / 0.2) {
          } else if (b > 0.04 || (x + y) % 3 === 0) {
            mc = MOON_RAMP[Math.max(1, Math.min(9, (b * 10) | 0))];
            ml = b > 0.6 ? 3 : b > 0.3 ? 2 : 1;
          }
        } else if (d2 < 1.14 && !band) {
          const ang = Math.atan2(dy, dx);
          const lit = Math.cos(ang + 2.4) * 0.5 + 0.5;
          if (d2 < 1.06) {
            mc = lit > 0.5 ? "·" : ".";
            ml = lit > 0.55 ? 3 : 2;
          }
        } else if (d2 > 1.4 && d2 < 1.52 && !band) {
          const ang = Math.atan2(dy, dx) + now * 0.00008;
          if (Math.sin(ang * 18) > 0.82) {
            mc = "·";
            ml = 2;
          }
        } else if (band && d2 < 4) {
          cc = "~";
        }
        m1 += ml === 1 ? mc : " ";
        m2 += ml === 2 ? mc : " ";
        m3 += ml === 3 ? mc : " ";
        cloud += cc;
      }
      lctx.globalAlpha = moonAlpha;
      lctx.fillStyle = colors.moon1;
      put(lctx, m1, py);
      lctx.fillStyle = colors.moon2;
      put(lctx, m2, py);
      lctx.fillStyle = colors.moon3;
      put(lctx, m3, py);
      lctx.fillStyle = colors.cloud;
      put(lctx, cloud, py);
    }
    lctx.globalAlpha = 1;
  }

  function draw(now) {
    const t = now * 0.00045;
    const scroll = window.scrollY * 0.004;
    const moon = moonGeometry();
    const art = moonSprites(moon.R);
    const grow = pulse > 0.001 ? 1 + pulse * 0.06 : 1;
    const tick = Math.floor(now / 120);
    const matrix = mode === "matrix";

    if (matrix) {
      drops.forEach((d) => {
        d.y += d.speed;
        if (d.y - d.len > rows) {
          d.y = Math.random() * -10;
          d.speed = 0.25 + Math.random() * 0.6;
          d.len = 6 + Math.random() * 14;
        }
      });
    }

    const ip = eclipseProgress(now);
    const e = 1 - easeSine(ip);
    const moved =
      !layerGeo ||
      Math.abs(moon.cx - layerGeo.cx) + Math.abs(moon.cy - layerGeo.cy) + Math.abs(moon.R - layerGeo.R) > 0.5;
    if (moved || (e > 0 && ip > 0) || now - layerAt > (lite() ? 240 : 140)) {
      drawMoon(now, moon, art, e);
      layerAt = now;
      layerGeo = moon;
    }

    placeLight(moon, grow, flashLevel(now));
    ctx.clearRect(0, 0, width, height);
    const R = moon.R * grow;

    for (let y = 0; y < rows; y++) {
      const py = y * LINE_PX;
      const fy = y * 0.2 + scroll;
      const rowFrac = y / rows;
      const starRow = rowFrac < 0.6;
      let dim = "";
      let red = "";
      let hot = "";
      let star = "";

      for (let x = 0; x < cols; x++) {
        const px = x * cellW + cellW / 2;
        const dx = (px - moon.cx) / R;
        const dy = (py + LINE_PX / 2 - moon.cy) / R;
        const d2 = dx * dx + dy * dy;
        let sc = " ";
        let fd = " ";
        let fl = 0;
        if (!moonCell(d2, cloudAt(x, y, rowFrac, now))) {
          const h = hash2(x, y);
          if (starRow && h > 0.993 && d2 > 1.4 && (ip >= 1 || hash2(x * 1.7 + 3.1, y * 2.3 + 7.7) < ip * 1.25)) {
            const tw = Math.sin(now * 0.002 + h * 60);
            if (tw > -0.2) sc = tw > 0.85 && h > 0.997 ? "+" : "·";
          }
          if (matrix) {
            const drop = drops[x];
            const dist = drop.y - y;
            if (dist >= 0 && dist <= drop.len) {
              const seed = Math.sin((x * 31 + y * 17 + Math.floor(tick / (2 + (x % 3)))) * 12.9898) * 43758.5453;
              fd = RAIN[Math.floor((seed - Math.floor(seed)) * RAIN.length)];
              fl = dist < 1 ? 3 : dist < drop.len * 0.45 ? 2 : 1;
              sc = " ";
            }
          } else if (d2 > 1.15 && rowFrac > 0.35) {
            const fx = x * 0.1;
            const v =
              (Math.sin(fx + t * 1.2) +
                Math.sin(fy * 0.9 - t * 0.8) +
                Math.sin(fx * 0.7 + fy * 0.6 + t * 0.5) +
                Math.sin(Math.hypot(fx - 10, fy - 6) * 0.8 - t * 1.6) +
                4) /
              8;
            let glowP = 0;
            const gx = px - pointerX;
            const gy = py - pointerY;
            if (gx < GLOW_RADIUS && gx > -GLOW_RADIUS && gy < GLOW_RADIUS && gy > -GLOW_RADIUS) {
              glowP = Math.max(0, 1 - Math.sqrt(gx * gx + gy * gy) / GLOW_RADIUS);
            }
            const bandV = (v * 7) % 1;
            const hotLine = glowP > 0.25 && bandV < 0.55;
            if (bandV < 0.2 || hotLine) {
              fd = RAMP[Math.min(9, 1 + ((v * 9) | 0))];
              fl = hotLine ? 3 : v > 0.74 ? 2 : 1;
            }
          }
        }
        star += sc;
        dim += fl === 1 ? fd : " ";
        red += fl === 2 ? fd : " ";
        hot += fl === 3 ? fd : " ";
      }

      const fieldAlpha =
        (matrix ? 1 : Math.min(1, Math.max(0, (rowFrac - 0.35) / 0.4))) *
        (ip >= 1 ? 1 : Math.min(1, Math.max(0, (ip - 0.3) / 0.7)));
      if (fieldAlpha > 0) {
        ctx.globalAlpha = fieldAlpha;
        ctx.fillStyle = colors.dim;
        put(ctx, dim, py);
        ctx.fillStyle = colors.red;
        put(ctx, red, py);
        ctx.fillStyle = colors.hot;
        put(ctx, hot, py);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.star;
      put(ctx, star, py);
    }
    if (now < glitchUntil) glitchPass();
  }

  let glitchUntil = 0;
  let glitchPower = 0;
  let glitchTimer = 0;
  const NOISE = "01<>/\\[]{}=+*#%&@$ABCDEFXYZ";

  function glitchPass() {
    const dpr = canvas.width / width;
    const bands = 2 + Math.floor(Math.random() * (2 + glitchPower * 3));
    for (let b = 0; b < bands; b++) {
      const y = Math.random() * height;
      const h = 6 + Math.random() * (18 + glitchPower * 40);
      const shift = (Math.random() * 2 - 1) * (10 + glitchPower * 45);
      ctx.drawImage(canvas, 0, y * dpr, canvas.width, h * dpr, shift, y, width, h);
    }
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = colors.trail;
    const lines = 1 + Math.floor(Math.random() * (1 + glitchPower * 2));
    for (let k = 0; k < lines; k++) {
      const py = Math.floor(Math.random() * rows) * LINE_PX;
      let line = "";
      for (let x = 0; x < cols; x++) line += Math.random() < 0.35 ? NOISE[(Math.random() * NOISE.length) | 0] : " ";
      ctx.fillText(line, 0, py);
    }
    ctx.globalAlpha = 1;
  }

  let raf = 0;
  let last = 0;
  let cost = 0;
  let paused = false;
  let pulse = 0;
  let live = false;
  function interval() {
    const low = lite();
    if (live || (eclipse.start > 0 && eclipse.start !== Infinity)) return low ? 50 : 33;
    const base = scene === "home" ? (low ? 60 : 40) : low ? 120 : 70;
    return cost > 14 ? Math.min(160, base * 1.8) : base;
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < interval()) return;
    last = now;
    const t0 = performance.now();
    draw(now);
    cost = cost * 0.9 + (performance.now() - t0) * 0.1;
  }
  function start() {
    if (!raf && !reduceMotion && !paused && !document.hidden) raf = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener("resize", () => {
    resize();
    draw(performance.now());
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  if (!reduceMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        pointerX = e.clientX;
        pointerY = e.clientY;
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => {
      pointerX = pointerY = -9999;
    });
  }

  const sky = document.createElement("canvas");
  sky.className = "ascii-bg";
  sky.setAttribute("aria-hidden", "true");
  canvas.after(sky);
  const sctx = sky.getContext("2d");
  let meteors = [];
  let skyRaf = 0;
  const TRAIL = ["@", "*", "*", "=", "=", "=", "=", "=", "-", "-", "-", "-", "-", "-", "·"];

  sky.style.visibility = "hidden";

  function sizeSky() {
    const dpr = lite() ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    sky.width = Math.round(window.innerWidth * dpr);
    sky.height = Math.round(window.innerHeight * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnMeteor() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const angle = 0.32 + Math.random() * 0.28;
    const speed = 720 + Math.random() * 520;
    meteors.push({
      x: dir > 0 ? Math.random() * w * 0.55 : w * 0.45 + Math.random() * w * 0.55,
      y: -30 + Math.random() * h * 0.35,
      vx: Math.cos(angle) * speed * dir,
      vy: Math.sin(angle) * speed,
      born: performance.now(),
      life: 1000 + Math.random() * 600,
      len: 22 + Math.floor(Math.random() * 14),
      size: 16 + Math.random() * 4,
    });
    sky.style.visibility = "visible";
    if (!skyRaf) skyRaf = requestAnimationFrame(flySky);
  }

  function drawMeteor(m, now) {
    const t = now - m.born;
    const fade = Math.min(1, t / 70) * Math.min(1, (m.life - t) / 320);
    const hx = m.x + (m.vx * t) / 1000;
    const hy = m.y + (m.vy * t) / 1000;
    const v = Math.hypot(m.vx, m.vy);
    const ux = m.vx / v;
    const uy = m.vy / v;
    const step = m.size * 0.62;
    const tailX = hx - ux * m.len * step;
    const tailY = hy - uy * m.len * step;
    const streak = sctx.createLinearGradient(tailX, tailY, hx, hy);
    streak.addColorStop(0, "rgba(242,51,74,0)");
    streak.addColorStop(0.7, "rgba(242,51,74,0.35)");
    streak.addColorStop(1, "rgba(255,230,235,0.9)");
    sctx.globalAlpha = fade;
    sctx.strokeStyle = streak;
    sctx.lineWidth = 2;
    sctx.beginPath();
    sctx.moveTo(tailX, tailY);
    sctx.lineTo(hx, hy);
    sctx.stroke();
    sctx.font = `700 ${m.size.toFixed(1)}px "JetBrains Mono", monospace`;
    sctx.textAlign = "center";
    sctx.textBaseline = "middle";
    for (let i = m.len; i >= 0; i--) {
      const k = i / m.len;
      sctx.globalAlpha = Math.max(0, (1 - k) * fade);
      sctx.fillStyle = i < 2 ? colors.head : i < 6 ? "rgba(255,150,165,1)" : colors.trail;
      sctx.fillText(
        TRAIL[Math.min(TRAIL.length - 1, Math.floor(k * TRAIL.length))],
        hx - ux * i * step,
        hy - uy * i * step
      );
    }
    sctx.globalAlpha = fade;
    sctx.shadowColor = colors.head;
    sctx.shadowBlur = lite() ? 0 : 28;
    sctx.fillStyle = colors.head;
    sctx.beginPath();
    sctx.arc(hx + ux * 4, hy + uy * 4, 3.6, 0, Math.PI * 2);
    sctx.fill();
    sctx.shadowBlur = 0;
    sctx.globalAlpha = 1;
  }

  function flySky(now) {
    sctx.clearRect(0, 0, sky.width, sky.height);
    meteors = meteors.filter((m) => now - m.born < m.life);
    meteors.forEach((m) => drawMeteor(m, now));
    skyRaf = meteors.length ? requestAnimationFrame(flySky) : 0;
    if (!skyRaf) sky.style.visibility = "hidden";
  }

  function scheduleMeteor() {
    setTimeout(
      () => {
        if (!reduceMotion && !paused && !document.hidden && mode !== "matrix") {
          spawnMeteor();
          if (Math.random() < 0.2) setTimeout(spawnMeteor, 220 + Math.random() * 300);
        }
        scheduleMeteor();
      },
      lite() ? 6000 + Math.random() * 8000 : 2600 + Math.random() * 4400
    );
  }

  readColors();
  resize();
  sizeSky();
  window.addEventListener("resize", sizeSky);
  document.addEventListener("perfchange", () => {
    resize();
    sizeSky();
    draw(performance.now());
  });
  draw(performance.now());
  root.classList.add("bg-ready");
  start();
  if (!reduceMotion) setTimeout(scheduleMeteor, 1500);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      resize();
      draw(performance.now());
    });
  }

  window.BG = {
    get mode() {
      return mode;
    },
    setMode(next) {
      mode = next === "matrix" ? "matrix" : "contour";
      invalidate();
      draw(performance.now());
      return mode;
    },
    toggleMatrix() {
      return this.setMode(mode === "matrix" ? "contour" : "matrix");
    },
    setScene(next) {
      scene = next === "home" ? "home" : "page";
      invalidate();
      draw(performance.now());
    },
    glitch(strength = 1, ms = 220) {
      if (reduceMotion) return;
      glitchUntil = performance.now() + ms;
      glitchPower = strength;
      const cls = strength > 1.4 ? "is-glitching-hard" : "is-glitching";
      [canvas, layer].forEach((c) => {
        c.classList.remove("is-glitching", "is-glitching-hard");
        c.classList.add(cls);
      });
      clearTimeout(glitchTimer);
      glitchTimer = setTimeout(
        () => [canvas, layer].forEach((c) => c.classList.remove("is-glitching", "is-glitching-hard")),
        ms
      );
      draw(performance.now());
    },
    setLive(on) {
      live = Boolean(on);
      if (!live) pulse = 0;
    },
    setPulse(value) {
      pulse = Math.max(0, Math.min(1, value || 0));
    },
    flash(power = 1) {
      if (reduceMotion) return;
      const now = performance.now();
      flashPower = Math.min(1.2, Math.max(flashLevel(now), power));
      flashAt = now;
      draw(now);
    },
    eclipse(ms = 1800) {
      if (reduceMotion) return;
      eclipse.start = performance.now();
      eclipse.dur = ms;
      invalidate();
      draw(eclipse.start);
    },
    pause(on) {
      paused = Boolean(on);
      if (paused) stop();
      else start();
    },
    refreshColors() {
      readColors();
      sprite = null;
      invalidate();
      draw(performance.now());
    },
  };
})();
