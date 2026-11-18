# 011 Your Seat (scroll story part 11, chapter 8)

**Status**: plan written 2026-11-16 with the owner, from their answers and their picks on The Blade Options page. **Approved by the owner 2026-11-16.** **Built 2026-11-17** (owner's look pending), see [As built](#as-built-2026-11-17).
**Change 2026-11-17**: the owner removed the "Invite my group" button (story decision 37). Everything below about the invite (decisions 5 and 6, the `inviteButton`, `initInvite`, `wa_invite`, the `invite` words, Y-8) is **no longer built**; the final call has only "Save me a seat". The text is kept as history.
**Build command**: `/develop chp8-your-seat`. Read [Before you build](#before-you-build) first.
**Story**: [story_line.md](../scope/story_line.md), chapter 8 Your Seat. Rule shown: none. Visitor: **acts**: draws a card at the table, messages the owner, invites friends. This is the chapter the whole page exists for (spec [0001](../specs/0001-avalon-landing-page.md): the one goal is a WhatsApp message to the owner about game nights).
**Model**: the same pinned stage and round table as [004](004-the-deal.md) to [010](010-the-blade.md), then the pin releases into the final call, a normal section.
**Comes after**: [010 The Blade](010-the-blade.md), which ends on either ending's last line with the "See the other ending ↑" link: ending A (crimson layer up, Merlin cracked in the arc, evil cards risen, circles 1, 3, 5 red) or ending B (dawn layer up, Merlin face up in gold, evil cards grey, circles 1, 3, 5 gold). `blade.result()` says which, and whether the visitor chose. **Leads into**: the footer. This is the last chapter.
**Code it will touch**: new `src/js/seat.js`, `src/js/draw.js` (a staged mode for the table), `src/js/cards.js` (`hero`: the ninth number in the frame loop; the characters pin and flips removed), `src/js/theme.js` (lower crimson and dawn), `src/js/main.js` (the hero "draw" link), `src/templates/home.mjs` (a `seat` template, the `draw` and `final` templates, the `chars` template removed), `src/templates/parts.mjs` (an invite button), `src/styles/main.css`, `src/i18n/*.json`, `scripts/build.mjs` (the key check after `chars.*` is removed)
**Prototype** (private page the owner chose from): The Blade Options (https://claude.ai/artifact/6Vfoq87LKyrryHoieP1FuD), groups 7 and 8. The owner picked **7A+A, light from above and the card rises**, and **8A, the ending goes in "Invite my group" only**. Its sizes and timings are a starting point. Its code is not ported as is.

## Summary

The ending's colour settles back into plain dark, and the closing question rises: **"Could you have hidden Merlin?"** after ending A, or **"Could you have found Merlin?"** after ending B. The cards and the score bar fade away, and the camera pulls back to the round table with ten empty chairs. One chair at the front catches a soft cone of light from above. **Now imagine the liar is your best friend.** A face down card lies at the lit seat: "Your turn. Draw your card." Tap it and it rises off the table and turns over into your role, with the result beside it (under it on a phone): the role, its line, "Ask about game nights", the share buttons and "Draw again". Keep scrolling and the pin lets go into the final call: **Your seat is waiting.** "Online Avalon nights. Come alone or bring your group. We fill the table." The main button **Save me a seat** opens WhatsApp to the owner. The second button **Invite my group** opens WhatsApp's share screen, and if the visitor struck the blade themselves, the message starts with what they did.

## Decisions made (owner, 2026-11-16)

| # | Decision | Why / who |
|---|---|---|
| 1 | **Its own plan and build**, after [010](010-the-blade.md). Command `/develop chp8-your-seat` | Owner |
| 2 | **The draw happens on the table, from the lit seat.** The empty table stays pinned. The lit seat holds a face down card, and tapping it plays the draw right there. The pin then releases into the final call | Owner. The story flows straight into "your card" instead of ending and starting a normal web page |
| 3 | **The light is a soft cone from above (7A)**, falling on the empty chair at the front, like a stage | Owner, after trying the spotlight and the candle |
| 4 | **The card rises (7A)**: it lifts off the table and turns over, and the result sits beside it on a desktop and under it on a phone. The card stays the hero | Owner, after trying "card rises" and "sheet slides up" |
| 5 | **The ending goes in "Invite my group" only (8A).** Ending A: "I just let the Assassin find Merlin." Ending B: "I just saved Merlin from the blade." The message to the owner stays a clean booking message | Owner, after seeing all three options as messages |
| 6 | **No verdict line when the visitor did not choose** (the Assassin chose by himself). The invite is only the base message | Owner. The message doesn't claim a strike the visitor never made |
| 7 | **"Save me a seat" opens WhatsApp with a new message that matches it**: "Hi! Save me a seat at the next online Avalon night." The nav and hero buttons keep their current message | Owner |
| 8 | **The final call copy** is the story line's: eyebrow kept ("Online, every game night"), title "Your seat is *waiting.*", lede "Online Avalon nights. Come alone or bring your group. We fill the table." | Story line, owner approved v3 |
| 9 | **The seven card "Meet the characters" section is removed**, with its pin, its flips, its CSS and its `chars.*` words | Story line decision 5. Chapter 2 now introduces the roles |
| 10 | **The draw still deals one of the seven roles**, with the built fair pick (crypto random, never the same role twice in a row), the built result, share links and role pages | Story line "What this changes": the draw is kept |
| 11 | **Length about 2.0 screens of pin on a desktop, 1.76 on a phone**, then the final call as a normal section | Owner |
| 12 | **Anti slop pass with the installed taste skill** (`.agents/skills/high-end-visual-design`). Only the rules that fit apply (see [Taste pass](#taste-pass)). The approved look of the final call is kept, only its words and the second button change | Owner, same as 007 to 010 |
| 13 | **CSS 3D with GSAP, no new libraries, transform and opacity only (AC-8)** | Same as 002 to 010 |

## Before you build

`/develop` checks these first. If any check fails, **stop and tell the owner**. Do not build a stand-in.

1. **Chapter 7 is built**: `src/js/blade.js` exists, `cards.js` has `BLADE` in the frame loop, `blade.result()` works, and `theme.js` has `setBlood` and `setDawn`.
2. **This plan is approved**: the scope's chapter 8 entry has "plan approved" ticked.
3. Read the "As built" notes in [010](010-the-blade.md) (and earlier ones the build touches), for the real camera numbers and class names. Where they differ from this plan, the built ones win.

## What the visitor sees

### In the pinned stage

| # | Step | Words (bold = trailer title card) | Camera | On the table |
|---|---|---|---|---|
| 1 | **The question** | "Could you have hidden Merlin?" (ending A) or "Could you have found Merlin?" (ending B) | The ending pose, then eases toward rest | The ending's last line and the link fade. The crimson or dawn layer lowers to 0 over about half a screen, so the page settles into plain dark. The score bar fades out |
| 2 | **The empty table** | (same line) | Pulls back from the arc pose to a wide view, `tilt` back to the resting lean | Every card (the arc, the evil cards, the Assassin's) and any dagger, cracks or ash sink a little and fade. Ten empty chairs fade in round the rim, one per seat. The chair at the front (seat 1, at `a` 90) catches a soft cone of light from above, and a warm pool of light spreads on the table in front of it |
| 3 | **Your best friend** | **Now imagine the liar is your best friend.** | A slow push in toward the lit seat | Nothing else moves. The light grows a little |
| 4 | **Your card** (draw window) | "Your turn. Draw your card." | Still | A face down card lies on the table in the pool of light, with a soft gold pulse round its edge, once. It is a real button. A tap draws (see [The draw](#the-draw-decisions-2-4-and-10)). With no tap, nothing happens: the card waits |

### After the pin: the final call (a normal section)

- Eyebrow "Online, every game night", title **Your seat is *waiting.***, lede "Online Avalon nights. Come alone or bring your group. We fill the table."
- Main button **Save me a seat**, the large WhatsApp pill, to the owner with "Hi! Save me a seat at the next online Avalon night." (event `wa_final`).
- Second button **Invite my group**, smaller, a ghost style pill under or beside it, opening WhatsApp's share screen (event `wa_invite`). See [The invite](#the-invite-decisions-5-and-6).
- Then the footer, as built.

### Scroll budget (about 2.0 screens of pin on a desktop, 1.76 on a phone)

| Stretch | Screens |
|---|---|
| The question, layers settle | 0.35 |
| The empty table, chairs, the light | 0.45 |
| Your best friend | 0.35 |
| Draw window (the card waits) | 0.85 |

`SEAT` is a ninth number in the frame loop after `BLADE`, in the same unit as 004 to 010 (one old unit is 5 screens on a desktop, 4.4 on a phone). `SEAT = 0.4` on both. The hero pin grows by about 2.0 screens and then ends. Phone stretches are the desktop ones times 0.88.

## The camera

Reuse the night's camera object `{ a, fr, dz, tilt, ty }` and its long lens.

| Pose | When | Values (desktop; phone in brackets) |
|---|---|---|
| From the ending | Step 1 | 010's ending pose (about 0.95x of the arc pose) |
| Wide, empty | Step 2 | `a` 90, `tilt` 28 (20), dolly about 0.9x of rest, so the whole table, the chairs and the cone fit with room above for the words |
| Toward the seat | Steps 3 and 4 | `a` 90, `tilt` 28 (20), dolly about 1.15x (1.1x), focus moved down so the lit seat sits about 62% down the screen |

- The pull back in step 2 takes the whole 0.45 screen, eased with `power3.inOut`.
- Measure in the real stage. The prototype's numbers are only a guide.
- **Hit size**: the face down card at least 64 px wide at 360 px (target about 72 px).

## The light and the chairs (decision 3)

- **Chairs**: ten small CSS shapes in the table plane, just outside the rim at each seat, rotated to face the middle (dark wood gradient, a soft shadow). They stand up toward the camera a little (the 005 way) so they read as chair backs. The front chair is a little brighter.
- **The cone**: one element in the stage above the table (not in the table plane), a soft warm gradient clipped to a trapezoid from the top of the screen down to the front seat. Opacity only.
- **The pool**: one radial gradient on the table plane in front of the lit seat. Opacity only.
- Both rise from 0 across step 2 and grow a little in step 3.

## The draw (decisions 2, 4 and 10)

- **`draw.js` gets a staged mode**: `initDraw({ animate, staged: { card, panel } })`. In staged mode the seat card is the pick card and the seven card deck shuffle is not used. Everything else stays: `pickRole()` (fair, no repeat), `loadFace()`, `fillResult()` (role page link, the WhatsApp "Ask about game nights" with `waMessage.withRole`, the share links, copy link, the live line), the states `idle`, `shuffling`, `revealed`.
- **The seat card** is a real `button` (label "Draw your card", `seat.cardLabel`) in the stage, placed in the pool of light, in the table plane, standing up a little. It is a button only in the draw window and after a draw.
- **A tap** plays a timed tween (about 1.3 s, like the built draw): the card lifts off the table, moves to its result place while it grows, a soft gold glow passes behind it, and it turns over to the role's painting and badge (`expo.out` for the lift, `power2.inOut` for the turn). The face is loaded before it turns (the built `loadFace` wait).
- **Result place** (decision 4): on a desktop the card stands left of centre at about 62% of the screen height, and the result panel sits to its right, about 38% of the width, vertically centred. On a phone the card sits in the upper part at about 34% of the screen height, and the panel sits under it to the bottom with the side gutter. Tablets in portrait take the phone layout.
- **The result panel** reuses the built result markup and styles (`.result` in the draw template): "Fate has dealt", "You drew *Merlin.*", the role's draw line, the "Ask about game nights" WhatsApp button, the share row, copy link, "Draw again ↻". It fades in over 0.45 s and the title gets focus, as built.
- **Draw again**: the card turns face down, gets the new face, turns up (the built `wasRevealed` path), and the panel's words change.
- **The scroll**: the drawn card and the panel stay while the visitor is in the draw window and as the pin releases (the stage scrolls up with them as the final call comes in). Scrolling back above the draw window puts the card back face down at the seat and hides the panel. Coming back down, the visitor can draw again, and the no repeat rule still holds.
- **The hero link** "Draw your card ↓" (`#draw`): in staged mode, `main.js` catches the click and scrolls (Lenis `scrollTo`) to the start of the draw window instead of jumping to a section. Without the pin it still jumps to the plain draw section.

## The closing question

- Read `blade.result().ending` when step 1 starts, and again whenever the visitor scrolls back into chapter 8, so a second choice in chapter 7 changes it. `'a'` shows `seat.hidden`, `'b'` shows `seat.found`. Both lines are in the stage, only one is shown.
- Reduced motion: the plain section shows the line for the ending chosen in the plain blade section (ending A by default). Scripts off: `seat.hidden` (scripts off always shows ending A).

## The invite (decisions 5 and 6)

- **The button** is a real link, `https://wa.me/?text=` plus the encoded message plus a space and the page link (`siteUrl` or the page origin, with the language prefix, for example `https://avalon.example/zh/`).
- **The message**: `blade.result()` gives the ending and whether the visitor chose. Chose and ending A: `invite.a` + " " + `invite.base`. Chose and ending B: `invite.b` + " " + `invite.base`. Did not choose, or no result: `invite.base` only.
- **When it is worked out**: `seat.js` updates the link's `href` whenever the result changes (each time chapter 8 is entered), so the link is always right when tapped. The build writes `invite.base` with the link into the `href` first, so it works with scripts off.
- Opens in a new tab like the other WhatsApp links, with the "(opens in a new tab)" hidden label.

## Removing the characters section (decision 9)

- `src/templates/home.mjs`: drop `chars(ctx)` from the body list and delete the `chars` template.
- `src/js/cards.js`: delete the characters pin and flips (the function that reads `.chars` and `.role-item`, and `warm()`'s `.chars` selector). The dark turn was already moved out in [010](010-the-blade.md).
- `src/styles/main.css`: delete the `.chars` and `.role-item` rules that nothing else uses, and drop `.chars` from the shared transition list.
- `src/i18n/*.json`: delete the `chars` block in all three files. `roles.*` stays (role pages, the draw and chapter 7 use it).
- `scripts/build.mjs`: the language key check must still pass with the block gone from all three files. Check nothing else reads `t.chars`.
- The plain draw section's noscript line says "You can still meet all seven roles above". Change `draw.noscript` to "The card draw needs JavaScript. You can still ask us anything on WhatsApp." in all three languages.

## Words

New keys under `seat`, `invite` and `waMessage`, and changed `final` keys, in `en.json`, `zh.json`, `ms.json`. Chinese and Malay are the assistant's wording, to be read by a native speaker like the rest.

| Key | English |
|---|---|
| `seat.hidden` | Could you have hidden Merlin? |
| `seat.found` | Could you have found Merlin? |
| `seat.friend` | Now imagine the liar is your best friend. |
| `seat.turn` | Your turn. Draw your card. |
| `seat.cardLabel` | Draw your card |
| `final.title` (changed) | Your seat is *waiting.* |
| `final.lede` (changed) | Online Avalon nights. Come alone or bring your group. We fill the table. |
| `final.cta` (changed) | Save me a seat |
| `final.invite` (new) | Invite my group |
| `waMessage.seat` (new) | Hi! Save me a seat at the next online Avalon night. |
| `invite.base` | Avalon night? Countless ways to betray your friends. Who's in? |
| `invite.a` | I just let the Assassin find Merlin. |
| `invite.b` | I just saved Merlin from the blade. |
| `draw.noscript` (changed) | The card draw needs JavaScript. You can still ask us anything on WhatsApp. |

`final.eyebrow` stays "Online, every game night". `waMessage.general` and `waMessage.withRole` stay.

## How it is built

- **A ninth number in the frame loop.** `y` runs 0 to 1 after `k` (the blade). Timeline length becomes `1 + DEAL + NIGHT + VOTE + QUEST + LADY + CLIMB + BLADE + SEAT`, and the pin length is `innerHeight x screens x` the same. This is the last number: the pin ends where `y` reaches 1.
- **New `src/js/seat.js`** (target at most 3 KB compressed). It owns the closing question, lowering crimson and dawn, fading the cards and the score bar, the chairs, the cone and the pool, the seat card's place and pulse, handing the card and the panel to `draw.js`, the scroll back reset, the invite link and the hero link's target. `hero()` calls `seat.frame()` once per tick, and `seat.build(tl, at)` adds the scrubbed tweens.
- **Templates**: a `seat` section in `home.mjs` after `blade` (the question lines, the friend line, the turn line, the seat card), moved into the stage with scripts like the chapters before. The `draw` section stays in the page for reduced motion and scripts off. In staged mode its result panel is moved into the stage and its deck is hidden. The `final` template gets the new words, `message: t.waMessage.seat` on its `waButton`, and a new `inviteButton(ctx)` from `parts.mjs` under it.
- **`inviteButton`** in `parts.mjs`: a smaller ghost pill (`.btn.ghost`, the existing ghost style used by "Copy link"), `href` with the base message and link, `data-event="wa_invite"`, the new tab label and the arrow.
- **Reduced motion** (`?motion=off`): no pin. The plain sections in order: the closing question, the friend line, the plain draw section (as built, seven cards and the button), then the final call with both buttons. **Scripts off**: the same, with the draw's noscript line and the static invite link.
- **Cleanup**: `hero()`'s cleanup puts the draw back in staged off mode (panel back in its section), removes the chairs, cone and pool, and resets the seat card.
- **Performance**: about 16 new elements. Only `transform` and `opacity` change per frame. `will-change: transform` only on the seat card while it lifts.

## Taste pass

From `.agents/skills/high-end-visual-design`, applied to what this chapter adds only:

- **Motion**: the lift uses `expo.out`, the turn `power2.inOut`, the pull back `power3.inOut`. The gold pulse on the card uses the site's spring curve (`--ease`). No `linear` on anything the eye follows.
- **No instant changes**: the question, the layers, the chairs, the light, the panel and the reset on scroll back all interpolate.
- **Shadows and edges**: the seat card reuses `--card-edge` and `--card-shadow` with a soft gold halo. The chairs get a soft diffused shadow. The final call keeps its approved look.
- **Hierarchy in the final call**: one large solid button (Save me a seat) and one quieter ghost button (Invite my group), never two equal pills. On a phone they stack, full width up to 360 px, with at least 12 px between them, each at least 48 px tall.
- **Blur**: none on anything that moves.
- **Phones and tablets**: the stage uses `100dvh`. The result panel never runs off the bottom at 360x640 (check the longest Malay draw line). Tablets in portrait take the phone layout.
- Not applied: its card chrome and eyebrow tags (the final call already has its approved eyebrow).

## What "done" looks like

| ID | Check |
|---|---|
| Y-1 | After ending A the question is "Could you have hidden Merlin?", after ending B "Could you have found Merlin?". Choosing again in chapter 7 changes it. Crimson or dawn settles back to plain dark across about half a screen |
| Y-2 | The cards, the dagger and the score bar fade, the camera pulls back, ten empty chairs appear, the front chair catches a cone of light with a pool in front |
| Y-3 | "Now imagine the liar is your best friend." with a slow push toward the lit seat |
| Y-4 | The seat card can be tapped, clicked or chosen with Enter or Space in the draw window. It lifts, turns into one of the seven roles, and the result shows beside it (desktop) or under it (phone) with the role, its line, "Ask about game nights", the share row, copy link and "Draw again" |
| Y-5 | The draw is fair and never repeats the last role. "Draw again" turns the card down and up with a new role. The role page link and WhatsApp "Ask about game nights" message are right in all three languages |
| Y-6 | Scrolling back above the draw window puts the card back face down and hides the panel. Coming back down, it can be drawn again |
| Y-7 | The pin releases into the final call: eyebrow, "Your seat is waiting.", the new lede, **Save me a seat** (WhatsApp to the owner with "Hi! Save me a seat at the next online Avalon night.") and **Invite my group** (WhatsApp share screen) |
| Y-8 | The invite message: chose ending A starts "I just let the Assassin find Merlin.", chose ending B starts "I just saved Merlin from the blade.", no choice has the base only. Each ends with the page link in the current language |
| Y-9 | The characters section is gone: no section, no pin, no `chars.*` keys, no console errors, the build's language check passes, role pages still build |
| Y-10 | The hero's "Draw your card ↓" lands on the draw window with motion on, and on the plain draw section with motion off |
| Y-11 | English, Chinese and Malay fit with no overlap and no sideways scroll at 1280x720, 1024x1366 (tablet), 390x844 and 360x640. The seat card at least 64 px wide at 360 px. Both final call buttons at least 48 px tall |
| Y-12 | `?motion=off` shows the question, the friend line, the plain draw and the final call with both buttons. Scripts off show the same with the noscript line and a working static invite link |
| Y-13 | No console errors. Scripts stay under 130 KB compressed (budget for this part: 3 KB, plus the changes to `draw.js`). Frame rate on a mid range phone (AC-14) |

## Build plan (its own pass, after 010)

1. [Before you build](#before-you-build) checks. Stop if any fail.
2. The words in three languages, the `final` template changes, `inviteButton`, the `seat` template, and the plain flow for scripts off and `?motion=off`. This runs end to end before any 3D: the final call already books a seat and invites a group. (Y-7, Y-12)
3. Remove the characters section (template, `cards.js`, CSS, words, build check, `draw.noscript`). (Y-9)
4. `seat.js` scrubbed timeline: the question, layers down, cards and bar out, the pull back, chairs, cone and pool, the push in, the seat card in place. (Y-1, Y-2, Y-3)
5. `draw.js` staged mode: the seat card as the pick card, the lift and turn, the result place on desktop and phone, draw again, the scroll back reset, the hero link. (Y-4, Y-5, Y-6, Y-10)
6. The invite link from `blade.result()`. (Y-8)
7. Check pass at the four sizes, three languages, motion off, scripts off, both endings, no choice, and scrolling back. Then the owner's look with a real mouse and phone, and a real tap on both WhatsApp buttons from a phone. (Y-11, Y-13)
8. Write an "As built" section here, and tick the scope.

## Also changed by this plan

- [story_line.md](../scope/story_line.md): the chapter 8 section (the draw on the table, the light, the result layout, the messages) and decisions 32 to 36.
- [scope.md](../scope/scope.md): the chapter 8 entry links this plan and its build command, and marks the plan as written.
- Spec [0001](../specs/0001-avalon-landing-page.md) still owes its rewrite of AC-1 (section order), AC-4 (characters section), AC-5 (the dark turn) and an AC for "Invite my group" (the scope's "Around the chapters" list). After this build those ACs describe a page that no longer exists, so run `/architect` on spec 0001 once this ships.

## Open points

1. **The draw in the share link.** The draw's share message still names the role ("I drew Merlin..."), and "Invite my group" names the blade. A visitor who does both sends two different hooks, which is fine.
2. **WhatsApp on desktop.** `wa.me/?text=` opens WhatsApp Web's share screen on a desktop, which asks for a login if the visitor has none. The owner's button works the same way today.
3. **Analytics.** `wa_invite` is a new event name. No analytics tool is chosen yet (scope, open items).
4. **The prologue** (chapter 0's four lines) is still unbuilt and separate. It doesn't touch this chapter.

## As built (2026-11-17)

- **Files**: `src/js/seat.js` (new, 5 KB compressed; also `initInvite`), `draw.js` (returns `{ stage, unstage, reset, draw, state, flip }`; in staged mode the pick card and the result move into the stage and `seat.js` plays the lift and the turn), `cards.js` (`createSeat`; the characters pin and flips removed), `main.js` (the draw is made before the cards; the hero link calls `drawLink.go`; `initBladePlain`, `initInvite`), `home.mjs` (`seat` section, `chars` removed, `final` with both buttons), `parts.mjs` (`inviteButton`), `main.css` (the `.chars` and `.role-item` rules removed), the i18n files (`chars` removed; `seat`, `invite`, `waMessage.seat`, new `final` words, `draw.noscript`).
- **Differences from the plan**: the seat card is a 2D overlay placed each frame from an anchor element in the table plane (so it follows the camera), not a 3D card; the cone of light is a 2D trapezoid that fades at both ends; the chairs are ten flat CSS shapes; the closing question text swaps live with `blade.result()`; the table is dimmed with `night.shade` while the chairs rise.
- **Result place**: desktop card 62% of the screen tall at 30% across, panel at 52% across (max 470 px); phone card at most 30% tall with the panel under it in a compact layout (no rule or share label), checked to fit at 360x640 in Chinese and 390x844 in Malay.
- **Invite**: `wa.me/?text=` with the ending line only when the visitor struck (for example "I just let the Assassin find Merlin."), then the base message and the page link; read again on press, focus and click.
- **Facebook share (changed 2026-11-17)**: the Facebook button is now always `facebook.com/sharer/sharer.php?u=<role page>&quote=<same words Threads gets>`, on desktop and phone. Facebook builds the preview card (the role's 1200x630 picture, title, description) from the role page's og tags, and `quote` pre fills the same text as Threads (Facebook may ignore `quote`, and the visitor can edit it). The old phone path, which opened the file share sheet with the card picture, was removed: Facebook drops the link and text when handed a picture file, so the post had no preview. The card picture is still saved with the save button. `layout.mjs` also adds `og:image:secure_url`, `og:image:type` and `og:image:alt`. `build.mjs` now warns loudly when `PUBLIC_SITE_URL` is unset (the placeholder domain cannot be previewed). The shared link always points at the real domain, so a share from workers.dev or the LAN address previews the production page; Facebook cannot reach a LAN address. After deploy, run each role page through the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) ("Scrape Again") to clear old cached previews.
- **Checked**: see the scope. **Open**: tablet, scripts off, a real tap on both WhatsApp buttons, the owner's look, spec 0001's rewrite (`/architect`).
