// Scroll smoothness on a real Android phone over USB (docs/section/013-performance_mobile.md).
// The phone scrolls the whole page with real finger swipes (adb), while Chrome's DevTools protocol records every frame.
//
// One build:   node scripts/perf-phone.mjs --label baseline --dir perf/builds/baseline [--runs 3] [--css "rule"] [--query "?x=1"]
// The live site: node scripts/perf-phone.mjs --label live --url https://example.com/
// Two builds:  node scripts/perf-phone.mjs --before perf/builds/cp1 --after dist --runs 3
// Layers:      add --layers (which elements own the GPU layers, and which need an off-screen surface, at ten points)
// Trace:       add --trace (a Chrome trace of one full scroll, with scroll-position markers, then a summary by tenth of the page)
// Read again:  node scripts/perf-phone.mjs --read-trace perf/results/<stamp>-<label>-trace.json
// A plan:      node scripts/perf-phone.mjs --plan perf/plans/before-after.json [--runs 3]
//              (a JSON list of { label, dir | url, css?, query? }. Runs are interleaved, so heat and battery hit every variant alike)
//
// Needs: an Android phone with USB debugging allowed, Chrome open on it, adb (Android SDK, or set ADB=path), Node 22+.
// Writes: perf/results/<stamp>-<label>-r<n>.json per run, and perf/results/<stamp>-summary.md
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream, createWriteStream } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(`  ${m}`);
const T0 = Date.now();
const step = (m) => console.log(`    [${((Date.now() - T0) / 1000).toFixed(0)} s] ${m}`);

// ---------- arguments ----------
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const RUNS = Number(arg('runs', 3));
const CDP_PORT = 9333;
if (arg('read-trace')) {
  await traceSummary(path.resolve(root, arg('read-trace')));
  process.exit(0);
}
let plan;
if (arg('plan')) plan = JSON.parse(await readFile(path.resolve(root, arg('plan')), 'utf8'));
// one checkpoint against the one before it (spec 013): --before perf/builds/cp1 --after dist
else if (arg('before') && arg('after')) plan = [{ label: 'before', dir: arg('before') }, { label: 'after', dir: arg('after') }];
else plan = [{ label: arg('label', 'run'), dir: arg('dir'), url: arg('url'), css: arg('css', ''), query: arg('query', '') }];
if (plan.some((v) => !v.dir && !v.url)) throw new Error('each variant needs --dir (a built site) or --url');

// ---------- adb ----------
const ADB = process.env.ADB || [path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe'), path.join(process.env.ANDROID_HOME || '', 'platform-tools', 'adb')].find((p) => p && existsSync(p)) || 'adb';
const adb = async (...a) => (await run(ADB, a, { maxBuffer: 1 << 24 })).stdout;
const shell = (cmd) => adb('shell', cmd);

const devices = (await adb('devices')).split('\n').filter((l) => /\tdevice$/.test(l.trim()) || /\sdevice$/.test(l));
if (!devices.length) throw new Error('no authorized phone: plug it in, allow USB debugging, check `adb devices`');
const [W, H] = (await shell('wm size')).match(/(\d+)x(\d+)/).slice(1).map(Number);
const model = (await shell('getprop ro.product.model')).trim();
const chromeVer = ((await shell('dumpsys package com.android.chrome')).match(/versionName=(\S+)/) || [])[1] || '?';
await adb('forward', `tcp:${CDP_PORT}`, 'localabstract:chrome_devtools_remote');

// one swipe: a finger drag up the middle of the screen, about 38% of its height, in 450 ms (a normal reading scroll with a small fling)
const SWIPE = `input swipe ${Math.round(W / 2)} ${Math.round(H * 0.72)} ${Math.round(W / 2)} ${Math.round(H * 0.34)} 450`;
const BATCH = 6;

// swipe only while Chrome is the app in front: if anything else comes up (a call, another app), stop at once
async function swipeBatch() {
  const focus = await shell('dumpsys window | grep mCurrentFocus').catch(() => '');
  if (!/com\.android\.chrome/.test(focus)) throw new Error(`stopped: Chrome is no longer in front on the phone (${(focus.match(/u0 ([^/\s}]+)/) || [])[1] || 'unknown app'}). No swipes were sent to it`);
  await shell(Array(BATCH).fill(SWIPE).join('; '));
}

// GPU process graphics memory (KB -> MB). Chrome's GPU process is the "privileged_process" one
async function gpuMem() {
  try {
    const ps = await shell('ps -A -o PID,NAME');
    const pid = (ps.split('\n').find((l) => /com\.android\.chrome:privileged_process/.test(l)) || '').trim().split(/\s+/)[0];
    if (!pid) return null;
    const m = (await shell(`dumpsys meminfo -s ${pid}`)).match(/Graphics:\s+(\d+)/);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

// ---------- a small static server for built folders (no cache, so every run loads the same way) ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };
function serve(dir, port) {
  const base = path.resolve(root, dir);
  if (!existsSync(path.join(base, 'index.html'))) throw new Error(`${dir} has no index.html: run npm run build first`);
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      let file = path.join(base, p);
      if (!file.startsWith(base)) throw new Error('outside');
      let s = await stat(file).catch(() => null);
      if (s && s.isDirectory()) (file = path.join(file, 'index.html')), (s = await stat(file).catch(() => null));
      if (!s) {
        res.writeHead(404, { 'Content-Type': TYPES['.html'] });
        return res.end(await readFile(path.join(base, '404.html')).catch(() => 'not found'));
      }
      const body = await readFile(file);
      const head = { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
      const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (range) {
        const start = range[1] ? Number(range[1]) : 0;
        const end = range[2] ? Number(range[2]) : body.length - 1;
        res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
        return res.end(body.subarray(start, end + 1));
      }
      res.writeHead(200, { ...head, 'Content-Length': body.length });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end();
    }
  });
  return new Promise((ok, no) => {
    server.once('error', no);
    server.listen(port, '127.0.0.1', () => ok(server));
  });
}

// ---------- DevTools protocol ----------
const http = async (p, method = 'GET') => {
  const r = await fetch(`http://127.0.0.1:${CDP_PORT}${p}`, { method, signal: AbortSignal.timeout(8000) });
  const t = await r.text();
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
};
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const wait = new Map();
  const handlers = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && wait.has(m.id)) {
      const { ok, no } = wait.get(m.id);
      wait.delete(m.id);
      m.error ? no(new Error(m.error.message)) : ok(m.result);
    } else if (m.method && handlers.has(m.method)) handlers.get(m.method)(m.params);
  };
  // every request has a time limit, and a closed tab fails at once, so a run never waits forever
  const send = (method, params = {}, ms = 30000) => new Promise((ok, no) => {
    const n = ++id;
    const timer = setTimeout(() => {
      wait.delete(n);
      no(new Error(`the phone did not answer ${method} within ${ms / 1000} s`));
    }, ms);
    wait.set(n, { ok: (v) => (clearTimeout(timer), ok(v)), no: (e) => (clearTimeout(timer), no(e)) });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  ws.onclose = () => {
    for (const { no } of wait.values()) no(new Error('the test tab closed on the phone'));
    wait.clear();
  };
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  return new Promise((ok, no) => {
    ws.onopen = () => ok({ send, evaluate, on: (ev, fn) => handlers.set(ev, fn), close: () => ws.close() });
    ws.onerror = () => no(new Error('could not connect to Chrome on the phone: is Chrome open?'));
  });
}

// the recorder: every animation frame's time and scroll position, plus long animation frames (Chrome 123+)
const RECORDER = `(() => {
  const P = window.__perf = { f: [], y: [], loaf: [], on: false };
  const loop = (t) => { if (P.on) { P.f.push(t); P.y.push(scrollY); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  try { new PerformanceObserver((l) => { if (P.on) for (const e of l.getEntries()) P.loaf.push([Math.round(e.duration), Math.round(e.blockingDuration || 0)]); }).observe({ type: 'long-animation-frame' }); } catch {}
  P.start = () => { P.f.push(-1); P.y.push(-1); P.on = true; };
  P.stop = () => { P.on = false; };
  return true;
})()`;

async function layerCount(c) {
  let n = null;
  c.on('LayerTree.layerTreeDidChange', (p) => { if (p.layers) n = p.layers.length; });
  await c.send('LayerTree.enable');
  for (let i = 0; i < 20 && n === null; i++) await sleep(100);
  await c.send('LayerTree.disable');
  return n;
}

// the elements on or near the screen whose style makes the GPU draw them into an off-screen surface first (a "render pass"):
// the CP-3 trace found 19 to 41 of these per frame inside the pinned story and 1 after it, and drawing them is most of the GPU's time
const SURFACES = `(() => {
  const vh = innerHeight, by = {};
  let total = 0;
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < -vh * 0.25 || r.top > vh * 1.25) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
    let hidden = false; // opacity is not inherited: a parent at 0 hides it from the GPU too
    for (let p = el.parentElement; p && !hidden; p = p.parentElement) hidden = getComputedStyle(p).opacity === '0';
    if (hidden) continue;
    const why = [];
    if (s.filter !== 'none') why.push('filter ' + s.filter.replace(/\\(.*/, ''));
    if (s.mixBlendMode !== 'normal') why.push('blend ' + s.mixBlendMode);
    if (s.backdropFilter && s.backdropFilter !== 'none') why.push('backdrop-filter');
    if ((s.maskImage || s.webkitMaskImage || 'none') !== 'none') why.push('mask');
    if (s.clipPath !== 'none') why.push('clip-path');
    if (s.transformStyle === 'preserve-3d') why.push('3d');
    if (+s.opacity < 1 && el.firstElementChild) why.push('opacity group');
    if (!why.length) continue;
    const n = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '') + ' (' + why.join(', ') + ')';
    by[n] = (by[n] || 0) + 1;
    total++;
  }
  // the chapter in view: the pinned story keeps every chapter in the DOM, so take the one whose box covers the middle of the screen
  const secs = [...document.querySelectorAll('main > section[id]')].filter((s) => { const b = s.getBoundingClientRect(); return b.top <= vh / 2 && b.bottom >= vh / 2; });
  return { y: Math.round(scrollY), section: secs.map((s) => s.id).join('+') || '?', total, list: Object.entries(by).sort((a, b) => b[1] - a[1]) };
})()`;

// --layers: which elements own the GPU layers, at ten points down the page (no frame recording)
async function layerReport(c, max) {
  let latest = null;
  c.on('LayerTree.layerTreeDidChange', (p) => { if (p.layers) latest = p.layers; });
  await c.send('DOM.enable');
  await c.send('DOM.getDocument', { depth: 0 });
  await c.send('LayerTree.enable');
  const names = new Map();
  const nameOf = async (id) => {
    if (names.has(id)) return names.get(id);
    let n = '?';
    try {
      const { node } = await c.send('DOM.describeNode', { backendNodeId: id });
      const a = node.attributes || [];
      const cls = a[a.indexOf('class') + 1];
      n = node.nodeName.toLowerCase() + (a.includes('id') ? `#${a[a.indexOf('id') + 1]}` : '') + (a.includes('class') ? `.${cls.trim().split(/\s+/).slice(0, 2).join('.')}` : '');
    } catch {}
    names.set(id, n);
    return n;
  };
  const out = [];
  for (let k = 0; k <= 9; k++) {
    const y = Math.round((k / 9) * max);
    latest = null;
    await c.evaluate(`(window.scrollTo(0, ${y}), true)`);
    await sleep(2200); // let the scrub catch up
    for (let i = 0; i < 20 && !latest; i++) await sleep(100);
    const layers = latest || [];
    const by = new Map();
    let px = 0;
    for (const l of layers) {
      if (l.drawsContent) px += l.width * l.height;
      const n = l.backendNodeId ? await nameOf(l.backendNodeId) : '(browser)';
      by.set(n, (by.get(n) || 0) + 1);
    }
    const top = [...by].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, v]) => `${v}x ${n}`);
    // the biggest drawing layers by area (CSS pixels of the layer's own box)
    const area = new Map();
    for (const l of layers.filter((l) => l.drawsContent && l.width * l.height < 2e7)) { // the whole document layer is tiled, leave it out
      const n = l.backendNodeId ? await nameOf(l.backendNodeId) : '(browser)';
      const a = area.get(n) || [0, 0];
      area.set(n, [a[0] + 1, a[1] + l.width * l.height]);
    }
    const big = [...area].sort((a, b) => b[1][1] - a[1][1]).slice(0, 10).map(([n, [c, a]]) => `${n} ${c}x = ${(a / 1e6).toFixed(1)} Mpx`);
    const surf = await c.evaluate(SURFACES);
    out.push({ at: `${k * 10}%`, layers: layers.length, drawing: layers.filter((l) => l.drawsContent).length, rasterMB: Math.round((px * 4) / 1048576), top, big, surfaces: surf });
    console.log(`    ${k * 10}%: ${layers.length} layers, ${out.at(-1).drawing} drawing, about ${out.at(-1).rasterMB} MB of pixels. ${top.join(', ')}\n          biggest: ${big.join(', ')}`);
    console.log(`          scrollY ${surf.y}, in view: ${surf.section}. ${surf.total} elements that need their own off-screen surface: ${surf.list.slice(0, 12).map(([n, v]) => `${v}x ${n}`).join(', ')}`);
  }
  await c.send('LayerTree.disable');
  return out;
}

// --trace: a Chrome trace of the whole scroll, then the work that took the most time on each thread
async function traceScroll(c, max, file) {
  // the trace stays on the phone while it scrolls (ReturnAsStream) and is read once at the end, so recording costs the phone little
  // Chrome on Android drops a page's connection when tracing starts on it, so the trace runs on the browser's own connection
  const ver = await http('/json/version');
  const b = await connect(ver.webSocketDebuggerUrl);
  try {
    return await traceOn(b, c, max, file);
  } finally {
    b.close();
  }
}

async function traceOn(b, c, max, file) {
  // while tracing, nothing on the phone answers DevTools (the page's connection, or the tab attached through the browser's),
  // so the scroll position cannot be read: the scroll runs a fixed number of swipe batches, and the page writes markers into the trace
  // a batch of swipes moves about 2200 CSS px when the page keeps up (measured: the bottom came at batch ~9 of 14 on a 19,000 px page), less in the freezes.
  // +1 batch covers one lost to a freeze; the check after the trace says if the scroll fell short
  const PX_PER_BATCH = 2200;
  const batches = Math.ceil(max / PX_PER_BATCH) + 1;
  let done;
  const finished = new Promise((r) => (done = r));
  b.on('Tracing.tracingComplete', (p) => done(p.stream));
  // markers in the trace: the page writes its scroll position four times a second (console.timeStamp shows in devtools.timeline)
  await c.evaluate(`(window.__mark = setInterval(() => console.timeStamp('scroll ' + Math.round(100 * scrollY / ${max}) + '%'), 250), true)`);
  step('starting the trace');
  await b.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    // no 'cc': it alone made a full-page trace bigger than 512 MB. Raster and GPU work still show through devtools.timeline and toplevel
    traceConfig: { recordMode: 'recordAsMuchAsPossible', traceBufferSizeInKb: 300000, includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'toplevel', 'gpu', 'viz'] },
  });
  step('trace started, scrolling');
  const t0 = Date.now();
  for (let n = 1; n <= batches; n++) {
    await swipeBatch();
    await sleep(700);
    process.stdout.write(`\r    tracing: batch ${n} of ${batches}   `);
  }
  process.stdout.write('\n');
  step(`scrolled ${batches} batches in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  step('stopping the trace');
  await b.send('Tracing.end', {}, 120000);
  const stream = await Promise.race([finished, sleep(180000).then(() => { throw new Error('the trace never finished on the phone'); })]);
  // the page's own connection may answer again now: how far the scroll got
  const endY = await c.send('Runtime.evaluate', { expression: 'scrollY', returnByValue: true }, 5000).then((r) => r.result.value, () => null);
  if (endY != null) step(`the scroll ended at ${Math.round((100 * endY) / max)}% of the page`);
  if (endY != null && endY < max - 50) step(`the scroll fell short of the bottom: raise PX_PER_BATCH's batch count (the +1) in scripts/perf-phone.mjs and run again`);
  // a full-page trace can be bigger than the longest string Node allows, so it goes straight to the file in chunks
  step('copying the trace from the phone');
  const out = createWriteStream(file);
  let bytes = 0;
  for (;;) {
    const r = await b.send('IO.read', { handle: stream, size: 1 << 22 }, 120000);
    const chunk = r.base64Encoded ? Buffer.from(r.data, 'base64') : Buffer.from(r.data, 'utf8');
    bytes += chunk.length;
    if (!out.write(chunk)) await new Promise((ok) => out.once('drain', ok));
    if (r.eof) break;
  }
  await new Promise((ok) => out.end(ok));
  await b.send('IO.close', { handle: stream });
  step(`trace saved: ${path.relative(root, file)}, ${(bytes / 1048576).toFixed(0)} MB (Chrome DevTools > Performance > Load profile)`);
  await traceSummary(file);
}

// every event of a trace file, one at a time, without holding the whole file as one string
async function* traceEvents(file) {
  const stack = [];
  let inStr = false, esc = false, buf = null, eventDepth = 0;
  for await (const chunk of createReadStream(file, { encoding: 'utf8', highWaterMark: 1 << 22 })) {
    let from = buf != null ? 0 : -1;
    for (let i = 0; i < chunk.length; i++) {
      const ch = chunk[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === '{' || ch === '[') {
        if (!eventDepth) eventDepth = ch === '[' ? 1 : 2; // a bare array of events, or { "traceEvents": [ ... ] }
        stack.push(ch);
        if (ch === '{' && stack.length === eventDepth + 1 && stack[eventDepth - 1] === '[') (buf = ''), (from = i);
      } else if (ch === '}' || ch === ']') {
        stack.pop();
        if (buf != null && stack.length === eventDepth) {
          const text = buf + chunk.slice(from, i + 1);
          buf = null;
          from = -1;
          try { yield JSON.parse(text); } catch {}
        }
      }
    }
    if (buf != null) buf += chunk.slice(from);
  }
}

// what the trace says: the longest work per thread, then by tenth of the page how hard the GPU worked to draw each frame, then the freezes.
// Also runs on its own: node scripts/perf-phone.mjs --read-trace perf/results/<file>-trace.json
async function traceSummary(file) {
  const threads = new Map();
  const sums = new Map();
  const marks = []; // [ts, scroll %]
  const draws = []; // the display compositor drawing a frame: [ts, dur]
  const passes = []; // each off-screen surface (render pass) drawn: ts
  const gpuDraw = []; // the GPU executing those passes: [ts, dur]
  const commits = []; // [ts, dur] on the page's main thread
  const rafs = new Map(); // animation frames per renderer thread: the page under test is the one with the most
  let markThread = null;
  for await (const e of traceEvents(file)) {
    if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name);
    if (e.name === 'TimeStamp' && /^scroll \d+%$/.test(e.args?.data?.message || '')) (marks.push([e.ts, Number(e.args.data.message.match(/\d+/)[0])]), (markThread = `${e.pid}:${e.tid}`));
    if (e.ph !== 'X' || !e.dur) continue;
    const th = threads.get(`${e.pid}:${e.tid}`);
    if (e.name === 'DirectRenderer::DrawFrame') draws.push([e.ts, e.dur]);
    else if (e.name === 'DirectRenderer::DrawRenderPass') passes.push(e.ts);
    else if (e.name === 'SkiaOutputSurfaceImplOnGpu::FinishPaintRenderPass') gpuDraw.push([e.ts, e.dur]);
    else if (e.name === 'Commit' && th === 'CrRendererMain') commits.push([e.ts, e.dur, `${e.pid}:${e.tid}`]);
    else if (e.name === 'FireAnimationFrame') {
      const k = `${e.pid}:${e.tid}`;
      if (!rafs.has(k)) rafs.set(k, []);
      rafs.get(k).push(e.ts);
    }
    const k = `${e.pid}:${e.tid}|${e.name}`;
    const s = sums.get(k) || { total: 0, max: 0, n: 0 };
    s.total += e.dur / 1000;
    s.max = Math.max(s.max, e.dur / 1000);
    s.n++;
    sums.set(k, s);
  }
  const name = (k) => { const [t, ev] = k.split('|'); return `${threads.get(t) || t} | ${ev}`; };
  const top = [...sums].sort((a, b) => b[1].max - a[1].max).filter(([k]) => !/RunTask|ThreadController|Scheduler::|Graphics\.Pipeline|EpollEvent|mojo|SimpleWatcher/.test(k)).slice(0, 25);
  console.log('    longest single events (ms), by thread | event: max, total, count');
  for (const [k, s] of top) console.log(`      ${name(k)}: ${s.max.toFixed(0)}, ${s.total.toFixed(0)}, ${s.n}`);
  if (!marks.length) return console.log('    (no scroll markers in this trace, so no breakdown by tenth of the page)');

  marks.sort((a, b) => a[0] - b[0]);
  draws.sort((a, b) => a[0] - b[0]);
  passes.sort((a, b) => a - b);
  // the scroll position at a moment: the last marker before it
  const at = (ts) => { let lo = 0, hi = marks.length - 1; if (ts < marks[0][0]) return marks[0][1]; while (lo < hi) { const m = (lo + hi + 1) >> 1; marks[m][0] <= ts ? (lo = m) : (hi = m - 1); } return marks[lo][1]; };
  const tenth = (p) => Math.min(9, Math.floor(p / 10));
  const T = Array.from({ length: 10 }, () => ({ frames: 0, passes: 0, maxPasses: 0, gpu: 0, from: Infinity, to: 0, freezes: 0 }));
  let j = 0;
  for (const [ts, dur] of draws) {
    let n = 0;
    while (j < passes.length && passes[j] < ts) j++;
    for (let k = j; k < passes.length && passes[k] <= ts + dur; k++) n++;
    const t = T[tenth(at(ts))];
    t.frames++;
    t.passes += n;
    t.maxPasses = Math.max(t.maxPasses, n);
    t.from = Math.min(t.from, ts);
    t.to = Math.max(t.to, ts);
  }
  for (const [ts, dur] of gpuDraw) T[tenth(at(ts))].gpu += dur;
  // freezes: the page's main thread went over 200 ms without an animation frame. The browser keeps scrolling on its own thread,
  // but the pinned scenes are moved by GSAP on the main thread, so this is the stall the eye sees.
  // (A gap in drawn frames is not used: a page standing still draws nothing, and that is not a freeze.)
  const page = markThread || [...rafs].sort((a, b) => b[1].length - a[1].length)[0]?.[0];
  const raf = (rafs.get(page) || []).sort((a, b) => a - b);
  const pageCommits = commits.filter(([, , th]) => th === page);
  const freezes = [];
  for (let i = 1; i < raf.length; i++) {
    const gap = raf[i] - raf[i - 1];
    if (gap > 200e3) freezes.push([raf[i - 1], gap, at(raf[i - 1])]);
  }
  for (const [, , p] of freezes) T[tenth(p)].freezes++;
  console.log('\n    by tenth of the page: frames drawn per second, off-screen surfaces (render passes) per frame, share of the time the GPU spent drawing them, main-thread freezes over 200 ms');
  T.forEach((t, i) => {
    const secs = t.to > t.from ? (t.to - t.from) / 1e6 : 0;
    if (!t.frames) return console.log(`      ${i + 1}: no frames`);
    console.log(`      ${i + 1}: ${secs ? (t.frames / secs).toFixed(0) : '?'} frames/s, ${(t.passes / t.frames).toFixed(1)} passes per frame (most ${t.maxPasses}), GPU drawing ${secs ? Math.round((100 * t.gpu) / 1e6 / secs) : '?'}% of the time, ${t.freezes} freeze(s)`);
  });
  console.log(`\n    main-thread freezes over 200 ms (${freezes.length}), longest first:`);
  for (const [ts, gap, p] of freezes.sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    const c = pageCommits.filter(([cs, cd]) => cs < ts + gap && cs + cd > ts).reduce((m, [, cd]) => Math.max(m, cd), 0);
    const g = gpuDraw.filter(([gs, gd]) => gs < ts + gap && gs + gd > ts).reduce((s, [, gd]) => s + gd, 0);
    console.log(`      ${(gap / 1e3).toFixed(0)} ms at ${p}% of the page: in it, Commit up to ${(c / 1e3).toFixed(0)} ms, GPU drawing surfaces ${Math.round((100 * g) / gap)}% of the time`);
  }
  const long = pageCommits.filter(([, cd]) => cd > 100e3).sort((a, b) => b[1] - a[1]);
  console.log(`\n    commits over 100 ms (the main thread waiting for the compositor, which waits for the GPU): ${long.length}. ${long.slice(0, 10).map(([cs, cd]) => `${(cd / 1e3).toFixed(0)} ms at ${at(cs)}%`).join(', ')}`);
}

async function measure(variant, url, layersOnly = false) {
  await shell('input keyevent KEYCODE_WAKEUP');
  await sleep(500);
  if (/isKeyguardShowing=true/.test(await shell('dumpsys window | grep isKeyguardShowing').catch(() => ''))) {
    throw new Error('the phone is locked: unlock it (and keep it unlocked), then run again');
  }
  // open the page in Chrome with an Android intent (Chrome on Android refuses /json/new), tagged so its tab can be found
  step(`opening ${url} on the phone`);
  const tag = `perf${Date.now()}`;
  const tagged = url + (url.includes('?') ? '&' : '?') + tag;
  await shell(`am start -a android.intent.action.VIEW -d '${tagged}' -n com.android.chrome/com.google.android.apps.chrome.Main --ez create_new_tab true`);
  let tab;
  for (let i = 0; i < 50 && !tab; i++) {
    await sleep(200);
    const list = await http('/json/list').catch(() => []);
    tab = Array.isArray(list) && list.find((t) => t.type === 'page' && (t.url || '').includes(tag) && t.webSocketDebuggerUrl);
  }
  if (!tab) throw new Error('the page did not open in Chrome on the phone');
  step('page opened, connecting');
  const c = await connect(tab.webSocketDebuggerUrl);
  try {
    await c.send('Runtime.enable');
    await c.send('Performance.enable');
    for (let i = 0; i < 150; i++) {
      if ((await c.evaluate('document.readyState')) === 'complete') break;
      await sleep(200);
    }
    step('page loaded, waiting for the intro');
    await sleep(4000); // the hero's own intro (deal in, title reveal) finishes
    if (variant.css) await c.evaluate(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(variant.css)}; document.head.append(s); return true; })()`);
    if (layersOnly === 'trace') return await traceScroll(c, await c.evaluate('document.documentElement.scrollHeight - innerHeight'), path.join(root, 'perf', 'results', `${stamp}-${variant.label}-trace.json`));
    if (layersOnly) return { layerReport: await layerReport(c, await c.evaluate('document.documentElement.scrollHeight - innerHeight')) };
    await c.evaluate(RECORDER);
    const info = await c.evaluate('({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, max: document.documentElement.scrollHeight - innerHeight, webgl: document.querySelector(".backdrop")?.classList.contains("gl") || false })');

    // idle: 3 s with no touch, which gives the screen's refresh rate and the cost of the page standing still
    await c.evaluate('__perf.start()');
    await sleep(3000);
    await c.evaluate('__perf.stop()');
    const idle = await c.evaluate('({ f: __perf.f.splice(0), y: __perf.y.splice(0) })');

    const m0 = await c.send('Performance.getMetrics');
    const gpu = [await gpuMem()];
    const layers = [await layerCount(c)];
    const t0 = Date.now();
    let last = -1, still = 0, batch = 0;
    while (Date.now() - t0 < 300000) {
      await c.evaluate('__perf.start()');
      await swipeBatch();
      await sleep(700); // let the fling settle while still recording
      await c.evaluate('__perf.stop()');
      batch++;
      const y = await c.evaluate('scrollY');
      process.stdout.write(`\r    ${variant.label}: ${Math.round((100 * y) / info.max)}% of the page   `);
      // between batches (not recorded): GPU memory every batch, layer count every third
      gpu.push(await gpuMem());
      if (batch % 3 === 0) layers.push(await layerCount(c));
      if (y >= info.max - 4) break;
      still = Math.abs(y - last) < 4 ? still + 1 : 0;
      if (still >= 2) break;
      last = y;
    }
    process.stdout.write('\n');
    const m1 = await c.send('Performance.getMetrics');
    const data = await c.evaluate('({ f: __perf.f, y: __perf.y, loaf: __perf.loaf })');
    const metric = (m, k) => (m.metrics.find((x) => x.name === k) || {}).value || 0;
    const cost = Object.fromEntries(['ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'TaskDuration'].map((k) => [k, +(metric(m1, k) - metric(m0, k)).toFixed(2)]));
    return { info, idle, data, cost, gpu: gpu.filter((v) => v != null), layers: layers.filter((v) => v != null), seconds: (Date.now() - t0) / 1000 };
  } finally {
    c.close();
    await http(`/json/close/${tab.id}`).catch(() => {});
  }
}

// ---------- numbers ----------
const pct = (a, p) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1);
};
function deltas(f, y) {
  const d = [], at = [];
  for (let i = 1; i < f.length; i++) {
    if (f[i] < 0 || f[i - 1] < 0) continue; // a pause marker between batches
    d.push(f[i] - f[i - 1]);
    at.push(y[i]);
  }
  return { d, at };
}
function analyse(r) {
  const idle = deltas(r.idle.f, r.idle.y).d;
  const vsync = median(idle) || 16.7; // the screen's frame interval, measured while still
  const { d, at } = deltas(r.data.f, r.data.y);
  const total = d.reduce((a, b) => a + b, 0);
  const stats = (dd) => {
    const sum = dd.reduce((a, b) => a + b, 0) || 1;
    return {
      fps: +((1000 * dd.length) / sum).toFixed(1),
      p95: +pct(dd, 95).toFixed(1),
      dropped: +((100 * dd.filter((x) => x > vsync * 1.5).length) / (dd.length || 1)).toFixed(1),
      hitches: dd.filter((x) => x > 50).length,
    };
  };
  // ten slices of the page by scroll position, to find where it lags
  const slices = Array.from({ length: 10 }, (_, i) => stats(d.filter((_, k) => Math.min(9, Math.floor((10 * at[k]) / r.info.max)) === i)));
  return {
    vsyncMs: +vsync.toFixed(2),
    refreshHz: Math.round(1000 / vsync),
    idleFps: +((1000 * idle.length) / (idle.reduce((a, b) => a + b, 0) || 1)).toFixed(1),
    frames: d.length,
    seconds: +(total / 1000).toFixed(1),
    ...stats(d),
    p50: +pct(d, 50).toFixed(1),
    p99: +pct(d, 99).toFixed(1),
    worst: +Math.max(0, ...d).toFixed(0),
    longFrames: r.data.loaf.length,
    blockingMs: r.data.loaf.reduce((a, [, b]) => a + b, 0),
    gpuMB: r.gpu.length ? Math.max(...r.gpu) : null,
    layers: r.layers.length ? Math.max(...r.layers) : null,
    scriptS: r.cost.ScriptDuration,
    layoutS: r.cost.LayoutDuration,
    styleS: r.cost.RecalcStyleDuration,
    slices,
  };
}

// ---------- main ----------
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const outDir = path.join(root, 'perf', 'results');
await mkdir(outDir, { recursive: true });
const servers = [];
let port = Number(arg('port', 4870)); // 8080 is often reserved on Windows
for (const v of plan) {
  if (v.url) continue;
  v.port = port++;
  servers.push(await serve(v.dir, v.port));
  await adb('reverse', `tcp:${v.port}`, `tcp:${v.port}`);
  v.url = `http://localhost:${v.port}/`;
}
console.log(`\nPhone: ${model} (${W}x${H}), Chrome ${chromeVer}. ${plan.length} variant(s), ${RUNS} run(s) each. Do not touch the phone.\n`);

const results = Object.fromEntries(plan.map((v) => [v.label, []]));
if (argv.includes('--layers') || argv.includes('--trace')) {
  try {
    for (const v of plan) {
      if (argv.includes('--trace')) {
        console.log(`  ${v.label}: tracing the scroll`);
        await measure(v, v.url + (v.query || ''), 'trace');
        continue;
      }
      console.log(`  ${v.label}: GPU layers by element`);
      const r = await measure(v, v.url + (v.query || ''), true);
      await writeFile(path.join(outDir, `${stamp}-${v.label}-layers.json`), JSON.stringify(r.layerReport, null, 1));
    }
  } finally {
    servers.forEach((s) => s.close());
    for (const v of plan) if (v.port) await adb('reverse', '--remove', `tcp:${v.port}`).catch(() => {});
  }
  process.exit(0);
}
try {
  for (let n = 1; n <= RUNS; n++) {
    for (const v of plan) {
      const url = v.url + (v.query || '');
      const raw = await measure(v, url);
      const a = analyse(raw);
      results[v.label].push(a);
      await writeFile(path.join(outDir, `${stamp}-${v.label}-r${n}.json`), JSON.stringify({ variant: v, phone: { model, W, H, chrome: chromeVer }, info: raw.info, summary: a, raw }, null, 0));
      log(`${v.label} run ${n}: ${a.fps} fps (screen ${a.refreshHz} Hz), p95 ${a.p95} ms, dropped ${a.dropped}%, hitches ${a.hitches}, GPU ${a.gpuMB} MB, layers ${a.layers}`);
      await sleep(5000); // a short rest between runs
    }
  }
} finally {
  servers.forEach((s) => s.close());
  for (const v of plan) if (v.port) await adb('reverse', '--remove', `tcp:${v.port}`).catch(() => {});
}

// summary: the median of the runs for each variant
const med = (list, k) => median(list.map((x) => x[k]).filter((x) => x != null));
const rows = plan.map((v) => {
  const l = results[v.label];
  const sl = Array.from({ length: 10 }, (_, i) => median(l.map((x) => x.slices[i].fps)));
  return { label: v.label, hz: med(l, 'refreshHz'), fps: med(l, 'fps'), p95: med(l, 'p95'), p99: med(l, 'p99'), dropped: med(l, 'dropped'), hitches: med(l, 'hitches'), worst: med(l, 'worst'), blocking: med(l, 'blockingMs'), gpu: med(l, 'gpuMB'), layers: med(l, 'layers'), script: med(l, 'scriptS'), sl, range: `${Math.min(...l.map((x) => x.fps))} to ${Math.max(...l.map((x) => x.fps))}` };
});
const md = [
  `# Phone scroll test ${stamp}`,
  '',
  `${model}, ${W}x${H}, Chrome ${chromeVer}. Median of ${RUNS} run(s) each, runs interleaved. Each run: open the page fresh, wait for the intro, scroll top to bottom with finger swipes.`,
  '',
  '| Variant | Screen | Avg fps (range) | p95 frame | Dropped frames | Hitches >50 ms | Worst frame | Blocking ms | GPU MB | Layers | Script s |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.label} | ${r.hz} Hz | ${r.fps} (${r.range}) | ${r.p95} ms | ${r.dropped}% | ${r.hitches} | ${r.worst} ms | ${r.blocking} | ${r.gpu ?? '?'} | ${r.layers ?? '?'} | ${r.script} |`),
  '',
  'Avg fps by tenth of the page (1 = top, hero; 10 = bottom, final call):',
  '',
  `| Variant | ${Array.from({ length: 10 }, (_, i) => i + 1).join(' | ')} |`,
  `|---|${'---|'.repeat(10)}`,
  ...rows.map((r) => `| ${r.label} | ${r.sl.join(' | ')} |`),
  '',
].join('\n');
const mdFile = path.join(outDir, `${stamp}-summary.md`);
await writeFile(mdFile, md);
console.log(`\n${md}\nSaved: ${path.relative(root, mdFile)}`);
