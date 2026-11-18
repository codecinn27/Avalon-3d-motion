// Motion base: smooth scroll (Lenis), ScrollTrigger wiring, text reveals, button magnet.
// Only transform and opacity are animated.
let lenis = null;

export function initMotion() {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'power3.out' });

  if (Lenis) {
    lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  return true;
}

/** Text and block reveals. Call after pinned sections exist, so positions are right. */
export function initReveals() {
  const { gsap, ScrollTrigger, SplitText } = window;
  const zh = document.documentElement.dataset.locale === 'zh';
  const inHero = (el) => Boolean(el.closest('.hero, .role'));

  // headings: by word for English and Malay, by line for Chinese (no spaces between words)
  document.querySelectorAll('[data-split]').forEach((el) => {
    const delay = inHero(el) ? 0.15 : 0;
    const trigger = inHero(el) ? null : { trigger: el, start: 'top 88%', once: true };
    if (!SplitText) {
      gsap.set(el, { visibility: 'visible' });
      gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.9, delay, scrollTrigger: trigger });
      return;
    }
    SplitText.create(el, {
      type: zh ? 'lines' : 'words,lines',
      mask: 'lines',
      linesClass: 'ln',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(zh ? self.lines : self.words, {
          yPercent: 112,
          duration: 1.1,
          ease: 'power4.out',
          stagger: zh ? 0.12 : 0.055,
          delay,
          scrollTrigger: trigger,
        });
      },
    });
  });

  // blocks: a soft rise and fade
  const fades = gsap.utils.toArray('[data-fade]');
  const heroFades = fades.filter(inHero);
  const rest = fades.filter((el) => !inHero(el));
  gsap.set(fades, { y: 22 });
  gsap.to(heroFades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09, delay: 0.35 });
  ScrollTrigger.batch(rest, {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, overwrite: true }),
  });

  // final call: the big line scales in as it arrives
  const finalTitle = document.querySelector('.final .h1');
  if (finalTitle && document.querySelector('.page-home')) {
    gsap.fromTo(finalTitle, { scale: 0.8 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top 95%', end: 'top 25%', scrub: 0.4 } });
  }

  initMagnet();
}

/** Buttons lean toward the pointer and press in. Desktop pointers only. */
function initMagnet() {
  const { gsap } = window;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnet]').forEach((btn) => {
    btn.style.transition = 'none';
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    btn.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
      gsap.to(btn, { scale: 1, duration: 0.4, overwrite: 'auto' });
    });
    btn.addEventListener('pointerdown', () => gsap.to(btn, { scale: 0.96, duration: 0.2, overwrite: 'auto' }));
    btn.addEventListener('pointerup', () => gsap.to(btn, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)', overwrite: 'auto' }));
  });
}

/** Stop page scrolling while a dialog is open, and start it again after. */
export function lockScroll(on) {
  if (lenis) on ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = on ? 'hidden' : '';
}

/** After pins are in place, land on the hash target (for example /#draw from a role page). */
export function settleHash() {
  const { ScrollTrigger } = window;
  if (!location.hash || location.hash.length < 2) return;
  let target = null;
  try {
    target = document.querySelector(location.hash);
  } catch {
    return;
  }
  if (!target) return;
  ScrollTrigger.refresh();
  if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
  else target.scrollIntoView();
  ScrollTrigger.update();
}

/** Scroll to a page position (Lenis when it is running). Used by "See the other ending" and the hero's draw link. */
export function goTo(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
