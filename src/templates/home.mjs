import { esc, em, fill, arrow, waButton, backCard, backSide, waUrl } from './parts.mjs';

const eyebrow = (text) => `<span class="eyebrow" data-fade><i></i>${esc(text)}</span>`;

function hero(ctx) {
  const { t } = ctx;
  // ten face down cards: the full ten player deck, turning around the title
  // Each one is a button: clicking it turns that card over in a dialog.
  // Each card has a painted front too. The scatter in part 2 (gathering) turns them face up.
  const ringCard = (d, i) => {
    const r = t.roles[d.role];
    return `<div class="card ${d.side} is-down"><div class="card-3d"><div class="card-side card-front"><div class="in"><img src="/assets/cards/${d.art}-320.webp" srcset="/assets/cards/${d.art}-320.webp 320w, /assets/cards/${d.art}-640.webp 640w" sizes="132px" width="320" height="480" alt="" decoding="async"><div class="face" aria-hidden="true"><span class="nm">${esc(r.name)}</span><span class="sd">${esc(t.sides[d.side])}</span></div></div></div>${backSide(true)}</div></div>`;
  };
  const slots = ctx.deck
    .map((d, i) => `<button class="slot" type="button" style="--i:${i}" data-card="${i}" aria-label="${esc(fill(t.a11y.turnCard, { n: i + 1, total: ctx.deck.length }))}">${ringCard(d, i)}</button>`)
    .join('');
  // twenty more face up copies of the ten paintings. They only join the card wall in part 3.
  const extras = Array.from({ length: 20 }, (_, j) => `<div class="slot is-extra" aria-hidden="true" inert>${ringCard(ctx.deck[j % ctx.deck.length], j)}</div>`).join('');
  // the round table the ten cards are dealt onto in part 4 (a flat disc drawn with CSS, first in the ring so the cards lie on top of it)
  return `<section class="sec hero" id="top">
  <div class="ring"><div class="table" aria-hidden="true"></div>${slots}${extras}</div>
  <div class="copy">
    ${eyebrow(t.hero.eyebrow)}
    <h1 class="h1" data-split>${esc(ctx.config.brandName)}</h1>
    <p class="tag" data-fade>${em(t.hero.title)}</p>
    <div class="cta" data-fade>
      ${waButton({ ctx, label: t.hero.cta, event: 'wa_hero' })}
      <a class="link" href="#draw" data-event="hero_draw">${esc(t.hero.drawLink)} <span aria-hidden="true">↓</span></a>
    </div>
  </div>
</section>`;
}

function how(ctx) {
  const { t } = ctx;
  const step = (n) => `<li class="step" data-step><span class="n" aria-hidden="true">${n}</span><div><h3>${esc(t.how[`step${n}Title`])}</h3><p>${esc(t.how[`step${n}Body`])}</p></div></li>`;
  // The story under the card wall. With scripts it moves into the hero and plays with the scroll;
  // without them it stays a plain section after the hero.
  return `<section class="sec how" id="how">
  <div class="how-in">
    <div class="side">
      <span class="eyebrow"><i></i>${esc(t.how.eyebrow)}</span>
      <h2 class="h2">${em(t.how.title)}</h2>
      <p class="lede">${esc(t.how.lede)}</p>
    </div>
    <ol class="steps" role="list">${step(1)}${step(2)}${step(3)}</ol>
  </div>
</section>`;
}

function deal(ctx) {
  const { t } = ctx;
  // Chapter 1 of the story line: the words over the round table. With scripts it moves into the pinned hero
  // and appears while the cards are dealt; without them it stays a plain section after the story.
  return `<section class="sec deal" id="deal">
  <h2 class="h2">${em(t.deal.title)}</h2>
  <p class="lede">${esc(t.deal.lede)}</p>
</section>`;
}

function night(ctx) {
  const { t, deck } = ctx;
  const n = t.night;
  const seat = (i) => fill(n.seat, { n: i + 1, role: t.roles[deck[i].role].name });
  const steps = [
    [n.fall, n.fallSub], [n.evil], [n.traitors], [n.oberon], [n.merlin, n.merlinSees, n.merlinSub],
    [n.percival, n.percivalSees, n.percivalSub], [n.others], [n.open, n.know],
  ];
  // Chapter 2 of the story line: night falls. Watch only. Without scripts this is a plain section (eight lines, then one
  // row per seat). With scripts it moves into the pinned hero: night.js writes the lines over the table, one element each,
  // and the plain text is hidden from the eye but stays for screen readers.
  return `<section class="sec night" id="night">
  <div class="night-static">
    <h2 class="h2">${esc(n.title)}</h2>
    <ol class="night-steps" role="list">${steps.map((s) => `<li>${s.map(esc).join(" ")}</li>`).join("")}</ol>
    <h3 class="night-h3">${esc(n.whoTitle)}</h3>
    <ul class="night-list" role="list">${deck.map((d, i) => `<li><b>${esc(seat(i))}</b> ${esc(n.sees[d.role])} ${esc(n.seen[d.role])}</li>`).join("")}</ul>
  </div>
  <div class="night-live night-say" aria-hidden="true"></div>
</section>`;
}

function vote(ctx) {
  const { t } = ctx;
  const v = t.vote;
  const lines = [v.leader, v.team1, v.cards, v.all, `${v.rejected} ${v.five} ${v.fiveSub}`, v.team2, v.approved];
  // Chapter 3 of the story line: the vote. Watch only. Without scripts this is a plain section (seven lines, then how a
  // vote works). With scripts it moves into the pinned hero: vote.js writes the lines over the table, one element each.
  return `<section class="sec vote" id="vote">
  <div class="vote-static">
    <h2 class="h2">${esc(v.title)}</h2>
    <ol class="night-steps" role="list">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
    <h3 class="night-h3">${esc(v.howTitle)}</h3>
    <ul class="night-list" role="list">${[1, 2, 3, 4, 5, 6].map((n) => `<li>${esc(v[`how${n}`])}</li>`).join('')}</ul>
  </div>
  <div class="night-live night-say vote-say" aria-hidden="true"></div>
</section>`;
}

function quest(ctx) {
  const { t } = ctx;
  const q = t.quest;
  const lines = [q.secret, q.rule, q.q1, q.q1done, q.team2, q.hand, q.shuffle, q.fail, q.both, q.points];
  // Chapter 4 of the story line: the quest. The visitor turns the four quest cards over (quest.js). Without scripts this is a
  // plain section (the lines, both results, how a quest works). With reduced motion quest.js adds four real buttons.
  return `<section class="sec quest" id="quest">
  <div class="quest-static">
    <h2 class="h2">${esc(q.title)}</h2>
    <ol class="night-steps" role="list">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
    <div class="quest-plain" data-quest-plain></div>
    <p class="night-results">${esc(q.r1)}<br>${esc(q.r2)}</p>
    <p class="vh" aria-live="polite" data-quest-live></p>
    <h3 class="night-h3">${esc(q.howTitle)}</h3>
    <ul class="night-list" role="list">${[1, 2, 3, 4, 5].map((n) => `<li>${esc(q[`how${n}`])}</li>`).join('')}</ul>
  </div>
  <div class="night-live night-say quest-say" aria-hidden="true"></div>
</section>`;
}

function lady(ctx) {
  const { t } = ctx;
  const l = t.lady;
  const lines = [l.wakes, l.holds, l.looks, l.still, l.touch, `${l.shows} ${l.blue}`, `${l.never} ${l.might}`, l.evil, `${l.merlin} ${l.merlinWhy}`, `${l.moves} ${l.again}`];
  const img = (w) => `/assets/props/lady_of_the_lake-${w}.webp ${w}w`;
  // Chapter 5 of the story line: the Lady of the Lake. The visitor touches the water (lady.js). Without scripts this is a plain
  // section (the lines, a sentence, how the Lady works). With reduced motion lady.js adds a still lake and a real button.
  return `<section class="sec lady" id="lady">
  <div class="lady-static">
    <h2 class="h2">${esc(l.title)}</h2>
    <ol class="night-steps" role="list">${lines.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <img class="lady-art" src="/assets/props/lady_of_the_lake-640.webp" srcset="${img(320)}, ${img(640)}, ${img(960)}" sizes="(max-width:820px) 80vw, 340px" width="640" height="960" alt="" loading="lazy" decoding="async">
    <div class="lady-plain" data-lady-plain></div>
    <p class="night-results">${esc(l.result)}</p>
    <p class="vh" aria-live="polite" data-lady-live></p>
    <h3 class="night-h3">${esc(l.howTitle)}</h3>
    <ul class="night-list" role="list">${[1, 2, 3, 4, 5].map((n) => `<li>${esc(l[`how${n}`])}</li>`).join('')}</ul>
  </div>
  <div class="night-live night-say lady-say" aria-hidden="true"></div>
</section>`;
}

function climb(ctx) {
  const { t } = ctx;
  const c = t.climb;
  const L = t.lady;
  // Chapter 6 of the story line: the climb. Watch only. Without scripts this is a plain section (the lines, each quest's result,
  // how the game is won). With reduced motion the same lines show, the score circles fill as each line is reached, "Evil." is gold
  // and "Good has won." sits on a warm band (initClimbPlain in climb.js).
  const li = (text, at, cls = '') => `<li${at ? ` data-at="${at}"` : ''}${cls ? ` class="${cls}"` : ''}>${text}</li>`;
  const lines = [
    li(esc(c.q3lead)), li(esc(c.approved)), li(esc(c.q3cards), 3), li(esc(c.ladyAgain)),
    li(`${esc(c.red)} ${esc(c.truth)} <b class="climb-evil">${esc(L.evil)}</b>`), li(esc(c.q4lead)), li(esc(c.approved)), li(esc(c.q4rule)),
    li(esc(c.twoAll), 4), li(esc(c.ladyOnce)), li(esc(c.q5lead)), li(esc(c.bluff)), li(esc(c.q5done), 5), li(esc(c.won), 0, 'climb-won'),
  ];
  return `<section class="sec climb" id="climb">
  <div class="climb-static">
    <h2 class="h2">${esc(c.title)}</h2>
    <div class="climb-score" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i data-q="${n}"></i>`).join('')}</div>
    <ol class="night-steps" role="list">${lines.join('')}</ol>
    <p class="night-results">${esc(c.rLady)}<br>${esc(c.r3)}<br>${esc(c.r4)}<br>${esc(c.r5)}</p>
    <p class="vh" aria-live="polite" data-climb-live></p>
    <h3 class="night-h3">${esc(c.howTitle)}</h3>
    <ul class="night-list" role="list">${[1, 2, 3, 4].map((n) => `<li>${esc(c[`how${n}`])}</li>`).join('')}</ul>
  </div>
  <div class="night-live night-say climb-say" aria-hidden="true"></div>
</section>`;
}

function blade(ctx) {
  const { t } = ctx;
  const b = t.blade;
  // Chapter 7 of the story line: the blade. The visitor points it (blade.js). Without scripts this is a plain section (the opening lines,
  // ending A as text, how the last strike works). With reduced motion blade.js adds six real buttons and swaps the ending on a choice.
  return `<section class="sec blade" id="blade">
  <div class="blade-static">
    <h2 class="h2">${esc(b.title)}</h2>
    <ol class="night-steps" role="list">${[b.remains, b.evilWin, b.name, b.saw, b.where].map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
    <div class="blade-plain" data-blade-plain></div>
    <p class="night-results" data-blade-result>${esc(b.plainA)} ${esc(b.lost)}</p>
    <p class="vh" aria-live="polite" data-blade-live></p>
    <h3 class="night-h3">${esc(b.howTitle)}</h3>
    <ul class="night-list" role="list">${[1, 2, 3].map((n) => `<li>${esc(b[`how${n}`])}</li>`).join('')}</ul>
  </div>
  <div class="night-live night-say blade-say" aria-hidden="true"></div>
</section>`;
}

function seat(ctx) {
  const { t } = ctx;
  // Chapter 8 of the story line: your seat. With scripts it moves into the pinned hero and seat.js writes the lines over the empty
  // table. Without them (or with reduced motion) it is a plain section: the closing question and the friend line, then the plain draw.
  return `<section class="sec seat" id="seat">
  <div class="seat-static">
    <h2 class="h2" data-seat-q>${esc(t.seat.hidden)}</h2>
    <p class="lede">${em(t.seat.friend)}</p>
  </div>
  <div class="night-live night-say seat-say" aria-hidden="true"></div>
</section>`;
}

function draw(ctx) {
  const { t, config } = ctx;
  const deck = Array.from({ length: 3 }, () => backCard()).join('');
  const share = [
    ['whatsapp', 'WhatsApp'],
    ['facebook', 'Facebook'],
    ['threads', 'Threads'],
  ]
    .map(([id, label]) => `<a class="ghost" href="#" target="_blank" rel="noopener noreferrer" data-share="${id}" data-event="share_${id}">${label}</a>`)
    .join('');
  return `<section class="sec draw late" id="draw" data-state="idle">
  <div class="draw-in">
    <div class="deck" aria-hidden="true">
      ${deck}
      <div class="card is-down pick" data-pick><span class="halo"></span><div class="card-3d"><div class="card-side card-front"><div class="in"><img data-pick-img alt="" width="320" height="480" decoding="async"><div class="face"><span class="nm" data-pick-name></span><span class="sd" data-pick-side></span></div></div></div><div class="card-side card-back"><div class="in"><img src="/assets/cards/card-back-240.webp" srcset="/assets/cards/card-back-240.webp 240w, /assets/cards/card-back-480.webp 480w" sizes="200px" width="240" height="360" alt="" loading="lazy" decoding="async"></div></div></div></div>
    </div>
    <div class="panel">
      <div class="idle">
        ${eyebrow(t.draw.eyebrow)}
        <h2 class="h2" data-split>${em(t.draw.title)}</h2>
        <p class="lede" data-fade>${esc(t.draw.lede)}</p>
        <button class="btn" type="button" data-draw data-event="draw" data-magnet hidden>${esc(t.draw.button)} ${arrow}</button>
        <noscript><p class="lede">${esc(t.draw.noscript)}</p><a class="btn" href="${esc(waUrl(config.whatsappNumber, t.waMessage.general))}" target="_blank" rel="noopener noreferrer" data-event="wa_draw_noscript">${esc(t.hero.cta)} ${arrow}</a></noscript>
      </div>
      <div class="result" hidden>
        <span class="eyebrow"><i></i><span data-r-side>${esc(t.draw.resultEyebrow)}</span></span>
        <h2 class="h2" data-r-title tabindex="-1"></h2>
        <p class="lede" data-r-line></p>
        <a class="btn" href="#" target="_blank" rel="noopener noreferrer" data-r-wa data-event="wa_draw_result">${esc(t.draw.ask)}<span class="vh"> (${esc(t.a11y.newTab)})</span> ${arrow}</a>
        <div class="rule"></div>
        <div class="share-label">${esc(t.draw.shareLabel)}</div>
        <div class="share">${share}<button class="ghost" type="button" data-save data-event="share_save">${esc(t.draw.save)}</button><button class="ghost" type="button" data-copy data-event="share_copy">${esc(t.draw.copy)}</button></div>
        <input class="link-field" type="text" readonly hidden data-link-field aria-label="${esc(t.draw.linkField)}">
        <button class="link" type="button" data-draw data-event="draw_again">${esc(t.draw.again)} <span aria-hidden="true">↻</span></button>
      </div>
      <p class="vh" aria-live="polite" data-live></p>
    </div>
  </div>
</section>`;
}

function final(ctx) {
  const { t } = ctx;
  return `<section class="sec final late" id="join">
  ${eyebrow(t.final.eyebrow)}
  <h2 class="h1" data-split>${em(t.final.title)}</h2>
  <p class="lede" data-fade>${esc(t.final.lede)}</p>
  <div class="final-cta" data-fade>${waButton({ ctx, label: t.final.cta, event: 'wa_final', large: true, message: t.waMessage.seat })}</div>
</section>`;
}

// the card a visitor turned over in the hero ring, shown large in a dialog
function peek(ctx) {
  const { t } = ctx;
  return `<dialog class="peek" id="peek" aria-labelledby="peek-name">
  <div class="peek-shade"></div>
  <div class="peek-in">
    <div class="card peek-card is-down"><span class="halo" aria-hidden="true"></span><div class="card-3d"><div class="card-side card-front"><div class="in"><img data-peek-img alt="" width="640" height="960" decoding="async"></div></div><div class="card-side card-back" aria-hidden="true"><div class="in"><img src="/assets/cards/card-back-480.webp" width="480" height="720" alt="" loading="lazy" decoding="async"></div></div></div></div>
    <div class="peek-txt">
      <span class="side-l" data-peek-side></span>
      <h2 class="h2" id="peek-name" data-peek-name></h2>
      <p class="lede" data-peek-line></p>
      <button class="ghost" type="button" data-peek-close>${esc(t.peek.close)}</button>
      <p class="peek-hint" aria-hidden="true">${esc(t.peek.hint)}</p>
    </div>
  </div>
</dialog>`;
}

// Who sees whom, in seat numbers (0 to 9), so changing the deck order cannot break the night. Threads: the evil triangle
// first, then Merlin's, then Percival's (night.js expects that order).
function nightData(ctx) {
  const { t, deck, night } = ctx;
  const seatOf = (slug) => deck.findIndex((d) => d.role === slug);
  const kind = { merlin: "light", percival: "gold" };
  const sees = {};
  const threads = [];
  const has = (a, b) => threads.some((x) => (x[0] === a && x[1] === b) || (x[0] === b && x[1] === a));
  for (const [role, list] of Object.entries(night.sees)) {
    sees[seatOf(role)] = list.map(seatOf);
    for (const other of list) {
      const a = seatOf(role), b = seatOf(other), k = kind[role] || "red";
      if (!has(a, b) || k !== "red") threads.push([a, b, k]);
    }
  }
  const order = ["red", "light", "gold"];
  threads.sort((x, y) => order.indexOf(x[2]) - order.indexOf(y[2]));
  return { sees, threads, roles: deck.map((d) => d.role), text: t.night };
}

export function homePage(ctx) {
  const { t, roles, deck, config, locale, siteUrl, siteUrlIsReal } = ctx;
  return {
    title: t.meta.title,
    description: t.meta.description,
    ogImage: '/og/home.jpg',
    theme: '',
    bodyClass: 'page-home',
    body: [hero(ctx), how(ctx), deal(ctx), night(ctx), vote(ctx), quest(ctx), lady(ctx), climb(ctx), blade(ctx), seat(ctx), draw(ctx), final(ctx), peek(ctx)].join('\n'),
    data: {
      siteUrl: siteUrlIsReal ? siteUrl : '',
      prefix: locale.prefix,
      brand: config.brandName,
      whatsapp: config.whatsappNumber,
      text: {
        resultTitle: t.draw.resultTitle,
        share: t.share.text,
        waWithRole: t.waMessage.withRole,
        copy: t.draw.copy,
        copied: t.draw.copied,
        cardAlt: t.a11y.cardAlt,
        sides: { good: t.sides.goodLong, evil: t.sides.evilLong },
        sidesShort: { good: t.sides.good, evil: t.sides.evil },
      },
      night: nightData(ctx),
      vote: { text: t.vote, rounds: ctx.vote.rounds },
      quest: { text: t.quest, ...ctx.quest },
      lady: { text: t.lady, ...ctx.lady },
      climb: { text: t.climb, ...ctx.climb },
      blade: { text: t.blade, ...ctx.blade },
      seat: { text: t.seat },
      deck: deck.map((d) => ({ art: d.art, side: d.side, name: t.roles[d.role].name, line: t.roles[d.role].line })),
      roles: roles.map((r) => ({
        slug: r.slug,
        side: r.side,
        name: t.roles[r.slug].name,
        line: t.roles[r.slug].drawLine,
      })),
    },
  };
}

export { fill };
