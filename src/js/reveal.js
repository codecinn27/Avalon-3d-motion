// Click a card in the hero ring: it flies from its place on the ring to the
// middle of the screen, turning over on the way, and shows its character in a
// dialog. Closing plays the same move backwards and puts the card back.
import { lockScroll } from './motion.js';

/** The ring reads this each frame, so it stays still while a card is out. */
export const ringState = { held: false };

export function initReveal({ animate = false } = {}) {
  const dialog = document.getElementById('peek');
  const dataEl = document.getElementById('page-data');
  const slots = [...document.querySelectorAll('.ring button.slot')];
  if (!dialog || !dataEl || !slots.length || typeof dialog.showModal !== 'function') return;
  const { deck, text } = JSON.parse(dataEl.textContent);
  const gsap = animate ? window.gsap : null;
  const $ = (q) => dialog.querySelector(q);
  const el = {
    shade: $('.peek-shade'), card: $('.peek-card'), flip: $('.peek-card .card-3d'), halo: $('.peek-card .halo'),
    img: $('[data-peek-img]'), side: $('[data-peek-side]'), name: $('[data-peek-name]'), line: $('[data-peek-line]'),
    txt: $('.peek-txt'), close: $('[data-peek-close]'),
  };
  let tl = null;
  let from = null; // the slot the open card came from
  let busy = false;

  function fill(card) {
    el.card.classList.toggle('evil', card.side === 'evil');
    el.card.classList.toggle('good', card.side === 'good');
    dialog.classList.toggle('evil', card.side === 'evil');
    el.side.textContent = text.sides[card.side];
    el.name.textContent = card.name;
    el.line.textContent = card.line;
    el.img.alt = text.cardAlt.replace('{role}', card.name);
    el.img.srcset = `/assets/cards/${card.art}-320.webp 320w, /assets/cards/${card.art}-640.webp 640w`;
    el.img.sizes = '(max-width:820px) 60vw, 320px';
    el.img.src = `/assets/cards/${card.art}-640.webp`;
  }

  /** Where the slot's card sits right now, relative to the big card's resting place. */
  function startPose(slot) {
    const small = slot.querySelector('.card');
    const s = small.getBoundingClientRect();
    const b = el.card.getBoundingClientRect();
    const t = slot.style.transform || '';
    const rot = parseFloat((t.match(/rotate\(([-\d.]+)deg\)/) || [])[1]) || 0;
    const scale = parseFloat((t.match(/scale\(([\d.]+)\)/) || [])[1]) || 1;
    return {
      x: s.left + s.width / 2 - (b.left + b.width / 2),
      y: s.top + s.height / 2 - (b.top + b.height / 2),
      scale: (small.offsetWidth * scale) / el.card.offsetWidth,
      rotation: rot,
    };
  }

  function open(slot) {
    if (busy || dialog.open) return;
    const card = deck[Number(slot.dataset.card)];
    if (!card) return;
    from = slot;
    ringState.held = true;
    fill(card);
    dialog.showModal();
    lockScroll(true);
    el.close.focus({ preventScroll: true });

    if (!gsap) {
      el.card.classList.remove('is-down');
      slot.classList.add('is-out');
      if (dialog.animate) dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
      return;
    }

    busy = true;
    gsap.set(el.card, { clearProps: 'transform' });
    const pose = startPose(slot);
    slot.classList.add('is-out');
    tl = gsap.timeline({ onComplete: () => (busy = false) });
    tl.fromTo(el.shade, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo(el.card, pose, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.9, ease: 'power3.inOut' }, 0)
      .fromTo(el.flip, { rotationY: 180 }, { rotationY: 0, duration: 0.9, ease: 'power2.inOut' }, 0.05)
      .fromTo(el.halo, { opacity: 0 }, { opacity: card.side === 'evil' ? 1 : 0, duration: 0.6 }, 0.6)
      .fromTo(el.txt.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, 0.55);
  }

  function finish() {
    dialog.close();
    lockScroll(false);
    ringState.held = false;
    busy = false;
    if (from) {
      from.classList.remove('is-out');
      from.focus({ preventScroll: true }); // keep the keyboard where it was
      from = null;
    }
  }

  function close() {
    if (!dialog.open) return;
    if (!gsap || !tl) {
      el.card.classList.add('is-down');
      finish();
      return;
    }
    busy = true;
    tl.eventCallback('onComplete', null);
    tl.eventCallback('onReverseComplete', finish);
    tl.timeScale(1.25).reverse();
  }

  slots.forEach((slot) => slot.addEventListener('click', () => open(slot)));
  dialog.addEventListener('click', close); // click anywhere, the card goes back
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault(); // Escape: play the way back first, then close
    close();
  });
}
