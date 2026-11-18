// Who is who at the table (owner request, 2026-11-16). Every seat card wears a small number. The seats the story is about right now
// (night.F, filled in by each chapter every frame) also wear a name with their team badge, so nobody has to memorise the deck, and
// the labels come and go with the scroll. On top of that any card can be asked: hover (mouse), tap (touch), click or keyboard focus
// opens a small card with the painting, the name and the team badge. Labels are a 2D overlay placed from each card's real box, so they
// follow it wherever the camera and the chapters put it. Only transform and opacity change per frame.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const html = (s) => {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild;
};
const BADGE = { good: '/assets/badges/good-96.webp', evil: '/assets/badges/evil-96.webp' };

export function createSeats({ sec, ring, night, slots, deck, sides }) {
  const { put } = night;
  const badgeOf = (d) => BADGE[d.side];
  const layer = html(`<div class="sn-layer" aria-hidden="true">${deck.map((d, i) => `<div class="sn"><i class="sn-n">${i + 1}</i><span class="sn-t"><img src="${badgeOf(d)}" alt="" width="18" height="18"><b>${i + 1} · ${esc(d.name)}</b></span></div>`).join('')}</div>`);
  const pop = html(`<div class="sn-pop" aria-hidden="true"><img class="sn-art" alt="" width="320" height="480"><div class="sn-meta"><img class="sn-bd" alt="" width="26" height="26"><div><b></b><span></span></div></div></div>`);
  sec.append(layer, pop);
  const items = [...layer.children].map((e) => ({ e, n: e.querySelector('.sn-n'), t: e.querySelector('.sn-t'), bd: e.querySelector('img') }));
  const art = pop.querySelector('.sn-art'), bd = pop.querySelector('.sn-bd'), nm = pop.querySelector('b'), sd = pop.querySelector('span');
  let open = -1, shown = -1, K = 0; // K: 0 to 1, how much the cards are at the table (cards.js, from the deal's progress). Everything here is off below it
  const offs = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };
  const slotOf = (el) => el.closest && el.closest('button.slot');
  const idx = (slot) => slots.indexOf(slot);

  // asking for a card: hover, tap or click, keyboard focus. While the table is up this replaces the card dialog (it is capture phase, so it runs first)
  on(ring, 'click', (e) => {
    const s = slotOf(e.target);
    if (!s || K < 0.5 || night.noAsk) return; // chapters 7 and 8 use the cards themselves (the blade's aim, the empty table); away from the table the card dialog of the hero ring is left alone
    e.stopImmediatePropagation();
    e.preventDefault();
    const i = idx(s);
    open = open === i ? -1 : i;
  }, true);
  slots.forEach((s, i) => {
    on(s, 'pointerenter', (e) => e.pointerType === 'mouse' && K >= 0.5 && !night.noAsk && (open = i));
    on(s, 'pointerleave', (e) => e.pointerType === 'mouse' && open === i && (open = -1));
    on(s, 'focus', () => K >= 0.5 && !night.noAsk && s.matches(':focus-visible') && (open = i));
    on(s, 'blur', () => open === i && (open = -1));
  });
  // a tap anywhere else closes it
  on(document, 'pointerdown', (e) => {
    if (open >= 0 && !slotOf(e.target)) open = -1;
  }, true);
  on(document, 'keydown', (e) => e.key === 'Escape' && open >= 0 && (open = -1));

  /** called by cards.js every frame, after the chapters. k: how much the cards are at the table, 0 (not at all) to 1. */
  function frame(k) {
    K = k;
    if (k < 0.003) {
      put(layer, 'v', 'hidden');
      put(pop, 'v', 'hidden');
      items.forEach((it) => put(it.e, 'v', 'hidden')); // each seat sets its own visibility, which would show through a hidden layer
      open = -1;
      return;
    }
    if ((k < 0.5 || night.noAsk) && open >= 0) open = -1;
    put(layer, 'v', 'visible');
    put(layer, 'o', (k * (1 - night.win)).toFixed(3)); // the win screen ("Good wins" / "Evil wins") shows alone
    if (night.win > 0.02 && open >= 0) open = -1;
    const sr = sec.getBoundingClientRect();
    let openRect = null;
    const placed = []; // name labels already put down this frame, so a crowd (a team in the middle) does not pile up
    const order = items.map((_, i) => i).sort((a, b) => night.F[b] - night.F[a]);
    order.forEach((i) => {
      const it = items[i];
      const r = slots[i].getBoundingClientRect();
      const so = parseFloat(slots[i].style.opacity);
      const seen = r.width > 6 && (Number.isNaN(so) || so > 0.05);
      if (!seen) return put(it.e, 'v', 'hidden');
      const cx = r.left + r.width / 2 - sr.left, cy = r.top + r.height / 2 - sr.top;
      const f = Math.max(clamp(night.F[i]), open === i ? 1 : 0);
      put(it.e, 'v', 'visible');
      put(it.e, 't', `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`);
      // the number fades while the card itself stands up face to face with the visitor
      const hid = 1 - clamp(night.HID[i]);
      put(it.n, 'o', (clamp(1 - night.FL[i] * 0.85 - f * 0.4) * hid).toFixed(3));
      let ty = cy + r.height * 0.42 + 6;
      if (f * hid > 0.25) {
        const tw = it.w || (it.w = it.t.offsetWidth || 90);
        for (let k = 0; k < 8; k++) {
          const hit = placed.find((p) => Math.abs(p.x - cx) < (p.w + tw) / 2 + 4 && Math.abs(p.y - ty) < 23);
          if (!hit) break;
          ty = hit.y + 23;
        }
        placed.push({ x: cx, y: ty, w: tw });
      }
      put(it.t, '--dy', `${(ty - cy).toFixed(1)}px`);
      put(it.t, 'o', (clamp(f * 1.4) * hid).toFixed(3));
      // a badge that would give away a reveal still to come stays hidden until then
      put(it.bd, 'o', (1 - clamp(night.NB[i])).toFixed(3));
      if (open === i) openRect = r;
    });
    // the asked-for card
    if (open < 0 || !openRect) {
      put(pop, 'v', 'hidden');
      shown = -1;
      return;
    }
    if (shown !== open) {
      shown = open;
      const d = deck[open];
      art.src = `/assets/cards/${d.art}-320.webp`;
      bd.src = badgeOf(d);
      nm.textContent = `${open + 1} · ${d.name}`;
      sd.textContent = sides[d.side];
      pop.classList.toggle('is-evil', d.side === 'evil');
    }
    const w = pop.offsetWidth || 150, h = pop.offsetHeight || 260;
    const cx = openRect.left + openRect.width / 2 - sr.left;
    const above = openRect.top - sr.top > h + 24;
    const x = clamp(cx, w / 2 + 8, sr.width - w / 2 - 8);
    const y = above ? openRect.top - sr.top - h - 8 : Math.min(sr.height - h - 8, openRect.bottom - sr.top + 8);
    put(pop, 'v', 'visible');
    put(pop, 't', `translate3d(${(x - w / 2).toFixed(1)}px,${Math.max(8, y).toFixed(1)}px,0)`);
  }
  function destroy() {
    offs.forEach((f) => f());
    layer.remove();
    pop.remove();
  }
  return { frame, destroy };
}
