import { esc, nav, footer } from './parts.mjs';

// Runs before first paint. Marks that scripts work, and whether motion is wanted.
// If the motion scripts never report ready, the page falls back to plain visible content.
// `lite` marks phones and tablets (touch, no hover), where the costly GPU effects are dropped (spec 013). ?lite=1 or ?lite=0 forces it.
const BOOT = `(function(){var d=document.documentElement,c=d.classList,q=location.search,mm=window.matchMedia;c.add('js');var rm=(mm&&mm('(prefers-reduced-motion: reduce)').matches)||/[?&]motion=off/.test(q);c.add(rm?'rm':'motion');var lite=/[?&]lite=1/.test(q)||(!/[?&]lite=0/.test(q)&&!!mm&&mm('(hover: none), (pointer: coarse)').matches);if(lite)c.add('lite');setTimeout(function(){if(!c.contains('ready'))c.remove('motion')},3500)})();`;

/**
 * The shell around every page.
 * ctx: { t, config, locale, route, siteUrl, assets }
 * page: { title, description, ogImage, theme, body, bodyClass, data }
 */
export function layout(ctx, page) {
  const { config, locale, route, siteUrl } = ctx;
  const A = ctx.assets; // the hashed script and style names, from the build (spec 015)
  const abs = (p) => siteUrl + p;
  const canonical = abs(locale.prefix + route);
  const alternates = config.locales
    .map((l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${esc(abs(l.prefix + route))}">`)
    .join('\n');
  const dark = page.theme === 'dark';
  const robots = page.noindex ? '<meta name="robots" content="noindex">' : '';
  const seo = page.noindex
    ? ''
    : `<link rel="canonical" href="${esc(canonical)}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${esc(abs(route))}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(config.brandName)}">
<meta property="og:locale" content="${locale.ogLocale}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${esc(abs(page.ogImage))}">
<meta property="og:image:secure_url" content="${esc(abs(page.ogImage))}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${esc(abs(page.ogImage))}">`;

  return `<!doctype html>
<html lang="${locale.htmlLang}" data-locale="${locale.code}"${dark ? ' class="dark"' : ''} data-theme-lock="${page.theme || ''}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="theme-color" content="${dark ? '#0B0D12' : '#F3ECDF'}">
${robots}
${seo}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/fraunces-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${A.css}">
<script>${BOOT}</script>
</head>
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ''}>
<a class="skip" href="#main">${esc(ctx.t.a11y.skip)}</a>
<div class="backdrop" aria-hidden="true"><div class="silk silk-light"></div><div class="silk silk-dark"></div><div class="silk silk-night"></div><canvas id="silk"></canvas><div class="tint tint-crimson"></div><div class="tint tint-dawn"></div></div>
<div class="grain" aria-hidden="true"></div>
${nav(ctx)}
<main id="main">
${page.body}
</main>
${footer(ctx)}
${page.data ? `<script type="application/json" id="page-data">${JSON.stringify(page.data).replace(/</g, '\\u003c')}</script>` : ''}
<script src="${A.vendor['gsap.min.js']}" defer></script>
<script src="${A.vendor['ScrollTrigger.min.js']}" defer></script>
<script src="${A.vendor['SplitText.min.js']}" defer></script>
<script src="${A.vendor['lenis.min.js']}" defer></script>
<script type="module" src="${A.js}"></script>
</body>
</html>
`;
}
