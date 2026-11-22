// Scroll progress line at the very top (spec 016). One write per frame: a transform on one element.
// With motion it rides ScrollTrigger (the same scroll driver as the story, so it can never disagree with it).
// Without motion (reduced motion, no GSAP) it follows the plain page scroll, still with no easing.
export function initProgress({ animate }) {
  const bar = document.querySelector('.progress');
  const fill = bar && bar.firstElementChild;
  if (!fill) return;
  let last = -1;
  const set = (p) => {
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    if (p === last) return;
    last = p;
    fill.style.transform = `translate3d(${((p - 1) * 100).toFixed(3)}%,0,0)`;
  };
  if (animate) {
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => set(self.progress) });
    set(0);
  } else {
    let queued = false;
    const read = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      set(max > 0 ? window.scrollY / max : 0);
    };
    addEventListener('scroll', () => queued || ((queued = true), requestAnimationFrame(read)), { passive: true });
    addEventListener('resize', read);
    read();
  }
  bar.classList.add('on');
}
