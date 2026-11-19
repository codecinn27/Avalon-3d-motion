// Chapter 2, the night (spec docs/section/005-the-night-falls.md). Runs inside the pinned hero, after the deal.
// Watch only (decision 9). It owns one camera (orbit and dolly), the per seat numbers (eye, lift, glow), the threads,
// crystals, focus rings, the moon and stars, and the words. cards.js calls frame() once per tick and reads back the
// plane transform and each card's lift. Everything follows the scroll: nothing here runs on a timer except the slow
// spin of the crystals and rings. Only transform and opacity change per frame, and only when a value changed.
const DEG = Math.PI / 180;
const PERSP = 1600; // the ring's perspective in the wide view, see .ring in main.css
const PFAR = 5000; // the ring's perspective in a close up: a long lens, so a standing card keeps its 2:3 shape (decision 12)
const RS0 = 217; // radius of the circle of seats on the prototype (1280 wide). u = table.rs / RS0 scales every design size
const LIFT = 46; // degrees a woken card stands up
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const near = (t, ref) => t + 360 * Math.round((ref - t) / 360); // the same angle, the short way round from ref
const ANG = (i) => 90 + 36 * i; // seat 1 sits nearest the viewer, then clockwise
const zeros = (n = 10) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i, 0]));
const pick = (seats, v) => Object.fromEntries(seats.map((s) => [s, v]));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const html = (s) => {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild;
};

// an almond for the eye: two arcs, as a clip-path polygon
const ALMOND = (() => {
  const up = [], lo = [];
  for (let i = 0; i <= 20; i++) {
    const x = i * 5, t = (x - 50) / 50, y = 50 - 49 * (1 - t * t);
    up.push(`${x}% ${y.toFixed(1)}%`);
    lo.push(`${x}% ${(100 - y).toFixed(1)}%`);
  }
  return `polygon(${up.join(',')},${lo.reverse().join(',')})`;
})();

const EYE = '<div class="eye"><div class="eye-in"><i class="iris"></i><i class="lid up"></i><i class="lid lo"></i></div><i class="seam"></i><i class="lashes"></i><i class="eye-glow"></i></div>';
const GEM = `<div class="gem-wrap"><div class="gem"><div class="gem-spin">${[0, 1, 2, 3].map((k) => `<i class="gf t" style="--k:${k};--l:${[58, 44, 34, 50][k]};--ang:${150 + k * 40}deg"></i>`).join('')}${[0, 1, 2, 3].map((k) => `<i class="gf b" style="--k:${k};--l:${[38, 28, 22, 32][k]};--ang:${200 + k * 30}deg"></i>`).join('')}</div></div></div>`;
const ARM = '<div class="arm-wrap"><div class="arm"><div class="arm-s"><i class="rg r1"></i><i class="rg r2"></i><i class="rg r3"></i><i class="orb"></i></div></div></div>';

export function createNight(o) {
  const { gsap, sec, ring, slots, table, desktop, SS, theme, data, tableEl } = o;
  const T = data.text;
  const n = slots.length;
  const seatOf = (slug) => data.roles.indexOf(slug);

  // ---------- the layers night.js adds. The plain page stays slim: none of this exists without scripts ----------
  const under = html(`<div class="n-plane n-under" aria-hidden="true"><div class="n-thrs">${data.threads.map((t) => `<div class="thr ${t[2]}" style="visibility:hidden"><i class="sh"></i><i class="ln"></i></div>`).join('')}</div><div class="n-glows">${slots.map(() => '<div class="n-g"><i class="glow g-red"></i><i class="glow g-gold"></i></div>').join('')}</div></div>`);
  const over = html(`<div class="n-plane n-over" aria-hidden="true">${GEM.repeat(4)}${ARM}</div>`);
  const sky = html('<div class="n-sky" aria-hidden="true"></div>');
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  sky.innerHTML = `<i class="moon"></i>${Array.from({ length: desktop ? 24 : 8 }, () => `<i class="star" style="--x:${(rnd() * 1500 - 750).toFixed(0)};--y:${(rnd() * 560 - 330).toFixed(0)};--z:${(rnd() * 840 - 900).toFixed(0)}"><b style="animation-delay:${(rnd() * 2.8).toFixed(2)}s"></b></i>`).join('')}`;
  ring.prepend(sky);
  // draw order, back to front: sky, table, glows and threads (under), the ten cards, crystals and focus rings (over).
  // The ring is flat during the night (cards.js adds .is-flat), so this order is exact and nothing is left to depth sorting.
  if (tableEl) tableEl.after(under);
  else ring.prepend(under);
  ring.append(over);
  ring.style.setProperty('--almond', ALMOND);
  const dim = html('<i class="dim"></i>');
  if (tableEl) tableEl.append(dim);

  const seats = slots.map((el, i) => {
    el.querySelector('.card-back .in').insertAdjacentHTML('beforeend', EYE);
    const q = (s) => el.querySelector(s);
    const g = under.querySelectorAll('.n-g')[i];
    return { el, i, eye: q('.eye'), lidU: q('.lid.up'), lidL: q('.lid.lo'), seam: q('.seam'), lash: q('.lashes'), iris: q('.iris'), eglow: q('.eye-glow'), g, red: g.children[0], gold: g.children[1] };
  });
  const thr = [...under.querySelectorAll('.thr')].map((el) => ({ ln: el.querySelector('.ln'), sh: el.querySelector('.sh'), el }));
  const gems = [...over.querySelectorAll('.gem-wrap')].map((el) => ({ el, gem: el.querySelector('.gem'), spin: el.querySelector('.gem-spin'), seat: -1 }));
  const arm = { el: over.querySelector('.arm-wrap'), s: over.querySelector('.arm-s') };
  const moon = sky.querySelector('.moon');

  // ---------- the words: one element per line, faded and slid by the scroll (decision 10) ----------
  // Twelve lines for eight steps. Times are in the night's own units (see build): the line is on screen from its time.
  const BEATS = [
    [0.6, T.fall, T.fallSub], [5.4, T.evil], [13.7, T.traitors], [15.5, T.oberon],
    [19.3, T.merlin], [23.1, T.merlinSees, T.merlinSub], [26.5, T.percival], [30.3, T.percivalSees, T.percivalSub],
    [33.3, T.others],
  ];
  const say = sec.querySelector('.night-say');

  // ---------- state ----------
  // st: everything the story sets, tweened by the timeline. S: the camera, numbers 0 to 1 between the wide view and the
  // close up, except a (degrees, unwrapped so it turns the short way).
  const S = { a: 90, fr: 0, dz: 0, tl: 0, ty: 0, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0, w7: 0, w8: 0 }; // w6: the arc in front of the table (010), w7: the empty table seen wide, w8: toward the lit seat (011). w1, w2: how far the camera is in the quest's two poses (007), see pose(). w3, w4: the water (008) and the short flash of it (009), w5: five cards from straight above (009)
  const st = { night: 0, eyeVis: 0, eye: zeros(), lift: zeros(), red: zeros(), gold: zeros(), ring: zeros(), thr: zeros(thr.length) };
  const L = new Array(n).fill(0); // read by cards.js: how far each card stands up, and how far it has turned face up
  const FL = new Array(n).fill(0);
  const Z = new Array(n).fill(2); // z-index of each card: the nearer to the viewer, the later it is drawn
  // the later chapters (vote.js, quest.js) share this camera and this plane. X is what they ask of each seat card: slide
  // (dx, dy in plane pixels), lift z, turn dr (degrees), scale sc and opacity op. cards.js reads it when it writes a card's transform.
  const X = { dx: zeros(), dy: zeros(), dz: zeros(), dr: zeros(), sc: Array(n).fill(1), op: Array(n).fill(1) };
  // seats.js (labels): F = how much the story is about each seat now (0 to 1, every chapter adds to it), NB = 1 hides that seat's badge for now (a reveal is still to come)
  const F = new Array(n).fill(0);
  const NB = new Array(n).fill(0);
  const HID = new Array(n).fill(0); // 1 hides a seat's number and label (the vote: the team in the middle gives way to the vote cards and the count)
  const api = { noAsk: false, win: 0, plane: '', L, FL, Z, X, F, NB, HID, S, table, active: false, shade: 0, after: [], late: [], planes: [], onMeasure: [], poses: {}, u: 1, rs: 217, ringTop: 0, tilt: 28 };
  let nt = null, nightV = -1;
  let u = 1, zoom = 2.5, tiltW = 28, tiltC = 48, tyW = 0, tyC = 0, hh = 0, fs = 0.1, rs = 217;
  let memo = new WeakMap();
  const lite = document.documentElement.classList.contains('lite');
  // phones (spec 013, CP-16): a layer faded with put(el, 'o') is also hidden while its opacity is 0 (the same as CP-4's threads). At
  // opacity 0 it draws nothing but still costs the GPU a surface inside the 3D ring (CP-15). An element a chapter hides itself with
  // put(el, 'v') is left to that chapter.
  const put = (el, k, v) => {
    let m = memo.get(el);
    if (!m) memo.set(el, (m = {}));
    if (m[k] === v) return;
    m[k] = v;
    if (k === 't') el.style.transform = v;
    else if (k === 'o') {
      el.style.opacity = v;
      if (lite && !('v' in m)) el.style.visibility = +v < 0.002 ? 'hidden' : '';
    } else if (k === 'v') el.style.visibility = v;
    else if (k === 'face') v ? (el.dataset.face = v) : delete el.dataset.face;
    else el.style.setProperty(k, v);
  };
  api.put = put;
  // turn a vote, quest or climb card (its .pc-3d) to e: 0 = face down, 1 = face up. Phones (spec 013, CP-9): a card that is not
  // turning is flat and shows only the face that is up (data-face, see main.css), as the seat cards in cards.js (CP-6).
  // A 3D context per card made the GPU draw every such card off screen first.
  // CP-10 (owner's choice: option C, plain): on phones the turn is flat too, a 2D squash. scaleX goes 1 → 0 with the face that
  // is down, the face swaps at the edge (e = 0.5), then 0 → 1 with the face that is up. Ten vote cards turning together in 3D made
  // 19 passes per frame and a 2.9 s freeze. Desktops keep the real 3D turn.
  api.turn = (el, e) => {
    if (lite) {
      put(el, 'face', e > 0.5 ? 'front' : 'back');
      if (e <= 0 || e >= 1) return put(el, 't', '');
      const sx = Math.max(0.01, Math.abs(Math.cos(Math.PI * (1 - e))));
      put(el, 't', `scaleX(${sx.toFixed(3)})`);
    } else {
      put(el, 'face', '');
      put(el, 't', `rotateY(${(180 * (1 - e)).toFixed(2)}deg)`);
    }
  };

  // ---------- measuring (called by hero() whenever the table is measured) ----------
  function measure(vw, vh, ringTop, baseW) {
    memo = new WeakMap();
    rs = table.rs;
    u = rs / RS0;
    api.u = u;
    api.rs = rs;
    api.ringTop = ringTop;
    api.vw = vw;
    api.vh = vh;
    ring.style.setProperty('--u', u.toFixed(4));
    hh = slots[0].querySelector('.card').offsetHeight / 2;
    fs = table.k / SS; // local pixels of a card to real pixels
    // close up: the standing card about 40% of the screen tall (and not wider than 55% of it). With the long lens the card
    // faces the camera almost square on, so its height on screen is close to its height times the zoom.
    const cw0 = table.k * baseW;
    zoom = clamp(Math.min((0.4 * vh) / (1.5 * cw0), (0.55 * vw) / cw0), 1.6, 4.5);
    tiltW = table.tilt;
    tiltC = desktop ? 48 : 40;
    tyW = table.y;
    // where the seat centre must sit so the middle of the standing card lands at 56% of the screen height
    const c = Math.cos(LIFT * DEG), s = Math.sin(LIFT * DEG), zl = 8 * u / fs;
    const cy = (hh * (1 - c) + zl * s) * fs, cz = (hh * s + zl * c) * fs + 3;
    const lift = (cy * Math.cos(tiltC * DEG) - cz * Math.sin(tiltC * DEG)) * zoom; // the card's middle, below the seat centre (negative: above)
    tyC = 0.56 * vh - ringTop - lift;
    seats.forEach((s) => {
      const P = table.pos[s.i];
      put(s.g, 't', `translate3d(${P.x.toFixed(1)}px,${P.y.toFixed(1)}px,${(1.5 * u).toFixed(1)}px) rotate(${P.rot}deg)`);
    });
    thr.forEach((t, k) => {
      const A = table.pos[data.threads[k][0]], B = table.pos[data.threads[k][1]];
      const dx = B.x - A.x, dy = B.y - A.y;
      t.el.style.width = `${Math.hypot(dx, dy).toFixed(1)}px`;
      t.el.style.transform = `translate3d(${A.x.toFixed(1)}px,${A.y.toFixed(1)}px,0) rotate(${(Math.atan2(dy, dx) / DEG).toFixed(2)}deg)`;
    });
    api.tilt = tiltW;
    api.poses = {};
    (api.onMeasure || []).forEach((fn) => fn(api));
  }

  /**
   * A camera pose for the quest (007): the numbers are worked out for this screen, so they can be blended in by a weight
   * (S.w1, S.w2). The point `at` (table pixels, z above the table) is put at screen height `y` (from the middle of the ring).
   */
  function pose(name, { a, fr, f, tilt, at, y }) {
    const d = (f - 1) / (zoom - 1);
    const P = PERSP + (PFAR - PERSP) * d;
    const yr = (90 - a) * DEG, tr = tilt * DEG;
    const y1 = at[0] * Math.sin(yr) + at[1] * Math.cos(yr) - fr * rs;
    const Yr = y1 * Math.cos(tr) - at[2] * Math.sin(tr), Zr = y1 * Math.sin(tr) + at[2] * Math.cos(tr);
    api.poses[name] = { a, fr, d, tilt, ty: y * (1 - (f * Zr) / P) - f * Yr };
  }

  // ---------- one frame ----------
  const T0 = performance.now();
  function frame() {
    if (!api.active) {
      api.active = true;
      ring.classList.add('is-night');
    }
    const clock = (performance.now() - T0) / 1000;
    // the camera. The lens gets longer as it moves in: the perspective grows with the dolly, and the dolly distance is
    // worked out from the zoom wanted, so the close up is seen from further away (decision 12)
    // base camera from the night's numbers, then the quest's two poses blended on top (007)
    let ca = S.a, cfr = S.fr, cd = S.dz, tilt = tiltW + (tiltC - tiltW) * S.tl, ty = tyW + (tyC - tyW) * S.ty;
    for (const [name, w] of [['hand', S.w1], ['top', S.w2], ['water', S.w3], ['flash', S.w4], ['top5', S.w5], ['arc', S.w6], ['wide', S.w7], ['seat', S.w8]]) {
      const p = api.poses[name];
      if (!p || w < 0.0005) continue;
      ca += (near(p.a, ca) - ca) * w;
      cfr += (p.fr - cfr) * w;
      cd += (p.d - cd) * w;
      tilt += (p.tilt - tilt) * w;
      ty += (p.ty - ty) * w;
    }
    const yaw = 90 - ca;
    const yr = yaw * DEG, fa = ca * DEG;
    const fx = cfr * rs * Math.cos(fa), fy = cfr * rs * Math.sin(fa);
    const px = fx * Math.cos(yr) - fy * Math.sin(yr), py = fx * Math.sin(yr) + fy * Math.cos(yr);
    const f = 1 + (zoom - 1) * cd;
    const P = PERSP + (PFAR - PERSP) * cd;
    const dz = P * (1 - 1 / f);
    put(ring, 'perspective', `${P.toFixed(1)}px`);
    api.plane = `translate3d(0px,${(ty / f).toFixed(2)}px,${dz.toFixed(2)}px) rotateX(${tilt.toFixed(2)}deg) translate3d(${(-px).toFixed(2)}px,${(-py).toFixed(2)}px,0px) rotateZ(${yaw.toFixed(2)}deg)`;
    put(under, 't', api.plane);
    put(over, 't', api.plane);
    for (const el of api.planes) put(el, 't', api.plane);
    seats
      .map((s) => [table.pos[s.i].x * Math.sin(yr) + table.pos[s.i].y * Math.cos(yr), s.i])
      .sort((p, q) => p[0] - q[0])
      .forEach((p, r) => (Z[p[1]] = 2 + r));
    // night: the page colour follows the scroll exactly (decision 11), and so do the sky, the moon and the table dim
    const nv = st.night;
    if (theme && nv !== nightV) theme.setNight((nightV = nv));
    put(sky, '--sk', nv.toFixed(3));
    put(sky, 't', `translate3d(0px,${(table.y - 58 * u).toFixed(1)}px,0px) rotateX(${((tilt - tiltW) * -0.35).toFixed(2)}deg) rotateY(${(Math.sin(yaw * DEG) * 7).toFixed(2)}deg)`);
    put(moon, 't', `translate3d(${(380 * u).toFixed(1)}px,${((-215 + (1 - nv) * 300) * u).toFixed(1)}px,${(-420 * u).toFixed(1)}px)`);
    if (tableEl) put(dim, 'o', clamp(nv * 0.9 + api.shade).toFixed(3));
    // seats
    for (const s of seats) {
      const i = s.i;
      const l = st.lift[i], O = st.eye[i];
      L[i] = l;
      F[i] = clamp(Math.max(l, st.red[i], st.gold[i], st.ring[i]));
      NB[i] = 0;
      HID[i] = 0;
      FL[i] = clamp((l - 0.12) / 0.62);
      const shut = Math.max(0, 1 - O * 1.6);
      put(s.eye, 'o', st.eyeVis.toFixed(3));
      put(s.lidU, 't', `scaleY(${(1 - O).toFixed(3)})`);
      put(s.lidL, 't', `scaleY(${(1 - O).toFixed(3)})`);
      put(s.seam, 'o', shut.toFixed(3));
      put(s.lash, 'o', (0.9 * shut).toFixed(3));
      put(s.iris, 't', `scale(${(0.75 + 0.25 * O).toFixed(3)})`);
      put(s.eglow, 'o', O.toFixed(3));
      put(s.red, 'o', clamp(st.red[i]).toFixed(3));
      put(s.gold, 'o', clamp(st.gold[i]).toFixed(3));
    }
    // an undrawn thread (scaleX 0) is hidden: it would still cost the GPU an off-screen surface for its blur and its 3D (spec 013, CP-4)
    thr.forEach((th, k) => {
      const a = clamp(st.thr[k]).toFixed(3);
      put(th.el, 'v', +a < 0.002 ? 'hidden' : '');
      put(th.ln, 't', `translateZ(${(20 * u).toFixed(1)}px) scaleX(${a})`);
      put(th.sh, 't', `translateZ(${u.toFixed(2)}px) scaleX(${a})`);
    });
    // four crystals, handed from seat to seat: a crystal shows over any seat that is lit red or gold
    for (const g of gems) if (g.seat >= 0 && lit(g.seat) < 0.003) g.seat = -1;
    for (const s of seats) {
      if (lit(s.i) < 0.003 || gems.some((g) => g.seat === s.i)) continue;
      const free = gems.find((g) => g.seat < 0);
      if (free) free.seat = s.i;
    }
    gems.forEach((g, k) => {
      if (g.seat < 0) return put(g.el, 'v', 'hidden');
      const i = g.seat, Q = table.pos[i], s = clamp(lit(i) * 1.4), gs = (0.15 + 0.85 * s).toFixed(3);
      put(g.el, 'v', 'visible');
      put(g.gem, '--hue', st.gold[i] > st.red[i] ? '42' : '350');
      put(g.el, 't', `translate3d(${Q.x.toFixed(1)}px,${Q.y.toFixed(1)}px,${((140 + Math.sin(clock * 1.8 + k) * 5) * u).toFixed(1)}px) rotateX(-90deg) scale3d(${gs},${gs},${gs})`);
      put(g.spin, 't', `rotateY(${((clock * (desktop ? 51 : 34) + k * 80) % 360).toFixed(1)}deg)`);
    });
    // focus rings: on the seat with the strongest ring value (Merlin or Percival, never the evil step)
    let rb = -1, rv = 0.003;
    for (const s of seats) if (st.ring[s.i] > rv) ((rv = st.ring[s.i]), (rb = s.i));
    if (rb < 0) put(arm.el, 'v', 'hidden');
    else {
      const Q = table.pos[rb], rs3 = (0.3 + 0.7 * clamp(rv)).toFixed(3);
      put(arm.el, 'v', 'visible');
      put(arm.el, 't', `translate3d(${Q.x.toFixed(1)}px,${Q.y.toFixed(1)}px,${(70 * u).toFixed(1)}px) rotateX(-90deg) scale3d(${rs3},${rs3},${rs3})`);
      put(arm.s, 't', `rotateX(${(28 * Math.sin(clock * 1.9)).toFixed(1)}deg) rotateY(${((clock * 40) % 360).toFixed(1)}deg)`);
    }
    // the vote and the quest draw their own layers with the same camera
    for (const fn of api.after) fn(clock);
    for (const fn of api.late) fn(clock);
  }
  const lit = (i) => clamp(Math.max(st.red[i], st.gold[i]));

  /** the lift of card i as a transform tail, in the card's own pixels (after the scale), hinged on the rim side edge */
  function liftTail(i) {
    const l = L[i];
    if (l < 0.0005) return '';
    return ` translateY(${hh.toFixed(1)}px) rotateX(${(-LIFT * smooth(l)).toFixed(2)}deg) translateZ(${((l * 8 * u) / fs).toFixed(1)}px) translateY(${(-hh).toFixed(1)}px)`;
  }

  /** the scroll went back above the night: hide every layer and hand the page colour back */
  function sleep() {
    if (!api.active) return;
    api.active = false;
    ring.classList.remove('is-night');
    ring.style.perspective = '';
    memo = new WeakMap();
    if (theme && nightV !== 0) theme.setNight((nightV = 0));
  }

  /**
   * Adds the whole night to the hero timeline at `at`. `perScreen` is how many timeline units one screen of scroll is.
   * Returns the night's length in timeline units. The night is written in its own units: one unit is the same length of
   * scroll as the prototype's (36.6 units = 4 screens on a desktop, 3.4 on a phone).
   */
  function build(tl, at, perScreen) {
    const unitsPerScreen = 36.6 / (desktop ? 4 : 3.4);
    const HALF = unitsPerScreen / 2; // half a screen: how long the page takes to turn to night, and back (decision 11)
    nt = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const evil = [seatOf('assassin'), seatOf('morgana'), seatOf('mordred')];
    const [merlin, percival, oberon] = [seatOf('merlin'), seatOf('percival'), seatOf('oberon')];
    const idx = (kind) => data.threads.map((t, k) => (t[2] === kind ? k : -1)).filter((k) => k >= 0);
    const [tRed, tLight, tGold] = [idx('red'), idx('light'), idx('gold')];
    const CL = { fr: 1, dz: 1, tl: 1, ty: 1 };
    let cur = 90;
    const look = (t, d, seat) => {
      const a = near(ANG(seat), cur);
      cur = a;
      nt.to(S, { a, ...CL, duration: d }, t);
    };
    const out = (t, d) => nt.to(S, { fr: 0, dz: 0, tl: 0, ty: 0, duration: d }, t);
    // the eye opens, the card stands up and turns face up, then a glow. Focus rings only for Merlin and Percival (not the evil step).
    const wake = (seat, t, glow, rings) => {
      nt.to(st.eye, { [seat]: 1, duration: 0.5 }, t);
      nt.to(st.lift, { [seat]: 1, duration: 0.8 }, t + 0.4);
      if (glow) nt.to(st[glow], { [seat]: 1, duration: 0.6 }, t + 0.6);
      if (rings) nt.to(st.ring, { [seat]: 1, duration: 0.7 }, t + 1);
    };
    const sleepAgain = (seats, t, groups) => {
      nt.to(st.lift, { ...pick(seats, 0), duration: 0.8 }, t);
      nt.to(st.eye, { ...pick(seats, 0), duration: 0.5 }, t + 0.6);
      nt.to(st.ring, { ...pick(seats, 0), duration: 0.5 }, t);
      groups.forEach((g) => nt.to(st[g], { ...pick(seats, 0), duration: 0.6 }, t));
    };
    // 1 night falls: over half a screen the page turns to night, the table dims, closed eyes appear, moon and stars, a slow push in
    nt.to(st, { night: 1, duration: HALF, ease: 'sine.inOut' }, 0.3);
    nt.to(st, { eyeVis: 1, duration: 1.6 }, 1.6);
    nt.to(S, { dz: 0.08, duration: 5 }, 0.3);
    // 2 evil wakes: the Assassin, Morgana, then Mordred, each in a close up (everything after the night falls is the
    // prototype's timing plus 3.5)
    evil.forEach((s, k) => {
      const t = [5.5, 7.9, 10.3][k];
      look(t, 1.3, s);
      wake(s, t + 1.1, 'red', false);
    });
    // 3 the traitors find each other
    out(12.9, 1.4);
    tRed.forEach((k, m) => nt.to(st.thr, { [k]: 1, duration: 0.9, ease: 'power1.out' }, 13.9 + m * 0.3));
    // 4 Oberon works alone, then the three traitors close their eyes
    look(15.5, 1.3, oberon);
    out(17.9, 1.2);
    nt.to(st.thr, { ...pick(tRed, 0), duration: 0.8 }, 17.9);
    sleepAgain(evil, 18, ['red']);
    // 5 Merlin wakes and sees three, not Mordred
    look(19.5, 1.3, merlin);
    wake(merlin, 20.6, null, true);
    out(22.5, 1.3);
    tLight.forEach((k, m) => nt.to(st.thr, { [k]: 1, duration: 0.9, ease: 'power1.out' }, 23.3 + m * 0.25));
    nt.to(st.red, { ...pick(data.sees[merlin], 1), duration: 0.6 }, 23.9);
    nt.to(st.thr, { ...pick(tLight, 0), duration: 0.7 }, 25.7);
    nt.to(st.red, { ...pick(data.sees[merlin], 0), duration: 0.6 }, 25.7);
    sleepAgain([merlin], 25.7, []);
    // 6 Percival wakes and sees two Merlins
    look(26.7, 1.3, percival);
    wake(percival, 27.8, null, true);
    out(29.7, 1.3);
    tGold.forEach((k, m) => nt.to(st.thr, { [k]: 1, duration: 0.9, ease: 'power1.out' }, 30.5 + m * 0.3));
    nt.to(st.gold, { ...pick(data.sees[percival], 1), duration: 0.6 }, 30.9);
    nt.to(st.thr, { ...pick(tGold, 0), duration: 0.7 }, 32.7);
    nt.to(st.gold, { ...pick(data.sees[percival], 0), duration: 0.6 }, 32.7);
    sleepAgain([percival], 32.7, []);
    // 7 everyone else saw nothing (33.3). 8 dawn: every eye opens on the face down cards, the table turns back to its
    // resting turn, and over half a screen the moon sets and the page goes back to cream
    const D = 34.8;
    nt.to(S, { a: near(90, cur), duration: 1.6 }, D);
    nt.to(st.eye, { ...pick([...Array(n).keys()], 1), duration: 0.9 }, D + 0.2);
    nt.to(st, { night: 0, duration: HALF, ease: 'sine.inOut' }, D + 0.4);
    const end = D + 0.4 + HALF + 0.6;
    nt.to(st, { eyeVis: 0, duration: 1 }, end - 1.6);
    // the words: each line slides and fades in, and the one before it out, over the same stretch of scroll
    const beats = [...BEATS, [D, T.open], [D + 2.6, T.know]];
    say.innerHTML = beats.map((b) => `<p class="ns"><b>${esc(b[1])}</b>${b[2] ? `<span>${esc(b[2])}</span>` : ''}</p>`).join('');
    const lines = [...say.children];
    gsap.set(lines, { autoAlpha: 0, y: 22 });
    lines.forEach((el, k) => {
      const t = beats[k][0];
      nt.fromTo(el, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'power2.out', immediateRender: false }, t - 0.4);
      if (k + 1 < lines.length) nt.to(el, { autoAlpha: 0, y: -18, duration: 1, ease: 'power1.in' }, beats[k + 1][0] - 0.9);
    });
    nt.to({}, { duration: 0.1 }, end - 0.1);
    const len = (end / unitsPerScreen) * perScreen;
    nt.timeScale(end / len);
    tl.add(nt, at);
    return len;
  }

  function destroy() {
    if (nt) nt.kill();
    if (theme) theme.setNight(0);
    seats.forEach((s) => s.el.querySelector('.eye').remove());
    [under, over, sky, dim].forEach((el) => el && el.remove());
    ring.classList.remove('is-night');
    ['--u', '--almond', 'perspective'].forEach((p) => ring.style.removeProperty(p));
    say.innerHTML = '';
  }

  api.lastLine = () => say.lastElementChild;
  return Object.assign(api, { measure, frame, sleep, liftTail, build, destroy, pose, zeros });
}
