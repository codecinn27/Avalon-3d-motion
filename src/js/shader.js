// The silk backdrop: one small raw WebGL fragment shader, no library.
// Falls back to the CSS gradient layers when WebGL is missing or lost.
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uTheme;   // 0 = cream, 1 = dark
uniform float uNight;   // 1 = night: dark, but bluer, with no crimson fold
uniform float uScroll;

// cheap flowing field: a few layered sines warped by each other
float flow(vec2 p, float t){
  p += 0.35 * vec2(sin(p.y * 1.7 + t * 0.9), cos(p.x * 1.3 - t * 0.7));
  p += 0.22 * vec2(sin(p.y * 3.1 - t * 0.6), cos(p.x * 2.7 + t * 0.8));
  return 0.5 + 0.25 * sin(p.x * 1.9 + t) + 0.25 * sin(p.y * 2.3 - t * 0.8 + p.x);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  p.y += uScroll * 0.35;
  float t = uTime * 0.11;
  float a = flow(p * 1.15, t);
  float b = flow(p * 0.8 + 4.0, t * 1.3 + 2.0);
  float fold = smoothstep(0.25, 0.85, a) * (0.6 + 0.4 * b);

  // cream: warm paper, soft highlights, a breath of antique gold
  vec3 l0 = vec3(0.953, 0.925, 0.875);
  vec3 l1 = vec3(1.0, 0.985, 0.95);
  vec3 l2 = vec3(0.86, 0.78, 0.62);
  vec3 light = mix(l0, l1, fold);
  light = mix(light, l2, smoothstep(0.55, 1.0, b) * 0.38);
  light = mix(light, vec3(0.66, 0.47, 0.16), smoothstep(0.8, 1.0, a * b + 0.25) * 0.12);

  // dark: night blue, a crimson fold, a trace of candle gold
  vec3 d0 = vec3(0.043, 0.051, 0.071);
  vec3 d1 = vec3(0.14, 0.18, 0.33);
  vec3 d2 = vec3(0.50, 0.09, 0.13);
  vec3 dark = mix(d0, d1, fold * 0.75);
  dark = mix(dark, d2, smoothstep(0.5, 1.0, b) * (1.0 - a) * 0.6);
  dark += vec3(0.85, 0.64, 0.25) * smoothstep(0.86, 1.0, a) * 0.07;
  dark *= 1.0 - 0.35 * length(uv - 0.5);

  // night: deep blue, the fold stays cold, a few specks of gold
  vec3 n0 = vec3(0.024, 0.037, 0.095);
  vec3 n1 = vec3(0.09, 0.15, 0.36);
  vec3 night = mix(n0, n1, fold * 0.8);
  night = mix(night, vec3(0.16, 0.22, 0.46), smoothstep(0.5, 1.0, b) * (1.0 - a) * 0.4);
  night += vec3(0.85, 0.7, 0.35) * smoothstep(0.88, 1.0, a) * 0.05;
  night *= 1.0 - 0.4 * length(uv - 0.5);

  gl_FragColor = vec4(mix(mix(light, dark, uTheme), night, uNight), 1.0);
}`;

// still: phones and tablets (html.lite, spec 013). The silk does not drift or follow the scroll, so it is drawn only while
// the colours turn. A full-screen canvas redrawn on every frame took a third of a phone's frame time while scrolling.
export function initShader({ reduced = false, still = false } = {}) {
  const canvas = document.getElementById('silk');
  const holder = canvas && canvas.parentElement;
  if (!canvas) return null;
  // test hook: add ?webgl=off to the address to see the gradient fallback
  if (/[?&]webgl=off/.test(location.search)) return null;
  let gl;
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const compile = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = {
    res: gl.getUniformLocation(prog, 'uRes'),
    time: gl.getUniformLocation(prog, 'uTime'),
    theme: gl.getUniformLocation(prog, 'uTheme'),
    night: gl.getUniformLocation(prog, 'uNight'),
    scroll: gl.getUniformLocation(prog, 'uScroll'),
  };

  // The silk is soft, so it is drawn small and stretched. Pixel ratio is capped at 1.5.
  const SCALE = 0.5;
  let theme = 0, target = 0, nightV = 0, nightT = 0, raf = 0, running = false, lost = false, last = 0, clock = Math.random() * 40;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, clock);
    gl.uniform1f(u.theme, theme);
    gl.uniform1f(u.night, nightV);
    gl.uniform1f(u.scroll, still ? 0 : scrollY / max);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    raf = 0;
    if (!running || lost) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!reduced && !still) clock += dt;
    theme += (target - theme) * Math.min(1, dt * 3.2);
    if (Math.abs(target - theme) < 0.002) theme = target;
    nightV += (nightT - nightV) * Math.min(1, dt * 3.2);
    if (Math.abs(nightT - nightV) < 0.002) nightV = nightT;
    draw();
    // with reduced motion, or still, only keep drawing while the colours are turning
    if ((!reduced && !still) || theme !== target || nightV !== nightT) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (lost) return;
    running = true;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    stop();
    holder.classList.remove('gl');
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  addEventListener('resize', () => {
    resize();
    if ((reduced || still) && !lost) draw();
  }, { passive: true });
  if (reduced) addEventListener('scroll', () => !raf && !lost && requestAnimationFrame(draw), { passive: true });

  resize();
  draw();
  holder.classList.add('gl');
  if (!document.hidden) start();

  return {
    /** the page colour, straight from the scroll: d = cream to dark, n = night on top (0 to 1 each). No easing of its own. */
    setMix(d, n) {
      // still: theme.js calls this on every scroll frame, so only redraw when the colours really moved
      if (still && d === target && n === nightT && !raf) return;
      theme = target = d;
      nightV = nightT = n;
      if (lost) return;
      start();
    },
  };
}
