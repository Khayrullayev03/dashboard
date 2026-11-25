(function () {
  "use strict";

  const VS = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec2 aUv;
attribute float aA;
uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormal;
varying vec3 vNor;
varying vec3 vPos;
varying vec2 vUv;
varying float vA;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vPos = wp.xyz;
  vNor = uNormal * aNor;
  vUv = aUv;
  vA = aA;
  gl_Position = uProj * uView * wp;
}`;

  const FS = `
precision mediump float;
uniform sampler2D uTex;
uniform vec3 uEye;
uniform vec3 uLight;
varying vec3 vNor;
varying vec3 vPos;
varying vec2 vUv;
varying float vA;
void main() {
  if (vA < 0.16) discard;
  vec3 N = normalize(vNor);
  vec3 V = normalize(uEye - vPos);
  if (dot(N, V) < 0.0) N = -N;
  vec3 L = normalize(uLight);
  vec3 H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 42.0);
  vec3 R = reflect(-V, N);
  float sky = smoothstep(-0.35, 0.85, R.y);
  vec3 env = mix(vec3(0.16, 0.03, 0.05), vec3(1.0, 0.97, 0.98), sky);
  float lum = texture2D(uTex, vUv).r;
  vec3 base = mix(vec3(0.42), vec3(1.0), lum);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  vec3 col = base * env * (0.32 + 0.78 * diff) + spec * 1.15 + rim * vec3(0.95, 0.18, 0.26);
  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      -1,
      0,
      0,
      2 * far * near * nf,
      0,
    ]);
  }

  function rotation(yaw, pitch) {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    return [cy, sy * sp, -sy * cp, 0, cp, sp, sy, -cy * sp, cy * cp];
  }

  function buildMesh(img, gw, gh, depth) {
    const c = document.createElement("canvas");
    c.width = gw;
    c.height = gh;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, gw, gh);
    const px = g.getImageData(0, 0, gw, gh).data;
    let a = new Float32Array(gw * gh);
    for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3] / 255;
    const blurred = new Float32Array(a.length);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        let s = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
            s += a[yy * gw + xx];
            n++;
          }
        }
        blurred[y * gw + x] = s / n;
      }
    }
    a = blurred;
    const aspect = img.width / img.height;
    const sx = (2 * aspect) / (gw - 1);
    const sy = 2 / (gh - 1);
    const hgt = (i) => {
      const v = Math.min(1, Math.max(0, (a[i] - 0.08) / 0.7));
      return v * v * (3 - 2 * v) * depth;
    };
    const count = gw * gh;
    const pos = new Float32Array(count * 2 * 3);
    const nor = new Float32Array(count * 2 * 3);
    const uv = new Float32Array(count * 2 * 2);
    const al = new Float32Array(count * 2);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = y * gw + x;
        const z = hgt(i);
        const zl = hgt(y * gw + Math.max(0, x - 1));
        const zr = hgt(y * gw + Math.min(gw - 1, x + 1));
        const zu = hgt(Math.max(0, y - 1) * gw + x);
        const zd = hgt(Math.min(gh - 1, y + 1) * gw + x);
        const dzdx = (zr - zl) / (2 * sx);
        const dzdy = -(zd - zu) / (2 * sy);
        const len = Math.hypot(dzdx, dzdy, 1);
        const wx = -aspect + x * sx;
        const wy = 1 - y * sy;
        for (const side of [0, 1]) {
          const k = i + side * count;
          const sign = side ? -1 : 1;
          pos.set([wx, wy, z * sign], k * 3);
          nor.set([(-dzdx * sign) / len, (-dzdy * sign) / len, sign / len], k * 3);
          uv.set([x / (gw - 1), y / (gh - 1)], k * 2);
          al[k] = a[i];
        }
      }
    }
    const idx = [];
    for (let y = 0; y < gh - 1; y++) {
      for (let x = 0; x < gw - 1; x++) {
        const i = y * gw + x;
        const m = Math.max(a[i], a[i + 1], a[i + gw], a[i + gw + 1]);
        if (m < 0.16) continue;
        idx.push(i, i + 1, i + gw + 1, i, i + gw + 1, i + gw);
        idx.push(i + count, i + gw + 1 + count, i + 1 + count, i + count, i + gw + count, i + gw + 1 + count);
      }
    }
    return { pos, nor, uv, al, idx: new Uint32Array(idx), aspect };
  }

  function create(canvas, options = {}) {
    const opts = {
      src: "assets/img/logo-mark.webp",
      lite: false,
      speed: 0.55,
      depth: 0.1,
      tilt: -0.14,
      swing: 0,
      entry: false,
      ...options,
    };
    let gl = null;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: !opts.lite, premultipliedAlpha: true });
    } catch (e) {
      gl = null;
    }
    if (!gl || !gl.getExtension("OES_element_index_uint")) return null;

    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const loc = (name) => gl.getUniformLocation(prog, name);
    const u = {
      proj: loc("uProj"),
      view: loc("uView"),
      model: loc("uModel"),
      normal: loc("uNormal"),
      eye: loc("uEye"),
      light: loc("uLight"),
      tex: loc("uTex"),
    };

    let mesh = null;
    let ready = false;
    let raf = 0;
    let running = false;
    let disposed = false;
    let start = performance.now();
    let pointerYaw = 0;
    let pointerPitch = 0;
    let yawOffset = 0;
    const buffers = [];

    function attribute(name, data, size) {
      const at = gl.getAttribLocation(prog, name);
      const b = gl.createBuffer();
      buffers.push(b);
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, size, gl.FLOAT, false, 0, 0);
    }

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const gw = opts.lite ? 150 : 240;
      mesh = buildMesh(img, gw, Math.round(gw / (img.width / img.height)), opts.depth);
      attribute("aPos", mesh.pos, 3);
      attribute("aNor", mesh.nor, 3);
      attribute("aUv", mesh.uv, 2);
      attribute("aA", mesh.al, 1);
      const ib = gl.createBuffer();
      buffers.push(ib);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idx, gl.STATIC_DRAW);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(u.tex, 0);
      gl.enable(gl.DEPTH_TEST);
      ready = true;
      draw(performance.now());
    };
    img.src = opts.src;

    function resize() {
      const dpr = opts.lite ? 1 : Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function draw(now) {
      if (!ready || disposed) return;
      resize();
      const w = canvas.width;
      const h = canvas.height;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const t = (now - start) / 1000;
      const view = w / h;
      const fov = 0.52;
      const fit = Math.max(1, mesh.aspect / view) * 1.08;
      const dist = fit / Math.tan(fov / 2) + opts.depth;
      const spin = opts.swing ? Math.sin(t * opts.speed) * opts.swing : opts.speed ? t * opts.speed : 0.45;
      const intro = opts.entry ? Math.pow(1 - Math.min(1, t / 1.6), 3) * Math.PI * 2 : 0;
      const yaw = spin + intro + yawOffset + pointerYaw;
      const pitch = opts.tilt + Math.sin(t * 0.8) * 0.04 + pointerPitch;
      const r = rotation(yaw, pitch);
      gl.uniformMatrix4fv(u.proj, false, perspective(fov, view, 0.1, 40));
      gl.uniformMatrix4fv(u.view, false, new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -dist, 1]));
      gl.uniformMatrix4fv(
        u.model,
        false,
        new Float32Array([r[0], r[1], r[2], 0, r[3], r[4], r[5], 0, r[6], r[7], r[8], 0, 0, 0, 0, 1])
      );
      gl.uniformMatrix3fv(u.normal, false, new Float32Array(r));
      gl.uniform3f(u.eye, 0, 0, dist);
      gl.uniform3f(u.light, Math.cos(t * 0.5) * 0.7, 0.75, 0.9);
      gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_INT, 0);
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      draw(now);
    }

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      api.stop();
    });

    const api = {
      start() {
        if (running || disposed) return;
        running = true;
        raf = requestAnimationFrame(loop);
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
        raf = 0;
      },
      pointer(x, y) {
        pointerYaw = x * 0.6;
        pointerPitch = y * 0.25;
        if (!running) draw(performance.now());
      },
      spinTo(offset) {
        yawOffset = offset;
      },
      dispose() {
        api.stop();
        disposed = true;
        buffers.forEach((b) => gl.deleteBuffer(b));
        const lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
      },
    };
    return api;
  }

  window.MARK3D = { create };
})();
