# 005 The Night Falls (scroll story part 5, chapter 2)

**Status**: **approved by the owner, 2026-11-16.** Built the same day, second pass after the owner's review (decisions 9 to 13). Checked at 1280x720 and 390x844, no console errors. **Still to do**: frame rate on a real mid range phone (AC-14), and a native speaker's read of the Chinese and Malay words.
**Story**: [story_line.md](../scope/story_line.md), chapter 2 Night Falls. Rule shown: who knows what at the start. Visitor: watches (decision 9).
**Model**: the same pinned stage as [002](002-gathering.md) to [004](004-the-deal.md). The round table built in [004](004-the-deal.md) is the set.
**Comes after**: [004 The Deal](004-the-deal.md). **Leads into**: chapter 3 The Vote (not planned yet). Chapter 3 starts from the table as this part leaves it: wide view, all cards face down, cream page.
**Code it will touch**: `src/js/cards.js` (`hero`: the frame loop and the timeline), new `src/js/night.js`, `src/templates/home.mjs` (a `night` template), `src/styles/main.css`, `src/js/theme.js` and `src/js/shader.js` (a night state), `src/data/night.json` (new), `src/i18n/*.json`
**Prototype**: [design/night-prototype/](../../design/night-prototype/) (sources) and two private pages the owner has seen: Night Camera Options (https://claude.ai/artifact/T1MLsRiqoaAP8kGoxa3fEs) and Night Shape Options (https://claude.ai/artifact/RJqZwtwf6w1Ku7nY4NJdpW)

## Decisions made (owner, 2026-11-15)

| # | Decision | Why / who |
|---|---|---|
| 1 | **Camera: option A, orbit and dolly.** The camera swings round the table so the waking seat comes to the front, leans in to about 3x, and pulls back out between steps. The resting view stays at 28 degrees (20 on a phone). During a close-up the lean rises to 48 degrees, then returns | Owner picked A after seeing A, B (straight dolly) and C (zoom only on taps) side by side |
| 2 | **3D shapes: crystals, moon and stars, focus rings.** The narrator's lantern is **not** included | Owner |
| 3 | **Focus rings are not shown while evil wakes.** They show for Merlin, for Percival, and on whichever seat the visitor taps. During the evil step the camera close-ups and the red crystals carry the moment | Owner |
| 4 | **Explorer extras in:** the Sees / Seen by lens, drag to turn the table, pointer light (desktop only). **Night rail is out** | Owner |
| 5 | **Length: about 4 screens on a desktop**, 3.4 on a phone (story line said about 3.5). The hero pin goes from 6.5 to about 10.5 screens on a desktop | Owner |
| 6 | **The 3D eyes are required** (story line: a closed eye on every card, an open one when it wakes) | Story line |
| 7 | **CSS 3D with GSAP, no WebGL, no new images.** Transform and opacity only (AC-8) | Same as 002 to 004 |
| 8 | **Every interaction is optional and nobody gets stuck.** Scrolling plays the whole night. Scrolling while a seat is open closes it | Story line rules 1 to 5 |

## Decisions made after the first build (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 9 | **The night is watch only.** The explorer is removed: no "Tap a seat" line, no seat tapping, no Sees / Seen by lens, no caption panel, no drag to turn, no pointer light, no ring pulse on the seats. This replaces decision 4 and the explorer half of decision 8. The "who knows what" list stays on the plain page (scripts off, reduced motion) and for screen readers | Owner |
| 10 | **Words move with the scroll, like the cards of the deal.** Each line is its own element. The line going out and the line coming in cross fade and slide over a stretch of scroll, on the same timeline as the cards, never on a timer. This covers "Ten seats..." into "Night falls." and "Everyone, open your eyes." into "Now everyone knows something different." | Owner: those two moments felt laggy, the deal felt right |
| 11 | **Light and dark turns follow the scroll and take half a screen.** One number from 0 to 1 sets the backdrop (WebGL shader, or the CSS layers without it) every frame, straight from the scroll, for the night, the dawn and the dark turn of the characters section. The page wide 0.8 second colour transition on every element is removed; only a few text elements fade their colour when the turn passes its middle | Owner: the colour turns were not smooth; half a screen, slower than proposed |
| 12 | **Close up: the card is about 40% of the screen tall and keeps its 2:3 shape.** The camera also uses a longer lens as it moves in: the ring's perspective grows from 1600 (wide, as before) to 5000 (close), so the same zoom happens from further away. While building it turned out the stretch had another cause, which was the main one (see "As built") | Owner |
| 13 | **The draw order switch happens while nothing moves**: just after the last card of the deal lands, not at the first frame of the night | Assistant, part of decision 10 |

## Decisions made after the owner's phone review (owner, 2026-11-22): slower swings round the table

**Status: built 2026-11-22 in `src/js/night.js` (`ORBIT = 5`, `SWING_EASE = 'sine.inOut'`, a running shift `sh` that moves every later step and `BEATS` line). Build and the 33 tests pass. Still to do: scroll it on the real phone (the phone was unplugged when this was built), measure the real night length, and move this section to "As built".** The owner scrolled the night on a phone and found the swing round the table to each waking seat too quick to follow.

**Cause.** `look()` in `src/js/night.js` turns the camera to the next seat in 1.3 timeline units, about 0.14 of a screen, which is roughly 100 px of scroll on both desktop and phone. The swings are 36 degrees (Assassin), 72 (Morgana), 108 (Mordred), 72 (Oberon), 72 (Merlin), 144 (Percival), and the dawn swings back 144 in 1.6 units. With the `power2.inOut` ease (cubic) the middle of a swing runs about 3 times faster than its average, so Percival's swing peaks near 420 degrees per 100 px of scroll.

| # | Decision | Why / who |
|---|---|---|
| 14 | **Every swing is 5 times slower**, on desktop and phone alike: 1.3 units becomes 6.5, and the dawn swing 1.6 becomes 8. All seven swings (six seats and the dawn) get the same factor, so the night keeps one even rhythm | Owner, after trying 1x to 3x in the comparison page (Night Orbit Speeds, https://claude.ai/artifact/NbJcrauUBVudLpQYxEGki9) and asking for more |
| 15 | **The swing eases with `sine.inOut`** instead of `power2.inOut`. A gentler start and end, and the middle runs about 1.6 times the average, not 3 times | Owner |
| 16 | **The night gets longer in scroll, nothing is squeezed.** Each swing's extra length pushes every later step back by the same amount. The night grows from about 4.4 screens to about 8.5 on a desktop, and from about 3.8 to about 7.3 on a phone. The later chapters follow, because they are placed after `NIGHT` | Follows from 14 |
| 17 | **The words, the wake of each seat and the dawn keep their order and their gaps.** Only the start time moves, so each line still appears with its seat | Assistant, follows from 16 |

Expected result: the fastest moment of the biggest swing (Percival) drops from about 420 degrees per 100 px of scroll to about 44. Every swing is about 510 px of scroll on a desktop (the dawn about 630), where it was about 100.

### Plan (to build)

1. **One setting.** In `night.js` add `ORBIT = 5` (swing length factor) and `const swing = (d) => d * ORBIT`.
2. **Shift the later times.** `build()` writes its times as plain numbers (5.5, 7.9, 10.3, 12.9, 15.5 ...) and `BEATS` repeats them. Add a running `shift`: after each swing starts at `t`, `shift += swing(d) - d`, and every later tween, wake, thread, glow, `sleepAgain` and line time is written as `t + shift`. Easiest is to build the night as an ordered list of steps with a cursor, instead of fixed numbers, so each step starts where the last one ends. `D` (dawn start) and `end` move with it.
3. **Ease.** `look()` and the dawn swing tween `S` with `ease: 'sine.inOut'`. The other tweens keep the timeline default.
4. **Words.** `BEATS` times and the dawn lines use the same shifted times. The fade in and fade out lengths (1.3 and 1) stay as they are, so a line is on screen about as long as before relative to its seat.
5. **Length.** `build()` already returns `len = end / unitsPerScreen x perScreen`, so the hero pin and every chapter after it lengthen on their own. Check that the scroll budget table below and the pin length in `cards.js` (`window.innerHeight x (5 | 4.4) x duration`) still add up.
6. **Check on a phone.** Run the real phone through `chrome://inspect` and `scripts/perf-phone.mjs`: scroll the night, confirm no swing is faster than about 45 degrees per 100 px, the card is still about 40% of the screen at close up, and the page colour, words and eyes still follow the scroll both ways.
7. **Record.** Move this section from "decided" to "As built", with the measured lengths.

Open question for the build: at 8.5 screens the night is the longest chapter. If it feels long on a real phone, the first thing to try is a factor of 3 (about 6.0 screens on a desktop), which is a one number change.

## What the visitor sees

Still inside the pinned hero stage, after the deal. The table holds still at the end of the deal, then:

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **Night falls** | "Everyone, close your eyes." | Slow push in | The page eases to night blue (the table dims). A closed eye fades in on every card back. The moon rises behind the table and the stars come out |
| 2 | **Evil wakes** | "Evil, open your eyes." | Swings to the Assassin (seat 2), then Morgana (seat 4), then Mordred (seat 7). About 3x close up each | On each: the eye opens, the card stands up toward the camera and turns face up, a red glow, a red crystal appears above it. **No focus rings in this step** |
| 3 | **The traitors find each other** | **The traitors find each other.** | Pulls out to the wide view | Three red threads draw between the three. A red crystal spins over each |
| 4 | **Oberon** | "Oberon works alone." | Close up on seat 9 | The eye stays shut. No thread, no crystal. The three evil cards lower and close their eyes as the camera pulls out |
| 5 | **Merlin wakes** | "Merlin, open your eyes." **Merlin sees the traitors. All but one.** | Close up on seat 1, then pull out | Eye opens, card stands and turns up, focus rings spin round it. Pale threads reach the Assassin, Morgana and Oberon, which glow red with a red crystal. Mordred stays dark |
| 6 | **Percival wakes** | "Percival, open your eyes." **Percival sees two Merlins. Only one is real.** | Close up on seat 5, then pull out | Eye opens, card up, focus rings. Gold threads reach Merlin and Morgana, both shine the same gold with a gold crystal |
| 7 | **Everyone else** | "Everyone else saw nothing at all." | Wide | The four Loyal Servants' eyes stay shut and breathe once |
| 8 | **Dawn** | "Everyone, open your eyes." **Now everyone knows something different.** | Wide, back to the resting lean | All eyes open on the face down cards. Moon sets, stars fade, threads and crystals fade, the page returns to cream over half a screen |

Eight steps since decision 9 (the explorer step is gone). The page turns to night over half a screen at the start, and back to cream over half a screen at dawn (decision 11).

The order of the steps is fixed. The visitor only ever scrolls through them. Scrolling back up plays all of it in reverse.

### Scroll budget (desktop, in screens, about 4.4 in all; second pass, decisions 9 and 11)

| Stretch | Screens | Time units (of 40.4) |
|---|---|---|
| Night falls (the page turns to night over half a screen) | 0.6 | 0 to 5.5 |
| Evil wakes (three close ups) | 0.8 | 5.5 to 12.9 |
| Threads and Oberon | 0.7 | 12.9 to 19.3 |
| Merlin | 0.75 | 19.3 to 26.3 |
| Percival | 0.75 | 26.5 to 33.3 |
| Everyone else | 0.15 | 33.3 to 34.8 |
| Dawn (back to cream over half a screen) | 0.6 | 34.8 to 40.4 |

The time units are the prototype's with 3.5 added after the night falls (it was 0 to 2) and the explorer hold taken out. One unit is the same length of scroll as before (`units / 36.6 x 4` screens, phone `x 3.4`), so `NIGHT` grows from 0.8 to 0.88 (phone 0.77 to 0.85) and the hero pin from about 10.5 to about 10.9 screens on a desktop.

## The camera (decision 1)

One camera object, tweened by the timeline: `{ a, fr, dz, tilt, ty }`.

- `a` is the angle of the seat in focus (degrees, seat `i` is `90 + 36 i`). Keep it **unwrapped** so the camera takes the short way round (`near(target, current)` in the prototype).
- `fr` is 0 when looking at the middle of the table and 1 when looking at a seat on the rim.
- `dz` is the dolly (translateZ, in design pixels where the perspective is 1600). 0 is the wide view, **1050 is about 2.9x**. Second pass (decision 12): the perspective itself grows with the dolly, from 1600 wide to about 5000 close, and `dz` is worked out from the zoom wanted, so the close up is a long lens shot, not a wide angle one.
- `tilt` is 28 wide and 48 close (phone 20 and 40).
- `ty` is where the focus point sits on the screen.

The plane transform is one string, used for the table and every seat and shape:
`translate3d(0, ty/f, dz) rotateX(tilt) translate3d(-F', 0) rotateZ(yaw)` with `yaw = 90 - a` (brings the focus seat to the front), `f = 1600 / (1600 - dz)`, and `F'` the focus point after the yaw (always straight down the screen, `fr` times the seat radius). The prototype's `render()` is the reference.

- **Wide stays wide between steps.** The yaw is held, not undone, so only the dawn returns the table to its resting turn (seat 1 at the front).
- **Waking card** stands up like a lectern (hinged on the edge nearest the rim, 46 degrees) and turns face up. Because the camera has orbited to that seat, the painting always arrives upright and facing the visitor.
- **Seat positions** are the ones from [004](004-the-deal.md): seat 1 nearest the viewer, then clockwise, in `deck.json` order.
- **Fit.** The close up keeps the focus card about 40% of the screen tall, at its true 2:3 shape (decision 12). Check at 1280x720 and 390x844.

### Sharpness (found in the prototype, do this from the start)

At 3x zoom the paintings went soft because the browser had rasterised the cards at their small table size. **Fix: build each seat at twice its table size and scale it by 0.5**, and double the lift offset. Verified sharp in the prototype. The ring cards in the hero are already scaled up in the wall pose; the night must not shrink them below this. Also point the ring images at the 640 px painting once the night starts (they currently load the 320 px file): set `sizes` to about 240 px or swap `src` on idle after load.

## The 3D shapes (decisions 2 and 3)

All pure CSS 3D, no images. Built in design pixels times a `--u` scale (the table width over 1280). Prototype code is in `shapes.css` and `shapes.page.html`.

| Shape | Story job | How it is built | Phone |
|---|---|---|---|
| **Eyes** (required) | Closed eye on every card back. It opens when the role wakes | Almond clip, two lids that open by `scaleY`, a gold iris, a gold arc and lash ticks when closed, a glow when open. Lives inside the card back, so it flips away with the card | Keep |
| **Crystals** | Marks who is lit | An octahedron: four top and four bottom triangles with `clip-path`, shaded one by one, spinning on its axis and bobbing. Red over the traitors (evil step) and the three Merlin sees; gold over the two cards Percival sees. **The build reuses four crystals seat to seat** (the prototype uses five fixed ones) | Keep, slower spin |
| **Moon and stars** | Says "it is night" | A shaded sphere (gradients, craters, a dark edge) rising behind the table, and about 24 gold dots at different depths. The sky layer turns a little against the camera so the dots slide past each other | 8 dots |
| **Focus rings** | Shows whose view you are in | Three thin gold rings on different axes and a small orb, spinning. **Not during the evil step.** Shown for Merlin and Percival | Keep |
| Red, pale and gold **threads** | Who sees whom | Flat strips lifted 20 design pixels above the table with a soft shadow under each. They draw on with `scaleX` (transform only, no stroke animation) | Keep |

Threads: evil triangle (2-4, 4-7, 7-2, red), Merlin's three (1-2, 1-4, 1-9 in seat numbers, pale), Percival's two (5-1, 5-4, gold). Seat numbers are 1 to 10; the prototype `THR` uses 0 to 9.

**Rejected for now**: the narrator's lantern (owner), the night rail (owner).

## The explorer (removed, decision 9)

Kept here as a record of the first build only. None of it is on the page any more.

- **Tap or click a seat** (or Enter, Space on a focused seat): the camera orbits and dollies to it (about 1.1 s), the card stands up and turns face up with its eye open, focus rings spin round it, and the threads and glows light up. A caption panel names the player and says what they know.
- **Sees / Seen by lens**: two small buttons on the caption. *Sees* is what that player knows. *Seen by* is who can see them. Texts are in the prototype (`KNOW`, `SEEN`); for example Mordred: "Knows the Assassin and Morgana. Merlin cannot see him." and "Seen by the Assassin and Morgana. Merlin cannot see him."
- **Tap the same seat, tap the table, press Escape, or the × button** pulls the camera back out. Arrow left and right move to the next or the previous seat.
- **Scrolling wins.** Any scroll while a seat is open closes it and continues the story (rule: nobody gets stuck). The explorer camera is blended on top of the scroll camera by one weight, so closing is just that weight going to 0.
- **Drag to turn the table**: horizontal drag spins the table with a soft glide (mouse and touch). Vertical drags stay as page scroll (`touch-action: pan-y`). Ignored while a seat is open. A "Turn back" is not needed in the real page because dawn resets it.
- **Pointer light** (desktop only, not on touch): a soft warm glow sprite follows the mouse over the table during the night. One element moved by `transform`, no blend modes.
- **Hint**: one ring pulse on the seats, once, with the line above. No instructions panel.
- Seat buttons are real `button.slot` elements again for this stretch only (`tabindex` 0, label "Seat 2: Assassin. Tap to see what this player knows."). Their hit area must be at least 44 px on a phone (grow it with a pseudo element, the cards are about 40 px wide at 390 px).

## Night theme

- Story line palette: night is dark blue, dawn brings cream back. Chapter 7 keeps the darker page, so night is a **third state** (`dark night`), not the same as `dark`.
- `theme.js` gains `setNight(on)` and a `night` class on the root. The CSS variables are the dark ones with a bluer `--bg`. The shader gets one extra uniform `uNight` (bluer dark, no crimson fold). The characters section still turns the page dark at the Assassin flip for now ([story_line.md](../scope/story_line.md) "What this changes").
- Night starts at step 1 and ends at the dawn. The moon and the table dim use opacity only.
- Second pass (decision 11): `theme.js` takes a number, not a switch. `setNight(v)` and `setDark(v)` (0 to 1) are called every frame from the scroll. The backdrop follows that number exactly: the shader gets `uTheme` and `uNight` directly (no easing of its own), and without WebGL three CSS layers (cream, dark, night) change opacity. The `dark` and `night` classes, which swap the text colours, flip when the number passes 0.5. The characters section uses the same number for its dark turn, spread over half a screen around the Assassin flip.

## How it is built

- **A third number in the frame loop.** `p` is the old pin, `q` is the deal, `n` (new) runs 0 to 1 after the deal. The timeline becomes `1 + DEAL + NIGHT` long, with `NIGHT = 0.8` on desktop (4 of the 5 screens that one old unit lasts) and `0.77` on a phone (3.4 of 4.4). Pin length is `innerHeight x screens x (1 + DEAL + NIGHT)`. Every existing position and length is unchanged.
- **New `src/js/night.js`** (target at most 12 KB compressed). It owns the camera object, the per seat values (eye, lift, glow), the threads, the crystals, the sky and the explorer. `hero()` calls `night.frame()` once per tick and reads back the camera and per seat values when it builds each card's transform string (`dealing` branch in `frame()`). `night.build(tl, at)` adds the tweens to the hero timeline.
- **Data**: `src/data/night.json` lists, by role slug, which roles each role sees (`merlin: [assassin, morgana, oberon]`, `assassin: [morgana, mordred]`, `morgana: [assassin, mordred]`, `mordred: [assassin, morgana]`, `percival: [merlin, morgana]`). The build maps roles to seats through `deck.json` and writes seat indexes into the page data, so changing the deck order cannot break the night.
- **Markup**: a `night` template in `home.mjs`, like `deal`. With scripts it moves into the pinned hero (words at the top, caption panel at the bottom); without them it is a plain section. The 3D layers (eyes, threads, crystals, sky, rings) are created by `night.js`, so the plain page stays slim.
- **Cleanup**: `hero()`'s cleanup function must remove everything `night.js` adds and put the cards back (`flips[i].style.transform = ''`, the lift, the glows).
- **Reduced motion and no scripts**: no pin, no camera. Show a plain section: the nine step lines in order and a **"who knows what" list of ten rows** (one per seat, written with the role name). That list is also the screen reader version of the explorer, and it is visually hidden when the 3D stage is running.
- **Performance**: about 200 new elements. Only `transform` and `opacity` change per frame, all values are written only when they change (the prototype's `put()` cache). Pause the frame loop when the hero is off screen (the existing `restAfter` test already does this). The 2x card supersampling costs about 6 MB of texture memory, acceptable.
- **Words** (keys under `night`, Chinese and Malay needed in the same build, the assistant's wording, to be read by a native speaker): the step lines, the "who knows what" heading, and seven "sees" and seven "seen by" texts (one per role) for the plain list. The explorer's keys (tap line, lens labels, close, seat button label) are removed with it.

## What "done" looks like

Approved. The rules that must keep holding:

- Watch only: no seat can be tapped or tabbed to during the night.
- No focus rings while evil wakes; Merlin and Percival get rings; Oberon's eye stays shut; Mordred is never lit by Merlin's threads.
- Words and colour follow the scroll both ways (no timers); close ups keep the card about 40% of the screen tall at 2:3.
- Dawn returns the page to cream and the table to its resting turn, all cards face down, so chapter 3 can start.
- `?motion=off` and scripts off show the nine lines and the ten row list.
- Scripts stay under 130 KB compressed. Frame rate still to be checked on a mid range phone (AC-14).

## As built (2026-11-16), where it differs from the plan

- **Draw order, not depth sorting.** A woken card stands up and crosses the table's plane, and the browser's depth sorting then painted the table over the card's lower half. Fix: while the night plays the ring is flat (`.ring.is-flat`) and the layers are drawn in a fixed order: sky, table, glows and threads (`.n-under`), the ten cards (z-index by distance from the viewer), crystals and focus rings (`.n-over`). Cards are still in 3D; only the sorting is fixed.
- **Camera numbers are 0 to 1** between wide and close (`a` in degrees), and the real values are measured per screen: the close up zoom is chosen so the standing card is 40% of the screen tall (not wider than 55% of it), and the seat is placed so the middle of the standing card lands at 56% of the screen height. Measured: 304 x 209 px at 1280x720, 336 x 230 px at 390x844.
- **Why the close ups were stretched (second pass).** Each card ends its transform with `scale()`, which shrinks width and height but not depth. When the card stands up, part of its height turns into depth, and that part stayed full size, so the card came out about 1.9 times too tall. Cards now use `scale3d(s, s, s)`, and so do the crystals and focus rings. The longer lens of decision 12 is kept as well.
- **Twelve spoken lines for nine steps.** Steps 5, 6 and 9 each show two lines in turn (the spoken line, then the title card). The "close your eyes" lines of the prototype are left out so the nine lines of the plain page match.
- **Crystals** are four shared ones, shown over any seat lit red or gold, floating 140 design pixels above the table so they clear the top of a standing card.
- **Words (second pass)**: `night.js` writes one element per line (eleven lines; the night falls, each step, dawn). Each line slides and fades in over about 1.3 time units while the one before it fades out, on the night's timeline. The deal's two lines fade and slide out the same way, overlapping the first night line.
- **Colour (second pass)**: `theme.setNight(v)` is called every frame with the night value, `theme.setDark(v)` from the characters timeline. The CSS backdrop is cream, then a dark layer and a night layer (`.silk-dark`, `.silk-night`) whose opacity is the number; the body is transparent so nothing else jumps. Only the nav, the words and a few headings ease their text colour when the classes flip.
- **Sizes**: `night.js` is 7 KB compressed (9 KB with the explorer); our scripts are 28 KB compressed, about 84 KB with GSAP, ScrollTrigger, SplitText and Lenis.
- **Cards are built twice their size** (`SS = 2` in `cards.js`, `--w2` in `main.css`) and scaled by one half, for every hero card. This touches the earlier parts' scale numbers, which are all divided by `SS`; the ring, wall and deal look as before.

## Open points

- **Close up count on a phone.** Still three close ups for the evil step on a phone (as on a desktop). If it feels long on a real phone, play one close up on the Assassin and keep the other two wide.
- **Seats 3, 6, 8, 10 breathing.** Step 7 only says the Loyal Servants' eyes stay shut. A single slow breath is proposed, drop it if it adds noise.
- **Chapter 3 hand-off.** Dawn ends with the table at its resting turn. If chapter 3 wants the crown to land on a different seat, the turn is free to change then.
- **Spec 0001** (AC-5 when the page turns dark, and a new AC for the night) still to be rewritten once the whole story is approved.
