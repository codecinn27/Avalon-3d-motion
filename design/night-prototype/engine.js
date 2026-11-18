/* ---------- shared 3D scene engine (same maths as the planned build) ---------- */
const DEG = Math.PI / 180;
const RS = 217, P = 1600;                       // seat circle radius, perspective (design pixels at 1280 wide)
const WIDE = { fr: 0, dz: 0, tilt: 28, ty: 58 };
const LIFT = 46;                                // how far a woken card stands up (degrees)
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const near = (t, ref) => t + 360 * Math.round((ref - t) / 360);
const ANG = (i) => 90 + 36 * i;                 // seat 1 sits nearest the viewer, then clockwise
const zeros = () => ({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 });

const SEATS = [
  { name: 'Merlin', side: 'good', img: 'merlin' },
  { name: 'Assassin', side: 'evil', img: 'assassin' },
  { name: 'Loyal Servant', side: 'good', img: 'loyal-servant' },
  { name: 'Morgana', side: 'evil', img: 'morgana' },
  { name: 'Percival', side: 'good', img: 'percival' },
  { name: 'Loyal Servant', side: 'good', img: 'loyal-servant-3' },
  { name: 'Mordred', side: 'evil', img: 'mordred' },
  { name: 'Loyal Servant', side: 'good', img: 'loyal-servant-2' },
  { name: 'Oberon', side: 'evil', img: 'oberon' },
  { name: 'Loyal Servant', side: 'good', img: 'loyal-servant-4' },
];
// threads: [from seat, to seat, kind]. Evil triangle, Merlin's three, Percival's two.
const THR = [
  { i: 1, j: 3, kind: 'red' }, { i: 3, j: 6, kind: 'red' }, { i: 6, j: 1, kind: 'red' },
  { i: 0, j: 1, kind: 'light' }, { i: 0, j: 3, kind: 'light' }, { i: 0, j: 8, kind: 'light' },
  { i: 4, j: 0, kind: 'gold' }, { i: 4, j: 3, kind: 'gold' },
];
const SEES = { 0: [1, 3, 8], 1: [3, 6], 3: [1, 6], 6: [1, 3], 4: [0, 3] };
const KNOW = {
  0: 'Sees the Assassin, Morgana and Oberon as evil. Cannot see Mordred.',
  1: 'Knows Morgana and Mordred. Does not know Oberon.',
  3: 'Knows the Assassin and Mordred. Looks like Merlin to Percival.',
  4: 'Sees two cards that could be Merlin: Merlin and Morgana. Cannot tell which is real.',
  6: 'Knows the Assassin and Morgana. Merlin cannot see him.',
  8: 'Knows nobody. Oberon is alone in the dark.',
};
const SEEN = {
  0: 'Seen by Percival, who thinks he may be Merlin.',
  1: 'Seen by Merlin, Morgana and Mordred.',
  3: 'Seen by Merlin, the Assassin, Mordred and Percival.',
  4: 'Seen by nobody.',
  6: 'Seen by the Assassin and Morgana. Merlin cannot see him.',
  8: 'Seen by Merlin only.',
};
const word = (i, lens) => (lens === 'sees' ? KNOW[i] || 'Saw nothing at all.' : SEEN[i] || 'Seen by nobody.');

function almond() {
  const up = [], lo = [];
  for (let i = 0; i <= 20; i++) {
    const x = i * 5, t = (x - 50) / 50, y = 50 - 49 * (1 - t * t);
    up.push(`${x}% ${y.toFixed(1)}%`);
    lo.push(`${x}% ${(100 - y).toFixed(1)}%`);
  }
  return `polygon(${up.join(',')},${lo.reverse().join(',')})`;
}

function seatHTML(s, i) {
  return `<div class="seat ${s.side}" role="button" tabindex="0" data-i="${i}" aria-label="Seat ${i + 1}: ${s.name}. Tap to see what this player knows.">
    <i class="glow g-red"></i><i class="glow g-gold"></i><i class="glow g-ice"></i>
    <div class="lift"><div class="flip">
      <div class="face front"><div class="in"><img alt="" src="${IMG[s.img]}"><div class="nm">${s.name}<span>${s.side === 'evil' ? 'Evil' : 'Loyal'}</span></div><i class="badge"></i></div></div>
      <div class="face back"><div class="in"><img alt="" src="${IMG.back}">
        <div class="eye"><div class="eye-in"><i class="iris"></i><i class="lid up"></i><i class="lid lo"></i></div><i class="seam"></i><i class="lashes"></i><i class="eye-glow"></i></div>
      </div></div>
    </div></div>
    <i class="selring"></i><span class="hint"><i></i></span>
  </div>`;
}

function createScene(stage, cfg = {}) {
  const orbit = cfg.orbit !== false;
  const CLOSE = Object.assign({ fr: 1, dz: 1050, tilt: 48, ty: 6 }, cfg.close || {});
  stage.classList.add('stage');
  stage.style.setProperty('--almond', almond());
  stage.style.setProperty('--b-evil', `url("${IMG.evil}")`);
  stage.style.setProperty('--b-good', `url("${IMG.good}")`);
  stage.insertAdjacentHTML('beforeend', `
    <div class="sky day"></div><div class="sky night"></div>
    ${cfg.sky ? '<div class="sky3d"></div>' : ''}
    <div class="plane">
      <div class="table"><i class="dim"></i></div>
      <div class="thrs"></div><div class="seats"></div><div class="extras"></div>
    </div>
    <div class="say"><b></b><span></span></div>
    <div class="who" hidden><div class="row"><h4></h4><span class="lens" role="group" aria-label="Lens"><button type="button" data-lens="sees" aria-pressed="true">Sees</button><button type="button" data-lens="seen" aria-pressed="false">Seen by</button></span><button class="x" type="button" aria-label="Close">×</button></div><p></p></div>
    ${cfg.tag ? `<div class="tag">${cfg.tag}</div>` : ''}`);

  const $ = (q) => stage.querySelector(q);
  const plane = $('.plane'), skyNight = $('.sky.night'), dim = $('.table .dim');
  const say = { b: $('.say b'), s: $('.say span') };
  const who = $('.who');
  $('.seats').innerHTML = SEATS.map(seatHTML).join('');
  $('.thrs').innerHTML = THR.map((t) => `<div class="thr ${t.kind}"><i class="sh"></i><i class="ln"></i></div>`).join('');

  const seats = [...stage.querySelectorAll('.seat')].map((el, i) => ({
    el, i,
    lift: el.querySelector('.lift'), flip: el.querySelector('.flip'),
    eye: el.querySelector('.eye'), lidU: el.querySelector('.lid.up'), lidL: el.querySelector('.lid.lo'),
    seam: el.querySelector('.seam'), lash: el.querySelector('.lashes'), iris: el.querySelector('.iris'), eglow: el.querySelector('.eye-glow'),
    red: el.querySelector('.g-red'), gold: el.querySelector('.g-gold'), ice: el.querySelector('.g-ice'),
    ring: el.querySelector('.selring'), hint: el.querySelector('.hint'),
  }));
  const thr = [...stage.querySelectorAll('.thr')].map((el, k) => ({ el, ln: el.querySelector('.ln'), sh: el.querySelector('.sh'), ...THR[k] }));

  // scroll camera S, explorer camera X, blend weight ex.e
  const S = { a: 90, ...WIDE };
  const X = { a: 90, ...CLOSE };
  const st = { night: 0, eyeVis: 0, hint: 0, eye: zeros(), lift: zeros(), red: zeros(), gold: zeros(), ice: zeros(), thr: { ...zeros(), 8: 0, 9: 0 } };
  const ex = { e: 0, lift: zeros(), eye: zeros(), red: zeros(), gold: zeros(), ice: zeros(), thr: { ...zeros() }, sel: zeros() };
  const yawExtra = { v: 0 };
  let sel = -1, lens = 'sees', u = 0.3, visible = true;
  const listeners = { select: [] };
  const hooks = [];

  function layout() {
    const w = stage.clientWidth || 600;
    u = w / 1280;
    stage.style.setProperty('--u', u.toFixed(4));
    seats.forEach((s) => {
      const a = ANG(s.i) * DEG;
      s.x = Math.cos(a) * RS; s.y = Math.sin(a) * RS;
      s.el.style.transform = `translate3d(${(s.x * u).toFixed(2)}px,${(s.y * u).toFixed(2)}px,${(3 * u).toFixed(2)}px) rotate(${s.i * 36}deg) scale(.5)`;
    });
    thr.forEach((t) => {
      const A = seats[t.i], B = seats[t.j];
      const dx = B.x - A.x, dy = B.y - A.y;
      t.len = Math.hypot(dx, dy);
      t.el.style.width = `${(t.len * u).toFixed(2)}px`;
      t.el.style.transform = `translate3d(${(A.x * u).toFixed(2)}px,${(A.y * u).toFixed(2)}px,0) rotate(${(Math.atan2(dy, dx) / DEG).toFixed(2)}deg)`;
    });
  }
  new ResizeObserver(layout).observe(stage);
  layout();
  new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(stage);

  const cache = new WeakMap();
  const put = (el, key, val) => {
    let c = cache.get(el);
    if (!c) cache.set(el, (c = {}));
    if (c[key] === val) return;
    c[key] = val;
    if (key === 't') el.style.transform = val;
    else el.style.opacity = val;
  };

  function camera() {
    const e = ex.e, c = {};
    for (const k of ['a', 'fr', 'dz', 'tilt', 'ty']) c[k] = S[k] + (X[k] - S[k]) * e;
    return c;
  }

  function render() {
    if (!visible) return;
    const c = camera();
    const yaw = (orbit ? 90 - c.a : 0) + yawExtra.v;
    const yr = yaw * DEG, fa = c.a * DEG;
    const Fx = c.fr * RS * Math.cos(fa), Fy = c.fr * RS * Math.sin(fa);
    const px = Fx * Math.cos(yr) - Fy * Math.sin(yr), py = Fx * Math.sin(yr) + Fy * Math.cos(yr);
    const f = P / (P - c.dz);
    put(plane, 't', `translate3d(0px,${((c.ty / f) * u).toFixed(2)}px,${(c.dz * u).toFixed(2)}px) rotateX(${c.tilt.toFixed(2)}deg) translate3d(${(-px * u).toFixed(2)}px,${(-py * u).toFixed(2)}px,0px) rotateZ(${yaw.toFixed(2)}deg)`);
    skyNight.style.opacity = st.night.toFixed(3);
    dim.style.opacity = (st.night * 0.9).toFixed(3);
    stage.classList.toggle('is-night', st.night > 0.45);

    for (const s of seats) {
      const i = s.i;
      const L = Math.max(st.lift[i], ex.lift[i]);
      const O = Math.max(st.eye[i], ex.eye[i]);
      const fl = smooth(clamp((L - 0.12) / 0.62));
      put(s.lift, 't', `rotateX(${(-LIFT * smooth(L)).toFixed(1)}deg) translateZ(${(L * 16 * u).toFixed(2)}px)`);
      put(s.flip, 't', `rotateY(${(180 * (1 - fl)).toFixed(1)}deg)`);
      put(s.eye, 'o', (st.eyeVis * (1 - fl)).toFixed(3));
      put(s.lidU, 't', `scaleY(${(1 - O).toFixed(3)})`);
      put(s.lidL, 't', `scaleY(${(1 - O).toFixed(3)})`);
      put(s.seam, 'o', (1 - O * 1.6 > 0 ? 1 - O * 1.6 : 0).toFixed(3));
      put(s.lash, 'o', (0.9 * (1 - O * 1.6 > 0 ? 1 - O * 1.6 : 0)).toFixed(3));
      put(s.iris, 't', `scale(${(0.75 + 0.25 * O).toFixed(3)})`);
      put(s.eglow, 'o', O.toFixed(3));
      put(s.red, 'o', clamp(Math.max(st.red[i], ex.red[i])).toFixed(3));
      put(s.gold, 'o', clamp(Math.max(st.gold[i], ex.gold[i])).toFixed(3));
      put(s.ice, 'o', clamp(Math.max(st.ice[i], ex.ice[i])).toFixed(3));
      put(s.ring, 'o', ex.sel[i].toFixed(3));
      put(s.hint, 'o', st.hint.toFixed(3));
    }
    thr.forEach((t, k) => {
      const a = clamp(Math.max(st.thr[k], ex.thr[k]));
      put(t.ln, 't', `translateZ(${(20 * u).toFixed(2)}px) scaleX(${a.toFixed(3)})`);
      put(t.sh, 't', `translateZ(${u.toFixed(2)}px) scaleX(${a.toFixed(3)})`);
    });
    hooks.forEach((h) => h(c, yaw));
  }
  gsap.ticker.add(render);

  /* ----- explorer: tap a seat, the camera flies in, threads and glows show what that player knows ----- */
  function lensTargets() {
    const T = { thr: zeros(), red: zeros(), gold: zeros(), ice: zeros() };
    T.thr = { ...zeros() };
    if (sel < 0) return T;
    const sees = (a, b) => (SEES[a] || []).includes(b);
    thr.forEach((t, k) => {
      const other = t.i === sel ? t.j : t.j === sel ? t.i : -1;
      if (other < 0) return;
      const ok = lens === 'sees' ? sees(sel, other) : sees(other, sel);
      if (!ok) return;
      T.thr[k] = 1;
      const col = lens === 'sees' ? (t.kind === 'gold' ? 'gold' : 'red') : t.kind === 'light' ? 'ice' : t.kind;
      T[col][other] = 1;
    });
    return T;
  }
  function paintWho() {
    if (sel < 0) return (who.hidden = true);
    who.hidden = false;
    const s = SEATS[sel];
    who.querySelector('h4').innerHTML = `${s.name}<i>${s.side === 'evil' ? 'Evil' : 'Loyal'} · seat ${sel + 1}</i>`;
    who.querySelector('p').textContent = word(sel, lens);
    who.querySelectorAll('[data-lens]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lens === lens)));
  }
  function applyLens(fast) {
    const T = lensTargets();
    const d = fast ? 0 : 0.6;
    for (const key of ['thr', 'red', 'gold', 'ice']) gsap.to(ex[key], { ...T[key], duration: d, ease: 'power2.out', overwrite: 'auto' });
    const L = zeros(); if (sel >= 0) L[sel] = 1;
    gsap.to(ex.lift, { ...L, duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' });
    gsap.to(ex.eye, { ...L, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(ex.sel, { ...L, duration: 0.4, overwrite: 'auto' });
    paintWho();
  }
  function select(i) {
    if (i === sel) return close();
    const first = ex.e < 0.02;
    sel = i;
    const a = near(ANG(i), first ? S.a : X.a);
    gsap.killTweensOf(yawExtra);
    gsap.to(yawExtra, { v: near(0, yawExtra.v), duration: 1, ease: 'power2.inOut' });
    if (first) Object.assign(X, { a, ...CLOSE });
    else gsap.to(X, { a, ...CLOSE, duration: 1, ease: 'power2.inOut', overwrite: 'auto' });
    gsap.to(ex, { e: 1, duration: 1.15, ease: 'power2.inOut', overwrite: 'auto' });
    applyLens(false);
    listeners.select.forEach((fn) => fn(i));
  }
  function close(fast) {
    if (sel < 0 && ex.e < 0.01) return;
    sel = -1;
    gsap.to(ex, { e: 0, duration: fast ? 0.01 : 1.0, ease: 'power2.inOut', overwrite: 'auto' });
    applyLens(fast);
  }

  seats.forEach((s) => {
    s.el.addEventListener('click', (e) => { e.stopPropagation(); if (!stage._dragged) select(s.i); });
    s.el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(s.i); }
      if (sel >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); const n = (sel + (e.key === 'ArrowRight' ? 1 : 9)) % 10; select(n); seats[n].el.focus({ preventScroll: true }); }
    });
  });
  stage.addEventListener('keydown', (e) => e.key === 'Escape' && close());
  stage.addEventListener('click', (e) => { if (!e.target.closest('.who') && !stage._dragged) close(); });
  who.querySelector('.x').addEventListener('click', () => close());
  who.querySelectorAll('[data-lens]').forEach((b) => b.addEventListener('click', () => { lens = b.dataset.lens; applyLens(false); }));

  /* ----- drag to turn the table (optional) ----- */
  if (cfg.drag) {
    let down = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.who') || sel >= 0) return;
      down = { x: e.clientX, last: e.clientX, t: performance.now(), v: 0, moved: 0, id: e.pointerId };
      stage._dragged = false;
    });
    stage.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.last;
      down.moved += Math.abs(dx);
      if (down.moved > 6) { stage._dragged = true; stage.setPointerCapture(e.pointerId); gsap.killTweensOf(yawExtra); }
      if (stage._dragged) { yawExtra.v += dx * 0.32; const now = performance.now(); down.v = dx / Math.max(1, now - down.t); down.t = now; }
      down.last = e.clientX;
    });
    const up = () => {
      if (!down) return;
      if (stage._dragged) gsap.to(yawExtra, { v: yawExtra.v + down.v * 140, duration: 1.2, ease: 'power3.out' });
      down = null;
      setTimeout(() => (stage._dragged = false), 30);
    };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
  }

  return {
    stage, plane, seats, thr, S, X, st, ex, yawExtra, hooks, CLOSE, orbit,
    extras: $('.extras'), sky: $('.sky3d'),
    get u() { return u; },
    get sel() { return sel; },
    say(a, b) { if (say.b.textContent !== a) say.b.textContent = a; if (say.s.textContent !== (b || '')) say.s.textContent = b || ''; },
    select, close, render, on: (ev, fn) => listeners[ev].push(fn),
    resetTurn() { gsap.to(yawExtra, { v: near(0, yawExtra.v), duration: 1, ease: 'power2.inOut' }); },
  };
}
