// A tiny fake browser for testing src/js/music.js under `node --test`, with a virtual clock.
// It fakes only what music.js touches: the button, document, window events, Audio, AudioContext,
// requestAnimationFrame, timers and localStorage. `advance(ms)` moves time forward, fires timers and animation
// frames in order, and lets promises settle between steps.

export class FakeElement {
  constructor(attrs = {}) {
    this.attrs = {};
    this.dataset = attrs.dataset || {};
    this.hidden = !!attrs.hidden;
    this.listeners = {};
    this.isMusic = !!attrs.isMusic;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  closest(sel) { return sel === '[data-music]' && this.isMusic ? this : null; }
}

const settle = () => new Promise((r) => setImmediate(r));

export function makeEnv({ autoplay = true, playDelay = 0, ctxBlocked = false, rafWorks = true, stored = null, readyState = 'complete' } = {}) {
  let now = 0;
  let nextId = 1;
  const timers = new Map(); // id -> { at, fn }
  let frames = []; // [{ id, fn }]
  const windowListeners = {};
  const documentListeners = {};
  const store = new Map(stored === null ? [] : [['avalon-music', stored]]);
  const audios = [];
  const gains = [];

  const env = {
    autoplay, playDelay, ctxBlocked, rafWorks,
    button: new FakeElement({ isMusic: true, hidden: true, dataset: { labelOff: 'Turn music off', labelOn: 'Turn music on' } }),
    page: new FakeElement(),
    audios, gains,
    get audio() { return audios[0]; },
    // true while sound can really come out: the file plays and the volume is above zero
    get audible() {
      const a = audios[0];
      if (!a || a.paused) return false;
      const vol = gains.length ? gains[0].gain.value : a.volume;
      return vol > 0.001 || a.currentTime < 0.01; // the very first instant of the fade-in is still silent
    },
    get playing() { return !!audios[0] && !audios[0].paused; },
    get pressed() { return env.button.getAttribute('aria-pressed'); },
    get stored() { return store.get('avalon-music'); },
    async advance(ms) {
      const end = now + ms;
      await settle();
      while (now < end) {
        const step = Math.min(16, end - now);
        now += step;
        for (const a of audios) if (!a.paused) a.currentTime += step / 1000;
        for (const [id, t] of [...timers]) if (t.at <= now) { timers.delete(id); t.fn(); }
        if (rafWorks) { const run = frames; frames = []; for (const f of run) f.fn(now); }
        await settle();
      }
    },
    // what a real browser fires for one tap: pointerdown, touchstart, touchend, then click
    async tap(target = env.page) {
      for (const type of ['pointerdown', 'touchstart', 'touchend']) env.dispatchWindow(type, target);
      await settle();
      (target.listeners.click || []).forEach((fn) => fn({ target }));
      await settle();
    },
    dispatchWindow(type, target = env.page) { (windowListeners[type] || []).slice().forEach((fn) => fn({ target })); },
    async hide(hidden) {
      env.document.hidden = hidden;
      (documentListeners.visibilitychange || []).forEach((fn) => fn());
      await settle();
    },
  };

  class FakeAudio {
    constructor(src) {
      this.src = src; this.paused = true; this.currentTime = 0; this.volume = 1; this.ended = false; this.preload = '';
      audios.push(this);
    }
    play() {
      return new Promise((resolve, reject) => {
        const done = () => {
          if (!env.autoplay && !env.userActivated) return reject(new DOMException('blocked', 'NotAllowedError'));
          this.paused = false;
          resolve();
        };
        if (env.playDelay) timers.set(nextId++, { at: now + env.playDelay, fn: done }); else done();
      });
    }
    pause() { this.paused = true; }
  }

  class FakeAudioContext {
    constructor() { this.state = env.ctxBlocked && !env.userActivated ? 'suspended' : 'running'; this.destination = {}; }
    resume() { if (!env.ctxBlocked || env.userActivated) this.state = 'running'; return Promise.resolve(); }
    createGain() { const g = { gain: { value: 1 }, connect: (x) => x }; gains.push(g); return g; }
    createMediaElementSource() { return { connect: (g) => g }; }
  }

  env.document = {
    readyState,
    hidden: false,
    querySelector: (sel) => (sel === '[data-music]' ? env.button : null),
    addEventListener: (t, fn) => { (documentListeners[t] ||= []).push(fn); },
  };
  env.userActivated = false;
  // a real tap or click grants the page permission to play sound
  const origAdd = (t, fn) => { (windowListeners[t] ||= []).push(fn); };
  env.window = {
    addEventListener: origAdd,
    removeEventListener: (t, fn) => { windowListeners[t] = (windowListeners[t] || []).filter((f) => f !== fn); },
    AudioContext: FakeAudioContext,
  };
  const origTap = env.tap;
  env.tap = async (target) => { env.userActivated = true; return origTap(target); };

  const saved = {};
  const g = globalThis;
  const set = (k, v) => { saved[k] = Object.getOwnPropertyDescriptor(g, k); Object.defineProperty(g, k, { value: v, configurable: true, writable: true }); };
  env.install = () => {
    set('document', env.document);
    set('window', env.window);
    set('Audio', FakeAudio);
    set('Element', FakeElement);
    set('localStorage', { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) });
    set('requestAnimationFrame', (fn) => { const id = nextId++; frames.push({ id, fn }); return id; });
    set('setTimeout', (fn, ms = 0) => { const id = nextId++; timers.set(id, { at: now + ms, fn }); return id; });
    set('clearTimeout', (id) => { timers.delete(id); });
    set('performance', { now: () => now });
  };
  env.uninstall = () => {
    for (const [k, d] of Object.entries(saved)) { if (d) Object.defineProperty(g, k, d); else delete g[k]; }
  };
  return env;
}
