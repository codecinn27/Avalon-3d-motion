// Small helpers and shared HTML pieces used by every page template.

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Fill `{name}` slots in a copy string. */
export const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

/** Escape, then turn `*word*` into an emphasised span. */
export const em = (s, vars) => esc(fill(s, vars)).replace(/\*(.+?)\*/g, '<em>$1</em>');

/** Plain text version of a title, without the emphasis marks. */
export const plain = (s, vars) => fill(s, vars).replace(/\*/g, '');

export const arrow =
  '<span class="dot" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></span>';

export const waUrl = (number, message) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

const EXT = 'target="_blank" rel="noopener noreferrer"';

/** WhatsApp pill button that opens a chat with the owner. */
export function waButton({ ctx, label, event, large = false, message }) {
  const { t, config } = ctx;
  const href = waUrl(config.whatsappNumber, message ?? t.waMessage.general);
  return `<a class="btn${large ? ' lg' : ''}" href="${esc(href)}" ${EXT} data-event="${event}" data-magnet>${esc(label)}<span class="vh"> (${esc(t.a11y.newTab)})</span> ${arrow}</a>`;
}

const cardImg =(slug, alt, { eager = false, sizes = '190px' } = {}) =>
  `<img src="/assets/cards/${slug}-320.webp" srcset="/assets/cards/${slug}-320.webp 320w, /assets/cards/${slug}-640.webp 640w" sizes="${sizes}" width="320" height="480" alt="${esc(alt)}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;

export const backSide = (eager) =>
  `<div class="card-side card-back" aria-hidden="true"><div class="in"><img src="/assets/cards/card-back-240.webp" srcset="/assets/cards/card-back-240.webp 240w, /assets/cards/card-back-480.webp 480w" sizes="170px" width="240" height="360" alt="" decoding="async"${eager ? '' : ' loading="lazy"'}></div></div>`;

/** A face down card with only a back. Used in the hero arc and the deck. */
export const backCard = ({ eager = false, cls = '' } = {}) =>
  `<div class="card is-down ${cls}"><div class="card-3d">${backSide(eager)}</div></div>`;

/** A full card with a painted front and the shared back. */
export function roleCard({ ctx, role, eager = false, sizes, cls = '', halo = false }) {
  const { t } = ctx;
  const r = t.roles[role.slug];
  const alt = fill(t.a11y.cardAlt, { role: r.name });
  return `<div class="card ${role.side} ${cls}" data-role="${role.slug}">${halo ? '<span class="halo" aria-hidden="true"></span>' : ''}<div class="card-3d"><div class="card-side card-front"><div class="in">${cardImg(role.slug, alt, { eager, sizes })}<div class="face" aria-hidden="true"><span class="nm">${esc(r.name)}</span><span class="sd">${esc(t.sides[role.side])}</span></div></div></div>${backSide(eager)}</div></div>`;
}

export function nav(ctx) {
  const { t, config, locale, route } = ctx;
  const langs = config.locales
    .map((l) => {
      const on = l.code === locale.code;
      return `<a href="${l.prefix}${route}" lang="${l.htmlLang}" hreflang="${l.htmlLang}" data-lang="${l.code}"${on ? ' aria-current="true" class="on"' : ''} aria-label="${esc(l.name)}">${esc(l.label)}</a>`;
    })
    .join('');
  return `<header class="nav-wrap"><nav class="nav" aria-label="${esc(t.a11y.nav)}"><a class="brand" href="${locale.prefix}/">${esc(config.brandName)}</a><div class="lang" role="group" aria-label="${esc(t.a11y.language)}">${langs}</div><a class="wa" href="${esc(waUrl(config.whatsappNumber, t.waMessage.general))}" ${EXT} data-event="wa_nav">${esc(t.nav.whatsapp)}<span class="vh"> (${esc(t.a11y.newTab)})</span></a></nav><button class="music" type="button" hidden data-music data-label-off="${esc(t.a11y.musicOff)}" data-label-on="${esc(t.a11y.musicOn)}" aria-pressed="true" aria-label="${esc(t.a11y.musicOff)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.6L12 18.5v-13L7.6 9.5z" fill="currentColor" fill-opacity=".18"/><path class="mw" d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/><path class="mx" d="M16 9.5l5 5M21 9.5l-5 5"/></svg></button></header>`;
}

export function footer(ctx) {
  const { t, config, route } = ctx;
  const langs = config.locales
    .map((l) => `<a href="${l.prefix}${route}" lang="${l.htmlLang}" hreflang="${l.htmlLang}" data-lang="${l.code}">${esc(l.label)}</a>`)
    .join('<span aria-hidden="true"> · </span>');
  // Fixed licence text (CC BY 4.0 attribution) - kept in English in every locale on purpose.
  const credit = `<p class="foot-credit" lang="en">Music: Adventure by Alexander Nakarada (<a href="https://creatorchords.com" ${EXT}>https://creatorchords.com</a>)<br>Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)<br><a href="https://creativecommons.org/licenses/by/4.0/" ${EXT}>https://creativecommons.org/licenses/by/4.0/</a></p>`;
  return `<footer class="foot"><b>${esc(config.brandName)}</b><span class="foot-lang">${langs}</span><div class="foot-info"><span>${esc(t.footer.note)}</span>${credit}</div></footer>`;
}
