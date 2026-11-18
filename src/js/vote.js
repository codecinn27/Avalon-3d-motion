// Chapter 3, the vote (spec docs/section/006-the-vote.md). Runs inside the pinned hero, after the night. Watch only.
// It owns the crown, the score bar, the ten vote cards, the team that slides to the middle, and the gold and red outlines.
// It shares the night's camera and plane (night.js). Everything follows the scroll, both ways. The only thing on a clock is the
// slow bob and spin of the crown. Only transform and opacity change per frame, written only when a value changed.
// quest.js (chapter 4) reuses the crown, the bar and the outlines through `V`.
import { sayLines } from './say.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180; // an angle difference, the short way round
const html = (s) => {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild;
};
const IMG = (name, w) => `/assets/props/${name}-${w}.webp`;
const BACK = '/assets/cards/card-back-240.webp';
const SEAT_W = 78; // a seat card on the table, in design pixels (the table's radius is 217)

export function createVote({ gsap, sec, ring, night, desktop, data }) {
  const T = data.text;
  const rounds = data.rounds.map((r) => ({ leader: r.leader - 1, team: r.team.map((s) => s - 1), approve: new Set(r.approve.map((s) => s - 1)) }));
  const { S, X, table, put } = night;
  const n = 10;
  const keys = Array.from({ length: n }, (_, i) => i);
  const zeros = (len = n) => Object.fromEntries(Array.from({ length: len }, (_, i) => [i, 0]));

  // ---------- the layers. Same plane transform as the night's (night.planes), drawn in a fixed order: under 1, cards 15, crown 21 ----------
  const plane = (cls, inner) => {
    const el = html(`<div class="n-plane ${cls}" aria-hidden="true">${inner}</div>`);
    ring.append(el);
    night.planes.push(el);
    return el;
  };
  const under = plane('x-under', keys.map(() => '<div class="tg"><i class="g"></i><i class="r"></i></div>').join(''));
  const voteCard = `<div class="pc pcp vc pc-vote"><div class="pc-3d"><div class="pc-side pc-front"><div class="pc-in"><img class="ap" src="${IMG('approve', 240)}" alt="" width="240" height="360" decoding="async"><img class="rj" src="${IMG('reject', 240)}" alt="" width="240" height="360" decoding="async"><span class="pc-t t-ap pc-approve">${esc(T.approve)}</span><span class="pc-t t-rj pc-reject">${esc(T.reject)}</span></div></div><div class="pc-side pc-back"><div class="pc-in"><img src="${BACK}" alt="" width="240" height="360" decoding="async"></div></div></div></div>`;
  const flat = plane('x-flat', `${keys.map(() => voteCard).join('')}<div class="vcount"></div><div class="vcount"></div><i class="cr-sh"></i>`);
  const crownFaces = keys.map((k) => `<i class="cf${k % 2 ? ' v' : ''}" style="--k:${k};--l:${(52 + 30 * Math.cos((k * 36 - 50) * (Math.PI / 180))).toFixed(0)}"></i>`).join('');
  const over = plane('x-over', `<div class="cr-wrap"><div class="cr"><div class="cr-spin">${crownFaces}</div></div></div>`);
  const bar = html(`<div class="vbar" aria-hidden="true"><div class="vb-row"><span class="vb-l">${esc(T.barQuests)}</span><span class="vb-dots">${[0, 1, 2, 3, 4].map(() => '<i class="qd"><b class="ok"></b><b class="bad"></b></i>').join('')}</span></div><div class="vb-row"><span class="vb-l">${esc(T.barRejects)}</span><span class="vb-dots">${[0, 1, 2, 3, 4].map(() => '<i class="rd"><b></b></i>').join('')}</span></div></div>`);
  sec.append(bar);

  const rings = [...under.querySelectorAll('.tg')].map((el) => ({ el, g: el.children[0], r: el.children[1] }));
  const cards = [...flat.querySelectorAll('.vc')].map((el) => ({ el, flip: el.querySelector('.pc-3d') }));
  const counts = [...flat.querySelectorAll('.vcount')];
  const shadow = flat.querySelector('.cr-sh');
  const crownEl = { wrap: over.querySelector('.cr-wrap'), spin: over.querySelector('.cr-spin') };
  const qd = [...bar.querySelectorAll('.qd')].map((el) => ({ ok: el.children[0], bad: el.children[1] }));
  const rd = [...bar.querySelectorAll('.rd b')];
  const say = sec.querySelector('.vote-say');

  // each round's counts: the numbers shown in the middle
  rounds.forEach((r, k) => {
    const a = r.approve.size;
    counts[k].innerHTML = `<span>${a}</span><i>:</i><span>${n - a}</span>`;
  });
  // the picture on each vote card (0 = Approve, 1 = Reject): round 1 now, round 2 is swapped in by the timeline while the cards are hidden
  const facesOf = (r) => Object.fromEntries(keys.map((i) => [i, rounds[r].approve.has(i) ? 0 : 1]));

  // ---------- state: everything the story sets. The timeline tweens these numbers, frame() draws them ----------
  const V = {
    crown: { seat: 0, z: 340, s: 0 }, // seat is a number between seats (0 = seat 1), z the height of the crown's base in design pixels
    tm: [zeros(), zeros()], // per team: how far each seat's card has slid to the middle
    gold: zeros(), red: zeros(), // outlines under a seat (gold lifts the card too)
    vp: zeros(), flip: 0, c: [0, 0], // vote cards laid (per seat), turned, and the two counts
    rj: zeros(5), qok: zeros(5), qbad: zeros(5), // the bar: rejects lit, quest circles filled blue and red
    face: facesOf(0),
  };

  // ---------- measuring ----------
  let u = 1;
  let slots = [[], []];
  function measure() {
    u = night.u;
    // a team in the middle: three cards in a fan, the leader in the middle
    slots = rounds.map((r) => {
      const others = r.team.filter((s) => s !== r.leader);
      const order = [others[0], r.leader, others[1]];
      const out = [];
      order.forEach((s, k) => (out[s] = { x: (k - 1) * 0.46 * SEAT_W * u, y: -4 * u, rot: (k - 1) * 9 }));
      return out;
    });
  }
  night.onMeasure.push(measure);
  if (night.vw) measure();

  // ---------- one frame (called by night.frame, after the camera) ----------
  const T0 = performance.now();
  const P = () => table.pos;
  function frame() {
    const pos = P();
    let vmax = 0; // how far the vote cards are laid (any seat)
    for (const k of keys) vmax = Math.max(vmax, V.vp[k]);
    // the seat cards: slide to the middle, lift, turn. quest.js adds its own on top of these (it runs after this)
    for (let i = 0; i < n; i++) {
      let dx = 0, dy = 0, dr = 0, sc = 1;
      for (let r = 0; r < 2; r++) {
        const w = V.tm[r][i];
        if (w < 0.0005) continue;
        const s = slots[r][i], p = pos[i];
        dx += (s.x - p.x) * w;
        dy += (s.y - p.y) * w;
        dr += wrap(s.rot - p.rot) * w;
        sc -= 0.15 * w;
      }
      const w = Math.max(V.tm[0][i], V.tm[1][i]);
      X.dx[i] = dx;
      X.dy[i] = dy;
      X.dr[i] = dr;
      X.dz[i] = (V.gold[i] * 12 + Math.sin(Math.PI * w) * 10) * u;
      X.sc[i] = sc;
      X.op[i] = 1;
      night.F[i] = Math.max(night.F[i], clamp(V.gold[i]), clamp(V.red[i]));
      // while the vote cards are on the table, the seats in the middle lose their number and label (spec 006 "Seat labels")
      night.HID[i] = clamp(vmax * 3) * clamp(w * 4);
    }
    // the vote cards: one at each seat, between the seat and the middle
    const flipE = smooth(V.flip);
    const lift = Math.sin(Math.PI * V.flip) * 18 * u;
    cards.forEach((c, i) => {
      const p = V.vp[i];
      if (p < 0.002) return put(c.el, 'v', 'hidden');
      const s = pos[i];
      put(c.el, 'v', 'visible');
      put(c.el, '--o', clamp(p * 1.8).toFixed(3));
      put(c.el, '--rj', String(V.face[i]));
      put(c.el, 't', `translate3d(${(s.x * 0.55).toFixed(1)}px,${(s.y * 0.55).toFixed(1)}px,${((1 - p) * 60 * u + 1.2 * u + lift).toFixed(1)}px) rotate(${s.rot}deg) scale3d(0.5,0.5,0.5)`);
      night.turn(c.flip, flipE);
    });
    counts.forEach((el, k) => {
      const c = clamp(V.c[k]);
      put(el, 'o', c.toFixed(3));
      put(el, 't', `translate3d(0px,${(-6 * u).toFixed(1)}px,${(8 * u).toFixed(1)}px) scale3d(${(0.5 * (0.6 + 0.4 * c)).toFixed(3)},${(0.5 * (0.6 + 0.4 * c)).toFixed(3)},1)`);
    });
    // the crown: one element, moved from seat to seat
    const c = V.crown, clock = (performance.now() - T0) / 1000;
    if (c.s < 0.01) {
      put(crownEl.wrap, 'v', 'hidden');
      put(shadow, 'o', '0');
    } else {
      const i0 = Math.min(n - 2, Math.floor(c.seat)), f = c.seat - i0;
      const x = pos[i0].x + (pos[i0 + 1].x - pos[i0].x) * f, y = pos[i0].y + (pos[i0 + 1].y - pos[i0].y) * f;
      const z = (c.z + Math.sin(clock * 1.6) * 4) * u, k = (0.5 * c.s).toFixed(3);
      put(crownEl.wrap, 'v', 'visible');
      put(crownEl.wrap, 't', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(-90deg) scale3d(${k},${k},${k})`);
      put(crownEl.spin, 't', `rotateY(${((clock * 34) % 360).toFixed(1)}deg)`);
      put(shadow, 't', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${(1.4 * u).toFixed(1)}px) scale3d(${(0.5 * c.s).toFixed(3)},${(0.5 * c.s).toFixed(3)},1)`);
      put(shadow, 'o', (0.7 * c.s * (1 - clamp((c.z - 40) / 260))).toFixed(3));
    }
    // the bar
    for (let k = 0; k < 5; k++) {
      put(rd[k], 'o', clamp(V.rj[k]).toFixed(3));
      put(qd[k].ok, 'o', clamp(V.qok[k]).toFixed(3));
      put(qd[k].bad, 'o', clamp(V.qbad[k]).toFixed(3));
    }
  }
  // outlines under the cards: drawn after quest.js has had its say about the cards (night.late), so they follow them exactly
  function late() {
    const pos = P();
    rings.forEach((r, i) => {
      const g = clamp(V.gold[i]), d = clamp(V.red[i]);
      put(r.g, 'o', g.toFixed(3));
      put(r.r, 'o', d.toFixed(3));
      if (g < 0.003 && d < 0.003) return put(r.el, 'v', 'hidden');
      const s = (0.5 * X.sc[i]).toFixed(3);
      put(r.el, 'v', 'visible');
      put(r.el, 't', `translate3d(${(pos[i].x + X.dx[i]).toFixed(1)}px,${(pos[i].y + X.dy[i]).toFixed(1)}px,${(0.8 * u).toFixed(1)}px) rotate(${(pos[i].rot + X.dr[i]).toFixed(2)}deg) scale3d(${s},${s},${s})`);
    });
  }
  night.after.push(frame);
  night.late.push(late);

  // ---------- the story, in screens. 2.5 on a desktop; a phone plays it about 0.84 as long ----------
  const LEN = 2.5;
  let vt = null;
  function build(tl, at, perScreen) {
    const k = desktop ? 1 : 0.84;
    vt = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const CAM0 = { fr: 0, dz: 0, tl: 0, ty: 0 };
    const [r1, r2] = rounds;
    const all = (obj, v) => Object.fromEntries(keys.map((i) => [i, v]));
    const team = (r, v) => Object.fromEntries(r.team.map((s) => [s, v]));

    // the words
    const beats = [
      [0.12, T.leader], [0.5, T.team1], [0.8, T.cards], [1.04, T.all], [1.36, T.rejected], [1.5, T.five, T.fiveSub],
      [1.7, T.team2], [2.04, T.approved],
    ];
    sayLines(gsap, vt, say, beats);
    // the night's last line makes room
    const prev = night.lastLine();
    if (prev) vt.to(prev, { autoAlpha: 0, y: -18, duration: 0.09, ease: 'power1.in' }, 0.02);

    // 1 a leader: dive onto seat 1, the crown drops and lands, the camera pulls back wide, the bar slides in
    vt.to(S, { fr: 1, dz: 1, tl: 1, ty: 1, duration: 0.24 }, 0);
    vt.to(V.crown, { s: 1, duration: 0.1, ease: 'power2.out' }, 0.14);
    vt.to(V.crown, { z: 60, duration: 0.2, ease: 'back.out(2.4)' }, 0.18);
    vt.to(S, { ...CAM0, duration: 0.2 }, 0.3);
    gsap.set(bar, { autoAlpha: 0, y: -22 });
    vt.fromTo(bar, { autoAlpha: 0, y: -22 }, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out', immediateRender: false }, 0.32);

    // 2 the first team: seat 1 pushes three cards to the middle, they lift and glow gold
    r1.team.forEach((s, j) => vt.to(V.tm[0], { [s]: 1, duration: 0.17 }, 0.52 + j * 0.03));
    r1.team.forEach((s) => vt.to(V.gold, { [s]: 1, duration: 0.1, ease: 'power1.out' }, 0.7));

    // 3 everyone votes: each seat lays one card face down
    keys.forEach((i) => vt.to(V.vp, { [i]: 1, duration: 0.1, ease: 'power2.out' }, 0.82 + i * 0.012));

    // 4 all at once: all ten turn over at the same moment, then the count lands
    vt.to(S, { dz: 0.06, duration: 0.3, ease: 'sine.inOut' }, 1.02);
    vt.to(V, { flip: 1, duration: 0.14 }, 1.08);
    vt.to(V.c, { 0: 1, duration: 0.1, ease: 'back.out(1.6)' }, 1.24);

    // 5 rejected: the cards fade, the team goes back, a quick push in on the crown, it moves to seat 2, the first mark lights
    vt.to(S, { a: '+=16', fr: 0.8, dz: 0.4, tl: 0.35, ty: 0.35, duration: 0.14 }, 1.36);
    keys.forEach((i) => vt.to(V.vp, { [i]: 0, duration: 0.08 }, 1.4 + i * 0.004));
    vt.to(V.c, { 0: 0, duration: 0.08 }, 1.4);
    vt.to(V.tm[0], { ...team(r1, 0), duration: 0.14 }, 1.42);
    vt.to(V.gold, { ...team(r1, 0), duration: 0.1 }, 1.42);
    vt.to(V.crown, { seat: rounds[1].leader, duration: 0.14 }, 1.5);
    vt.to(V.rj, { 0: 1, duration: 0.1, ease: 'power1.out' }, 1.58);
    vt.to(S, { a: '-=16', ...CAM0, duration: 0.16 }, 1.54);

    // 6 a second team: the Assassin's seat flickers red for a moment, for the visitor's eyes only
    r2.team.forEach((s, j) => vt.to(V.tm[1], { [s]: 1, duration: 0.17 }, 1.74 + j * 0.03));
    const a = r2.leader;
    vt.to(V.red, { [a]: 1, duration: 0.04, ease: 'power1.out' }, 1.78)
      .to(V.red, { [a]: 0.25, duration: 0.04 }, 1.82)
      .to(V.red, { [a]: 0.9, duration: 0.04 }, 1.86)
      .to(V.red, { [a]: 0, duration: 0.08 }, 1.9);
    r2.team.forEach((s) => vt.to(V.gold, { [s]: 1, duration: 0.1, ease: 'power1.out' }, 1.94));

    // 7 approved: ten new cards, all turned together, seven and three. The reject mark clears. The team stays for chapter 4
    // (fromTo with immediateRender off, not set(): a set() would be applied at once and swap round 1's pictures too early)
    vt.fromTo(V, { flip: 1 }, { flip: 0, duration: 0.001, immediateRender: false }, 2.0);
    vt.fromTo(V.face, facesOf(0), { ...facesOf(1), duration: 0.001, immediateRender: false }, 2.0);
    keys.forEach((i) => vt.to(V.vp, { [i]: 1, duration: 0.08, ease: 'power2.out' }, 2.04 + i * 0.006));
    vt.to(S, { dz: 0.05, duration: 0.3, ease: 'sine.inOut' }, 2.1);
    vt.to(V, { flip: 1, duration: 0.12 }, 2.2);
    vt.to(V.c, { 1: 1, duration: 0.09, ease: 'back.out(1.6)' }, 2.32);
    vt.to(V.rj, { 0: 0, duration: 0.1 }, 2.4);
    vt.to(S, { dz: 0, duration: 0.1 }, 2.4);
    keys.forEach((i) => vt.to(V.vp, { [i]: 0, duration: 0.07 }, 2.43 + i * 0.002));
    vt.to(V.c, { 1: 0, duration: 0.07 }, 2.43);
    vt.to({}, { duration: 0.01 }, LEN - 0.01);

    vt.timeScale(1 / (k * perScreen));
    tl.add(vt, at);
    return LEN * k * perScreen;
  }

  function destroy() {
    if (vt) vt.kill();
    const i = night.after.indexOf(frame);
    if (i >= 0) night.after.splice(i, 1);
    const j = night.late.indexOf(late);
    if (j >= 0) night.late.splice(j, 1);
    const m = night.onMeasure.indexOf(measure);
    if (m >= 0) night.onMeasure.splice(m, 1);
    [under, flat, over].forEach((el) => {
      const p = night.planes.indexOf(el);
      if (p >= 0) night.planes.splice(p, 1);
      el.remove();
    });
    bar.remove();
    if (say) say.innerHTML = '';
    keys.forEach((s) => {
      X.dx[s] = X.dy[s] = X.dr[s] = X.dz[s] = 0;
      X.sc[s] = X.op[s] = 1;
    });
  }

  return { build, destroy, V, bar, flat, under, over, measure };
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
