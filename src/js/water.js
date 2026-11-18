// Chapter 5's water (spec docs/section/008-lady-of-the-lake.md, "The water"). A small ripple simulation: a 128 by 128 height field
// on the CPU, drawn with raw WebGL (a base picture bent by the slope of the water, plus a dawn glint). Three paths behind one set of calls:
//   WebGL      the real thing
//   2D canvas  the same picture drawn per pixel at 128 by 128 and scaled up by CSS (?webgl=off, or WebGL missing or lost)
//   still      no simulation (reduced motion): the picture, and CSS rings for a tap. Used by the plain section.
// Calls: createWater(parent, opts) -> { drop, setReveal, setTarget, frame, resize, destroy, canvas }
const N = 128;
const DAMP = 0.982;
const VERT = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision mediump float;
varying vec2 v;uniform sampler2D uBase;uniform sampler2D uH;
void main(){
  vec2 uv=vec2(v.x,1.-v.y);
  float e=1./${N}.;
  float hx=texture2D(uH,uv+vec2(e,0.)).r-texture2D(uH,uv-vec2(e,0.)).r;
  float hy=texture2D(uH,uv+vec2(0.,e)).r-texture2D(uH,uv-vec2(0.,e)).r;
  vec2 g=vec2(hx,hy);
  vec3 c=texture2D(uBase,uv+g*.12).rgb;
  vec3 n=normalize(vec3(-g*3.,1.));
  float gl=pow(max(dot(n,normalize(vec3(-.5,.6,.62))),0.),24.);
  c+=vec3(1.,.86,.55)*gl*.45;
  c*=1.-.35*length(g)*2.;
  gl_FragColor=vec4(c,1.);
}`;

const smooth = (t) => t * t * (3 - 2 * t);
const BADGE = { good: '/assets/badges/good-192.webp', evil: '/assets/badges/evil-192.webp' };
const BACK = '/assets/cards/card-back-240.webp';
const GLOW = { good: '90,150,255', evil: '255,70,90' };

export function createWater(parent, { still = false, size = 512 } = {}) {
  const base = document.createElement('canvas');
  base.width = base.height = 256;
  const bx = base.getContext('2d');
  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = 256;
  const tx = tmp.getContext('2d');
  const canvas = document.createElement('canvas');
  canvas.className = 'w-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  parent.append(canvas);
  let cv = canvas; // the visible canvas (swapped if the WebGL context is lost)
  const target = { side: 'good' };
  const imgs = { back: new Image(), good: new Image(), evil: new Image() };
  let rv = -1, step = -1, dead = false;
  const redraw = () => {
    step = -1;
    draw(rv < 0 ? 0 : rv);
    if (still) paintStill();
  };
  imgs.back.onload = imgs.good.onload = imgs.evil.onload = redraw;
  imgs.back.src = BACK;
  imgs.good.src = BADGE.good;
  imgs.evil.src = BADGE.evil;

  // ---------- the base picture (256 by 256): the lake, and as the reveal grows, the glow, the reflection and the badge ----------
  const streaks = Array.from({ length: 16 }, (_, i) => ({ x: (Math.sin(i * 12.9) * 0.5 + 0.5) * 256, y: (Math.sin(i * 7.7 + 1) * 0.5 + 0.5) * 256, w: 30 + (i % 5) * 18, a: 0.05 + (i % 4) * 0.02 }));
  function draw(r) {
    const k = Math.round(r * 40);
    if (k === step) return;
    step = k;
    const rev = k / 40;
    const g = bx.createLinearGradient(0, 0, 256, 256);
    g.addColorStop(0, '#4F7A70');
    g.addColorStop(0.5, '#2E5550');
    g.addColorStop(1, '#173431');
    bx.globalAlpha = 1;
    bx.fillStyle = g;
    bx.fillRect(0, 0, 256, 256);
    const dawn = bx.createRadialGradient(46, 40, 4, 46, 40, 130);
    dawn.addColorStop(0, 'rgba(236,190,92,.62)');
    dawn.addColorStop(1, 'rgba(236,190,92,0)');
    bx.fillStyle = dawn;
    bx.fillRect(0, 0, 256, 256);
    streaks.forEach((s) => {
      bx.fillStyle = `rgba(255,244,214,${s.a})`;
      bx.fillRect(s.x - s.w / 2, s.y, s.w, 2);
    });
    if (rev > 0) {
      const rgb = GLOW[target.side];
      const gl = bx.createRadialGradient(128, 132, 6, 128, 132, 126);
      gl.addColorStop(0, `rgba(${rgb},${0.62 * rev})`);
      gl.addColorStop(0.5, `rgba(${rgb},${0.22 * rev})`);
      gl.addColorStop(1, `rgba(${rgb},0)`);
      bx.fillStyle = gl;
      bx.fillRect(0, 0, 256, 256);
      // the card back, upside down, in shadow, fading out toward its top
      if (imgs.back.complete && imgs.back.naturalWidth) {
        tx.clearRect(0, 0, 256, 256);
        tx.globalCompositeOperation = 'source-over';
        tx.save();
        tx.translate(128, 150);
        tx.rotate(Math.PI);
        tx.drawImage(imgs.back, -46, -69, 92, 138);
        tx.restore();
        tx.globalCompositeOperation = 'source-atop';
        tx.fillStyle = 'rgba(0,0,0,.55)';
        tx.fillRect(0, 0, 256, 256);
        tx.globalCompositeOperation = 'destination-in';
        const fade = tx.createLinearGradient(0, 70, 0, 222);
        fade.addColorStop(0, 'rgba(0,0,0,0)');
        fade.addColorStop(1, 'rgba(0,0,0,1)');
        tx.fillStyle = fade;
        tx.fillRect(0, 0, 256, 256);
        const soft = tx.createRadialGradient(128, 150, 8, 128, 150, 76); // soft sides, so the reflection has no hard edge
        soft.addColorStop(0, 'rgba(0,0,0,1)');
        soft.addColorStop(1, 'rgba(0,0,0,0)');
        tx.fillStyle = soft;
        tx.fillRect(0, 0, 256, 256);
        bx.globalAlpha = rev;
        bx.drawImage(tmp, 0, 0);
        bx.globalAlpha = 1;
      }
      const bi = imgs[target.side];
      if (bi.complete && bi.naturalWidth) {
        const halo = bx.createRadialGradient(128, 140, 4, 128, 140, 54);
        halo.addColorStop(0, `rgba(${rgb},${0.9 * rev})`);
        halo.addColorStop(1, `rgba(${rgb},0)`);
        bx.fillStyle = halo;
        bx.fillRect(60, 72, 136, 136);
        bx.globalAlpha = smooth(Math.min(1, rev * 1.4));
        bx.drawImage(bi, 98, 110, 60, 60);
        bx.globalAlpha = 1;
      }
    }
    uploadBase = true;
    if (mode !== 'gl') baseData = null;
  }

  // ---------- the simulation ----------
  let cur = new Float32Array(N * N), prev = new Float32Array(N * N);
  const sim = () => {
    const nx = prev;
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < N - 1; x++) {
        const i = y * N + x;
        nx[i] = ((cur[i - 1] + cur[i + 1] + cur[i - N] + cur[i + N]) * 0.5 - nx[i]) * DAMP;
      }
    }
    prev = cur;
    cur = nx;
  };
  function drop(u, v, strength = 900, radius = 6) {
    if (still) return stillRing(u, v);
    const cx = Math.round(u * (N - 1)), cy = Math.round(v * (N - 1));
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const d = Math.hypot(x, y);
        const px = cx + x, py = cy + y;
        if (d > radius || px < 1 || py < 1 || px >= N - 1 || py >= N - 1) continue;
        cur[py * N + px] += strength * 0.5 * (1 + Math.cos((Math.PI * d) / radius));
      }
    }
    quiet = 0;
  }
  let quiet = 0, last = 0, acc = 0;

  // ---------- drawing ----------
  let mode = 'gl', gl = null, tBase = null, tH = null, uploadBase = true, hBytes = new Uint8Array(N * N), ctx2 = null, img2 = null, baseData = null;
  if (still || /[?&]webgl=off/.test(location.search)) mode = '2d';
  const resize = (px) => {
    const s = Math.max(128, Math.round(px));
    cv.width = cv.height = mode === 'gl' ? s : N;
    if (gl) gl.viewport(0, 0, s, s);
  };
  if (mode === 'gl') {
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('no webgl');
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(pr);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const tex = (unit) => {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      };
      tBase = tex(0);
      tH = tex(1);
      gl.uniform1i(gl.getUniformLocation(pr, 'uBase'), 0);
      gl.uniform1i(gl.getUniformLocation(pr, 'uH'), 1);
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        switchTo2d();
      });
    } catch (err) {
      gl = null;
      mode = '2d';
    }
  }
  function switchTo2d() {
    if (mode === '2d') return;
    mode = '2d';
    gl = null;
    // a lost context cannot give a 2d one on the same element, so the element is swapped
    const c2 = cv.cloneNode(false);
    cv.replaceWith(c2);
    cv = c2;
    c2.width = c2.height = N;
    ctx2 = c2.getContext('2d');
    img2 = ctx2.createImageData(N, N);
    uploadBase = true;
  }
  if (mode === '2d') {
    cv.width = cv.height = N;
    ctx2 = cv.getContext('2d');
    img2 = ctx2.createImageData(N, N);
  }

  function render() {
    if (mode === 'gl' && gl) {
      for (let i = 0; i < N * N; i++) hBytes[i] = Math.max(0, Math.min(255, 128 + cur[i] / 6));
      if (uploadBase) {
        gl.activeTexture(gl.TEXTURE0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, base);
        uploadBase = false;
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, N, N, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, hBytes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (ctx2) {
      if (!baseData) baseData = scaledBase();
      const o = img2.data;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i = y * N + x;
          const xm = x > 0 ? cur[i - 1] : 0, xp = x < N - 1 ? cur[i + 1] : 0, ym = y > 0 ? cur[i - N] : 0, yp = y < N - 1 ? cur[i + N] : 0;
          const gx = (xp - xm) / 1530, gy = (yp - ym) / 1530;
          const sx = Math.max(0, Math.min(N - 1, Math.round(x + gx * N * 0.12))), sy = Math.max(0, Math.min(N - 1, Math.round(y + gy * N * 0.12)));
          const s = (sy * N + sx) * 4;
          const lit = Math.max(0, -gx * 0.5 + gy * 0.6 - 0.04) * 150;
          o[i * 4] = Math.min(255, baseData[s] + lit);
          o[i * 4 + 1] = Math.min(255, baseData[s + 1] + lit * 0.86);
          o[i * 4 + 2] = Math.min(255, baseData[s + 2] + lit * 0.55);
          o[i * 4 + 3] = 255;
        }
      }
      ctx2.putImageData(img2, 0, 0);
      uploadBase = false;
    }
  }
  const scaledBase = () => {
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    x.drawImage(base, 0, 0, N, N);
    return x.getImageData(0, 0, N, N).data;
  };

  // ---------- the still path: the picture, and a CSS ring for a tap ----------
  function stillRing(u, v) {
    const r = document.createElement('i');
    r.className = 'w-ring';
    r.style.left = `${(u * 100).toFixed(1)}%`;
    r.style.top = `${(v * 100).toFixed(1)}%`;
    parent.append(r);
    r.addEventListener('animationend', () => r.remove(), { once: true });
    setTimeout(() => r.remove(), 2500);
  }
  function paintStill() {
    cv.width = cv.height = 256;
    cv.getContext('2d').drawImage(base, 0, 0);
  }

  const api = {
    drop,
    setReveal(r) {
      rv = Math.max(0, Math.min(1, r));
      draw(rv);
      if (still) paintStill();
    },
    setTarget(t) {
      target.side = t.side === 'evil' ? 'evil' : 'good';
      step = -1;
      draw(rv < 0 ? 0 : rv);
      if (still) paintStill();
    },
    clear() {
      cur.fill(0);
      prev.fill(0);
      quiet = 0;
    },
    /** one tick of the water. `dt` in seconds. Draws only while it moves, or when the picture changed. */
    frame(dt) {
      if (still || dead) return;
      acc = Math.min(0.05, acc + dt);
      let moved = false;
      while (acc >= 1 / 60) {
        acc -= 1 / 60;
        sim();
        moved = true;
      }
      if (moved) {
        let peak = 0;
        for (let i = 0; i < N * N; i += 7) peak = Math.max(peak, Math.abs(cur[i]));
        quiet = peak < 2 ? quiet + 1 : 0;
      }
      if (moved && quiet > 40 && !uploadBase) return; // flat water: nothing to redraw
      if (moved || uploadBase) render();
    },
    resize,
    destroy() {
      dead = true;
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
      cv.remove();
    },
  };
  if (still) {
    draw(0);
    paintStill();
  } else {
    resize(size);
    draw(0);
    render();
  }
  return api;
}
