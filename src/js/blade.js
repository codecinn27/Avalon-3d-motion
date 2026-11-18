// Chapter 7, the blade (spec docs/section/010-the-blade.md). Runs inside the pinned hero, after the climb. The third hands on moment, and the
// one the page builds to: the visitor points the Assassin's blade. Lights out, the four evil cards turn face up, the six loyal cards stand in
// an arc in front of the table with a faint ghost of their painting, a gilded dagger rises from the Assassin and drifts from card to card.
// In a short window the visitor aims (hover, tap or Tab) and strikes (click, a second tap, Enter). Merlin plays ending A (cracks, red circles,
// crimson), anyone else plays ending B (ash, Merlin in gold, gold circles, dawn). With no choice the Assassin picks Merlin himself.
// Like quest.js and lady.js the choice mixes a timed tween (the strike) with the scroll: `K.t`, the scroll position inside the chapter in screens,
// is read every frame, and everything else follows the scroll both ways. Only transform and opacity change per frame (the `put` cache).
import { sayLines } from './say.js';
import { goTo } from './motion.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const DEG = Math.PI / 180;
const LIFT = 46; // night.js: the most a card stands up, in degrees
const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
const html = (s) => {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild;
};
// the lift number that stands a card `deg` degrees (night.js turns it into an angle with smooth())
const liftFor = (deg) => {
  const want = clamp(deg / LIFT);
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (smooth(mid) < want) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

// the screens where the choice lives (from the start of the chapter, 010 "Scroll budget")
const WIN0 = 2.0, WIN1 = 2.5, AUTO1 = 2.75, END0 = 2.75, END_LEN = 1.25, WIN_LEN = 0.6, LEN = 4.6;

// what chapter 8 and the invite read (spec 011): which ending, and whether the visitor chose it
const RESULT = { ending: null, chose: false };
export const result = () => ({ ending: RESULT.ending, chose: RESULT.chose });
const setResult = (ending, chose) => {
  RESULT.ending = ending;
  RESULT.chose = chose;
};

// the Gilded dagger (decision 2): steel blade with a fuller, a curved gold guard with a red stone, a dark wire wound grip, a gold pommel. Tip up.
const DAGGER = `<svg viewBox="0 0 60 214" width="100%" height="100%" focusable="false"><defs>
<linearGradient id="bd-steel" x1="0" x2="1"><stop offset="0" stop-color="#6f7886"/><stop offset=".45" stop-color="#e8edf3"/><stop offset=".55" stop-color="#b9c1cc"/><stop offset="1" stop-color="#5a626f"/></linearGradient>
<linearGradient id="bd-gold" x1="0" x2="1"><stop offset="0" stop-color="#8a5f17"/><stop offset=".4" stop-color="#f3d27a"/><stop offset="1" stop-color="#9c6d1c"/></linearGradient>
<radialGradient id="bd-ruby" cx=".35" cy=".3"><stop offset="0" stop-color="#ffb3ba"/><stop offset=".5" stop-color="#d0293c"/><stop offset="1" stop-color="#6e0f1b"/></radialGradient>
<clipPath id="bd-blade"><path d="M30 3 L39 118 L30 126 L21 118 Z"/></clipPath>
</defs>
<g style="filter:drop-shadow(0 4px 6px rgba(0,0,0,.55))">
<path d="M30 3 L39 118 L30 126 L21 118 Z" fill="url(#bd-steel)" stroke="#2b2f38" stroke-width=".8"/>
<path d="M30 14 L30 112" stroke="#6b7482" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
<rect class="bd-gl" x="-30" y="0" width="14" height="140" fill="#fff" opacity=".85" clip-path="url(#bd-blade)" transform="translate(0 0) skewX(-16)"/>
<path d="M6 124 Q30 108 54 124 L54 133 Q30 121 6 133 Z" fill="url(#bd-gold)" stroke="#5c3d0a" stroke-width=".8"/>
<circle cx="30" cy="125.5" r="4.6" fill="url(#bd-ruby)" stroke="#5c3d0a" stroke-width=".6"/>
<rect x="25.5" y="132" width="9" height="62" rx="3" fill="#241812" stroke="#0e0a07" stroke-width=".6"/>
<path d="M25.5 140 H34.5 M25.5 148 H34.5 M25.5 156 H34.5 M25.5 164 H34.5 M25.5 172 H34.5 M25.5 180 H34.5" stroke="#d9a441" stroke-width="1.3"/>
<circle cx="30" cy="203" r="9.5" fill="url(#bd-gold)" stroke="#5c3d0a" stroke-width=".8"/>
<circle cx="30" cy="203" r="3.4" fill="url(#bd-ruby)"/>
</g></svg>`;

// nine jagged cracks out of the wound, three short segments each (decision 9): drawn once, shown one segment after another
function crackSvg() {
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wx = 50, wy = 42; // where the tip landed: 28% down the card
  const segs = [];
  for (let r = 0; r < 9; r++) {
    const ang = (r / 9) * Math.PI * 2 + rnd() * 0.5;
    const len = 34 + rnd() * 52;
    let x = wx, y = wy;
    for (let s = 0; s < 3; s++) {
      const a = ang + (rnd() - 0.5) * 0.7;
      const nx = x + Math.cos(a) * (len / 3), ny = y + Math.sin(a) * (len / 3) * 1.15;
      segs.push(`<g class="cs"><path d="M${x.toFixed(1)} ${y.toFixed(1)} L${nx.toFixed(1)} ${ny.toFixed(1)}" stroke="#120B08" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M${(x + 0.5).toFixed(1)} ${(y + 0.4).toFixed(1)} L${(nx + 0.5).toFixed(1)} ${(ny + 0.4).toFixed(1)}" stroke="rgba(255,236,200,.45)" stroke-width=".6" fill="none"/></g>`);
      x = nx;
      y = ny;
    }
  }
  return `<svg class="bl-crack" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">${segs.join('')}</svg>`;
}

export function createBlade({ gsap, sec, ring, slots, night, vote, lady, climb, theme, desktop, SS, data, deck }) {
  const T = data.text;
  const s0 = (s) => s - 1;
  const EVIL = data.evil.map(s0), ARC = data.arc.map(s0), MERLIN = s0(data.merlin), ASSASSIN = s0(data.assassin), PERCIVAL = s0(data.between[1]);
  const { S, X, L, FL, Z, F, HID, table, put } = night;
  const V = vote.V;
  const n = 10;
  const keys = Array.from({ length: n }, (_, i) => i);
  const zeros = () => Object.fromEntries(keys.map((i) => [i, 0]));
  const name = (i) => deck[i].name;

  // ---------- what this chapter adds to the page ----------
  const layer = html(`<div class="bl-layer" aria-hidden="true">
    <div class="bl-ash"></div>
    <div class="bl-dag"><div class="bl-dag-in">${DAGGER}</div></div>
    <div class="bl-flash"></div>
    <div class="bl-win"><b></b></div>
  </div>`);
  const ui = html(`<div class="bl-ui">
    <button class="bl-strike" type="button" tabindex="-1" hidden></button>
    <button class="bl-other" type="button" tabindex="-1" hidden>${T.other} <span aria-hidden="true">↑</span></button>
  </div>`);
  sec.append(layer, ui);
  const ash = layer.querySelector('.bl-ash');
  const dag = layer.querySelector('.bl-dag');
  const dagIn = layer.querySelector('.bl-dag-in');
  const glint = layer.querySelector('.bd-gl');
  const flash = layer.querySelector('.bl-flash');
  const win2 = layer.querySelector('.bl-win');
  const win2t = win2.querySelector('b');
  const strikeBtn = ui.querySelector('.bl-strike');
  const otherBtn = ui.querySelector('.bl-other');
  const bladeEl = sec.querySelector('.blade');
  const live = sec.querySelector('[data-blade-live]');
  const coarse = !matchMedia('(hover: hover) and (pointer: fine)').matches;
  // about 40 flakes of dark ash with a few embers, made once (decision 10)
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const FLAKES = Array.from({ length: 40 }, (_, i) => ({ along: rnd(), dx: (rnd() - 0.3) * 120, up: 40 + rnd() * 130, sz: 2 + rnd() * 4, ember: i % 4 === 0, at: rnd() * 0.45, sw: rnd() * 6.28 }));
  ash.innerHTML = FLAKES.map((f) => `<i class="${f.ember ? 'em' : ''}" style="--s:${f.sz.toFixed(1)}px"></i>`).join('');
  const flakeEls = [...ash.children];
  // each seat card gets: a faint ghost of its painting and a number on its back (loyal), a red glow and a grey veil (evil) via CSS vars on the slot
  const ghosts = new Map();
  ARC.forEach((i) => {
    const inn = slots[i].querySelector('.card-back .in');
    const g = html(`<img class="bl-ghost" src="/assets/cards/${deck[i].art}-320.webp" alt="" width="320" height="480" decoding="async" loading="lazy">`);
    const no = html(`<i class="bl-no">${i + 1}</i>`);
    inn.append(g, no);
    ghosts.set(i, { g, no });
  });
  const cracks = html(crackSvg());
  slots[MERLIN].querySelector('.card-front .in').append(cracks);
  const segs = [...cracks.querySelectorAll('.cs')];
  const qd = [...vote.bar.querySelectorAll('.qd')];
  const cover = qd.map((el, k) => {
    const red = html('<s class="bl-red"></s>');
    const gold = html('<s class="bl-gold"></s>');
    const ck = html('<svg class="bl-ck" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 L8 7 L12 10 L7 14 L10 19" stroke="#fff4e0" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    el.append(red, gold, ck);
    return { red, gold, ck, k };
  });
  const CIRCLES = [0, 2, 4]; // the three quests the loyal won

  // ---------- state ----------
  // K: everything the timeline sets (scrubbed). ST: the visitor's own timed things.
  const K = { t: 0, dark: 0, lady: 1, up: zeros(), bg: zeros(), arc: zeros(), asn: 0, rise: 0, tip: 0, dp: 0, hb: 0, prompt: 0, gl: 0, auto: 0, e: 0, out: 0, crown: 1, w: 0, wo: 0 };
  const ST = { tap: 0 };
  let choice = null; // { seat (0 to 9), by: 'tap' | 'scroll' }
  let aim = -1;
  let tw = null;
  let ending = null;
  let wasBuzzed = false, prevT = 0, lastClock = 0, wasWin = false, sayLive = '';
  let geo = null; // measured layout
  const cur = { x: 0, y: 0, ready: false };
  let offs = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = (p) => {
    try {
      if (!reduceMotion() && navigator.vibrate) navigator.vibrate(p);
    } catch (e) {}
  };

  // ---------- measuring (010 "The camera") ----------
  function measure() {
    const vw = night.vw, vh = night.vh, rs = night.rs;
    const f = 0.72;
    const tilt = desktop ? 22 : 16;
    const ct = Math.cos(tilt * DEG);
    const cw0 = 0.36 * rs; // a seat card's width in plane pixels
    const rows = desktop ? 1 : 2;
    // a card on screen: 30% of the screen tall on a desktop (about 80 px wide at 360 px on a phone), never wider than the row allows
    const pitchMax = desktop ? (0.84 * vw) / 6 : (0.92 * vw) / 3;
    const Wc = desktop ? Math.min(0.2 * vh, pitchMax * 0.78) : Math.min(0.78 * pitchMax, (0.19 * vh) / 1.5);
    const pitch = Math.min(pitchMax, Wc * 1.28);
    const Sy = desktop ? 0.7 * vh : 0.585 * vh; // the screen height of the middle of the arc
    const rowGap = Wc * 1.5 * 1.1;
    const Ya = 1.28 * rs; // the middle of the arc, in the table plane, just outside the rim
    const toPlane = (sx, sy) => [(sx - vw / 2) / f, Ya + (sy - Sy) / (f * ct)];
    const spots = [];
    ARC.forEach((seat, k) => {
      let col, row;
      if (rows === 1) [col, row] = [k - 2.5, 0];
      else {
        // two rows of three, Merlin above Percival in the middle: 3, Merlin, 8 over 6, Percival, 10
        const top = [ARC[0], ARC[2], ARC[4]], bot = [ARC[1], ARC[3], ARC[5]];
        row = top.includes(seat) ? 0 : 1;
        col = (row ? bot : top).indexOf(seat) - 1;
      }
      const sx = vw / 2 + col * pitch;
      const sy = Sy + (rows === 1 ? 0.0045 * vh * ((k - 2.5) ** 2 - 2) : (row - 0.5) * rowGap);
      const [px, py] = toPlane(sx, sy);
      spots[seat] = { x: px, y: py, rot: rows === 1 ? (k - 2.5) * 3.4 : 0, sx, sy };
    });
    const Wa = desktop ? Wc * 0.45 : Wc * 0.7; // the Assassin's card, in front of the arc, centre
    const ay = desktop ? 0.835 * vh : 0.86 * vh;
    const [ax, ayp] = toPlane(vw / 2, ay);
    night.pose('arc', { a: 90, fr: 0, f, tilt, at: [0, Ya, 0], y: Sy - night.ringTop });
    geo = {
      vw, vh, f, Wc, spots, Sy,
      scArc: Wc / f / cw0,
      scEvil: (desktop ? 0.62 : 0.6) * Wc / f / cw0,
      assassin: { x: ax, y: ayp, sc: Wa / f / cw0, rot: 0 },
      lv: liftFor(tilt + 2),
      Dh: desktop ? 0.3 * vh : Math.max(96, 0.18 * vh),
    };
    dag.style.setProperty('--dh', `${geo.Dh.toFixed(1)}px`);
    cur.ready = false;
  }
  night.onMeasure.push(measure);
  if (night.vw) measure();

  // the rects of the six arc cards, relative to the stage, read once per frame while the chapter is on screen
  const sr = { l: 0, t: 0 };
  const rect = (i) => {
    const r = slots[i].getBoundingClientRect();
    return { cx: r.left + r.width / 2 - sr.l, cy: r.top + r.height / 2 - sr.t, top: r.top - sr.t, h: r.height, w: r.width };
  };

  // ---------- the choice (010 "The strike") ----------
  const cardAt = (el) => {
    const s = el && el.closest && el.closest('button.slot');
    const i = slots.indexOf(s);
    return ARC.includes(i) ? i : -1;
  };
  const inWindow = () => K.t >= WIN0 && K.t < WIN1 && !(choice && choice.by === 'tap');
  function setAim(i) {
    if (aim === i) return;
    aim = i;
  }
  function strike(i) {
    if (!inWindow() || choice) return;
    choice = { seat: i, by: 'tap' };
    aim = i;
    if (tw) tw.kill();
    ST.tap = 0;
    buzz(45);
    tw = gsap.to(ST, { tap: 1, duration: 1.5, ease: 'none' });
  }
  function clearChoice() {
    choice = null;
    aim = -1;
    if (tw) tw.kill();
    tw = null;
    ST.tap = 0;
  }
  // a click or tap on an arc card. The capture phase on the ring runs before the seat labels' (seats.js is made after this) and the card dialog
  on(ring, 'click', (e) => {
    if (K.t < 0.001 || !slots.some((s) => s.contains(e.target))) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const i = cardAt(e.target);
    if (i < 0 || !inWindow()) return;
    const touch = e.pointerType === 'touch' || e.pointerType === 'pen';
    const keyboard = !e.pointerType || e.detail === 0;
    if (touch || keyboard) {
      if (aim === i) strike(i);
      else setAim(i);
    } else strike(i); // a mouse: hovering has already aimed
  }, true);
  slots.forEach((el, i) => {
    on(el, 'pointerenter', (e) => e.pointerType === 'mouse' && inWindow() && ARC.includes(i) && setAim(i));
    on(el, 'pointerleave', (e) => e.pointerType === 'mouse' && inWindow() && aim === i && setAim(-1));
    on(el, 'focus', () => inWindow() && ARC.includes(i) && el.matches(':focus-visible') && setAim(i));
  });
  on(strikeBtn, 'click', () => aim >= 0 && strike(aim));
  on(otherBtn, 'click', () => {
    const y = winY();
    if (y != null) goTo(y);
  });
  let winY = () => null;

  const labelsOn = (on2) => {
    ARC.forEach((i) => {
      const el = slots[i];
      if (on2) {
        if (el.dataset.blLabel == null) el.dataset.blLabel = el.getAttribute('aria-label') || '';
        el.setAttribute('aria-label', fill(T.cardLabel, { n: i + 1, name: name(i) }));
        el.tabIndex = 0;
      } else {
        if (el.dataset.blLabel != null) {
          el.setAttribute('aria-label', el.dataset.blLabel);
          delete el.dataset.blLabel;
        }
        el.tabIndex = -1;
      }
    });
  };

  // ---------- one frame (after climb.frame) ----------
  function frame(clock) {
    const dt = Math.min(0.05, Math.max(0, clock - lastClock));
    lastClock = clock;
    const t = K.t;
    const active = t > 0.001;
    night.noAsk = active;
    if (!active) {
      // above the chapter: leave nothing behind
      if (wasWin || choice || aim >= 0) {
        clearChoice();
        labelsOn(false);
        wasWin = false;
      }
      return hideAll();
    }
    const rr = sec.getBoundingClientRect();
    sr.l = rr.left;
    sr.t = rr.top;
    const g = geo;
    const u = night.u, P = table.pos;
    const out = clamp(K.out);

    // the choice: scrolling back above the window clears it, the end of the window makes it for the visitor
    if (t < WIN0 - 0.02 && choice) clearChoice();
    if (choice && choice.by === 'scroll' && t < WIN1 - 0.02) choice = null;
    if (!choice && t >= WIN1) choice = { seat: MERLIN, by: 'scroll' };
    const win = inWindow();
    if (win !== wasWin) {
      wasWin = win;
      labelsOn(win);
      if (!win && aim >= 0 && !choice) aim = -1;
    }
    if (win && aim >= 0 && !ARC.includes(aim)) aim = -1;
    const end = choice ? (choice.seat === MERLIN ? 'a' : 'b') : null;
    const chose = Boolean(choice && choice.by === 'tap');
    if (end !== ending || chose !== RESULT.chose) {
      ending = end;
      setResult(end, chose);
    }
    bladeEl && bladeEl.classList.toggle('is-tapped', chose);
    // strike progress: the visitor's tween, or the scrubbed strike when the Assassin chooses
    const sk = choice ? (choice.by === 'tap' ? Math.max(ST.tap, K.auto) : K.auto) : 0;
    const eS = clamp(K.e) * END_LEN; // screens into the ending
    const eStart = K.e > 0.002;
    // heartbeat, once per pass, only scrolling forward (decision 12)
    if (t >= 1.62 && prevT < 1.62 && prevT > 1.3 && !wasBuzzed) {
      wasBuzzed = true;
      buzz([28, 110, 28]);
    }
    if (t < 1.5) wasBuzzed = false;
    prevT = t;

    // ----- the seat cards -----
    let aimSeat = win && aim >= 0 ? aim : -1;
    const struck = choice && sk > 0.001 ? choice.seat : -1;
    for (const i of keys) {
      const up = K.up[i], arc = clamp(K.arc[i]);
      const slot = slots[i];
      const isEvil = EVIL.includes(i);
      const isArc = ARC.includes(i);
      let gl = 0, gold = 0, grey = 0, rim = 0, ring2 = 0;
      if (isEvil) {
        const asn = i === ASSASSIN ? smooth(clamp(K.asn)) : 0;
        // face up and standing, a little bigger; the Assassin slides to the front
        const e = smooth(clamp(up));
        L[i] = Math.max(L[i], g.lv * e);
        FL[i] = Math.max(FL[i], e);
        F[i] = Math.max(F[i], e * (1 - out));
        X.sc[i] *= lerp(1, g.scEvil, e);
        X.dr[i] = lerp(X.dr[i], wrap(-P[i].rot), e); // upright, facing the visitor
        let rise = 0, sink = 0;
        if (ending === 'a') rise = smooth(clamp((eS - 0.6) / 0.3));
        if (ending === 'b') sink = smooth(clamp((eS - 0.4) / 0.2));
        if (rise) {
          L[i] = Math.max(L[i], g.lv * (1 + 0.5 * rise));
          X.sc[i] *= 1 + 0.12 * rise;
          X.dz[i] += 10 * rise * u;
        }
        if (sink) {
          X.sc[i] *= 1 - 0.08 * sink;
          X.dz[i] -= 4 * sink * u;
          grey = 0.8 * sink;
        }
        gl = clamp(K.bg[i]) * (1 - sink);
        if (ending === 'b' && eS > 0.4 && eS < 0.6 && i === ASSASSIN) gl *= 0.35 + 0.65 * (Math.sin(eS * 90) > 0 ? 1 : 0);
        if (i === ASSASSIN && asn > 0) {
          X.dx[i] += (g.assassin.x - P[i].x) * asn;
          X.dy[i] += (g.assassin.y - P[i].y) * asn;
          X.dr[i] = lerp(wrap(-P[i].rot) * e, wrap(g.assassin.rot - P[i].rot), asn);
          X.sc[i] *= lerp(1, g.assassin.sc / g.scEvil, asn);
          L[i] = Math.max(L[i], g.lv * 0.7);
          Z[i] = 30;
        }
        if (ending === 'b' && i !== ASSASSIN) F[i] = Math.max(F[i], 0.0);
      } else if (isArc && arc > 0.0005) {
        const e = smooth(arc), sp = g.spots[i];
        // blended toward the absolute place, so leftovers of earlier chapters (the Lady's swivel, the quest's slides) cannot show
        X.dx[i] = lerp(X.dx[i], sp.x - P[i].x, e);
        X.dy[i] = lerp(X.dy[i], sp.y - P[i].y, e);
        X.dr[i] = lerp(X.dr[i], wrap(sp.rot - P[i].rot), e);
        X.sc[i] = lerp(X.sc[i], g.scArc, e);
        L[i] = Math.max(L[i], g.lv * e);
        Z[i] = 16 + ARC.indexOf(i);
        HID[i] = Math.max(HID[i], e);
        const gh = ghosts.get(i);
        put(gh.g, 'o', (0.3 * e).toFixed(3));
        put(gh.no, 'o', (0.9 * e).toFixed(3));
        // the gold rim sweeps the six cards once, left to right (decision, "Your turn")
        const idx = ARC.indexOf(i);
        rim = clamp(1 - Math.abs(K.prompt * 7.2 - idx - 0.6) / 1.6) * 0.9;
        if (win) rim = Math.max(rim, 0.22);
        if (aimSeat === i) ring2 = 1;
        if (struck === i) {
          X.sc[i] *= 1 + 0.1 * Math.sin(Math.PI * clamp((sk - 0.62) / 0.35)) * 1.0;
          FL[i] = Math.max(FL[i], smooth(clamp((sk - 0.78) / 0.22)));
          F[i] = Math.max(F[i], smooth(clamp((sk - 0.8) / 0.2)));
          gl = 0;
        }
        // ending B: Merlin turns over by himself, in gold light
        if (i === MERLIN && ending === 'b') {
          const m = smooth(clamp((eS - 0.6) / 0.25));
          FL[i] = Math.max(FL[i], m);
          F[i] = Math.max(F[i], m);
          gold = smooth(clamp((eS - 0.55) / 0.3));
        }
        if (i === MERLIN && ending === 'a') {
          const dim = smooth(clamp((eS - 0.9) / 0.2));
          X.op[i] *= 1 - 0.25 * dim;
        }
      }
      // fade everything out for the empty table (chapter 8)
      if (out > 0.001 && (isEvil || isArc)) {
        X.op[i] *= 1 - out;
        X.dz[i] -= 8 * out * u;
        F[i] *= 1 - out;
      }
      const fade = 1 - out;
      put(slot, '--bg', (gl * fade).toFixed(3));
      put(slot, '--gy', (grey * fade).toFixed(3));
      put(slot, '--gd', (gold * fade).toFixed(3));
      put(slot, '--rm', (rim * fade).toFixed(3));
      put(slot, '--am', (ring2 * fade).toFixed(3));
    }
    // Merlin's badge drains to grey as the first cracks run (decision 9)
    const drained = ending === 'a' && eS > 0.12;
    slots[MERLIN].querySelector('.card').classList.toggle('bl-grey', drained);
    segs.forEach((el, m) => put(el, 'o', ending === 'a' ? clamp((eS / 0.3) * 29 - m).toFixed(3) : '0'));

    // ----- the score circles, the tints, the lights -----
    const A = ending === 'a', Bd = ending === 'b';
    cover.forEach((c) => {
      const j = CIRCLES.indexOf(c.k);
      if (j < 0) return;
      const r = A ? smooth(clamp((eS - (0.3 + 0.07 * j)) / 0.1)) : 0;
      const gd = Bd ? smooth(clamp((eS - (0.85 + 0.03 * j)) / 0.12)) : 0;
      put(c.red, 'o', r.toFixed(3));
      put(c.gold, 'o', gd.toFixed(3));
      put(c.ck, 'o', (A ? clamp((eS - (0.28 + 0.07 * j)) / 0.04) * (1 - clamp(r * 1.5 - 0.5)) : 0).toFixed(3));
    });
    const blood = A ? 0.9 * smooth(clamp((eS - 0.6) / 0.3)) : 0;
    const dawn = Bd ? 0.78 * smooth(clamp((eS - 0.85) / 0.3)) : 0;
    theme && theme.setBlood(blood * (1 - out));
    theme && theme.setDawn(dawn * (1 - out));
    theme && theme.setDark(K.dark);
    // lady's card and the crown go with the lights
    put(lady.card, 'o', clamp(K.lady).toFixed(3));
    V.crown.s = K.crown;

    // ----- the dagger -----
    const hasArc = K.rise > 0.001;
    const dagOp = out > 0.999 ? 0 : 1;
    if (!hasArc || dagOp === 0 || t < 0.5) {
      put(dag, 'v', 'hidden');
      put(ash, 'v', 'hidden');
      put(flash, 'o', '0');
    } else {
      const R = ARC.map((i) => rect(i));
      const asn = rect(ASSASSIN);
      const Dh = g.Dh, Dw = (Dh * 60) / 214;
      // above a card, tip down: where the dagger hovers
      const hover = (r) => [r.cx, r.top - Dh * 0.42];
      let tx, ty, rot = 180 * smooth(K.tip), sc = 1;
      // rising out of the Assassin's card, tip up
      const rise = smooth(clamp(K.rise));
      const riseX = asn.cx, riseY = lerp(asn.cy, asn.top - Dh * 0.55, rise);
      // the drift: along the six cards, then swinging slower and slower between Merlin and Percival
      const dp = clamp(K.dp, 0, 5), k0 = Math.min(4, Math.floor(dp)), fk = dp - k0;
      const d0 = hover(R[k0]), d1 = hover(R[k0 + 1]);
      let drX = lerp(d0[0], d1[0], fk), drY = lerp(d0[1], d1[1], fk);
      if (win || t >= WIN1 - 0.01) {
        // settled above the middle of the arc, or following the aim
        const mid = [lerp(hover(R[ARC.indexOf(MERLIN)])[0], hover(R[ARC.indexOf(PERCIVAL)])[0], 0.5), lerp(hover(R[ARC.indexOf(MERLIN)])[1], hover(R[ARC.indexOf(PERCIVAL)])[1], 0.5)];
        [drX, drY] = aimSeat >= 0 ? hover(R[ARC.indexOf(aimSeat)]) : mid;
        if (!win && choice) [drX, drY] = hover(R[ARC.indexOf(choice.seat)]);
      }
      const tipE = smooth(clamp(K.tip));
      tx = lerp(riseX, drX, tipE);
      ty = lerp(riseY, drY, tipE);
      sc = 1 + 0.08 * K.hb;
      let flashV = 0;
      let gx = K.gl;
      if (choice && sk > 0.001) {
        // the strike: turn over the card, rise a little, plunge, flash, the card turns (decision, "The strike")
        const cr = R[ARC.indexOf(choice.seat)];
        const [hx, hy] = hover(cr);
        const raise = Dh * 0.12 * smooth(clamp((sk - 0.4) / 0.22));
        const plunge = Math.pow(clamp((sk - 0.62) / 0.08), 3);
        const hitY = cr.cy - Dh * 0.5 + Dh * 0.06;
        tx = lerp(tx, hx, smooth(clamp(sk / 0.4)));
        ty = lerp(lerp(ty, hy, smooth(clamp(sk / 0.4))) - raise, hitY, plunge);
        rot = 180;
        gx = Math.max(gx, clamp((sk - 0.3) / 0.3));
        flashV = sk < 0.7 ? 0 : sk < 0.74 ? (sk - 0.7) / 0.04 : Math.max(0, 1 - (sk - 0.74) / 0.12);
        if (flashV > 0) put(ring, 'translate', `${(Math.sin(sk * 400) * 4 * flashV).toFixed(1)}px ${(Math.cos(sk * 500) * 3 * flashV).toFixed(1)}px`);
        else put(ring, 'translate', '0px 0px');
      } else put(ring, 'translate', '0px 0px');
      // spring toward the target while nothing is strictly scrubbed (about 16% of the way each frame)
      if (!cur.ready || (choice && sk > 0.4)) {
        cur.x = tx;
        cur.y = ty;
        cur.ready = true;
      } else {
        const k = 1 - Math.exp(-dt * 11);
        cur.x += (tx - cur.x) * k;
        cur.y += (ty - cur.y) * k;
      }
      let op = clamp(K.rise * 3) * dagOp;
      if (ending === 'a') op *= 1 - smooth(clamp((eS - 0.08) / 0.18));
      if (ending === 'b') op *= 1 - clamp((eS - 0.15) / 0.06);
      op *= 1 - out;
      put(dag, 'v', op > 0.004 ? 'visible' : 'hidden');
      put(dag, 'o', op.toFixed(3));
      put(dag, 't', `translate3d(${(cur.x - Dw / 2).toFixed(1)}px,${(cur.y - Dh / 2).toFixed(1)}px,0) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`);
      put(glint, 't', `translate(${(gx * 120).toFixed(1)}px,0) skewX(-16deg)`);
      put(flash, 'o', (0.85 * flashV * (1 - out)).toFixed(3));
      // the ash (ending B, step 2): flakes along the blade, drifting up and to the side
      const pa = Bd ? clamp((eS - 0.15) / 0.4) : 0;
      if (pa < 0.002 || pa >= 1) put(ash, 'v', 'hidden');
      else {
        put(ash, 'v', 'visible');
        FLAKES.forEach((f, m) => {
          const p = clamp((pa - f.at * 0.5) / (1 - f.at * 0.5));
          const el = flakeEls[m];
          put(el, 'o', (Math.sin(Math.PI * p) * (f.ember ? 0.95 : 0.8)).toFixed(3));
          put(el, 't', `translate3d(${(cur.x + (f.along - 0.5) * 6 + f.dx * p + Math.sin(p * 6 + f.sw) * 8).toFixed(1)}px,${(cur.y + (f.along - 0.5) * Dh * 0.8 - f.up * p).toFixed(1)}px,0) scale(${(1 - 0.4 * p).toFixed(3)})`);
        });
      }
    }

    // ----- the win screen (red after ending A, blue after ending B) -----
    const wv = smooth(clamp(K.w)) * (1 - smooth(clamp(K.wo)));
    if (ending && win2.dataset.end !== ending) {
      win2.dataset.end = ending;
      win2.classList.toggle('is-a', ending === 'a');
      win2t.textContent = ending === 'a' ? T.winEvil : T.winGood;
    }
    night.win = wv; // the seat labels (seats.js) and the "other ending" link give way while the win screen is up, so only the words show
    put(win2, 'o', wv.toFixed(3));
    put(win2, 'v', wv > 0.003 ? 'visible' : 'hidden');
    // ----- strike button, the other ending link, the live line -----
    put(strikeBtn, '--ay', `${(Math.min(...ARC.map((i) => geo.spots[i].sy)) - geo.Wc * 0.75 - 8).toFixed(0)}px`);
    const showStrike = coarse && win && aimSeat >= 0;
    if (strikeBtn.hidden === showStrike) {
      strikeBtn.hidden = !showStrike;
      strikeBtn.tabIndex = showStrike ? 0 : -1;
    }
    if (showStrike) {
      const txt = fill(T.strike, { n: aimSeat + 1 });
      if (strikeBtn.textContent !== txt) strikeBtn.textContent = txt;
    }
    const oOp = clamp((K.e - 0.9) / 0.08) * (1 - out) * (1 - wv);
    const showOther = oOp > 0.02;
    if (otherBtn.hidden === showOther) {
      otherBtn.hidden = !showOther;
      otherBtn.tabIndex = showOther ? 0 : -1;
    }
    put(otherBtn, 'o', oOp.toFixed(3));
    const msg = eStart && ending ? (ending === 'a' ? T.liveA : fill(T.liveB, { name: name(choice.seat) })) : '';
    if (msg !== sayLive && live) live.textContent = sayLive = msg;
    // the ending's two sets of words show only for their ending
    const vis = (box, on2) => box && put(box, 'v', on2 ? 'visible' : 'hidden');
    vis(boxes.a, ending === 'a');
    vis(boxes.b, ending === 'b');
  }
  night.after.push(frame);
  if (location.search.includes('debug')) window.__bl = { K, get choice() { return choice; }, get aim() { return aim; }, ST };

  function hideAll() {
    put(dag, 'v', 'hidden');
    put(ash, 'v', 'hidden');
    put(flash, 'o', '0');
    put(win2, 'o', '0');
    put(ring, 'translate', '0px 0px');
    if (!strikeBtn.hidden) strikeBtn.hidden = true;
    if (!otherBtn.hidden) otherBtn.hidden = true;
    theme && (theme.setBlood(0), theme.setDawn(0), theme.setDark(K.dark));
    night.noAsk = false;
    night.win = 0;
    if (ending !== null) {
      ending = null;
      setResult(null, false);
    }
  }

  // ---------- the story, in screens: 4.0 on a desktop, a phone plays it 0.88 as long ----------
  const boxes = { a: null, b: null };
  let bt = null;
  function build(tl, at, perScreen) {
    const k = desktop ? 1 : 0.88;
    bt = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const say = sec.querySelector('.blade-say');
    // the words: the opening and the choice, then each ending's own lines
    sayLines(gsap, bt, say, [
      [0.02, T.remains], [0.3, T.evilWin], [0.65, T.name], [1.38, T.slows], [1.55, T.percival], [1.78, coarse ? T.hintTouch : T.hintMouse], [2.5, T.chooses],
    ], { inLen: 0.12, outLen: 0.1 });
    // after the strike the opening's last line leaves
    bt.to(say.lastElementChild, { autoAlpha: 0, y: -18, duration: 0.1, ease: 'power1.in' }, END0 - 0.02);
    const mk = (cls, beats) => {
      const box = html(`<div class="night-live night-say blade-say ${cls}" aria-hidden="true"></div>`);
      bladeEl.append(box);
      sayLines(gsap, bt, box, beats.map((b) => [END0 + b[0], ...b.slice(1)]), { inLen: 0.14, outLen: 0.1 });
      return box;
    };
    boxes.a = mk('blade-a', [[0, T.merlin], [0.3, T.taken], [0.9, T.lost]]);
    boxes.b = mk('blade-b', [[0, T.notMerlin], [0.6, T.hidden], [1.05, T.saved]]);
    const prev = sec.querySelector('.climb-say')?.lastElementChild;
    if (prev) bt.to(prev, { autoAlpha: 0, y: -18, duration: 0.05, ease: 'power1.in' }, 0);

    bt.to(K, { t: LEN, duration: LEN, ease: 'none' }, 0);
    // 1 lights out: across 0.05 screen the gold goes and the page turns dark (decision 3). The Lady and the crown follow within 0.1
    bt.to(K, { dark: 1, duration: 0.05, ease: 'none' }, 0);
    bt.fromTo(climb.K, { gold: 0.85 }, { gold: 0, duration: 0.05, ease: 'none', immediateRender: false }, 0);
    bt.fromTo(climb.K, { pulse: 1 }, { pulse: 0, duration: 0.05, ease: 'none', immediateRender: false }, 0);
    bt.fromTo(climb.K, { dim2: 1 }, { dim2: 0, duration: 0.1, immediateRender: false }, 0);
    bt.fromTo(K, { lady: 1, crown: 1 }, { lady: 0, crown: 0, duration: 0.1, immediateRender: false }, 0.05);
    // 2 evil face up, one after another, the red badges burn
    EVIL.forEach((s, j) => {
      bt.to(K.up, { [s]: 1, duration: 0.12 }, 0.34 + 0.07 * j);
      bt.to(K.bg, { [s]: 1, duration: 0.1, ease: 'power1.out' }, 0.44 + 0.07 * j);
    });
    // 3 the arc: the camera moves in front of the table, the six loyal cards lift into place, the Assassin slides to the front
    bt.to(S, { w6: 1, duration: 0.4, ease: 'power3.inOut' }, 0.62);
    ARC.forEach((s, j) => bt.to(K.arc, { [s]: 1, duration: 0.2 }, 0.72 + 0.045 * j));
    bt.to(K, { asn: 1, duration: 0.22 }, 0.9);
    // 4 the dagger rises, one glint
    bt.to(K, { rise: 1, duration: 0.1, ease: 'power2.out' }, 1.05);
    bt.fromTo(K, { gl: 0 }, { gl: 1, duration: 0.1, ease: 'none', immediateRender: false }, 1.08);
    // 5 the drift: tips over, glides card to card, slows between two, two heartbeats
    bt.to(K, { tip: 1, duration: 0.07 }, 1.14);
    bt.to(K, { dp: 5, duration: 0.17, ease: 'sine.inOut' }, 1.18);
    bt.to(K, { dp: 1, duration: 0.12, ease: 'sine.inOut' }, 1.35);
    bt.to(K, { dp: 3, duration: 0.09, ease: 'sine.inOut' }, 1.47);
    bt.to(K, { dp: 2, duration: 0.07, ease: 'sine.inOut' }, 1.56);
    bt.to(K, { dp: 3, duration: 0.06, ease: 'sine.inOut' }, 1.63);
    bt.to(K, { dp: 2.4, duration: 0.05, ease: 'sine.inOut' }, 1.69);
    bt.to(K, { dp: 2.5, duration: 0.04, ease: 'sine.inOut' }, 1.74);
    bt.fromTo(K, { gl: 0 }, { gl: 1, duration: 0.1, ease: 'none', immediateRender: false }, 1.58);
    [1.62, 1.69].forEach((a) => bt.to(K, { hb: 1, duration: 0.025, ease: 'power2.out' }, a).to(K, { hb: 0, duration: 0.05, ease: 'power2.in' }, a + 0.025));
    // 6 your turn: the gold rim sweeps the six cards once
    bt.to(K, { prompt: 1, duration: 0.2, ease: 'none' }, 1.78);
    // 7 and 8: the choice window (2.0 to 2.5) is driven by K.t in frame(). If nobody chose, the strike is scrubbed here
    bt.to(K, { auto: 1, duration: AUTO1 - WIN1, ease: 'none' }, WIN1);
    // the ending (the same 1.25 screens for both, frame() draws the one that was chosen)
    bt.to(K, { e: 1, duration: END_LEN, ease: 'none' }, END0);
    // the win screen fades in after the ending's last line, holds, and fades out into chapter 8
    bt.to(K, { w: 1, duration: 0.2, ease: 'none' }, END0 + END_LEN);
    bt.to(K, { wo: 1, duration: 0.2, ease: 'none' }, LEN - 0.21);
    bt.to({}, { duration: 0.01 }, LEN - 0.01);

    bt.timeScale(1 / (k * perScreen));
    tl.add(bt, at);
    // the link "See the other ending" lands in the choice window (a little inside it, so the rewind rule fires)
    winY = () => {
      const st = tl.scrollTrigger;
      if (!st) return null;
      return st.start + ((at + (WIN0 + 0.08) * k * perScreen) / tl.duration()) * (st.end - st.start);
    };
    return LEN * k * perScreen;
  }

  function destroy() {
    if (bt) bt.kill();
    if (tw) tw.kill();
    offs.forEach((fn) => fn());
    offs = [];
    const i = night.after.indexOf(frame);
    if (i >= 0) night.after.splice(i, 1);
    const m = night.onMeasure.indexOf(measure);
    if (m >= 0) night.onMeasure.splice(m, 1);
    labelsOn(false);
    slots.forEach((el, k) => {
      ['--bg', '--gy', '--gd', '--rm', '--am'].forEach((p) => el.style.removeProperty(p));
      if (ARC.includes(k)) el.tabIndex = 0;
    });
    ghosts.forEach((x) => (x.g.remove(), x.no.remove()));
    cracks.remove();
    slots[MERLIN].querySelector('.card').classList.remove('bl-grey');
    cover.forEach((c) => (c.red.remove(), c.gold.remove(), c.ck.remove()));
    [layer, ui, boxes.a, boxes.b].forEach((el) => el && el.remove());
    ring.style.removeProperty('translate');
    theme && (theme.setBlood(0), theme.setDawn(0), theme.setDark(0));
    night.noAsk = false;
    night.win = 0;
    setResult(null, false);
    const say = sec.querySelector('.blade-say');
    if (say) say.innerHTML = '';
    if (live) live.textContent = '';
  }

  return { build, destroy, K, result, boxes };
}

// ---------- reduced motion (?motion=off): six plain buttons, ending A by default, the chosen ending shown with a fade ----------
export function initBladePlain() {
  const dataEl = document.getElementById('page-data');
  const pd = dataEl && JSON.parse(dataEl.textContent);
  const box = document.querySelector('[data-blade-plain]');
  const out = document.querySelector('[data-blade-result]');
  const live = document.querySelector('[data-blade-live]');
  if (!box || !out || !pd) return;
  const data = pd.blade;
  const T = data.text;
  const arc = data.arc.map((s) => s - 1);
  const merlin = data.merlin - 1;
  const deck = pd.deck;
  box.innerHTML = `<div class="blade-btns">${arc.map((i) => `<button class="ghost" type="button" data-seat="${i}"><img src="/assets/cards/${deck[i].art}-320.webp" alt="" width="40" height="60" loading="lazy" decoding="async"><span>${fill(T.seatBtn, { n: i + 1, name: deck[i].name })}</span></button>`).join('')}</div><p class="blade-or">${T.orScroll}</p>`;
  const show = (text) => {
    out.textContent = text;
    if (out.animate) out.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
  };
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-seat]');
    if (!b) return;
    const i = Number(b.dataset.seat);
    const isA = i === merlin;
    setResult(isA ? 'a' : 'b', true);
    show(isA ? `${T.plainA} ${T.lost}` : `${T.notMerlin} ${T.hidden} ${T.saved}`);
    if (live) live.textContent = isA ? T.liveA : fill(T.liveB, { name: deck[i].name });
    box.querySelectorAll('button').forEach((x) => x.classList.toggle('is-picked', x === b));
    const q = document.querySelector('[data-seat-q]');
    if (q) q.textContent = isA ? pd.seat.text.hidden : pd.seat.text.found;
  });
  setResult('a', false);
}
