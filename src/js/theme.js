// The page colour: cream, dark, and night (chapter 2). Each turn is a number from 0 to 1 that the scroll sets every
// frame, so the backdrop follows the scroll exactly and never fades on a timer (spec 005 decision 11).
// The backdrop (the WebGL shader, or the CSS layers without it) follows the numbers smoothly. The text colours swap with
// the `dark` and `night` classes when a number passes the middle. Role pages are locked at build time.
const COLORS = { light: '#F3ECDF', dark: '#0B0D12', night: '#070B18' };
const clamp = (v) => Math.min(1, Math.max(0, v));

export function initTheme({ shader } = {}) {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const lock = root.dataset.themeLock;
  const layerDark = document.querySelector('.silk-dark');
  const layerNight = document.querySelector('.silk-night');
  // chapter 7's two tints (spec 010): crimson when the blade finds Merlin, dawn when it misses. They sit above the shader, so they show with WebGL too
  const tintBlood = document.querySelector('.tint-crimson');
  const tintDawn = document.querySelector('.tint-dawn');
  let dark = root.classList.contains('dark') ? 1 : 0;
  let night = 0;
  let blood = 0;
  let dawn = 0;
  let name = '';
  root.classList.add('themed');

  function apply() {
    if (shader) shader.setMix(dark, night);
    if (layerDark) layerDark.style.opacity = dark.toFixed(3);
    if (layerNight) layerNight.style.opacity = night.toFixed(3);
    if (tintBlood) tintBlood.style.opacity = blood.toFixed(3);
    if (tintDawn) tintDawn.style.opacity = dawn.toFixed(3);
    const now = night > 0.5 ? 'night' : dark > 0.5 ? 'dark' : 'light';
    if (now === name) return;
    name = now;
    root.classList.toggle('night', now === 'night');
    root.classList.toggle('dark', now !== 'light');
    if (meta) meta.content = COLORS[now];
  }

  /** 0 = cream, 1 = dark (chapter 7's hard cut) */
  function setDark(v) {
    v = clamp(v);
    if (lock || v === dark) return;
    dark = v;
    apply();
  }

  /** 0 = no night, 1 = full night (chapter 2). Night sits on top of whatever the page is. */
  function setNight(v) {
    v = clamp(v);
    if (lock || v === night) return;
    night = v;
    apply();
  }

  /** 0 to 1: the crimson tint (ending A) */
  function setBlood(v) {
    v = clamp(v);
    if (lock || v === blood) return;
    blood = v;
    apply();
  }

  /** 0 to 1: the gold dawn (ending B) */
  function setDawn(v) {
    v = clamp(v);
    if (lock || v === dawn) return;
    dawn = v;
    apply();
  }

  // Used when nothing is pinned (reduced motion, or no motion library): the page turns dark as the blade section
  // passes the middle of the screen, spread over half a screen of scroll.
  function followScroll() {
    if (lock) return;
    const mark = document.querySelector('.blade');
    if (!mark) return;
    const check = () => setDark(0.5 + (innerHeight * 0.55 - mark.getBoundingClientRect().top) / (innerHeight * 0.5));
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check, { passive: true });
    check();
  }

  apply();
  return { set: (n) => setDark(n === 'dark' ? 1 : 0), setDark, setNight, setBlood, setDawn, followScroll, get: () => name };
}
