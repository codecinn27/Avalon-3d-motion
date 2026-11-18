# Avalon story line (scroll story and trailer)

**Status**: v3, approved by the owner on 2026-11-15. Merges the owner's GPT review (prologue, visitor involvement, stronger final call, the design rule) with fixes. The five game card pictures (Approve, Reject, Success, Fail, Lady of the Lake) are made and previewed with titles and badges 2026-11-15, waiting for the owner's final look ([003-props](../images/003-props.md)). Chapters 1 to 6 are built (see the scope). **Chapters 7 and 8 were built on 2026-11-17** (the blade with both endings, the draw on the table and the final call with "Save me a seat" and "Invite my group"); the owner's look at them is pending. Only chapter 0's four prologue lines are still unbuilt.
**Used for**: the scroll story on the home page, and later the trailer, which is cut from the same chapters with the same lines.
**Built so far**: chapter 0 ([001 Banner](../section/001-banner.md), without the new prologue lines), chapters 2 to 8 ([005](../section/005-the-night-falls.md) to [011](../section/011-your-seat.md)) and all of chapter 1 ([002 The Gathering](../section/002-gathering.md), [003 The Unfolding](../section/003-unfolding.md), [004 The Deal](../section/004-the-deal.md)).
**Spec**: [0001](../specs/0001-avalon-landing-page.md). This story changes AC-1, AC-4 and AC-5, and adds a second button to the final call (see "What this changes in the built site").

## The design rule

> Don't teach visitors how to play Avalon. Make them experience why playing Avalon is exciting.

Every chapter still shows one rule, because a visitor who understands the rule feels the tension. But each chapter is judged by one question: does the visitor feel the lie, the doubt or the betrayal?

## The idea

The page plays **one whole game of Avalon**, from the deal to the Assassin's last strike, then offers the visitor a seat at a real table.

Six things carry it:

1. **A cold open, then a short prologue.** The page opens on the hook, not on history: ten cards and "Trust no one at the round table." Four short lines then set up the kingdom, the traitors and Merlin while the ring breaks.
2. **The visitor sees everything.** A narrator who sees every card tells the story. The visitor is never asked to guess who is evil, because they already know. The thrill is watching the table get fooled: the traitor who accuses first, the lie at the lake, the friend who bluffs as Merlin.
3. **Touch, not just watch.** In four chapters the visitor can do the moment themselves: see what each player knows, turn the quest cards, touch the water, point the blade. Scrolling always plays the same moment, so nobody gets stuck.
4. **A score track.** Five quest circles stay at the top of the screen from chapter 3 on. They fill blue or red as quests end, so the page has a scoreboard the visitor wants to see finished.
5. **A twist and a choice.** Good wins three quests, and the game is still not over. The visitor decides where the Assassin's blade falls.
6. **A seat, not a lesson.** The last screen turns the story into the real offer: online game nights where the table is filled for you.

## Decisions made (owner, 2026-11-15)

| # | Decision | Why / who |
|---|---|---|
| 1 | One game, start to finish, replaces the "How it works" steps under the card wall | Owner said go on the proposal |
| 2 | Told by a narrator who sees every card | Owner confirmed |
| 3 | Ten seats, the rulebook's ten player setup: **six loyal** (Merlin, Percival, four Loyal Servants) and **four evil** (Assassin, Morgana, Mordred, Oberon) | Owner, corrected from seven and three |
| 4 | **Oberon is in the story.** He is evil but works alone: the other traitors do not know him, he does not know them, and Merlin can see him | Owner. Replaces the earlier "Oberon only in chapter 0" |
| 5 | A night chapter is added (chapter 2). The roles are introduced by what they do at night, so the separate seven card "Meet the characters" section goes away | Proposal, owner said go |
| 6 | Voting uses Approve and Reject vote cards (chapter 3), quests use Success and Fail cards (chapter 4), Lady of the Lake has her own card (chapter 5). Each is a new picture made with gpt-image-2.6-flare | Owner. See "Pictures to make" for how they are drawn. 2026-11-15: titles and badges are added by the page, the Reject sphere matches Approve's size, and the Lady is a back view with a white shirt (no bowl) |
| 7 | Chapter 7 has **two endings**, both planned in full: the blade finds Merlin and evil wins, or the blade misses and evil loses | Owner |
| 8 | **The visitor points the blade** in chapter 7. Merlin plays ending A, anyone else plays ending B, and scrolling on without choosing plays ending A | Owner |
| 9 | The visitor watches the votes in chapter 3 and does not cast one | Owner confirmed |
| 10 | Trailer: 60 seconds, words on screen only, ends with a cut to black at the strike | Owner confirmed |
| 11 | A prologue sets up the kingdom, the traitors and Merlin. It is four lines long and plays as the built ring breaks, after the cold open | Owner (GPT review). Kept short so the hook comes first |
| 12 | The visitor takes part through things they discover and do, but stays an observer, not an eleventh player | Owner (GPT review) |
| 13 | The final call is stronger and also invites the visitor's friends | Owner (GPT review) |
| 14 | Design rule: "Don't teach visitors how to play Avalon. Make them experience why playing Avalon is exciting." | Owner (GPT review) |
| 15 | Every interaction is optional. Scrolling plays the same moment, so a visitor who only scrolls still sees the whole story. **Nobody gets stuck** | Owner confirmed |
| 16 | The main button stays the owner's WhatsApp (spec AC-2). A second, smaller button, "Invite my group", opens WhatsApp's share screen | Owner confirmed. The page's one goal is a message to the owner about game nights |
| 17 | The prologue is the four lines over the breaking ring. No kingdom or castle picture | Owner confirmed. The ring is already the strongest image, and it keeps the page light |
| 18 | **Quest 1 passes and quest 2 fails** (was the other way round). The Assassin plays Success on quest 1 to look loyal, then the Fail on quest 2. The visitor taps quest 2's four cards. The score after quest 2 is still 1 : 1, so chapters 5 to 8 do not change | Owner, 2026-11-16, while planning chapter 4 ([007](../section/007-the-quest.md)) |
| 19 | **Chapter 5: Mordred looks at seat 3**, the Servant blamed after quest 2. The water shows blue, he says "Evil", the table turns on seat 3 again, and "Even Merlin can't see this lie." The Lady's painting arrives full size first. The visitor taps the water (hover ripples on desktop). Real ripples. About 2.6 screens | Owner, 2026-11-16, while planning chapter 5 ([008](../section/008-lady-of-the-lake.md)) |
| 20 | **Chapters 6, 7 and 8 planned together**, one file each: [009](../section/009-the-climb.md), [010](../section/010-the-blade.md), [011](../section/011-your-seat.md) | Owner, 2026-11-16, after The Blade Options prototype (picks 1C 2A 3A+A 4B 5A 6A 7A+A 8A) |
| 21 | **Chapter 6: after quest 3, seat 3 looks at the Assassin**, sees red in a quick water flash, and says "Evil." in gold (the truth). The Lady passes to seat 2. After quest 4 she wakes once more: the Assassin looks at Percival and says nothing | Owner, 2026-11-16 |
| 22 | **The bluff, rule true.** The crown moves one seat per team, so quest 3 is led by seat 4 (Morgana), quest 4 by seat 5 (Percival, who trusts the wrong Merlin and takes Morgana and Mordred), quest 5 by seat 6 while Percival names the team. "Percival plays Merlin. On purpose." | Owner, 2026-11-16. Percival can't lead quest 5 by the rules |
| 23 | **Chapter 6 teams arrive by the crown**, no vote cards. Quest 4 is watched, with a heavy double Fail | Owner, 2026-11-16 |
| 24 | **The false ending is a celebration**: gold light, rising motes, pulsing circles, "Good has won." held about 0.45 screen | Owner, 2026-11-16 |
| 25 | **Chapter 7 opens with a hard cut to dark** across about 0.05 screen, a named exception to the half screen palette rule. It still follows the scroll | Owner, 2026-11-16 |
| 26 | **The dagger is gilded** (steel, gold guard and pommel, a red stone), drawn as SVG | Owner, 2026-11-16 |
| 27 | **Camera facing the arc**: the six loyal cards rise from their seats into a standing arc in front of the table (3, 6, Merlin, Percival, 8, 10; two rows on a phone). The strike plays in place with a small push in. Replaces "low behind the dagger" and "cut to top down" | Owner, 2026-11-16 |
| 28 | **Aim, then strike, with ghost faces.** Mouse: point and click. Touch: tap to aim, tap again (or Strike) to strike. The face down cards show the visitor a faint ghost of each painting | Owner, 2026-11-16 |
| 29 | **Ending A cracks, ending B turns the dagger to ash**, as written below | Owner, 2026-11-16 |
| 30 | **"See the other ending ↑"**, one quiet link under each ending | Owner, 2026-11-16 |
| 31 | **Felt on Android**: a heartbeat double pulse as the dagger slows, one pulse on the visitor's strike | Owner, 2026-11-16 |
| 32 | **Chapter 8: the draw happens on the table**, from the lit seat, under a cone of light from above. The card rises and the result sits beside it (under it on a phone) | Owner, 2026-11-16 |
| 33 | **The ending goes in "Invite my group" only**: "I just let the Assassin find Merlin." or "I just saved Merlin from the blade.", and nothing extra when the visitor didn't choose | Owner, 2026-11-16 |
| 34 | **"Save me a seat" opens WhatsApp with "Hi! Save me a seat at the next online Avalon night."** | Owner, 2026-11-16 |
| 35 | **Lengths**: chapter 6 about 2.4 screens, chapter 7 about 4.0, chapter 8 about 2.0 of pin (desktop; about 12% less on a phone) | Owner, 2026-11-16 |
| 36 | **As built 2026-11-17 (chapters 7 and 8):** the strike's push in is a small scale up of the struck card (no camera move); the table shake is a 4 px jitter of the whole ring; the closing question swaps live with the ending; "Invite my group" reads the result when pressed | Build notes, see [010](../section/010-the-blade.md) and [011](../section/011-your-seat.md) |
| 37 | **"Invite my group" is removed (2026-11-17).** The final call has one button, "Save me a seat". This replaces decisions 16 and 33 and the invite part of decision 36: the ending no longer goes into any share message, and `wa_invite` and the `invite` words are gone. The draw's own share buttons stay | Owner, 2026-11-17 |

## The cast at the table

Ten seats, in the same order as `src/data/deck.json`. The ten ring cards are the ten players, so no new character painting is needed.

| Seat | Card | Side | What they know after the night |
|---|---|---|---|
| 1 | Merlin | Loyal | Sees the Assassin, Morgana and Oberon as evil. Cannot see Mordred |
| 2 | Assassin | Evil | Knows Morgana and Mordred, not Oberon. Gets the last strike |
| 3 | Loyal Servant (`loyal-servant`) | Loyal | Nothing |
| 4 | Morgana | Evil | Knows the Assassin and Mordred. Looks like Merlin to Percival |
| 5 | Percival | Loyal | Sees two cards that could be Merlin (Merlin and Morgana), but not which is which |
| 6 | Loyal Servant (`loyal-servant-3`) | Loyal | Nothing |
| 7 | Mordred | Evil | Knows the Assassin and Morgana. Hidden from Merlin |
| 8 | Loyal Servant (`loyal-servant-2`) | Loyal | Nothing |
| 9 | Oberon | Evil | Nothing. The other traitors do not know him either. Merlin can see him |
| 10 | Loyal Servant (`loyal-servant-4`) | Loyal | Nothing |

Quest team sizes at ten players: **3, 4, 4, 5, 5**. Quest 4 needs **two** Fail cards to fail.

## The game the page plays

| Step | Team | Cards turned over | Result | Score (loyal : evil) |
|---|---|---|---|---|
| Quest 1 | 3 (the first team is voted down, the second is approved: the Assassin, the seat 3 Loyal Servant and the seat 10 Loyal Servant) | three Success (the Assassin plays Success to look loyal) | Success | 1 : 0 |
| Quest 2 | 4 (the Assassin, the seat 3 Servant, Percival, the seat 8 Servant; seat 3 leads) | three Success, one Fail (the Assassin's) | Fail | 1 : 1 |
| After quest 2 | The table blames the seat 3 Loyal Servant. The Assassin points first, the table follows | | | |
| Lady of the Lake | Mordred looks at the seat 3 Loyal Servant (the one the table blames), sees blue, says "Evil". The Lady passes to seat 3 | | | |
| Quest 3 | 4 (Morgana leads: seats 4, 1, 5, 10) | four Success (Morgana plays Success to keep trust) | Success | 2 : 1 |
| Lady of the Lake | Seat 3 looks at the Assassin (seat 2), sees red, says "Evil" (the truth). The Lady passes to seat 2 | | | |
| Quest 4 | 5 (Percival leads and trusts the wrong Merlin: seats 5, 4, 7, 6, 8) | three Success, two Fail (Morgana's and Mordred's) | Fail | 2 : 2 |
| Lady of the Lake | The Assassin looks at Percival and says nothing. The Lady passes to seat 5 | | | |
| Quest 5 | 5 (seat 6 leads, Percival names the team: seats 1, 3, 10, 6, 5) | five Success | Success | 3 : 2 |
| The Blade | The visitor points the Assassin's blade | | Ending A or B | |

## Palette across the story

| Chapter | Palette |
|---|---|
| 0 and 1 | Cream (built). The backdrop dims a little during the prologue lines |
| 2 | Night: dark blue. Dawn brings back cream at the end of the chapter |

Every turn between palettes follows the scroll and takes about half a screen (owner, 2026-11-16). Nothing fades on a timer.
| 3 to 6 | Cream, the day of quests. Gold light at the end of chapter 6 |
| 7 | Dark: the big turn of the page. Ending A goes crimson. Ending B gets a gold dawn over the dark |
| 8 | Dark (built), with warm gold light on the empty table |

## What stays on screen

- **Score track**: five circles, top centre, each showing its team size (3, 4, 4, 5, 5). Appears in chapter 3, fills through chapters 4 to 6, cracks (ending A) or turns gold (ending B) in chapter 7, fades out in chapter 8.
- **Reject track**: five small marks under the score track. One lights for each rejected team, and all clear when a team is approved.
- **WhatsApp button** in the top bar, visible the whole way, as today.

- **Seat labels** (owner request, 2026-11-17, [seats.js](../../src/js/seats.js)): every seat card wears a small number. The seats the current line is about also wear a name and their team badge (blue good, red evil), so the visitor never has to memorise who is who. Labels follow the scroll both ways. Any card can also be asked: hover (mouse), tap (touch), click or keyboard focus shows its painting, name and team badge, and a tap elsewhere closes it. **Stacking (owner, 2026-11-17): the name tag is always above the asked-for card (tag z-index 7 over the card's 6), so the card that opens below the 12 o'clock seat never hides that seat's "6 · Loyal Servant" tag.** **In the vote (chapter 3) the team in the middle loses its numbers and labels from the moment the vote cards are laid until they fade**, so the cards and the count stay clear. Seat 3's badge in chapter 5 and seat 2's in chapter 6 stay hidden until the water shows them. **Seat numbers and labels belong to the table only.** They fade in together with the deal's first words ("Ten seats. Six are loyal. Four are lying.", `q` 0.2 to 0.27) and fade out with the scroll as soon as the cards leave the table (the hero ring, the drum, the wall, the story steps, cards flying or flipping). Hover, tap and keyboard asking are off at the same time, so the hero ring's card dialog works as before. Decided 2026-11-17. Cause of the earlier bug: the label layer was only updated while the table camera was awake, so scrolling back up left it frozen on screen; it now runs from the main frame loop (`createSeats().frame(k)` in `cards.js`) and every seat hides itself explicitly.

## Rules for every interaction

1. **Optional, and nobody gets stuck.** Scrolling plays the same moment. No step waits for a tap, and no pin holds the page until something is pressed. A visitor who never taps still sees the whole story.
2. **One hint, once.** A single short hint ("Tap a seat") appears the first time and fades. No instructions panels.
3. **Every input.** Mouse, touch and keyboard. The things you can press are real buttons with labels.
4. **Light.** Transform and opacity only (AC-8), no new libraries, nothing that breaks the 130 KB script budget (AC-14).
5. **Reduced motion.** The same interaction works, with fades in place of 3D movement (AC-13).

## Visitor rhythm

Watching and doing take turns, so the page never feels like only a video or only a game.

| Chapter | The visitor |
|---|---|
| 0 | Explores: hovers the ring, turns a card over (built) |
| 1 | Watches the deal |
| 2 | Watches the night (the tap a seat explorer was removed, 2026-11-16) |
| 3 | Watches the vote |
| 4 | Does: turns the quest cards over |
| 5 | Does: touches the water |
| 6 | Watches the score swing |
| 7 | Decides: points the blade |
| 8 | Acts: draws a card, messages the owner, invites friends |

## Chapters

Each chapter lists: **On screen** (what the visitor sees, in order), **Words** (lines in bold are also the trailer's title cards), **Rule shown**, **Visitor involvement**, **Camera** (zoom and fade), **Scroll** (in screens, desktop), **Needs**.

### Chapter 0. The Gate: cold open and prologue

- **On screen**:
  1. (built) Cold open: ten face down cards turn on an oval around the title. Hovering stops a card. A click turns it over in a dialog. This is a free peek: the story itself keeps the cards hidden until the night.
  2. (new) Prologue: as the visitor starts to scroll and the ring speeds up and breaks (built), four lines appear one at a time in the centre, each fading as the next arrives. The backdrop dims a little with each line.
  3. The last line lands as the cards pack into the drum.
  4. (owner, 2026-11-17) **Title runners**: two small figures take turns running across the letters of the title "Avalon", one at a time, never together:
     - **Ink runner** (a stick figure in the title's ink): stands on the peak of the A, wobbles, loses its footing and rolls head over heels into the dip of the v, lies there dazed for a moment (small gold stars circle its head), gets back up, runs up the v's right arm and along the a, makes one arc just over the l and lands on the o, runs across the o and the n, slides down the n's right side and fades out just past it.
     - **Merlin's apprentice** (stick figure with a pointed navy hat and a wand, trailing gold sparks): appears in a puff on the A's left slope, hops across the A's peak, makes a small hump over the v onto the a, runs along the a, makes a big high jump over the l and lands on the o, runs to the middle of the n, waves the wand and vanishes in a puff.
     - Then the Ink runner drops back onto the A from above, and the two keep alternating, one run each.
     - **First section only**: they ride on the title, so they fade and lift away with it as the pin starts, and stop as soon as the hero leaves the screen. They never appear in a later chapter. They also stop while the browser tab is hidden.
     - Same in every language (the title is the brand name "Avalon" in English, 中文 and BM). The route is measured from the real letters, so it fits every screen size.
     - Reduced motion: the Ink runner stands still on the A.
     - Chosen from two playable prototypes (Avalon Title Runner, five options; then Avalon Runner Routes, the owner's redrawn routes for options 1 and 4).
- **Words**:
  - **Trust no one at the round table.** (built title)
  - "The knights of Avalon gather to save the kingdom."
  - "But some of them came to destroy it."
  - "Only Merlin knows who."
  - **Knowing the truth is not the same as surviving it.**
- **Rule shown**: none. It sets up the kingdom, the hidden threat and Merlin, so the Assassin's strike in chapter 7 pays off a promise made here.
- **Visitor involvement**: (built) hover the ring, turn any card over.
- **Camera**: slow push toward the ring while the lines appear.
- **Scroll**: the built hero hold and scatter (about 1.7) plus about 1 more, so each line gets about 0.6 of a screen.
- **Needs**: a slot for the four lines in the hero stage. No new picture (decision 17).

### Chapter 1. The Deal

- **On screen**:
  1. (built) The ring breaks, the cards turn face up and pack into a drum ([002](../section/002-gathering.md)).
  2. (built) The drum opens into the card wall ([003](../section/003-unfolding.md)).
  3. (built 2026-11-15, [004 The Deal](../section/004-the-deal.md)) The camera pulls back and tilts down. The twenty extra wall cards slide off the edges. The ten real cards turn face down and are dealt one by one to ten seats around a round table, seen from above at a slant. This table is the set for chapters 2 to 7.
- **Words**: **Ten seats. Six are loyal. Four are lying.** Under it: "Every player gets one secret card. Nobody shows it. Not even to friends."
- **Rule shown**: hidden roles, two sides.
- **Visitor involvement**: watch the deal.
- **Camera**: pull back from the wall to a wide shot of the table, then a slow push in.
- **Scroll**: about 1.5.
- **Needs**: the round table (built as a CSS disc, no picture). The words are built (`deal.title`, `deal.lede`). Still to do: these lines are meant to replace the current "Three rounds of doubt" copy under the wall, which is also wrong (the game has up to five quests, and the first side to three wins). The old copy is still there, see [004](../section/004-the-deal.md) open points.

### Chapter 2. Night Falls

- **On screen**:
  1. The page turns to night. A small closed eye sits on every card. "Everyone, close your eyes."
  2. "Evil, open your eyes." Three eyes open: the Assassin, Morgana and Mordred. Each of their cards tilts up toward the camera so only the visitor sees the painting, its red badge glows, and thin red threads join the three. Oberon's eye stays shut and no thread reaches him. "The traitors find each other. Oberon works alone."
  3. "Merlin, open your eyes." Merlin's card tilts up. Threads of light reach three cards, the Assassin, Morgana and Oberon, which glow red. Mordred stays dark. **Merlin sees the traitors. All but one.**
  4. "Percival, open your eyes." Two cards shine the same gold: Merlin and Morgana. "Percival sees two Merlins. Only one is real."
  5. The four Loyal Servants never open their eyes. "Everyone else saw nothing at all."
  6. "Everyone, open your eyes." Dawn. The threads fade and the page goes back to cream. **Now everyone knows something different.**
- **Rule shown**: who knows what at the start. Each role's power, in action.
- **Visitor involvement**: watch (owner, 2026-11-16: the tap a seat explorer was built, then removed; the night is watch only). Without scripts, a "who knows what" list gives each seat's view.
- **Camera**: close up on each card as its eye opens, pull out to the whole table between steps. Night falls and dawn breaks with slow fades.
- **Scroll**: about 4.4 on a desktop, 3.75 on a phone (owner, 2026-11-15 and 2026-11-16: the night falls and the dawn each take half a screen to turn the page).
- **Needs**: an open and a closed eye, the red threads, the gold shine, crystals, a moon with stars, and focus rings (no focus rings while evil wakes). All CSS or SVG, no new paintings. Camera is orbit and dolly. Full plan: [005 The Night Falls](../section/005-the-night-falls.md).

### Chapter 3. The Vote

- **On screen**:
  1. A crown lands in front of one seat. "Each round, one player leads."
  2. The leader pushes three cards to the middle, the team for quest 1. "The leader picks who goes on the quest."
  3. Every seat gets an Approve and a Reject vote card and lays one face down.
  4. All ten turn over at the same moment: four Approve, six Reject. **Everyone votes. All at once. In the open.**
  5. Rejected. The crown slides to the next seat and the first mark on the reject track lights. **Five rejected teams in a row, and evil wins without lifting a blade.**
  6. The new leader picks three: the Assassin, the seat 3 Loyal Servant and one more. As the Assassin is picked, his seat flickers red for a moment, for the visitor's eyes only. Seven Approve, three Reject. Approved. The reject track clears.
- **Seat labels**: the team in the middle shows its names and badges ("1 · Merlin") while the leader picks, then the labels and numbers of those three seats fade out as the vote cards are laid (both rounds) and come back once the cards have faded. The other seven seats keep their numbers.
- **Rule shown**: the leader picks, everyone votes in the open, more than half must approve (a tie is a reject), five rejects in a row and evil wins.
- **Visitor involvement**: watch. The red flicker tells the visitor what the table does not know.
- **Camera**: wide from above as the ten vote cards turn, a quick push in on the crown as it moves.
- **Scroll**: about 2.5.
- **Needs**: Approve and Reject vote cards (new pictures), a vote card back, the crown. The score track and the reject track appear here.

### Chapter 4. The Quest

Full plan: [007 The Quest](../section/007-the-quest.md) (decisions of 2026-11-16 replace the earlier version of this chapter).

- **On screen**:
  1. A Success and a Fail card rise and face the visitor. The Success card carries both badges, blue and red. The Fail card carries only the red. "The team goes on the quest. In secret." "The loyal must play Success. Traitors may play either."
  2. Quest 1, short: seats 2, 3 and 10 lay one card each. The Assassin's card glints red, for the visitor only, as he lays a Success. A quick shuffle, three Success, the first circle blue. "Even the Assassin plays Success. For now."
  3. The crown moves to seat 3. A team of four (seats 2, 3, 5, 8). "Approved."
  4. Over the Assassin's shoulder: his two cards in his hand, and he picks Fail. "Only you see it."
  5. The camera rises to look straight down. The four cards are laid and shuffled like cups and a ball.
  6. (interaction) "Turn them over." The visitor taps the cards, or scrolling turns them. The last card turned is always the Fail. It lands slow and heavy, red light spreads, its badge flies into the second circle. **One Fail is enough. Nobody knows whose.**
  7. The accusation. "Seat 3 was on both quests." The Assassin points at the seat 3 Loyal Servant first, then the table follows, line by line. Merlin stays silent. **The traitor points first.**
- **Rule shown**: quest cards are played in secret and shuffled, the loyal can only play Success, traitors may play either, one Fail sinks the quest (quest 4 is the exception, see chapter 6), and the table only ever sees the result, never who played what. That gap is where the arguing starts.
- **Visitor involvement**: turn the cards yourself. Then watch an innocent player take the blame while the visitor knows the truth.
- **Camera**: wide for the rule and quest 1, low over the Assassin's shoulder for his choice, straight down on the middle for the shuffle and the taps, a short hold on the Fail. Pull back wide for the accusation lines.
- **Scroll**: about 3.6 on a desktop, 3.1 on a phone.
- **Needs**: Success and Fail quest cards (made), a quest card back (the role card back for now), the accusation lines (CSS strips like the night's threads).

### Chapter 5. Lady of the Lake

Full plan: [008 Lady of the Lake](../section/008-lady-of-the-lake.md), approved by the owner 2026-11-16 (its decisions replace the earlier version of this chapter).

- **On screen**:
  1. After quest 2, the Lady's painting rises full size in the middle of the screen, holds, then flies down and stands at Mordred's seat (the visitor knows he is evil). "After the second quest, the Lady of the Lake wakes."
  2. Mordred looks at seat 3, the Loyal Servant the table blamed after quest 2. "Mordred holds her. He looks at seat 3, the one the table blames."
  3. (interaction) The middle of the table turns to still water and the camera sinks toward it. On desktop it ripples under the mouse. "Touch the water." The visitor taps it, or scrolling does it: a ripple runs out, and seat 3's reflection rises in shadow with only its badge lit, and it is blue. "She shows her holder one player's true side."
  4. Mordred speaks, and a word appears at his seat: "Evil." **The Lady never lies. The one holding her might.** The table turns on seat 3 again. "Even Merlin can't see this lie." (Merlin can't see Mordred.)
  5. The Lady card passes to seat 3. "She moves on. She wakes again after quests 3 and 4."
- **Rule shown**: after quests 2, 3 and 4, the holder looks at one player's side (the side, not the role), may tell the truth or lie, then hands the Lady to that player.
- **Visitor involvement**: touch the water, see the blue, then hear Mordred say "Evil". The visitor catches the lie as it is told.
- **Camera**: rest while the painting arrives, sink toward the water for the touch, pull back for the lie and the pass.
- **Scroll**: about 2.6 on a desktop, 2.3 on a phone.
- **Needs**: the Lady of the Lake card (made), a water simulation in the middle of the table (WebGL, with 2D and CSS fallbacks). Built on its own after chapters 3 and 4.

### Chapter 6. The Climb

Full plan: [009 The Climb](../section/009-the-climb.md) (decisions 20 to 24 of 2026-11-16 add the two Lady wakes, Percival's mistake and bluff, and the celebration to the outline below).

- **On screen** (fast cuts):
  1. Quest 3: four Success. Circle 3 blue, 2 : 1. The Lady passes again with one quick ripple.
  2. Quest 4: a team of five. "At ten players, quest four needs two Fails." Success, Success, Success, Fail ... Fail. Circle 4 red. **Two all. One quest left.**
  3. Quest 5: five Success. Circle 5 blue. Gold light fills the page. **Good has won.** A long hold, long enough to feel like the end.
- **Rule shown**: the first side to three quests wins. Quest 4 needs two Fails at seven players or more.
- **Visitor involvement**: watch the score swing. The long hold after "Good has won" is a false ending on purpose.
- **Camera**: quick zooms in and out between quests, cuts timed to the scroll.
- **Scroll**: about 2.

### Chapter 7. The Blade

Full plan: [010 The Blade](../section/010-the-blade.md). Decisions 25 to 31 of 2026-11-16 replace the camera below (facing the arc, the strike in place, no top down cut) and add the arc in front of the table, aim then strike, ghost faces, the hard cut, the link and the haptics.

**Shared opening (both endings)**

1. The gold light holds for a moment, then goes out. The page turns dark. **But one blade remains.**
2. The four evil cards turn face up, red badges burning. "Evil can lose every quest and still win."
3. The Assassin's card moves to the front of the table and a dagger rises from it. The six loyal cards stay face down in an arc. "Name Merlin, and everything goes to evil."
4. The dagger drifts from card to card. It slows between two: Merlin and Percival (all game, Percival acted like Merlin to draw the blade away). A heartbeat.
5. **The visitor points the blade.** The six loyal cards light up and can be tapped, clicked or chosen with the keyboard. "You saw everything tonight. The Assassin saw nothing. Where does the blade fall?" The dagger follows the pointer or the focused card. On a choice, the dagger rises and strikes that card.
   - Merlin chosen: ending A.
   - Any other loyal card chosen: ending B.
   - The visitor scrolls to the end of this stretch without choosing: the Assassin picks Merlin himself, ending A.
   - Scrolling back up above this step pulls the dagger back and the choice can be made again.

**Ending A: the blade finds Merlin (evil wins)**

1. The dagger drops onto Merlin's card. A short white flash and a small shake of the table.
2. The card turns face up: Merlin. Cracks run across the painting from where the blade hit, and the blue badge drains to grey.
3. The three blue circles on the score track crack one after another, left to right, and fill red. The win is taken back.
4. The four evil cards rise. Red light spreads from them across the table and into the backdrop, which turns crimson.
5. **Three quests won. One name lost it all.**
6. Hold, then fade into chapter 8 with "Could you have hidden Merlin?"

**Ending B: the blade misses (evil loses)**

1. The dagger drops onto the chosen card (Percival or a Loyal Servant). The same flash.
2. The card turns face up. Its blue badge holds and glows. The dagger cracks and falls apart into dark ash.
3. A beat of silence. The Assassin's red glow flickers and goes out. The four evil cards sink back and turn grey.
4. Merlin's card turns face up by itself, slowly, in gold light. "Merlin stayed hidden."
5. The three blue circles lock and turn gold. A dawn light rises over the dark table.
6. **The blade missed. The realm is saved.**
7. Hold, then fade into chapter 8 with "Could you have found Merlin?"

- **Rule shown**: when good wins three quests, evil gets one guess at Merlin, and a right guess steals the whole game.
- **Visitor involvement**: decide. The visitor already knows who Merlin is, so this is not a guess. It is a choice: hand evil the win, or let the realm stand.
- **Camera**: low and close behind the dagger as it moves, so the visitor looks along the blade. Cut to top down for the strike. Wide pull back for the result.
- **Scroll**: about 2 for the shared opening, about 0.5 for the choice, about 1.5 for either ending.
- **Needs**: the dagger (new picture or SVG), a crack overlay (SVG), the ash break up (SVG or CSS pieces). The heartbeat is for the trailer only; the site has no sound today.
- **Reduced motion**: the six cards are plain buttons, the chosen ending shows with fades. **Scripts off**: ending A shows as plain text.

### Chapter 8. Your Seat

Full plan: [011 Your Seat](../section/011-your-seat.md). Decisions 32 to 35 of 2026-11-16 move the draw onto the table (from the lit seat), set the light and the result layout, put the ending in "Invite my group", and give "Save me a seat" its own message.

- **On screen**:
  1. The closing question from chapter 7.
  2. The camera pulls back from the table. The cards are gone and the ten seats are empty. One seat at the front catches a warm gold light.
  3. **Now imagine the liar is your best friend.**
  4. "Your turn. Draw your card." The draw (built): draw a role, share it. The draw result keeps its own WhatsApp button (built).
  5. The final call (built section, new copy and one new button).
- **Words**:
  - After ending A: "Could you have hidden Merlin?" After ending B: "Could you have found Merlin?"
  - **Now imagine the liar is your best friend.**
  - Final call: **Your seat is waiting.** Under it: "Online Avalon nights. Come alone or bring your group. We fill the table."
  - Main button: **Save me a seat**. Opens WhatsApp to the owner with a ready message (AC-2).
  - ~~Second button: **Invite my group**~~ Removed 2026-11-17 (decision 37). The final call has the one button.
- **Rule shown**: none.
- **Visitor involvement**: draw a card, share it, message the owner, invite friends.
- **Camera**: slow pull back to the empty table while the warm light grows.
- **Why this converts**: the hardest part of Avalon is getting five to ten people around one table. The game nights solve that, so the last screen says it plainly ("We fill the table") and the main button books a seat with the owner. Telling visitors to organise a game themselves would send them to buy the box instead.
- **Built**: the draw and the final section in spec 0001. New: the copy, the second button.

## The trailer

60 seconds, words on screen only (no voice), the same lines as the page. Each shot moves with a zoom in or out and joins the next with a fade.

| Time | Chapter | Shot | Title card |
|---|---|---|---|
| 0:00 to 0:04 | 0 | Ring turning, push in to the title | Trust no one at the round table. |
| 0:04 to 0:09 | 0 | The ring breaks, the backdrop dims | But some of them came to destroy it. / Only Merlin knows who. |
| 0:09 to 0:13 | 1 | Drum bursts into the wall, pull back to the table, cards dealt | Ten seats. Six are loyal. Four are lying. |
| 0:13 to 0:22 | 2 | Night, eyes opening, red threads, Oberon left in the dark, two gold Merlins | Close your eyes. / Merlin sees the traitors. All but one. / Percival sees two Merlins. |
| 0:22 to 0:29 | 3 | Ten vote cards turn at once, the crown passes | Everyone votes. All at once. / Five rejections and evil wins. |
| 0:29 to 0:36 | 4 | Over the Assassin's shoulder he picks Fail, four quest cards turn over, the Fail lands, the Assassin points, accusation lines follow | One Fail is enough. / The traitor points first. |
| 0:36 to 0:42 | 5 | Water ripple, a blue badge, the word "Evil" | The Lady never lies. The one holding her might. |
| 0:42 to 0:47 | 6 | Fast cuts, circles fill, gold light | Two all. One quest left. / Good has won. |
| 0:47 to 0:55 | 7 | Lights out, the dagger drifts between Merlin and Percival, rises, strikes. Cut to black before the card turns | But one blade remains. |
| 0:55 to 1:00 | 8 | Black, then the empty table with one lit seat, then the WhatsApp button | Who did the blade find? / Your seat is waiting. |

The trailer stops before the result so it ends on a question. The page shows the answer.

## Pictures to make

The owner asked for these to match four pictures of the published game's cards "99%". They will **not** be copies: spec 0001 (Context) and [001-characters](../images/001-characters.md) record that the publisher's art is copyrighted and copying it puts the page at risk of a takedown. Each new picture keeps the meaning and feel of its reference (the same objects, materials and mood), drawn our own way, in our own card frame, with our own badges. The references are saved in `refeerences/` for the record. They are not fed to the model.

The words on the four vote and quest cards (Approve, Reject, Success, Fail) are **not painted into the pictures**. The page puts them on top as live text from the language files, so they show in English, Chinese and Malay. The two badges on the quest cards are also added by the page. Owner confirmed, 2026-11-15. Details and the preview are in [003-props](../images/003-props.md) and section 11 of `design/index.html`.

| Picture | Chapter | Reference | Our version (made 2026-11-15) |
|---|---|---|---|
| Approve vote card | 3 | `refeerences/ref-vote-cards.png` | Cream parchment, a polished white marble sphere with gold veins, soft shadow, warm side light. Title APPROVE on top (added by the page) |
| Reject vote card | 3 | `refeerences/ref-vote-cards.png` | Same parchment and layout. A rough, faceted black obsidian sphere, **the same size and position as the Approve sphere** (owner's request). Title REJECT on top |
| Success quest card | 4 | `refeerences/ref-quest-success.png` | Dark bronze. A tall glowing gold chalice with vine engraving and a row of red stones. Title SUCCESS on top, **blue badge lower left and red badge lower right**, beside the stem |
| Fail quest card | 4 | `refeerences/ref-quest-fail.png` | Same layout, colder and dimmer. The chalice tarnished green and black, cracked, dull red stones, smoke. Title FAIL on top, **red badge lower right only** |
| Lady of the Lake card | 5 | `refeerences/ref-lady-of-the-lake.png` and the owner's second picture | `lady_of_the_lake.png`. A woman seen from behind, waist deep in a misty green lake at dawn, bare back and shoulders, long golden hair, holding a thick white linen shirt against her front and hips, head turned over her shoulder to look at the viewer. White water lilies, forest and mist, no buildings. **No bowl** (the chapter 5 water effect works on the table top and does not need one). Own drawing: the owner's picture is described in words, never fed to the model |
| Round table | 1 to 7 | none | Built 2026-11-15 as a CSS disc (wood grain, carved rim, soft glow), no picture. A painted table only if the owner asks |
| Crown and dagger | 3, 7 | none | Small pictures on a plain background, cut out like the badges. Or SVG |
| Vote and quest card backs | 3, 4 | none | Reuse the role card back for the first build |

How they are made:

- Model **gpt-image-2.6-flare**, as for the badges.
- A new `props` block in `scripts/art-prompts.json` (one shared style text, one subject line per picture), and a `--props` mode in `scripts/generate-art.mjs` that works like `--badges`. Portrait 2:3 for cards, square for the crown and dagger.
- One test of each of the five cards first, reviewed with the owner before any retries. Made 2026-11-15 (see [003-props](../images/003-props.md)). Still to make: the round table (or CSS), the crown and the dagger.
- Originals go to `src/assets/props/`. The build makes small WebP files, as it does for the cards.

## What this changes in the built site

| Part | Change |
|---|---|
| Hero ring, drum and wall | The four prologue lines get a slot in the hero stage and the pin grows by about one screen. Otherwise no change: the ten ring cards are the ten players |
| Story text under the wall (`how.*` keys in `src/i18n/*.json`) | Replaced by chapter 1's lines |
| "Meet the characters" section (seven card flips) | **Removed 2026-11-17** (template, pin, CSS and words). The roles are shown in chapter 2 |
| Light to dark turn (`src/js/theme.js`) | **Done 2026-11-17**: moved from the Assassin flip to the start of chapter 7 (`blade.js` drives it across 0.05 screen). Chapter 2 adds a short night and dawn. Chapter 7 adds two more tints, crimson and dawn |
| Interactions | Four new optional ones (chapters 2, 4, 5 and 7), each following "Rules for every interaction" |
| Draw | Kept. The draw still deals one of seven roles |
| Final call | **Done 2026-11-17**: new copy, "Save me a seat" (WhatsApp to the owner) and a second button, "Invite my group", that opens WhatsApp's share screen |
| Spec 0001 | AC-1 (section order), AC-4 (characters section) and AC-5 (when the page turns dark) to be rewritten. AC-10 or a new AC to cover the "Invite my group" button |
| Languages | Every new line needs Chinese and Malay, about 60 lines |

## Open points

1. ~~Round table: a painted picture or CSS only~~ Decided while building chapter 1 step 3: CSS (see [004](../section/004-the-deal.md)).
2. **Length on phones**: the prologue and chapters 1 to 7 add about 20 screens to the built 5. Each chapter must give something new within one screen of scroll on a phone. Checked chapter by chapter while building.

## Build order

Each chapter gets its own plan in `docs/section/` and is approved before it is built, as for parts 1 to 3.

1. Pictures: one test of each card, owner review, then the rest
2. Chapter 0: the four prologue lines in the hero stage
3. Chapter 1 step 3: the table and the deal (built 2026-11-15)
4. Chapter 2: Night Falls (built and approved by the owner 2026-11-16, watch only)
5. Chapters 3 and 4: the vote and the quest, with the score track and the accusation
6. Chapter 5: Lady of the Lake (plan approved 2026-11-16, [008](../section/008-lady-of-the-lake.md), built on its own after chapters 3 and 4)
7. Chapter 6: The Climb
8. Chapter 7: The Blade, the visitor's choice and both endings (built 2026-11-17, [010](../section/010-the-blade.md))
9. Chapter 8: hand off into the built draw, the new final call copy and button. Remove the characters section and move the dark turn (built 2026-11-17, [011](../section/011-your-seat.md); the draw plays on the table and the characters section is gone)
10. Final review: the whole story from the first card to the WhatsApp message, on a phone, with reduced motion, and in all three languages
