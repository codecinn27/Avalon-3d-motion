# 006 The Vote (scroll story part 6, chapter 3)

**Status**: **DONE**, built 2026-11-16 (with 007, one pass). Checked at 1280x720, 390x844 and 360x640 in English, Chinese and Malay, no console errors. Still to do: the owner's look with a real mouse and phone, frame rate on a mid range phone (AC-14), native read of the Chinese and Malay words. As built: `src/js/vote.js`, `say.js` (shared word lines), night.js now shares its camera and plane (`night.X`, `after`, `late`, `planes`); the bar sits under the nav, words move down by `--bar-h`; the vote cards are 48x72 design px at 0.55 of the seat radius; the count pill sits at the middle.
**Story**: [story_line.md](../scope/story_line.md), chapter 3 The Vote. Rule shown: the leader picks, everyone votes in the open, more than half must approve (a tie rejects), five rejects in a row and evil wins. Visitor: watches.
**Model**: the same pinned stage and round table as [004](004-the-deal.md) and [005](005-the-night-falls.md).
**Comes after**: [005 The Night Falls](005-the-night-falls.md), which ends wide, cream page, all cards face down, seat 1 at the front. **Leads into**: [007 The Quest](007-the-quest.md) (planned 2026-11-16, to be approved and built together with this part). Chapter 4 starts from the table as this part leaves it: wide view, the second team on the table, one reject track empty.
**Code it will touch**: new `src/js/vote.js`, `src/js/cards.js` (`hero`: the frame loop and timeline get a fourth number), `src/templates/home.mjs` (a `vote` template), `src/styles/main.css`, new `src/data/vote.json`, `src/i18n/*.json`. Vote card pictures already exist in `src/assets/props/` ([003-props](../images/003-props.md))
**Prototype**: the owner chose from Vote Chapter Options (https://claude.ai/artifact/THZuxP5kNMMmHDyRybnDuo, private)

## Decisions made (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 1 | **The zoom from chapter 2 into 3 is a dive to the leader's seat (option A).** Seat 1 is already at the front after dawn. The camera drops onto it, the crown lands, then the camera pulls back wide. The table never leaves, so the set stays the same for chapters 2 to 7 | Owner |
| 2 | **The score track and the reject track are a fixed bar at the top of the screen (option B).** Flat rows facing the visitor: five quest circles and five reject marks. They appear in this chapter and stay for chapters 4 to 7 | Owner |
| 3 | **The ten votes are cards laid at each seat and flipped together (option A).** Each seat lays one vote card face down in front of it, then all ten turn over at the same moment. Keeps who voted what, which is the "in the open" rule | Owner |
| 4 | **The crown is CSS 3D gold**, built like the night's crystals (no picture), bobbing slightly | Owner |
| 5 | **Watch only.** No taps, no seats to open (same as chapter 2). Scrolling plays it, scrolling back rewinds it | Story line, [005](005-the-night-falls.md) decision 9 |
| 6 | **CSS 3D with GSAP, no WebGL, no new pictures.** Transform and opacity only (AC-8). Words and colour follow the scroll, never a timer (005 decision 10) | Same as 002 to 005 |

## What the visitor sees

Still inside the pinned hero stage, after the dawn. Team sizes are the real ones for ten players (quest 1 takes three).

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **A leader** | "Each round, one player leads." | Dive onto seat 1 (about 3x), then pull back wide | The crown drops onto seat 1 and bobs. The quest and reject bar slides in at the top, all empty |
| 2 | **The first team** | "The leader picks who goes on the quest." | Wide | Seat 1 pushes three cards to the middle (seats 1, 5, 8, proposed). They lift and glow gold |
| 3 | **Everyone votes** | "Every player holds two cards: Approve and Reject." | Wide from above | Each seat lays one vote card face down in front of it |
| 4 | **All at once** | **Everyone votes. All at once. In the open.** | Wide, a small push in | All ten turn over at the same moment: four Approve (white sphere), six Reject (black sphere). A count lands: 4 to 6 |
| 5 | **Rejected** | "Rejected. The crown moves on." **Five rejected teams in a row, and evil wins without lifting a blade.** | Quick push in on the crown, then wide | The vote cards fade, the three team cards go back, the crown slides to seat 2 and the first reject mark on the bar lights red |
| 6 | **A second team** | "The new leader picks again." | Wide | Seat 2 (the Assassin) pushes three to the middle: seats 2, 3 and 10 (proposed). As seat 2's card joins, the seat flickers red for a moment, for the visitor's eyes only |
| 7 | **Approved** | "Seven Approve. Three Reject. Approved." | Wide, small push in | Ten new vote cards are laid and turned together: seven Approve, three Reject. The reject mark clears. The team stays in the middle for chapter 4 |

Seven steps. The order is fixed. Scrolling back up plays all of it in reverse.

### Scroll budget (about 2.5 screens on a desktop, 2.1 on a phone)

| Stretch | Screens |
|---|---|
| Dive, crown, bar slides in | 0.45 |
| First team | 0.30 |
| Cards laid, all ten turn, count | 0.55 |
| Rejected, crown moves, first mark | 0.35 |
| Second team and the red flicker | 0.35 |
| Second vote, approved | 0.50 |

`VOTE` is a fourth number in the frame loop after `NIGHT`, using the same unit as 004 and 005 (`units / 36.6 x 4` screens, phone `x 3.4`). The hero pin grows by about 2.5 screens.

## The dive (decision 1)

Reuse the night's camera object `{ a, fr, dz, tilt, ty }` ([005](005-the-night-falls.md)). The dive is one more camera move at the very end of the dawn: `a` stays at seat 1 (already in front), `fr` goes to 1, `dz` grows to about 3x and `tilt` rises to 48. Then `dz` and `tilt` ease back to wide while the crown lands. The dive starts while dawn's last light is still returning, so the visitor is already falling toward seat 1 as the page turns cream. The perspective growth from [005](005-the-night-falls.md) decision 12 is reused, so the close up stays a long lens shot and the card is not stretched (cards keep `scale3d`).

## The crown (decision 4)

Eight to ten flat faces with `clip-path`, gold, shaded one by one, five points. About 60 design pixels wide, hovering 140 design pixels above the seat like the night's crystals, bobbing slowly. Lands with a short drop and a soft shadow on the card. One crown element, moved seat to seat by `transform` (same technique as the shared crystals). Phone: same crown, slower bob.

## The bar (decision 2)

A fixed strip at the top of the hero stage, two rows: "Quests" with five circles (blue outline), "Rejects" with five marks (red outline). Marks light by `opacity` and a colour class swap (a cross-fade between two stacked elements, no per frame filter). It slides in from above in step 1 and stays after the chapter ends. Needs the words block to sit below it ([open point 1](#open-points)). Wide enough at 360 px: five circles of 20 px each with 8 px gaps per row.

## The vote cards (decision 3)

- The Approve and Reject pictures are in `src/assets/props/`. The build makes small WebP files from them (the 003 notes say this is not wired yet).
- Each seat gets one vote card element (back = role card back, front = Approve or Reject picture). It sits on the table in front of the seat, closer to the middle, face down. Ten elements are reused for both votes by swapping the front picture.
- The flip is a `rotateY` on each card, all ten at the same scroll position. Cards use `scale3d` like the rest, and are built at 2x and scaled by 0.5 for sharpness (005, sharpness).
- The count ("4 to 6") is one small element at the middle of the table that fades in as the cards turn.
- Who votes what is data (`src/data/vote.json`), by seat number: round 1 Approve on seats 1, 3, 5, 8 (proposed), round 2 Approve on seats 1, 2, 3, 5, 6, 8, 10 (proposed; seven). The data is chosen so it feels believable: the Assassin approves the team he is on.
- The ring of ten seat elements, the draw order fix and the `is-flat` ring from [005](005-the-night-falls.md) "As built" stay: the vote cards go in the cards layer, above the table and below the crown.

## How it is built

- **A fourth number in the frame loop.** `v` runs 0 to 1 after `n`. Timeline length becomes `1 + DEAL + NIGHT + VOTE`; pin length `innerHeight x screens x (1 + DEAL + NIGHT + VOTE)`. Every earlier position is unchanged.
- **New `src/js/vote.js`** (target at most 6 KB compressed). It owns the crown, the bar, the ten vote cards, the team lift and the red flicker. `hero()` calls `vote.frame()` once per tick; `vote.build(tl, at)` adds the tweens to the hero timeline, like `night.build`.
- **Words**: one element per line, cross fading and sliding over a stretch of scroll on the same timeline (005 decision 10). Keys under `vote` in `en.json`, `zh.json`, `ms.json` (Chinese and Malay are the assistant's wording, to be read by a native speaker).
- **Cleanup**: `hero()`'s cleanup removes everything `vote.js` adds.
- **Reduced motion and no scripts**: no pin, no camera. A plain section: the seven lines in order, and a short "how a vote works" list (leader picks, everyone votes face down, all turn at once, more than half must approve, a tie rejects, five rejects in a row and evil wins).
- **Performance**: about 30 new elements. Only `transform` and `opacity` change per frame, values written only when they change. The frame loop already pauses when the hero is off screen.

## What "done" looks like

- The dive carries the eye from dawn to the crown on seat 1 with no jump; then the table is wide again.
- All ten vote cards turn at the same scroll position; four Approve and six Reject the first time, seven and three the second time.
- The red flicker on the Assassin's seat shows only for the visitor, in step 6.
- The bar appears in step 1, lights one reject mark in step 5 and clears it in step 7, and stays for chapter 4.
- Watch only: nothing can be tapped or tabbed to. Words and colour follow the scroll both ways.
- English, Chinese and Malay fit with no overlap, no sideways scroll, no console errors, at 1280x720, 390x844 and 360x640.
- `?motion=off` and scripts off show the seven lines and the "how a vote works" list.
- Scripts stay under 130 KB compressed (budget for this part 6 KB). Frame rate on a mid range phone (AC-14).

## Open points

1. **Bar and words.** The words sit at the top of the hero stage during the night. The bar also wants the top. Proposed: the bar is a slim strip at the very top and the words move down by its height from step 1 on. Alternative: words at the bottom for this chapter. The owner decides when it is seen.
2. **Which seats are on each team and who votes what.** The seat numbers above (teams 1, 5, 8 and 2, 3, 10) are a proposal. The only fixed facts are four Approve and six Reject the first time, seven and three the second, the Assassin on the second team, and the seat 3 Loyal Servant on it.
3. **Star of the vote cards' back.** The role card back is reused for the vote card back first, as written in [003-props](../images/003-props.md). A separate back can come later.
4. **The reject bar after approval.** Step 7 clears the reject track, as the story line says. Chapter 4 can start the quest circles from there.

## Seat labels (owner request, 2026-11-17)

- **Who is who**: every seat card wears a small number, and the seats the story is about wear a name and their team badge (`src/js/seats.js`, fed by `night.F`). Any card can be asked by hover, tap, click or keyboard focus. The name tag is stacked above the asked-for card (tag over card), so the 12 o'clock seat's tag is never covered. See [story_line.md](../scope/story_line.md#what-stays-on-screen).
- **Rule for this chapter**: while the vote cards are on the table, the seats of the team in the middle show **no number and no name label**, so the cards and the count (`4 : 6`, `7 : 3`) stay clear. The fade starts as the vote cards are laid (just before they turn), in both rounds, and the labels return once the vote cards have faded (round 1: the team goes back to its seats; round 2: the team stays in the middle for the quest, with its labels back). It follows the scroll both ways. The other seven seats keep their numbers.
- **How it is built**: `vote.js` sets `night.HID[seat]` (0 to 1) from how far the vote cards are laid and how far the seat has slid to the middle. `seats.js` multiplies that into the number and the label. Checked at 390x844 in both rounds.

- **Numbers away from the table** (2026-11-17): see [004](004-the-deal.md#seat-numbers-owner-request-2026-11-17). The labels and numbers only exist while the cards are at the table.
