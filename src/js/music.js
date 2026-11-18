// Background music: a 60 second loop (built by scripts/build.mjs). It tries to start by itself 3 s after the page has loaded;
// browsers often refuse that, so the first action (click, tap, key, scroll, wheel) starts it too. It fades in at the start,
// fades out from 57 s so it is silent at 60 s, then starts again from 0.
// The top-right button turns it on and off; the choice is remembered. The volume goes through a Web Audio gain node
// when there is one, because iOS ignores audio.volume.
const SRC = '/assets/audio/adventure.m4a';
const LOOP = 60; // seconds in the file
const FADE_OUT_AT = 57; // the fade out starts here
const MAX = 0.35; // loudest volume, 0 to 1
const KEY = 'avalon-music';
const AUTO_MS = 3000; // after the page has loaded, try to start by itself this long after

export function initMusic({ reduced = false } = {}) {
  const btn = document.querySelector('[data-music]');
  if (!btn) return;
  const fadeIn = reduced ? 0.6 : 2; // seconds
  const fadeOut = LOOP - FADE_OUT_AT;
  const offMs = reduced ? 150 : 400; // how long the button's own fade out takes

  let wanted = true;
  try { wanted = localStorage.getItem(KEY) !== 'off'; } catch { /* storage blocked: the default is on */ }

  const audio = new Audio(SRC);
  audio.preload = 'auto';
  let gain = null;
  let ctx = null;
  let started = false; // true once the first play() was allowed
  let playing = false;
  let master = 1; // 0 to 1, the button's own fade
  let masterTo = 1;
  let last = 0;
  let raf = 0;
  let resumeOnShow = false;

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const setVol = (v) => { if (gain) gain.gain.value = v; else audio.volume = clamp(v); };

  function wire() {
    if (ctx || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain();
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
    } catch { ctx = null; gain = null; }
  }

  function paint() {
    btn.setAttribute('aria-pressed', String(wanted));
    btn.setAttribute('aria-label', btn.dataset[wanted ? 'labelOff' : 'labelOn']);
  }

  function tick(now) {
    raf = 0;
    if (!playing) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (master !== masterTo) {
      const step = dt / (offMs / 1000);
      master = masterTo > master ? Math.min(masterTo, master + step) : Math.max(masterTo, master - step);
    }
    let t = audio.currentTime;
    if (audio.ended || t >= LOOP - 0.05) { // the end: start again from 0, which fades in again
      audio.currentTime = 0;
      t = 0;
      audio.play().catch(() => {});
    }
    const env = clamp(fadeIn ? t / fadeIn : 1) * clamp((LOOP - t) / fadeOut);
    setVol(MAX * env * master);
    if (masterTo === 0 && master === 0) { audio.pause(); playing = false; return; }
    raf = requestAnimationFrame(tick);
  }

  function run() {
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // Tries to start. Without a user action the browser may refuse (play() fails, or the Web Audio context stays suspended and
  // the music would be silent), so this counts as started only when sound can really come out. A refused try changes nothing.
  let pending = null; // the try in flight; a second call waits for it, then tries again only if it was refused
  function start(fromZero) {
    if (pending) return pending.then(() => (started ? undefined : start(fromZero)));
    pending = attempt(fromZero).finally(() => { pending = null; });
    return pending;
  }
  // The visitor can turn the music off while a try is still in flight (slow download, slow audio context). Every step after an
  // await checks `wanted` again, so a late start never overrides the "off".
  async function attempt(fromZero) {
    try {
      if (!wanted) return;
      wire();
      if (ctx && ctx.state !== 'running') await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, 400))]);
      if (!wanted || (ctx && ctx.state !== 'running')) return;
      if (fromZero) audio.currentTime = 0;
      master = 1;
      masterTo = 1;
      setVol(0);
      await audio.play();
      started = true;
      if (!wanted) { audio.pause(); return; } // turned off while the file was loading
      playing = true;
      run();
    } catch {
      started = false;
      if (!audio.paused) audio.pause();
    }
  }

  // Fade out, then pause (tick does the pause). The timer is a safety net: if the browser throttles animation frames
  // (low power mode, background), tick never runs, and the music must still go silent.
  let stopTimer = 0;
  function stop() {
    masterTo = 0;
    clearTimeout(stopTimer);
    if (!playing) { audio.pause(); return; }
    run();
    stopTimer = setTimeout(() => {
      if (!wanted) { audio.pause(); playing = false; setVol(0); }
    }, offMs + 150);
  }

  function set(on) {
    wanted = on;
    clearTimeout(stopTimer);
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
    paint();
    if (on) start(true); else stop();
  }

  // Two ways to start: by itself 3 s after the page has fully loaded (works only if the browser allows it), or on the first
  // action: a click, tap, key press, scroll or wheel turn anywhere (unless it is on the button, or it was turned off before).
  // If a try is refused, the listeners stay, so the next action tries again.
  const first = (e) => {
    if (started || !wanted || (e.target instanceof Element && e.target.closest('[data-music]'))) return;
    start(true).then(() => { if (started) off(); });
  };
  const evs = ['pointerdown', 'keydown', 'touchstart', 'touchend', 'wheel', 'scroll'];
  const off = () => { evs.forEach((n) => window.removeEventListener(n, first, true)); clearTimeout(autoTimer); };
  evs.forEach((n) => window.addEventListener(n, first, { capture: true, passive: true }));
  const arm = () => { autoTimer = setTimeout(() => { if (!started && wanted) start(true).then(() => { if (started) off(); }); }, AUTO_MS); };
  let autoTimer = 0;
  if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm, { once: true });

  btn.addEventListener('click', () => {
    off(); // from here on only the button decides
    // Only one case means "start": the button shows "on" but nothing has been tried yet or the browser refused (silent).
    // A try that is still in flight counts as "on": the tap turns it off (it used to be swallowed, so it could not be turned off).
    if (!started && wanted && !pending) start(true);
    else set(!wanted);
  });

  // no sound while the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnShow = playing && masterTo === 1;
      if (playing) { audio.pause(); playing = false; }
    } else if (resumeOnShow && wanted) {
      resumeOnShow = false;
      audio.play().then(() => { playing = true; run(); }).catch(() => {});
    }
  });

  paint();
  btn.hidden = false;
}
