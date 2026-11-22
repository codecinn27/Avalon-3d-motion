# 016 Scroll progress indicator

**Status**: plan written 2026-11-22, updated the same day with the pen's code the owner pasted. **Not built.** Waiting for the owner's go to build (and the owner's pick on the colour cycle, see [Open points](#open-points)).
**Reference**: https://codepen.io/kirankumargonti/pen/yLOadgw. CodePen refused the assistant's fetch (HTTP 403), so the owner pasted its HTML, CSS and JS. What the pen does is in [The reference pen](#the-reference-pen-as-pasted-and-what-is-kept).
**Code it touches (planned)**: `src/templates/layout.mjs` (one empty element), `src/styles/main.css` (the bar), `src/js/main.js` (wiring), one small new module `src/js/progress.js` (only if the CSS-only path is not available, see [How it moves](#how-it-moves)). No new library.
**Rule from the owner (2026-11-22)**: add this new CSS animation, and it **must not hurt performance**. The phone stays smooth, with no stutter. This plan is judged against [013](013-performance_mobile.md)'s ship rule, not against looks alone.

## Summary

A thin line fixed to the **very top edge, full width**, that fills from left to right as the visitor scrolls the story from the first screen to the last. **Plain progress only**: one track, one fill, no chapter ticks (owner's answers, 2026-11-22). It is decoration plus orientation, never a control: not focusable, not tappable, `aria-hidden`.

## Decisions (owner, 2026-11-22)

| # | Decision | Why |
|---|---|---|
| 1 | Placement: **very top edge, full width**, a few px tall | Owner. Sits above the nav pill (z 60) and music button (z 61), and above the chapter score bar, which sits lower in the page |
| 2 | **Plain progress only**, no chapter markers | Owner. Lightest option, nothing to position or measure per chapter |
| 3 | Look: **as the reference pen**: 6px bar, blue to teal gradient, rounded end, colours cycling | Owner, pasted code 2026-11-22 |
| 4 | **Same look, cheaper way to draw it.** Where the pen's method costs performance (below), the method changes and the look stays | Owner's rule: no stutter on the phone |

## The reference pen, as pasted, and what is kept

The pen is a `div#progress-bar` fixed at the top, plus a long text.

```css
.progress-bar { position: fixed; top: 0; width: 0; height: 6px; z-index: 2;
  background: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
  animation: progress 1s linear infinite; border-radius: 5px; }
@keyframes progress { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
```
```js
window.onscroll = () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  document.getElementById("progress-bar").style.width = (winScroll / height) * 100 + "%";
};
```

**Kept (the look):** 6px tall, fixed at the top, gradient `160deg #0093e9 → #80d0c7`, 5px rounded end, colours that cycle through the hues once a second.

**Changed (the method), and why each one would hurt this page:**

| Pen does | Problem here | This build does |
|---|---|---|
| `style.width = x%` on every scroll event | `width` forces **layout** every frame. This page already stutters from main-thread work (013) | The fill is a full-width element moved with `transform: translate3d(x, 0, 0)`. Compositor only, no layout, no paint |
| `window.onscroll` reading `scrollHeight` and `clientHeight` each event | Two **layout reads** per event. And on phones `normalizeScroll` and Lenis drive the scroll, so the browser's own `scrollTop` and the drawn story can disagree. One `onscroll` also replaces any other one | One ScrollTrigger (or a scroll timeline, see below). The total length is read once after the pins exist and again on resize, never in a frame |
| `animation: hue-rotate(0 → 360deg) 1s linear infinite` | `filter` makes an **off-screen surface** that is redrawn every frame, forever, even with no scrolling. 013 CP-3, CP-5 and CP-11 found exactly these surfaces behind the freezes on the phone | No `filter`. The colour cycle is drawn as a long gradient strip that **slides** with `transform` (see "The colour cycle"), or is dropped on phones if the measurement says so |
| `border-radius: 5px` on a bar whose width changes | With `scaleX` the rounded end would squash. With `width` it forces layout | The fill slides in from the left (`translateX(-100% → 0)`), so its right end keeps its real rounded shape and nothing is scaled |
| `z-index: 2` | Would sit under the nav (60) and music (61) | `z-index: 70`, clear of the nav pill, which starts 16px lower |

### The colour cycle (the one thing that needs the owner's pick)

The pen's most visible trait is the colours turning. The cheapest ways to get the same look, best first:

1. **A gradient strip that slides.** The fill holds a child 200% wide whose gradient is the pen's two colours plus the hues in between and back to the start (a seamless loop). A CSS animation moves the child with `translateX(0 → -50%)` over a few seconds, `linear infinite`. `transform` only, so it runs on the compositor with no filter surface. The fill needs `overflow: hidden` to hold it, a 6px clip. 013 found big rounded clips costly; a 6px one is tiny but **the build measures it**.
2. **Colour follows the scroll, not the clock.** The same strip moves with the progress (one more `transform` in the same write). No infinite animation at all, so a still page does zero work. Looks like the colour flowing as you scroll instead of running by itself.
3. **Static gradient** (the pen's two colours, no cycling). Zero extra work. The fallback if 1 or 2 shows any cost on the phone.

The plan builds **1 on desktop** and **measures it on the phone**. If the phone shows any cost (any column worse, see the table), phones (`html.lite`) get 2, then 3. The owner says if they prefer 2 or 3 everywhere.

## Performance rules (the part that matters most)

The page is already heavy on phones (013: 3D rings, pins, a WebGL backdrop, `normalizeScroll` running scroll from JavaScript). A badly built bar would add work to every frame. So:

1. **Only `transform` and `opacity` change.** The fill is a full-width element that is moved or scaled with `transform: scaleX(0..1)` (`transform-origin: left`). Never `width`, `left` or `background-position`, which force layout or repaint every frame. This matches the motion rule already stated at the top of `motion.js`.
2. **One element, one layer.** `position: fixed; top: 0; left: 0; right: 0; height: 3px; pointer-events: none;` and `will-change: transform` on the fill only. That is **one extra GPU layer** on a page that 013 has brought down to about 89 on phones. No box shadow, no blur, no `backdrop-filter`, no `mix-blend-mode`, no gradient animation, no filter. (013 CP-1 to CP-12 showed that exactly these make off-screen surfaces and freezes.)
3. **No layout reads, no work in the scroll handler beyond one write.** The total scroll length is read once after the pins exist, and again on resize (`ScrollTrigger` already refreshes then), never inside a frame. The per-frame work is a single `transform` write.
4. **No second scroll listener fighting the first.** The page already has one scroll driver (Lenis on desktop, GSAP `normalizeScroll` on phones, both feeding ScrollTrigger). The bar must ride on that, not add its own `scroll` event listener, or it will read a different scroll position than the pinned story (on phones the real scroll offset and the drawn one differ under `normalizeScroll`).
5. **Respect reduced motion and `?motion=off`.** With `html.rm` the fill still reflects position but changes without any easing (no transition). Scripts off: the element is hidden (no JS, nothing to drive it).
6. **Do not animate through a CSS `transition` on a value that changes every frame.** Easing on top of Lenis's own smoothing would make the bar lag behind the page and cost extra style recalcs. The scrub is direct.

## How it moves

Two ways. The plan picks one after the check below, and the check is the **first step of the build**.

**Option A, CSS only (preferred if it works here):** `animation-timeline: scroll(root)` on the fill, with a `scaleX(0 → 1)` keyframe. It runs on the compositor, no JavaScript per frame, which is the best case for a phone. **Risk:** this page does not scroll the way a normal page does. On phones `ScrollTrigger.normalizeScroll` takes the touch scroll into JavaScript, and Lenis smooths the wheel. A native scroll timeline follows the browser's own scroll offset, which may not match what the pinned story draws. Support is also uneven (Chrome and Edge yes, Safari and Firefox no or behind a flag), so it needs a fallback anyway.

**Option B, one ScrollTrigger (the safe default, and the fallback for A):** a single `ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => fill.style.transform = 'scaleX(' + self.progress + ')' })`, or `gsap.to(fill, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } })`. It rides the scroll driver the story already uses, so it can never disagree with the story, and it adds one write per frame. `scrub: true` (no number) means no extra smoothing lag.

**Decision rule for the build:** try A on the Honor X9b (the test phone in 013). If the fill's position matches the story's position at the start, middle and end, use A, with B for browsers without `animation-timeline`. If it drifts, use B alone. Either way the visible result is the same.

## Look (decided from the pen)

6px high, fixed at the top, full width track (no visible track, only the fill), gradient `160deg #0093e9 → #80d0c7`, 5px rounded right end, colours cycling (see above). No glow, no shadow, no text.

- **Colour on the two pages.** The pen is on black. This page is cream in the light parts and dark at night. Blue to teal reads well on the dark parts. On cream the light teal end is softer, but at 6px the bar stays visible, so the pen's colours are kept as the owner chose. The build checks it by eye on both and the owner can ask for a deeper teal end.
- A fixed 6px at the very top touches nothing: the nav pill starts 16px down and nothing else is at the top edge. The chapter score bar sits lower in the page (it is not at 0px).
- Any effect added later that is costly on a phone (glow, blur, `box-shadow`, `filter`) is not allowed (see the rules above).

## Build steps (after the owner's go)

1. Freeze the current build as the "before" in `perf/builds/` (013's method).
2. Add `<div class="progress" aria-hidden="true"><i><b></b></i></div>` to the layout (home page only, since role pages are one screen long): `i` is the sliding fill, `b` the colour strip.
3. Add the CSS (the rules above plus the pen's look and the strip's keyframes, `transform` only). Check it draws at 360, 390 and 1280 px wide with scripts off (hidden, no empty bar left behind).
4. Pick option A or B with the check above. Wire it in `main.js` after the pins exist.
5. Check: it reaches 0 at the very top and 1 at the very bottom, rewinds when scrolling up, stays right after a resize and a language switch, and does not overlap the nav, the music button or the score bar at 360 px wide.
6. Check `?motion=off` and `?lite=1`.
7. **Measure on the phone against the build before it** (013's method): `node scripts/perf-phone.mjs --before perf/builds/<last> --after dist --runs 3`. The new column goes into the comparison table below.
8. Run `npm test`. Build, then freeze the build into `perf/builds/` as 013 does.

## Acceptance

| # | Check | Pass when |
|---|---|---|
| 1 | Reaches both ends | 0 at the top of the page, 1 at the end of the footer |
| 2 | Matches the story | At the pinned chapters the fill is where the scroll is, not ahead or behind (A: compare by eye with the story; B: by construction) |
| 3 | No layout or paint work | DevTools Performance: the bar shows only compositor updates, no Layout and no Paint per frame |
| 4 | Layers | One extra layer, no more. The layer count in the phone run goes up by 1 at most |
| 5 | Phone smoothness | Against the build before it, in the same session with ranges apart or overlapping: average fps not lower (within the run spread), freezes over 50 ms not more, p95 not worse. **If any of these is worse, the bar is reverted or simplified, not shipped.** |
| 6 | No overlap | Clear of the nav, the music button and the score bar at 360x640, 390x844 and 1280x720 |
| 7 | Reduced motion and scripts off | No easing in `rm`; hidden with scripts off |
| 8 | Accessible | `aria-hidden`, not focusable, no pointer events, no new text to translate |
| 9 | Three languages | Nothing to translate, so nothing to add to `en.json`, `zh.json` or `ms.json` |

## Measurement table (filled during the build)

Same template as 013. The baseline column is the build just before the bar.

| Measure | Smooth (ship) | Acceptable | Laggy | Before the bar | **With the bar** |
|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | | |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | | |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | | |
| Dropped frames | < 5% | 5–15% | > 15% | | |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | | |
| GPU layers | < 50 | 50–100 | > 200 | | |

## Open points

1. **The colour cycle on phones.** Plan builds the sliding gradient strip (1) everywhere and measures it. Owner to say now if they would rather start from 2 (colour follows the scroll) or 3 (static) on phones.
2. **Option A or B** is settled by the first check in the build, on the real phone. If the owner wants no experiment, B is chosen straight away (safe on every browser, one write per frame).
3. **Role pages** (the 21 share pages): the plan leaves the bar off them, since they are one screen. Say so if you want it there too.

## Not in this plan

- Chapter ticks or labels (owner chose plain progress).
- A percentage number, a back to top button, or a clickable bar.
- Any change to the pinned story, its lengths, or `normalizeScroll`.
