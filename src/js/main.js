// Entry point. Each feature lives in its own small module.
// Order matters: language and draw work with no motion library at all.
import { initLang } from './lang.js';
import { initTheme } from './theme.js';
import { initShader } from './shader.js';
import { initDraw } from './draw.js';
import { initMotion } from './motion.js';
import { initCards } from './cards.js';
import { initQuestPlain } from './quest.js';
import { initLadyPlain } from './lady.js';
import { initClimbPlain } from './climb.js';
import { initReveal } from './reveal.js';
import { initBladePlain } from './blade.js';
import { drawLink } from './seat.js';
import { initRunner } from './runner.js';
import { initMusic } from './music.js';
import { initProgress } from './progress.js';

const root = document.documentElement;
const reduced = root.classList.contains('rm');
const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
const safe = (name, fn) => {
  try {
    return fn();
  } catch (err) {
    console.error(`[avalon] ${name} failed`, err);
    return undefined;
  }
};

safe('lang', () => initLang());
const shader = safe('shader', () => initShader({ reduced, still: root.classList.contains('lite') }));
const theme = safe('theme', () => initTheme({ shader }));

let motionOn = false;
if (hasGsap && !reduced) {
  motionOn = safe('motion', () => initMotion()) === true;
}
const draw = safe('draw', () => initDraw({ animate: motionOn }));
if (motionOn) safe('cards', () => initCards({ theme, draw }));
if (!motionOn) {
  // No motion library, or reduced motion: show everything plainly.
  root.classList.remove('motion');
  safe('theme-scroll', () => theme && theme.followScroll());
  safe('quest-plain', () => initQuestPlain());
  safe('lady-plain', () => initLadyPlain());
  safe('climb-plain', () => initClimbPlain());
  safe('blade-plain', () => initBladePlain());
}
// the two small figures that take turns running across the hero title (first section only)
safe('runner', () => initRunner({ animate: motionOn }));
safe('music', () => initMusic({ reduced }));
// with the pin, the hero's "Draw your card" link goes to the draw on the table; without it the link jumps to the plain draw section
document.querySelectorAll('a[href="#draw"]').forEach((a) => a.addEventListener('click', (e) => drawLink.go && drawLink.go() && e.preventDefault()));
safe('progress', () => initProgress({ animate: motionOn }));
safe('reveal', () => initReveal({ animate: motionOn }));
root.classList.add('ready');
