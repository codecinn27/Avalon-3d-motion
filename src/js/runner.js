// Title runners (owner, 2026-11-17; story_line.md chapter 0 item 4, 001-banner decision 13).
// Two small figures take turns running across the letters of the hero title, one run each, never together:
//  - the Ink runner: trips on the A, rolls into the v, lies dazed, gets up, runs the a, arcs over the l onto the o,
//    runs the o and n, slides down the n's right side and fades out just past it;
//  - Merlin's apprentice: appears in a puff on the A, hops its peak, humps over the v, high jump over the l onto the o,
//    runs to the middle of the n, waves the wand and vanishes in a puff. Then the Ink runner drops onto the A again.
// A canvas inside the hero's .copy, so the figures fade and lift away with the title when the pin starts. The title stays
// real text: letters are measured with Ranges over its text nodes (SplitText wraps them, the text itself is untouched).
// The route is re-measured at the start of every lap and on resize. Paused while the copy is hidden or the tab is.
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const BODY = { lw: 0.075, head: 0.105, torso: 0.27, thigh: 0.21, shin: 0.21, upper: 0.15, fore: 0.14 };
const SIZE = 0.23; // figure height, as a share of the title's font size
const SPEED = 3.5; // figure heights per second
const NAVY = '#26366A', SOFT = '#5B5246';

export function initRunner({ animate = true } = {}) {
  const copy = document.querySelector('.hero .copy');
  const h1 = copy && copy.querySelector('.h1');
  if (!h1) return null;
  const cv = document.createElement('canvas');
  cv.className = 'runner';
  cv.setAttribute('aria-hidden', 'true');
  copy.append(cv);
  const ctx = cv.getContext('2d');
  const mctx = document.createElement('canvas').getContext('2d');
  const st = { t: 0, last: -1, parts: [], emit: 0, segs: [], total: 1, ready: false, lap: 0 };
  let ink = '#1B1712', paper = '#F3ECDF', gold = '#A8782A';

  // ---------- geometry from the live letters ----------
  function measure() {
    const cs = getComputedStyle(h1);
    const fs = parseFloat(cs.fontSize);
    const rs = getComputedStyle(document.documentElement);
    ink = cs.color || ink;
    paper = rs.getPropertyValue('--paper').trim() || paper;
    gold = rs.getPropertyValue('--gold').trim() || gold;
    // the canvas covers the title with room above for the jumps and to the right for the slide off the n
    const pad = { top: 1.05 * fs, left: 0.3 * fs, right: 0.65 * fs, bottom: 0.3 * fs };
    const w = h1.offsetWidth + pad.left + pad.right, h = h1.offsetHeight + pad.top + pad.bottom;
    Object.assign(cv.style, { left: `${h1.offsetLeft - pad.left}px`, top: `${h1.offsetTop - pad.top}px`, width: `${w}px`, height: `${h}px` });
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    st.w = w; st.h = h; st.dpr = dpr;
    const box = cv.getBoundingClientRect();
    const k = box.width ? w / box.width : 1; // undo any scale on the copy, so we work in the canvas's own pixels
    mctx.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    // every character of the title, from its text nodes
    const L = [];
    const walk = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      for (let i = 0; i < n.data.length; i++) {
        const ch = n.data[i];
        if (!ch.trim()) continue;
        range.setStart(n, i);
        range.setEnd(n, i + 1);
        const r = range.getBoundingClientRect();
        const m = mctx.measureText(ch);
        const x0 = (r.left - box.left) * k;
        const base = (r.bottom - box.top) * k - (m.fontBoundingBoxDescent || fs * 0.25);
        const l = x0 - m.actualBoundingBoxLeft, rt = x0 + m.actualBoundingBoxRight;
        L.push({ ch, l, r: rt, w: rt - l, cx: (l + rt) / 2, top: base - m.actualBoundingBoxAscent, base });
      }
    }
    if (L.length < 6) return false; // the route is drawn for "Avalon"
    const base = L[0].base;
    const topAt = (i, x) => {
      const c = L[i];
      if (c.ch !== 'o') return c.top;
      const rx = c.w / 2, ry = (base - c.top) / 2, u = clamp((x - c.cx) / rx, -0.7, 0.7);
      return c.top + ry * (1 - Math.sqrt(1 - u * u));
    };
    const surf = (x) => {
      for (let i = 0; i < L.length; i++) {
        if (x >= L[i].l && x <= L[i].r) return topAt(i, x);
        if (i < L.length - 1 && x > L[i].r && x < L[i + 1].l) return lerp(topAt(i, L[i].r), topAt(i + 1, L[i + 1].l), (x - L[i].r) / (L[i + 1].l - L[i].r));
      }
      return base;
    };
    st.g = { L, base, surf };
    st.s = fs * SIZE;
    build();
    st.ready = true;
    return true;
  }

  // ---------- one lap: the Ink runner, then Merlin's apprentice ----------
  function build() {
    const g = st.g, s = st.s, spd = SPEED * s, L = g.L, segs = [];
    const P = (x) => ({ x, y: g.surf(x) });
    const ext = (x, u) => (typeof x === 'function' ? x(u) : x);
    let who = 'ink';
    const seg = (dur, at, fx) => ({ dur, who, at, fx });
    const hold = (p, dur, pose, x = {}) => seg(dur, (u) => ({ x: p.x, y: p.y, pose, ...ext(x, u) }));
    const prep = (p) => seg(0.11, () => ({ x: p.x, y: p.y, pose: 'crouch' }));
    const land = (p) => seg(0.15, () => ({ x: p.x, y: p.y, pose: 'land' }), [{ t: 'dust', x: p.x, y: p.y }]);
    const hop = (p0, p1, h, dur) => seg(dur, (u) => {
      const yp = Math.min(p0.y, p1.y) - h, c = 2 * yp - (p0.y + p1.y) / 2;
      return { x: lerp(p0.x, p1.x, u), y: (1 - u) ** 2 * p0.y + 2 * u * (1 - u) * c + u * u * p1.y, pose: 'jump', moving: true };
    });
    const run = (x0, x1, yf = g.surf, x = {}) => seg(Math.abs(x1 - x0) / spd, (u) => {
      const xx = lerp(x0, x1, u);
      return { x: xx, y: yf(xx), pose: 'run', phi: (Math.abs(xx - x0) / (0.5 * s)) * Math.PI, moving: true, ...ext(x, u) };
    });
    const slide = (p0, p1, dur) => seg(dur, (u) => ({ x: lerp(p0.x, p1.x, u * u), y: lerp(p0.y, p1.y, u * u), pose: 'slide', moving: true }));

    const A = { x: L[0].cx, y: L[0].top }, H = g.base - L[0].top;
    const AE = P(L[2].r - 0.12 * L[2].w);
    const LT = { x: L[3].cx, y: L[3].top };
    const O = P(L[4].l + 0.3 * L[4].w);
    const N = P(L[5].r - 0.1 * L[5].w);
    const NM = P(L[5].cx);
    const peakOver = (p, q, above) => Math.min(p.y, q.y) - (LT.y - above); // hop height that tops the arc `above` px over the l

    // the Ink runner: wobble on the A, roll into the dip of the v, lie dazed, get up
    const V1 = P(L[1].l + 0.14 * L[1].w), V2 = P(L[1].r - 0.14 * L[1].w), dip = 0.38 * (g.base - L[1].top);
    const vy = (x) => lerp(V1.y, V2.y, (x - V1.x) / (V2.x - V1.x)) + dip * Math.sin(Math.PI * clamp((x - V1.x) / (V2.x - V1.x), 0, 1));
    const VB = { x: (V1.x + V2.x) / 2, y: 0 };
    VB.y = vy(VB.x);
    const cX = lerp(A.x, VB.x, 0.6), cY = A.y - 0.15 * s, LIE = 0.44 * s, ROLL = 3 * TAU - Math.PI / 2; // ends on its back
    segs.push(
      hold(A, 0.5, 'stand'), hold(A, 0.4, 'teeter'),
      seg(0.8, (u) => {
        const e = u ** 1.6;
        return { x: (1 - e) ** 2 * A.x + 2 * e * (1 - e) * cX + e * e * VB.x, y: (1 - e) ** 2 * A.y + 2 * e * (1 - e) * cY + e * e * VB.y, pose: 'tuck', rot: e * ROLL, moving: true };
      }),
      seg(0.6, () => ({ x: VB.x, y: VB.y, dy: LIE, pose: 'lie', rot: -Math.PI / 2, daze: true }), [{ t: 'dust', x: VB.x, y: VB.y }]),
      seg(0.45, (u) => {
        const e = u * u * (3 - 2 * u);
        return { x: VB.x, y: VB.y, dy: LIE * (1 - e), pose: u < 0.6 ? 'crouch' : 'stand', rot: (-Math.PI / 2) * (1 - e) };
      }),
      hold(VB, 0.2, 'stand'),
      run(VB.x, V2.x, vy), run(V2.x, AE.x),
    );
    // one arc just over the l onto the o, across the o and the n, slide down the n's right side and fade out
    const G0 = { x: L[5].r + 0.7 * s, y: g.base };
    segs.push(
      prep(AE), hop(AE, O, peakOver(AE, O, 0.35 * s), 0.62), land(O), run(O.x, N.x),
      slide(N, G0, 0.5), land(G0), run(G0.x, G0.x + 1.1 * s, () => g.base, (u) => ({ alpha: 1 - u })),
      hold(A, 0.35, 'stand', { alpha: 0 }),
    );

    // Merlin's apprentice: appear on the A's left slope, hop its peak, hump over the v, run the a
    who = 'merlin';
    const AL = { x: L[0].cx - 0.14 * L[0].w, y: L[0].top + H * 0.28 }, AR = { x: L[0].cx + 0.14 * L[0].w, y: AL.y };
    const A1 = P(L[2].l + 0.15 * L[2].w);
    segs.push(
      seg(0.28, (u) => ({ x: AL.x, y: AL.y, pose: 'stand', alpha: u }), [{ t: 'poof', x: AL.x, y: AL.y - 0.45 * s }]),
      hold(AL, 0.5, 'stand'), prep(AL), hop(AL, AR, 0.35 * s + (AL.y - A.y), 0.42), land(AR),
      prep(AR), hop(AR, A1, Math.min(AR.y, A1.y) - L[1].top + 0.3 * s, 0.5), land(A1), run(A1.x, AE.x),
    );
    // the big jump over the l onto the o, run to the middle of the n, wave the wand, vanish in a puff
    segs.push(
      prep(AE), hop(AE, O, peakOver(AE, O, 1.05 * s), 0.75), land(O), run(O.x, NM.x),
      hold(NM, 0.75, 'wave', { glow: true }),
      seg(0.12, (u) => ({ x: NM.x, y: NM.y, pose: 'wave', glow: true, alpha: 1 - u }), [{ t: 'poof', x: NM.x, y: NM.y - 0.45 * s }]),
      hold(NM, 0.55, 'stand', { alpha: 0 }),
    );

    // and the Ink runner drops back onto the A from above (the lap then starts again standing there)
    who = 'ink';
    segs.push(seg(0.55, (u) => ({ x: A.x, y: lerp(A.y - 2.6 * s, A.y, u * u), pose: 'jump', alpha: Math.min(1, u * 2.5), moving: true })), land(A));

    st.segs = segs;
    st.total = segs.reduce((a, b) => a + b.dur, 0);
  }

  function evalAt(t) {
    let tt = clamp(t, 0, st.total), i = 0;
    for (; i < st.segs.length - 1 && tt > st.segs[i].dur; i++) tt -= st.segs[i].dur;
    const sg = st.segs[i], u = sg.dur ? clamp(tt / sg.dur, 0, 1) : 1;
    return { i, state: { who: sg.who, facing: 1, alpha: 1, rot: 0, phi: 0, ...sg.at(u) } };
  }

  // ---------- poses: radians from straight down, positive = forward ----------
  function pose(p, tt) {
    const f = p.phi, PI = Math.PI;
    switch (p.pose) {
      case 'run': return { lean: 0.22,
        legs: [[0.75 * Math.sin(f), 0.2 + 1.1 * Math.max(0, Math.cos(f))], [0.75 * Math.sin(f + PI), 0.2 + 1.1 * Math.max(0, Math.cos(f + PI))]],
        arms: [[-0.9 * Math.sin(f), 1.4], [-0.9 * Math.sin(f + PI), 1.4]] };
      case 'crouch': return { lean: 0.35, legs: [[0.8, 1.5], [0.4, 1.2]], arms: [[-0.7, 0.3], [-0.9, 0.3]] };
      case 'land': return { lean: 0.3, legs: [[0.75, 1.4], [0.35, 1.1]], arms: [[1.1, 0.3], [0.9, 0.3]] };
      case 'jump': return { lean: 0.1, legs: [[1.0, 1.7], [0.35, 1.3]], arms: [[2.7, 0.2], [2.4, 0.2]] };
      case 'slide': return { lean: -0.3, legs: [[1.1, 0.15], [0.6, 1.0]], arms: [[2.4 + 0.12 * Math.sin(tt * 16), 0.1], [1.6, 0.2]] };
      case 'teeter': { const w = Math.sin(tt * 14); return { lean: 0.25 + 0.18 * Math.sin(tt * 10), legs: [[0.15, 0.1], [-0.1, 0.1]], arms: [[1.6 + 1.2 * w, 0.2], [1.6 - 1.2 * w, 0.2]] }; }
      case 'tuck': return { lean: 0.5, legs: [[1.5, 2.5], [1.3, 2.3]], arms: [[1.3, 1.5], [1.1, 1.5]] };
      case 'lie': { const k = 0.15 * Math.sin(tt * 6); return { lean: 0, legs: [[0.15 + k, 0.1], [-0.15, 0.1]], arms: [[0.7, 0.2], [-0.7 + k, 0.2]] }; }
      case 'wave': return { lean: -0.05, legs: [[0.1, 0.05], [-0.1, 0.05]], arms: [[2.5 + 0.35 * Math.sin(tt * 12), 0.25], [-0.2, 0.2]] };
      default: return { lean: 0, legs: [[0.1, 0.05], [-0.1, 0.05]], arms: [[0.25 + 0.04 * Math.sin(tt * 2.2), 0.2], [-0.2, 0.2]] };
    }
  }

  // ---------- drawing ----------
  function star(x, y, r, c) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.38 : r;
      ctx.lineTo(x + Math.sin(a) * rr, y - Math.cos(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  }

  function drawFig(p, tt) {
    const a0 = clamp(p.alpha, 0, 1);
    if (a0 <= 0) return;
    const s = st.s, B = BODY, A = pose(p, tt), lw = B.lw * s, merlin = p.who === 'merlin';
    const th = B.thigh * s, sh = B.shin * s, up = B.upper * s, fo = B.fore * s, to = B.torso * s, hr = B.head * s;
    const leg = ([a, k]) => { const kx = Math.sin(a) * th, ky = Math.cos(a) * th, b = a - k; return [kx, ky, kx + Math.sin(b) * sh, ky + Math.cos(b) * sh]; };
    const L1 = leg(A.legs[0]), L2 = leg(A.legs[1]);
    const hipH = Math.max(L1[3], L2[3]);
    ctx.save();
    ctx.translate(p.x, p.y + (p.dy || 0));
    ctx.scale(p.facing, 1);
    if (p.rot) { const c = -hipH - to * 0.5; ctx.translate(0, c); ctx.rotate(p.rot); ctx.translate(0, -c); }
    const hy = -hipH, nx = Math.sin(A.lean) * to, ny = hy - Math.cos(A.lean) * to;
    const hd = hr + lw * 0.7, cx = nx + Math.sin(A.lean) * hd, cy = ny - Math.cos(A.lean) * hd;
    const sx = lerp(0, nx, 0.82), sy = lerp(hy, ny, 0.82);
    const arm = ([a, e]) => { const ex = sx + Math.sin(a) * up, ey = sy + Math.cos(a) * up, b = a + e; return [ex, ey, ex + Math.sin(b) * fo, ey + Math.cos(b) * fo]; };
    const R1 = arm(A.arms[0]), R2 = arm(A.arms[1]);
    const poly = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.stroke(); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = ink;
    ctx.globalAlpha = a0 * 0.55; // far limbs lighter, for depth
    poly([sx, sy, R2[0], R2[1], R2[2], R2[3]]);
    poly([0, hy, L2[0], hy + L2[1], L2[2], hy + L2[3]]);
    ctx.globalAlpha = a0;
    poly([0, hy, nx, ny]);
    poly([0, hy, L1[0], hy + L1[1], L1[2], hy + L1[3]]);
    ctx.beginPath(); ctx.arc(cx, cy, hr, 0, TAU); ctx.fillStyle = paper; ctx.fill(); ctx.stroke();
    if (merlin) {
      const tip = Math.sin(tt * 3 + (p.phi || 0)) * 0.15 * hr;
      ctx.save();
      ctx.fillStyle = NAVY; ctx.lineWidth = lw * 0.6;
      ctx.beginPath(); ctx.moveTo(cx - 0.85 * hr, cy - 0.62 * hr); ctx.lineTo(cx + 0.85 * hr, cy - 0.72 * hr);
      ctx.quadraticCurveTo(cx + 0.15 * hr, cy - 2 * hr, cx - 0.95 * hr + tip, cy - 2.6 * hr); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = lw * 1.1; ctx.strokeStyle = NAVY; ctx.beginPath(); ctx.moveTo(cx - 1.3 * hr, cy - 0.6 * hr); ctx.lineTo(cx + 1.3 * hr, cy - 0.78 * hr); ctx.stroke();
      ctx.strokeStyle = gold; ctx.lineWidth = lw * 0.7; ctx.beginPath(); ctx.moveTo(cx - 0.72 * hr, cy - 0.86 * hr); ctx.lineTo(cx + 0.7 * hr, cy - 0.95 * hr); ctx.stroke();
      ctx.restore();
    }
    poly([sx, sy, R1[0], R1[1], R1[2], R1[3]]);
    if (merlin) {
      const dx = R1[2] - R1[0], dy = R1[3] - R1[1], d = Math.hypot(dx, dy) || 1, tx = R1[2] + (dx / d) * 0.24 * s, ty = R1[3] + (dy / d) * 0.24 * s;
      ctx.strokeStyle = SOFT; ctx.lineWidth = lw * 0.7; ctx.beginPath(); ctx.moveTo(R1[2], R1[3]); ctx.lineTo(tx, ty); ctx.stroke();
      star(tx, ty, (p.glow ? 0.11 : 0.06) * s * (1 + (p.glow ? 0.25 * Math.sin(tt * 20) : 0)), gold);
    }
    ctx.restore();
  }

  // ---------- particles: landing dust, sparks, puffs ----------
  function fire(f) {
    const s = st.s;
    if (f.t === 'dust') for (let i = 0; i < 5; i++) st.parts.push({ t: 'dust', x: f.x + (i - 2) * 0.07 * s, y: f.y - 0.02 * s, vx: (i - 2) * 0.55 * s, vy: -0.25 * s, r: 0.035 * s, life: 0.42, age: 0 });
    if (f.t === 'poof') {
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; st.parts.push({ t: 'puff', x: f.x, y: f.y, vx: Math.cos(a) * 1.3 * s, vy: Math.sin(a) * 1.1 * s, r: 0.12 * s, life: 0.55, age: 0 }); }
      for (let i = 0; i < 7; i++) { const a = Math.random() * TAU; st.parts.push({ t: 'spark', x: f.x, y: f.y, vx: Math.cos(a) * 1.8 * s, vy: Math.sin(a) * 1.8 * s - 0.6 * s, r: 0.09 * s, life: 0.7, age: 0 }); }
    }
  }
  function stepParts(dt) {
    const out = [];
    for (const q of st.parts) {
      q.age += dt;
      if (q.age > q.life) continue;
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy *= 0.92;
      out.push(q);
      const k = q.age / q.life;
      if (q.t === 'dust') { ctx.globalAlpha = 0.32 * (1 - k); ctx.fillStyle = SOFT; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 + k * 1.6), 0, TAU); ctx.fill(); }
      if (q.t === 'puff') { ctx.globalAlpha = 0.9 * (1 - k); ctx.fillStyle = paper; ctx.strokeStyle = SOFT; ctx.lineWidth = 0.03 * st.s; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 + k * 0.8), 0, TAU); ctx.fill(); ctx.stroke(); }
      if (q.t === 'spark') { ctx.globalAlpha = 1 - k; star(q.x, q.y, q.r * (1 - k * 0.6), gold); }
    }
    ctx.globalAlpha = 1;
    st.parts = out;
  }

  // ---------- loop ----------
  function render(dt, tt) {
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    ctx.clearRect(0, 0, st.w, st.h);
    st.t += dt;
    if (st.t >= st.total) {
      // a new lap: measure the title again (it may have moved or changed size) and start over standing on the A
      st.t -= st.total;
      st.last = -1;
      measure();
    }
    const { i, state } = evalAt(st.t);
    if (i !== st.last) { st.last = i; (st.segs[i].fx || []).forEach(fire); }
    if (state.who === 'merlin' && state.moving && state.alpha > 0.5 && dt > 0) {
      st.emit += dt * 38;
      while (st.emit >= 1) {
        st.emit--;
        st.parts.push({ t: 'spark', x: state.x - 0.12 * st.s + (Math.random() - 0.5) * 0.2 * st.s, y: state.y - Math.random() * 0.6 * st.s, vx: -0.3 * st.s, vy: -0.25 * st.s, r: 0.06 * st.s, life: 0.6, age: 0 });
      }
    }
    stepParts(dt);
    drawFig(state, tt);
    if (state.daze) { // little stars circling its head while it lies dazed in the v
      const s = st.s, hx = state.x - 0.5 * s, hy = state.y - 0.05 * s;
      for (let k = 0; k < 3; k++) { const a = tt * 5 + (k * TAU) / 3; star(hx + Math.cos(a) * 0.22 * s, hy - 0.12 * s + Math.sin(a) * 0.08 * s, 0.06 * s, gold); }
    }
  }

  const hidden = () => document.hidden || copy.style.visibility === 'hidden' || parseFloat(copy.style.opacity) < 0.02;
  let raf = 0, last = 0, clock = 0, startAt = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (now < startAt || !st.ready || hidden()) return; // nothing runs while the title is away
    if (startAt) { startAt = 0; measure(); } // the title has finished sliding in: measure it where it rests
    clock += dt;
    render(dt, clock);
  }

  const ro = new ResizeObserver(() => st.ready && measure() && !animate && render(0, 0));
  const begin = () => {
    if (!measure()) return;
    ro.observe(h1);
    if (!animate) return render(0, 0); // reduced motion: the Ink runner stands still on the A
    last = performance.now();
    startAt = last + 1400; // let the title's own reveal finish first
    raf = requestAnimationFrame(frame);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(begin, begin);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    cv.remove();
  };
}
