# 010 The Blade (scroll story part 10, chapter 7)

**Status**: plan written 2026-11-16 with the owner, from their answers and their picks on The Blade Options page. **Approved by the owner 2026-11-16.** **Built 2026-11-17** (owner's look pending), see [As built](#as-built-2026-11-17).
**Build command**: `/develop chp7-the-blade`. Read [Before you build](#before-you-build) first.
**Story**: [story_line.md](../scope/story_line.md), chapter 7 The Blade. Rule shown: when good wins three quests, evil gets one guess at Merlin, and a right guess steals the whole game. Visitor: **decides where the blade falls** (the third hands on moment, and the one the whole page builds to).
**Model**: the same pinned stage and round table as [004](004-the-deal.md) to [009](009-the-climb.md).
**Comes after**: [009 The Climb](009-the-climb.md), which ends wide (dolly about 0.92x) in gold light with gold motes rising, circles 1, 3 and 5 blue and pulsing, circles 2 and 4 red, "Good has won." on screen, the Lady card standing at seat 5, the crown on seat 6, and every role card face down at its seat. **Leads into**: [011 Your Seat](011-your-seat.md), which starts from either ending's last picture and reads the visitor's choice from `blade.result()`.
**Code it will touch**: new `src/js/blade.js`, `src/js/cards.js` (`hero`: the frame loop and timeline get an eighth number; the characters section's dark turn is removed), `src/js/theme.js` (two new layers, crimson and dawn; the no pin dark turn moves here), `src/templates/home.mjs` (a `blade` template), `src/templates/layout.mjs` (two backdrop layers), `src/styles/main.css`, new `src/data/blade.json`, `src/i18n/*.json`
**Prototype** (private page the owner chose from): The Blade Options (https://claude.ai/artifact/6Vfoq87LKyrryHoieP1FuD), groups 2 to 6. The owner picked **2A Gilded**, **3A+A Aim then strike, ghost faces**, **4B Facing the arc**, **5A Cracks**, **6A Ash**. Its timings, sizes and the dagger drawing are a starting point. The dagger SVG may be ported from it; the rest of its code is not ported as is.

## Summary

The lights snap off. **But one blade remains.** The four evil cards turn face up with their red badges burning. The six loyal cards lift off their seats and stand in an arc at the front of the table, face down, each showing the visitor a faint ghost of its painting. The Assassin's card slides to the front and a gilded dagger rises from it. It drifts from card to card and slows between Merlin and Percival, with a heartbeat. Then the arc lights up: **you** point the blade. With a mouse it follows the card you point at and one click strikes. On a phone the first tap aims and the second tap strikes. Merlin plays ending A: the card cracks, the blue circles crack and turn red, and the page goes crimson (**Three quests won. One name lost it all.**). Anyone else plays ending B: the dagger crumbles to ash, Merlin turns over in gold light, the circles turn gold, and dawn rises (**The blade missed. The realm is saved.**). If the visitor just scrolls, the Assassin chooses Merlin himself. Scrolling back up, or the quiet "See the other ending" link, lets them choose again.

## Decisions made (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 1 | **Its own plan and build**, after [009](009-the-climb.md). Command `/develop chp7-the-blade` | Owner |
| 2 | **The dagger is option 2A, Gilded**: steel blade, gold guard and pommel, one red stone, drawn as inline SVG by the page | Owner. It matches the gold card edges and the painted deck. A painted cut out could replace it later |
| 3 | **The hard cut is a named exception** to "every palette turn takes about half a screen". The gold and the motes go out and the page turns dark across about **0.05 screen**. It still follows the scroll: scrolling up brings the gold back | Owner. The cut is the twist, so it must feel like lights snapping off |
| 4 | **Camera: facing the arc (4B).** The six loyal cards stand up facing the visitor and the dagger hovers above them. No low camera behind the blade | Owner, after trying A, B and C. Replaces the story line's "low and close behind the dagger" |
| 5 | **The strike plays in place, with a small push in.** No cut to top down | Owner. The visitor's choice stays in view. Replaces the story line's "cut to top down for the strike" |
| 6 | **The arc forms in front of the table.** The six loyal cards lift off seats 1, 3, 5, 6, 8 and 10 and stand in an arc at the front, left to right **3, 6, Merlin (1), Percival (5), 8, 10**, each with a small seat number. The four evil cards stay face up at their seats behind. The Assassin's card slides to the front centre, below the arc. On phones the arc is two rows of three, with Merlin above Percival in the middle | Owner (the arc). Phone rows are a recommendation from the live demo: one row of six would make each card about 47 px wide at 360 px, two rows give about 80 px |
| 7 | **Aim, then strike (3A).** Mouse: the dagger glides over the card under the pointer, and a click strikes it. Touch: the first tap aims (the card gets a red ring and a "Strike seat N" button appears), a second tap on that card or the button strikes, and a tap on another card moves the aim. Keyboard: Tab moves the aim, Enter or Space strikes | Owner, after trying tap, aim and drag. The pause is the heartbeat, and a stray tap can't end the moment |
| 8 | **Ghost faces (3A).** The cards stay face down for the table, but each shows the visitor a faint ghost of its painting (about 30% opacity, screen blend) | Owner. The narrator view the whole story uses, and on a phone nobody has to remember which seat was Merlin |
| 9 | **Ending A: cracks (5A).** Cracks run out from where the blade hit, the blue badge drains to grey, the three blue circles crack and turn red one after another, the evil cards rise and the page goes crimson | Owner. The story line as written |
| 10 | **Ending B: ash (6A).** The dagger crumbles into dark ash that drifts up. The Assassin's red glow flickers out, the evil cards sink and turn grey, Merlin turns over in gold light, the circles turn gold, and dawn rises over the dark | Owner. The softest break, so Merlin's gold reveal stays the big moment |
| 11 | **One quiet "See the other ending ↑" link** under each ending's last line. It scrolls back to the start of the choice and clears the choice | Owner |
| 12 | **Felt as well as seen, on Android.** A double pulse like a heartbeat (`navigator.vibrate([28, 110, 28])`) as the dagger slows between Merlin and Percival, once per pass, only scrolling forward. One hard pulse (`navigator.vibrate(45)`) when the visitor's own tap strikes. Never when motion is reduced, never on the Assassin's own strike. iPhones ignore it | Owner. The browser only allows it after the visitor has tapped the page once (chapters 4 and 5 give them the chance). If it is refused, nothing happens |
| 13 | **Length about 4.0 screens on a desktop, 3.5 on a phone**: 2.0 for the opening, 0.5 for the choice, 1.5 for the ending | Owner |
| 14 | **No choice means ending A.** At the end of the choice window the Assassin chooses Merlin himself, scrubbed by the scroll | Story line decision 8 |
| 15 | **The light to dark turn moves here.** The characters section stops turning the page (its section is removed in [011](011-your-seat.md)). Ending A adds a crimson layer, ending B a dawn layer, both new in `theme.js` | Story line "What this changes in the built site" |
| 16 | **Anti slop pass with the installed taste skill** (`.agents/skills/high-end-visual-design`). Only the rules that fit a 3D card scene apply (see [Taste pass](#taste-pass)) | Owner, same as 007 to 009 |
| 17 | **CSS 3D with GSAP, no new libraries, transform and opacity only (AC-8).** The cracks are drawn as short SVG segments that fade in one after another (opacity), not an animated stroke | Same as 002 to 009. Keeps the rule with no new exception |

## Before you build

`/develop` checks these first. If any check fails, **stop and tell the owner**. Do not build a stand-in.

1. **Chapter 6 is built**: `src/js/climb.js` exists, `cards.js` has `CLIMB` in the frame loop, and the stage ends on the celebration picture described in "Comes after".
2. **This plan is approved**: the scope's chapter 7 entry has "plan approved" ticked.
3. Read the "As built" notes in [005](005-the-night-falls.md) to [009](009-the-climb.md), if their builds left any, for the real camera numbers, the standing card method (005's `rotateX(-tilt)` about the bottom edge), the score bar's helpers and the class names. Where they differ from this plan, the built ones win.

## What the visitor sees

Still inside the pinned hero stage. Seat numbers follow `src/data/deck.json`: 1 Merlin, 2 Assassin, 3 Servant, 4 Morgana, 5 Percival, 6 Servant, 7 Mordred, 8 Servant, 9 Oberon, 10 Servant.

### The shared opening and the choice

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **Lights out** | **But one blade remains.** | Holds wide, then eases back to rest | Across about 0.05 screen: the gold layer and the motes go out, the circles stop pulsing, and the page turns dark (decision 3). The Lady card and the crown fade away over the next 0.1 screen. The line rises in the dark |
| 2 | **Evil, face up** | "Evil can lose every quest and still win." | Rest | The four evil cards (2, 4, 7, 9) turn face up at their seats, one after another, and their red badges burn (a red glow behind each badge) |
| 3 | **The arc** | "Name Merlin, and everything goes to evil." | From rest to the arc pose (see [The camera](#the-camera)) | The six loyal cards lift off their seats one by one and glide to their places in the standing arc at the front, still face down, with ghost faces and seat numbers fading in. The Assassin's card slides from seat 2 to the front centre, below the arc, and stands up face up |
| 4 | **The dagger rises** | (same line) | Arc pose | The gilded dagger rises out of the Assassin's card, tip up, fading in as it lifts, with one glint along the blade |
| 5 | **The drift** | "It slows between two." then "All game, Percival played Merlin to draw the blade." | Arc pose, a slight push in | The dagger tips over and drifts above the arc from card to card (3, 6, Merlin, Percival, 8, 10 and back), then swings slower and slower between Merlin and Percival. Two heartbeats: the dagger swells a little twice. The card under the dagger glows faint red. Android: the double pulse (decision 12) |
| 6 | **Your turn** | "You saw everything tonight. The Assassin saw nothing." then "Where does the blade fall?" | Arc pose | The dagger settles above the middle of the arc. A soft gold rim lights each loyal card, left to right, once. The hint shows under the arc: "Point at a card, then click." (mouse) or "Tap to aim. Tap again to strike." (touch) |
| 7 | **The choice** (choice window) | (same lines) | Arc pose, still | The six loyal cards are real buttons now. The dagger follows the aim (decision 7). On a strike, see [The strike](#the-strike-decisions-5-7-and-12). With no strike, nothing moves until the window ends |
| 8 | **The strike** | "The Assassin chooses." (only when the visitor did not choose) | Small push in on the struck card, then back | If the visitor struck, the card is already face up and this stretch only holds. If not, the dagger glides to Merlin, rises, falls, the flash, and Merlin's card turns face up, all scrubbed |

### Ending A: the blade finds Merlin (evil wins)

| # | Step | Words | On the table |
|---|---|---|---|
| A1 | **The cracks** | "Merlin." | Cracks run out from where the blade hit, segment by segment. The blue badge drains to grey. The dagger fades out of the wound |
| A2 | **The win is taken back** | "The win is taken back." | Circles 1, 3 and 5 crack one after another, left to right, and fill red |
| A3 | **Evil rises** | (same line) | The four evil cards lift a little higher and lean toward the visitor. Red light spreads from them across the table and into the backdrop, which turns crimson (the crimson layer) |
| A4 | **The line** | **Three quests won. One name lost it all.** | Merlin's card dims a little. Hold. Then the quiet link "See the other ending ↑" fades in under the line |

### Ending B: the blade misses (evil loses)

| # | Step | Words | On the table |
|---|---|---|---|
| B1 | **Not Merlin** | "Not Merlin." | The struck card is face up (Percival or a Servant). Its blue badge holds and glows |
| B2 | **Ash** | (same line) | The dagger crumbles into about 40 flakes of dark ash with a few embers, which drift up and fade |
| B3 | **Evil falls** | (same line) | A beat of nothing. The Assassin's red glow flickers and goes out. The four evil cards sink back and turn grey |
| B4 | **Merlin stayed hidden** | "Merlin stayed hidden." | Merlin's card, in the middle of the arc, turns face up by itself, slowly, in gold light |
| B5 | **Gold** | (same line) | Circles 1, 3 and 5 lock and turn gold. Dawn light rises from the bottom over the dark table (the dawn layer) |
| B6 | **The line** | **The blade missed. The realm is saved.** | Hold. Then the quiet link "See the other ending ↑" fades in under the line |

### Scroll budget (about 4.0 screens on a desktop, 3.5 on a phone)

| Stretch | Screens |
|---|---|
| Lights out, the line | 0.3 |
| Evil face up | 0.35 |
| The arc forms, the Assassin to the front | 0.4 |
| The dagger rises | 0.1 |
| The drift and the heartbeat | 0.6 |
| Your turn (the prompt) | 0.25 |
| Choice window | 0.5 |
| The strike (scrubbed only if no choice) | 0.25 |
| The ending (A or B, same length) | 1.25 |

`BLADE` is an eighth number in the frame loop after `CLIMB`, in the same unit as 004 to 009 (one old unit is 5 screens on a desktop, 4.4 on a phone). `BLADE = 0.8` on both (4.0 of 5, 3.5 of 4.4). The hero pin grows by about 4.0 screens. Phone stretches are the desktop ones times 0.88.

Ending A and B share the same 1.25 screen stretch. `blade.js` draws whichever one the choice picked. Inside it, ending A runs A1 0.3, A2 0.3, A3 0.3, A4 0.35. Ending B runs B1 0.15, B2 0.25, B3 0.2, B4 0.25, B5 0.2, B6 0.2.

## The camera

Reuse the night's camera object `{ a, fr, dz, tilt, ty }` ([005](005-the-night-falls.md)) and its long lens.

| Pose | When | Values (desktop; phone in brackets) |
|---|---|---|
| Rest | Steps 1 and 2 | `a` 90, `tilt` 28 (20), wide |
| The arc | Steps 3 to 8 | `a` 90, `tilt` about 16 (12), dolly so the arc spans about 84% of the screen width on a desktop (two rows filling about 90% of the width on a phone) and each standing card is about 30% of the screen tall on a desktop (about 19% on a phone, which is about 80 px wide at 360 px). The table sits low and dark behind the arc, the evil cards visible at their seats |
| Strike push | During a strike | From the arc pose, dolly about 1.12x toward the struck card over the strike, then back to the arc pose over the next 0.1 screen (timed when tapped, scrubbed when the Assassin chooses) |
| Ending | A1 to B6 | The arc pose, easing out to about 0.95x by the last line |

- The arc is in the cards layer, standing up (the 005 way: `rotateX(-tilt)` about the bottom edge), placed in the table plane just in front of the rim, so it tilts with the camera like everything else.
- The dagger is a 2D overlay above the stage (like 007's badge flight), positioned each frame from the screen boxes of the arc cards (`getBoundingClientRect`, once per frame while this chapter runs). Its height is about 30% of the screen on a desktop, 18% on a phone.
- **Hit size**: each arc card at least 64 px wide at 360 px (target about 80 px). The "Strike seat N" button at least 44 px tall.
- Measure the numbers in the real stage. The prototype's are only a guide.

## The dagger (decision 2)

- **Inline SVG** in `blade.js` as a string (about 1.5 KB before compression), the Gilded drawing from the prototype: tapered steel blade with a fuller line, a curved gold guard with a red stone, a dark grip with gold wire, a gold pommel with a red stone. A white glint band clipped to the blade, moved by `transform` along it.
- One dagger element. It points with `rotate()`: 0 degrees is tip up (rising from the Assassin's card), 180 is tip down (over a card). It follows its target with a soft spring each frame (about 16% of the remaining distance per frame), so aiming feels like a hand, not a jump.
- **Glints**: once as it rises (step 4), once as the drift slows (step 5), once just before any strike.

## The strike (decisions 5, 7 and 12)

One small state object in `blade.js`:

- `aim` (a seat or `null`), `choice` (`null` or `{ seat, by: 'tap' | 'scroll' }`), `t0` (the time of a tapped strike).
- `ending`: `'a'` when `choice.seat` is Merlin (seat 1), `'b'` otherwise. Before a choice is made it reads `null`.

Rules:

1. **The six cards are buttons only in the choice window**: `tabindex` 0, label "Seat {n}, {name}. Aim the blade here." (`blade.cardLabel`). Outside it, `tabindex` -1, and taps do nothing.
2. **Aim.** Mouse: hovering a card aims at it, leaving the arc clears the aim (the dagger returns above the middle). Touch: a tap on a card that is not aimed aims at it. Keyboard: focusing a card with Tab aims at it (only when focus is visible, so a touch tap that also focuses can't strike on its own). The aimed card gets a red ring. On touch, a "Strike seat {n}" button (`blade.strike`) appears under the arc.
3. **Strike.** A click on the aimed card (mouse), a second tap on it or the Strike button (touch), or Enter or Space (keyboard). The strike is a timed tween, about 1.5 s: the dagger turns tip down over the card (0.4 of it), rises a little (0.22), plunges fast (0.08), a short white flash (opacity, about 85%), the table shakes for about 0.1 s, and the card turns face up (the last 0.22). The camera does the strike push. Android buzzes once (decision 12).
4. **After a tapped strike** the cards stop being buttons, the hint fades, and the scene holds on the struck card until the scroll reaches the ending stretch. The ending then follows the scroll.
5. **No choice.** At the end of the window, `choice = { seat: 1, by: 'scroll' }`, the line "The Assassin chooses." shows, and the same strike is scrubbed across the strike stretch. No buzz.
6. **Rewind.** Scrolling back above the start of the choice window clears everything: `aim` and `choice` null, the struck card face down, cracks, ash, glows and layers gone, the dagger back over the middle. Coming back down plays it fresh.
7. **"See the other ending ↑"** (a real button, `blade.other`): scrolls (Lenis `scrollTo`) to the start of the choice window, which rewinds by rule 6. Visible only in the last 0.1 screen of the ending.
8. **One hint, once per pass.** The hint line is the step 6 line. The gold rim sweep plays once per pass (remembered in a variable for the page's life, not stored).
9. **Screen readers**: when an ending starts, a visually hidden live line reads "The blade found Merlin. Evil wins." (`blade.liveA`) or "The blade missed. {name} was loyal, not Merlin. The realm is saved." (`blade.liveB`). The dagger, cracks, ash and layers are `aria-hidden`.
10. **For chapter 8**: `blade.result()` returns `{ ending: 'a' | 'b' | null, chose: true | false }`. `chose` is true only when the visitor struck. [011](011-your-seat.md) reads it for the closing question and the invite message.

## The endings in detail

- **Cracks (A1)**: an SVG over Merlin's front face, `viewBox 0 0 100 150`, nine jagged lines from the wound (about 28% down the card, where the tip landed), each split into about three short segments, so about 27 segments that fade in one after another from the wound outward. Two strokes per segment: dark (`#120B08`) and a faint light edge offset by half a unit. The grey badge is a second badge picture with `grayscale(1)` set once (a fixed filter on a still element, not animated), faded in over the blue one.
- **Circles (A2)**: each blue circle shows a crack line (opacity) and then its red fill fades in over its blue. 0.06 screen apart, left to right.
- **Crimson (A3)**: the new crimson backdrop layer (see [Theme](#theme-decision-15)) rises to about 0.9, and a red radial glow rises from the evil cards' seats on the table (one element, opacity).
- **Ash (B2)**: about 40 small DOM flakes (dark greys, about a quarter of them ember orange), placed along the blade where it stands, each drifting up and to the side with its own speed and fading. The dagger fades out in the first 0.06 screen of B2. Positions come from the scroll, so it plays backwards on rewind.
- **Evil falls (B3)**: the Assassin's badge glow flickers about four times and goes out. The four evil cards scale to about 0.92, sink a little, and a grey layer over each rises to about 0.8.
- **Merlin in gold (B4)**: a soft gold glow behind Merlin's card rises, then the card turns face up slowly. If the struck card was Percival, Merlin is beside it in the arc, which makes the near miss plain.
- **Gold circles and dawn (B5)**: the gold fill fades in over each blue circle with a gold halo. The new dawn layer (a warm gradient from the bottom) rises to about 0.75.

## Theme (decision 15)

- `theme.js` gets two more numbers from 0 to 1, `setBlood(v)` and `setDawn(v)`, each driving one new CSS backdrop layer (`.silk-crimson`, `.silk-dawn` in `layout.mjs`, opacity only), on top of the dark. The shader is not changed. When either passes 0.5 nothing else switches: the text colours stay the dark ones.
- **The dark turn** is set by `blade.js` across step 1's first 0.05 screen (`theme.setDark` 0 to 1). Scrolling up above it brings the cream and chapter 6's gold back.
- **The characters section's turn is removed** from `cards.js` (the `onUpdate` that calls `theme.setDark` in the characters pin). Otherwise the page would turn cream again when the characters section starts. The section itself is removed in [011](011-your-seat.md); until then it shows on the dark page, which is fine.
- **Without a pin** (reduced motion, or no motion library): `theme.followScroll` marks the dark turn at the `blade` section's first line instead of `.role-item.evil`.
- Every layer follows the scroll both ways. Chapter 8 lowers crimson and dawn back to 0.

## Data (`src/data/blade.json`)

By seat number. The build checks: `evil` lists exactly the evil seats in `deck.json`; `assassin` is in `evil`; `arc` lists exactly the six loyal seats; `merlin` is in `arc`; `auto` is `merlin`.

```json
{
  "evil": [2, 4, 7, 9],
  "assassin": 2,
  "arc": [3, 6, 1, 5, 8, 10],
  "merlin": 1,
  "between": [1, 5],
  "auto": 1
}
```

## Words

Keys under `blade` in `en.json`, `zh.json`, `ms.json`. Chinese and Malay are the assistant's wording, to be read by a native speaker like the rest.

| Key | English |
|---|---|
| `blade.remains` | But one blade remains. |
| `blade.evilWin` | Evil can lose every quest and still win. |
| `blade.name` | Name Merlin, and everything goes to evil. |
| `blade.slows` | It slows between two. |
| `blade.percival` | All game, Percival played Merlin to draw the blade. |
| `blade.saw` | You saw everything tonight. The Assassin saw nothing. |
| `blade.where` | Where does the blade fall? |
| `blade.hintMouse` | Point at a card, then click. |
| `blade.hintTouch` | Tap to aim. Tap again to strike. |
| `blade.strike` | Strike seat {n} |
| `blade.cardLabel` | Seat {n}, {name}. Aim the blade here. |
| `blade.chooses` | The Assassin chooses. |
| `blade.merlin` | Merlin. |
| `blade.taken` | The win is taken back. |
| `blade.lost` | Three quests won. One name lost it all. |
| `blade.notMerlin` | Not Merlin. |
| `blade.hidden` | Merlin stayed hidden. |
| `blade.saved` | The blade missed. The realm is saved. |
| `blade.other` | See the other ending |
| `blade.liveA` | The blade found Merlin. Evil wins. |
| `blade.liveB` | The blade missed. {name} was loyal, not Merlin. The realm is saved. |
| `blade.orScroll` | Or keep scrolling, and the Assassin chooses. |
| `blade.how1` to `blade.how3` | The plain "the last strike" list (below) |

The hint picks `hintMouse` when `matchMedia('(hover: hover) and (pointer: fine)')` matches, otherwise `hintTouch`. Names in `cardLabel` and `liveB` come from `roles.*.name` (seats 3, 6, 8 and 10 are "Loyal Servant").

The plain list (scripts off, and the reduced motion section): if the loyal win three quests, the game is not over. The Assassin gets one guess: he names the player he thinks is Merlin. If he is right, evil wins the whole game. If he is wrong, the loyal win.

## How it is built

- **An eighth number in the frame loop.** `k` runs 0 to 1 after `c` (the climb). Timeline length becomes `1 + DEAL + NIGHT + VOTE + QUEST + LADY + CLIMB + BLADE`, and the pin length is `innerHeight x screens x` the same. Every earlier position is unchanged.
- **New `src/js/blade.js`** (target at most 7 KB compressed). It owns the hard cut, the evil reveal, the arc, the dagger (SVG, spring follow, glints), the drift and heartbeat, the choice state and input, the strike tween, both endings (cracks, ash, glows, layers), the rewind, the link, the haptics, the live lines and `result()`. `hero()` calls `blade.frame()` once per tick, and `blade.build(tl, at)` adds the scrubbed tweens. The bar's helpers come from `vote.js`.
- **Template**: a `blade` section in `src/templates/home.mjs` after `climb`. Without scripts it is a plain section showing ending A (below). With scripts it moves into the hero stage like the chapters before, and the plain text stays for screen readers.
- **Draw order**: the arc and the Assassin's standing card in the cards layer; the dagger, the ash and the flash as overlays above the stage under the words; the crimson and dawn layers in the backdrop; the score bar on top.
- **Reduced motion** (`?motion=off`): no pin, no camera, no dagger motion. A plain section: the opening lines, then the six loyal players as six plain buttons with their names and small paintings ("Seat 3, Loyal Servant" and so on), the line "Where does the blade fall?" and under them `blade.orScroll`. Ending A shows below by default. Choosing a button swaps in that ending with a 0.4 s fade (Merlin's card with the cracks drawn, or the struck card, Merlin in gold and the saved line), and `result()` reports it with `chose: true`. **Scripts off**: the opening lines, ending A as plain text ("The Assassin named Merlin. Evil wins. Three quests won. One name lost it all."), and the "last strike" list.
- **Cleanup**: `hero()`'s cleanup removes everything `blade.js` adds, removes the listeners, resets the state, and puts crimson and dawn at 0.
- **Performance**: about 70 new elements (40 of them ash). Only `transform` and `opacity` change per frame (the `put()` cache). The two fixed filters (the grey badge, the glow blur in the SVG) never animate. `will-change: transform` only on the dagger and on the struck card during a strike.

## Taste pass

From `.agents/skills/high-end-visual-design`, applied to what this chapter adds only:

- **Motion**: the strike tween uses `power3.inOut` for the turn over the card, `expo.out` for the rise, a fast `power3.in` for the plunge. The aim spring is a soft follow, never a snap. Scrubbed tweens follow the scroll by design.
- **No instant changes**: aim rings, the gold rim, glows, cracks, ash, the circles, the layers and the link all interpolate, including on rewind. The one deliberate jump is the hard cut, which still spans 0.05 screen.
- **Shadows and edges**: arc cards reuse `--card-edge` and `--card-shadow`. The aim ring is a soft red glow, not a hard border. The Strike button is a solid crimson pill with no grey border.
- **Blur**: none on anything that moves.
- **Phones and tablets**: below 768 px the arc is two rows of three (decision 6), the hint and the Strike button sit under the second row, and the stage uses `100dvh`. Tablets in portrait take the phone layout and camera, in landscape the desktop ones (the existing breakpoint in `cards.js`). The arc cards have `touch-action: manipulation` so a quick double tap never zooms, and nothing blocks scrolling.
- Not applied: its card chrome, pill buttons and eyebrow tags.

## What "done" looks like

| ID | Check |
|---|---|
| B-1 | Lights out: the gold, motes and pulse stop and the page turns dark across about 0.05 screen. Scrolling up brings the gold back |
| B-2 | The four evil cards turn face up one after another with burning badges |
| B-3 | The six loyal cards lift into the arc in the order 3, 6, Merlin, Percival, 8, 10 (two rows on a phone, Merlin above Percival), face down with ghost faces and seat numbers. The Assassin's card stands at the front centre. The dagger rises from it |
| B-4 | The dagger drifts across the arc and slows between Merlin and Percival with two heartbeats. An Android phone that has had a tap buzzes the double pulse once |
| B-5 | Mouse: hovering aims, a click strikes. Touch: the first tap aims and shows "Strike seat N", a second tap or the button strikes, a tap elsewhere moves the aim. Keyboard: Tab aims, Enter or Space strikes. A single touch tap never strikes on its own |
| B-6 | The strike: the dagger turns over the card, rises, plunges, a flash, a small shake and push in, and the card turns face up. Android buzzes once on a tapped strike only |
| B-7 | Striking Merlin plays ending A: cracks from the wound, grey badge, circles 1, 3 and 5 crack to red left to right, evil rises, crimson, the line, then the link |
| B-8 | Striking anyone else plays ending B: badge holds, ash, the Assassin's glow flickers out, evil sinks grey, Merlin turns in gold, circles turn gold, dawn, the line, then the link |
| B-9 | Not choosing: "The Assassin chooses.", the strike on Merlin is scrubbed, ending A plays |
| B-10 | Scrolling back above the choice window clears the choice and everything after it. "See the other ending ↑" does the same and lands at the choice. Both endings can be played in one visit |
| B-11 | The cards can't be tapped or tabbed to outside the choice window. A finger on the arc still scrolls the page. Words and layers follow the scroll both ways everywhere else |
| B-12 | `blade.result()` reports the right ending and `chose` after a tap, after no choice, and after choosing again |
| B-13 | English, Chinese and Malay fit with no overlap and no sideways scroll at 1280x720, 1024x1366 (tablet), 390x844 and 360x640. Arc cards at least 64 px wide at 360 px |
| B-14 | `?motion=off` shows six plain buttons, ending A by default, and the chosen ending with a fade. Scripts off show ending A as text and the "last strike" list. The page turns dark at the blade section in both |
| B-15 | No console errors. Scripts stay under 130 KB compressed (budget for this part: 7 KB). Frame rate on a mid range phone (AC-14) holds during the drift, the strike and the ash |

## Build plan (its own pass, after 009)

1. [Before you build](#before-you-build) checks. Stop if any fail.
2. `src/data/blade.json` with its build checks, the `blade` words in three languages, the `blade` template, the plain section (scripts off) and the reduced motion choice with both endings. This runs end to end before any 3D. (B-14)
3. Theme: `setBlood`, `setDawn`, the two backdrop layers, the dark turn hook, `followScroll`'s new marker, and the characters section's turn removed. (B-1, B-14)
4. `blade.js` scrubbed opening: the hard cut, evil face up, the arc, the Assassin to the front, the dagger rising, the drift and heartbeat, the prompt and the gold rim. (B-1 to B-4)
5. The choice layer: the button state, aim by mouse, touch and keyboard, the Strike button, the strike tween with the push in and the buzz, the no choice strike, rewind, the hint. (B-5, B-6, B-9, B-11)
6. Both endings, scrubbed: cracks and red circles and crimson; ash, the flicker, grey, Merlin in gold, gold circles and dawn. The link and `result()`. (B-7, B-8, B-10, B-12)
7. Check pass at the four sizes, three languages, motion off, WebGL off, scripts off, both endings, no choice, and scrolling back. Then the owner's look with a real mouse and phone. (B-13, B-15)
8. Write an "As built" section here with the real camera numbers, and tick the scope.

## Also changed by this plan

- [story_line.md](../scope/story_line.md): the chapter 7 section (camera facing the arc, the strike in place, aim then strike, ghost faces, the arc order, the hard cut, the link, the haptics) and decisions 25 to 31.
- [scope.md](../scope/scope.md): the chapter 7 entry links this plan and its build command, and marks the plan as written.

## Open points

1. **Vibration needs a tap first.** Chrome on Android only allows `navigator.vibrate` after the visitor has tapped the page. A visitor who only scrolls won't feel the heartbeat. The strike buzz always comes from a tap, so it works.
2. **Ghost faces and the table.** The ghosts are for the visitor only, which is the narrator rule the story uses since chapter 2. If a reader thinks the table can see them too, raise the card backs' opacity over the ghost a little.
3. **Tablet hit size.** At 1024x1366 portrait the arc is two rows. Check the cards are not oversized there.
4. **The trailer** still cuts to black before the card turns over (story line decision 10). Unchanged.

## As built (2026-11-17)

- **Files**: `src/js/blade.js` (new, 12 KB compressed, over the 7 KB target), `src/data/blade.json`, `cards.js` (`createBlade` after the climb, the characters pin removed), `theme.js` (`setBlood`, `setDawn`, `followScroll` marks `.blade`), `night.js` (poses `arc`, `wide`, `seat` as `S.w6` to `S.w8`; `night.noAsk`), `seats.js` (no hover or tap asking while `noAsk`), `layout.mjs` (the `.tint-crimson` and `.tint-dawn` layers sit above the shader so they show with WebGL), `home.mjs` (the `blade` section), `motion.js` (`goTo`), the i18n files (`blade.*`), `scripts/build.mjs` (the blade.json check).
- **Camera arc pose**: `f` 0.72, tilt 22 (phone 16), the arc's middle at 70% of the screen height on a desktop (58.5% on a phone), cards about 140 px wide at 1280x720 and 81 px at 360x640. The cards stand with the night's lift number worked out from the tilt (`liftFor`). Positions are worked out from screen places, converted to plane places, and blended to those absolute places so leftovers of earlier chapters (the Lady's swivel) cannot show.
- **Differences from the plan**: the strike's push in is a 10% scale up of the struck card, not a camera move; the table shake is a 4 px jitter of the whole ring (CSS `translate`); the Assassin's card sits low in the middle at 45% of an arc card's width (it did not fit below the arc at full size); the evil cards stand upright at 1.6 to 1.75 times their seat size; the crown hides by tweening `V.crown.s`, the Lady's card by element opacity; the circles use overlays (`.bl-red`, `.bl-gold`, `.bl-ck`) so the vote's own numbers are never touched; the evil glow, grey veil, gold glow, gold rim and aim ring are CSS variables on the seat card (`--bg`, `--gy`, `--gd`, `--rm`, `--am`).
- **Input**: a capture click handler on the ring (made before `seats.js`) swallows every card click while the chapter is on, so the card dialog and the seat labels' ask cannot open. Mouse: hover aims, click strikes. Touch and keyboard: the first press aims, the second strikes. `?debug` exposes `window.__bl` for tests.
- **Checked**: see the scope. **Open**: tablet, scripts off, a real phone (two tap aim, the buzz), the frame rate, keyboard strike, the rewind of a made choice, native read of the zh and ms lines.
