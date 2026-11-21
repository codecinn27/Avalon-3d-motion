# 014 The default blade (a change to chapter 7, The Blade)

**Status**: plan written 2026-11-21 with the owner, from their answers. Built the same day (owner's look pending), see [As built](#as-built-2026-11-21).
**Amendment 2026-11-21 (approved and built the same day, owner's look pending)**: the single pop-up is now a **sequence of three**: "You lose the game" → "You are the Assassin now" → "Select the card you think is Merlin" with two notes. See [Amendment: three pop-ups](#amendment-three-pop-ups-planned) and [its As built](#as-built-of-the-amendment-2026-11-21).
**Changes**: [010 The Blade](010-the-blade.md). Where this plan and 010 differ, this plan wins.
**Code it touches**: `src/js/blade.js`, `src/js/motion.js` (new `jumpTo`), `src/data/blade.json`, `scripts/build.mjs` (the `auto` check), `src/templates/home.mjs` (the plain ending and the pop-up), `src/styles/main.css`, `src/i18n/*.json`.

## Summary

Two changes to the blade's choice.

1. **Scrolling past the choice now lets Good win.** If the visitor doesn't strike, the Assassin's own strike lands on **seat 6, a Loyal Servant** (beside Merlin in the arc, a near miss), not on Merlin. Ending B plays: ash, Merlin turns over in gold, gold circles, dawn, "The blade missed. The realm is saved." Evil only wins (the cracks, the red circles, the crimson page) when the visitor picks Merlin.
2. **A pop-up at the choice.** The first time the scroll reaches the choice, the page stops and a small pop-up asks the visitor to choose. They can't scroll on until they press **OK**. Then scrolling is free again: strike a card, or keep scrolling for the default.

## Decisions made (owner, 2026-11-21)

| # | Decision | Why / who |
|---|---|---|
| 1 | **No choice strikes seat 6 (Loyal Servant)**, so ending B (Good wins) is the default. Replaces 010 decision 14 and story line decision 8 | Owner. Seat 6 stands right beside Merlin in the arc, so the near miss is plain |
| 2 | **"The Assassin chooses." stays.** The scrubbed strike is the same, only the target changes | Assistant, from 010 |
| 3 | **The pop-up stops the scroll** at the start of the choice window (the same place "See the other ending" lands, 0.08 screen into the window). A fast flick that passes it is brought back to it | Owner: "don't let them skip" |
| 4 | **After OK the scroll is free.** Striking a card or scrolling on (the default) both work | Owner |
| 5 | **Once per page visit.** Scrolling back up, "See the other ending" and a second pass don't show it again. A visitor who already struck a card before the stop point doesn't see it | Owner |
| 6 | **Wording**: polished from the owner's lines and translated. The owner checks English and Malay | Owner |
| 7 | **Reduced motion and scripts off also default to Good wins**, so all three versions tell the same story. The reduced motion version has no pop-up (its six buttons are already in plain view, with the `orScroll` line under them) | Assistant, so the versions agree |

## The pop-up

- A native modal `<dialog>` (`.bl-pop`), in the middle of the screen over the pinned stage. Dark card with the gold card edge, the first line large in the display font, the second line small and soft, and one gold pill **OK** button centred under them.
- When it opens, the page is held still: Lenis stops and the page can't overflow (the existing `lockScroll`, as the card dialog uses). Each frame while it is open, the scroll is put back on the stop point if anything moved it (a flick's glide that was still running, or the phone's JavaScript touch scroll from 013 CP-13).
- The dialog takes focus on OK. Esc also closes it (same as OK). The cards behind can't be pressed while it is open.
- It fades in over about 0.25 s and out over about 0.2 s (opacity and a small rise, transform only).
- `aria-labelledby` on the first line, `aria-describedby` on the second.

## Amendment: three pop-ups (planned)

The owner wants the visitor told, in order, what just happened to them before they are asked to choose. At the same stop point as above, three pop-ups show **one after another**, each needing its own OK. Everything about the stop (decisions 3 to 5) is unchanged: the scroll is held from the first pop-up until the last OK, and the whole sequence shows once per visit.

| Step | Big line | Small line(s) | Button |
|---|---|---|---|
| 1 | You lose the game. | none | OK |
| 2 | You are the Assassin now. | none | OK |
| 3 | Select the card you think is Merlin. | 1. (If you don't choose, Good wins by default.) 2. Choose correctly and you win the game and make a comeback. | OK |

### Decisions (owner's request, 2026-11-21; the how is the assistant's recommendation)

| # | Decision | Why / who |
|---|---|---|
| 8 | **Three steps in the same stop point**, in the order above. The page is held for the whole sequence, and a flick past the stop is brought back, as today | Owner ("before" the choice pop-up) |
| 9 | **One dialog, content swapped between steps** (not three dialogs). Between steps the text cross-fades (opacity, about 0.2 s out, 0.25 s in) while the card stays in place, so the scroll lock and the hold never let go between them | Assistant. One lock to take and release, no flash of an unlocked page between pop-ups |
| 10 | **Step 3 has two small lines**, the old note first, the "comeback" line under it. Steps 1 and 2 have no small line (the dialog shrinks to fit) | Owner |
| 11 | **Esc or the backdrop do not skip ahead.** Esc counts as OK for the current step only, so a visitor can't Esc straight through all three in one key press (each Esc moves one step) | Assistant |
| 12 | **The owner's own wording in `ms.json` and `zh.json` stays** (`popTitle` and `popNote` were edited by the owner: "Pembunuh sila pilah Merlin untuk bunuh." / "(Jika tidak, pasukan Baik akan terus menang.)" and the Chinese "系统会让正义一方获胜"). The build only adds keys, it does not touch those two | Owner's edit on disk |

### The story logic, so the words fit

By this point the loyal side has won three quests, so "You lose the game" is told **to the evil side's seat** the visitor is about to play: the quests are lost, one chance remains. Step 2 hands the visitor the Assassin's role, and step 3 is the one guess. If this reads wrong with the scene (the page has just shown the loyal side winning), the line can be softened later, for example "Evil lost three quests." The owner's wording is used as given for now.

### Behaviour

- **State**: `popStep` 0 to 3 in `blade.js`. `openPop()` starts at step 1. OK or Esc calls `nextPop()`, which fades to the next step, or on step 3 closes the dialog as today (`closePop()`, `lockScroll(false)`).
- **Markup** (`home.mjs`): the dialog gets a title `<p>` and two note `<p>` (`.bl-pop-n`, `.bl-pop-n2`). `blade.js` fills them from the words for the current step and hides empty ones. They live in `blade.pop*` keys read from the page data, so the three languages come from the same place as everything else.
- **Reading aloud**: `aria-labelledby` and `aria-describedby` stay on the title and the note(s). The dialog's title changes with the step, so a screen reader hears each step as it appears (`aria-live="polite"` on the dialog body).
- **Reduced motion** (`prefers-reduced-motion`): the cross-fade becomes an instant swap. `?motion=off` and scripts off have no pop-ups, as before.
- **Debug**: `window.__bl.pop` also reports `step`.

### New and changed words

| Key | English | Malay (assistant's draft, the owner checks) | Chinese (assistant's draft) |
|---|---|---|---|
| `blade.popLose` (new) | You lose the game. | Anda kalah permainan ini. | 你输掉了这局游戏。 |
| `blade.popAssassin` (new) | You are the Assassin now. | Anda ialah Pembunuh sekarang. | 你现在是刺客了。 |
| `blade.popTitle` (kept, step 3) | Select the card you think is Merlin. | owner's wording kept | owner's wording kept |
| `blade.popNote` (kept, step 3 line 1) | (If you don't choose, Good wins by default.) | owner's wording kept | owner's wording kept |
| `blade.popNote2` (new, step 3 line 2) | Choose correctly and you win the game and make a comeback. | Jika pilihan anda betul, anda menang dan bangkit semula. | 选对了，你就能赢下这局，完成逆转。 |
| `blade.popOk` (kept) | OK | OK | 好 |

### What "done" looks like (adds to D-1 to D-8)

| ID | Check |
|---|---|
| D-9 | At the stop point the first pop-up reads "You lose the game." with only OK. OK shows "You are the Assassin now." with only OK. OK shows the choice pop-up with both small lines. Each step needs its own OK |
| D-10 | The page can't be scrolled by wheel, keys or touch during all three steps, and nothing moves between steps. After the third OK, scrolling is free and the cards can be struck |
| D-11 | The sequence shows once per visit. Scrolling back up or "See the other ending" does not start it again |
| D-12 | Esc moves one step, not all three. A visitor who already struck a card before the stop sees none of them |
| D-13 | English, Malay and Chinese fit with no overlap at 1280x720, 390x844 and 360x640, including step 3 with two small lines |
| D-14 | No console errors, `npm run build` and `npm test` pass |

### Build plan (after the owner approves)

1. The three new keys in the three language files, without touching the owner's two edited ones.
2. `home.mjs`: the second note element; `main.css`: its style and the shrink for steps with no small line.
3. `blade.js`: `popStep`, `nextPop()`, the cross-fade, the text fill per step.
4. Check D-9 to D-14 in headless Chrome as before (desktop wheel, phone touch, three languages), then write the "As built" lines here.

## Words

New keys under `blade`. Chinese is the assistant's wording; English and Malay go to the owner to check.

| Key | English | Malay | Chinese |
|---|---|---|---|
| `blade.popTitle` | Select the card you think is Merlin. | Pilih kad yang anda rasa ialah Merlin. | 选出你认为是梅林的那张牌。 |
| `blade.popNote` | (If you don't choose, Good wins by default.) | (Jika anda tidak memilih, pihak setia menang secara lalai.) | （如果你不选，默认正义一方获胜。） |
| `blade.popOk` | OK | OK | 好 |
| `blade.plainB` | The Assassin named seat {n}, {name}. Good wins. | Pembunuh menyebut kerusi {n}, {name}. Pihak setia menang. | 刺客点出了 {n} 号座位，{name}。正义一方获胜。 |

`{n}` and `{name}` are filled from `blade.json` `auto` and the deck (seat 6, Loyal Servant / Hamba Setia / 亚瑟的忠臣). Shown with scripts off, before `blade.saved`. The seat chapter's plain question changes to `seat.found` ("Could you have found Merlin?") to match ending B.

Changed: `blade.orScroll` stays as written ("Or keep scrolling, and the Assassin chooses.").

## Data

`src/data/blade.json`: `"auto": 6`. The build check changes from "auto must be Merlin" to "auto must be a loyal seat in the arc and not Merlin".

## What "done" looks like

| ID | Check |
|---|---|
| D-1 | Scrolling through the choice without striking: "The Assassin chooses.", the strike lands on seat 6, ending B plays, the win screen says "Good wins", chapter 8 asks the "found" question. `blade.result()` is `{ ending: 'b', chose: false }` |
| D-2 | Striking Merlin still plays ending A. Striking any other card still plays ending B with `chose: true` |
| D-3 | The first time the scroll reaches the choice, the pop-up shows and the page can't be scrolled (wheel, touch, keys) until OK. A fast flick past the choice is brought back to it |
| D-4 | After OK the page scrolls freely, and the cards can be aimed and struck |
| D-5 | The pop-up does not show again on the same visit: scrolling up and down, or "See the other ending" |
| D-6 | `?motion=off` and scripts off show ending B by default (the plain B line), and choosing Merlin still shows ending A |
| D-7 | English, Chinese and Malay fit in the pop-up with no overlap at 1280x720, 390x844 and 360x640 |
| D-8 | No console errors. The build passes its checks |

## Build plan

1. `blade.json` `auto: 6`, the build check, the words in three languages.
2. `blade.js`: the scrubbed default strike uses `data.auto`, the reduced motion default is ending B.
3. `home.mjs`: the scripts off text is ending B; the pop-up dialog markup. `main.css`: the pop-up.
4. `motion.js`: `jumpTo(y)` puts the page at a position at once.
5. `blade.js`: the stop point, the pop-up open and close, the hold each frame, once per visit.
6. Check D-1 to D-8 in the browser, then write "As built" here and tick the scope.

## As built of the amendment (2026-11-21)

- **Files**: `blade.js` (`popStep`, `setStep`, `nextPop`, with the OK button and Esc both calling `nextPop`; `__bl.pop.step`), `home.mjs` (a second note `.bl-pop-n2`, `aria-live` on the title), `main.css` (`.bl-pop-n[hidden]`), the three i18n files (`popLose`, `popAssassin`, `popNote2`). The owner's edited `popTitle` and `popNote` in `ms.json` and `zh.json` were left as they are.
- **How**: one dialog. `openPop()` sets step 1; each OK fades the text out (0.2 s), swaps it, fades it in (0.25 s); the third OK closes as before. The scroll hold runs for the whole sequence. Reduced motion swaps instantly.
- **Checked** (headless Chrome on the built site): desktop wheel and phone touch, English, Malay and Chinese. Step 1 "lose", step 2 "Assassin", step 3 with both small lines. The page stayed held after the first and second OK and a scroll attempt. After the third OK the page scrolled to the ending (seat 6, Good wins), and a second pass showed no pop-up. No console errors.
- **Not checked**: 360x640, the tablet, a real phone, Esc by hand, and the owner's read of the Malay for the three new lines.

## As built (2026-11-21)

- **Files**: `blade.json` (`auto: 6`), `scripts/build.mjs` (the `auto` check), `blade.js` (`AUTO`, `GATE = WIN0 + 0.08`, `openPop`/`closePop`, the hold in `frame()`, the reduced motion default `'b'`), `motion.js` (`jumpTo`), `home.mjs` (`.bl-pop` dialog inside the blade section, the plain B line, the seat question), `main.css` (`.bl-pop*`), the three i18n files (`plainB`, `popTitle`, `popNote`, `popOk`).
- **How the stop works**: `frame()` remembers last frame's `K.t`. The first time it crosses `GATE` going down, with no choice made yet, the page jumps back to `winY()` (the same point as "See the other ending"), `lockScroll(true)`, and the dialog opens with `showModal()`. While open, the scroll is put back on that point each frame, and the no-choice strike can't be made. OK or Esc fades it out, then `lockScroll(false)`.
- **Difference from the plan**: `lockScroll` was first made to also pause the phone's touch scroll (`ScrollTrigger.normalizeScroll().disable()`). It was taken out again. The hold each frame keeps the page still without it, and the first test that seemed to show it breaking touch scrolling after OK turned out to be the test's synthetic gesture, not the site.
- **The dialog is inside the staged `.blade`**, which has `pointer-events: none`, so `.bl-pop` sets `pointer-events: auto`.
- **Checked** (headless Chrome, the built site, `?debug`): desktop 1280x720 with the wheel, and phone 390x844 with touch drags in English, Malay and Chinese. The pop-up opens once at the choice. Wheel, PageDown and touch drags don't move the page while it is open. OK frees the scroll. With no choice the strike lands on seat 6 (`choice.seat` 5, `by: 'scroll'`), ending B and "Good wins" play, and chapter 8 asks "Could you have found Merlin?". Scrolling back up and down again shows no second pop-up. A mouse strike on Merlin after OK plays ending A. Scripts off shows the B line in all three languages. No console errors. `npm test` passes (33).
- **Open**: the owner's check of the English and Malay wording; a real phone (the hold against a fast flick's glide); 360x640 and the tablet; `?motion=off` by hand.
