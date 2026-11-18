import { esc, em, fill, plain, arrow, roleCard, waUrl } from './parts.mjs';

export function rolePage(ctx, role) {
  const { t, config, locale } = ctx;
  const r = t.roles[role.slug];
  const vars = { role: r.name, line: r.line };
  const wa = waUrl(config.whatsappNumber, fill(t.waMessage.withRole, vars));
  const body = `<section class="sec role ${role.side}">
  <div class="role-card">${roleCard({ ctx, role, eager: true, halo: true, sizes: '(max-width:820px) 220px, 300px', cls: 'idle-tilt' })}</div>
  <div class="txt">
    <span class="eyebrow" data-fade><i></i>${esc(t.rolePage.eyebrow)}</span>
    <h1 class="h2" data-split>${em(t.rolePage.title, vars)}</h1>
    <p class="side-l" data-fade>${esc(t.sides[`${role.side}Long`])}</p>
    <p class="lede" data-fade>${esc(r.line)} ${esc(t.rolePage.tail)}</p>
    <div class="role-cta" data-fade>
      <a class="btn" href="${locale.prefix}/#draw" data-event="role_draw" data-magnet>${esc(t.rolePage.cta)} ${arrow}</a>
      <a class="link" href="${esc(wa)}" target="_blank" rel="noopener noreferrer" data-event="wa_role">${esc(t.rolePage.wa)}<span class="vh"> (${esc(t.a11y.newTab)})</span> <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>`;
  return {
    title: plain(t.rolePage.metaTitle, vars),
    description: plain(t.rolePage.metaDescription, vars),
    ogImage: `/og/${role.slug}.jpg`,
    theme: role.side === 'evil' ? 'dark' : 'light',
    bodyClass: 'page-role',
    body,
  };
}

export function notFoundPage(ctx) {
  const { t, locale } = ctx;
  return {
    title: `${plain(t.notFound.title)} · ${ctx.config.brandName}`,
    description: t.notFound.body,
    ogImage: '/og/home.jpg',
    theme: 'dark',
    noindex: true,
    bodyClass: 'page-404',
    body: `<section class="sec final">
  <h1 class="h1">${em(t.notFound.title)}</h1>
  <p class="lede">${esc(t.notFound.body)}</p>
  <a class="btn" href="${locale.prefix}/">${esc(t.notFound.link)} ${arrow}</a>
</section>`,
  };
}
