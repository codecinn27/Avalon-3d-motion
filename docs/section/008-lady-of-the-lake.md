# 008 Lady of the Lake (scroll story part 8, chapter 5)

**Status**: **BUILT 2026-11-16** (with 009, one pass), after the owner approved the plan the same day. Checked in headless Edge, see [As built](#as-built-2026-11-16). Still to do: the owner's look with a real mouse and phone, a real iPhone for open point 1, frame rate on a mid range phone, native read of zh and ms.
**Build command**: `/develop chp5-the-lady-of-the-lake`. Read [Before you build](#before-you-build) first.
**Story**: [story_line.md](../scope/story_line.md), chapter 5 Lady of the Lake. Rule shown: after quests 2, 3 and 4, the Lady's holder secretly sees one player's **side** (not their role), may tell the truth or lie about it, then hands the Lady to that player. Visitor: **touches the water** (the second hands-on moment, after chapter 4's quest cards).
**Model**: the same pinned stage and round table as [004](004-the-deal.md) to [007](007-the-quest.md).
**Comes after**: [007 The Quest](007-the-quest.md), which ends wide at rest (`a` 90, seat 1 at the front). Seat 3 is dimmed and sunk after the blame, the accusation lines are drawing out, the crown is on seat 3, and the score bar reads circle 1 blue, circle 2 red. **Leads into**: [009 The Climb](009-the-climb.md) (planned 2026-11-16). It starts wide, with the Lady card standing at seat 3, the water gone and the table back to wood.
**Code it will touch**: new `src/js/lady.js`, new `src/js/water.js`, `src/js/cards.js` (`hero`: the frame loop and timeline get a sixth number), `src/js/quest.js` (its blame lines clear into this chapter), `src/templates/home.mjs` (a `lady` template), `src/styles/main.css`, new `src/data/lady.json`, `src/i18n/*.json`, `scripts/build.mjs` (the Lady painting at three sizes)
**Prototype** (private page the owner chose from): Lady of the Lake Options (https://claude.ai/artifact/9f74hf8bdGZVvDx6TEnhCF). The **Recommended** option in each group is the one chosen. Its timings and colours are a starting point. Its code is not ported as is (see [The water](#the-water-decisions-5-and-6)).

## Summary

The Lady's painting rises full size in the middle of the screen, holds for a breath, then flies down and stands at Mordred's seat (seat 7). Mordred looks at seat 3, the Servant the table already blames. The middle of the table turns to still water and the camera sinks toward it. **The visitor touches the water**: on desktop it ripples after the mouse, and one tap (or the scroll) sends a ripple out. Seat 3's reflection rises in shadow, with only its badge lit **blue**. The camera pulls back, Mordred says **"Evil."**, and the table turns on seat 3 again. Merlin can't see this lie either, because Merlin can't see Mordred. Then the Lady passes to seat 3, and the water drains back to wood. Scrolling does everything a tap does, so nobody gets stuck.

## Decisions made (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 1 | **Chapter 5 gets its own plan and its own build**, after chapters 3 and 4 are built. Not part of their one pass | Owner ("separate this develop chapter 5 from chapter 3 and 4") |
| 2 | **Mordred looks at seat 3**, the Loyal Servant the table blamed in chapter 4. The water shows blue, he says "Evil", and his lie seals the Assassin's frame-up | Owner. Replaces "a Loyal Servant" in the story line. One lie stacks on another, which is the point of the design rule |
| 3 | **After "Evil", the table turns on seat 3 again, then the Merlin line.** Mordred's line (red, for the visitor only) draws first, then pale lines from the others. Seat 3 sinks further. Then: "Even Merlin can't see this lie." | Owner. True to the rules: Merlin sees the Assassin, Morgana and Oberon, never Mordred, so Merlin has no way to catch it |
| 4 | **Story licence on where the Lady starts.** By the rules she begins with the player to the right of the first leader (seat 1 in chapter 3), which is not seat 7. She simply wakes at seat 7, and no line says where she started. Chapters 3 and 4 do not change | Owner |
| 5 | **The painting arrives first (option A "The painting first").** The Lady card rises in the middle of the screen at about 68% of the screen height, holds, then flies down and becomes the small standing card at seat 7 | Owner, after trying both on the prototype. The first new painting since the quest cards gets its moment |
| 6 | **Touch = tap, with hover ripples (option B).** On a mouse, the water ripples softly under the pointer from the moment it forms until the camera pulls back. These ripples never reveal anything. One tap, click, Enter or Space on the water shows the truth. On touch screens it is a plain tap, and the water never blocks scrolling | Owner. "Stir" was dropped because a finger on the water can't scroll the page. "Hold" was dropped because a long press can open the phone's system menu |
| 7 | **Real ripples (option C).** A small water simulation where ripples bend what is under the surface. Drawn with WebGL in one canvas in the middle of the table. CSS rings when motion is reduced or WebGL is missing | Owner |
| 8 | **The water shows seat 3's reflection (option D).** Seat 3's card back, upside down and in shadow, with only its **blue badge** lit and a blue glow through the water. The role is never shown | Owner. Matches the story line ("the chosen card's reflection shows only a badge, and it is blue") and the rule (side, not role) |
| 9 | **Length about 2.6 screens on a desktop, 2.3 on a phone.** The tap window is 0.55 screen, the same as chapter 4's | Owner |
| 10 | **One short buzz on Android** (`navigator.vibrate(12)`) on the tap that reveals the truth. Not on a scroll reveal, and never when motion is reduced. iPhones ignore it | Owner |
| 11 | **The page stays cream.** Only the middle of the table turns to water. No palette turn in this chapter | Story line palette (chapters 3 to 6 are cream). Not asked: already decided |
| 12 | **Anti slop pass with the installed taste skill** (`.agents/skills/high-end-visual-design`, Leonxlnx taste-skill-classics "soft"). Only the rules that fit a 3D card scene apply (see [Taste pass](#taste-pass)). The approved look is not redesigned | Owner, same as 007 decision 18 |
| 13 | **CSS 3D with GSAP for the scene.** The one exception to "transform and opacity only" is the water canvas, which redraws its own pixels. No new libraries | Same as 002 to 007. Decision 7 is the owner's approved exception |

## Before you build

`/develop` checks these first. If any check fails, **stop and tell the owner**. Do not build a stand-in.

1. **Chapters 3 and 4 are built**: `src/js/vote.js` and `src/js/quest.js` exist, `cards.js` has `VOTE` and `QUEST` in the frame loop, and the score bar shows on the page. Chapter 5 is the sixth number after `QUEST`, and it starts from the table as chapter 4 leaves it.
2. **The props pipeline is wired**: `scripts/build.mjs` makes WebP files from `src/assets/props/` (007 build plan, step 1).
3. **This plan is approved**: the scope's chapter 5 entry has "plan approved" ticked (done 2026-11-16).
4. Read [007](007-the-quest.md) "As built" notes, if chapter 4's build left any, for the real camera numbers and the blame lines' class names. This plan names 007's planned values. Where they differ, the built ones win.

## What the visitor sees

Still inside the pinned hero stage, after the quest. Seat numbers follow `src/data/deck.json`: 1 Merlin, 2 Assassin, 3 Servant, 4 Morgana, 5 Percival, 6 Servant, 7 Mordred, 8 Servant, 9 Oberon, 10 Servant.

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **She wakes** | "After the second quest, the Lady of the Lake wakes." | Rest, wide | Chapter 4's blame lines finish fading. The Lady's painting rises from below the table in the middle of the screen, tilting up from about 18 degrees to face the visitor, growing to about 68% of the screen height (on a phone, about 80% of the width). Her name sits on the card as live text. She holds |
| 2 | **To Mordred** | (same line) | Rest | The painting shrinks and flies down to seat 7, where it becomes a small Lady card standing up in front of Mordred's seat, with a soft gold glow. Seat 7 shows a faint red under glow, for the visitor only |
| 3 | **He chooses** | "Mordred holds her." then "He looks at seat 3, the one the table blames." | Rest | A gold line draws across the table from seat 7 to seat 3. Seat 3 (still dim from chapter 4) lifts a little with a gold ring |
| 4 | **Still water** | "The table turns to still water." | Sinks toward the middle: `tilt` drops and the dolly pushes in (see [The camera](#the-camera)) | The gold line fades. The middle of the table (a circle about 58% of the table across) fades from wood to a dark lake green with dawn light at its upper left. Soft mist sits on it. On a mouse, the water starts to ripple under the pointer |
| 5 | **Your turn** (tap window) | "Touch the water." (the one hint, once) | Still, close | The water is a real button now. A soft ring of light pulses round its edge twice, once per visit. Small drips ripple it every two or three seconds. A tap sends a strong ripple out from that point (see [The reveal](#the-reveal-decisions-6-8-and-10)). After about 0.55 screen with no tap, the scroll does it from the middle |
| 6 | **The truth** | "She shows her holder one player's true side." then "Blue. Seat 3 is loyal." | Still, close | The mist clears. Through the ripples, seat 3's card back rises upside down in shadow, fading out toward its top. Only its blue badge is lit, with blue light spreading through the water. The ripples bend all of it |
| 7 | **The lie** | **The Lady never lies. The one holding her might.** | Pulls back to rest | The water dims. Above seat 7 the word "Evil." rises in crimson italic, standing and facing the visitor. A red line (visitor only) draws from seat 7 to seat 3 |
| 8 | **The table turns** | "Even Merlin can't see this lie." then "Merlin sees three traitors. Mordred is not one of them." | Rest | Pale lines follow from seats 2, 4, 6, 8, 10, 9 and 5, one by one, each card turning a little toward seat 3. Seat 3 sinks further (about 55% bright, scale about 0.88). Merlin (seat 1) does not point, and the "1 · Merlin" seat label shows briefly |
| 9 | **She moves on** | "She moves on." then "She wakes again after quests 3 and 4." | Rest | "Evil." and every line fade. The water fades back to wood. The Lady card glides along the back of the table, lifting a little in an arc, from seat 7 to seat 3, and stays standing there for chapter 6 |

Nine steps. Every step follows the scroll both ways, except the tap reveal in step 5, which plays over time when tapped (the same exception as chapter 4's taps).

### Scroll budget (about 2.6 screens on a desktop, 2.3 on a phone)

| Stretch | Screens |
|---|---|
| The painting rises and holds | 0.3 |
| Flies to seat 7 | 0.2 |
| Mordred chooses, gold line | 0.25 |
| Water forms, camera sinks | 0.3 |
| Tap window (water waits) | 0.55 |
| Scroll reveal (only if no tap) | 0.2 |
| Pull back, red line, "Evil." | 0.3 |
| The table turns, the Merlin line | 0.3 |
| The pass, water drains | 0.2 |

`LADY` is a sixth number in the frame loop after `QUEST`, in the same unit as 004 to 007 (one old unit is 5 screens on a desktop, 4.4 on a phone). `LADY = 0.52` on both (2.6 of 5, 2.3 of 4.4). The hero pin grows by about 2.6 screens. Phone stretches are the desktop ones times 0.88.

## The camera

Reuse the night's camera object `{ a, fr, dz, tilt, ty }` ([005](005-the-night-falls.md)) and its long lens, as 007 does.

| Pose | When | Values (desktop; phone in brackets) |
|---|---|---|
| Rest | Steps 1 to 3, 7 to 9 | `a` 90 (seat 1 at the front), `tilt` 28 (20), wide. Same as 007's rest |
| Into the water | Steps 4 to 6 | `a` 90, `tilt` about 12 (8), dolly so the water circle is about 62% of the screen height on a desktop and about 86% of the screen width on a phone, centred about 8% below the middle so the words above stay clear |

- The sink (step 4) and the pull back (step 7) each take at least 0.25 screen, eased with `power3.inOut`, so they read as one move.
- The painting overlay (steps 1 to 2) does not move the camera. The table stays wide behind it and dims to about 70% while the painting is up, like the rule cards in 007 step 1.
- Measure the numbers in the real stage, as 005 and 007 did. The prototype's are only a guide.
- **Hit size**: the water is one big button. At 360 px wide it must be at least 240 px across in the tap window. That is easy at 86% of the width.

## The painting (decision 5)

- **A 2D overlay**, outside the 3D table, like 007's badge flight. One `figure` holding the painting as a WebP `img` (`srcset` 320, 640 and 960 wide), the card edge (`--card-edge`, `--card-shadow`) and the name "Lady of the Lake" as live text near the bottom (key `lady.name`).
- **Rise** (scrubbed): from `translateY(25% of the stage)`, `rotateX(18deg)` with its own `perspective()`, `scale(.86)`, opacity 0, to centred, flat, `scale(1)`, opacity 1. `expo.out` feel, mapped onto the scroll.
- **Fly** (scrubbed): read the standing Lady card's screen box (`getBoundingClientRect` of the in-plane card, which is rendered all along at opacity 0) once per frame while this stretch runs. Move the overlay's centre onto it, scale its height down to match, and cross-fade the last 20% (overlay out, standing card in). Scrolling up plays it back the same way.
- **The standing card** lives in the table plane at seat 7, a quarter of the way in from the rim. It stands up facing the camera (`rotateX(-tilt)` about its bottom edge, the 005 way), about 14% of the table across.
- **Loading**: the 640 size loads when chapter 4's tap window starts, so it is ready long before it is shown. The 960 size is only for screens taller than 900 px.

## The water (decisions 5 and 6)

New `src/js/water.js`, its own small module so `lady.js` stays readable. It is created when chapter 5 is first reached, and the frame loop only runs it while the water shows (steps 4 to 8).

- **Where**: one `canvas` in the table plane, a circle 58% of the table across, centred, `border-radius: 50%` with `overflow: hidden` on its wrapper. It tilts with the table like everything else, so it sits on the table and is not a flat overlay. A carved inner rim (the table's existing `::after` ring) frames it.
- **Simulation**: a height field of 128 by 128 on the CPU, two `Float32Array`s, the classic "average of neighbours minus the previous frame" step with damping about 0.982. That is about 16,000 cells per frame, under 0.3 ms on a mid range phone. Run at the screen's frame rate, capped at 60.
- **Drawing (WebGL)**: the height field is uploaded each frame as a single channel byte texture (height mapped to 0 to 255). One fragment shader works out the surface slope from the neighbours, bends a **base texture** by it, and adds a soft dawn glint where the slope faces the light (upper left). Raw WebGL1, no library, the same style as `src/js/shader.js`. The canvas is drawn at the circle's screen size times `min(devicePixelRatio, 2)`, and the simulation stays at 128.
- **The base texture** is a small 2D canvas (256 by 256), redrawn only when the reveal changes (in 40 steps): the lake gradient (`#4F7A70` to `#2E5550` to `#173431`, a dawn gold patch at the upper left, taken from the Lady painting), faint light streaks so the refraction has something to bend, and, as the reveal grows, the blue glow, seat 3's card back flipped upside down (darkened to about 45%, fading toward its top), and the blue badge (`good-192.webp`) with a blue halo.
- **The mist** is one DOM layer over the canvas (a radial cream gradient). Only its opacity changes: about 0.55 while waiting, clearing to 0 with the reveal.
- **Ripples**: `drop(u, v, strength, radius)` with `u, v` from 0 to 1 across the circle. A hover moves at most one drop every 55 ms (strength small, radius 3). A tap drops strength 900, radius 6. Ambient drips fall every 1.6 to 3 s at a random spot, small.
- **Fallback**: if WebGL is missing or lost, draw the same thing with the 2D canvas `ImageData` path from the prototype at 128 by 128, scaled up by CSS. If motion is reduced, there is no simulation: a still lake image (the base texture) with CSS rings (`transform` and `opacity` only) for the tap.
- **Pointer position**: `offsetX` and `offsetY` on the canvas give coordinates in its own plane, even while it is tilted in 3D (Chrome, Firefox, Safari). Check this on a real iPhone (see [open points](#open-points)). If it is wrong there, ripples start from the middle on touch screens.
- **Cleanup**: on leaving the chapter's range (above or below), stop the loop and clear both height fields. On `hero()` cleanup, lose the WebGL context (`WEBGL_lose_context`) and remove the canvas.

## The reveal (decisions 6, 8 and 10)

The same pattern as 007's reveal, with one target instead of four. One small state object in `lady.js`:

- `fired` (`false`, `tap` or `scroll`), `t0` (the time of the tap).
- The reveal value `rv` (0 to 1) is `max(timed, scrubbed)`. `timed` runs from 0 to 1 over 1.5 s after a tap (`expo.out`). `scrubbed` maps the scroll reveal stretch from 0 to 1.

Rules:

1. **The water is a button only in the tap window and the scroll reveal stretch**: `role="button"`, `tabindex` 0, label "The Lady's water. Touch it to see seat 3's true side." (`lady.poolLabel`). Outside it, `tabindex` -1, no role, and taps do nothing (hover ripples still play from step 4 to step 7).
2. **A tap** (pointer down, Enter or Space) drops a strong ripple at that point (the middle for keys), starts the timed reveal, and calls `navigator.vibrate?.(12)` inside a `try`, unless motion is reduced. A second tap only makes a ripple.
3. **No tap**: when the scroll reaches the reveal stretch, one strong ripple drops in the middle, and the reveal is scrubbed.
4. **The rest of the chapter stays on the scroll.** A tap does not move the page. Steps 7 to 9 wait for the scroll whatever happened.
5. **Rewind**: scrolling back above the start of the tap window resets the reveal: `fired` false, the mist back, the reflection gone, the height fields cleared. Coming back down plays it fresh.
6. **One hint, once**: "Touch the water." is the step line for step 5 and the only hint. The edge pulse plays twice per visit (remembered in a variable for the page's life, not stored).
7. **Screen readers**: when `rv` reaches 1, a visually hidden live line reads "Blue. Seat 3 is loyal." (`lady.blue`). The painting overlay, the standing card, the lines and the water canvas are `aria-hidden`. The water button has its label.

## The lines and the lie (decisions 2 and 3)

- **Lines**: flat strips on the table, the same element and class pattern as 007's blame lines and the night's threads (`scaleX` from the speaker's end, soft shadow). Gold for Mordred's look (step 3), red for his lie (step 7, visitor only), pale cream for the others (step 8). They end about 6% of the table short of each seat, so they don't run under the cards.
- **Order after "Evil."**: seat 7 red first, then 2, 4, 6, 8, 10, 9, 5, spaced about 0.035 screen apart. Merlin (1) and seat 3 do not point. The same swivel as 007 (each card turns about a third of the way toward seat 3).
- **"Evil."**: live text (`lady.evil`), a standing element above seat 7, in the display face, italic, crimson `#C42A3A` with a soft red glow, about 8.5% of the table across in size. It rises a little and fades in over 0.05 screen.
- **Seat 3** goes from 007's dim (about 65%) down to about 55% bright and scale about 0.88 across step 8. It keeps that into chapter 6.
- **Hand off from 007**: 007's blame lines are still on the table when this chapter starts. They fade out over the first 0.1 screen of step 1, so the two sets never show at once.

## Data (`src/data/lady.json`)

By seat number (1 to 10, `deck.json` order), like `quest.json`. The build checks that the holder is evil, the target is loyal (so the water must show blue and the holder's word must be a lie), and every listed seat exists.

```json
{
  "after": 2,
  "holder": 7,
  "target": 3,
  "said": "evil",
  "turn": { "order": [2, 4, 6, 8, 10, 9, 5], "silent": [1] },
  "nextHolder": 3
}
```

## Words

Keys under `lady` in `en.json`, `zh.json`, `ms.json`. Chinese and Malay are the assistant's wording, to be read by a native speaker like the rest.

| Key | English |
|---|---|
| `lady.name` | Lady of the Lake |
| `lady.wakes` | After the second quest, the Lady of the Lake wakes. |
| `lady.holds` | Mordred holds her. |
| `lady.looks` | He looks at seat 3, the one the table blames. |
| `lady.still` | The table turns to still water. |
| `lady.touch` | Touch the water. |
| `lady.shows` | She shows her holder one player's true side. |
| `lady.blue` | Blue. Seat 3 is loyal. |
| `lady.evil` | Evil. |
| `lady.never` | The Lady never lies. |
| `lady.might` | The one holding her might. |
| `lady.merlin` | Even Merlin can't see this lie. |
| `lady.merlinWhy` | Merlin sees three traitors. Mordred is not one of them. |
| `lady.moves` | She moves on. |
| `lady.again` | She wakes again after quests 3 and 4. |
| `lady.poolLabel` | The Lady's water. Touch it to see seat 3's true side. |
| `lady.how1` to `lady.how5` | The plain "how the Lady works" list (below) |

Suggested: `lady.name` 湖中仙女 / Puteri Tasik. `lady.evil` 邪恶。/ Jahat.

The plain list (scripts off, and the reduced motion section): after quests 2, 3 and 4, whoever holds the Lady chooses one player. They secretly see that player's side, loyal or evil, but not the role. They may tell the table the truth or lie. Then they hand the Lady to that player. Someone who has already held the Lady can't be chosen.

## How it is built

- **A sixth number in the frame loop.** `l` runs 0 to 1 after `u` (the quest). Timeline length becomes `1 + DEAL + NIGHT + VOTE + QUEST + LADY`, and the pin length is `innerHeight x screens x` the same. Every earlier position is unchanged.
- **New `src/js/lady.js`** (target at most 5 KB compressed). It owns the painting overlay, the standing card, the pass, the lines, "Evil.", the seat 3 sink, the reveal state, the hint and the live line. `hero()` calls `lady.frame()` once per tick, and `lady.build(tl, at)` adds the scrubbed tweens, like `night.build` and `quest.build`. The bar, the crown and the blame lines' helpers come from `vote.js` and `quest.js`.
- **New `src/js/water.js`** (target at most 3 KB compressed): `water.create(parent)`, `water.drop(u, v, s, r)`, `water.setReveal(rv)`, `water.frame(dt)`, `water.destroy()`. The WebGL path, the 2D fallback and the still path all sit behind those five calls.
- **Images**: `scripts/build.mjs` makes `lady_of_the_lake` as 320, 640 and 960 wide WebP files from `src/assets/props/` (quality about 74). The card back and `good-192.webp` already exist.
- **Draw order**: the water wrapper sits in the table plane under the cards layer (`translateZ` about 1px), the lines in `.n-under` with the threads, the standing card and "Evil." in the cards layer, the painting overlay above the stage with the words, and the score bar on top.
- **Template**: a `lady` section in `src/templates/home.mjs` after `quest`. Without scripts it is a plain section (see below). With scripts it moves into the hero stage like `night` and `quest`, and the plain text stays for screen readers.
- **Reduced motion** (`?motion=off`): no pin, no camera, no simulation. A plain section: the lines in order, the Lady painting as a normal image, then the still lake with a real button "Touch the water". It reveals the reflection and badge with a fade (0.4 s), then the remaining lines show. **Scripts off**: the lines, a sentence that says what happened ("Mordred saw that seat 3 is loyal, and told the table seat 3 is evil."), and the "how the Lady works" list.
- **Performance**: about 25 new elements. Only `transform` and `opacity` change per frame on them (the `put()` cache). The water canvas is the one exception: it redraws only while steps 4 to 8 show, and it pauses when the hero is off screen, like the frame loop. No CSS `filter` or `backdrop-filter` on anything that moves.

## Taste pass

From `.agents/skills/high-end-visual-design`, applied to what this chapter adds only:

- **Motion**: the timed reveal uses `expo.out`, and the ring and pulse use the site's spring curve (`--ease`, `cubic-bezier(.32,.72,0,1)`). Never `linear` or plain `ease-in-out` on a timed tween. Scrubbed tweens follow the scroll by design.
- **No instant changes**: the mist, glow, reflection, lines, "Evil." and the seat 3 sink all interpolate, including on rewind. The water's button state can switch instantly, since it has no look of its own.
- **Shadows and edges**: the painting and the standing card reuse `--card-edge` and `--card-shadow`, plus a soft gold halo. Lines get a soft, diffused shadow. No grey 1 px borders, no hard black shadows.
- **Blur**: none on moving things. The painting overlay gets no `backdrop-filter`. The table's dim is an opacity layer, not a blur.
- **Phones and tablets**: below 768 px the painting is sized by width (about 80%) instead of height. The words keep their place under the bar. The stage uses `100dvh`, never `100vh`. Tablets in portrait take the phone camera numbers and in landscape the desktop ones (the existing breakpoint in `cards.js`). The water is never `touch-action: none`, so a finger that lands on it can still scroll the page (decision 6).
- **Performance**: `will-change: transform` only on the painting overlay while it moves and on the standing card during the pass.
- Not applied: its card chrome, pill buttons and eyebrow tags. The look is approved and is not redesigned.

## What "done" looks like

| ID | Check |
|---|---|
| L-1 | The painting rises in the middle at about 68% of the screen height (80% of the width on a phone), holds, flies to seat 7 and becomes the standing card with no jump. Scrolling up plays it back |
| L-2 | The gold line runs from seat 7 to seat 3. Seat 3 lifts with a gold ring |
| L-3 | The camera sinks toward the middle, the wood turns to water, and with a mouse the water ripples under the pointer with no reveal |
| L-4 | In the tap window, a tap, click, Enter or Space on the water drops a ripple at that point and reveals seat 3's upside down reflection and blue badge, bent by the ripples. An Android phone buzzes once |
| L-5 | With no tap, the scroll drops a ripple in the middle and scrubs the same reveal. Scrolling back above the tap window clears it, and it can be played again |
| L-6 | The camera pulls back, "Evil." rises at seat 7, the red line comes first, then pale lines from 2, 4, 6, 8, 10, 9 and 5. Merlin and seat 3 don't point. Seat 3 sinks further. The Merlin line shows |
| L-7 | The Lady glides from seat 7 to seat 3 and stays. The water drains back to wood. The lines and "Evil." are gone. Chapter 6 starts from this picture |
| L-8 | The water can't be tapped or tabbed to outside its window. A finger on the water still scrolls the page. Words follow the scroll both ways everywhere else |
| L-9 | English, Chinese and Malay fit with no overlap and no sideways scroll at 1280x720, 1024x1366 (tablet), 390x844 and 360x640. The water is at least 240 px across at 360 px wide |
| L-10 | `?motion=off` shows the lines, the painting, a still lake and a real "Touch the water" button that fades in the reveal. Without WebGL, the 2D fallback ripples. Scripts off show the lines, the plain sentence and the "how the Lady works" list |
| L-11 | No console errors. Scripts stay under 130 KB compressed (budget for this part: 8 KB, `lady.js` plus `water.js`). Frame rate on a mid range phone (AC-14) holds while the water runs. The water loop stops outside steps 4 to 8 |

## Build plan (its own pass, after 006 and 007)

1. [Before you build](#before-you-build) checks. Stop if any fail.
2. `scripts/build.mjs`: the Lady painting at 320, 640 and 960 wide.
3. `src/data/lady.json` with its build checks, the `lady` words in three languages, the `lady` template, and the plain section (scripts off and `?motion=off`). This runs end to end before any 3D. (L-10)
4. `water.js` on its own: the simulation, the WebGL draw, the base texture, the 2D fallback, the still path, `destroy()`. Try it on a flat test circle before it goes on the table. (L-3, L-4)
5. `lady.js` scrubbed timeline: the painting rise and fly, the standing card, the gold line, the camera sink and pull back, the water's fade in and out, the scrolled reveal, "Evil.", the lines and swivels, the seat 3 sink, the pass, and the hand off from 007's lines. (L-1, L-2, L-5, L-6, L-7)
6. The tap layer: the button state, hover ripples, taps and keys, the timed reveal, the buzz, rewind, the hint pulse, the live line. (L-4, L-5, L-8)
7. Check pass at the four sizes, three languages, motion off, WebGL off (`?webgl=off` must also make the water take its 2D path), scripts off, and scrolling back. Then the owner's look with a real mouse and phone. (L-9, L-10, L-11)
8. Write an "As built" section here with the real camera numbers and any changes, and tick the scope.

## Also changed by this plan

- [story_line.md](../scope/story_line.md): the game table (Mordred looks at seat 3), the chapter 5 section (steps, words, camera, scroll 2.6, needs) and decision 19.
- [007](007-the-quest.md) "Leads into" and open point 4 now point here.
- [scope.md](../scope/scope.md): the chapter 5 entry links this plan and its build command, and marks the plan as written.

## Open points

1. **Pointer position on a tilted canvas in iOS Safari.** Chrome and Firefox give `offsetX` in the element's own plane. Check it on a real iPhone. If it is wrong, touch ripples start from the middle (mouse ripples are unaffected on desktop Safari, which is checked at the same time).
2. ~~**Seat 3 holds the Lady in chapter 6.**~~ Settled in [009](009-the-climb.md) decision 2: seat 3 looks at the Assassin, sees red and tells the truth.
3. **The painting in a paid ad.** [003-props](../images/003-props.md) decision 10 still applies: the Lady's bare back may be flagged if the trailer runs as a Facebook or Instagram ad. On the page she now shows large for about half a screen.
4. **Words and taps.** As in 007, the tapped reveal plays over time. Everything else follows the scroll.

## As built (2026-11-16)

- **Files**: `src/js/lady.js` (painting, standing card, lines, "Evil.", the touch, the pass; also exports `lineSet` and `initLadyPlain`), `src/js/water.js` (WebGL, 2D and still paths behind `createWater`), `src/data/lady.json` (checked by `scripts/build.mjs`: holder evil, target loyal, the word a lie), the `lady` words in three languages, a `lady` template, the painting at 320, 640 and 960 wide. `quest.js` now exports its card faces, `turnShape` and the badge flight helpers, and returns `B` (`B.out` clears its blame lines). `night.js` has more camera poses: `S.w3` (water), `S.w4` (chapter 6's flash), `S.w5` (chapter 6's push on five cards).
- **Camera**: pose `water` is `a` 90, `tilt` 12 (8 on a phone), zoom worked out per screen so the water is 62% of the height (86% of the width on a phone), centred at 58% of the height, in `measure()` like the quest's poses. The sink and the pull back each take 0.3 screen.
- **The painting** is a 2D overlay centred 62% down the stage, 66% of the screen tall (80% of the width on a phone at most). The fly reads the standing card's box each frame while it moves.
- **The touch**: the tap window starts at 1.05 and the scroll reveal runs 1.6 to 1.8 (screens from the start of the chapter). A tap drops strength 900, radius 6 and runs the reveal over 1.5 s (`expo.out`); hover drops 260, radius 3, at most every 55 ms; drips every 2 to 3 s in the tap window. `navigator.vibrate(12)` on a tap, never with reduced motion. Scrolling back above the window clears the reveal.
- **Words** turn cream while the camera is in the water on a desktop (`.on-table`, like the quest) and keep their ink with a cream halo on a phone (`.on-wood`), because there the table only reaches the words on a small screen.
- **"Evil."** stands beside the Lady's seat (outward from the table), not above it, so it never runs into the words at the top. The "1 · Merlin" label shows above seat 1.
- **Two fixes outside this chapter** that the water needed: the hero's headline lines (`.hero .copy .h1`) and the story section (`.hero.is-staged .how`) now ignore the pointer, because they sat invisibly over the middle and lower half of the screen and swallowed taps.
- **Sizes** (gzip, unminified): `lady.js` 7.9 KB and `water.js` 4.6 KB, against targets of 5 and 3. All the page's scripts are 119 KB, under the 130 KB limit.
- **Checked**: 1280x720, 1024x1366, 390x844 and 360x640; English and Chinese; mouse tap, touch tap, scroll reveal, rewind from chapter 6 back into chapter 5; `?webgl=off` (the 2D path ripples); `?motion=off` (still lake and a button that fades the reflection in); no console errors. Not checked: a real iPhone, frame rate on a phone, Malay on screen.
