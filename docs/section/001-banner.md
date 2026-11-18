# 001 Banner (hero, scroll story part 1)

**Status**: built and checked in the browser, waiting for the owner's hand check with a real mouse
**Spec**: [0001](../specs/0001-avalon-landing-page.md) (AC-6 and the hero row of the composition table)
**Code**: `src/templates/home.mjs` (`hero`, `peek`), `src/js/cards.js` (`hero`), `src/js/reveal.js`, `src/styles/main.css` (`/* 1 hero */`, `.peek`)

## Decisions made

| # | Decision | Why / who |
|---|---|---|
| 1 | The hero shows **ten face down cards on an oval** around the centre title "Avalon", turning slowly (about one lap a minute). | Owner's request, modelled on ellioteriksson.com |
| 2 | The ten cards are the ten player deck: Merlin, Percival, four Loyal Servants (2 male, 2 female), Assassin, Morgana, Mordred, Oberon. | Owner's request. Good and evil alternate around the ring (`src/data/deck.json`) |
| 3 | Cards stay **face down** while turning. | Keeps the mystery, so the later flip and the dark turn still land |
| 4 | **Hover stops the ring.** The hovered card lifts, stands upright and leans toward the cursor. Moving away starts the ring again. | Owner's request |
| 5 | **Click or tap a card**: it flies to the middle of the screen while flipping face up, and a dialog shows that character's art, name, side and one line. Click anywhere, Close, or Escape plays it backwards and returns the card. The ring waits while a card is out. | Owner's request, modelled on the anime.js modal dialog demo. Built with GSAP (already loaded) instead of adding anime.js |
| 6 | The centre copy is the title "Avalon", the line "Trust no one at the round table", the WhatsApp button and the "Draw your card" link. The longer pitch paragraph was removed from the hero. | Keeps the ring readable |
| 7 | Scroll pins the hero briefly, turns the ring faster, then the cards part and fade. **This exit is a placeholder.** | The real handoff comes with part 2 |
| 8 | Phone: taller oval, smaller cards, a tap opens the card (no tap to pause). | Touch has no hover |
| 9 | Reduced motion or no scripts: the ten cards sit still on the oval, and the dialog opens with a plain fade, card already face up. | AC-13, AC-17 |
| 10 | Cards in the ring are real `<button>` elements with an aria label ("Turn over card 3 of 10"). | Keyboard and screen reader access |
| 11 | The characters section and the draw keep **seven unique roles**. Only the hero uses ten. | Otherwise the draw would deal Loyal Servant four times in ten |
| 12 | Team badge on face up cards: see [002-badge](../images/002-badge.md). | Owner's request |
| 13 | **Title runners** (2026-11-17): the Ink runner and Merlin's apprentice take turns running across the letters of "Avalon", one run each, never together. Routes, endings and rules in [story_line.md](../scope/story_line.md#chapter-0-the-gate-cold-open-and-prologue) (chapter 0, item 4). A canvas inside `.copy` (`src/js/runner.js`), so they fade with the title; they stop when the hero leaves the screen or the tab is hidden. Reduced motion: the Ink runner stands still on the A. | Owner's request, picked from two playable prototypes |

## Story flow (owner's request, 2026-11-15)

The owner wants one scroll story from start to end, using `D:\Projects\P16-avalon\v1\avalon-site` as the model (pinned scenes one after another: gate, premise, round table, good versus evil, roles, quests, twist, finale). It is built in parts, each planned and approved before building.

- [x] **Part 1**: the hero ring and the turn-over dialog (this document)
- [x] **Part 2**: [002 The Gathering](002-gathering.md). Built 2026-11-15, owner has not yet judged the feel
- [x] **Part 3**: [003 The Unfolding](003-unfolding.md). Built 2026-11-15, owner has not yet judged the feel
- [x] **Part 4**: [004 The Deal](004-the-deal.md). The camera pulls back and the ten cards are dealt onto a round table (story line chapter 1 step 3). Built 2026-11-15, owner has not yet judged the feel

## Open items

- Judge the feel with a real mouse: ring speed, how far a hovered card lifts, how long the pin lasts, flip speed
- Part 2 plan
