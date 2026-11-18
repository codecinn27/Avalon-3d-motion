// Chapter 4, the quest (spec docs/section/007-the-quest.md). Runs inside the pinned hero, after the vote.
// The one chapter where the visitor does something: in the tap window the four quest cards are real buttons and a tap turns one over.
// Everything else follows the scroll both ways. The reveal mixes taps (timed tweens) with the scroll (scrubbed): `Q.t`, the scroll
// position inside the quest in screens, is read every frame, and the rule "the card that starts to turn fourth is the Fail" is applied
// when a card starts to turn (its face is given late). The crown, the bar and the outlines come from vote.js.
import { sayLines } from './say.js';

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
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
export const IMG = (name, w) => `/assets/props/${name}-${w}.webp`;
const BACK = '/assets/cards/card-back-480.webp';

// where the story waits for the visitor (screens from the start of the quest, 007 "Scroll budget")
const TAP0 = 1.97; // the four cards wait face down, buttons from here
const S0 = 2.5, S1 = 2.8; // then the scroll turns any card left, left to right, the last one landing at S1
export const QW = 66, GAP = 10; // a quest card on the table and the gap between cards, design pixels
let rippled = false; // the soft ripple across the four cards plays once per visit (kept for the session, not stored)

// how far a card has turned (flip, 0 to 1) and how high it is lifted (0 to 1) while it turns, p = 0 to 1 through the turn.
// A Success turns in one move. The Fail lifts, hesitates, then turns slowly.
export function turnShape(p, fail) {
  if (!fail) return { flip: smooth(p), lift: Math.sin(Math.PI * p) };
  const lift = smooth(clamp(p / 0.3)) * (1 - smooth(clamp((p - 0.88) / 0.12)));
  const x = clamp((p - 0.3) / 0.7);
  const flip = x < 0.3 ? smooth(x / 0.3) * 0.16 : x < 0.5 ? 0.16 + 0.04 * ((x - 0.3) / 0.2) : 0.2 + 0.8 * smooth((x - 0.5) / 0.5);
  return { flip, lift };
}

export const front = (T) => `<span class="pc-side pc-front"><span class="pc-in fr-ok"><img src="${IMG('success', 480)}" alt="" width="480" height="720" decoding="async"><span class="pc-t">${esc(T.cardSuccess)}</span><i class="pc-bd bl"></i><i class="pc-bd br"></i></span><span class="pc-in fr-bad"><img src="${IMG('fail', 480)}" alt="" width="480" height="720" decoding="async"><span class="pc-t">${esc(T.cardFail)}</span><i class="pc-bd br"></i></span></span>`;
export const back = `<span class="pc-side pc-back"><span class="pc-in"><img src="${BACK}" alt="" width="480" height="720" decoding="async"></span></span>`;

export function createQuest({ gsap, sec, ring, night, vote, desktop, data }) {
  const T = data.text;
  const [q1, q2] = data.quests.map((q) => ({ ...q, team: q.team.map((s) => s - 1), leader: q.leader - 1 }));
  const failBy = q2.failBy - 1;
  const target = data.blame.target - 1;
  const accusers = data.blame.order.map((s) => s - 1);
  const { S, X, table, put } = night;
  const V = vote.V;
  const n = 10;

  // ---------- the layers ----------
  const plane = (cls, inner, hide = true) => {
    const el = html(`<div class="n-plane ${cls}"${hide ? ' aria-hidden="true"' : ''}>${inner}</div>`);
    ring.append(el);
    night.planes.push(el);
    return el;
  };
  const under = plane('x-under', `<i class="rl"></i><div class="n-thrs x-thrs">${accusers.map((_, k) => `<div class="thr ${k === 0 ? 'red' : 'pale'}" style="visibility:hidden"><i class="sh"></i><i class="ln"></i></div>`).join('')}</div>`);
  const cardEl = (c) => `<button class="pc pcp xq" type="button" inert aria-label="${esc(fill(T.cardLabel, { n: c + 1 }))}"><i class="pc-glow"></i><span class="pc-3d">${front(T)}${back}</span></button>`;
  const handEl = (fail) => `<div class="pc pcp xh${fail ? ' is-fail' : ''}"><i class="pc-glow"></i><div class="pc-3d" style="transform:none">${front(T)}</div></div>`;
  const flat = plane('x-flat', `${[0, 1, 2, 3].map(cardEl).join('')}${handEl(false)}${handEl(true)}`, false);
  const rule = html(`<div class="q-rule" aria-hidden="true"><div class="pc rc"><div class="pc-3d">${front(T)}</div></div><div class="pc rc is-fail"><div class="pc-3d">${front(T)}</div></div></div>`);
  const fly = html('<i class="q-fly" aria-hidden="true"></i>');
  sec.append(rule, fly);
  const live = sec.querySelector('[data-quest-live]');
  const say = sec.querySelector('.quest-say');
  const lastVote = sec.querySelector('.vote-say')?.lastElementChild;

  const cards = [...flat.querySelectorAll('button.xq')].map((el, id) => ({
    id, el, glow: el.querySelector('.pc-glow'), flip: el.querySelector('.pc-3d'),
    vis: 0, pa: 0, x: 0, ar: 0, gl: 0, f: 0, rp: 0, // timeline: shown, seat to middle, place in the row, shuffle arc, red glint, quest 1's turn, ripple
    tp: 0, sp: 0, mode: null, face: null, started: false, tw: null, // the reveal: tap progress, scroll progress, who turned it, its face
  }));
  const hands = [...flat.querySelectorAll('.xh')].map((el) => ({ el, glow: el.querySelector('.pc-glow') }));
  const rl = under.querySelector('.rl');
  const lines = [...under.querySelectorAll('.thr')].map((el) => ({ el, ln: el.querySelector('.ln'), sh: el.querySelector('.sh') }));
  const ruleCards = [...rule.querySelectorAll('.pc')];
  const badges = ruleCards.map((c) => [...c.querySelectorAll('.fr-ok .pc-bd, .fr-bad .pc-bd')]);
  const qdBar = () => [...vote.bar.querySelectorAll('.qd')];

  // ---------- state ----------
  const Q = { t: 0, shade: 0, qn: 0, hs: 0, hf: 0, hl: 0 };
  const B = { line: Object.fromEntries(accusers.map((_, k) => [k, 0])), dim: 0, fade: 0, out: 0 }; // out: chapter 5 clears the blame lines
  const Aft = { t: 0 }; // the Fail's aftermath when it was tapped: a timed tween 0 to 1
  const order = []; // card ids in the order they started turning
  let wasOnTable = false, hasFail = false, open = false, touched = false, aftTween = null, flown = false, flyFrom = null, flyTo = null;

  // ---------- measuring ----------
  const D3 = [-1, 0, 1].map((k) => k * (QW + GAP)); // the row of cards in the middle, design pixels
  const D4 = [-1.5, -0.5, 0.5, 1.5].map((k) => k * (QW + GAP));
  let swivel = [];
  function measure() {
    const u = night.u, vw = night.vw, vh = night.vh, P = table.pos;
    // camera poses for this screen (007 "The camera"): over the shoulder, and straight down
    const sp = P[failBy];
    night.pose('hand', { a: 90 + 36 * failBy, fr: 0.9, f: clamp(Math.min((0.45 * vh) / (150 * u * 0.94), (0.9 * vw) / (156 * u)), 1.2, 6), tilt: desktop ? 70 : 64, at: [sp.x * 0.92, sp.y * 0.92, 115 * u], y: (desktop ? 0.56 : 0.62) * vh - night.ringTop });
    const cw = Math.min((0.45 * vh) / 1.5, (0.8 * vw) / (4 + 3 * (GAP / QW)));
    night.pose('top', { a: 90, fr: 0, f: clamp(cw / (QW * u), 1.2, 7), tilt: 3, at: [0, 0, 0], y: 0.6 * vh - night.ringTop });
    // the accusation: lines from each accuser to the blamed seat, and how far each card turns toward it (a third of the way)
    const T0 = P[target];
    lines.forEach((l, k) => {
      const A = P[accusers[k]], dx = T0.x - A.x, dy = T0.y - A.y;
      l.el.style.width = `${Math.hypot(dx, dy).toFixed(1)}px`;
      l.el.style.transform = `translate3d(${A.x.toFixed(1)}px,${A.y.toFixed(1)}px,0) rotate(${(Math.atan2(dy, dx) / DEG).toFixed(2)}deg)`;
      swivel[k] = wrap(Math.atan2(dx, -dy) / DEG - A.rot) / 3;
    });
    flown = false;
  }
  night.onMeasure.push(measure);
  if (night.vw) measure();
  const onResize = () => (flown = false);
  addEventListener('resize', onResize, { passive: true });
  cards.forEach((c, i) => (c.x = D3[i] ?? D4[i]));

  // ---------- the reveal (007 "The reveal") ----------
  const ltr = () => [0, 1, 2, 3].sort((a, b) => cards[a].x - cards[b].x);
  const say1 = (s) => live && (live.textContent = s);
  function start(c, mode) {
    c.started = true;
    c.mode = mode;
    const fail = order.length === 3 && !hasFail; // faces are given late: the fourth card to turn is the Fail
    c.face = fail ? 'fail' : 'success';
    if (fail) hasFail = true;
    order.push(c.id);
    c.el.classList.toggle('is-fail', fail);
    say1(fail ? T.liveFail : T.live1);
    touched = true;
  }
  function unstart(c) {
    const i = order.indexOf(c.id);
    if (i >= 0) order.splice(i, 1);
    if (c.face === 'fail') hasFail = false;
    c.started = false;
    c.face = null;
    c.mode = null;
    c.sp = c.tp = 0;
    c.el.classList.remove('is-fail');
    if (!order.length) say1('');
  }
  function reset() {
    if (aftTween) aftTween.kill();
    aftTween = null;
    Aft.t = 0;
    cards.forEach((c) => {
      if (c.tw) c.tw.kill();
      c.tw = null;
      unstart(c);
    });
    order.length = 0;
    hasFail = false;
    touched = false;
    say1('');
  }
  function setOpen(on) {
    open = on;
    cards.forEach((c) => {
      const can = on && !c.started;
      if (c.el.inert === !can) return;
      c.el.inert = !can;
      c.el.classList.toggle('is-open', can);
    });
  }
  function tap(c) {
    if (!open || c.started) return;
    start(c, 'tap');
    const fail = c.face === 'fail';
    c.tp = 0;
    c.tw = gsap.to(c, {
      tp: 1, duration: fail ? 1.7 : 0.7, ease: 'none',
      onComplete: () => {
        if (fail) aftTween = gsap.to(Aft, { t: 1, duration: 1.4, ease: 'power2.inOut' });
      },
    });
  }
  const offs = [];
  cards.forEach((c) => {
    const fn = () => tap(c);
    c.el.addEventListener('click', fn);
    offs.push(() => c.el.removeEventListener('click', fn));
  });
  function revealStep(t) {
    if (t < TAP0) {
      if (touched) reset();
      return setOpen(false);
    }
    // the scroll turns every card that was not tapped, left to right, spaced so the last one lands at S1
    const rest = ltr().filter((id) => cards[id].mode !== 'tap').map((id) => cards[id]);
    const m = rest.length;
    const len = (S1 - S0) / (1 + 0.55 * Math.max(0, m - 1));
    rest.forEach((c, k) => {
      const p = clamp((t - (S0 + k * 0.55 * len)) / len);
      c.sp = p;
      if (p > 0 && !c.started) start(c, 'scroll');
      else if (p <= 0 && c.started && c.mode === 'scroll') unstart(c);
    });
    setOpen(true);
    // a soft ripple across the four cards, once, to say they can be touched
    if (!rippled && t > TAP0 + 0.02) {
      rippled = true;
      gsap.timeline().to(cards, { rp: 1, duration: 0.35, ease: 'power2.out', stagger: 0.09 }).to(cards, { rp: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.09 }, 0.35);
    }
  }

  // ---------- one frame (after vote.frame, so the seat cards' numbers are already set) ----------
  function frame() {
    const t = Q.t, u = night.u, P = table.pos;
    night.shade = Q.shade;
    // straight down, the table fills the screen behind the words: they turn cream while it does
    const onTable = S.w2 > 0.5;
    if (onTable !== wasOnTable) say.classList.toggle('on-table', (wasOnTable = onTable));
    revealStep(t);
    const team = Q.qn > 0.5 ? q2.team : q1.team;
    const aft = Math.max(Aft.t, clamp((t - S1) / 0.2));
    let failCard = null;
    cards.forEach((c, i) => {
      if (c.face === 'fail') failCard = c;
      if (c.vis < 0.002) {
        put(c.el, 'v', 'hidden');
        return;
      }
      const sp = P[team[i] ?? team[0]];
      const e = smooth(c.pa);
      const mx = c.x * u;
      const fx = sp.x * 0.66, fy = sp.y * 0.66;
      const dir = i % 2 ? -1 : 1;
      let flip = c.f, lift = Math.sin(Math.PI * c.f);
      if (c.started) {
        const s = turnShape(c.mode === 'tap' ? c.tp : c.sp, c.face === 'fail');
        flip = s.flip;
        lift = s.lift * (c.face === 'fail' ? 1.6 : 1);
      }
      const z = (1.5 + lift * 28 + c.ar * 22 + Math.sin(Math.PI * c.rp) * 9) * u;
      put(c.el, 'v', 'visible');
      put(c.el, '--o', clamp(c.vis * 1.8).toFixed(3));
      put(c.el, 't', `translate3d(${lerp(fx, mx, e).toFixed(1)}px,${(lerp(fy, 0, e) + dir * c.ar * 26 * u).toFixed(1)}px,${z.toFixed(1)}px) rotate(${(wrap(sp.rot) * (1 - e)).toFixed(2)}deg) scale3d(0.5,0.5,0.5)`);
      night.turn(c.flip, smooth(clamp(flip)));
      put(c.glow, 'o', clamp(c.gl).toFixed(3));
    });
    // the hand: the Assassin's two cards, Success and Fail, standing
    const hv = Q.hs > 0.002 && Q.hl < 0.998;
    const sp = P[failBy], ang = (90 + 36 * failBy) * DEG;
    hands.forEach((h, k) => {
      if (!hv) return put(h.el, 'v', 'hidden');
      const fail = k === 1, side = fail ? 1 : -1;
      const x = sp.x * 0.92 + -Math.sin(ang) * side * 28 * u, y = sp.y * 0.92 + Math.cos(ang) * side * 28 * u;
      const z = (115 + (fail ? Q.hf * 26 : 0) - (1 - Q.hs) * 60 - Q.hl * 70) * u;
      const s = 0.5 * (0.75 + 0.25 * Q.hs) * (fail ? 1 + 0.05 * Q.hf : 1);
      put(h.el, 'v', 'visible');
      put(h.el, '--o', (clamp(Q.hs * 2) * (1 - Q.hl) * (fail ? 1 : 1 - 0.55 * Q.hf)).toFixed(3));
      put(h.el, 't', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotate(${sp.rot}deg) rotateX(-90deg) rotateZ(${(side * 9).toFixed(1)}deg) scale3d(${s.toFixed(3)},${s.toFixed(3)},${s.toFixed(3)})`);
      put(h.glow, 'o', (fail ? Q.hf : 0).toFixed(3));
    });
    // the Fail's aftermath: red light over the table, the badge flies into circle 2, which fills red
    const lightAt = failCard ? failCard.x * u : 0;
    const rv = 0.85 * smooth(clamp(aft / 0.55)) * (1 - clamp(B.fade));
    put(rl, 'o', rv.toFixed(3));
    put(rl, 't', `translate3d(${lightAt.toFixed(1)}px,0px,${(1.2 * u).toFixed(1)}px) scale3d(${(0.35 + 0.65 * smooth(clamp(aft / 0.8))).toFixed(3)},${(0.35 + 0.65 * smooth(clamp(aft / 0.8))).toFixed(3)},1)`);
    V.qbad[1] = smooth(clamp((aft - 0.62) / 0.3));
    flight(aft, failCard);
    // the accusation: lines draw seat to seat, the accusing cards swivel, the blamed seat dims and sinks
    lines.forEach((l, k) => {
      const a = clamp(B.line[k]) * (1 - B.out);
      put(l.el, 'v', a < 0.002 ? 'hidden' : ''); // undrawn: hidden, so it costs no off-screen surface (spec 013, CP-4)
      put(l.ln, 't', `translateZ(${(20 * u).toFixed(1)}px) scaleX(${a.toFixed(3)})`);
      put(l.sh, 't', `translateZ(${u.toFixed(2)}px) scaleX(${a.toFixed(3)})`);
      X.dr[accusers[k]] += swivel[k] * smooth(a);
    });
    // the labels: the Assassin with his two cards in hand, and everyone in the accusation
    night.F[failBy] = Math.max(night.F[failBy], clamp(Q.hs) * (1 - clamp(Q.hl)));
    lines.forEach((l, k) => {
      const a = clamp(B.line[k]) * (1 - B.out);
      night.F[accusers[k]] = Math.max(night.F[accusers[k]], a);
      night.F[target] = Math.max(night.F[target], a);
    });
    X.op[target] *= 1 - 0.35 * B.dim;
    X.sc[target] *= 1 - 0.08 * B.dim;
    X.dz[target] -= 3 * u * B.dim;
  }
  night.after.push(frame);

  // the badge of the Fail flies up into circle 2 of the bar (a 2D overlay, the bar is flat HTML)
  function flight(aft, failCard) {
    if (aft < 0.002 || !failCard) {
      put(fly, 'v', 'hidden');
      flown = false;
      return;
    }
    if (!flown) {
      flyFrom = flightPoints(sec, failCard.el.querySelector('.fr-bad .br'), qdBar()[1]);
      flown = true;
    }
    const f = smooth(clamp((aft - 0.1) / 0.55));
    if (f >= 0.999) return put(fly, 'v', 'hidden');
    flyPlace(put, fly, flyFrom, f);
  }

  // ---------- the story, in screens: 3.6 on a desktop, a phone plays it 0.86 as long ----------
  const LEN = 3.6;
  let qt = null;
  function build(tl, at, perScreen) {
    const k = desktop ? 1 : 0.86;
    qt = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const keys = [0, 1, 2, 3];
    const reseat = (t, xs) => cards.forEach((c, i) => qt.to(c, { x: xs[i], duration: 0.001 }, t));

    // the words
    const beats = [
      [0.05, T.secret], [0.18, T.rule], [0.4, T.q1], [0.93, T.q1done], [1.05, T.team2], [1.26, T.hand], [1.72, T.shuffle],
      [TAP0, T.turn], [2.84, T.fail], [3.06, T.both], [3.3, T.points],
    ];
    sayLines(gsap, qt, say, beats);
    if (lastVote) qt.to(lastVote, { autoAlpha: 0, y: -18, duration: 0.09, ease: 'power1.in' }, 0.0);
    // the time inside the quest, read by the reveal every frame
    qt.to(Q, { t: LEN, duration: LEN, ease: 'none' }, 0);

    // 1 the rule: the table dims, a Success and a Fail rise and face the visitor, their badges glow, and they sink away
    gsap.set(rule, { autoAlpha: 0 });
    gsap.set(ruleCards, { y: 90, autoAlpha: 0, rotationY: 0 });
    qt.to(Q, { shade: 0.3, duration: 0.1 }, 0);
    qt.to(rule, { autoAlpha: 1, duration: 0.01 }, 0.03);
    ruleCards.forEach((c, i) => qt.fromTo(c, { y: 90, autoAlpha: 0, rotationY: i ? 12 : -12 }, { y: 0, autoAlpha: 1, rotationY: i ? -7 : 7, duration: 0.17, ease: 'power3.out', immediateRender: false }, 0.05 + i * 0.03));
    qt.to(badges[0][0], { '--g': 1, duration: 0.07 }, 0.17).to(badges[0][0], { '--g': 0.35, duration: 0.07 }, 0.26);
    qt.to([badges[0][1], badges[1][2]], { '--g': 1, duration: 0.07 }, 0.25).to([badges[0][1], badges[1][2]], { '--g': 0.35, duration: 0.07 }, 0.34);
    ruleCards.forEach((c, i) => qt.to(c, { y: 70, autoAlpha: 0, duration: 0.1, ease: 'power2.in' }, 0.32 + i * 0.02));
    qt.to(rule, { autoAlpha: 0, duration: 0.01 }, 0.45);
    // the first team goes back to its seats while the rule is on screen
    q1.team.forEach((s, j) => qt.to(V.tm[1], { [s]: 0, duration: 0.14 }, 0.12 + j * 0.02));

    // 2 quest 1: three cards slide to the middle, the Assassin's glints red, a quick shuffle, all three turn, circle 1 fills blue
    qt.to(Q, { shade: 0, duration: 0.18 }, 0.3);
    qt.to(S, { dz: desktop ? 0.09 : 0.06, duration: 0.14 }, 0.36);
    [0, 1, 2].forEach((c) => {
      qt.to(cards[c], { vis: 1, duration: 0.06 }, 0.42 + c * 0.04);
      qt.to(cards[c], { pa: 1, duration: 0.14, ease: 'power2.out' }, 0.42 + c * 0.04);
    });
    const g = cards[q1.team.indexOf(q1.glint - 1)];
    qt.to(g, { gl: 1, duration: 0.05, ease: 'power1.out' }, 0.44).to(g, { gl: 0, duration: 0.12 }, 0.5);
    // where each card stands in the row as the swaps go by (design pixels), so each swap starts from the right place
    const cur = {};
    const rowAt = (xs) => cards.forEach((c, i) => (cur[i] = xs[i] ?? xs[0]));
    const swap = (t, a, b, d) => {
      const xa = cur[a], xb = cur[b];
      cur[a] = xb;
      cur[b] = xa;
      qt.to(cards[a], { x: xb, duration: d }, t).to(cards[b], { x: xa, duration: d }, t);
      qt.to(cards[a], { ar: 1, duration: d / 2, ease: 'power2.out' }, t).to(cards[a], { ar: 0, duration: d / 2, ease: 'power2.in' }, t + d / 2);
      qt.to(cards[b], { ar: 1, duration: d / 2, ease: 'power2.out' }, t).to(cards[b], { ar: 0, duration: d / 2, ease: 'power2.in' }, t + d / 2);
    };
    rowAt(D3);
    swap(0.56, 0, 1, 0.1);
    swap(0.68, 1, 2, 0.1);
    [0, 1, 2].forEach((c) => qt.to(cards[c], { f: 1, duration: 0.1 }, 0.82));
    qt.to(V.qok, { 0: 1, duration: 0.07 }, 0.94);
    [0, 1, 2].forEach((c) => qt.to(cards[c], { vis: 0, duration: 0.07 }, 1.0));
    qt.to(S, { dz: 0, duration: 0.14 }, 0.98);

    // 3 team 2 arrives by the crown: it slides to seat 3, seats 2, 3, 5 and 8 lift with gold rings
    qt.to(V.crown, { seat: q2.leader, duration: 0.14 }, 1.06);
    q2.team.forEach((s, j) => qt.to(V.gold, { [s]: 1, duration: 0.1, ease: 'power1.out' }, 1.12 + j * 0.02));
    qt.to(V.gold, { ...Object.fromEntries(q1.team.filter((s) => !q2.team.includes(s)).map((s) => [s, 0])), duration: 0.1 }, 1.12);
    // the cards are made ready for quest 2 while nothing shows them: four cards, a new team, a new row
    qt.to(Q, { qn: 1, duration: 0.001 }, 1.2);
    qt.to(cards, { f: 0, pa: 0, duration: 0.001 }, 1.2);
    reseat(1.2, D4);
    rowAt(D4);

    // 4 the hand: low behind the Assassin's shoulder, two cards in his hand, he picks Fail, the hand lowers, four cards go to the middle
    qt.to(S, { w1: 1, duration: 0.2 }, 1.2);
    qt.to(Q, { hs: 1, duration: 0.13, ease: 'power2.out' }, 1.34);
    qt.to(Q, { hf: 1, duration: 0.09, ease: 'power1.out' }, 1.5);
    qt.to(Q, { hl: 1, duration: 0.08, ease: 'power2.in' }, 1.6);
    keys.forEach((c) => {
      qt.to(cards[c], { vis: 1, duration: 0.05 }, 1.62 + c * 0.03);
      qt.to(cards[c], { pa: 1, duration: 0.13, ease: 'power2.out' }, 1.62 + c * 0.03);
    });
    qt.to(V.gold, { ...Object.fromEntries(q2.team.map((s) => [s, 0])), duration: 0.1 }, 1.66);

    // 5 the shuffle: the camera rises to look straight down, then the cups and ball swaps
    qt.to(S, { w2: 1, duration: 0.24 }, 1.66);
    qt.to(S, { w1: 0, duration: 0.001 }, 1.9);
    swap(1.76, 0, 1, 0.09);
    swap(1.82, 2, 3, 0.09);
    swap(1.88, 1, 2, 0.09);

    // 6 to 8, the tap window, the scroll's turns and the Fail's landing are driven by Q.t in frame()

    // 9 the blame: the quest cards fade, the camera pulls back to the resting lean, the Assassin points first, the table follows
    keys.forEach((c) => qt.to(cards[c], { vis: 0, duration: 0.1 }, 3.0));
    qt.to(B, { fade: 1, duration: 0.2 }, 3.0);
    qt.to(S, { w2: 0, duration: 0.26 }, 3.02);
    accusers.forEach((s, j) => {
      const t = j === 0 ? 3.14 : 3.24 + (j - 1) * 0.04;
      qt.to(B.line, { [j]: 1, duration: j === 0 ? 0.12 : 0.1, ease: 'power1.out' }, t);
    });
    qt.to(B, { dim: 1, duration: 0.12 }, 3.46);
    qt.to({}, { duration: 0.01 }, LEN - 0.01);

    qt.timeScale(1 / (k * perScreen));
    tl.add(qt, at);
    return LEN * k * perScreen;
  }

  function destroy() {
    if (qt) qt.kill();
    reset();
    gsap.killTweensOf(cards);
    offs.forEach((f) => f());
    removeEventListener('resize', onResize);
    const i = night.after.indexOf(frame);
    if (i >= 0) night.after.splice(i, 1);
    const m = night.onMeasure.indexOf(measure);
    if (m >= 0) night.onMeasure.splice(m, 1);
    [under, flat].forEach((el) => {
      const p = night.planes.indexOf(el);
      if (p >= 0) night.planes.splice(p, 1);
      el.remove();
    });
    rule.remove();
    fly.remove();
    night.shade = 0;
    if (say) {
      say.innerHTML = '';
      say.classList.remove('on-table');
    }
    if (live) live.textContent = '';
    if (lastVote) gsap.set(lastVote, { clearProps: 'all' });
  }

  return { build, destroy, Q, B, lastLine: () => say && say.lastElementChild };
}

// the badge of a Fail flies up into a circle of the bar (a 2D overlay, the bar is flat HTML). Chapter 6 flies two of them.
export function flightPoints(sec, fromEl, toEl) {
  const sr = sec.getBoundingClientRect(), b = fromEl.getBoundingClientRect(), c = toEl.getBoundingClientRect();
  return { from: { x: b.left + b.width / 2 - sr.left, y: b.top + b.height / 2 - sr.top, s: Math.max(8, b.width) / 40 }, to: { x: c.left + c.width / 2 - sr.left, y: c.top + c.height / 2 - sr.top, s: c.width / 40 } };
}
export function flyPlace(put, el, p, f) {
  const arc = Math.sin(Math.PI * f) * 40;
  put(el, 'v', 'visible');
  put(el, 't', `translate3d(${(lerp(p.from.x, p.to.x, f) - 20).toFixed(1)}px,${(lerp(p.from.y, p.to.y, f) - 20 - arc).toFixed(1)}px,0) scale(${lerp(p.from.s, p.to.s, f).toFixed(3)})`);
}

// ---------- reduced motion (?motion=off): four real buttons that turn with a fade, same rule: the fourth card turned is the Fail ----------
export function initQuestPlain() {
  const box = document.querySelector('[data-quest-plain]');
  const data = document.getElementById('page-data');
  if (!box || !data) return;
  const T = JSON.parse(data.textContent).quest.text;
  const live = document.querySelector('[data-quest-live]');
  box.innerHTML = [0, 1, 2, 3].map((c) => `<button class="pc qp" type="button" aria-label="${esc(fill(T.cardLabel, { n: c + 1 }))}"><span class="pc-3d">${front(T)}${back}</span></button>`).join('');
  let turned = 0, fail = false;
  box.querySelectorAll('.qp').forEach((b) => {
    b.addEventListener('click', () => {
      if (b.classList.contains('is-turned')) return;
      const isFail = turned === 3 && !fail;
      if (isFail) fail = true;
      turned++;
      b.classList.toggle('is-fail', isFail);
      b.classList.add('is-turned');
      b.disabled = true;
      b.setAttribute('aria-label', isFail ? T.cardFail : T.cardSuccess);
      if (live) live.textContent = isFail ? T.liveFail : T.live1;
    });
  });
}
