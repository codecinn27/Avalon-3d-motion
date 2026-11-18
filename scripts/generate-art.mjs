// Generates original card art with the OpenAI image API.
// The key is read from the local .env file and is never written anywhere.
//
// Usage:
//   node scripts/generate-art.mjs --style painted --roles merlin,morgana
//   node scripts/generate-art.mjs --style all --roles all
//   node scripts/generate-art.mjs --style tarot --roles merlin --force
//   node scripts/generate-art.mjs --badges blue,red [--model name] [--force]
//   node scripts/generate-art.mjs --props approve,reject,success,fail,lady [--model name] [--force]
//
// Output: src/assets/cards/<style>/<role>.png, src/assets/badges-src/raw-<name>.png,
// src/assets/props/<name>.png  (existing files are skipped unless --force)

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Values in .env win over any variable already set in the shell, so a stale
// system wide OPENAI_API_KEY cannot shadow the project key.
try {
  const fileEnv = parseEnv(await readFile(join(root, '.env'), 'utf8'));
  for (const name of ['OPENAI_API_KEY', 'OPENAI_IMAGE_MODEL']) {
    if (fileEnv[name]) process.env[name] = fileEnv[name];
  }
} catch {
  // No .env file. The check below reports the missing key.
}

const key = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';

if (!key) {
  console.error('OPENAI_API_KEY is missing. Add it to a .env file in the project root (see .env.example).');
  process.exit(1);
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  const next = process.argv[i + 1];
  return i > -1 && next && !next.startsWith('--') ? next : fallback;
}

const force = process.argv.includes('--force');
const config = JSON.parse(await readFile(join(root, 'scripts', 'art-prompts.json'), 'utf8'));

// Sets: blocks in art-prompts.json with their own size, model and shared text
// (badges, props). Each other key in the block is one picture.
const sets = {
  badges: (name) => join(root, 'src', 'assets', 'badges-src', `raw-${name}.png`),
  props: (name) => join(root, 'src', 'assets', 'props', `${name}.png`),
};
const setMode = Object.keys(sets).find((s) => process.argv.includes(`--${s}`));

if (setMode) {
  const block = config[setMode];
  const all = Object.keys(block).filter((k) => !['size', 'model', 'shared'].includes(k));
  const pick = arg(setMode, 'all');
  const names = pick === 'all' ? all : pick.split(',');
  const setModel = arg('model', block.model);
  for (const name of names) if (!all.includes(name)) { console.error(`Unknown ${setMode} entry: ${name}`); process.exit(1); }
  let bad = 0;
  for (const name of names) {
    const out = sets[setMode](name);
    if (!force && (await exists(out))) { console.log(`skip   ${setMode}/${name} (already exists)`); continue; }
    console.log(`start  ${setMode}/${name} (${setModel})`);
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: setModel, prompt: `${block[name]} ${block.shared}`, size: block.size, n: 1 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
      const d = (await res.json()).data?.[0];
      const bytes = d?.b64_json ? Buffer.from(d.b64_json, 'base64') : d?.url ? Buffer.from(await (await fetch(d.url)).arrayBuffer()) : null;
      if (!bytes) throw new Error('the API returned no image');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, bytes);
      console.log(`done   ${setMode}/${name} -> ${out}`);
    } catch (err) { bad += 1; console.error(`error  ${setMode}/${name}: ${err.message}`); }
  }
  process.exit(bad ? 1 : 0);
}

const styleArg = arg('style', 'all');
const roleArg = arg('roles', 'all');
const styles = styleArg === 'all' ? Object.keys(config.styles) : styleArg.split(',');
const roles = roleArg === 'all' ? Object.keys(config.roles) : roleArg.split(',');

for (const s of styles) if (!config.styles[s]) { console.error(`Unknown style: ${s}`); process.exit(1); }
for (const r of roles) if (!config.roles[r]) { console.error(`Unknown role: ${r}`); process.exit(1); }

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function generate(style, role) {
  const out = join(root, 'src', 'assets', 'cards', style, `${role}.png`);
  if (!force && (await exists(out))) {
    console.log(`skip   ${style}/${role} (already exists)`);
    return;
  }
  // Standalone entries (such as the card back) carry their whole prompt and
  // skip the shared "single figure" wording, which would add a person to them.
  const prompt = (config.standalone || []).includes(role)
    ? config.roles[role]
    : `${config.roles[role]} ${config.styles[style]} ${config.shared}`;
  console.log(`start  ${style}/${role}`);

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, prompt, size: config.size, n: 1 }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${style}/${role} failed with HTTP ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = (await res.json()).data?.[0];
  let bytes;
  if (data?.b64_json) {
    bytes = Buffer.from(data.b64_json, 'base64');
  } else if (data?.url) {
    bytes = Buffer.from(await (await fetch(data.url)).arrayBuffer());
  } else {
    throw new Error(`${style}/${role}: the API returned no image`);
  }

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, bytes);
  console.log(`done   ${style}/${role} -> ${out}`);
}

let failed = 0;
for (const style of styles) {
  for (const role of roles) {
    try {
      await generate(style, role);
    } catch (err) {
      failed += 1;
      console.error(`error  ${err.message}`);
    }
  }
}

process.exit(failed ? 1 : 0);
