# 007 The Quest (scroll story part 7, chapter 4)

**Status**: **DONE**, built 2026-11-16 with 006 (one pass). Taps with a real mouse, keyboard, rewind, scroll only, `?motion=off` all checked; 360x640, 390x844, 1280x720, three languages. Still to do: owner's look, 1024x1366 tablet check, frame rate on a phone (AC-14), native read of zh and ms. As built: camera poses `hand` and `top` are worked out per screen in `night.pose()` and blended by `S.w1`, `S.w2`; the four quest cards are reused for both quests; words turn cream while the camera is straight down (`.on-table`); scripts total about 38 KB compressed.
**Story**: [story_line.md](../scope/story_line.md), chapter 4 The Quest. Rule shown: quest cards are played in secret and shuffled, the loyal must play Success, traitors may play either, one Fail sinks the quest, and the table only ever sees the result. Visitor: **turns the quest cards over** (the first chapter where the visitor does something since the hero ring).
**Model**: the same pinned stage and round table as [004](004-the-deal.md), [005](005-the-night-falls.md) and [006](006-the-vote.md).
**Comes after**: [006 The Vote](006-the-vote.md), which ends wide with the approved first team (seats 2, 3, 10) in the middle, the crown on seat 2, the score bar at the top with all five circles empty and the reject track clear. **Leads into**: [008 Lady of the Lake](008-lady-of-the-lake.md) (planned 2026-11-16, built on its own after this part), which starts after quest 2 with the Lady waking at Mordred's seat (seat 7).
**Code it will touch**: new `src/js/quest.js`, `src/js/cards.js` (`hero`: the frame loop and timeline get a fifth number), `src/js/vote.js` (the crown and the bar are reused), `src/templates/home.mjs` (a `quest` template), `src/styles/main.css`, new `src/data/quest.json`, `src/i18n/*.json`, `scripts/build.mjs` (WebP files from `src/assets/props/`, shared with chapter 3)
**Prototypes** (private pages the owner chose from): Quest Card Reveals (https://claude.ai/artifact/C6jHZAmwmEC4YX6LSFtpie) and Quest Camera Angles (https://claude.ai/artifact/GXeJmbNRnWL5ioPXtZQQFm)

## Summary

The team plays its quest cards in secret, twice. Quest 1 (three players) passes, with the Assassin quietly playing Success to look loyal. Quest 2 (four players) is the big moment: the camera drops behind the Assassin's shoulder as he picks Fail, then rises to look straight down at four shuffled cards, and **the visitor taps them over**. The last card turned is always the Fail. It lands slow and heavy, its red badge flies into the score bar, and the table blames an innocent Servant, with the Assassin pointing first. Scrolling turns any card the visitor leaves, so nobody gets stuck.

## Decisions made (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 1 | **Plan chapter 4 now on top of 006 as written. Approve both plans, build chapters 3 and 4 in one pass** | Owner. The story line's build order already pairs them, and they share the score bar |
| 2 | **The game changes: quest 1 passes, quest 2 fails.** Quest 1: all Success, 1 : 0. Quest 2: one Fail, 1 : 1. The score after quest 2 is the same as before, so chapters 5 to 8 do not change | Owner ("quest 1 should all pass, then quest 2 only will have fail and traitor hides on it") |
| 3 | **The visitor taps to turn the cards (option A).** Tap or click a card and it turns over. Every card still face down is turned by the scroll | Owner, after trying the four options (tap, hold, peel, watch) on Quest Card Reveals |
| 4 | **The last card turned is always the Fail.** A card gets its face only when it starts to turn: the fourth card to turn shows Fail, the others Success, in any order the visitor taps | Owner. Keeps the build up: Success, Success, Success, Fail |
| 5 | **The tapped reveal is quest 2, four cards.** Quest 1 plays by itself | Owner |
| 6 | **The Assassin plays the Fail on quest 2.** Quest 2 team: seats 2 Assassin, 3 Servant, 5 Percival, 8 Servant. The Assassin played Success on quest 1 to win trust | Owner |
| 7 | **The visitor sees both secret choices.** On quest 1 the Assassin's card glints red as he lays a Success. On quest 2 the visitor sees him pick Fail. Nobody at the table sees either | Owner. The narrator sees everything; it shows "traitors may play either" in action |
| 8 | **Camera for quest 2: over the shoulder (option B).** Low behind the Assassin's seat, his two cards (Success, Fail) stand in his hand, he picks Fail with a red glint. Then the camera rises to look **straight down** at the middle for the shuffle and the taps, and pulls back to the resting lean for the accusation | Owner, after trying A, B and C on Quest Camera Angles |
| 9 | **The rule close up comes before quest 1**: a Success and a Fail card rise and face the visitor, side by side, and their badges glow (blue and red on Success, red only on Fail) | Owner |
| 10 | **Shuffle: cups and ball swaps.** The face down cards slide round each other in two or three swaps, following the scroll | Owner |
| 11 | **Quest 1 is short and clear (about 0.7 screen)**: wide lean with a small push in, three cards slide to the middle, quick shuffle, all three turn together, circle 1 blue | Owner |
| 12 | **Team 2 arrives by the crown**: the crown slides from seat 2 to seat 3, four cards lift with gold rings, one line "A new leader. A team of four. Approved." No vote cards | Owner. Chapter 3 already taught voting |
| 13 | **The Fail lands heavy**: a slow turn with a hesitation, red light spreads from the card across the table, and its red badge lifts off and flies up into circle 2 of the score bar | Owner |
| 14 | **Accusation: the Assassin points first, the table follows.** Three layers: lines drawn seat to seat (his red, for the visitor only, the rest pale), the accusing cards swivel to face seat 3, and seat 3's card dims and sinks a little | Owner. Fixes the clash in the story line ("then the Assassin points too" against the title card "The traitor points first") |
| 15 | **Tap window about 0.6 screen.** The four cards wait face down with "Turn them over." on screen. Keep scrolling and they turn one by one. Never a stop or a snap | Owner |
| 16 | **Scrolling back above the reveal turns every card face down again**, so the moment can be played again, and the last card turned is still the Fail | Owner. Same rule as every chapter: scrolling up plays it in reverse |
| 17 | **Length about 3.6 screens on a desktop, 3.1 on a phone** | Owner |
| 18 | **Anti slop pass with the installed taste skill** (`.agents/skills/high-end-visual-design`, Leonxlnx taste-skill-classics "soft"). Only its rules that fit a 3D card scene apply (see [Taste pass](#taste-pass)). The approved look is not redesigned | Owner |
| 19 | **CSS 3D with GSAP, no WebGL, no new libraries.** Transform and opacity only (AC-8) | Same as 002 to 006 |

## What the visitor sees

Still inside the pinned hero stage, after the vote. Seat numbers follow `src/data/deck.json`: 1 Merlin, 2 Assassin, 3 Servant, 4 Morgana, 5 Percival, 6 Servant, 7 Mordred, 8 Servant, 9 Oberon, 10 Servant.

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **The rule** | "The team goes on the quest. In secret." then "The loyal must play Success. Traitors may play either." | Wide, the table dims a little behind | A Success and a Fail card rise in front of the table and face the visitor, side by side (overlapping a little on a phone). The blue badge on Success glows, then both red badges glow. They sink away |
| 2 | **Quest 1** | "Even the Assassin plays Success. For now." | Wide lean, small push in on the middle | Seats 2, 3 and 10 each slide one card face down to the middle. The Assassin's card glints red for a moment as it leaves his seat. A quick shuffle (two swaps). All three turn together: Success, Success, Success |
| 3 | **Quest 1 passes** | "The first quest succeeds." | Back to wide | The three cards fade. Circle 1 on the score bar fills blue |
| 4 | **Team 2** | "A new leader. A team of four. Approved." | Wide | The crown slides from seat 2 to seat 3. Seats 2, 3, 5 and 8 lift with gold rings |
| 5 | **The hand** | "Only you see it. The Assassin picks Fail." | Drops low behind seat 2 (over the shoulder), about the quest camera prototype's pose | Two cards stand up in the Assassin's hand, Success and Fail, fanned. The Fail lifts with a red glint. The hand lowers and the four team members each slide one card face down to the middle |
| 6 | **The shuffle** | "Shuffled. Nobody can follow which is which." | Rises to look straight down at the middle | The four face down cards swap places like cups and a ball (two or three swaps) and settle in a row |
| 7 | **Your turn** (tap window) | "Turn them over." (the one hint, once) | Straight down, still | The four cards wait face down. One soft lift ripples across them once. Each is a real button now. A tap turns that card (see [The reveal](#the-reveal)). After about 0.6 screen the scroll starts turning any card left, left to right |
| 8 | **The Fail** | **One Fail is enough. Nobody knows whose.** | Straight down, a short hold | The fourth card to turn is the Fail. It lifts, hesitates, then turns slowly. Red light spreads from it across the table. Its red badge lifts off and flies up into circle 2 of the score bar, which fills red |
| 9 | **The blame** | "Seat 3 was on both quests." then **The traitor points first.** | Pulls back to the resting lean | The quest cards fade. A red line draws from seat 2 to seat 3 and the Assassin's card swivels to face him. Then pale lines follow from the others, one by one, each card swivelling. Seat 3 dims and sinks a little. Merlin (seat 1) does not point (see [open point 2](#open-points)) |

Nine steps. Steps 1 to 6 and 8 to 9 follow the scroll both ways. Step 7 waits for taps, and the scroll takes over if nobody taps.

### Scroll budget (about 3.6 screens on a desktop, 3.1 on a phone)

| Stretch | Screens |
|---|---|
| The rule close up | 0.35 |
| Quest 1: laid, glint, shuffle, all three turn, circle 1 blue | 0.6 |
| Team 2: crown to seat 3, four lift | 0.25 |
| The hand, cards laid, rise to top down | 0.5 |
| The shuffle | 0.25 |
| Tap window (cards wait) | 0.55 |
| Scroll turns any cards left (the Fail last) | 0.3 |
| The Fail lands, badge to the bar, hold | 0.2 |
| The blame, pull back | 0.6 |

`QUEST` is a fifth number in the frame loop after `VOTE`, in the same unit as 004 to 006 (one old unit is 5 screens on a desktop, 4.4 on a phone). `QUEST = 0.72` on a desktop (3.6 of 5) and `0.70` on a phone (3.1 of 4.4). The hero pin grows by about 3.6 screens. Phone stretches are the desktop ones times 0.86.

## The camera (decision 8)

Reuse the night's camera object `{ a, fr, dz, tilt, ty }` ([005](005-the-night-falls.md)) and its long lens (perspective grows with the dolly, cards use `scale3d`).

| Pose | When | Values (desktop; phone in brackets) |
|---|---|---|
| Rest | Steps 1, 3, 4, 9 | `a` 90 (seat 1 at the front), `tilt` 28 (20), wide |
| Small push | Step 2 | Rest, dolly about 1.4x (1.25x) on the middle |
| Over the shoulder | Step 5 | `a` 126 (seat 2 swings to the front), `fr` about 0.9, `tilt` about 70, dolly so the standing hand is about 45% of the screen tall at 2:3 (measured per screen, like 005's close ups), focus low on the screen |
| Top down | Steps 6 to 8 | `a` 90, `fr` 0, `tilt` about 3, dolly so the row of four cards spans about 80% of the screen width on a phone and the cards are about 45% of the screen tall on a desktop |

- The prototype's numbers are a starting point only. Measure them in the real stage like 005 did ("As built", camera numbers).
- The move from over the shoulder to top down swings `a` from 126 back to 90 while `tilt` drops, so the table turns under the camera as it rises. It must take at least 0.2 screen so it reads as one move, not a cut.
- **Hit size**: at 360 px wide the top down cards must be at least 44 px wide (target about 70 px).

## The reveal (decisions 3, 4, 15, 16)

This is the only part of the story that is not driven by the scroll alone. It mixes taps (time based) with the scroll (scrubbed). One small state object in `quest.js` holds it:

- `order`: the cards in the order they started turning (0 to 4 long).
- Per card: `face` (`null`, `success` or `fail`), `by` (`tap` or `scroll`).

Rules:

1. **Faces are given late.** When a card starts to turn, it gets its face: Fail if it is the fourth in `order`, otherwise Success. The face picture and title are swapped in on the hidden side at that moment, so the trick cannot be seen.
2. **Taps.** During the tap window and the scroll turning stretch, the four cards are `button`s (`tabindex` 0, label "Quest card 2 of 4, face down. Turn it over."). Outside it they are `tabindex` -1 and ignore the pointer. A tap plays a GSAP tween (not scroll linked): about 0.7 s for Success, about 1.7 s for the Fail with its lift and hesitation (as in the prototype). Taps on a card that is turning or turned do nothing.
3. **The scroll.** In the scroll turning stretch the remaining face down cards turn left to right at evenly spaced points, scrubbed by the scroll, so the last one (the Fail) lands at the end of the stretch.
4. **Mixed.** Whatever the mix of taps and scroll, the fourth card to turn is the Fail. A card turned by the scroll and then turned back by scrolling up loses its face and leaves `order`, so it can become the Fail when it turns again.
5. **The Fail aftermath** (red light, badge flight, circle 2, the title card) starts when the Fail finishes turning. If it was tapped, it plays as a timed tween. If the scroll turned it, it is scrubbed. Either way it is the same picture at the end.
6. **Rewind.** Scrolling back above the start of the tap window resets everything: all four cards face down, `order` empty, faces cleared, circle 2 empty, the red light gone. Coming back down plays it fresh.
7. **Scrolling forward past the reveal** without tapping is the same as the scroll turning them all.
8. **One hint, once.** "Turn them over." is the step line for step 7 and the only hint. The soft ripple across the four cards plays once per visit (remembered for the session, not stored).

### The badge flight (decision 13)

The bar is flat HTML fixed at the top of the stage, outside the 3D table. So the flight is a 2D overlay: one small badge picture placed at the Fail card's red badge (read once from `getBoundingClientRect` when the Fail lands), moved by `transform` to circle 2's position, shrinking as it goes, then circle 2's red fill fades in. It is redone if the screen is resized while it plays.

## The accusation (decision 14)

- **Order**: seat 2 the Assassin first (red line), then Morgana (4) and Mordred (7) quickly (they know who failed and back him), then Servants 6, 8, 10, Oberon (9) and Percival (5). Merlin (1) does not point. Seat 3 does not point.
- **Lines**: flat strips on the table, like the night's threads (`scaleX` from the accuser's end, a soft shadow under each). The Assassin's is red, the rest are pale cream. CSS strips, not SVG, to match the threads (the scope's assets line said SVG).
- **Swivel**: each accusing card turns on the table about a third of the way toward seat 3 as its line draws.
- **Seat 3**: dims to about 65% and sinks about 10% as the last lines arrive.
- The lines and the swivels follow the scroll both ways. They clear as chapter 5 starts.

## Data (`src/data/quest.json`)

By seat number (1 to 10, `deck.json` order), because the four Servants share one role. The build checks that seat 2 is the Assassin and every listed seat exists, so a change to the deck cannot quietly break the story.

```json
{
  "quests": [
    { "n": 1, "leader": 2, "team": [2, 3, 10], "result": "success", "glint": 2 },
    { "n": 2, "leader": 3, "team": [2, 3, 5, 8], "result": "fail", "failBy": 2, "tapped": true }
  ],
  "blame": { "target": 3, "order": [2, 4, 7, 6, 8, 10, 9, 5], "silent": [1] }
}
```

## Words

Keys under `quest` in `en.json`, `zh.json`, `ms.json`, plus `quest.success` and `quest.fail` for the card titles (the titles from [003-props](../images/003-props.md): Success 成功 Berjaya, Fail 失败 Gagal). Chinese and Malay are the assistant's wording, to be read by a native speaker.

| Key | English |
|---|---|
| `quest.secret` | The team goes on the quest. In secret. |
| `quest.rule` | The loyal must play Success. Traitors may play either. |
| `quest.q1` | Even the Assassin plays Success. For now. |
| `quest.q1done` | The first quest succeeds. |
| `quest.team2` | A new leader. A team of four. Approved. |
| `quest.hand` | Only you see it. The Assassin picks Fail. |
| `quest.shuffle` | Shuffled. Nobody can follow which is which. |
| `quest.turn` | Turn them over. |
| `quest.fail` | One Fail is enough. Nobody knows whose. |
| `quest.both` | Seat 3 was on both quests. |
| `quest.points` | The traitor points first. |
| `quest.cardLabel` | Quest card {n} of 4, face down. Turn it over. |
| `quest.how*` | The plain "how a quest works" list (five lines, see below) |

## How it is built

- **A fifth number in the frame loop.** `u` runs 0 to 1 after `v` (the vote). Timeline length becomes `1 + DEAL + NIGHT + VOTE + QUEST`; pin length `innerHeight x screens x` the same. Every earlier position is unchanged.
- **New `src/js/quest.js`** (target at most 7 KB compressed). It owns the rule cards, the quest cards (seven elements reused: three for quest 1, four for quest 2), the hand, the shuffle, the reveal state, the badge flight, the red light, the lines and the swivels. `hero()` calls `quest.frame()` once per tick; `quest.build(tl, at)` adds the scrubbed tweens, like `night.build` and `vote.build`. The crown and the bar come from `vote.js`.
- **Cards**: built at 2x and scaled by 0.5 (`SS = 2`, 005 sharpness). Quest card back is the role card back for now ([003-props](../images/003-props.md)). Fronts are the Success and Fail pictures as small WebP files, titles as live text, badges from `dist/assets/badges/`.
- **Draw order**: the quest cards, the hand and the rule cards sit in the cards layer above the table, like 005's fixed layer order. The lines go in `.n-under` with the threads.
- **Cleanup**: `hero()`'s cleanup removes everything `quest.js` adds, removes the tap listeners, and resets the reveal state.
- **Reduced motion** (`?motion=off`): no pin, no camera. A plain section: the lines in order, then quest 2's four cards as four real buttons that turn with a fade (same "last card is the Fail" rule), then the result line and the blame line. **Scripts off**: the lines, the result of each quest written out, and a "how a quest works" list: the team plays one card each, face down; the loyal must play Success, traitors may play either; the cards are shuffled before they are turned; one Fail and the quest fails (quest 4 at seven players or more needs two); nobody learns who played what.
- **Screen readers**: the result of each turned card is read out from a visually hidden live line ("Success." then "Fail. One Fail is enough."). The rule cards, hand and lines are decoration (`aria-hidden`).
- **Performance**: about 40 new elements. Only `transform` and `opacity` change per frame, values written only when they change (the `put()` cache). The red light is one element's opacity, not a filter. The frame loop already pauses when the hero is off screen.

## Taste pass

From `.agents/skills/high-end-visual-design`, applied to what this chapter adds only:

- **Motion**: tap tweens use the site's spring curve (`--ease`, `cubic-bezier(.32,.72,0,1)`, or GSAP `expo.out` and `power3.inOut` for the Fail's hesitation). Never `linear` or plain `ease-in-out` on a timed tween. Scrubbed tweens follow the scroll by design.
- **No instant changes**: every state change (faces, glints, circle fills, the hint) is interpolated, including on rewind.
- **Shadows and edges**: cards reuse `--card-shadow` and `--card-edge`. Lines get a soft, diffused shadow. No grey 1 px borders, no hard black shadows.
- **Blur**: none on the cards or the table (moving content). Only fixed layers may blur.
- **Phones and tablets**: below 768 px the rule cards overlap a little instead of sitting side by side, the words keep their place under the bar, and the stage uses `100dvh`, never `100vh`, so iOS Safari does not jump. Tablets in portrait use the phone camera numbers, in landscape the desktop ones (the existing breakpoint in `cards.js`).
- **Performance**: transform and opacity only, `will-change` only on the four quest cards during the reveal.
- Not applied: its card chrome, pill buttons and eyebrow tags. The look is approved and is not redesigned.

## What "done" looks like

| ID | Check |
|---|---|
| Q-1 | Quest 1 plays by itself: three cards laid, the Assassin's red glint, a shuffle, three Success, circle 1 blue |
| Q-2 | Quest 2 shows the Assassin's hand over his shoulder, the red glint on Fail, then the camera rises to straight down for the shuffle |
| Q-3 | In the tap window, tapping cards in any order gives Success, Success, Success, Fail. Mouse, touch and keyboard (Tab, Enter or Space) all work |
| Q-4 | Not tapping at all: the scroll turns all four, the Fail last. Tapping some: the scroll turns the rest, the Fail still last |
| Q-5 | The Fail turns slowly with a hesitation, red light spreads, the badge flies into circle 2, and circle 2 fills red |
| Q-6 | The Assassin's red line comes first, then the others. Cards swivel, seat 3 dims and sinks, Merlin does not point |
| Q-7 | Scrolling back above the tap window turns every card face down and clears circle 2. Coming back down, the Fail is still last |
| Q-8 | Nothing can be tapped or tabbed to outside the reveal. Words and colour follow the scroll both ways everywhere else |
| Q-9 | English, Chinese and Malay fit with no overlap and no sideways scroll at 1280x720, 1024x1366 (tablet), 390x844 and 360x640. Top down cards at least 44 px wide at 360 px |
| Q-10 | `?motion=off` shows the lines and four fading buttons with the same rule. Scripts off show the lines, both results and the "how a quest works" list |
| Q-11 | No console errors. Scripts stay under 130 KB compressed (budget for this part 7 KB). Frame rate on a mid range phone (AC-14) |

## Build plan (with 006, one pass)

1. Wire the props pipeline: `scripts/build.mjs` makes small WebP files from `src/assets/props/` (needed by chapters 3, 4 and 5).
2. Build chapter 3 as in [006](006-the-vote.md): the crown and the bar are what this chapter reuses.
3. `src/data/quest.json`, the `quest` words in three languages, the `quest` template, and the plain section (scripts off and `?motion=off`). This runs end to end before any 3D. (Q-10)
4. `quest.js` scrubbed timeline: rule cards, quest 1, team 2, the hand, the camera poses, the shuffle, scroll turning, the Fail aftermath (scrubbed path), the blame. (Q-1, Q-2, Q-4, Q-5, Q-6, Q-8)
5. The tap layer: buttons, the reveal state, late faces, timed tweens, rewind reset, the hint, the live line. (Q-3, Q-4, Q-7)
6. The badge flight overlay and its resize handling. (Q-5)
7. Check pass at the four sizes, three languages, motion off, scripts off, scrolling back. Then the owner's look with a real mouse and phone. (Q-9, Q-11)

## Also changed by this plan

- [story_line.md](../scope/story_line.md): the game table (quest 1 passes, quest 2 fails, the blame after quest 2), the chapter 4 section, and the trailer's chapter 4 row now follow decisions 2 to 14.
- [006](006-the-vote.md) "Leads into" now points here.

## Open points

1. **Words and colour vs taps.** 005 decision 10 says nothing follows a timer. Taps are the one exception: a tapped card turns over time, not with the scroll. Everything else in this chapter still follows the scroll.
2. **Merlin stays silent in the blame.** Proposed for rule accuracy: Merlin knows the Assassin is evil, so pointing at seat 3 would be a lie Merlin has no reason to tell, and pointing at the Assassin would reveal Merlin. Morgana and Mordred back the Assassin because they know. Drop this if it reads as noise.
3. **A scrubbed card can change face.** If the visitor taps two, lets the scroll turn a third, scrolls back a little so the third turns face down again, then taps the fourth, the third becomes the Fail when it turns again. Rare, and the rule "the last card turned is the Fail" still holds.
4. **Chapter 5 hand off.** The blame ends wide at rest, with seat 3 dimmed. Chapter 5 starts from there ([008](008-lady-of-the-lake.md)): the blame lines fade out over its first 0.1 screen, and the Lady's painting rises. Keep the blame lines' class names and seat 3's dim reachable from `lady.js`.
5. **Tablet camera.** Tablets in portrait take the phone numbers. Check at 1024x1366 that the over the shoulder hand is not too large.
