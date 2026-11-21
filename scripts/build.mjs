// Builds the static site into dist/. Plain Node, no framework.
// Run: npm run build
import { readFile, writeFile, mkdir, copyFile, readdir, stat, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { build as esbuild, transform } from 'esbuild';
import { layout } from '../src/templates/layout.mjs';
import { homePage } from '../src/templates/home.mjs';
import { rolePage, notFoundPage } from '../src/templates/role.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, 'src', ...p);
const dist = (...p) => path.join(root, 'dist', ...p);
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const log = (msg) => console.log(`  ${msg}`);

// ---------- config ----------
// Only PUBLIC_ values are read from .env. The art key is never touched here.
async function readPublicEnv() {
  const out = {};
  const file = path.join(root, '.env');
  if (!existsSync(file)) return out;
  for (const line of (await readFile(file, 'utf8')).split(/\r?\n/)) {
    const m = line.match(/^\s*(PUBLIC_[A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = await readPublicEnv();
const config = await json(src('config.json'));
if (env.PUBLIC_WHATSAPP_NUMBER) config.whatsappNumber = env.PUBLIC_WHATSAPP_NUMBER;
const realSiteUrl = (env.PUBLIC_SITE_URL || config.siteUrl || '').replace(/\/+$/, '');
const siteUrl = realSiteUrl || config.siteUrlPlaceholder;
if (!/^\d{8,15}$/.test(config.whatsappNumber)) throw new Error('whatsappNumber must be digits only, in international format');

// ---------- content ----------
const roles = (await json(src('data', 'roles.json'))).sort((a, b) => a.order - b.order);
// the ten card deck shown in the hero ring: which role each card is, and which painting it uses
const deck = await json(src('data', 'deck.json'));
const night = await json(src('data', 'night.json'));
const vote = await json(src('data', 'vote.json'));
const quest = await json(src('data', 'quest.json'));
const lady = await json(src('data', 'lady.json'));
const climb = await json(src('data', 'climb.json'));
const blade = await json(src('data', 'blade.json'));
const PROPS = ['approve', 'reject', 'success', 'fail'];
const roleBySlug = Object.fromEntries(roles.map((r) => [r.slug, r]));
const artSlugs = [...new Set([...roles.map((r) => r.slug), ...deck.map((d) => d.art)])];
const copy = {};
for (const l of config.locales) copy[l.code] = await json(src('i18n', `${l.code}.json`));

function keysOf(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

function checkContent() {
  const errors = [];
  const base = config.defaultLocale;
  const baseKeys = new Set(keysOf(copy[base]));
  for (const l of config.locales) {
    const keys = new Set(keysOf(copy[l.code]));
    for (const k of baseKeys) if (!keys.has(k)) errors.push(`${l.code}.json is missing "${k}"`);
    for (const k of keys) if (!baseKeys.has(k)) errors.push(`${l.code}.json has extra key "${k}"`);
    for (const k of keys) {
      const v = k.split('.').reduce((o, p) => o?.[p], copy[l.code]);
      if (typeof v !== 'string' || !v.trim()) errors.push(`${l.code}.json has an empty value at "${k}"`);
    }
  }
  if (roles.length !== 7) errors.push(`expected 7 roles, found ${roles.length}`);
  const good = roles.filter((r) => r.side === 'good').length;
  if (good !== 3) errors.push(`expected 3 good and 4 evil roles, found ${good} good`);
  for (const r of roles) {
    if (!existsSync(src('assets', 'cards', 'painted', `${r.slug}.png`))) errors.push(`no art for role "${r.slug}"`);
    for (const l of config.locales) if (!copy[l.code].roles?.[r.slug]) errors.push(`${l.code}.json has no copy for role "${r.slug}"`);
  }
  if (deck.length !== 10) errors.push('expected 10 cards in deck.json, found ' + deck.length);
  for (const d of deck) {
    if (!roleBySlug[d.role]) errors.push('deck.json names an unknown role "' + d.role + '"');
    if (!existsSync(src('assets', 'cards', 'painted', d.art + '.png'))) errors.push('no art for deck card "' + d.art + '"');
  }
  for (const [r, list] of Object.entries(night.sees)) {
    for (const s of [r, ...list]) if (!deck.some((d) => d.role === s)) errors.push(`night.json names "${s}", which is not in deck.json`);
  }
  checkStory(errors);
  if (errors.length) {
    console.error('\nContent check failed:\n' + errors.map((e) => `  - ${e}`).join('\n') + '\n');
    process.exit(1);
  }
}

// chapters 5 and 6 (specs 008, 009): who holds the Lady, who is looked at, and who leads. Seat numbers are 1 to 10, deck.json order.
function checkStory(errors) {
  const side = (seat) => roleBySlug[deck[seat - 1]?.role]?.side;
  const seat = (v, what) => (Number.isInteger(v) && v >= 1 && v <= 10 ? true : (errors.push(`${what}: seat ${v} does not exist`), false));
  const held = new Set();
  // chapter 5: the holder is evil, the target is loyal (so the water shows blue and the word "evil" is a lie)
  [lady.holder, lady.target, lady.nextHolder, ...lady.turn.order, ...lady.turn.silent].forEach((s) => seat(s, 'lady.json'));
  if (side(lady.holder) !== 'evil') errors.push('lady.json: the holder must be evil');
  if (side(lady.target) !== 'good') errors.push('lady.json: the target must be loyal');
  if (lady.said === 'good' || lady.said === side(lady.target)) errors.push("lady.json: the holder's word must be a lie");
  if (lady.nextHolder !== lady.target) errors.push('lady.json: the Lady passes to the target');
  held.add(lady.holder);
  // chapter 6: team sizes, leaders one seat after the last, two fails by evil seats, Lady targets not past holders, the score ends 3 to 2
  const sizes = [4, 5, 5];
  let leader = quest.quests[quest.quests.length - 1].leader;
  climb.quests.forEach((q, i) => {
    q.team.forEach((s) => seat(s, `climb.json quest ${q.n}`));
    if (q.team.length !== sizes[i]) errors.push(`climb.json: quest ${q.n} needs ${sizes[i]} players`);
    leader = (leader % 10) + 1;
    if (q.leader !== leader) errors.push(`climb.json: quest ${q.n} should be led by seat ${leader}`);
    if (q.fails) {
      if (q.fails.length !== q.needs) errors.push(`climb.json: quest ${q.n} needs ${q.needs} fails`);
      for (const f of q.fails) if (side(f) !== 'evil' || !q.team.includes(f)) errors.push(`climb.json: fail by seat ${f} must be an evil player on the team`);
    }
  });
  for (const l of climb.lady) {
    seat(l.holder, 'climb.json lady');
    seat(l.target, 'climb.json lady');
    held.add(l.holder);
    if (held.has(l.target)) errors.push(`climb.json: seat ${l.target} has held the Lady already`);
    if (l.saw && l.saw !== side(l.target)) errors.push("climb.json: the water must show the target's real side");
    if (l.saw && l.said && side(l.holder) === 'good' && l.said !== l.saw) errors.push("climb.json: a loyal holder's word must match what the water showed");
  }
  // chapter 7 (spec 010): the evil seats, the six loyal seats in the arc, and Merlin
  const evilSeats = deck.map((d, i) => (roleBySlug[d.role].side === 'evil' ? i + 1 : 0)).filter(Boolean);
  const loyalSeats = deck.map((d, i) => (roleBySlug[d.role].side === 'good' ? i + 1 : 0)).filter(Boolean);
  const same = (a, b) => a.length === b.length && [...a].sort((x, y) => x - y).join() === [...b].sort((x, y) => x - y).join();
  if (!same(blade.evil, evilSeats)) errors.push('blade.json: evil must list exactly the evil seats of deck.json');
  if (!blade.evil.includes(blade.assassin) || deck[blade.assassin - 1]?.role !== 'assassin') errors.push('blade.json: assassin must be the Assassin seat');
  if (!same(blade.arc, loyalSeats)) errors.push('blade.json: arc must list exactly the loyal seats of deck.json');
  if (deck[blade.merlin - 1]?.role !== 'merlin' || !blade.arc.includes(blade.merlin)) errors.push('blade.json: merlin must be the Merlin seat, and in the arc');
  if (!blade.arc.includes(blade.auto) || blade.auto === blade.merlin) errors.push('blade.json: auto (no choice, spec 014) must be a loyal seat in the arc, not Merlin');
  const wins = climb.score.filter((r) => r === 'success').length;
  if (climb.score.length !== 5 || wins !== 3) errors.push('climb.json: the score must end 3 : 2 for the loyal');
}

// ---------- images ----------
async function isFresh(out, input) {
  if (!existsSync(out)) return false;
  return (await stat(out)).mtimeMs >= (await stat(input)).mtimeMs;
}

async function buildCards() {
  await mkdir(dist('assets', 'cards'), { recursive: true });
  const jobs = [
    ...artSlugs.map((slug) => ({ slug, widths: [320, 640] })),
    { slug: 'card-back', widths: [240, 480] },
  ];
  let made = 0;
  for (const { slug, widths } of jobs) {
    const input = src('assets', 'cards', 'painted', `${slug}.png`);
    for (const w of widths) {
      const out = dist('assets', 'cards', `${slug}-${w}.webp`);
      if (await isFresh(out, input)) continue;
      await sharp(input).resize({ width: w, height: Math.round(w * 1.5), fit: 'cover' }).webp({ quality: 76, effort: 5 }).toFile(out);
      made++;
    }
  }
  log(`card images: ${made} made, the rest were up to date`);
}

// the vote and quest pictures: small WebP files, two sizes (spec 006 and 007)
async function buildProps() {
  await mkdir(dist('assets', 'props'), { recursive: true });
  let made = 0;
  for (const slug of PROPS) {
    const input = src('assets', 'props', `${slug}.png`);
    for (const w of [240, 480]) {
      const out = dist('assets', 'props', `${slug}-${w}.webp`);
      if (await isFresh(out, input)) continue;
      await sharp(input).resize({ width: w, height: Math.round(w * 1.5), fit: 'cover' }).webp({ quality: 78, effort: 5 }).toFile(out);
      made++;
    }
  }
  // chapter 5: the Lady's painting, three sizes
  for (const w of [320, 640, 960]) {
    const input = src('assets', 'props', 'lady_of_the_lake.png');
    const out = dist('assets', 'props', `lady_of_the_lake-${w}.webp`);
    if (await isFresh(out, input)) continue;
    await sharp(input).resize({ width: w, height: Math.round(w * 1.5), fit: 'cover' }).webp({ quality: 74, effort: 5 }).toFile(out);
    made++;
  }
  log(`vote, quest and Lady images: ${made} made, the rest were up to date`);
}

// ---------- background music ----------
// The full track (src/assets/audio/adventure-source.m4a) is cut to its first 60 seconds and compressed to a small
// 96 kbps AAC file. Needs ffmpeg on PATH (or set FFMPEG_PATH). The fades are done in the browser (src/js/music.js).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const MUSIC_SECONDS = 60;
async function buildAudio() {
  const input = src('assets', 'audio', 'adventure-source.m4a');
  const out = dist('assets', 'audio', 'adventure.m4a');
  if (!existsSync(input)) {
    log('music: src/assets/audio/adventure-source.m4a not found, skipped');
    return;
  }
  await mkdir(path.dirname(out), { recursive: true });
  const self = fileURLToPath(import.meta.url);
  if ((await isFresh(out, input)) && (await isFresh(out, self))) {
    log('music: up to date');
    return;
  }
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  try {
    await promisify(execFile)(ffmpeg, ['-y', '-v', 'error', '-i', input, '-t', String(MUSIC_SECONDS), '-vn', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart', out]);
    log(`music: trimmed to ${MUSIC_SECONDS}s and compressed to ${((await stat(out)).size / 1024).toFixed(0)} KB`);
  } catch (err) {
    console.error(`\nMusic step failed: ${err.code === 'ENOENT' ? 'ffmpeg was not found. Install it or set FFMPEG_PATH.' : err.message}\n`);
    process.exit(1);
  }
}

// ---------- badges ----------
// The badges are painted on a plain white ground by the art script. Here the white that touches
// the edge is removed (a flood fill, so white inside the badge stays), the edge is softened, and
// small transparent files are written for the cards and the share images.
async function cutOut(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = w * h;
  const bg = new Uint8Array(px); // 1 = background
  const isWhite = (i) => {
    const o = i * 4, r = data[o], g = data[o + 1], bl = data[o + 2];
    return Math.min(r, g, bl) > 226 && Math.max(r, g, bl) - Math.min(r, g, bl) < 24;
  };
  const stack = [];
  const push = (x, y) => { const i = y * w + x; if (!bg[i] && isWhite(i)) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  // the soft shadow under the badge is grey, not white: drop grey that touches the background too
  for (let pass = 0; pass < 4; pass++) {
    const next = new Uint8Array(bg);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (bg[i]) continue;
      if (bg[i - 1] || bg[i + 1] || bg[i - w] || bg[i + w]) {
        const o = i * 4;
        if (Math.min(data[o], data[o + 1], data[o + 2]) > 165) next[i] = 1;
      }
    }
    bg.set(next);
  }
  const alpha = Buffer.alloc(px);
  for (let i = 0; i < px; i++) alpha[i] = bg[i] ? 0 : 255;
  const { data: soft, info: si } = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(1.1).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < px; i++) {
    const a = soft[i * si.channels]; // read with the real channel count, blur may widen the buffer
    data[i * 4 + 3] = a < 24 ? 0 : a;
  }
  const png = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  return sharp(png).trim({ threshold: 1 }).toBuffer(); // crop to the badge, transparent margin removed
}

async function buildBadges() {
  await mkdir(dist('assets', 'badges'), { recursive: true });
  let made = 0;
  for (const [side, raw] of [['good', 'raw-blue'], ['evil', 'raw-red']]) {
    const input = src('assets', 'badges-src', `${raw}.png`);
    if (!existsSync(input)) continue;
    const self = fileURLToPath(import.meta.url);
    const marker = dist('assets', 'badges', `${side}-192.webp`);
    if ((await isFresh(marker, input)) && (await isFresh(marker, self))) continue;
    const cut = await cutOut(input);
    const square = async (n) => sharp(cut).resize(n, n, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    for (const n of [96, 192, 384]) await (await square(n)).webp({ quality: 88, alphaQuality: 95, effort: 5 }).toFile(dist('assets', 'badges', `${side}-${n}.webp`));
    await (await square(256)).png().toFile(dist('assets', 'badges', `${side}-256.png`));
    made++;
  }
  log(`badges: ${made} made, the rest were up to date`);
}

// One 1200x630 share image per role: the art and the wordmark, no translated text.
async function shareImage(input, out, side) {
  const W = 1200, H = 630, cw = 340, ch = 510, cx = 150, cy = 60;
  const bg = await sharp(input).resize(W, H, { fit: 'cover', position: 'attention' }).blur(28).modulate({ brightness: 0.42, saturation: 0.9 }).toBuffer();
  const mask = Buffer.from(`<svg width="${cw}" height="${ch}"><rect width="${cw}" height="${ch}" rx="26" ry="26"/></svg>`);
  const card = await sharp(input).resize(cw, ch, { fit: 'cover' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#0B0D12" stop-opacity=".1"/><stop offset="1" stop-color="#0B0D12" stop-opacity=".72"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9A441"/><stop offset=".45" stop-color="#D9A441" stop-opacity=".25"/><stop offset="1" stop-color="#D9A441"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  <rect x="${cx - 7}" y="${cy - 7}" width="${cw + 14}" height="${ch + 14}" rx="32" fill="url(#edge)"/>
  <text x="600" y="345" font-family="Georgia, 'Times New Roman', serif" font-size="150" fill="#EFE6D4" letter-spacing="-4">${config.brandName}</text>
  <rect x="606" y="392" width="84" height="3" fill="#D9A441"/>
  <text x="606" y="250" font-family="Georgia, serif" font-size="34" fill="#D9A441">✦</text>
</svg>`);
  await sharp(bg)
    .composite([
      { input: overlay },
      { input: card, left: cx, top: cy },
      ...(side ? [{ input: await sharp(existsSync(dist('assets', 'badges', side + '-256.png')) ? dist('assets', 'badges', side + '-256.png') : src('assets', 'badges', side + '.svg'), { density: 300 }).resize(120, 120).png().toBuffer(), left: cx + cw - 82, top: cy - 34 }] : []),
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
}

async function buildShareImages() {
  await mkdir(dist('og'), { recursive: true });
  let made = 0;
  const self = fileURLToPath(import.meta.url);
  for (const slug of [...roles.map((r) => r.slug), 'home']) {
    const input = src('assets', 'cards', 'painted', `${slug === 'home' ? 'card-back' : slug}.png`);
    const out = dist('og', `${slug}.jpg`);
    if ((await isFresh(out, input)) && (await isFresh(out, self))) continue;
    await shareImage(input, out, roleBySlug[slug]?.side);
    made++;
  }
  log(`share images: ${made} made, the rest were up to date`);
}

// ---------- static files ----------
async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) await copyDir(a, b);
    else await copyFile(a, b);
  }
}

// The names the pages point at, filled in by copyStatic (spec 015): every script and style file carries a hash of its content,
// so a changed file always has a new name and a browser or CDN can never serve an old copy under it.
const assets = { css: '', js: '', vendor: {} };

// Pages, data and other un-hashed files are re-checked on every visit (a changed file downloads, an unchanged one answers "not modified").
// Hashed scripts and styles never change under their name, so they are kept for a year. Images, fonts and music keep their names, so 7 days.
const HTACCESS = `# Written by scripts/build.mjs (spec 015). Do not edit by hand: the next build replaces this file.
<IfModule mod_headers.c>
  <FilesMatch "\\.(html|json|xml|txt|map)$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(webp|png|jpe?g|svg|woff2|m4a|ico)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "\\.[0-9A-Za-z]{8}\\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
`;

async function copyStatic() {
  await rm(dist('css'), { recursive: true, force: true });
  await rm(dist('js'), { recursive: true, force: true });
  await rm(dist('vendor'), { recursive: true, force: true });
  // scripts: one bundle, minified, with a source map for devtools. Styles: minified. `npm run build:dev` (--dev) keeps them readable.
  const minify = !process.argv.includes("--dev");
  await mkdir(dist('js'), { recursive: true });
  await mkdir(dist('css'), { recursive: true });
  const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const built = await esbuild({ entryPoints: [src('js', 'main.js')], bundle: true, format: 'esm', target: 'es2020', minify, sourcemap: 'linked', legalComments: 'none', outdir: dist('js'), entryNames: '[name].[hash]', metafile: true });
  const jsFile = path.basename(Object.keys(built.metafile.outputs).find((k) => k.endsWith('.js')));
  const css = await readFile(src('styles', 'main.css'), 'utf8');
  const cssCode = minify ? (await transform(css, { loader: 'css', minify: true })).code : css;
  const cssFile = `main.${hash(cssCode)}.css`;
  await writeFile(dist('css', cssFile), cssCode);
  assets.js = `/js/${jsFile}`;
  assets.css = `/css/${cssFile}`;
  const kb = async (f) => ((await stat(dist(f))).size / 1024).toFixed(0);
  log(`scripts ${await kb(`js/${jsFile}`)} KB (${jsFile}) and styles ${await kb(`css/${cssFile}`)} KB (${cssFile})${minify ? ' (minified)' : ' (not minified)'}`);
  await mkdir(dist('vendor'), { recursive: true });
  const nm = (...p) => path.join(root, 'node_modules', ...p);
  const vendors = [['gsap.min.js', nm('gsap', 'dist', 'gsap.min.js')], ['ScrollTrigger.min.js', nm('gsap', 'dist', 'ScrollTrigger.min.js')], ['SplitText.min.js', nm('gsap', 'dist', 'SplitText.min.js')], ['lenis.min.js', nm('lenis', 'dist', 'lenis.min.js')]];
  for (const [f, from] of vendors) {
    const name = f.replace(/\.js$/, `.${hash(await readFile(from))}.js`);
    await copyFile(from, dist('vendor', name));
    assets.vendor[f] = `/vendor/${name}`;
  }
  // The caching rules for cPanel and other Apache hosts (Vercel needs none: it re-checks pages on every deploy by itself).
  await writeFile(dist('.htaccess'), HTACCESS);
  await copyDir(src('assets', 'badges'), dist('assets', 'badges'));
  await mkdir(dist('fonts'), { recursive: true });
  const fonts = [
    ['fraunces', 'fraunces-latin-opsz-normal.woff2'],
    ['fraunces', 'fraunces-latin-opsz-italic.woff2'],
    ['geist', 'geist-latin-wght-normal.woff2'],
  ];
  for (const [pkg, f] of fonts) await copyFile(nm('@fontsource-variable', pkg, 'files', f), dist('fonts', f));
  await writeFile(
    dist('favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0B0D12"/><text x="32" y="45" text-anchor="middle" font-size="38" fill="#D9A441">✦</text></svg>`,
  );
}

// ---------- pages ----------
async function writePage(route, html) {
  const file = route.endsWith('.html') ? dist(route) : dist(route, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function buildPages() {
  const urls = [];
  for (const locale of config.locales) {
    const base = { t: copy[locale.code], config, locale, roles, deck: deck.map((d) => ({ ...d, side: roleBySlug[d.role].side })), night, vote, quest, lady, climb, blade, assets, siteUrl, siteUrlIsReal: Boolean(realSiteUrl) };
    const home = { ...base, route: '/' };
    await writePage(`${locale.prefix}/`, layout(home, homePage(home)));
    urls.push({ route: '/', locale });
    for (const role of roles) {
      const ctx = { ...base, route: `/role/${role.slug}/` };
      await writePage(`${locale.prefix}${ctx.route}`, layout(ctx, rolePage(ctx, role)));
      urls.push({ route: ctx.route, locale });
    }
    const nf = { ...base, route: '/' };
    await writePage(locale.prefix ? `${locale.prefix}/404.html` : '404.html', layout(nf, notFoundPage(nf)));
  }

  const alt = (route) => config.locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${siteUrl}${l.prefix}${route}"/>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>\n    <loc>${siteUrl}${u.locale.prefix}${u.route}</loc>\n${alt(u.route)}\n  </url>`).join('\n')}
</urlset>
`;
  await writeFile(dist('sitemap.xml'), sitemap);
  await writeFile(dist('robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  log(`pages: ${urls.length} written, plus ${config.locales.length} not found pages, sitemap.xml and robots.txt`);
}

// ---------- run ----------
const started = Date.now();
console.log('Building Avalon landing page');
checkContent();
log('content check passed: three languages share the same keys, seven roles have art and copy');
await mkdir(dist(), { recursive: true });
await Promise.all([buildCards(), buildBadges(), buildProps(), buildAudio()]);
await buildShareImages();
await copyStatic();
await buildPages();
if (!realSiteUrl) log(`WARNING: PUBLIC_SITE_URL is not set, so link previews, shared links and the sitemap use the placeholder ${siteUrl}. Facebook and Threads cannot preview that. Do not deploy this build.`);
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
