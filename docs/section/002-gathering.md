# 002 The Gathering (scroll story part 2)

**Status**: built 2026-11-15 (`hero()` in `src/js/cards.js`, ring cards now have painted fronts). Checked at 1280 and 375 px by pictures, no sideways scroll, scroll back restores the ring. Not yet seen by hand with a real mouse. The pin is 230% for now; part 3 will lengthen it
**Model**: premotio.com (the cards arrange and pack into the middle of the screen)
**Comes after**: [001 Banner](001-banner.md). **Leads into**: [003 The Unfolding](003-unfolding.md)
**Code it will touch**: `src/js/cards.js` (`hero`), `src/templates/home.mjs` (`hero`), `src/templates/parts.mjs`, `src/styles/main.css` (`/* 1 hero */`), `src/js/reveal.js`

## What the visitor sees

The hero stays pinned. As the visidocs\sectiondocs\sectiontor scrolls:

1. **Scatter.** The title, the line and the buttons fade out. The ring breaks: the ten cards drift off the oval, tumble in 3D, and turn face up, so the paintings show for the first time.
2. **Pull in.** The cards are drawn toward the middle of the screen. Each one turns edge on to the viewer as it travels, so it looks like a thin blade.
3. **Packed.** The ten cards lock into a tight drum (a small upright cylinder, cards standing side by side like the pages of an open book). The drum turns slowly as the visitor keeps scrolling.

Scrolling back up plays all of it in reverse and gives the ring back.

## Decisions made (owner, 2026-11-15)

| # | Decision | Why |
|---|---|---|
| 1 | **Ten cards only.** The same ten ring cards do everything. No extra cards fly in. | Owner's choice. Lighter, and every card is a real character |
| 2 | **Cards turn face up as they leave the ring** and stay face up through part 3. | Owner's choice. More colour early, like the reference |
| 3 | **CSS 3D with GSAP**, no WebGL, no Three.js. No motion blur or colour fringes. | Keeps the script budget (130 KB) and works without WebGL |
| 4 | The motion follows the scroll (scrub). It does not play by itself. | Same as the reference and the rest of the page |

## How it will be built

- **One stage.** The hero section becomes the stage for parts 1, 2 and 3. Its pin grows from 90% of a screen to about five screens. The cards never leave this section, so there is no handoff between two sets of cards.
- **Three poses per card.** The frame loop in `hero()` already places every card from one angle. It gains two more poses: *drum* and *wall* (part 3). Scroll progress blends ring to drum to wall. Only `transform` and `opacity` change.
- **Drum pose.** Card `i` sits at `rotateY(i x 36deg)` and is pushed out from the centre by a small radius (a little under one card width), inside a parent with `perspective`. Scroll adds to the drum's turn.
- **Scatter.** Between ring and drum each card gets its own small offset (a fixed pseudo random drift, spin and delay taken from its index), so the ten do not move as one block. The values are fixed, so scrolling back looks the same every time.
- **Two sided ring cards.** Today the ring cards have only a back; the painting is loaded by the dialog. Each ring card gets a real front (art, name, team badge) built from `src/data/deck.json`. The ten paintings load lazily and are fetched ahead once the page has loaded.
- **The turn-over dialog** (part 1b) works only while the ring is whole. Once the scatter starts, the cards stop taking hover, taps and keyboard focus.
- **Phone**: same story, smaller drum, a shorter pin (about four screens).
- **Reduced motion or no scripts**: no pin and no scatter. The ring sits still as it does today, and part 3 shows as a plain block below it.

## Scroll budget (desktop, in screens)

| Stretch | Length | What happens |
|---|---|---|
| Hero hold | 0.5 | Ring turns faster, copy fades |
| Scatter and pull in | 1.2 | Cards flip, tumble, close in |
| Packed drum | 0.5 | Drum turns slowly |
| Part 3 | about 2.8 | See [003](003-unfolding.md) |

## What "done" looks like

- Scrolling down from the hero, the ten cards flip face up and end as one tight drum in the middle of the screen, at 1280 px and at 375 px
- Scrolling back up returns the ring with all cards face down, in the right slots, and the dialog works again
- No sideways scroll, no card cut off by the screen edge in the packed state
- With `?motion=off` the hero looks exactly as it does today
- Scripts stay under 130 KB compressed

## Open points

- Showing the paintings this early changes decision 3 in [001](001-banner.md) (face down keeps the mystery). The characters section further down still flips seven cards and turns the page dark at the Assassin. That surprise is now smaller. To be looked at when the later parts are planned
- Spec AC-6 and the hero row of the composition table need updating once this is built
