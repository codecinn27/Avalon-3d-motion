// Real-browser check of the music button at desktop, tablet and phone sizes. Run with `npm run build && npm test`.
// It serves dist/ on a local port, starts the installed Chrome or Edge headless, and drives it over the DevTools protocol
// (no extra packages). For each size it checks that the button is on screen, is the thing under its own centre point
// (nothing covers it), does not overlap the nav pill, and that a real click or tap turns the music off and on again.
// It is skipped when dist/ is not built or no Chrome/Edge is found.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = BROWSERS.find((p) => fs.existsSync(p));
const skip = !fs.existsSync(path.join(DIST, 'index.html')) ? 'dist/ is not built' : !chrome ? 'no Chrome or Edge found' : false;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(DIST, p);
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { file = path.join(DIST, '404.html'); res.statusCode = 404; }
    const buf = fs.readFileSync(file);
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    if (range && res.statusCode === 200) { // audio seeking needs range requests, like a real host
      const a = range[1] ? +range[1] : 0, b = range[2] ? +range[2] : buf.length - 1;
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${a}-${b}/${buf.length}`);
      res.end(buf.subarray(a, b + 1));
    } else res.end(buf);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

async function launch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avalon-music-'));
  const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run', '--mute-audio',
    '--autoplay-policy=no-user-gesture-required', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  const portFile = path.join(dir, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 100));
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const waiting = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { const { r, j } = waiting.get(d.id); waiting.delete(d.id); d.error ? j(new Error(d.error.message)) : r(d.result); } };
  const send = (method, params = {}) => new Promise((r, j) => { const n = ++id; waiting.set(n, { r, j }); ws.send(JSON.stringify({ id: n, method, params })); });
  const close = () => { try { ws.close(); } catch { /* ignore */ } proc.kill(); setTimeout(() => fs.rmSync(dir, { recursive: true, force: true }), 500); };
  return { send, close };
}

const SIZES = [
  { name: 'desktop 1280x800', w: 1280, h: 800, touch: false },
  { name: 'tablet 768x1024', w: 768, h: 1024, touch: true },
  { name: 'phone 390x844', w: 390, h: 844, touch: true },
  { name: 'small phone 320x640', w: 320, h: 640, touch: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('music button: visible, uncovered, and works at every screen size', { skip, timeout: 120000 }, async (t) => {
  const server = await serve();
  const b = await launch();
  try {
    const { send } = b;
    await send('Page.enable');
    // keep a handle on the page's Audio object so the test can see whether sound is really playing
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const A = window.Audio; window.Audio = function (...a) { const x = new A(...a); window.__audio = x; return x; }; })();` });
    const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
    const pointer = async (x, y, touch) => {
      if (touch) {
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      }
    };
    const until = async (expr, ms) => { for (let i = 0; i < ms / 100; i++) { if (await ev(expr)) return true; await sleep(100); } return false; };

    for (const s of SIZES) {
      await t.test(s.name, async () => {
        await send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: 1, mobile: s.touch });
        await send('Emulation.setTouchEmulationEnabled', { enabled: s.touch });
        await ev('localStorage.clear()');
        await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
        assert.ok(await until(`!!document.querySelector('[data-music]') && !document.querySelector('[data-music]').hidden`, 10000), 'button appears');

        // 1. layout: on screen, big enough, nothing on top of it, clear of the nav pill
        const L = await ev(`(() => { const b = document.querySelector('[data-music]'), r = b.getBoundingClientRect(), n = document.querySelector('.nav').getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2, top = document.elementFromPoint(cx, cy);
          return { x: cx, y: cy, w: r.width, h: r.height, l: r.left, r: r.right, t: r.top, bt: r.bottom, vw: innerWidth, vh: innerHeight, topIsButton: top === b || b.contains(top),
            overlapsNav: r.left < n.right && r.right > n.left && r.top < n.bottom && r.bottom > n.top, navRight: n.right }; })()`);
        assert.ok(L.w >= 40 && L.h >= 40, `button at least 40px (is ${L.w}x${L.h})`);
        assert.ok(L.l >= 0 && L.r <= L.vw && L.t >= 0 && L.bt <= L.vh, 'button fully on screen');
        assert.ok(L.topIsButton, 'nothing covers the button');
        assert.equal(L.overlapsNav, false, 'button does not overlap the nav pill');
        assert.equal(await ev(`document.documentElement.scrollWidth <= innerWidth`), true, 'no sideways scroll');

        // 2. the music starts by itself (autoplay allowed in this test browser), 3 s after load
        assert.ok(await until(`!!window.__audio && !window.__audio.paused && window.__audio.currentTime > 0`, 9000), 'music plays');
        assert.equal(await ev(`document.querySelector('[data-music]').getAttribute('aria-pressed')`), 'true');

        // 3. one real click or tap turns it off for good, and again on, and off
        for (const want of ['off', 'on', 'off']) {
          await pointer(L.x, L.y, s.touch);
          if (want === 'off') {
            assert.ok(await until(`window.__audio.paused`, 1500), 'music paused after the click');
            assert.equal(await ev(`document.querySelector('[data-music]').getAttribute('aria-pressed')`), 'false');
            assert.equal(await ev(`localStorage.getItem('avalon-music')`), 'off');
            await sleep(500);
            assert.equal(await ev(`window.__audio.paused`), true, 'stays off');
          } else {
            assert.ok(await until(`!window.__audio.paused`, 3000), 'music plays again');
            assert.equal(await ev(`document.querySelector('[data-music]').getAttribute('aria-pressed')`), 'true');
          }
        }
      });
    }
  } finally {
    b.close();
    server.close();
  }
});
