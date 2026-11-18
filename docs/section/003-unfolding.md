# 003 The Unfolding (scroll story part 3)

**Change 2026-11-15 (owner's request, supersedes "ten cards, 5 by 2" below)**: the wall has **30 cards** (the ten real cards plus 20 face up copies of the same paintings that fly in from below), **no gaps** between cards, tilted as one plane (14 degrees back, 5 degrees round), and wider than the screen so the outer cards run off both sides. The wall is about 55% of the screen tall. Rows are chosen per screen size so the cards stay as big as possible and still cover the width (desktop 2 rows, tablet and phone 3). The ten real cards take the middle of the wall. Code: `measure()` and `frame()` in `hero()`, extras made in `home.mjs`
**Status**: built 2026-11-15 (`hero()` in `src/js/cards.js`, `how` template in `home.mjs`, `.hero.is-staged` in `main.css`). Checked at 1280x720 and 375 px by pictures, no sideways scroll. Not yet seen by hand with a real mouse. Built differently from the plan: with scripts, the `#how` section is moved into the pinned hero by `hero()` (and moved back on cleanup); with scripts off or reduced motion it stays a plain section after the hero. The plain mode has no flat grid of ten face up cards (the ring just sits still). The pin is 5 screens on desktop, 4.4 on phone (both 30% longer since [004](004-the-deal.md)). **Changed 2026-11-15 (owner's request)**: on phones and tablets (820 px wide and under) the three steps no longer swap one for another. They build up as a list: step 1 fades in, then step 2 fades in below it, then step 3 below that, and each stays. Each fade takes about 0.3 of a screen of scroll. Desktop is unchanged (all three side by side, the one being read is lit). Checked at 390x844, 360x640 (English and Malay, which fits with a margin), 768x1024 and 1280x720. Code: the `if (story)` block in `hero()` (`cards.js`) and the 820 px rules for `.hero.is-staged .step` in `main.css`
**Model**: premotio.com (the cards flow out of the middle, stack side by side, and the story text starts)
**Comes after**: [002 The Gathering](002-gathering.md). **Leads into**: [004 The Deal](004-the-deal.md) (2026-11-15: the pin is now 30% longer, the story steps aside and the camera pulls back from the wall to a round table)
**Code it will touch**: `src/js/cards.js` (`hero`, `how`), `src/templates/home.mjs` (`hero`, `how`), `src/styles/main.css`, `src/i18n/*.json`

## What the visitor sees

Still inside the same pinned stage as parts 1 and 2:

1. **Burst.** The packed drum opens. The cards peel off one after another and fly up and out.
2. **Stack.** Each card lands in its place in a wall: two rows of five, side by side, the whole wall tilted a little in 3D like the reference. The wall takes the top half of the screen.
3. **Story.** With the wall holding still, the story text appears below it: first the heading, then the three steps, one per stretch of scroll. The pin then lets go and the page scrolls on into the characters section.

## Decisions made (owner, 2026-11-15)

| # | Decision | Why |
|---|---|---|
| 1 | **The story text replaces the "How it works" section.** The heading, lede and three steps move under the card wall. The old section, its three face down stage cards and its own pin are removed. | Owner's choice. One story, no repeat |
| 2 | **Ten cards, face up**, in a 5 by 2 wall. | Follows from [002](002-gathering.md) |
| 3 | **CSS 3D with GSAP**, scroll driven. | Same as 002 |

## How it will be built

- **Wall pose.** The third pose in the frame loop (see 002). Each card has a row and a column; the wall as a whole is tilted with one `rotateX` / `rotateZ` on the parent, so the cards themselves stay flat and cheap to draw.
- **Order.** Cards leave the drum in drum order with a short stagger, so the wall fills left to right. Good and evil already alternate in `deck.json`, so the wall mixes blue and red badges.
- **Text.** The copy block from the `how` template moves into the stage and keeps its i18n keys (`how.title`, `how.lede`, `how.step1Title` ... `how.step3Body`), so no translation work is needed for the first build. The `#how` link target moves to the stage. Steps light up one at a time, as they do today.
- **Layout, desktop**: wall across the top half; below it the heading on the left and the three steps on the right.
- **Layout, phone**: wall on top (five small cards per row, allowed to run a little past the screen edges because of the tilt), heading and steps stacked below, as in the reference picture.
- **Reduced motion or no scripts**: a plain section after the hero. Ten face up cards in a flat grid, then the heading and the three steps. No pin.
- **Clean up**: `how()` in `cards.js` and the `.how-stage` styles go away. The characters pin and the theme turn are not touched.

## Scroll budget (desktop, in screens)

| Stretch | Length | What happens |
|---|---|---|
| Burst and stack | 1.2 | Drum opens, wall forms |
| Heading | 0.4 | Heading and lede appear |
| Three steps | 1.2 | One step per 0.4 |

## What "done" looks like

- From the packed drum, the ten cards end as a tidy 5 by 2 wall with every painting readable, at 1280 px and at 375 px
- Heading and all three steps can be read in English, Chinese and Malay with no overlap with the wall
- The "How it works" section no longer exists as its own section; `#how` still lands on the story text
- Scrolling back up returns wall to drum to ring
- With `?motion=off` and with scripts off, the cards and the three steps are all visible
- No sideways scroll; scripts stay under 130 KB compressed

## Open points

- The exact wording of the story text. First build reuses the current "How it works" copy. The owner may want new lines written for this scene
- Whether the wall cards should react to hover (lift, or open the turn-over dialog). Not planned for the first build
- The rest of the story order after this scene (characters, draw, final call) is not planned yet
