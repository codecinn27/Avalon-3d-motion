// Builds the two comparison pages: embeds the real card art, joins the shared engine, writes an artifact copy and a local test copy.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const cards = 'd:/Projects/P16-avalon/v2/dist/assets/cards';
const badges = 'd:/Projects/P16-avalon/v2/dist/assets/badges';
const webp = (f) => `data:image/webp;base64,${readFileSync(f).toString('base64')}`;
const svg = (f) => `data:image/svg+xml;base64,${readFileSync(f).toString('base64')}`;

const names = ['merlin', 'assassin', 'loyal-servant', 'morgana', 'percival', 'loyal-servant-3', 'mordred', 'loyal-servant-2', 'oberon', 'loyal-servant-4'];
const IMG = Object.fromEntries(names.map((n) => [n, webp(`${cards}/${n}-320.webp`)]));
IMG.back = webp(`${cards}/card-back-240.webp`);
IMG.evil = svg(`${badges}/evil.svg`);
IMG.good = svg(`${badges}/good.svg`);

const read = (f) => readFileSync(path.join(here, f), 'utf8');
const css = read('engine.css') + '\n' + (process.argv.includes('--shapes') ? '' : '');
const engine = read('engine.js');

for (const page of ['camera', 'shapes']) {
  let tpl;
  try { tpl = read(`${page}.page.html`); } catch { continue; }
  const shared = read('shapes.css').length ? '' : '';
  const extra = page === 'shapes' ? read('shapes.css') : '';
  const shapesJs = page === 'shapes' ? '' : '';
  let out = tpl
    .replace('/*ENGINE_CSS*/', css + '\n' + extra)
    .replace('/*IMG*/', `const IMG = ${JSON.stringify(IMG)};`)
    .replace('/*ENGINE_JS*/', engine);
  writeFileSync(path.join(here, `${page}.artifact.html`), out);
  const gsapLocal = 'file:///d:/Projects/P16-avalon/v2/node_modules/gsap/dist/gsap.min.js';
  const test = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{color-scheme:light}body{margin:0}</style></head><body>${out.replace('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', gsapLocal)}</body></html>`;
  writeFileSync(path.join(here, `${page}.test.html`), test);
  console.log(page, (out.length / 1024).toFixed(0) + ' KB');
}
