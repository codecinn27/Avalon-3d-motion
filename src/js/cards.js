// 3D cards: the hero ring and the whole pinned story (the deal, the night, the vote, the quest, the Lady, the climb, the blade and your seat).
import { initReveals, settleHash } from './motion.js';
import { ringState } from './reveal.js';
import { createNight } from './night.js';
import { createVote } from './vote.js';
import { createQuest } from './quest.js';
import { createLady } from './lady.js';
import { createClimb } from './climb.js';
import { createBlade } from './blade.js';
import { createSeat } from './seat.js';
import { createSeats } from './seats.js';

export function initCards({ theme, draw } = {}) {
  const { gsap, ScrollTrigger } = window;
  const mm = gsap.matchMedia();

  mm.add({ desktop: '(min-width: 821px)', phone: '(max-width: 820px)' }, (ctx) => {
    const { desktop } = ctx.conditions;
    const undo = [hero(desktop, theme, draw)];
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => undo.forEach((fn) => fn && fn());
  });

  // reveals are created once, after the pins, so their positions account for pin spacing
  initReveals();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  settleHash();
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

// ---------- hero: ten face down cards turn on an oval around the title ----------
// One angle drives everything. The ring turns by itself, scroll adds to it,
// and hovering a card eases the turning to a stop. Clicking or tapping a card
// turns it over in a dialog (see reveal.js); the ring waits while it is out.
function hero(desktop, theme, draw) {
  const { gsap } = window;
  const sec = document.querySelector('.hero');
  const ring = sec && sec.querySelector('.ring');
  if (!ring) return null;
  const slots = gsap.utils.toArray('button.slot', ring);
  // twenty more cards that only appear when the drum opens, so the wall can fill the screen
  const extras = gsap.utils.toArray('.slot.is-extra', ring);
  const extraFlips = extras.map((e) => e.querySelector('.card-3d'));
  const cards = slots.map((s) => s.querySelector('.card'));
  const copy = sec.querySelector('.copy');
  const n = slots.length;
  // every card is built twice its table size and scaled by 1/SS, so the browser draws it sharp when the night zooms in (spec 005)
  const SS = 2;
  const STEP = (Math.PI * 2) / n;
  const SPEED = (Math.PI * 2) / 64; // one lap in about a minute

  // everything the frame loop reads. GSAP tweens these numbers, never layout.
  const s = { angle: -Math.PI / 2, run: 1, p: 0, q: 0, spread: 0.25, alpha: 0 }; // p = scroll progress through the pinned hero, q = through the deal that follows it
  const straight = slots.map(() => ({ v: 0 })); // 1 = this card stands upright (held)
  const front = slots.map(() => null);
  let rx = 0, ry = 0, active = -1, restAfter = Infinity;

  // part 2: scroll progress p (0 to 1) is split into: hold, gather into a drum, drum turns
  // (the whole pin is about five screens: gather 1.2, spin 0.5, open into the wall 1.2, then the story)
  const GATHER_AT = 0.1, GATHER_LEN = 0.24, SPIN_AT = GATHER_AT + GATHER_LEN, SPIN_LEN = 0.1;
  const BURST_AT = SPIN_AT + SPIN_LEN, BURST_LEN = 0.24;
  const TOTAL = slots.length + extras.length; // the wall has this many cards
  const BURST = Array.from({ length: TOTAL }, (_, i) => ({ x: Math.sin(i * 3.3 + 0.5) * 0.12, y: -0.16 - 0.1 * Math.abs(Math.cos(i * 2.1)), r: Math.sin(i * 5.1) * 40 }));
  // the wall is one flat plane of cards with no gaps, tilted as a whole. pos = each card's place in it.
  const wall = { k: 1, y: 0, tilt: 14, rotZ: -5, pos: [] };
  // phones (spec 013, CP-6): a card at rest is flat with one face shown (data-face, see main.css). It only gets its 3D back while it turns.
  const lite = document.documentElement.classList.contains('lite');
  // the extras never turn: always face up
  extraFlips.forEach((f) => (lite ? (f.dataset.face = 'front') : (f.style.transform = 'rotateY(0deg)')));
  let extrasOn = true;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // each card drifts somewhere of its own on the way in. Fixed numbers, so scrolling back looks the same.
  const DRIFT = slots.map((_, i) => ({ x: Math.sin(i * 2.7 + 1) * 0.32, y: Math.cos(i * 1.9 + 2) * 0.3, r: Math.sin(i * 4.3) * 55 }));
  const flips = cards.map((c) => c.querySelector('.card-3d'));
  const flipped = slots.map(() => -1);
  let wasGathering = false;
  let vw = innerWidth, vh = innerHeight;
  const drum = { k: 1, r: 0, tilt: -12 };
  // part 4, the deal: q runs 0 to 1 after the story. The camera pulls back and tilts down (the plane the wall lies in
  // turns into the plane of a round table), the twenty extra cards slide off the sides, then the ten real cards are
  // dealt one by one to ten seats and turn face down on the way. DEAL is its length in the timeline below, where
  // everything before it (hold, gather, wall, story) is 1.
  const DEAL = 0.3;
  // part 5, the night: another stretch after the deal. NIGHT is its length in the timeline, where the old pin is 1
  // (about 0.88 on a desktop = 4.4 screens). night.js builds it and says how long it is.
  let NIGHT = 0;
  // chapters 3 and 4 (specs 006, 007): the vote and the quest, each a stretch of the same timeline after the night. tlRef is the
  // hero timeline once it exists: the pin is as long as the whole timeline.
  let tlRef = null;
  const CAM_LEN = 0.3, SLIDE_LEN = 0.24; // q: the camera pull back, the extras leaving
  const DEAL_AT = 0.3, DEAL_STEP = 0.05, DEAL_EACH = 0.2; // q: the first card leaves, then one every STEP, each takes EACH
  const table = { tilt: 56, y: 0, rs: 300, k: 1, d: 700, pos: [] }; // rs = radius of the circle of seats
  const tableEl = ring.querySelector('.table');
  let tableOn = true;

  const measure = () => {
    rx = ring.offsetWidth;
    ry = ring.offsetHeight;
    vw = innerWidth;
    vh = innerHeight;
    // size the packed drum to the screen: about half as tall as the screen, and never wider than it
    const w = slots[0].offsetWidth / SS;
    drum.k = Math.max(1, Math.min((0.5 * vh) / (1.5 * w), (0.46 * vw) / (1.65 * w)));
    drum.r = w * 1.1 * drum.k;
    // the wall: about 55% of the screen tall and wider than the screen (the edges run off it).
    // Pick the most rows whose cards, at that height, still cover the width.
    // The wall starts above the top edge, so it sits behind the header like the reference.
    const H = 0.62 * vh, need = 1.25 * vw, rows = vw > 820 ? 2 : 3; // desktop 2 rows (3 would fill the screen), phone and tablet 3
    const cols = Math.ceil(TOTAL / rows);
    const cw = Math.max(H / (1.5 * rows), need / cols);
    const pitch = cw * 0.995; // a hair of overlap, so no seam shows between cards
    wall.k = cw / w;
    wall.y = (rows * cw * 1.5) / 2 - 0.07 * vh - (parseFloat(getComputedStyle(ring).top) || 0.54 * vh);
    const spots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) spots.push({ x: (c - (cols - 1) / 2) * pitch, y: (r - (rows - 1) / 2) * pitch * 1.5 });
    spots.sort((a, b) => a.x * a.x + a.y * a.y - (b.x * b.x + b.y * b.y)); // the ten real cards take the middle
    wall.pos = spots.slice(0, TOTAL);
    // the round table: ten seats on a circle in the plane, the table lying in that plane and seen at a slant.
    // The words take the top of the screen, so the table fits what is left.
    // Perspective makes the near half bigger than the far half, so the rim is projected and the table is shrunk
    // and moved until it sits inside the free zone (below the words, above the bottom edge, inside the sides).
    const wide = vw > 820;
    table.tilt = wide ? 28 : 20; // degrees from looking straight down: only a slight lean (owner, 2026-11-15: half the first try)
    const sinT = Math.sin((table.tilt * Math.PI) / 180), cosT = Math.cos((table.tilt * Math.PI) / 180);
    const PERSPECTIVE = 1600; // the ring's perspective, see .ring in main.css
    const ringTop = parseFloat(getComputedStyle(ring).top) || 0.54 * vh;
    const zoneTop = (wide ? 0.27 : 0.3) * vh - ringTop, zoneBottom = 0.965 * vh - ringTop; // measured from the middle of the ring
    let rs = 0.3 * vw;
    let ty = (zoneTop + zoneBottom) / 2;
    for (let k = 0; k < 8; k++) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let a = 0; a < 360; a += 6) {
        // a point on the rim of the table (radius 1.3 rs: the seats and their cards fit inside it)
        const lx = Math.cos(a * (Math.PI / 180)) * rs * 1.3, ly = Math.sin(a * (Math.PI / 180)) * rs * 1.3;
        const f = PERSPECTIVE / (PERSPECTIVE - ly * sinT);
        x0 = Math.min(x0, lx * f); x1 = Math.max(x1, lx * f);
        y0 = Math.min(y0, (ty + ly * cosT) * f); y1 = Math.max(y1, (ty + ly * cosT) * f);
      }
      ty += (zoneTop + zoneBottom) / 2 - (y0 + y1) / 2;
      rs *= Math.min((zoneBottom - zoneTop) / (y1 - y0), (0.96 * vw) / (x1 - x0));
    }
    table.rs = rs;
    table.k = (rs * 0.36) / w;
    table.d = rs * 2.6;
    table.y = ty;
    table.pos = slots.map((_, i) => {
      const a = ((90 + i * 36) * Math.PI) / 180; // seat 1 is nearest the viewer, then clockwise
      return { x: Math.cos(a) * table.rs, y: Math.sin(a) * table.rs, rot: i * 36 };
    });
    if (tableEl) tableEl.style.setProperty('--td', `${table.d.toFixed(0)}px`);
    if (night) night.measure(vw, vh, ringTop, w);
  };
  let night = null, isDealing = false, extrasSettled = false, wasFlat = false;
  const nightZ = slots.map(() => 0);
  measure();

  // how far card number k (0 = middle of the wall) has got on its way, 0 to 1
  const wallProgress = (u, k) => ease(clamp01((u - k * 0.013) / (1 - (TOTAL - 1) * 0.013)));

  function frame(time, deltaMs) {
    if (window.scrollY > restAfter) return; // the hero has fully left the screen
    const dt = Math.min(deltaMs, 50) / 1000;
    // ease the turning to a stop while a card is hovered, or out in the dialog
    if (ringState.held && active >= 0) release();
    const want = ringState.held || active >= 0 ? 0 : 1;
    s.run += (want - s.run) * Math.min(1, dt * (want ? 2.2 : 5));
    s.angle += SPEED * s.run * dt;
    const base = s.angle + s.p * Math.PI * 0.9;
    // part 2, the gathering: m runs 0 to 1 while the cards leave the ring and pack into a drum
    const m = clamp01((s.p - GATHER_AT) / GATHER_LEN);
    const u = clamp01((s.p - BURST_AT) / BURST_LEN);
    const gathering = m > 0.001;
    if (gathering !== wasGathering) {
      wasGathering = gathering;
      ring.classList.toggle('is-gathering', gathering);
      slots.forEach((el) => (el.tabIndex = gathering ? -1 : 0));
      if (gathering) release();
    }
    const spin = clamp01((s.p - SPIN_AT) / SPIN_LEN) * 210; // degrees the drum turns once packed
    const alpha = s.alpha;
    // part 4: the plane (tilt, height, turn) the wall lies in eases into the plane of the table
    const q = s.q;
    const dealing = q > 0.001;
    const cam = ease(clamp01(q / CAM_LEN));
    const planeY = wall.y + (table.y - wall.y) * cam;
    const planeTilt = wall.tilt + (table.tilt - wall.tilt) * cam;
    const planeZ = wall.rotZ * (1 - cam);
    // part 5, the night: once the table is built, the camera is night.js's. It hands back the plane transform and each card's lift.
    const nightMode = Boolean(night) && q >= CAM_LEN;
    if (nightMode) night.frame(time);
    else if (night) night.sleep();
    isDealing = dealing;
    // while the table is at rest and the night plays, the ring is flat: cards, table and layers are drawn in a fixed order
    const flat = nightMode && q >= DEAL_AT + (n - 1) * DEAL_STEP + DEAL_EACH + 0.005;
    if (flat !== wasFlat) ring.classList.toggle('is-flat', (wasFlat = flat));
    for (let i = 0; i < n; i++) {
      const a = base + i * STEP;
      const cos = Math.cos(a), sin = Math.sin(a);
      const depth = (sin + 1) / 2; // 0 = far side (top), 1 = near side (bottom)
      const el = slots[i];
      const ringOp = Math.min(1, 0.42 + 0.58 * depth + 0.6 * straight[i].v);
      let x = cos * rx * s.spread;
      let y = sin * ry * s.spread;
      let tf;
      let op = ringOp;
      let flip = 0;
      let down = 0; // 1 = turned face down again (part 4)
      if (!gathering) {
        const rot = cos * 11 * (1 - straight[i].v);
        tf = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${((0.76 + 0.24 * depth) / SS).toFixed(3)})`;
      } else {
        const d = DRIFT[i];
        const t = ease(clamp01((m - i * 0.035) / (1 - (n - 1) * 0.035)));
        const arc = Math.sin(Math.PI * t); // 0 at both ends, 1 half way: the loose part of the move
        x = x * (1 - t) + d.x * vw * arc;
        y = y * (1 - t) + d.y * vh * arc;
        const phi = i * 36 + spin; // where this card sits round the drum, in degrees
        const sinPhi = Math.sin((phi * Math.PI) / 180);
        const edge = sinPhi < 0 ? 90 : 270; // turns the card to stand upright, face toward the viewer
        let rot = cos * 11 * (1 - t) + d.r * arc;
        let sc = (0.76 + 0.24 * depth) * (1 - t) + drum.k * t;
        let tilt = drum.tilt * t;
        let ry = phi * t;
        let rz = drum.r * t;
        let ed = edge * t;
        let zw = 0, lx = 0, ly = 0;
        // part 3, the unfolding: the drum opens and each card flies to its place in the wall
        if (u > 0.001) {
          const v = wallProgress(u, i);
          const lift = Math.sin(Math.PI * v);
          const B = BURST[i];
          x = x * (1 - v) + B.x * vw * lift;
          y = y * (1 - v) + wall.y * v + B.y * vh * lift;
          tilt = tilt * (1 - v) + wall.tilt * v;
          zw = wall.rotZ * v;
          lx = wall.pos[i].x * v;
          ly = wall.pos[i].y * v;
          ry *= 1 - v;
          rz *= 1 - v;
          ed *= 1 - v;
          rot = rot * (1 - v) + B.r * lift;
          sc = sc * (1 - v) + wall.k * v;
        }
        // part 4, the deal: card i leaves the wall for its seat. It lifts, turns on the way and lands face down.
        if (dealing) {
          const dd = ease(clamp01((q - DEAL_AT - i * DEAL_STEP) / DEAL_EACH));
          const air = Math.sin(Math.PI * dd);
          const P = table.pos[i];
          x = 0;
          y = planeY;
          tilt = planeTilt;
          zw = planeZ;
          lx = wall.pos[i].x * (1 - dd) + P.x * dd;
          ly = wall.pos[i].y * (1 - dd) + P.y * dd;
          rot = P.rot * dd + 16 * air * (i % 2 ? 1 : -1);
          sc = (wall.k * (1 - dd) + table.k * dd) * (1 + 0.25 * air);
          rz = 3 + air * table.rs * 0.55;
          down = ease(clamp01((dd - 0.1) / 0.6));
        }
        // the vote and the quest move seat cards about: slide, lift, turn, shrink, fade (night.X)
        const X = nightMode ? night.X : null;
        if (X) {
          lx += X.dx[i];
          ly += X.dy[i];
          rot += X.dr[i];
          rz += X.dz[i];
          sc *= X.sc[i];
        }
        // scale3d, not scale: scale() leaves depth alone, and a card that stands up turns part of its height into depth,
        // which then stayed full size and stretched the card about twice as tall (owner review, 2026-11-16)
        const k3 = (sc / SS).toFixed(3);
        tf = `${nightMode ? night.plane : `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateX(${tilt.toFixed(2)}deg) rotateZ(${zw.toFixed(2)}deg)`} translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0) rotateY(${ry.toFixed(2)}deg) translateZ(${rz.toFixed(1)}px) rotateY(${ed.toFixed(1)}deg) rotateZ(${rot.toFixed(2)}deg) scale3d(${k3},${k3},${k3})${nightMode ? night.liftTail(i) : ''}`;
        op = (ringOp * (1 - t) + t) * (X ? X.op[i] : 1);
        flip = nightMode ? night.FL[i] : clamp01((t - 0.1) / 0.45) * (1 - down);
      }
      el.style.transform = tf;
      el.style.opacity = (op * alpha).toFixed(3);
      if (flip !== flipped[i]) {
        flipped[i] = flip;
        const e = flip * flip * (3 - 2 * flip);
        if (lite && (e <= 0 || e >= 1)) {
          flips[i].style.transform = '';
          flips[i].dataset.face = e > 0 ? 'front' : 'back';
        } else {
          delete flips[i].dataset.face;
          flips[i].style.transform = e > 0 ? `rotateY(${(180 * (1 - e)).toFixed(1)}deg)` : '';
        }
      }
      if (flat) {
        // the night: the nearer to the viewer, the later the card is drawn
        front[i] = null;
        if (night.Z[i] !== nightZ[i]) el.style.zIndex = nightZ[i] = night.Z[i];
      } else {
        nightZ[i] = 0;
        const isFront = i === active || depth > 0.5;
        if (isFront !== front[i]) {
          front[i] = isFront;
          el.style.zIndex = i === active ? 6 : isFront ? 4 : 1;
        }
      }
    }
    // the extra cards fly in from below the screen while the drum opens
    const showExtras = u > 0.001;
    // once they have slid off and faded, they are left alone (the night redraws every frame, they need not)
    if ((showExtras || extrasOn) && !(dealing && q >= SLIDE_LEN && extrasSettled)) {
      extrasSettled = dealing && q >= SLIDE_LEN;

      extrasOn = showExtras;
      for (let j = 0; j < extras.length; j++) {
        const k = slots.length + j;
        const el = extras[j];
        if (!showExtras) {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          continue;
        }
        const v = wallProgress(u, k);
        const B = BURST[k];
        const x = B.x * vw * 4 * (1 - v);
        let y = (0.7 * vh) * (1 - v) + wall.y * v;
        let tilt = wall.tilt * v;
        let zw = wall.rotZ * v;
        let lx = wall.pos[k].x * v;
        let fade = 1;
        // part 4: the extras ride the same plane as the rest, then slide off the sides as the camera pulls back
        if (dealing) {
          const slide = ease(clamp01(q / SLIDE_LEN));
          y = planeY;
          tilt = planeTilt;
          zw = planeZ;
          lx += (wall.pos[k].x >= 0 ? 1 : -1) * vw * 1.25 * slide;
          fade = 1 - clamp01((slide - 0.5) / 0.5);
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateX(${tilt.toFixed(2)}deg) rotateZ(${zw.toFixed(2)}deg) translate3d(${lx.toFixed(1)}px,${(wall.pos[k].y * v).toFixed(1)}px,0) rotateZ(${(B.r * 2 * (1 - v)).toFixed(1)}deg) scale(${(wall.k / SS).toFixed(3)})`;
        const op = alpha * clamp01(v * 8) * fade;
        el.style.opacity = op.toFixed(3);
        // an invisible card still costs the GPU its layers (60 card faces in all), so hide it outright (spec 013)
        el.style.visibility = op < 0.002 ? 'hidden' : '';
      }
    }
    // the round table grows into the plane under the cards while the camera pulls back
    if (tableEl && (dealing || tableOn)) {
      tableOn = dealing;
      const tin = ease(clamp01(q / SLIDE_LEN));
      tableEl.style.opacity = (alpha * clamp01(tin * 2.2)).toFixed(3);
      tableEl.style.transform = nightMode ? night.plane : `translate3d(0,${planeY.toFixed(1)}px,0) rotateX(${planeTilt.toFixed(2)}deg) rotateZ(${planeZ.toFixed(2)}deg) scale(${(0.6 + 0.4 * tin).toFixed(3)})`;
    }
    // the seat numbers and labels belong to the table: they come in with the deal's first words ("Ten seats") and go as soon as the scroll leaves it
    if (seatsUi) seatsUi.frame(clamp01((q - 0.2) / 0.07) * alpha);
  }
  gsap.ticker.add(frame);

  // deal in: the cards open out from the middle of the table
  const dealIn = gsap.to(s, { spread: 1, alpha: 1, duration: 1.9, ease: 'power3.out', delay: 0.15 });

  // scroll: the hero holds for a moment, the ring turns faster, then the cards part and fade.
  // Part 2 (gathering) drives the ring into a drum from here; part 3 will open the drum into a wall.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (desktop ? 5 : 4.4) * (tlRef ? tlRef.duration() : 1 + DEAL + NIGHT))}`,
      invalidateOnRefresh: true,
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      onRefresh: (self) => {
        measure();
        restAfter = self.end + window.innerHeight;
      },
    },
  });
  tlRef = tl;
  tl.to(s, { p: 1, duration: 1, ease: 'none' }, 0).to(copy, { autoAlpha: 0, y: -50, duration: 0.14, ease: 'power1.in' }, 0.05);
  // part 4, the deal: after the story, q runs 0 to 1 (see DEAL above)
  tl.to(s, { q: 1, duration: DEAL, ease: 'none' }, 1);

  // the story: it replaces the old "How it works" section. It sits under the wall,
  // inside the pinned hero, and appears once the wall has formed.
  const story = document.querySelector('.how');
  const home = story && story.parentNode;
  const after = story && story.previousElementSibling;
  // the words over the round table (part 4). They follow the story, and take its place as the camera pulls back.
  const dealText = story && document.querySelector('.deal');
  const dealParts = dealText ? [dealText.querySelector('.h2'), dealText.querySelector('.lede')] : [];
  let steps = [];
  if (story) {
    sec.append(story);
    if (dealText) {
      sec.append(dealText);
      gsap.set(dealParts, { autoAlpha: 0, y: 30 });
    }
    sec.classList.add('is-staged');
    steps = gsap.utils.toArray('[data-step]', story);
    const inner = story.querySelector('.how-in');
    const DIM = desktop ? 0.3 : 0;
    gsap.set(inner, { autoAlpha: 0, y: 40 });
    gsap.set(steps, desktop ? { opacity: DIM } : { opacity: 0, y: 18 });
    tl.to(inner, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.66);
    steps.forEach((el, i) => {
      const at = 0.72 + i * 0.09;
      if (desktop) {
        // desktop: all three are in view, and the one being read is lit
        tl.to(el, { opacity: 1, duration: 0.05 }, at);
        if (i > 0) tl.to(steps[i - 1], { opacity: DIM, duration: 0.05 }, at);
      } else {
        // phone and tablet: the steps build up as a list. Each one fades in slowly below the one before and stays.
        tl.to(el, { opacity: 1, y: 0, duration: 0.07, ease: 'power1.out' }, at);
      }
    });
    tl.to({}, { duration: 0.05 }, 0.95);
    // the story steps aside as the camera pulls back, then the words over the table appear
    tl.to(inner, { autoAlpha: 0, y: -30, duration: 0.04, ease: 'power1.in' }, 1);
    if (dealText) {
      tl.to(dealParts[0], { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 1.06);
      tl.to(dealParts[1], { autoAlpha: 1, y: 0, duration: 0.04, ease: 'power2.out' }, 1.14);
    }
  }

  // part 5: night.js adds the layers and the whole night to the timeline. The words of part 4 step aside as it begins.
  const nightEl = story && document.querySelector('.night');
  const voteEl = nightEl && document.querySelector('.vote');
  const questEl = voteEl && document.querySelector('.quest');
  const ladyEl = questEl && document.querySelector('.lady');
  const climbEl = ladyEl && document.querySelector('.climb');
  const bladeEl = climbEl && document.querySelector('.blade');
  const seatEl = bladeEl && document.querySelector('.seat');
  let vote = null, quest = null, lady = null, climb = null, blade = null, seat = null, seatsUi = null;
  const pd = JSON.parse(document.getElementById('page-data').textContent);
  if (nightEl && tableEl) {
    sec.append(nightEl);
    night = createNight({ gsap, sec, ring, slots, table, desktop, SS, theme, tableEl, data: pd.night });
    measure();
    // the deal's words slide and fade out with the scroll while the night's first line comes in (decision 10)
    if (dealText) tl.to(dealParts, { autoAlpha: 0, y: -22, duration: 0.035, ease: 'power1.inOut', stagger: 0.006 }, 1 + DEAL - 0.012);
    NIGHT = night.build(tl, 1 + DEAL, 1 / (desktop ? 5 : 4.4));
    // chapter 3 starts a little before the night ends: the dive begins while the last light of dawn is still returning
    const per = 1 / (desktop ? 5 : 4.4);
    if (voteEl) {
      sec.append(voteEl);
      vote = createVote({ gsap, sec, ring, night, desktop, SS, data: pd.vote, deck: pd.deck });
      const VOTE = vote.build(tl, 1 + DEAL + NIGHT - 0.2 * per, per);
      if (questEl) {
        sec.append(questEl);
        quest = createQuest({ gsap, sec, ring, night, vote, desktop, SS, data: pd.quest, deck: pd.deck });
        const QUEST = quest.build(tl, 1 + DEAL + NIGHT - 0.2 * per + VOTE, per);
        // chapter 5 and 6 (specs 008, 009): the Lady of the Lake, then the climb. Each is a stretch of the same timeline, built after the one before
        if (ladyEl) {
          sec.append(ladyEl);
          lady = createLady({ gsap, sec, ring, night, vote, quest, desktop, data: pd.lady, deck: pd.deck });
          const LADY = lady.build(tl, 1 + DEAL + NIGHT - 0.2 * per + VOTE + QUEST, per);
          if (climbEl) {
            sec.append(climbEl);
            climb = createClimb({ gsap, sec, ring, night, vote, quest, lady, desktop, data: pd.climb, questText: pd.quest.text });
            const CLIMB = climb.build(tl, 1 + DEAL + NIGHT - 0.2 * per + VOTE + QUEST + LADY, per);
            // chapters 7 and 8 (specs 010, 011): the blade, then your seat. The pin ends where the seat chapter does
            if (bladeEl) {
              sec.append(bladeEl);
              blade = createBlade({ gsap, sec, ring, slots, night, vote, lady, climb, theme, desktop, SS, data: pd.blade, deck: pd.deck });
              const BLADE = blade.build(tl, 1 + DEAL + NIGHT - 0.2 * per + VOTE + QUEST + LADY + CLIMB, per);
              if (seatEl && draw) {
                sec.append(seatEl);
                seat = createSeat({ gsap, sec, ring, night, vote, blade, draw, desktop, data: pd.seat });
                seat.build(tl, 1 + DEAL + NIGHT - 0.2 * per + VOTE + QUEST + LADY + CLIMB + BLADE, per);
              }
            }
          }
        }
      }
    }
    // the seat labels (who is who): made after every chapter, so they run after them in each frame
    seatsUi = createSeats({ sec, ring, night, slots, deck: pd.deck, sides: pd.text.sides });
    // the ring paintings are shown about 260 px wide in the close ups, so ask for the sharp file once the page has loaded
    const sharp = () => slots.forEach((el) => el.querySelector('.card-front img').setAttribute('sizes', '264px'));
    if (document.readyState === 'complete') setTimeout(sharp, 800);
    else addEventListener('load', () => setTimeout(sharp, 800), { once: true });
  }

  // hover or tap: the ring eases to a stop, the card lifts, stands upright and leans to the pointer
  const tiltX = cards.map((c) => gsap.quickTo(c, 'rotationX', { duration: 0.5, ease: 'power3.out' }));
  const tiltY = cards.map((c) => gsap.quickTo(c, 'rotationY', { duration: 0.5, ease: 'power3.out' }));
  gsap.set(cards, { transformPerspective: 900 });

  function release() {
    if (active < 0) return;
    const i = active;
    active = -1;
    front[i] = null;
    gsap.to(straight[i], { v: 0, duration: 0.6, ease: 'power3.out' });
    gsap.to(cards[i], { y: 0, scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    tiltX[i](0);
    tiltY[i](0);
  }
  function hold(i) {
    if (active === i) return;
    release();
    active = i;
    front[i] = null;
    gsap.to(straight[i], { v: 1, duration: 0.5, ease: 'power3.out' });
    gsap.to(cards[i], { y: -14 * SS, scale: 1.16, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  }
  const lean = (i, e) => {
    const r = slots[i].getBoundingClientRect();
    tiltY[i](((e.clientX - (r.left + r.width / 2)) / r.width) * 26);
    tiltX[i](((e.clientY - (r.top + r.height / 2)) / r.height) * -22);
  };

  const off = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    off.push(() => el.removeEventListener(type, fn, opts));
  };
  slots.forEach((el, i) => {
    on(el, 'pointerenter', (e) => e.pointerType === 'mouse' && !isDealing && hold(i));
    on(el, 'pointermove', (e) => e.pointerType === 'mouse' && active === i && lean(i, e));
    on(el, 'pointerleave', (e) => e.pointerType === 'mouse' && active === i && release());
    // keyboard: the ring also waits while a card has focus
    on(el, 'focus', () => el.matches(':focus-visible') && !isDealing && hold(i));
    on(el, 'blur', () => active === i && release());
  });
  on(window, 'resize', measure, { passive: true });

  return () => {
    gsap.ticker.remove(frame);
    dealIn.kill();
    if (seatsUi) seatsUi.destroy();
    if (seat) seat.destroy();
    if (blade) blade.destroy();
    if (climb) climb.destroy();
    if (lady) lady.destroy();
    if (quest) quest.destroy();
    if (vote) vote.destroy();
    if (night) night.destroy();
    off.forEach((fn) => fn());
    ring.classList.remove('is-gathering');
    if (story) {
      sec.classList.remove('is-staged');
      gsap.set([story.querySelector('.how-in'), ...steps], { clearProps: 'all' });
      after ? after.after(story) : home.prepend(story);
      if (dealText) {
        gsap.set(dealParts, { clearProps: 'all' });
        story.after(dealText);
      }
      if (nightEl) (dealText || story).after(nightEl);
      if (voteEl) nightEl.after(voteEl);
      if (questEl) voteEl.after(questEl);
      if (ladyEl) questEl.after(ladyEl);
      if (climbEl) ladyEl.after(climbEl);
      if (bladeEl) climbEl.after(bladeEl);
      if (seatEl) bladeEl.after(seatEl);
    }
    if (tableEl) {
      tableEl.style.transform = '';
      tableEl.style.opacity = '';
    }
    extras.forEach((el) => {
      el.style.transform = '';
      el.style.opacity = '';
      el.style.visibility = '';
    });
    slots.forEach((el, i) => {
      el.style.transform = '';
      el.style.opacity = '';
      el.style.zIndex = '';
      el.tabIndex = 0;
      flips[i].style.transform = '';
      delete flips[i].dataset.face;
    });
    extraFlips.forEach((f) => delete f.dataset.face);
  };
}
