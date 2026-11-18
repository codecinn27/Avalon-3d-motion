# 004 The Deal (scroll story part 4, chapter 1 step 3)

**Status**: built 2026-11-15 (`hero()` in `src/js/cards.js`, the `.table` and `deal` pieces in `src/templates/home.mjs`, `main.css` and `src/i18n/*.json`). Checked by stepping the scroll and taking pictures at 1280x720 and 390x844, in English, Chinese and Malay: the camera pull back, the extras leaving, cards in the air, the finished table (re-checked after the angle change), scrolling back up (wall, then ring), the page after the pin, and the reduced motion page. No console errors. Not yet seen by hand with a real mouse and a real phone, so the speed of the deal is not judged. The pictures were taken with `?webgl=off` because headless Chrome has no graphics chip for the shader backdrop
**Story**: [story_line.md](../scope/story_line.md), chapter 1 step 3, and its words "Ten seats. Six are loyal. Four are lying."
**Model**: the same plane trick as the card wall in [003](003-unfolding.md)
**Comes after**: [003 The Unfolding](003-unfolding.md). **Leads into**: chapter 2 Night Falls (not planned yet). The table built here is the set for chapters 2 to 7
**Code**: `src/js/cards.js` (`hero`: `DEAL`, `CAM_LEN`, `DEAL_AT`, `table`, `measure`, `frame`, the timeline), `src/templates/home.mjs` (`hero`, `deal`), `src/styles/main.css` (`.table`, `.deal`), `src/i18n/*.json` (`deal`)

## What the visitor sees

Still inside the same pinned stage as parts 1 to 3:

1. **Pull back.** The story under the wall steps aside. The tilted plane the wall lies in tilts to 28 degrees on a desktop (from 14 on the wall), so the camera is nearly straight above the table with only a slight lean, and moves up the screen. A round wooden table grows into that plane under the cards.
2. **The extras leave.** The twenty extra cards slide off the left and right edges and fade. The ten real cards stay in the middle of the table, still face up.
3. **Words.** "Ten seats. Six are loyal. Four are *lying.*" appears above the table, then "Every player gets one secret card. Nobody shows it. Not even to friends."
4. **The deal.** One card at a time, the ten leave the wall, lift, turn in the air, flip face down and land on their seats. The last one lands and the table holds still. The pin then lets go and the page scrolls on.

Scrolling back up plays all of it in reverse: the seats empty, the table shrinks away, the extras return, and the wall and the story come back.

## Decisions made

| # | Decision | Why / who |
|---|---|---|
| 1 | **The table is drawn with CSS, no painted picture.** A flat disc: wood grain, a dark carved rim with a gold line, a thin inner ring, a soft glow in the middle and a soft shadow around it | Assistant's call while building, resolves open point 1 of the story line. No image to load, and it lies in the same plane as the cards so the two can never drift apart. Owner can ask for a painted table later |
| 2 | **One plane for everything.** The wall, the extras, the ten cards and the table share one tilt, one height and one turn. The camera pull back is that one plane changing. Each card then adds its own move inside the plane (position, turn, lift, flip) | Keeps the move cheap (only `transform` and `opacity`, AC-8) and the cards consistent with the table |
| 3 | **Seats follow the cast table in the story line.** Seat 1 is the card nearest the viewer, then clockwise, in the order of `src/data/deck.json`. Each card's top points at the middle of the table, so it faces its player | Chapter 2 refers to seats by this order (Merlin is seat 1 and sits nearest the viewer) |
| 4 | **The table is fitted by projection.** `measure()` projects the rim of the table with the ring's perspective, which makes the near half bigger than the far half, and shrinks and moves it until it sits below the words, above the bottom edge and inside the sides | The first try ran off the bottom of the screen and cut off the near seat |
| 5 | **Angle**: 28 degrees on a desktop and 20 degrees on a phone, measured from looking straight down (0 would be a flat circle). The first try was 56 and 40 | Owner, 2026-11-15: "more incline by 50%, so that it just tilts a few degrees from the top". Cost of the flatter view: the table is closer to a circle, so it must be smaller to fit the screen height. On a 1280x720 desktop it is about 560 px across (about 830 before) and the cards on it are about 30% smaller. If that is too small, a middle angle (35 to 40 degrees) or the words moved to the side are the options |
| 6 | **Longer pin**: the deal adds 30% of the old pin, which is 1.5 screens on a desktop (6.5 in all) and 1.3 on a phone (5.7 in all) | Story line chapter 1 gives about 1.5 screens |
| 7 | **Watch only.** Nothing waits for a tap, and nothing can be tapped here. The ring cards stay inert from the gathering on | Story line, visitor rhythm: chapter 1 watches the deal. Rule 1: nobody gets stuck |
| 8 | **The words are a section of their own** (`.deal`), made like the story: with scripts it moves into the pinned hero, without them it stays a plain section after the story | Keeps the text readable with scripts off or reduced motion (AC-13, AC-17) |
| 9 | **Words** (keys `deal.title`, `deal.lede`). English as in the story line. Chinese: 十个座位。六人忠诚，四人在*说谎。* / 每人领到一张秘密身份牌，谁都不亮牌，朋友也不例外。 Malay: Sepuluh kerusi. Enam setia. Empat sedang *berbohong.* / Setiap pemain mendapat satu kad rahsia. Tiada siapa menunjukkannya, kawan baik pun tidak. | Chinese and Malay are the assistant's wording and need a native reader check, like the rest of the copy |

## How it is built

- **One more number, `q`.** Next to `p` (scroll progress through the old pin) the frame loop reads `q`, which runs 0 to 1 after it. The timeline is 1.3 long: the old pin is 1, the deal is 0.3. Every old position and length is unchanged.
- **Table sizes** are set in `measure()` (`table.rs` the radius of the circle of seats, `table.k` the card scale, `table.d` the table's width, `table.y` its height) and the table element reads its width from the CSS variable `--td`.
- **Deal timing in `q`**: camera pull back 0 to 0.3, extras sliding off 0 to 0.24, then card `i` leaves at `0.3 + 0.05 i` and takes 0.2. The last card lands at 0.95. All of these are constants at the top of the part 4 block, so the feel can be tuned in one place.
- **Text timing** (in timeline units): the story fades out at 1.0, the heading in at 1.06, the second line in at 1.14.
- **Into the night** (owner, 2026-11-16, [005](005-the-night-falls.md) decision 10): the deal's words no longer snap away at the end. They fade and slide out with the scroll while the night's first line fades in, on the same timeline as the cards.
- **Clean up** puts the story and the words back where the page has them without scripts, and clears the table's styles.

## Scroll budget (desktop, in screens, on top of the old 5)

| Stretch | Length | What happens |
|---|---|---|
| Pull back | 0.45 | Plane tilts, table grows, extras leave, story fades |
| Words | within the pull back and the first cards | Heading, then the second line |
| Dealing | about 1.0 | Ten cards, one every 0.075 screens |
| Hold | about 0.08 | The finished table |

## What "done" looks like

- At the end of the deal the ten cards lie face down on ten seats of a round table, all of the table and all ten cards on screen, with the words above, at 1280x720 and at 390x844 ✔ (by pictures)
- English, Chinese and Malay fit with no overlap ✔ (by pictures)
- Scrolling back up returns the wall and the story, then the ring ✔ (by pictures)
- With `?motion=off` there is no table, and the words show as a plain section ✔
- No sideways scroll, no console errors ✔
- Not yet: judged by hand with a real mouse and a real phone (speed, how long the pin feels), and AC-14 frame rate on a mid range phone

## Open points

- **The story text under the wall is still the old copy** ("Three rounds of doubt" and its three steps). The story line says chapter 1's lines replace it, and those lines are now the words over the table. Left as it was because this step was only the deal. Decide whether to replace the old copy with a short line that leads into the table
- **Cards on the table are small on a phone** (about 40 px wide at 390 px). Chapter 2 zooms in on each card, so this is expected
- **Feel**: how fast the deal runs, and whether the camera pull back should be slower. These are the constants named above
- **Painted table**: only if the owner finds the CSS one too plain
- Spec 0001 (AC-1 and the hero row of the composition table) still to be rewritten once the whole story is approved

## Seat numbers (owner request, 2026-11-17)

- **Seat numbers and labels belong to the table only.** They fade in together with the deal's first words ("Ten seats. Six are loyal. Four are lying.", `q` 0.2 to 0.27) and fade out with the scroll as soon as the cards leave the table (the hero ring, the drum, the wall, the story steps, cards flying or flipping). Hover, tap and keyboard asking are off at the same time, so the hero ring's card dialog works as before. Decided 2026-11-17. Cause of the earlier bug: the label layer was only updated while the table camera was awake, so scrolling back up left it frozen on screen; it now runs from the main frame loop (`createSeats().frame(k)` in `cards.js`) and every seat hides itself explicitly.
- Image 1 of the owner's review (the grid of ten cards with numbers under "Ten seats") is the first picture where they show. Checked at 390x844: gone at the hero ring and the wall, on at the deal, gone again when scrolling back.
