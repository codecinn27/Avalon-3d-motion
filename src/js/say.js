// The words of the vote and the quest (specs 006, 007). Same idea as the night's (005 decision 10): one element per line, and
// the line coming in and the line going out slide and fade over a stretch of scroll on the hero timeline. Never on a timer.
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * beats: [[time, bold, italic?], ...] in the timeline's own units. A line is on from its time and off when the next one comes;
 * the last one stays. Returns the line elements.
 */
export function sayLines(gsap, tl, box, beats, { inLen = 0.12, outLen = 0.09 } = {}) {
  box.innerHTML = beats.map((b) => `<p class="ns"><b>${esc(b[1])}</b>${b[2] ? `<span>${esc(b[2])}</span>` : ''}</p>`).join('');
  const lines = [...box.children];
  gsap.set(lines, { autoAlpha: 0, y: 22 });
  lines.forEach((el, k) => {
    tl.fromTo(el, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: inLen, ease: 'power2.out', immediateRender: false }, beats[k][0]);
    // from-to, so a line that is still coming in when the next one is due still leaves
    if (k + 1 < lines.length) tl.fromTo(el, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -18, duration: outLen, ease: 'power1.in', immediateRender: false }, Math.max(beats[k][0] + inLen, beats[k + 1][0] - outLen));
  });
  return lines;
}
