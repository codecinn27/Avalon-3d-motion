# 009 The Climb (scroll story part 9, chapter 6)

**Status**: **BUILT 2026-11-16** (with 008, one pass), after the owner approved the plan the same day. Checked in headless Edge, see [As built](#as-built-2026-11-16). Still to do: the owner's look with a real mouse and phone, frame rate during the celebration on a mid range phone, native read of zh and ms.
**Build command**: `/develop chp6-the-climb`. Read [Before you build](#before-you-build) first.
**Story**: [story_line.md](../scope/story_line.md), chapter 6 The Climb. Rule shown: the first side to three quests wins, the leader moves one seat each round, and at seven players or more quest 4 needs **two** Fail cards. Visitor: **watches** (the visitor rhythm puts a watch chapter between the water in chapter 5 and the blade in chapter 7).
**Model**: the same pinned stage and round table as [004](004-the-deal.md) to [008](008-lady-of-the-lake.md).
**Comes after**: [008 Lady of the Lake](008-lady-of-the-lake.md), which ends wide at rest (`a` 90, seat 1 at the front). The Lady card stands at seat 3, the water is gone, seat 3 is dim (about 55% bright, scale about 0.88), the crown is on seat 3, and the score bar reads circle 1 blue, circle 2 red. **Leads into**: [010 The Blade](010-the-blade.md), which starts from this chapter's last picture: gold light over the table, gold motes rising, circles 1, 3 and 5 blue and pulsing, circles 2 and 4 red, "Good has won." on screen.
**Code it will touch**: new `src/js/climb.js`, `src/js/cards.js` (`hero`: the frame loop and timeline get a seventh number), `src/js/vote.js` (crown, bar), `src/js/quest.js` (laying, shuffling, turning and the badge flight), `src/js/lady.js` and `src/js/water.js` (the Lady's standing card, lines, the word above a seat, and a short water flash), `src/templates/home.mjs` (a `climb` template), `src/styles/main.css`, new `src/data/climb.json`, `src/i18n/*.json`
**Prototype** (private page the owner chose from): The Blade Options (https://claude.ai/artifact/6Vfoq87LKyrryHoieP1FuD), group 1. The owner picked **C, Celebration**. Its timings are a starting point. Its code is not ported as is.

## Summary

Three fast quests, cut to the scroll. Quest 3: Morgana leads a team of four and plays Success to keep the table's trust, so the score goes 2 : 1. The Lady wakes again, and this time the truth comes out: seat 3, the Servant everyone blamed, looks at the Assassin in a quick flash of water, sees red, and says "Evil." Quest 4: Percival leads and **trusts the wrong Merlin**. He takes Morgana and Mordred, and two Fails sink it, so it's two all with one quest left. The Lady wakes once more: the Assassin looks at Percival and says nothing. Quest 5: seat 6 holds the crown, but Percival names the team as if he sees everything (**Percival plays Merlin. On purpose.**). Five Success. Gold light floods the page, gold motes rise, the circles pulse like a win screen, and **Good has won.** holds long enough to feel like the end. Watch only. Every step follows the scroll both ways.

## Decisions made (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 1 | **Plan chapters 6, 7 and 8 together, each in its own file**: 009 The Climb, [010 The Blade](010-the-blade.md), [011 Your Seat](011-your-seat.md). Each gets its own `/develop` command | Owner. Chapter 7 starts from this chapter's last picture, so the hand off is designed here, not assumed |
| 2 | **After quest 3, seat 3 holds the Lady and looks at the Assassin (seat 2).** The water shows red, seat 3 says "Evil.", and it is the truth. The Lady passes to seat 2 | Owner. The framed Servant gets the truth out, the table turns on the real traitor, and the Assassin's last strike in chapter 7 feels like revenge. By the rules a past holder (seat 7, Mordred) can't be chosen, so seat 2 is allowed |
| 3 | **A quick water flash, watch only**, about 0.35 screen. It reuses chapter 5's water with a red badge. "Evil." rises at seat 3 in **gold**, because this time it is the truth (chapter 5's lie was crimson) | Owner. Echoes chapter 5's lie with its opposite, for almost no new code |
| 4 | **After quest 4, the Lady wakes once more with one line, no reveal.** The Assassin holds her, looks at Percival (seat 5) and says nothing. She passes to seat 5 | Owner ("one line, no reveal"). The target is a recommendation: it plants the Assassin's doubt about Percival for chapter 7's dagger |
| 5 | **The bluff, rule true.** The crown moves one seat per team (quest 2 was led by seat 3), so quest 3 is led by seat 4, quest 4 by seat 5, quest 5 by seat 6. **Quest 4: Percival leads and trusts the wrong Merlin** (he takes Morgana, one of his two "Merlins", and Mordred). **Quest 5: seat 6 leads, but Percival names the team** as if he sees everything | Owner, after hearing Percival can't lead quest 5 by the rules. The bluff now has a reason: after quest 4 Percival knows Morgana is the fake, so he knows the real Merlin and draws the blade toward himself |
| 6 | **Teams arrive by the crown**: the crown slides, the team lifts with gold rings, one line, "Approved." No vote cards. The reject track stays clear | Owner. Chapter 3 already taught voting |
| 7 | **Quest 4 is watched, with a heavy double Fail.** The five cards turn by themselves: three Success together, then a Fail, a pause, and a second Fail, heavier. Both red badges fly into circle 4 | Owner. Chapter 6 is a watch chapter |
| 8 | **The false ending is option C, Celebration.** Gold light fills the page, about two dozen gold motes rise, the five circles pulse, and "Good has won." holds for about 0.45 screen. The hard cut to dark is the first step of chapter 7 ([010](010-the-blade.md) decision 3) | Owner, after trying A, B and C on The Blade Options |
| 9 | **Length about 2.4 screens on a desktop, 2.1 on a phone** | Owner |
| 10 | **The page stays cream until the gold.** The gold light is a stage layer over the cream backdrop, not a new theme. Chapter 7 turns the page dark | Story line palette (chapters 3 to 6 cream, gold light at the end of chapter 6) |
| 11 | **Anti slop pass with the installed taste skill** (`.agents/skills/high-end-visual-design`). Only the rules that fit a 3D card scene apply (see [Taste pass](#taste-pass)). The approved look is not redesigned | Owner, same as 007 decision 18 and 008 decision 12 |
| 12 | **CSS 3D with GSAP, no new libraries.** Transform and opacity only (AC-8), except the short water flash, which reuses chapter 5's canvas (its approved exception) | Same as 002 to 008 |

## Before you build

`/develop` checks these first. If any check fails, **stop and tell the owner**. Do not build a stand-in.

1. **Chapters 3, 4 and 5 are built**: `src/js/vote.js`, `src/js/quest.js`, `src/js/lady.js` and `src/js/water.js` exist, and `cards.js` has `VOTE`, `QUEST` and `LADY` in the frame loop. Chapter 6 is the seventh number after `LADY`, and it starts from the table as chapter 5 leaves it.
2. **This plan is approved**: the scope's chapter 6 entry has "plan approved" ticked.
3. Read the "As built" notes in [006](006-the-vote.md), [007](007-the-quest.md) and [008](008-lady-of-the-lake.md), if their builds left any, for the real camera numbers, class names and helper names. This plan names their planned values. Where they differ, the built ones win.
4. `water.js` can draw a reveal for any seat and either badge. If chapter 5 built it for seat 3 and the blue badge only, add a small `water.setTarget({ seat, side })` first (see [The Lady flash](#the-lady-flash-decisions-2-and-3)).

## What the visitor sees

Still inside the pinned hero stage. Seat numbers follow `src/data/deck.json`: 1 Merlin, 2 Assassin, 3 Servant, 4 Morgana, 5 Percival, 6 Servant, 7 Mordred, 8 Servant, 9 Oberon, 10 Servant.

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **Quest 3, the team** | "Quest 3. Morgana leads." then "Approved." | Rest | The crown slides from seat 3 to seat 4. Seats 4, 1, 5 and 10 lift with gold rings |
| 2 | **Quest 3, the cards** | "Even Morgana plays Success. She needs their trust." | Small push on the middle | Four cards slide face down to the middle. Morgana's glints red as it leaves her seat (visitor only). One quick swap. All four turn together: four Success. Circle 3 fills blue. The cards fade |
| 3 | **The Lady, again** | "The Lady wakes again. Seat 3 looks at the Assassin." | Rest, then a short sink toward the middle | A gold line draws from seat 3 to seat 2. The middle turns to water for a beat, one ripple runs out, and seat 2's card back rises upside down in the reflection with only its **red** badge lit |
| 4 | **The truth** | "Red." then "This time, the truth." | Pulls back to rest | The water drains. "Evil." rises above seat 3 in **gold** italic. Seat 3 lifts back to full brightness and size. Pale lines draw from seats 6, 8, 10 and 5 toward seat 2, and seat 2 dims a little. The Lady glides from seat 3 to seat 2 |
| 5 | **Quest 4, the team** | "Percival leads. He trusts the wrong Merlin." then "Approved." | Rest | The lines and "Evil." fade. The crown slides to seat 5. Seats 5, 4, 7, 6 and 8 lift with gold rings. Percival's card and Morgana's card shine the same gold for a moment, like the night (005 step 4) |
| 6 | **Quest 4, the rule** | "At ten players, quest four needs two Fails." | Small push on the middle | Five cards slide face down to the middle. Morgana's and Mordred's glint red as they leave (visitor only). One quick swap |
| 7 | **Two Fails** | **Two all. One quest left.** | Short hold | Three Success turn together. Then the fourth turns: Fail, heavy, red light spreads. A pause. The fifth: Fail, slower and heavier. Both red badges lift off and fly into circle 4, which fills red. The cards fade |
| 8 | **The Lady, once more** | "She wakes once more. The Assassin looks at Percival, and says nothing." | Rest | A faint gold line from seat 2 to seat 5, then the Lady glides to seat 5 and stays |
| 9 | **Quest 5, the team** | "Seat 6 leads. Percival names the team." then **Percival plays Merlin. On purpose.** | Rest | The crown slides to seat 6. A thin gold pointer sweeps from Percival's seat to each chosen seat in turn, and each lifts with a gold ring: 1, 3, 10, then 6 and 5. Merlin's card does nothing |
| 10 | **Quest 5, the cards** | "Five Success." | Small push on the middle | Five cards slide to the middle, no glints, all five turn together: five Success. Circle 5 fills blue. The cards fade |
| 11 | **Good has won** | **Good has won.** | Slow pull back, a little wider than rest | Gold light floods the stage. About two dozen gold motes rise. The five circles pulse together. Held for about 0.45 screen, long enough to feel like the end |

Eleven steps. Every step follows the scroll both ways. Nothing in this chapter can be tapped.

### Scroll budget (about 2.4 screens on a desktop, 2.1 on a phone)

| Stretch | Screens |
|---|---|
| Quest 3 team | 0.2 |
| Quest 3 cards, circle 3 | 0.25 |
| The Lady flash and the truth, pass to seat 2 | 0.35 |
| Quest 4 team, the gold shine | 0.25 |
| Quest 4 cards and the double Fail, circle 4 | 0.35 |
| The Lady once more, pass to seat 5 | 0.12 |
| Quest 5 team, Percival names it | 0.25 |
| Quest 5 cards, circle 5 | 0.18 |
| Good has won (celebration hold) | 0.45 |

`CLIMB` is a seventh number in the frame loop after `LADY`, in the same unit as 004 to 008 (one old unit is 5 screens on a desktop, 4.4 on a phone). `CLIMB = 0.48` on both (2.4 of 5, 2.1 of 4.4). The hero pin grows by about 2.4 screens. Phone stretches are the desktop ones times 0.88.

## The camera

Reuse the night's camera object `{ a, fr, dz, tilt, ty }` ([005](005-the-night-falls.md)) and its long lens, as 007 and 008 do. Quick zooms, timed to the scroll, never a cut.

| Pose | When | Values (desktop; phone in brackets) |
|---|---|---|
| Rest | Steps 1, 4, 5, 8, 9 | `a` 90 (seat 1 at the front), `tilt` 28 (20), wide. Same as 007's rest |
| Small push | Steps 2, 6, 7, 10 | Rest, dolly about 1.4x (1.25x) on the middle. Same as 007 step 2 |
| Short sink | Step 3 | `tilt` about 16 (12), dolly so the water circle is about 50% of the screen height on a desktop and 76% of the width on a phone. Shallower than chapter 5's sink |
| Wide | Step 11 | Rest, dolly about 0.92x, so the table and the full score bar sit in the gold together |

- Each push in or out takes at least 0.08 screen, eased with `power3.inOut`, so the fast cuts read as moves, not jumps.
- Measure the numbers in the real stage. The ones here are from 007 and 008's plans.

## The quests (decisions 5, 6 and 7)

Reuse `quest.js` for laying, the shuffle, turning and the badge flight. No new card art: Success and Fail fronts, the role card back.

- **Faces are fixed** in this chapter (nobody taps), so each card's face is set when it is built. Quest 4's order of turning is fixed too: three Success, then the two Fails last.
- **Glints** (visitor only): a short red glint on the card as it leaves an evil player's seat, the same as 007 step 2. Quest 3: seat 4. Quest 4: seats 4 and 7. Quest 5: none.
- **The double Fail** (step 7): the first Fail uses 007's heavy Fail (lift, hesitation, slow turn, red light). The pause between the two Fails is about 0.04 screen. The second Fail lifts higher, hesitates longer, and its red light spreads wider. Then both badges fly into circle 4 one after the other, 0.02 screen apart, and circle 4 fills red after the second lands.
- **Team lifts**: gold rings like 007 step 4. In step 9 a thin gold strip (the threads' element) sweeps from seat 5 to each chosen seat in turn, then fades, so the visitor sees Percival is the one choosing.
- **The gold shine** (step 5): Percival's and Morgana's cards glow the same gold together for about 0.06 screen. It repeats chapter 2's "Percival sees two Merlins" so the visitor knows why he takes her.

## The Lady flash (decisions 2 and 3)

- Reuse `water.js` in a short, watch only mode: no button state, no hover ripples, no hint. `water.setTarget({ seat: 2, side: 'evil' })` makes the base texture show seat 2's card back with the **red** badge (`evil-192.webp`) and a red glow, instead of seat 3 and blue.
- **Timeline** (inside the 0.35 screen): gold line 0.05, water fades in with the short sink 0.07, one strong ripple in the middle and the reveal scrubbed from 0 to 1 over 0.08, the water drains with the pull back 0.06, "Evil." and the lines 0.05, the pass to seat 2 0.04.
- **"Evil."** reuses chapter 5's standing word element, but in **gold** (`--candle`, `#D9A441`) with a soft gold glow, above seat 3. Key: `lady.evil` (already exists).
- **Seat 3 is restored**: from chapter 5's dim (about 55%, scale 0.88) back to full over step 4. Seat 2 dims to about 80%. That is all the table's reaction: no swivels, so it stays fast.
- The water loop only runs during step 3, and stops and clears as soon as step 4 begins, both ways.

## The celebration (decision 8)

- **Gold light**: one stage layer (a radial gradient in the candle gold, centred a little below the middle) whose opacity rises from 0 to about 0.85 over the first 0.1 screen of step 11. Not a theme change, and no `filter`.
- **Motes**: about 24 small gold dots (DOM, `transform` and `opacity` only), each with its own speed, size and sway, rising through the stage. Their positions are worked out from the scroll, not a timer, so they run backwards when the visitor scrolls up. While the visitor holds still in step 11 they keep a slow drift, the one place a small loop runs (it stops outside step 11).
- **Circles pulse**: the five circles on the score bar scale between 1 and about 1.08 in time with each other, with a soft gold halo on the blue ones.
- **"Good has won."** sits in the display face at the trailer title size, centred above the table.
- Chapter 7 starts with the lights snapping off. Nothing in this chapter fades the gold out.

## Data (`src/data/climb.json`)

By seat number (1 to 10, `deck.json` order), like `quest.json` and `lady.json`. The build checks: team sizes are 4, 5 and 5 (the ten player sizes for quests 3 to 5); each leader is the seat after the last; quest 4 has two fails, both by evil seats; every Lady target is not a past holder (7 and 3 by then); a loyal holder's word matches what the water showed; the score ends 3 : 2.

```json
{
  "quests": [
    { "n": 3, "leader": 4, "team": [4, 1, 5, 10], "result": "success", "glint": [4] },
    { "n": 4, "leader": 5, "team": [5, 4, 7, 6, 8], "result": "fail", "fails": [4, 7], "needs": 2, "shine": [5, 4] },
    { "n": 5, "leader": 6, "team": [1, 3, 10, 6, 5], "result": "success", "namedBy": 5 }
  ],
  "lady": [
    { "after": 3, "holder": 3, "target": 2, "saw": "evil", "said": "evil", "reveal": "flash", "turn": [6, 8, 10, 5] },
    { "after": 4, "holder": 2, "target": 5, "said": null, "reveal": "none" }
  ],
  "score": ["success", "fail", "success", "fail", "success"]
}
```

## Words

Keys under `climb` in `en.json`, `zh.json`, `ms.json`. Chinese and Malay are the assistant's wording, to be read by a native speaker like the rest.

| Key | English |
|---|---|
| `climb.q3lead` | Quest 3. Morgana leads. |
| `climb.approved` | Approved. |
| `climb.q3cards` | Even Morgana plays Success. She needs their trust. |
| `climb.ladyAgain` | The Lady wakes again. Seat 3 looks at the Assassin. |
| `climb.red` | Red. |
| `climb.truth` | This time, the truth. |
| `climb.q4lead` | Percival leads. He trusts the wrong Merlin. |
| `climb.q4rule` | At ten players, quest four needs two Fails. |
| `climb.twoAll` | Two all. One quest left. |
| `climb.ladyOnce` | She wakes once more. The Assassin looks at Percival, and says nothing. |
| `climb.q5lead` | Seat 6 leads. Percival names the team. |
| `climb.bluff` | Percival plays Merlin. On purpose. |
| `climb.q5done` | Five Success. |
| `climb.won` | Good has won. |
| `climb.liveRed` | Red. The Assassin is evil, and seat 3 tells the truth. |
| `climb.liveScore` | Loyal {good}, evil {evil}. |
| `climb.how1` to `climb.how4` | The plain "how the game is won" list (below) |

The plain list (scripts off, and the reduced motion section): the first side to win three quests wins. The leader moves one seat to the left after every team, approved or not. At seven players or more, quest 4 needs two Fail cards to fail. The Lady of the Lake wakes after quests 2, 3 and 4.

Screen readers: a visually hidden live line reads `climb.liveScore` each time a circle fills, and `climb.liveRed` when the water shows red. Everything else is `aria-hidden` decoration.

## How it is built

- **A seventh number in the frame loop.** `c` runs 0 to 1 after `l` (the Lady). Timeline length becomes `1 + DEAL + NIGHT + VOTE + QUEST + LADY + CLIMB`, and the pin length is `innerHeight x screens x` the same. Every earlier position is unchanged.
- **New `src/js/climb.js`** (target at most 5 KB compressed). It owns the three quests' choreography, the gold shine, Percival's pointer, the Lady flash timeline, the celebration (gold layer, motes, circle pulse) and the live lines. `hero()` calls `climb.frame()` once per tick, and `climb.build(tl, at)` adds the scrubbed tweens, like the chapters before. It uses helpers from `vote.js` (crown, bar), `quest.js` (lay, shuffle, turn, badge flight) and `lady.js` (standing card, lines, standing word). If those helpers are not exported yet, export them; do not copy their code.
- **Template**: a `climb` section in `src/templates/home.mjs` after `lady`. Without scripts it is a plain section. With scripts it moves into the hero stage like the chapters before, and the plain text stays for screen readers.
- **Draw order**: the gold layer and the motes sit above the table and under the words and the score bar.
- **Reduced motion** (`?motion=off`): no pin, no camera, no water, no motes. A plain section: the lines in order, the score as five small circles that fill as each line is reached (fades only), the word "Evil." in gold next to the Lady line, and a warm gold band behind "Good has won." **Scripts off**: the lines, each quest's result as a sentence ("Quest 4 failed with two Fail cards, from Morgana and Mordred."), and the "how the game is won" list.
- **Performance**: about 40 new elements (mostly motes). Only `transform` and `opacity` change per frame (the `put()` cache). The water canvas runs only in step 3. The mote drift loop runs only in step 11 and pauses when the hero is off screen.

## Taste pass

From `.agents/skills/high-end-visual-design`, applied to what this chapter adds only:

- **Motion**: every move is scrubbed, eased with `power3.inOut` for the camera and `expo.out` feel for lifts and the badge flights. No `linear` on anything the eye follows.
- **No instant changes**: glints, the shine, "Evil.", the lines, the dim and lift of seats 2 and 3, the gold layer and the circle fills all interpolate, including on rewind.
- **Shadows and edges**: quest cards and the Lady reuse `--card-edge` and `--card-shadow`. Lines get a soft diffused shadow. No grey 1 px borders.
- **Blur**: none on anything that moves. The gold light is a gradient, not a blur.
- **Phones and tablets**: the words keep their place under the score bar. The stage uses `100dvh`. Tablets in portrait take the phone camera numbers and in landscape the desktop ones (the existing breakpoint in `cards.js`). On phones, quest 4 and 5's five cards in the middle sit in one row at about 86% of the screen width.
- **Performance**: `will-change: transform` only on the cards while they move and on the motes during step 11.
- Not applied: its card chrome, pill buttons and eyebrow tags.

## What "done" looks like

| ID | Check |
|---|---|
| C-1 | Quest 3: the crown moves to seat 4, seats 4, 1, 5 and 10 lift, Morgana's card glints red, four Success, circle 3 blue |
| C-2 | The Lady flash: gold line from seat 3 to seat 2, a short sink, water with one ripple, seat 2's reflection shows only a **red** badge, then "Evil." in gold above seat 3. Seat 3 returns to full brightness, seat 2 dims, the Lady moves to seat 2 |
| C-3 | Quest 4: the crown moves to seat 5, Percival and Morgana shine the same gold, the rule line shows, three Success then Fail, a pause, and a heavier second Fail. Both badges fly into circle 4, which fills red. "Two all. One quest left." |
| C-4 | The Lady passes from seat 2 to seat 5 with one line and no water |
| C-5 | Quest 5: the crown moves to seat 6, a gold pointer from Percival's seat picks 1, 3, 10, 6 and 5, five Success, circle 5 blue |
| C-6 | Good has won: gold light, rising motes, the circles pulse, the line holds about 0.45 screen. The last picture matches what [010](010-the-blade.md) starts from |
| C-7 | Every step follows the scroll both ways, motes included. Nothing can be tapped or tabbed to |
| C-8 | English, Chinese and Malay fit with no overlap and no sideways scroll at 1280x720, 1024x1366 (tablet), 390x844 and 360x640 |
| C-9 | `?motion=off` shows the plain lines with the circles filling and no motion. Scripts off show the lines, each quest's result and the "how the game is won" list |
| C-10 | No console errors. Scripts stay under 130 KB compressed (budget for this part: 5 KB). The water runs only in step 3, the mote loop only in step 11. Frame rate on a mid range phone (AC-14) holds during the celebration |

## Build plan (its own pass, after 008)

1. [Before you build](#before-you-build) checks. Stop if any fail.
2. `src/data/climb.json` with its build checks, the `climb` words in three languages, the `climb` template, and the plain section (scripts off and `?motion=off`). This runs end to end before any 3D. (C-9)
3. `climb.js` scrubbed timeline for the three quests: crown moves, team lifts, glints, the gold shine, Percival's pointer, laying, swaps, turns, the double Fail, the badge flights, the circle fills. (C-1, C-3, C-5, C-7)
4. The Lady flash and the second pass: `water.setTarget`, the short sink, the gold "Evil.", seat 3's lift, the pale lines, both passes. (C-2, C-4)
5. The celebration: the gold layer, the motes, the circle pulse, the hold, and the exact last picture chapter 7 starts from. (C-6, C-10)
6. Check pass at the four sizes, three languages, motion off, WebGL off, scripts off, and scrolling back. Then the owner's look with a real mouse and phone. (C-8, C-10)
7. Write an "As built" section here with the real camera numbers and helper names, and tick the scope.

## Also changed by this plan

- [story_line.md](../scope/story_line.md): the game table (quest 3 to 5 teams and leaders, the two Lady wakes), the chapter 6 section, and decisions 20 to 24.
- [008](008-lady-of-the-lake.md) "Leads into" and open point 2 now point here.
- [scope.md](../scope/scope.md): the chapter 6 entry links this plan and its build command, and marks the plan as written.

## Open points

1. **Rule licence on seat 6's team.** By the rules the leader chooses, not Percival. The page shows Percival naming the team and seat 6 taking it, which is what happens at real tables. No rule is broken.
2. **The Assassin holds the Lady before his strike.** He sees Percival's side (loyal) and says nothing. That fits chapter 7: he knows Percival is loyal but not whether he is Merlin.
3. **Phone length.** Chapters 0 to 6 now add about 16 screens on a phone. Check on a real phone that each step gives something new within one screen of scroll (story line open point 2).

## As built (2026-11-16)

- **Files**: `src/js/climb.js` (the three quests, the Lady flash, the celebration; also `initClimbPlain`), `src/data/climb.json` (checked by `scripts/build.mjs`: team sizes, leaders, two Fails by evil seats, Lady targets not past holders, the score ends 3 : 2), the `climb` words in three languages, a `climb` template. It reuses `vote.js` (crown, gold rings, the bar), `quest.js` (card faces, `turnShape`, badge flight) and `lady.js` (the standing card, the word, `lineSet`, the water).
- **The Lady's walk**: `lady.W` is the list of places she stands (seat 7, seat 3, then seat 2 and seat 5 added here) and `Ly.leg` walks along it. "Evil." in gold, the red flash and the seat 2 reflection use `Ly.side`, `Ly.rvx`, `Ly.evSeat` and `Ly.gold`.
- **Camera**: `flash` (tilt 16, 12 on a phone, water 50% of the height or 76% of the width) and `top5` (the push on the cards: 1.4x on a desktop, the row of five at 86% of the width on a phone), blended by `S.w4` and `S.w5`. The wide pull back at the end is `S.dz` -0.05.
- **Timeline** (screens from the start of the chapter): quest 3 team 0, cards 0.2, the Lady 0.45, quest 4 team 0.8, cards and double Fail 1.05, the Lady once more 1.4, quest 5 team 1.52, cards 1.77, Good has won 1.95 to 2.4. The words use shorter in and out times (0.07 and 0.06) because the cuts are fast.
- **The celebration**: a gold stage layer (`.c-gold`, opacity to 0.85), 26 motes (16 on a phone) positioned from the scroll with a small sway on a clock only while it shows, the five circles pulse with a gold halo on the blue ones. Nothing fades the gold out. Chapter 7 is not built, so for now the hero simply scrolls away with the gold on it.
- **Checked**: 1280x720, 1024x1366, 390x844 and 360x640; English and Chinese; every step by screenshot; rewind into chapter 5; `?motion=off` (the score circles fill as each line comes into view); no console errors. `climb.js` is 7.2 KB gzip, against a target of 5. Not checked: a real phone's frame rate, Malay on screen.
