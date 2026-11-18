// Chapter 8, your seat (spec docs/section/011-your-seat.md). The last chapter, inside the pinned hero after the blade. The ending's colour settles
// back to plain dark, the closing question rises, the cards and the score bar go, the camera pulls back to an empty round table with ten
// chairs, one chair at the front catches a cone of light, "Now imagine the liar is your best friend.", then a face down card waits in the light.
// Tapping it plays the draw right there (draw.js in its staged mode): the card rises, turns into one of the seven roles, and the result sits beside
// it (under it on a phone). Then the pin lets go into the final call. Everything but the draw follows the scroll, both ways.
import { sayLines } from './say.js';
import { goTo } from './motion.js';
import { result } from './blade.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const html = (s) => {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild;
};

// where the draw window starts, in screens from the start of the chapter, and the chapter's length (011 "Scroll budget")
const DRAW0 = 1.15, LEN = 2.0;

// the hero's "Draw your card" link goes to the draw window with motion on (set while the chapter exists)
export const drawLink = { go: null };

export function createSeat({ gsap, sec, ring, night, vote, blade, draw, desktop, data, siteUrl }) {
  const T = data.text;
  const { S, X, table, put } = night;
  const n = 10;
  let u = 1;

  // ---------- the layers ----------
  const plane = html('<div class="n-plane x-under st-plane" aria-hidden="true"></div>');
  ring.append(plane);
  night.planes.push(plane);
  const chairs = Array.from({ length: n }, () => html('<i class="st-chair"><b></b></i>'));
  const pool = html('<i class="st-pool"></i>');
  const anchor = html('<i class="st-anchor"></i>');
  plane.append(...chairs, pool, anchor);
  const cone = html('<i class="st-cone" aria-hidden="true"></i>');
  const host = html(`<div class="st-card"><button class="st-btn" type="button" tabindex="-1" aria-label="${T.cardLabel}" disabled></button></div>`);
  const panel = html('<div class="st-panel"></div>');
  sec.append(cone, host, panel);
  const btn = host.querySelector('.st-btn');
  const say = sec.querySelector('.seat-say');
  const R = { p: 0 }; // 0 = the card lies face down in the light, 1 = it stands at the result place

  // ---------- state ----------
  const K = { t: 0, chairs: 0, light: 0, pulse: 0 };
  let tw = null, geo = null, wasOn = false, wasWin = false, asked = '', pulsed = false, question = null;
  const sr = { l: 0, t: 0 };

  // ---------- measuring ----------
  function measure() {
    u = night.u;
    const vw = night.vw, vh = night.vh, rs = night.rs;
    // wide: the whole table, the chairs and the cone; then toward the lit seat, which sits about 64% down the screen
    const wf = clamp(Math.min(0.9, (0.46 * vw) / (1.62 * rs)), 0.6, 1);
    night.pose('wide', { a: 90, fr: 0, f: wf, tilt: night.tilt, at: [0, 0, 0], y: table.y });
    night.pose('seat', { a: 90, fr: 0, f: desktop ? 1.15 : 1.08, tilt: night.tilt, at: [0, 0.8 * rs, 0], y: 0.64 * vh - night.ringTop });
    chairs.forEach((c, i) => {
      const P = table.pos[i];
      put(c, 't', `translate3d(${(P.x * 1.5).toFixed(1)}px,${(P.y * 1.5).toFixed(1)}px,0) rotate(${P.rot}deg)`);
    });
    put(pool, 't', `translate3d(0px,${(0.8 * rs).toFixed(1)}px,${(1.5 * u).toFixed(1)}px)`);
    put(anchor, 't', `translate3d(0px,${(0.8 * rs).toFixed(1)}px,${(2 * u).toFixed(1)}px)`);
    // the result place (decision 4): beside the card on a desktop, under it on a phone
    const Hr = desktop ? 0.62 * vh : Math.min(0.3 * vh, 1.5 * 0.46 * vw);
    const Wr = Hr / 1.5;
    geo = {
      vw, vh, Wr,
      rx: desktop ? 0.3 * vw : vw / 2,
      ry: desktop ? 0.56 * vh : Hr / 2 + 0.115 * vh,
      px: desktop ? 0.52 * vw : 14,
      py: desktop ? 0.2 * vh : 0.115 * vh + Hr + 6,
      pw: desktop ? Math.min(0.4 * vw, 470) : vw - 28,
      ph: desktop ? 0.7 * vh : vh - (0.115 * vh + Hr + 6) - 8,
    };
    host.style.setProperty('--hw', `${Wr.toFixed(1)}px`);
    panel.style.left = `${geo.px.toFixed(0)}px`;
    panel.style.top = `${geo.py.toFixed(0)}px`;
    panel.style.width = `${geo.pw.toFixed(0)}px`;
    panel.style.maxHeight = `${geo.ph.toFixed(0)}px`;
  }
  night.onMeasure.push(measure);
  if (night.vw) measure();

  // ---------- the draw, played on the table (decisions 2 and 4) ----------
  draw.stage({
    card: btn,
    panel,
    play: async ({ wasRevealed, loadFace }) => {
      if (tw) tw.kill();
      if (wasRevealed) {
        await new Promise((res) => {
          tw = gsap.timeline({ onComplete: res }).to(R, { p: 0, duration: 0.45, ease: 'power2.inOut' }, 0).to(draw.flip, { rotationY: 180, duration: 0.32, ease: 'power2.in' }, 0);
        });
      }
      await loadFace();
      await new Promise((res) => {
        tw = gsap.timeline({ onComplete: res }).to(R, { p: 1, duration: 1.15, ease: 'expo.out' }, 0).to(draw.flip, { rotationY: 0, duration: 0.7, ease: 'power2.inOut' }, 0.28);
      });
    },
  });
  btn.addEventListener('click', () => draw.state() === 'idle' && K.t >= DRAW0 && draw.draw());

  // ---------- one frame (after blade.frame) ----------
  function hideAll() {
    put(plane, 'v', 'hidden');
    put(cone, 'v', 'hidden');
    put(host, 'v', 'hidden');
    put(panel, 'v', 'hidden');
    btn.disabled = true;
    btn.tabIndex = -1;
  }
  function frame() {
    const t = K.t;
    if (t < 0.001) {
      if (wasOn) {
        wasOn = false;
        hideAll();
      }
      return;
    }
    wasOn = true;
    const g = geo;
    const rr = sec.getBoundingClientRect();
    sr.l = rr.left;
    sr.t = rr.top;
    night.shade = Math.max(night.shade, 0.5 * clamp(K.chairs));
    // the closing question follows the ending (a second choice in chapter 7 changes it)
    const ending = result().ending;
    const want = ending === 'b' ? T.found : T.hidden;
    if (question && want !== asked) question.textContent = asked = want;
    // the chairs, the cone and the pool of light
    chairs.forEach((c, i) => {
      const a = clamp(K.chairs * 1.5 - i * 0.05);
      put(c, 'v', a > 0.01 ? 'visible' : 'hidden');
      put(c, 'o', (a * (i === 0 ? 1 : 0.85)).toFixed(3));
    });
    put(plane, 'v', 'visible');
    put(pool, 'o', (0.95 * K.light).toFixed(3));
    put(pool, 'v', K.light > 0.01 ? 'visible' : 'hidden');
    const ar = anchor.getBoundingClientRect();
    const cx = ar.left + ar.width / 2 - sr.l, cy = ar.top + ar.height / 2 - sr.t;
    const lit = K.light > 0.01;
    put(cone, 'v', lit ? 'visible' : 'hidden');
    if (lit) {
      const cw = Math.max(260, 0.5 * g.vw);
      put(cone, 'o', (0.9 * K.light).toFixed(3));
      put(cone, 't', `translate3d(${(cx - cw / 2).toFixed(1)}px,0,0)`);
      cone.style.setProperty('--cw', `${cw.toFixed(0)}px`);
      cone.style.setProperty('--ch', `${Math.max(120, cy + ar.height * 0.2).toFixed(0)}px`);
    }
    // the card: it lies in the light, then lifts to the result place and grows
    const e = R.p;
    const shown = K.light > 0.4;
    put(host, 'v', shown ? 'visible' : 'hidden');
    const sx = lerp(ar.width / g.Wr, 1, smooth(clamp(e))), sy = lerp(ar.height / (1.5 * g.Wr), 1, smooth(clamp(e)));
    const lift = Math.sin(Math.PI * clamp(e)) * 0.05 * g.vh;
    const x = lerp(cx, g.rx, e) - g.Wr / 2, y = lerp(cy, g.ry, e) - (1.5 * g.Wr) / 2 - lift;
    put(host, 'o', clamp((K.light - 0.4) / 0.4).toFixed(3));
    put(host, 't', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale3d(${sx.toFixed(3)},${sy.toFixed(3)},1)`);
    // the draw window: the card is a real button from DRAW0, with one soft gold pulse
    const win = t >= DRAW0 && draw.state() === 'idle';
    if (win !== wasWin) {
      wasWin = win;
      btn.disabled = !win;
      btn.tabIndex = win ? 0 : -1;
      host.classList.toggle('is-open', win);
      if (win && !pulsed) {
        pulsed = true;
        host.classList.add('is-pulse');
        setTimeout(() => host.classList.remove('is-pulse'), 2600);
      }
    }
    // scrolling back above the draw window puts the card back face down
    if (t < DRAW0 - 0.03 && (R.p > 0 || draw.state() !== 'idle')) {
      if (draw.state() !== 'shuffling') {
        if (tw) tw.kill();
        R.p = 0;
        draw.reset();
      }
    }
    // the result: it fades in with the card's arrival, beside it or under it
    const po = clamp((R.p - 0.55) / 0.4);
    put(panel, 'v', po > 0.01 ? 'visible' : 'hidden');
    put(panel, 'o', po.toFixed(3));
    panel.style.pointerEvents = po > 0.9 ? 'auto' : 'none';
    put(say, 'o', (1 - clamp(R.p * 3)).toFixed(3));
  }
  night.after.push(frame);

  // ---------- the story, in screens: 2.0 on a desktop, a phone plays it 0.88 as long ----------
  let st = null;
  function build(tl, at, perScreen) {
    const k = desktop ? 1 : 0.88;
    st = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const lines = sayLines(gsap, st, say, [[0.06, T.hidden], [0.82, T.friend], [DRAW0, T.turn]], { inLen: 0.12, outLen: 0.1 });
    question = lines[0].querySelector('b');
    asked = T.hidden;
    // the last lines of whichever ending was shown make room
    [blade.boxes.a, blade.boxes.b].forEach((box) => box && box.lastElementChild && st.to(box.lastElementChild, { autoAlpha: 0, y: -18, duration: 0.08, ease: 'power1.in' }, 0));
    st.to(K, { t: LEN, duration: LEN, ease: 'none' }, 0);
    // 1 the question: the ending's colour settles back to dark (half a screen), the cards and the bar go
    st.to(blade.K, { out: 1, duration: 0.5, ease: 'power1.inOut' }, 0);
    st.fromTo(vote.bar, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, immediateRender: false }, 0.05);
    // 2 the empty table: the camera pulls back, ten chairs, one lit
    st.to(S, { w6: 0, duration: 0.45, ease: 'power3.inOut' }, 0.35);
    st.to(S, { w7: 1, duration: 0.45, ease: 'power3.inOut' }, 0.35);
    st.to(K, { chairs: 1, duration: 0.4, ease: 'power2.out' }, 0.5);
    st.to(K, { light: 1, duration: 0.35, ease: 'power2.out' }, 0.6);
    // 3 your best friend: a slow push in toward the lit seat
    st.to(S, { w8: 1, duration: 0.4, ease: 'power2.inOut' }, 0.8);
    st.to({}, { duration: 0.01 }, LEN - 0.01);
    st.timeScale(1 / (k * perScreen));
    tl.add(st, at);
    // the hero's "Draw your card ↓" lands a little inside the draw window
    drawLink.go = () => {
      const trig = tl.scrollTrigger;
      if (!trig) return false;
      goTo(trig.start + ((at + (DRAW0 + 0.1) * k * perScreen) / tl.duration()) * (trig.end - trig.start));
      return true;
    };
    return LEN * k * perScreen;
  }

  function destroy() {
    if (st) st.kill();
    if (tw) tw.kill();
    drawLink.go = null;
    draw.unstage();
    const i = night.after.indexOf(frame);
    if (i >= 0) night.after.splice(i, 1);
    const m = night.onMeasure.indexOf(measure);
    if (m >= 0) night.onMeasure.splice(m, 1);
    const p = night.planes.indexOf(plane);
    if (p >= 0) night.planes.splice(p, 1);
    [plane, cone, host, panel].forEach((el) => el.remove());
    if (say) say.innerHTML = '';
  }

  return { build, destroy, K };
}
