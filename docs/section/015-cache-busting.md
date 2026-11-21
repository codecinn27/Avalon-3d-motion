# 015 Cache busting (hashed file names and the cPanel `.htaccess`)

**Status**: built 2026-11-21 (owner's deploy check pending).
**Why**: after a deploy to cPanel, some phones kept showing the old site. The build wrote the same names every time (`/js/main.min.js`, `/css/main.min.css`) with no caching rules, so browsers, LiteSpeed and Cloudflare could keep old copies for hours or days. A phone that already holds an old `index.html` keeps asking for the old files.
**Code it touches**: `scripts/build.mjs` (`copyStatic`, `HTACCESS`, `assets` in the page context), `src/templates/layout.mjs`.

## What changed

- **Hashed names.** The script bundle is `/js/main.<hash>.js` (esbuild `[hash]`, with its `.map`), the styles `/css/main.<hash>.css`, and the four vendor files `/vendor/<name>.min.<hash>.js` (a short hash of each file's content). A changed file gets a new name. An unchanged one keeps its name, so rebuilding without changes gives the same names. `dist/css`, `dist/js` and `dist/vendor` are emptied on every build, so old files do not pile up.
- **The pages point at them.** `buildPages` passes the names to `layout()` as `ctx.assets`. Nothing else in `src` named the old files.
- **`dist/.htaccess`** is written by the build (Apache and LiteSpeed, so cPanel):
  - `html, json, xml, txt, map`: `no-cache, must-revalidate` (re-checked on every visit; an unchanged file answers "not modified").
  - hashed `js` and `css`: `public, max-age=31536000, immutable` (one year).
  - `webp, png, jpg, svg, woff2, m4a, ico`: `public, max-age=604800` (7 days). These keep their names, so a changed card painting can take up to 7 days to reach a phone that already has it.
- **Vercel** needs no rules file: it re-checks un-hashed files on every deploy by itself.

## Deploying to cPanel

1. `npm run build`.
2. Zip the **contents** of `dist` (not the folder): `tar -a -cf avalon-deploy.zip -C dist .` (this writes forward slashes, which cPanel's extractor needs; PowerShell 5's `Compress-Archive` writes backslashes).
3. In cPanel File Manager (Settings > Show Hidden Files), upload and extract into `public_html`, overwriting. If `public_html` already has a `.htaccess` with other rules, merge instead of overwriting.
4. Delete old files in `js`, `css` and `vendor` if you do not extract over a clean folder. The pages no longer use them.
5. Clear the LiteSpeed cache (and purge Cloudflare, if used).

Phones that cached the old `index.html` before this change keep it until it expires (hours to a few days, or `?v=2` on the link, or clearing cached files once). From the first deploy with this build on, a deploy shows on the next visit.

## Checked (2026-11-21)

- The build prints the hashed names, the pages reference them, and every referenced file answers 200. The old `main.min.js` and `main.min.css` are gone.
- The cache rule for hashed files matches all six hashed files and not the `.map`.
- Headless Chrome on the built site: the three pop-ups and the default ending still work, no console errors. `npm test` passes (33).
- **Not checked**: the real server's headers on cPanel (`curl -I https://yourdomain/js/main.<hash>.js` should show `immutable`), and a real phone.
