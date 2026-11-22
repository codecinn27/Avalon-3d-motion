# Avalon landing page: scope and progress

**Spec**: [0001](../specs/0001-avalon-landing-page.md) (status Proposed, design approved 2026-11-15)
**Goal**: one landing page that gets visitors to tap WhatsApp and ask about online Avalon game nights.
**Working rule from the owner** (updated 2026-11-15): build slowly and carefully. Explain the plan first and wait for the owner's go. Stop at 1.5 hours of building or 99% of usage, whichever comes first, then the owner validates. Continue from the first unticked box below.

## At a glance

| Phase | Status |
|---|---|
| A. Spec | done |
| A. Design prototype and art | done, approved by the owner |
| B. Frontend build | first full pass built (B1 to B6 and B8 checked in the browser). Waiting for the owner to validate. B7, B9, B10 need a visible window and a real phone |

## Phase A: design (done)

- [x] Spec written and accepted
- [x] Repo started (`git init`), `.gitignore`, `.env.example`
- [x] Art script `scripts/generate-art.mjs` and prompts `scripts/art-prompts.json`
- [x] Art style chosen: painted dark fantasy
- [x] Full painted set in `src/assets/cards/painted/`: merlin, percival, loyal-servant, assassin, morgana, mordred, oberon, card-back
- [x] Loyal Servant, Assassin, Mordred redone from the owner's reference pictures
- [x] Static design prototype `design/index.html` (the approved look: colours, type, copy, layout of every section)
- [x] Owner approved the design

## Phase B: frontend build

Each box maps to a step in the spec's `## Build plan`. Tick a box only after it is checked in the browser.

- [x] **B1 Scaffold** (spec step 6): `scripts/build.mjs`, templates, i18n routing (`/`, `/zh/`, `/ms/`), `src/config.json`, base layout, nav with language switch, hero text, working WhatsApp buttons in all three languages. Covers AC-2, AC-3, AC-17
- [x] **B2 Content layer** (spec step 7): `src/data/roles.json`, `src/i18n/en.json`, `zh.json`, `ms.json`, a build check that the three files have the same keys and no empty values. Covers AC-3, AC-4
- [x] **B3 Static sections** (spec step 9): hero, how it works, characters, draw, final call, footer, ported from `design/index.html`. Checked at 360, 375 and 1280 px wide, with scripts off, and with no sideways scroll. Covers AC-1, AC-4, AC-15, AC-17
- [x] **B4 Role pages and SEO** (spec step 10): 21 role share pages, eight 1200x630 share images (seven roles plus home), titles, descriptions, `hreflang`, canonical, sitemap, `robots.txt`, three 404 pages. Covers AC-12, AC-16. Not yet done: a real link preview check, which needs the live domain
- [x] **B5 Draw and share** (spec step 11): draw state machine, fair random pick with no repeat, result panel, WhatsApp, Facebook, Threads, X, copy link. Checked: 8 draws with no repeat, taps during the shuffle ignored, links and messages correct in English, Chinese and Malay. Covers AC-9, AC-10, AC-11. Not yet done: opening each network's real share screen, and the copy button's "Copied" path (the preview window had no focus)
- [x] **B6 Motion base** (spec step 12): Lenis, ScrollTrigger, text reveals, reduced motion path (no Lenis, no pins, no triggers, draw still works). Covers AC-8, AC-13
- [ ] **B7 3D cards** (spec step 13): hero arc, pointer tilt, pinned how it works, pinned character flips, draw animation. Built, and the arc, both pins, the flips, and the draw were seen working at desktop and phone sizes. Left to check with a real mouse and a visible window: the pointer tilt on the hero cards, the button magnet, and how the scroll speed feels. Covers AC-6, AC-8
- [x] **B8 Shader and theme turn** (spec step 14): WebGL backdrop with gradient fallback, light to dark turn at the Assassin flip, back to cream when scrolling up. Covers AC-5, AC-7
- [ ] **B9 Performance and device pass** (spec step 15). Done so far: scripts are 67 KB compressed (limit 130), card images are 840 KB for all 16 files, tap targets are all 44 px or more at 360 px wide, text contrast worked out by hand at 5:1 or better on both palettes. Left: frame rate and load time (LCP) on a real mid range phone, iOS Safari pin behaviour. Covers AC-14, AC-15
- [ ] **B10 Verify** against every acceptance criterion in the spec, in a visible browser and on a phone

## Notes for whoever continues

- The look is already decided. Port CSS and copy from `design/index.html`; do not redesign.
- WhatsApp number: `60176016227`. Brand wordmark: "Avalon" (no shop name yet). Copy names no price, schedule, or player count.
- The art script reads `OPENAI_API_KEY` from `.env`. A stale system variable with the same name exists on this machine; the script already makes `.env` win.
- Tarot samples in `src/assets/cards/tarot/` are a record only. Do not use them.
- PNG art is 3 to 4 MB each. Use Astro's image pipeline so the site ships small AVIF or WebP files.
- Preview: `.claude/launch.json` has `design-prototype` on port 4173. Add an Astro dev entry on port 4321.
- Installed skills to follow during motion work: `.agents/skills/gsap-*`, `.agents/skills/cinematic-gsap-lenis-motion-system`, `.agents/skills/high-end-visual-design`.
- Nothing is committed to git yet.

## Stack change (2026-11-15, owner's decision)

**No Astro, no Tailwind.** Plain HTML, CSS, and JS for faster performance. Three.js only if needed (not expected). See the note at the top of the spec. This replaces every mention of Astro or Tailwind in the boxes and notes above:

- B1 becomes: `scripts/build.mjs` (plain Node, no framework) that fills HTML templates from `src/i18n/*.json` and `src/data/roles.json` and writes static pages to `dist/`. Source layout: `src/templates/` (page and role templates), `src/styles/main.css`, `src/js/` (one small module per feature), `src/assets/`.
- Port CSS straight from `design/index.html` into `src/styles/main.css`. No utility classes.
- GSAP and Lenis stay installed and are copied from `node_modules` into `dist/vendor/`. Astro, Tailwind, the sitemap plugin, and the Fontsource packages are uninstalled.
- Still to install: `sharp` as a dev dependency for image conversion and share images.
- Preview: serve `dist/` with the existing `http-server` entry style in `.claude/launch.json`.

## Story flow rework (owner's request, 2026-11-15)

The owner wants one scroll story from start to end, with `D:\Projects\P16-avalon\v1\avalon-site` as the model for the flow (pinned scenes, one after another). It is being done in parts, each planned and approved before building.

- [x] **Part 1 Hero ring**: ten face down cards turn on an oval around the title "Avalon", stop on hover or tap, turn with scroll, then part and fade. Checked at 1280 and 375 px, with reduced motion, and scrolling out and back. Not yet seen by hand with a real mouse
- [x] **Part 1b Turn a card over**: clicking or tapping a ring card flies it to the middle of the screen while it flips, and a dialog shows that character's art, name, side and line. Click anywhere, the Close button, or Escape plays it backwards and puts the card back. The ring waits while a card is out. The ten cards and their paintings are listed in `src/data/deck.json`; the script is `src/js/reveal.js`. Modelled on the anime.js modal dialog demo, built with GSAP (already loaded) instead of adding anime.js. Checked at 1280 px by picture and at 375 px by layout numbers; with reduced motion it opens with a plain fade
- [x] **Loyal Servant art**: three more paintings generated 2026-11-15 (`loyal-servant-2` older male knight, `loyal-servant-3` woman knight, `loyal-servant-4` woman archer). Prompts are in `scripts/art-prompts.json`
- [x] **Card art refresh** (approved and switched live 2026-11-15, old paintings in `painted-v1-backup/`) (owner's request, 2026-11-15): six characters repainted to follow the traits of the owner's reference pictures (Morgana, three Loyal Servants, Percival, Oberon). Decision: new original paintings from written trait descriptions, not copies of the game's cards, because the publisher's art is copyrighted. New files are in `src/assets/cards/painted-v2/`; the live site still uses `painted/` until the owner approves on `design/index.html` (sections 08 to 10). To switch: copy the six files from `painted-v2/` over `painted/` and run `npm run build`. Reference pictures are in `refeerences/` (never read by the build)
- [x] **Team badges**: blue badge (good) and red badge (evil), top right of every face up card, added by CSS (`.card.good`, `.card.evil`) and onto the share images. Version 2 (2026-11-15): detailed badges generated with gpt-image-2.6-flare, a pegasus with a spear (blue) and a two headed bird with wings and legs spread (red). See docs/images/002-badge.md. Approved by the owner 2026-11-15. Face down cards have no badge
- [x] **Part 2 The Gathering** (built 2026-11-15, owner has not yet judged the feel): the ring breaks, the ten cards turn face up, pull into the middle and pack into a tight drum. Replaces the placeholder hero exit. Plan: [docs/section/002-gathering.md](../section/002-gathering.md)
- [x] **Part 3 The Unfolding** (built 2026-11-15, owner has not yet judged the feel): the drum opens, the cards fly out and stack side by side in a tilted 5 by 2 wall, and the story text appears below it. The story text replaces the "How it works" section. Plan: [docs/section/003-unfolding.md](../section/003-unfolding.md)
- [x] **Part 4 The Deal** (built 2026-11-15, owner has not yet judged the feel): after the story, the camera pulls back and tilts down, the twenty extra cards slide off, and the ten real cards are dealt one by one, face down, onto ten seats of a round CSS table, with "Ten seats. Six are loyal. Four are lying." above it. Story line chapter 1 step 3. The pin is 30% longer. Record: [docs/section/004-the-deal.md](../section/004-the-deal.md)
- Decided for parts 2 and 3 (owner, 2026-11-15): ten cards only, paintings showing from part 2 on, CSS 3D with GSAP (no WebGL), flow modelled on premotio.com
- Story line v3 (approved by the owner 2026-11-15): [story_line.md](story_line.md). One full game from the deal to the Assassin's last strike, six loyal and four evil, four optional interactions where nobody gets stuck. Chapters 0 to 2 are built (parts 1 to 4 above, and chapter 2 below, approved 2026-11-16). The checklist below is everything left. Tick a box only when it is done, and write the date after it.
- How to read the boxes: **plan** = a record written in `docs/section/` and approved before building (as for parts 2 to 4). **built** = code in the site. **checked** = looked at by stepping the scroll at desktop (1280x720), phone (390x844) and small phone (360x640) sizes, in English, Chinese and Malay, with `?motion=off`, and scrolling back up. **owner's look** = the owner has scrolled it with a real mouse and phone and judged the feel. Every new line of text needs Chinese and Malay in the same build (the build fails if the three language files differ).

**Chapter 2 Night Falls** (about 4 screens on a desktop, 3.4 on a phone, [story_line.md](story_line.md#chapter-2-night-falls)). The page turns to night. Eyes open one role at a time: the three traitors find each other (Oberon stays alone in the dark), Merlin sees three of them (not Mordred), Percival sees two Merlins. Dawn. *"Now everyone knows something different."* Plan: [docs/section/005-the-night-falls.md](../section/005-the-night-falls.md).
- **Owner's decisions 2026-11-15**: camera **A, orbit and dolly** (the table swings so the waking seat comes to the front, about 3x close ups, 48 degree lean in close ups, back to 28 at rest). 3D shapes: **crystals, moon and stars, focus rings** (no narrator's lantern); **no focus rings while evil wakes** (they show for Merlin and Percival). Length about 4.4 screens on a desktop.
- **Owner's decisions 2026-11-16**: the night is **watch only** (the tap a seat explorer, Seen by lens, drag and pointer light were removed). Words and the light and dark turns follow the scroll, each turn taking half a screen. Close ups show the card about 40% of the screen tall at 2:3.
- Prototype: [design/night-prototype/](../../design/night-prototype/)
- [x] plan written (2026-11-15)
- [x] plan approved (2026-11-16)
- [x] built (2026-11-16, two passes)
- [x] checked (2026-11-16, 1280x720 and 390x844)
- [x] owner's look (approved 2026-11-16). Still open: frame rate on a real mid range phone (AC-14)
- [x] assets: closed and open eye, red threads, gold shine, crystals, moon and stars, focus rings (all CSS, no new paintings)

**Chapter 3 The Vote** (about 2.5 screens, [story_line.md](story_line.md#chapter-3-the-vote)). A crown, the leader picks three, ten vote cards turn at once (four Approve, six Reject), the first team is rejected, the second is approved with the Assassin on it. The score track and the reject track appear. Watch only. **DONE 2026-11-16.** [docs/section/006-the-vote.md](../section/006-the-vote.md).
- **Owner's decisions 2026-11-16**: the zoom is a **dive to the leader's seat** (seat 1) then a pull back; the score and reject tracks are a **fixed bar at the top**; the ten votes are **cards laid at each seat and flipped together**; the crown is **CSS 3D gold**.
- [x] plan written (2026-11-16)
- [x] plan approved (2026-11-16)
- [x] built (2026-11-16, with chapter 4 in one pass)
- [x] checked (2026-11-16, 1280x720, 390x844 and 360x640 in three languages)
- [x] owner's look (done 2026-11-16)
- [x] assets: Approve and Reject vote cards (made 2026-11-15, [003-props](../images/003-props.md), owner's final look pending)
- [ ] assets: crown (picture or SVG), vote card back (reuse the role card back first), score track, reject track

**Chapter 4 The Quest** (about 3.6 screens on a desktop, 3.1 on a phone, [story_line.md](story_line.md#chapter-4-the-quest)). The rule close up, then quest 1 passes (the Assassin plays Success to look loyal). Quest 2: over the Assassin's shoulder he picks Fail, the camera looks straight down, the visitor taps four cards, the last one turned is always the Fail. The Assassin points first at the innocent seat 3 Servant and the table follows. **DONE 2026-11-16.** [docs/section/007-the-quest.md](../section/007-the-quest.md).
- **Owner's decisions 2026-11-16**: **quest 1 passes, quest 2 fails** (story line decision 18); **tap to flip** (scroll turns any left); **last card turned is the Fail**; camera **over the shoulder** then **top down**; rule close up before quest 1; cups and ball shuffle; heavy Fail with the badge flying into the score bar; tap window 0.6 screen; scrolling back rewinds. Plan and build together with chapter 3.
- Prototypes: Quest Card Reveals (https://claude.ai/artifact/C6jHZAmwmEC4YX6LSFtpie), Quest Camera Angles (https://claude.ai/artifact/GXeJmbNRnWL5ioPXtZQQFm), both private
- [x] plan written (2026-11-16)
- [x] plan approved (2026-11-16)
- [x] built (2026-11-16, with chapter 3 in one pass), with the optional **turn the cards over** interaction (or scroll turns them)
- [x] checked (2026-11-16, 1280x720, 390x844 and 360x640 in three languages; reduced motion and scripts-off checks)
- [x] owner's look (done 2026-11-16)
- [x] assets: Success and Fail quest cards (made 2026-11-15, [003-props](../images/003-props.md), owner's final look pending)
- [ ] assets: quest card back (role card back for now), accusation lines (CSS strips like the night's threads)

**Chapter 5 Lady of the Lake** (task `chp5-the-lady-of-the-lake`, about 2.6 screens on a desktop, 2.3 on a phone, [story_line.md](story_line.md#chapter-5-lady-of-the-lake)). The Lady's painting rises full size, then flies to Mordred's seat. He looks at seat 3, the Servant the table blames. The table's middle turns to water and **the visitor touches it** (hover ripples on desktop, a tap reveals). Seat 3's reflection shows a blue badge, Mordred says "Evil", the table turns on seat 3 again, and even Merlin can't see this lie. She passes to seat 3. Plan: [docs/section/008-lady-of-the-lake.md](../section/008-lady-of-the-lake.md). Spec pointer for `/develop`: that plan.
- **Owner's decisions 2026-11-16**: **its own build, after chapters 3 and 4** (not in their pass); target **seat 3**; after "Evil" the **table turns again plus the Merlin line**; story licence on where the Lady starts; **the painting first**; **tap with hover ripples**; **real ripples** (WebGL canvas, CSS rings when motion is reduced); the water shows **seat 3's reflection with only a blue badge**; one short buzz on Android.
- Build command: `/develop chp5-the-lady-of-the-lake`. It needs chapters 3 and 4 built first (see the plan's "Before you build").
- Prototype: Lady of the Lake Options (https://claude.ai/artifact/9f74hf8bdGZVvDx6TEnhCF), private
- [x] plan written (2026-11-16)
- [x] plan approved (2026-11-16)
- [x] built (2026-11-16, built together with chapter 6), with the **touch the water** interaction (or scroll does it)
- [x] checked (2026-11-16, headless Edge at 1280x720, 390x844, 360x640 and 1024x1366; English and Chinese; mouse tap, touch tap, scroll reveal, rewind, `?webgl=off`, `?motion=off`, scripts-off markup)
- [ ] owner's look (a real mouse and phone, a real iPhone for the pointer position on the tilted water, 008 open point 1)
- [x] assets: Lady of the Lake card, back view (made 2026-11-15, `lady_of_the_lake.png`, owner's final look pending)
- [x] assets: the Lady painting at 320, 640, 960 wide WebP (build), the water (`src/js/water.js`, WebGL with 2D and CSS fallbacks)

**Chapter 6 The Climb** (task `chp6-the-climb`, about 2.4 screens on a desktop, 2.1 on a phone, [story_line.md](story_line.md#chapter-6-the-climb)). Fast cuts through quests 3, 4 (two Fails needed at ten players) and 5. Seat 3 uses the Lady to expose the Assassin, Percival trusts the wrong Merlin on quest 4, then names the quest 5 team like he sees everything. Two all, one quest left, then a celebration and "Good has won", held long enough to feel like the end. Watch only. Plan: [docs/section/009-the-climb.md](../section/009-the-climb.md).
- **Owner's decisions 2026-11-16**: planned **together with chapters 7 and 8**, one file each; Lady after quest 3: **seat 3 looks at the Assassin, red, told true**, in a **quick water flash**; after quest 4: **one line, no reveal**; the bluff is **rule true** (Percival leads quest 4 and trusts Morgana, seat 6 leads quest 5 and Percival names the team); teams **arrive by the crown**; quest 4 **watched, heavy double Fail**; false ending **C, Celebration**.
- Build command: `/develop chp6-the-climb`. It needs chapters 3, 4 and 5 built first (see the plan's "Before you build").
- Prototype: The Blade Options (https://claude.ai/artifact/6Vfoq87LKyrryHoieP1FuD), private
- [x] plan written (2026-11-16)
- [x] plan approved (2026-11-16)
- [x] built (2026-11-16, built together with chapter 5)
- [x] checked (2026-11-16, headless Edge at 1280x720, 390x844, 360x640 and 1024x1366; English and Chinese; rewind into chapter 5, `?motion=off`, scripts-off markup)
- [ ] owner's look (a real mouse and phone, frame rate during the celebration on a mid range phone)
- [x] assets: none new

**Chapter 7 The Blade** (**BUILT 2026-11-17, owner's look pending**, task `chp7-the-blade`, about 4.0 screens on a desktop, 3.5 on a phone, [story_line.md](story_line.md#chapter-7-the-blade)). The lights snap off. The four evil cards turn face up, the six loyal cards stand in an arc in front of the table, and the Assassin's gilded dagger drifts between Merlin and Percival. **The visitor points the blade** at one of six loyal cards: Merlin plays ending A (evil wins), anyone else plays ending B (the blade misses), no choice plays ending A. Scrolling back up, or "See the other ending", lets them choose again. Plan: [docs/section/010-the-blade.md](../section/010-the-blade.md).
- **Owner's decisions 2026-11-16**: dagger **Gilded** (SVG); **aim, then strike**; **ghost faces** on the face down cards; camera **facing the arc**, strike **in place with a small push in**; the arc **rises in front of the table** (3, 6, Merlin, Percival, 8, 10); ending A **cracks**; ending B **ash**; the **hard cut** to dark is a named exception to the half screen rule; **one quiet "See the other ending" link**; **heartbeat and strike buzz** on Android.
- Build command: `/develop chp7-the-blade`. It needs chapter 6 built first.
- Prototype: The Blade Options (https://claude.ai/artifact/6Vfoq87LKyrryHoieP1FuD), private
- [x] plan written (2026-11-16)
- [x] plan approved (2026-11-16)
- [x] built: the shared opening and the choice (2026-11-17, `src/js/blade.js`)
- [x] built: ending A, the blade finds Merlin (cracks, blue circles crack and turn red, crimson) (2026-11-17)
- [x] built: ending B, the blade misses (the dagger turns to ash, Merlin turns over in gold light, circles turn gold, dawn) (2026-11-17)
- [x] built: the light to dark turn moved here (`src/js/theme.js`: `setDark` is now driven by `blade.js`, plus `setBlood`, `setDawn` and two tint layers in the backdrop) (2026-11-17)
- [x] checked (2026-11-17, headless Edge at 1280x720, 390x844 and 360x640 in English, Chinese and Malay: aim by mouse, tap strike on Merlin and on another card, no choice, both endings, `?motion=off` with six plain buttons and the swapped ending). Still open: 1024x1366 tablet, scripts off, touch (two tap) aim on a real phone, keyboard strike, rewind of a made choice
- [ ] owner's look (a real mouse and phone, the feel of the dagger drift, frame rate on a mid range phone, the Android buzz)
- [x] assets: the gilded dagger (inline SVG), the crack overlay (SVG, 27 segments), the ash (40 CSS flakes) (2026-11-17, no new pictures)

**Chapter 8 Your Seat** (**BUILT 2026-11-17, owner's look pending**, task `chp8-your-seat`, about 2.0 screens of pin on a desktop, 1.76 on a phone, [story_line.md](story_line.md#chapter-8-your-seat)). The closing question ("Could you have hidden Merlin?" or "Could you have found Merlin?"), the camera pulls back to an empty table with one lit seat, *"Now imagine the liar is your best friend."*, then **the draw on the table** from the lit seat, and the pin releases into a new final call. Plan: [docs/section/011-your-seat.md](../section/011-your-seat.md).
- **Owner's decisions 2026-11-16**: the draw **on the table, from the lit seat**; light **from above**; the card **rises** with the result beside it (under it on a phone); the ending goes in **"Invite my group" only**, and **no verdict line** when the visitor didn't choose; "Save me a seat" opens WhatsApp with **"Hi! Save me a seat at the next online Avalon night."**
- Build command: `/develop chp8-your-seat`. It needs chapter 7 built first.
- Prototype: The Blade Options (https://claude.ai/artifact/6Vfoq87LKyrryHoieP1FuD), private
- [x] plan written (2026-11-16)
- [x] plan approved (2026-11-16)
- [x] built: the closing question and the empty table (2026-11-17, `src/js/seat.js`: chairs, the cone of light, the draw on the table with `draw.js` in its staged mode)
- [x] built: new final call copy ("Your seat is waiting." / "Online Avalon nights. Come alone or bring your group. We fill the table."), main button **Save me a seat** (WhatsApp to the owner with "Hi! Save me a seat at the next online Avalon night.") (2026-11-17)
- [x] built: second button **Invite my group** (WhatsApp's share screen, the ending goes in only when the visitor struck) (2026-11-17), then **removed the same day** at the owner's request (story decision 37). The final call has one button
- [x] built: the seven card "Meet the characters" section removed, with its pin, CSS and `chars.*` words (2026-11-17)
- [x] checked (2026-11-17, headless Edge at 1280x720, 390x844 and 360x640 in English, Chinese and Malay: the lit card, the draw, draw again, the result beside or under the card, the final call, both buttons, the invite message after a plain choice in `?motion=off`). Still open: tablet, scripts off, a real tap on both WhatsApp buttons from a phone
- [ ] owner's look

**Around the chapters** (from the story line's build order and open points, not part of chapters 2 to 8)
- [ ] Chapter 0 prologue: the four lines over the breaking ring ("The knights of Avalon gather to save the kingdom." / "But some of them came to destroy it." / "Only Merlin knows who." / "Knowing the truth is not the same as surviving it."), about 1 more screen of pin
- [ ] Replace the old "Three rounds of doubt" copy under the card wall (it is wrong: the game has up to five quests), see [004 The Deal](../section/004-the-deal.md) open points
- [ ] Spec 0001: rewrite AC-1 (section order), AC-4 (characters section), AC-5 (when the page turns dark), (the "Invite my group" button was removed 2026-11-17, so no AC is needed for it)
- [ ] Native reader check of the new Chinese and Malay lines (about 60)
- [ ] Final review: the whole story from the first card to the WhatsApp message, on a phone, with reduced motion, in all three languages, and the frame rate on a mid range phone (AC-14)
- [ ] Owner's final look at the five game card pictures (section 11 of `design/index.html`)
- [ ] Trailer: 60 seconds, words on screen only, cut from the same chapters (table in [story_line.md](story_line.md#the-trailer)). A separate piece of work after the page is built
- The draw still deals one of seven roles (the characters section itself is gone, chapter 8)
- Script size: **fixed 2026-11-17 by the minify step** (see "How the build works"). Our scripts are now about 50 KB compressed in one file plus 55 KB of vendor libraries, about 105 KB against the 130 KB budget (AC-14)

## Decision records (added 2026-11-15)

Decisions and plans are kept per topic. Read these before changing the topic:

- [docs/section/001-banner.md](../section/001-banner.md): hero ring, turn-over dialog, story flow
- [docs/section/002-gathering.md](../section/002-gathering.md): part 2, cards pack into a drum
- [docs/section/003-unfolding.md](../section/003-unfolding.md): part 3, card wall and story text
- [docs/section/004-the-deal.md](../section/004-the-deal.md): part 4, the camera pull back and the deal onto the round table
- [docs/section/005-the-night-falls.md](../section/005-the-night-falls.md): chapter 2, the night (approved 2026-11-16)
- [docs/section/006-the-vote.md](../section/006-the-vote.md): chapter 3, the vote (**done** 2026-11-16)
- [docs/section/007-the-quest.md](../section/007-the-quest.md): chapter 4, the quest (**done** 2026-11-16)
- [docs/section/008-lady-of-the-lake.md](../section/008-lady-of-the-lake.md): chapter 5, Lady of the Lake (plan approved 2026-11-16, built 2026-11-16 with chapter 6, owner's look pending)
- [docs/section/009-the-climb.md](../section/009-the-climb.md): chapter 6, the climb (plan approved 2026-11-16, built 2026-11-16 with chapter 5, owner's look pending)
- [docs/section/010-the-blade.md](../section/010-the-blade.md): chapter 7, the blade and both endings (plan approved 2026-11-16, built 2026-11-17, owner's look pending)
- [docs/section/011-your-seat.md](../section/011-your-seat.md): chapter 8, the draw on the table and the final call (plan approved 2026-11-16, built 2026-11-17, owner's look pending)
- [docs/section/012-background-music.md](../section/012-background-music.md): the 60 second music loop, its autoplay rules and the top-right on/off button (built 2026-11-17, real phone check pending)
- [docs/section/013-performance_mobile.md](../section/013-performance_mobile.md): scroll lag on real phones, the suspected causes, the fixes to try, and how to measure on a phone over USB. Worked one checkpoint at a time (CP-1 measured 2026-11-18: 19.4 → 25.5 fps, not yet smooth)
- [docs/section/014-default_blade.md](../section/014-default_blade.md): change to chapter 7. No choice strikes seat 6 (Good wins by default), and a once-a-visit pop-up stops the scroll at the choice until OK (planned and built 2026-11-21, owner's check of the EN and BM wording and a real phone pending)
- [docs/section/016-scroll-progress.md](../section/016-scroll-progress.md): a thin scroll progress bar at the very top edge, plain fill, no chapter ticks, built only from transform so the phone stays smooth (plan written 2026-11-22, pen code received and its costly parts replaced, waiting for the owner's go to build)
- [docs/images/001-characters.md](../images/001-characters.md): card art, the ten card deck, the repaint decision
- [docs/images/002-badge.md](../images/002-badge.md): team badges, version 2 plan
- [docs/images/003-props.md](../images/003-props.md): vote, quest and Lady of the Lake cards
- [docs/scope/story_line.md](story_line.md): the scroll story and trailer, chapters 0 to 8

## How the build works (added 2026-11-15)

- Build: `npm run build` writes the whole site to `dist/`. It fails if the three language files differ in keys, if a value is empty, or if a role has no art.
- **Minified build (2026-11-17)**: `npm run build` bundles `src/js/main.js` and everything it imports into `dist/js/main.min.js` (with `main.min.js.map`) and minifies `src/styles/main.css` into `dist/css/main.min.css`, using the `esbuild` dev dependency. The pages link to those two files. `npm run build:dev` (`--dev`) writes the same files without minifying, for reading in devtools. Source files in `src/` are the only thing to edit. Publish the contents of `dist/` only (not `src/`, `node_modules/`, `scripts/` or `.env`)
- Preview: the `site` entry in `.claude/launch.json` serves `dist/` on port 4321. Rebuild after every source change; there is no watch mode.
- Templates are small JS modules in `src/templates/` (`layout`, `home`, `role`, `parts`), not `.html` files, so loops over the seven roles stay simple.
- Scripts in `src/js/`: `main` (entry), `lang`, `theme`, `shader`, `draw`, `motion` (Lenis, reveals, magnet), `cards` (the hero ring and the whole pinned story), and one file per chapter (`night`, `vote`, `quest`, `lady`, `climb`, `blade`, `seat`), plus `seats`, `reveal`, `say`, `water`.
- Site address: set `PUBLIC_SITE_URL` in `.env` (or `siteUrl` in `src/config.json`). Until then canonical links, link previews and the sitemap use the placeholder `https://avalon.example`. Share buttons already use the address the page is served from.
- Chinese text uses the device's own fonts (Songti, PingFang, Microsoft YaHei). No Chinese font file is shipped. Fraunces and Geist are self hosted from the Fontsource packages (dev dependencies, copied at build time).
- Two test switches in the address bar: `?motion=off` shows the reduced motion version, `?webgl=off` shows the gradient fallback. A headless browser has no graphics chip and shows the page blank without `?webgl=off`, so use it when taking pictures by script. To look at a scroll position, set `window.scrollTo(0, y)` and wait about 2.5 seconds for the scrubbed motion to settle: the hero pin starts at 0 and is 6.5 screens long on a desktop (5.7 on a phone).
- The draw copy has one extra line per role (`drawLine`, written in the second person) on top of the `line` used on cards and role pages.
- If the motion scripts have not started 3.5 seconds after load, the page shows all content plainly instead of waiting.

## Open items for the owner

- Site address (domain), needed for share links and the sitemap
- Confirm Simplified Chinese
- Pick a host and an analytics tool before launch
- Native reader check of the Chinese and Malay copy

## Progress log

- 2026-11-14: spec written, references gathered, skills installed
- 2026-11-15: design prototype built, art generated and revised, design approved, build started
- 2026-11-15: stopped at 89% of the 5 hour usage limit. B1 is partly done: `package.json` exists and dependencies are installed (astro 7.3, @astrojs/sitemap, tailwindcss 4.3 with @tailwindcss/vite, gsap 3.15, lenis 1.3, Fraunces and Geist variable fonts). **Resume here**: write `astro.config.mjs` (i18n with `en` default and no prefix, `zh`, `ms`; sitemap; Tailwind vite plugin), `tsconfig.json`, `src/config.ts`, `src/styles/global.css` (tokens from the prototype), `src/layouts/Base.astro`, and the first page. Astro 7 is newer than the version the spec was written against, so check its i18n and image config against the installed package docs before writing the config. A Chinese font package (Noto Serif SC and Noto Sans SC from Fontsource) is not installed yet
- 2026-11-15 (second session): explained the plan, owner said go. Removed the Astro and Tailwind leftovers, installed `sharp` and the two font packages, and built the whole site in plain HTML, CSS and JS: build script, three languages, 21 role pages, share images, draw and share, Lenis and ScrollTrigger motion, 3D cards, shader backdrop, theme turn. B1 to B6 and B8 ticked after browser checks. The preview window was hidden during this session, so live animation could only be checked by stepping it and taking still pictures. **Resume here**: with the browser pane visible, scroll the home page by hand and judge the feel (B7), then run B9 on a real phone, then B10. Nothing is committed to git yet
- 2026-11-15 (third session): hero rebuilt as a ten card ring around the title (story flow part 1). Spec AC-6 and the hero row of the composition table updated. **Resume here**: plan part 2 with the owner
- 2026-11-15 (fourth session): reference board, six repaint prompts (`scripts/art-prompts.json`, old prompts kept under `previous`), team badges, and before/after sections on the design page. **Resume here**: owner validates the six new paintings and the badges, then switch the art over
- 2026-11-15: `design/index.html` brought up to date with the build: ten card hero ring (section 01), flip dialog frame (01b), team badges on every face up card, `?style=painted-v2` previews the six repainted characters. Badges are read from `dist/`, so run `npm run build` before opening it
- 2026-11-15: owner approved the six repainted characters; switched onto the live site (old ones backed up). Share images for Morgana, Percival and Oberon were remade. **Resume here**: plan part 2 of the scroll story (handoff after the hero)
- 2026-11-15 (game cards and the deal): the five game card pictures were made (Approve, Reject, Success, Fail, Lady of the Lake, [003-props](../images/003-props.md)) and previewed with titles and badges on the design page, section 11. Then story line chapter 1 step 3 was built: part 4 The Deal ([004](../section/004-the-deal.md)). **Resume here**: owner judges the feel of parts 2 to 4 with a real mouse and phone and gives a final look at the five cards, then plan chapter 0 (the four prologue lines in the hero) or chapter 2 (Night Falls). Nothing is committed to git yet
- 2026-11-16: chapter 2 Night Falls built in two passes and approved by the owner ([005](../section/005-the-night-falls.md)). It is watch only. **Resume here**: plan chapter 3 The Vote (or chapter 0, the prologue). Chapter 3 starts from the table as the night leaves it: wide view, all cards face down, cream page
- 2026-11-16: chapter 5 Lady of the Lake planned with the owner and approved ([008](../section/008-lady-of-the-lake.md)), after a playable prototype (Lady of the Lake Options). It is built on its own, after chapters 3 and 4. Chapters 3 and 4 are done ([006](../section/006-the-vote.md), [007](../section/007-the-quest.md)). **Resume here**: run `/develop chp5-the-lady-of-the-lake`
- 2026-11-16: chapters 6, 7 and 8 planned together with the owner ([009](../section/009-the-climb.md), [010](../section/010-the-blade.md), [011](../section/011-your-seat.md)), after a playable prototype (The Blade Options, owner's picks 1C 2A 3A+A 4B 5A 6A 7A+A 8A). **Resume here**: build in order, each only after the one before: chapters 3 and 4, then `/develop chp5-the-lady-of-the-lake`, `/develop chp6-the-climb`, `/develop chp7-the-blade`, `/develop chp8-your-seat`
- 2026-11-16: chapters 3 The Vote and 4 The Quest built together and marked done ([006](../section/006-the-vote.md), [007](../section/007-the-quest.md)). Still open: the owner's hand check, phone frame rate, native read of zh and ms
- 2026-11-16: chapters 5 Lady of the Lake and 6 The Climb built together ([008](../section/008-lady-of-the-lake.md), [009](../section/009-the-climb.md)). Still open: the owner's look with a real mouse and phone, a real iPhone check of the pointer position on the tilted water, frame rate on a mid range phone (water and celebration), native read of the zh and ms words. **Resume here**: owner's look at chapters 5 and 6, then `/develop chp7-the-blade`
- 2026-11-17: **seat labels** added across the table chapters (owner request, [seats.js](../../src/js/seats.js)). Every seat card has a number. Seats the story is about wear a name and their team badge (`night.F`, each chapter feeds it every frame, so labels follow the scroll both ways). Any card can be asked: hover, tap, click or keyboard focus opens a small card with the painting, name and good or evil badge. While the table is up this replaces the card dialog. Seat 3's (chapter 5) and seat 2's (chapter 6) badges stay hidden until the water reveals them (`night.NB`). Needed a fix: the ring left the cards non-interactive after the deck gathered. Checked at 1280x720 and 390x844 with mouse hover and touch tap. Still open: owner's look, the other chapters' labels by eye (night, vote, quest), Malay and Chinese label lengths on a small phone
- 2026-11-17: **seat labels, vote rule** (owner): while the vote cards are laid and turned, the three seats in the middle lose their numbers and name labels, and the labels return once the cards have faded (both rounds). Written into [006](../section/006-the-vote.md) and [story_line.md](story_line.md). Built (`night.HID`, `vote.js`, `seats.js`), checked at 390x844. Still open: owner's look, desktop check of the vote
- 2026-11-17: **title runners** (owner): two small figures take turns running across the letters of the hero title "Avalon", one run each: the Ink runner (trips at the A, rolls into the v, gets up, runs, slides off the n and fades) and Merlin's apprentice (hops the A, high jump over the l, vanishes in a puff at the middle of the n). First section only: drawn on a canvas inside the hero copy, so they fade with the title and stop once the hero leaves the screen or the tab is hidden; reduced motion shows the Ink runner standing on the A. Chosen from two playable prototypes (Avalon Title Runner, Avalon Runner Routes). Written into [story_line.md](story_line.md) chapter 0 and [001](../section/001-banner.md). Code: `src/js/runner.js`. Still open: owner's look with a real mouse and phone, script size (already over the 130 KB budget)
- 2026-11-17: **seat tag above the asked-for card** (owner): the asked-for card opens below the 12 o'clock seat and covered that seat's name tag ("6 · Loyal Servant"). The tag layer (`.sn-layer`) is now z-index 7 over the card (`.sn-pop`, 6) in `main.css`. Written into [006](../section/006-the-vote.md) and [story_line.md](story_line.md). Not yet checked in the browser. Still open: owner's look
- 2026-11-17: **seat numbers only at the table** (owner): numbers and labels appear together with the deal's "Ten seats" line, fade with the scroll, and are gone at the hero ring, the wall and the story steps when scrolling back up; hover and tap asking are off there too. Fixed in `seats.js` and `cards.js` (labels now run on the main frame loop). Decisions written into [004](../section/004-the-deal.md), [006](../section/006-the-vote.md) and [story_line.md](story_line.md). Checked at 390x844. Still open: owner's look
- 2026-11-17: chapters 7 The Blade and 8 Your Seat built together ([010](../section/010-the-blade.md), [011](../section/011-your-seat.md), "As built" notes in both). New: `blade.js`, `seat.js`, `data/blade.json`, a staged mode in `draw.js`, `setBlood`/`setDawn` and two tint layers in the theme, poses `arc`, `wide`, `seat` in the night's camera. The characters section is gone and the page turns dark at the blade. Final call has **Save me a seat** and **Invite my group**. Checked in headless Edge at three phone and desktop sizes. Still open: the owner's look with a real mouse and phone (both chapters), the Android buzz, frame rate on a mid range phone, tablet and scripts off checks, native read of the new zh and ms lines, script size at 129 of 130 KB. **Resume here**: owner's look at chapters 5 to 8, then chapter 0 (prologue), the old "Three rounds of doubt" copy, spec 0001's rewrite and the final review
- 2026-11-17 (owner's review of chapters 7 and 8): (1) the draw result is centred on phones and tablets; (2) the blade's choice title is now the bold line "Tap to aim. Tap again to strike." ("Point at a card, then click." with a mouse), the small hint and the "keep scrolling" line are gone; (3) a new 0.6 screen win screen after each ending, solid red "Evil wins" after ending A and solid blue "Good wins" after ending B (added after the gold dawn, which stays), blade length is now 4.6 screens; (4) the X share button is replaced by **Save my card**, which downloads a picture of the drawn role (portrait 1080x1350 on a phone, wide 1200x630 on a desktop); (5) on a phone the Facebook button opens the phone's share sheet with that picture, elsewhere it shares the link; Facebook only reads previews from a real public address, so it needs `PUBLIC_SITE_URL` set once the domain exists; (6) dropped by the owner. Checked in headless Edge at 390x844 and 1280x720. Scripts are now a little over the 130 KB budget
- 2026-11-17 (minify): added `esbuild`; scripts and styles are bundled and minified into `dist/js/main.min.js` and `dist/css/main.min.css`. Scripts went from about 76 KB to about 50 KB compressed, and 15 script requests became one. Re-checked in headless Edge at 390x844 and 1280x720: both blade endings, the draw, Save my card, `?motion=off`, no console errors. Hosting plan discussed with the owner: publish `dist/`; Cloudflare Pages preferred; set `PUBLIC_SITE_URL` per domain before building for each host. Still to do: the music button (the owner will supply a 1 minute track), Google Analytics (waiting for the measurement ID)
- 2026-11-17 (background music, [012](../section/012-background-music.md)): the 60 second loop is built. `npm run build` now trims and compresses the source track with ffmpeg (needs ffmpeg on PATH or `FFMPEG_PATH`), `src/js/music.js` fades it in and out (out from 57 s) and loops it, and a speaker button sits in the top-right corner in all three layouts (the nav pill moves left on phones). It tries to start by itself 3 s after the page has loaded, and any click, tap, key press, scroll or wheel turn starts it if the browser refused. The on/off choice is remembered. Checked in desktop Chrome only. Still open: a real iPhone and Android check, the owner's ear on volume and the 60 second cut, Google Analytics (waiting for the measurement ID)
