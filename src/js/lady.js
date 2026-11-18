// Chapter 5, the Lady of the Lake (spec docs/section/008-lady-of-the-lake.md). Runs inside the pinned hero, after the quest.
// The second hands-on moment: the visitor touches the water (water.js). Everything else follows the scroll both ways.
// Like quest.js, the reveal mixes a tap (a timed tween) with the scroll (scrubbed): `Ly.t`, the scroll position inside the chapter in
// screens, is read every frame. The painting, the standing Lady card, the lines and the words are built here; chapter 6 (climb.js)
// reuses the standing card, the word, the lines (lineSet) and the water.
import { sayLines } from './say.js';
import { createWater } from './water.js';
import { IMG, esc, fill } from './quest.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const DEG = Math.PI / 180;
const html = (s) => {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild;
};

// where the story waits for the visitor (screens from the start of the chapter, 008 "Scroll budget")
const TAP0 = 1.05, S0 = 1.6, S1 = 1.8; // the water is a button from TAP0, the scroll reveals it from S0, the last of it landing at S1
const POOL = 1.508; // the water is 58% of the table across, the table is 2.6 radii across
const CARD_W = 158; // the standing Lady card, built twice its size (design pixels), shown at half
let pulsed = false; // the edge pulse plays twice per visit (kept for the page's life, not stored)

/**
 * Lines on the table, flat strips with a soft shadow, the same element and classes as the night's threads.
 * defs: [{ from, to, kind }] with seats 0 to 9 and kind 'gold', 'red' or 'pale'. Each item has `a` (drawn, 0 to 1) and `o` (opacity).
 * They stop a little short of each seat so they don't run under the cards.
 */
export function lineSet(night, defs, gap = 0.1) {
  const el = html(`<div class="n-thrs x-thrs">${defs.map((d) => `<div class="thr ${d.kind}"><i class="sh"></i><i class="ln"></i></div>`).join('')}</div>`);
  const items = [...el.children].map((e) => ({ e, ln: e.querySelector('.ln'), sh: e.querySelector('.sh'), a: 0, o: 1, swivel: 0 }));
  const { put, table } = night;
  function measure() {
    const g = gap * night.rs;
    defs.forEach((d, k) => {
      const A = table.pos[d.from], Bp = table.pos[d.to];
      const dx = Bp.x - A.x, dy = Bp.y - A.y, len = Math.hypot(dx, dy);
      items[k].e.style.width = `${Math.max(0, len - 2 * g).toFixed(1)}px`;
      items[k].e.style.transform = `translate3d(${(A.x + (dx / len) * g).toFixed(1)}px,${(A.y + (dy / len) * g).toFixed(1)}px,0) rotate(${(Math.atan2(dy, dx) / DEG).toFixed(2)}deg)`;
      // how far the card at the start turns toward the end: a third of the way (the same swivel as 007)
      items[k].swivel = wrap(Math.atan2(dx, -dy) / DEG - A.rot) / 3;
    });
  }
  function frame() {
    const u = night.u;
    items.forEach((it) => {
      const a = clamp(it.a), o = clamp(it.o);
      if (a < 0.002 || o < 0.002) return put(it.e, 'v', 'hidden');
      put(it.e, 'v', 'visible');
      put(it.ln, 't', `translateZ(${(20 * u).toFixed(1)}px) scaleX(${a.toFixed(3)})`);
      put(it.sh, 't', `translateZ(${u.toFixed(2)}px) scaleX(${a.toFixed(3)})`);
      put(it.ln, 'o', o.toFixed(3));
      put(it.sh, 'o', o.toFixed(3));
    });
  }
  return { el, items, measure, frame };
}

export function createLady({ gsap, sec, ring, night, vote, quest, desktop, data, deck }) {
  const T = data.text;
  const holder = data.holder - 1, target = data.target - 1;
  const order = data.turn.order.map((s) => s - 1);
  const { S, X, table, put } = night;
  const V = vote.V;
  const B = quest.B;
  const W = [holder, target]; // the places the Lady stands, in order. Chapter 6 adds its own (Ly.leg walks along them)
  const n = 10;

  // ---------- the layers ----------
  const plane = (cls, inner, hide = true) => {
    const el = html(`<div class="n-plane ${cls}"${hide ? ' aria-hidden="true"' : ''}>${inner}</div>`);
    ring.append(el);
    night.planes.push(el);
    return el;
  };
  const wp = plane('x-under l-wp', `<div class="l-pool" data-pool><div class="l-wc"></div><i class="l-mist"></i><i class="l-hint"></i></div>`, false);
  const pool = wp.querySelector('.l-pool');
  const wc = wp.querySelector('.l-wc');
  const mist = wp.querySelector('.l-mist');
  const defs = [{ from: holder, to: target, kind: 'gold' }, { from: holder, to: target, kind: 'red' }, ...order.map((s) => ({ from: s, to: target, kind: 'pale' }))];
  const lines = lineSet(night, defs);
  const lp = plane('x-under l-lp', '');
  lp.append(lines.el);
  const fl = plane('x-flat l-fl', `<div class="pc pcp lc"><i class="pc-glow gold"></i><div class="pc-3d" style="transform:none"><span class="pc-side pc-front"><span class="pc-in"><img src="${IMG('lady_of_the_lake', 320)}" srcset="${IMG('lady_of_the_lake', 320)} 320w, ${IMG('lady_of_the_lake', 640)} 640w" sizes="160px" alt="" width="320" height="480" decoding="async"><span class="l-nm">${esc(T.name)}</span></span></span></div></div><div class="l-word l-evil">${esc(T.evil)}</div>`);
  const card = fl.querySelector('.lc');
  const cardGlow = fl.querySelector('.pc-glow');
  const word = fl.querySelector('.l-evil');
  const paint = html(`<figure class="l-paint" aria-hidden="true"><span class="pc-side pc-front"><span class="pc-in"><img src="${IMG('lady_of_the_lake', 640)}" srcset="${IMG('lady_of_the_lake', 320)} 320w, ${IMG('lady_of_the_lake', 640)} 640w, ${IMG('lady_of_the_lake', 960)} 960w" sizes="(max-width: 820px) 80vw, 46svh" alt="" width="640" height="960" decoding="async"><span class="l-nm">${esc(T.name)}</span></span></span></figure>`);
  sec.append(paint);
  const live = sec.querySelector('[data-lady-live]');
  const say = sec.querySelector('.lady-say');

  // ---------- state ----------
  const Ly = {
    t: 0, shade: 0, rise: 0, fly: 0, gl: 0, // the painting: rises, flies to seat 7, the standing card glows
    water: 0, dim: 0, // the lake: how much of it shows, and how dim it is after the truth
    ev: 0, evSeat: holder, gold: 0, // "Evil.": how much shows, over which seat, and 1 when it is gold (chapter 6: the truth)
    tag: 0, sink: 0, leg: 0, // Merlin's label, how far seat 3 has sunk, where the Lady stands (along W)
    side: 0, rvx: 0, // chapter 6's flash (009): 1 when the water shows evil (red), and how much of its reflection the timeline shows
  };
  const R = { fired: false, timed: 0, tw: null, dropped: false, rv: 0, say: false, xdrop: false, side: 'good' };
  const msgs = { red: '' }; // chapter 6 sets what a screen reader hears when the water shows red
  let water = null, wasOnWater = false, wasLive = false, wasOpen = false, lastClock = 0, nextDrip = 0, lastHover = 0, wasWater = false, size = 512;
  let pw = 0, ph = 0, moving = false, wtilt = 28;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- measuring ----------
  function measure() {
    const vw = night.vw, vh = night.vh, rs = night.rs;
    const D = POOL * rs;
    // camera into the water (008 "The camera"): the circle about 62% of the screen height on a desktop, 86% of the width on a phone,
    // centred about 8% below the middle so the words above stay clear
    const tilt = desktop ? 12 : 8;
    const f = desktop ? (0.62 * vh) / (D * Math.cos(tilt * DEG)) : (0.86 * vw) / D;
    night.pose('water', { a: 90, fr: 0, f: clamp(f, 1.2, 7), tilt, at: [0, 0, 0], y: 0.58 * vh - night.ringTop });
    size = clamp(Math.round((desktop ? 0.62 * vh : 0.86 * vw) * Math.min(devicePixelRatio || 1, 2)), 256, 1024);
    if (water) water.resize(size);
    lines.measure();
    ph = Math.min(0.66 * vh, 1.5 * 0.8 * vw);
    pw = ph / 1.5;
    paint.style.setProperty('--w', `${pw.toFixed(1)}px`);
    wtilt = night.tilt;
    flown = false;
  }
  let flown = false;
  night.onMeasure.push(measure);
  if (night.vw) measure();
  const onResize = () => (flown = false);
  addEventListener('resize', onResize, { passive: true });

  // ---------- the touch (008 "The reveal") ----------
  const say1 = (s) => live && (live.textContent = s);
  const uvOf = (e) => {
    const r = e.target;
    const w = r.clientWidth || 1, h = r.clientHeight || 1;
    return [clamp(e.offsetX / w), clamp(e.offsetY / h)];
  };
  const isOpen = () => Ly.t >= TAP0 && Ly.t < S1;
  function tap(u, v) {
    if (!water || !isOpen()) return;
    if (!R.fired) {
      R.fired = 'tap';
      try {
        if (!reduced()) navigator.vibrate && navigator.vibrate(12);
      } catch (e) {}
      R.tw = gsap.to(R, { timed: 1, duration: 1.5, ease: 'expo.out' });
    }
    water.drop(u, v, 900, 6);
  }
  const offs = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };
  on(pool, 'pointerdown', (e) => {
    if (!isOpen()) return;
    const [u, v] = uvOf(e);
    tap(u, v);
  });
  on(pool, 'pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !water || !wasLive) return;
    const now = performance.now();
    if (now - lastHover < 55) return;
    lastHover = now;
    const [u, v] = uvOf(e);
    water.drop(u, v, 260, 3);
  });
  on(pool, 'keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && isOpen()) {
      e.preventDefault();
      tap(0.5, 0.5);
    }
  });
  function resetReveal() {
    if (R.tw) R.tw.kill();
    R.tw = null;
    R.timed = 0;
    R.fired = false;
    R.dropped = false;
    R.say = false;
    say1('');
    if (water) water.clear();
  }
  function setOpen(on) {
    if (on === wasOpen) return;
    wasOpen = on;
    pool.classList.toggle('is-open', on);
    if (on) {
      pool.setAttribute('role', 'button');
      pool.tabIndex = 0;
      pool.setAttribute('aria-label', T.poolLabel);
      if (!pulsed) {
        pulsed = true;
        pool.classList.add('is-hint');
        pool.querySelector('.l-hint').addEventListener('animationend', () => pool.classList.remove('is-hint'), { once: true });
      }
    } else {
      pool.removeAttribute('role');
      pool.removeAttribute('aria-label');
      pool.tabIndex = -1;
    }
  }

  // ---------- one frame (after quest.frame, so the seat cards' numbers are already set) ----------
  const stand = (i) => {
    const P = table.pos[i];
    return [P.x * 0.75, P.y * 0.75];
  };
  function frame(clock) {
    const dt = Math.min(0.05, Math.max(0, clock - lastClock));
    lastClock = clock;
    const t = Ly.t, u = night.u, P = table.pos;
    night.shade = Math.max(night.shade, Ly.shade);
    // reset the reveal when the scroll goes back above the tap window
    if (t < TAP0 - 0.02 && (R.fired || R.timed > 0 || R.dropped)) resetReveal();
    // the water: made when first reached, stopped and cleared when the scroll leaves it
    const wet = Ly.water > 0.002;
    if (wet && !water) {
      water = createWater(wc, { size });
      water.setReveal(R.rv);
    }
    if (wet !== wasWater) {
      wasWater = wet;
      if (!wet && water) {
        water.clear();
        R.say = false;
        say1('');
      }
    }
    // hover ripples from the moment the water forms until the camera pulls back; the button only in the tap window
    const hov = Ly.water > 0.5 && t < 1.95;
    if (hov !== wasLive) {
      wasLive = hov;
      pool.classList.toggle('is-live', hov);
    }
    setOpen(isOpen() && Ly.water > 0.5);
    let rv = 0;
    if (water && wet) {
      const red = Ly.side > 0.5;
      if ((red ? 'evil' : 'good') !== R.side) water.setTarget({ side: (R.side = red ? 'evil' : 'good') });
      const sc = clamp((t - S0) / (S1 - S0));
      if (red) {
        // chapter 6's flash: watch only, the timeline drives it
        if (Ly.rvx > 0.02 && !R.xdrop) {
          R.xdrop = true;
          water.drop(0.5, 0.5, 900, 6);
        }
        if (Ly.rvx < 0.001) R.xdrop = false;
        rv = Ly.rvx;
      } else {
        if (t >= S0 && !R.dropped && !R.fired) {
          R.dropped = true;
          water.drop(0.5, 0.5, 900, 6);
        }
        if (t < S0 && !R.fired) R.dropped = false;
        rv = Math.max(R.timed, sc);
      }
      if (isOpen() && wasOpen && clock > nextDrip) {
        nextDrip = clock + 2 + Math.random();
        water.drop(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, 200, 3);
      }
      if (Math.abs(rv - R.rv) > 0.0005) water.setReveal((R.rv = rv));
      water.frame(dt);
      const done = rv > 0.999;
      if (done !== R.say) {
        R.say = done;
        say1(done ? (Ly.side > 0.5 ? msgs.red : T.blue) : '');
      }
    }
    put(wp.firstElementChild, 'v', wet ? 'visible' : 'hidden');
    put(pool, 't', `translate3d(0px,0px,${(1.2 * u).toFixed(1)}px)`);
    put(pool, 'o', (Ly.water * (1 - 0.5 * Ly.dim)).toFixed(3));
    put(mist, 'o', (0.55 * (1 - R.rv)).toFixed(3));

    // the lines: gold (0), red (1), pale (2 on). The cards at their starts turn toward seat 3
    lines.frame();
    // the labels: who the lines run between, the holder once she arrives, Merlin's turn to stay silent. Seat 3's badge waits for the water
    const F = night.F;
    const about = (it, ...ss) => ss.forEach((s) => (F[s] = Math.max(F[s], clamp(it.a) * clamp(it.o))));
    about(lines.items[0], holder, target);
    about(lines.items[1], holder, target);
    order.forEach((s, k) => about(lines.items[2 + k], s, target));
    F[holder] = Math.max(F[holder], clamp((Ly.fly - 0.8) / 0.2) * (1 - clamp(Ly.leg * 4)));
    F[0] = Math.max(F[0], clamp(Ly.tag));
    if (Ly.side < 0.5 && R.rv < 0.999 && t < LEN - 0.3) night.NB[target] = 1;
    for (let k = 0; k < order.length; k++) X.dr[order[k]] += lines.items[2 + k].swivel * smooth(clamp(lines.items[2 + k].a));
    X.op[target] *= 1 - 0.154 * Ly.sink;
    X.sc[target] *= 1 - 0.0435 * Ly.sink;

    // the Lady's card: stands in the table plane a quarter of the way in from the rim, and walks along W
    const tilt = wtilt;
    const leg = clamp(Ly.leg, 0, W.length - 1);
    const i0 = Math.min(W.length - 2, Math.floor(leg)), f = smooth(leg - i0);
    const a = stand(W[i0]), b = stand(W[i0 + 1]);
    const hs = 0.375 * CARD_W * u; // half the card's height at half size
    const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f), z = (2 + Math.sin(Math.PI * f) * 20) * u;
    const co = clamp((Ly.fly - 0.8) / 0.2);
    put(card, 'v', Ly.fly > 0.001 ? 'visible' : 'hidden');
    put(card, '--o', co.toFixed(3));
    put(card, 't', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(${(-tilt).toFixed(2)}deg) translateY(${(-hs).toFixed(1)}px) scale3d(0.5,0.5,0.5)`);
    put(cardGlow, 'o', clamp(Ly.gl).toFixed(3));
    // "Evil." stands above its seat, rising a little as it comes in
    const wordAt = (el, seat, k, lift, out = 0) => {
      if (k < 0.003) return put(el, 'v', 'hidden');
      const q = P[seat];
      put(el, 'v', 'visible');
      put(el, 'o', clamp(k).toFixed(3));
      // beside the seat, outward, so it never runs into the words at the top of the screen
      put(el, 't', `translate3d(${(q.x * 0.8 + (q.x < 0 ? -1 : 1) * out * night.rs).toFixed(1)}px,${(q.y * 0.8).toFixed(1)}px,${(2 * u).toFixed(1)}px) rotateX(${(-tilt).toFixed(2)}deg) translateY(${(-(lift + (1 - clamp(k)) * -14) * u).toFixed(1)}px) scale3d(0.5,0.5,0.5) translate(-50%,-100%)`);
    };
    word.classList.toggle('gold', Ly.gold > 0.5);
    wordAt(word, Ly.evSeat, Ly.ev, 46, 0.46);
    // the table fills the screen behind the words while the camera is in the water: they turn cream, like the quest's close ups
    const onWater = S.w3 > 0.5;
    if (onWater !== wasOnWater) {
      wasOnWater = onWater;
      say.classList.toggle(desktop ? 'on-table' : 'on-wood', onWater); // a phone's table only reaches the words at the top of a small screen, so there the words get a cream halo
    }

    // the painting: rises, holds, flies down onto the standing card
    const e = 1 - Math.pow(1 - clamp(Ly.rise), 3);
    const isMoving = Ly.rise > 0.002 && Ly.fly < 0.999;
    if (isMoving !== moving) {
      moving = isMoving;
      paint.style.willChange = moving ? 'transform' : 'auto';
    }
    if (!isMoving) {
      put(paint, 'v', 'hidden');
    } else {
      const sr = sec.getBoundingClientRect();
      let cx = sr.width / 2, cy = 0.62 * sr.height, sc = 1;
      const fy = smooth(clamp(Ly.fly));
      if (Ly.fly > 0.001) {
        const r = card.getBoundingClientRect();
        cx = lerp(cx, r.left + r.width / 2 - sr.left, fy);
        cy = lerp(cy, r.top + r.height / 2 - sr.top, fy);
        sc = lerp(1, r.height / ph, fy);
      }
      const yOff = 0.25 * sr.height * (1 - e);
      put(paint, 'v', 'visible');
      put(paint, '--o', (e * (1 - clamp((Ly.fly - 0.8) / 0.2))).toFixed(3));
      put(paint, 't', `translate3d(${(cx - pw / 2).toFixed(1)}px,${(cy - ph / 2 + yOff).toFixed(1)}px,0) perspective(1200px) rotateX(${(18 * (1 - e)).toFixed(2)}deg) scale(${(lerp(0.86, 1, e) * sc).toFixed(4)})`);
    }
  }
  night.after.push(frame);

  // ---------- the story, in screens: 2.6 on a desktop, a phone plays it 0.88 as long ----------
  const LEN = 2.6;
  let lt = null;
  function build(tl, at, perScreen) {
    const k = desktop ? 1 : 0.88;
    lt = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const beats = [
      [0.04, T.wakes], [0.5, T.holds, T.looks], [0.78, T.still], [TAP0, T.touch], [1.62, T.shows, T.blue],
      [1.84, T.never, T.might], [2.12, T.merlin, T.merlinWhy], [2.42, T.moves, T.again],
    ];
    sayLines(gsap, lt, say, beats);
    const prev = quest.lastLine();
    if (prev) lt.to(prev, { autoAlpha: 0, y: -18, duration: 0.09, ease: 'power1.in' }, 0);
    lt.to(Ly, { t: LEN, duration: LEN, ease: 'none' }, 0);
    // 1 she wakes: the quest's blame lines fade out, the table dims, her painting rises full size and holds
    lt.to(B, { out: 1, duration: 0.1 }, 0);
    lt.to(Ly, { shade: 0.3, duration: 0.1 }, 0.02);
    lt.fromTo(Ly, { rise: 0 }, { rise: 1, duration: 0.18, ease: 'none', immediateRender: false }, 0.02);
    // 2 to Mordred: the painting shrinks and flies to seat 7, the standing card takes over, a faint red under glow for the visitor
    lt.to(Ly, { fly: 1, duration: 0.2, ease: 'power3.inOut' }, 0.3);
    lt.to(Ly, { shade: 0, duration: 0.15 }, 0.36);
    lt.to(Ly, { gl: 1, duration: 0.1 }, 0.45);
    lt.to(V.red, { [holder]: 0.5, duration: 0.1 }, 0.46);
    // 3 he chooses: a gold line seat 7 to seat 3, seat 3 lifts with a gold ring
    lt.to(lines.items[0], { a: 1, duration: 0.18, ease: 'power1.out' }, 0.56);
    lt.to(V.gold, { [target]: 1, duration: 0.1, ease: 'power1.out' }, 0.62);
    // 4 still water: the gold line fades, the middle turns to water, the camera sinks toward it
    lt.to(lines.items[0], { o: 0, duration: 0.08 }, 0.78);
    lt.to(V.gold, { [target]: 0, duration: 0.1 }, 0.78);
    lt.to(Ly, { water: 1, duration: 0.25, ease: 'power1.out' }, 0.8);
    lt.to(S, { w3: 1, duration: 0.3 }, 0.75);
    // 5 and 6, the tap window, the scroll reveal and the truth are driven by Ly.t in frame()
    // 7 the lie: the camera pulls back, the water dims, "Evil." rises at seat 7, the red line draws seat 7 to seat 3
    lt.to(S, { w3: 0, duration: 0.3 }, 1.8);
    lt.to(Ly, { dim: 1, duration: 0.2 }, 1.84);
    lt.to(Ly, { ev: 1, duration: 0.07, ease: 'power2.out' }, 2.0);
    lt.to(lines.items[1], { a: 1, duration: 0.12, ease: 'power1.out' }, 2.06);
    lt.to(V.red, { [holder]: 0, duration: 0.1 }, 2.0);
    // 8 the table turns on seat 3: pale lines from 2, 4, 6, 8, 10, 9 and 5, one by one. Seat 3 sinks. Merlin does not point
    order.forEach((s, j) => lt.to(lines.items[2 + j], { a: 1, duration: 0.09, ease: 'power1.out' }, 2.16 + j * 0.035));
    lt.to(Ly, { sink: 1, duration: 0.14 }, 2.3);
    lt.to(Ly, { tag: 1, duration: 0.06 }, 2.2);
    lt.to(Ly, { tag: 0, duration: 0.06 }, 2.42);
    // 9 she moves on: "Evil." and every line fade, the water drains back to wood, the Lady glides from seat 7 to seat 3
    lt.to([lines.items[1], ...order.map((_, j) => lines.items[2 + j])], { o: 0, duration: 0.1 }, 2.42);
    lt.to(Ly, { ev: 0, duration: 0.08 }, 2.42);
    lt.to(Ly, { water: 0, duration: 0.2, ease: 'power1.in' }, 2.4);
    lt.to(Ly, { leg: 1, duration: 0.18, ease: 'power2.inOut' }, 2.42);
    lt.to(Ly, { gl: 0.5, duration: 0.1 }, 2.5);
    lt.to({}, { duration: 0.01 }, LEN - 0.01);
    lt.timeScale(1 / (k * perScreen));
    tl.add(lt, at);
    return LEN * k * perScreen;
  }

  function destroy() {
    if (lt) lt.kill();
    resetReveal();
    gsap.killTweensOf(R);
    offs.forEach((f) => f());
    removeEventListener('resize', onResize);
    if (water) water.destroy();
    const i = night.after.indexOf(frame);
    if (i >= 0) night.after.splice(i, 1);
    const m = night.onMeasure.indexOf(measure);
    if (m >= 0) night.onMeasure.splice(m, 1);
    [wp, lp, fl].forEach((el) => {
      const p = night.planes.indexOf(el);
      if (p >= 0) night.planes.splice(p, 1);
      el.remove();
    });
    paint.remove();
    B.out = 0;
    if (say) {
      say.innerHTML = '';
      say.classList.remove('on-table', 'on-wood');
    }
    if (live) live.textContent = '';
    const prev = quest.lastLine();
    if (prev) gsap.set(prev, { clearProps: 'all' });
  }

  // the standing card, the word and the lines are lent to chapter 6
  return { build, destroy, Ly, W, card, fl, lp, word, wp, wc, pool, lineSet: (defs, gap) => lineSet(night, defs, gap), planeOf: plane, stand, msgs, getWater: () => water, setWaterReveal: (v) => (R.rv = v) };
}

// ---------- reduced motion (?motion=off): the lines, the painting as a normal image, a still lake and a real button that fades in the reflection ----------
export function initLadyPlain() {
  const box = document.querySelector('[data-lady-plain]');
  const data = document.getElementById('page-data');
  if (!box || !data) return;
  const T = JSON.parse(data.textContent).lady.text;
  const live = document.querySelector('[data-lady-live]');
  box.innerHTML = `<div class="l-plain-pool"><div class="l-plain-a"></div><div class="l-plain-b"></div></div><button class="ghost" type="button">${esc(T.touch)}</button>`;
  const a = createWater(box.querySelector('.l-plain-a'), { still: true });
  const b = createWater(box.querySelector('.l-plain-b'), { still: true });
  b.setReveal(1);
  const btn = box.querySelector('button');
  btn.addEventListener('click', () => {
    box.classList.add('is-shown');
    btn.disabled = true;
    if (live) live.textContent = T.blue;
    a.drop(0.5, 0.5);
  });
}
