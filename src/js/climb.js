// Chapter 6, the climb (spec docs/section/009-the-climb.md). Runs inside the pinned hero, after the Lady of the Lake. Watch only:
// nothing in it can be tapped. Three fast quests cut to the scroll, a short flash of chapter 5's water, and the celebration.
// It shares the night's camera and plane. The crown, the bar and the outlines come from vote.js (`V`), the quest cards' look and the
// badge flight from quest.js, the standing Lady card, the word "Evil.", the lines and the water from lady.js. Everything follows
// the scroll, both ways. The one thing on a clock is the slow drift of the motes and the pulse of the circles, only in the last step.
import { sayLines } from './say.js';
import { front, back, turnShape, QW, GAP, esc, fill, flightPoints, flyPlace } from './quest.js';

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

export function createClimb({ gsap, sec, ring, night, vote, quest, lady, desktop, data, questText }) {
  const T = data.text;
  const seat0 = (s) => s - 1;
  const quests = data.quests.map((q) => ({ ...q, team: q.team.map(seat0), leader: seat0(q.leader), fails: (q.fails || []).map(seat0), glint: (q.glint || q.fails || []).map(seat0) }));
  const TEAMS = quests.map((q) => q.team);
  const [qa, qb, qc] = quests;
  const [l1, l2] = data.lady.map((l) => ({ ...l, holder: seat0(l.holder), target: seat0(l.target), turn: (l.turn || []).map(seat0) }));
  const { S, X, table, put } = night;
  const V = vote.V, B = quest.B, Ly = lady.Ly;
  const n = 10;
  const NC = 5;

  // the Lady's places along her walk (lady.W): seat 7, seat 3, then seat 2 and seat 5
  const legSeat2 = lady.W.push(l1.target) - 1;
  const legSeat5 = lady.W.push(l2.target) - 1;
  lady.msgs.red = T.liveRed;

  // ---------- the layers ----------
  const plane = (cls, inner, hide = true) => lady.planeOf(cls, inner, hide);
  const under = plane('x-under c-under', `<i class="rl"></i><div class="n-g c-g"><i class="glow g-gold"></i></div><div class="n-g c-g"><i class="glow g-gold"></i></div>`);
  const flashLines = lady.lineSet([
    { from: l1.holder, to: l1.target, kind: 'gold' }, // seat 3 looks at seat 2
    ...l1.turn.map((s) => ({ from: s, to: l1.target, kind: 'pale' })), // the table turns on seat 2
    { from: l2.holder, to: l2.target, kind: 'gold' }, // the Assassin looks at Percival
  ]);
  const pointer = lady.lineSet(qc.team.filter((s) => s !== qc.namedBy - 1).map((s) => ({ from: qc.namedBy - 1, to: s, kind: 'gold' })), 0.08);
  under.append(flashLines.el, pointer.el);
  const cardEl = () => `<div class="pc pcp xq kq"><i class="pc-glow"></i><span class="pc-3d">${front(questText)}${back}</span></div>`;
  const flat = plane('x-flat c-flat', Array.from({ length: NC }, cardEl).join(''));
  const gold = html('<div class="c-gold" aria-hidden="true"></div>');
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const MOTES = Array.from({ length: desktop ? 26 : 16 }, () => ({ x: rnd(), s: 0.5 + rnd() * 1.1, sp: 0.55 + rnd() * 0.6, ph: rnd() * 6.28, sw: 6 + rnd() * 16, at: rnd() * 0.35 }));
  const motes = html(`<div class="c-motes" aria-hidden="true">${MOTES.map(() => '<i></i>').join('')}</div>`);
  const fly = [html('<i class="q-fly" aria-hidden="true"></i>'), html('<i class="q-fly" aria-hidden="true"></i>')];
  sec.append(gold, motes, ...fly);
  const moteEls = [...motes.children];
  const say = sec.querySelector('.climb-say');
  const live = sec.querySelector('[data-climb-live]');
  const qdEls = [...vote.bar.querySelectorAll('.qd')];
  const halos = qdEls.map((el) => {
    const s = html('<s class="qh"></s>');
    el.append(s);
    return s;
  });
  const lastLady = sec.querySelector('.lady-say')?.lastElementChild;

  const rl = under.querySelector('.rl');
  const glows = [...under.querySelectorAll('.c-g')];
  const cards = [...flat.querySelectorAll('.kq')].map((el, id) => ({
    id, el, glow: el.querySelector('.pc-glow'), flip: el.querySelector('.pc-3d'),
    vis: 0, pa: 0, x: 0, ar: 0, gl: 0, f: 0, tp: 0, fail: 0, lm: 1, // shown, seat to middle, place in the row, shuffle arc, red glint, batch turn, a Fail's own turn, its face, its lift
  }));

  // ---------- state ----------
  const K = { t: 0, qi: 0, sh: 0, r1: 0, r2: 0, rf: 0, dim2: 0, gold: 0, m: 0, pulse: 0, f1: 0, f2: 0, clk: 0 };
  let wasFlash = false, flown = [false, false], fp = [null, null], lastClock = 0, scoreSaid = '';

  // ---------- measuring ----------
  const D = (k) => Array.from({ length: k }, (_, i) => (i - (k - 1) / 2) * (QW + GAP));
  const ROW = [D(4), D(5), D(5)]; // the row of cards in the middle, design pixels, per quest
  function measure() {
    const vw = night.vw, vh = night.vh, rs = night.rs, u = night.u;
    // camera poses (009 "The camera"). The push on the middle: about 1.4x on a desktop; on a phone the row of five fills 86% of the width.
    const row = (5 * QW + 4 * GAP) * u;
    const f5 = desktop ? 1.4 : clamp((0.86 * vw) / row, 1.25, 3);
    night.pose('top5', { a: 90, fr: 0, f: f5, tilt: night.tilt, at: [0, 0, 0], y: table.y });
    // the short sink into the water: shallower than chapter 5's
    const D0 = 1.508 * rs, tilt = desktop ? 16 : 12;
    const f = desktop ? (0.5 * vh) / (D0 * Math.cos(tilt * DEG)) : (0.76 * vw) / D0;
    night.pose('flash', { a: 90, fr: 0, f: clamp(f, 1.2, 7), tilt, at: [0, 0, 0], y: 0.58 * vh - night.ringTop });
    flashLines.measure();
    pointer.measure();
    const P = table.pos;
    [4, 3].forEach((s, k) => put(glows[k], 't', `translate3d(${P[s].x.toFixed(1)}px,${P[s].y.toFixed(1)}px,${(1.5 * u).toFixed(1)}px) rotate(${P[s].rot}deg)`));
    flown = [false, false];
  }
  night.onMeasure.push(measure);
  if (night.vw) measure();
  const onResize = () => (flown = [false, false]);
  addEventListener('resize', onResize, { passive: true });

  // ---------- one frame (after lady.frame) ----------
  function frame(clock) {
    const dt = Math.min(0.05, Math.max(0, clock - lastClock));
    lastClock = clock;
    const u = night.u, P = table.pos;
    // the three quests' cards: laid at the seats of the team, slide to the middle, turn together, or one by one with a Fail
    const team = TEAMS[K.qi], count = team.length;
    cards.forEach((c, i) => {
      if (c.vis < 0.002 || i >= count) return put(c.el, 'v', 'hidden');
      const sp = P[team[i]];
      const e = smooth(c.pa);
      const mx = c.x * u;
      const fx = sp.x * 0.66, fy = sp.y * 0.66;
      const dir = i % 2 ? -1 : 1;
      let flip = c.f, lift = Math.sin(Math.PI * c.f);
      if (c.tp > 0.0001) {
        const s = turnShape(c.tp, c.fail > 0.5);
        flip = s.flip;
        lift = s.lift * c.lm;
      }
      put(c.el, 'v', 'visible');
      put(c.el, '--o', clamp(c.vis * 1.8).toFixed(3));
      put(c.el, 't', `translate3d(${lerp(fx, mx, e).toFixed(1)}px,${(lerp(fy, 0, e) + dir * c.ar * 26 * u).toFixed(1)}px,${((1.5 + lift * 28 + c.ar * 22) * u).toFixed(1)}px) rotate(${(wrap(sp.rot) * (1 - e)).toFixed(2)}deg) scale3d(0.5,0.5,0.5)`);
      const isFail = c.fail > 0.5;
      if (c.failOn !== isFail) {
        c.failOn = isFail;
        c.el.classList.toggle('is-fail', isFail);
      }
      night.turn(c.flip, smooth(clamp(flip)));
      put(c.glow, 'o', clamp(c.gl).toFixed(3));
    });
    // red light that spreads over the table from the Fails (the second is wider), the Percival and Morgana shine
    const fc = cards.filter((c) => c.fail > 0.5);
    const lightAt = fc.length ? (fc.reduce((s, c) => s + c.x, 0) / fc.length) * u : 0;
    const rv = Math.max(0.6 * smooth(clamp(K.r1)), 0.9 * smooth(clamp(K.r2))) * (1 - clamp(K.rf));
    put(rl, 'o', rv.toFixed(3));
    const rs2 = 0.35 + 0.65 * smooth(clamp(K.r1)) + 0.4 * smooth(clamp(K.r2));
    put(rl, 't', `translate3d(${lightAt.toFixed(1)}px,0px,${(1.2 * u).toFixed(1)}px) scale3d(${rs2.toFixed(3)},${rs2.toFixed(3)},1)`);
    glows.forEach((g) => put(g.firstElementChild, 'o', clamp(K.sh).toFixed(3)));
    flashLines.frame();
    pointer.frame();
    // the labels: the Lady's looks, the table turning on seat 2, Percival's pointer, Percival and Morgana's shine. Seat 2's badge waits for the water
    const F = night.F;
    const about = (it, ...ss) => ss.forEach((s) => (F[s] = Math.max(F[s], clamp(it.a) * clamp(it.o))));
    about(flashLines.items[0], l1.holder, l1.target);
    l1.turn.forEach((s, j) => about(flashLines.items[1 + j], s, l1.target));
    about(flashLines.items[1 + l1.turn.length], l2.holder, l2.target);
    pointer.items.forEach((it, j) => about(it, qc.namedBy - 1, qc.team.filter((s) => s !== qc.namedBy - 1)[j]));
    F[4] = Math.max(F[4], clamp(K.sh));
    F[3] = Math.max(F[3], clamp(K.sh));
    if (K.t > 0.001 && K.t < 0.72 && Ly.rvx < 0.999) night.NB[l1.target] = 1;
    // the badges of the two Fails fly into circle 4, one after the other
    const fails = cards.filter((c) => c.fail > 0.5);
    [K.f1, K.f2].forEach((f, k) => {
      const c = fails[k];
      if (f < 0.002 || !c) {
        put(fly[k], 'v', 'hidden');
        flown[k] = false;
        return;
      }
      if (!flown[k]) {
        fp[k] = flightPoints(sec, c.el.querySelector('.fr-bad .br'), qdEls[3]);
        flown[k] = true;
      }
      const g = smooth(clamp(f));
      if (g >= 0.999) return put(fly[k], 'v', 'hidden');
      flyPlace(put, fly[k], fp[k], g);
    });
    // seat 2 dims a little after the truth. Seat 3 coming back to full is chapter 5's own sink and the quest's blame dim, tweened to 0
    X.op[l1.target] *= 1 - 0.2 * K.dim2;
    X.sc[l1.target] *= 1 - 0.03 * K.dim2;
    // the celebration: gold light, rising motes, the circles pulse
    const onFlash = S.w4 > 0.5 || S.w5 > 0.5; // the table fills the screen behind the words: they turn cream (a halo on a phone)
    if (onFlash !== wasFlash) {
      wasFlash = onFlash;
      say.classList.toggle(desktop ? 'on-table' : 'on-wood', onFlash);
    }
    const on = K.gold > 0.02;
    if (on) K.clk += dt;
    put(gold, 'o', clamp(K.gold).toFixed(3));
    put(gold, 'v', on ? 'visible' : 'hidden');
    const W = sec.clientWidth, H = sec.clientHeight;
    MOTES.forEach((m, i) => {
      const el = moteEls[i];
      const p = clamp((K.m - m.at) / (1 - m.at));
      if (!on || p < 0.002) return put(el, 'v', 'hidden');
      const y = H * (1.04 - p * m.sp * 1.1) + Math.sin(K.clk * 0.9 + m.ph) * 8;
      const x = W * m.x + Math.sin(K.clk * 0.6 + m.ph) * m.sw + Math.sin(p * 5 + m.ph) * m.sw;
      put(el, 'v', 'visible');
      put(el, 'o', (Math.min(1, p * 5) * (0.55 + 0.45 * Math.sin(K.clk * 1.7 + m.ph))).toFixed(3));
      put(el, 't', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(m.s * (0.7 + 0.3 * p)).toFixed(3)})`);
    });
    const beat = 0.5 + 0.5 * Math.sin(K.clk * 3.4);
    qdEls.forEach((el, k) => {
      const lit = V.qok[k] > 0.5 || V.qbad[k] > 0.5;
      put(el, 't', `scale(${(1 + 0.08 * K.pulse * beat).toFixed(3)})`);
      put(halos[k], 'o', (lit && V.qok[k] > 0.5 ? K.pulse * (0.35 + 0.65 * beat) : 0).toFixed(3));
    });
    // screen readers: the score each time a circle fills
    if (K.t > 0.01 && live) {
      const good = Object.values(V.qok).filter((v) => v > 0.5).length;
      const evil = Object.values(V.qbad).filter((v) => v > 0.5).length;
      const msg = fill(T.liveScore, { good, evil });
      if (msg !== scoreSaid) live.textContent = scoreSaid = msg;
    }
  }
  night.after.push(frame);

  // ---------- the story, in screens: 2.4 on a desktop, a phone plays it 0.88 as long ----------
  const LEN = 2.4;
  let ct = null;
  function build(tl, at, perScreen) {
    const k = desktop ? 1 : 0.88;
    ct = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const goldOn = (seats, t, v = 1) => seats.forEach((s, j) => ct.to(V.gold, { [s]: v, duration: 0.08, ease: 'power1.out' }, t + j * 0.015));
    const beats = [
      [0.02, T.q3lead, T.approved], [0.24, T.q3cards], [0.47, T.ladyAgain], [0.68, T.red, T.truth], [0.82, T.q4lead, T.approved],
      [1.05, T.q4rule], [1.34, T.twoAll], [1.44, T.ladyOnce], [1.54, T.q5lead], [1.67, T.bluff], [1.82, T.q5done], [1.97, T.won],
    ];
    sayLines(gsap, ct, say, beats, { inLen: 0.07, outLen: 0.06 }); // the cuts are fast, so the words swap fast
    if (lastLady) ct.to(lastLady, { autoAlpha: 0, y: -18, duration: 0.09, ease: 'power1.in' }, 0);
    ct.to(K, { t: LEN, duration: LEN, ease: 'none' }, 0);
    // a row of cards for each quest: the cards are made ready while nothing shows them
    const cur = {};
    const rowAt = (xs) => cards.forEach((c, i) => (cur[i] = xs[i] ?? xs[0]));
    const reseat = (t, xs) => cards.forEach((c, i) => ct.to(c, { x: xs[i] ?? xs[0], duration: 0.001 }, t));
    const swap = (t, a, b, d) => {
      const xa = cur[a], xb = cur[b];
      cur[a] = xb;
      cur[b] = xa;
      ct.to(cards[a], { x: xb, duration: d }, t).to(cards[b], { x: xa, duration: d }, t);
      [a, b].forEach((c) => ct.to(cards[c], { ar: 1, duration: d / 2, ease: 'power2.out' }, t).to(cards[c], { ar: 0, duration: d / 2, ease: 'power2.in' }, t + d / 2));
    };
    const lay = (ids, t, step = 0.03) => ids.forEach((c, j) => {
      ct.to(cards[c], { vis: 1, duration: 0.05 }, t + j * step);
      ct.to(cards[c], { pa: 1, duration: 0.1, ease: 'power2.out' }, t + j * step);
    });
    const clear = (ids, t) => ids.forEach((c) => ct.to(cards[c], { vis: 0, duration: 0.05 }, t));
    const push = (t) => ct.to(S, { w5: 1, duration: 0.08, ease: 'power3.inOut' }, t);
    const pull = (t, d = 0.08) => ct.to(S, { w5: 0, duration: d, ease: 'power3.inOut' }, t);

    // 1 quest 3, the team: the crown slides to seat 4, seats 4, 1, 5 and 10 lift with gold rings
    ct.to(V.crown, { seat: qa.leader, duration: 0.12 }, 0.0);
    goldOn(qa.team, 0.08);
    // 2 quest 3, the cards: four slide to the middle, Morgana's glints red, one quick swap, all four turn together, circle 3 fills blue
    reseat(0.001, ROW[0]);
    rowAt(ROW[0]);
    push(0.2);
    ct.to(V.gold, Object.fromEntries(qa.team.map((s) => [s, 0])), 0.22);
    lay([0, 1, 2, 3], 0.22);
    qa.glint.forEach((s) => {
      const c = cards[qa.team.indexOf(s)];
      ct.to(c, { gl: 1, duration: 0.04, ease: 'power1.out' }, 0.23).to(c, { gl: 0, duration: 0.08 }, 0.29);
    });
    swap(0.33, 1, 2, 0.07);
    [0, 1, 2, 3].forEach((c) => ct.to(cards[c], { f: 1, duration: 0.07 }, 0.4));
    ct.to(V.qok, { 2: 1, duration: 0.05 }, 0.43);
    clear([0, 1, 2, 3], 0.46);
    pull(0.44);
    // the cards are made ready for quest 4 while nothing shows them: five cards, a new team, a new row, two Fail faces
    ct.to(K, { qi: 1, duration: 0.001 }, 0.52);
    ct.to(cards, { f: 0, pa: 0, tp: 0, duration: 0.001 }, 0.52);
    reseat(0.52, ROW[1]);
    ct.to(cards[3], { fail: 1, duration: 0.001 }, 0.52);
    ct.to(cards[4], { fail: 1, lm: 2.1, duration: 0.001 }, 0.52);
    ct.to(cards[3], { lm: 1.6, duration: 0.001 }, 0.52);

    // 3 the Lady again: a gold line seat 3 to seat 2, a short sink into the water, one ripple, seat 2's reflection with only a red badge
    ct.to(flashLines.items[0], { a: 1, duration: 0.05, ease: 'power1.out' }, 0.46);
    ct.to(Ly, { side: 1, duration: 0.001 }, 0.49);
    ct.to(Ly, { dim: 0, duration: 0.001 }, 0.49);
    ct.to(S, { w4: 1, duration: 0.07 }, 0.5);
    ct.to(Ly, { water: 1, duration: 0.06, ease: 'power1.out' }, 0.5);
    ct.to(flashLines.items[0], { o: 0, duration: 0.05 }, 0.52);
    ct.to(Ly, { rvx: 1, duration: 0.08, ease: 'power2.out' }, 0.57);
    // 4 the truth: the water drains with the pull back, "Evil." rises in gold above seat 3, seat 3 comes back, pale lines turn on seat 2
    ct.to(S, { w4: 0, duration: 0.06 }, 0.65);
    ct.to(Ly, { water: 0, duration: 0.06, ease: 'power1.in' }, 0.65);
    ct.to(Ly, { evSeat: l1.holder, gold: 1, duration: 0.001 }, 0.69);
    ct.to(Ly, { ev: 1, duration: 0.05, ease: 'power2.out' }, 0.7);
    ct.to(Ly, { sink: 0, duration: 0.07 }, 0.71);
    ct.to(B, { dim: 0, duration: 0.07 }, 0.71);
    l1.turn.forEach((s, j) => ct.to(flashLines.items[1 + j], { a: 1, duration: 0.05, ease: 'power1.out' }, 0.72 + j * 0.01));
    ct.to(K, { dim2: 1, duration: 0.06 }, 0.74);
    ct.to(Ly, { leg: legSeat2, duration: 0.05, ease: 'power2.inOut' }, 0.75);

    // 5 quest 4, the team: the lines and "Evil." fade, the crown slides to seat 5, five seats lift, Percival's card and Morgana's shine gold
    ct.to([...flashLines.items.slice(1, 1 + l1.turn.length)], { o: 0, duration: 0.05 }, 0.8);
    ct.to(Ly, { ev: 0, duration: 0.05 }, 0.8);
    ct.to(V.crown, { seat: qb.leader, duration: 0.12 }, 0.84);
    goldOn(qb.team, 0.92);
    ct.to(K, { sh: 1, duration: 0.05 }, 0.97);
    ct.to(K, { sh: 0, duration: 0.05 }, 1.02);
    // 6 quest 4, the rule: five cards slide to the middle, Morgana's and Mordred's glint red, one quick swap
    rowAt(ROW[1]);
    push(1.05);
    ct.to(V.gold, Object.fromEntries(qb.team.map((s) => [s, 0])), 1.06);
    lay([0, 1, 2, 3, 4], 1.06, 0.02);
    qb.fails.forEach((s) => {
      const c = cards[qb.team.indexOf(s)];
      ct.to(c, { gl: 1, duration: 0.04, ease: 'power1.out' }, 1.07).to(c, { gl: 0, duration: 0.07 }, 1.12);
    });
    swap(1.12, 0, 2, 0.06);
    // 7 two Fails: three Success turn together, then the first Fail (heavy), a pause, the second (heavier). Both badges fly into circle 4
    [0, 1, 2].forEach((c) => ct.to(cards[c], { f: 1, duration: 0.05 }, 1.19));
    ct.to(cards[3], { tp: 1, duration: 0.07, ease: 'none' }, 1.25);
    ct.to(K, { r1: 1, duration: 0.08 }, 1.27);
    ct.to(cards[4], { tp: 1, duration: 0.1, ease: 'none' }, 1.35);
    ct.to(K, { r2: 1, duration: 0.1 }, 1.4);
    ct.to(K, { f1: 1, duration: 0.07 }, 1.46);
    ct.to(K, { f2: 1, duration: 0.07 }, 1.48);
    ct.to(V.qbad, { 3: 1, duration: 0.05 }, 1.54);
    clear([0, 1, 2, 3, 4], 1.5);
    ct.to(K, { rf: 1, duration: 0.07 }, 1.52);
    pull(1.5);
    // 8 the Lady once more: a faint gold line seat 2 to seat 5, the Lady glides to seat 5
    ct.to(flashLines.items[1 + l1.turn.length], { a: 1, duration: 0.05, ease: 'power1.out' }, 1.4);
    ct.to(Ly, { leg: legSeat5, duration: 0.07, ease: 'power2.inOut' }, 1.46);
    ct.to(flashLines.items[1 + l1.turn.length], { o: 0, duration: 0.05 }, 1.52);
    // the cards are made ready for quest 5 while nothing shows them: five cards, all Success, a new team
    ct.to(K, { qi: 2, f1: 0, f2: 0, r1: 0, r2: 0, rf: 0, duration: 0.001 }, 1.56);
    ct.to(cards, { f: 0, pa: 0, tp: 0, fail: 0, lm: 1, duration: 0.001 }, 1.56);
    reseat(1.56, ROW[2]);
    // 9 quest 5, the team: the crown slides to seat 6. Percival's thin gold pointer sweeps to each chosen seat in turn, and each lifts
    ct.to(V.crown, { seat: qc.leader, duration: 0.1 }, 1.52);
    const order = qc.team.filter((s) => s !== qc.namedBy - 1);
    order.forEach((s, j) => {
      const t = 1.6 + j * 0.045;
      ct.to(pointer.items[j], { a: 1, duration: 0.04, ease: 'power1.out' }, t);
      ct.to(V.gold, { [s]: 1, duration: 0.06, ease: 'power1.out' }, t + 0.03);
      ct.to(pointer.items[j], { o: 0, duration: 0.05 }, t + 0.06);
    });
    ct.to(V.gold, { [qc.namedBy - 1]: 1, duration: 0.06, ease: 'power1.out' }, 1.6 + order.length * 0.045);
    // 10 quest 5, the cards: five slide to the middle, no glints, all five turn together, circle 5 fills blue
    rowAt(ROW[2]);
    push(1.77);
    ct.to(V.gold, Object.fromEntries(qc.team.map((s) => [s, 0])), 1.79);
    lay([0, 1, 2, 3, 4], 1.79, 0.015);
    swap(1.85, 1, 3, 0.05);
    [0, 1, 2, 3, 4].forEach((c) => ct.to(cards[c], { f: 1, duration: 0.05 }, 1.9));
    ct.to(V.qok, { 4: 1, duration: 0.04 }, 1.94);
    // 11 good has won: gold light floods the stage, the motes rise, the circles pulse, a slow pull back a little wider than rest, and it holds
    clear([0, 1, 2, 3, 4], 1.95);
    ct.to(S, { w5: 0, dz: -0.05, duration: 0.2, ease: 'power3.inOut' }, 1.95);
    ct.to(K, { gold: 0.85, duration: 0.1, ease: 'power2.out' }, 1.95);
    ct.to(K, { m: 1, duration: 0.45, ease: 'none' }, 1.95);
    ct.to(K, { pulse: 1, duration: 0.1 }, 2.0);
    ct.to({}, { duration: 0.01 }, LEN - 0.01);

    ct.timeScale(1 / (k * perScreen));
    tl.add(ct, at);
    return LEN * k * perScreen;
  }

  function destroy() {
    if (ct) ct.kill();
    removeEventListener('resize', onResize);
    gsap.killTweensOf(cards);
    const i = night.after.indexOf(frame);
    if (i >= 0) night.after.splice(i, 1);
    const m = night.onMeasure.indexOf(measure);
    if (m >= 0) night.onMeasure.splice(m, 1);
    [under, flat].forEach((el) => {
      const p = night.planes.indexOf(el);
      if (p >= 0) night.planes.splice(p, 1);
      el.remove();
    });
    lady.W.length = 2;
    lady.msgs.red = '';
    [gold, motes, ...fly].forEach((el) => el.remove());
    halos.forEach((h) => h.remove());
    qdEls.forEach((el) => (el.style.transform = ''));
    if (say) {
      say.innerHTML = '';
      say.classList.remove('on-table', 'on-wood');
    }
    if (live) live.textContent = '';
    if (lastLady) gsap.set(lastLady, { clearProps: 'all' });
  }

  return { build, destroy, K };
}

// ---------- reduced motion (?motion=off): the score circles fill as each line is reached, with fades only ----------
export function initClimbPlain() {
  const box = document.querySelector('.climb-score');
  if (!box || !('IntersectionObserver' in window)) return;
  const dots = [...box.children];
  [1, 2].forEach((q) => dots[q - 1].classList.add('on'));
  const io = new IntersectionObserver(
    (list) =>
      list.forEach((e) => {
        if (!e.isIntersecting) return;
        const q = Number(e.target.dataset.at);
        if (q) dots[q - 1].classList.add('on');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -30% 0px' },
  );
  document.querySelectorAll('.climb [data-at]').forEach((li) => io.observe(li));
}
