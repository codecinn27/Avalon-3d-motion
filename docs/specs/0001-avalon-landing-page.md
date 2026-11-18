# 0001. Avalon online game nights landing page

**Date**: 2026-11-14
**Status**: Proposed

> **Stack change, 2026-11-15 (owner's decision, overrides the stack parts below).** No Astro and no Tailwind. The site is plain HTML, CSS, and JavaScript, with Three.js only if a real need appears (none is expected, since the backdrop is one small raw WebGL shader). Everything else in this spec stands: the sections, the acceptance criteria, the three languages, the 21 role pages, the draw, and the sharing. The rest of this spec still names Astro and Tailwind in places and has not been rewritten yet. Read those as follows:
> - Pages: a small Node script, `scripts/build.mjs`, with no framework, fills plain HTML templates from the language files and writes finished static pages to `dist/` (`/`, `/zh/`, `/ms/`, and each `/role/<slug>/`). What ships is only HTML, CSS, and JS files.
> - Styles: one hand written stylesheet with CSS variables, ported from `design/index.html`.
> - Scripts: GSAP and Lenis as local files copied into `dist/`, loaded with plain script tags, no bundler.
> - Images: the build script uses `sharp` (a build time tool, never shipped) to make small WebP or AVIF cards and the 1200x630 share images.
> - Fonts: self hosted font files with `font-display: swap`.
> - Sitemap and `robots.txt`: written by the build script.

## Summary

This is the plan for one landing page that gets visitors to message the shop owner on WhatsApp about online Avalon game nights. The page uses smooth scroll motion, 3D character cards, and a flowing animated background, and it turns from a light cream look to a dark look as the evil roles are revealed. Visitors can draw a random role card and share it on WhatsApp, Facebook, Threads, and X, which brings their friends back to the page. Work happens in three gated steps: this spec, then a design you approve, then the frontend build.

## Context

> ⚠️ Premise note: "Avalon" is also the name of a published board game (The Resistance: Avalon). Copying its card art, logo, or card frames would put the page at risk of a takedown. The role names come from Arthurian legend and are free to use. So every image on this page is new art made for this project, and the page describes the offer as online game nights where people play Avalon, never as an official product.

The shop owner hosts online Avalon sessions and needs new players. The only goal of the page is a tap on a WhatsApp button, where the owner answers questions and takes it from there. There is no booking system, no login, and no payment on the page.

Forces that shape the design:

- **Phones first.** WhatsApp clicks come mostly from phones, often mid range ones on mobile data. Motion that stutters or a page that loads slowly loses the click.
- **A look that stops the scroll.** The owner wants the smooth 3D feel of davidecarusio.it. That site gets its feel from a WebGL shader backdrop (an animated image drawn by the graphics chip), smooth scrolling, and text that reveals as you scroll. It does not use real 3D models.
- **Three languages.** English, Chinese, and Malay, with a switch.
- **Sharing must look good.** A shared link needs a rich preview (the image and title a social app shows for a link). Social apps read that preview from the page's HTML without running scripts, so each role needs a real page of its own.
- **One person runs it.** No server to watch, no database to back up.
- **Empty project.** No code, no `AGENTS.md`, no git repo yet, so the stack is chosen here.

## Requirements

**User stories**:
- As a visitor, I want to understand in under a minute what Avalon is and why it is fun, so that I feel like joining a night.
- As a visitor, I want to draw a random role card and share it, so that I can show friends which role I got.
- As a friend who taps a shared link, I want to see the role my friend drew and draw my own, so that I join in.
- As a visitor, I want one tap to reach the shop owner on WhatsApp, so that I can ask about game nights.
- As a visitor, I want to read the page in English, Chinese, or Malay.
- As the shop owner, I want every button to lead to my WhatsApp with a ready written message, so that chats start easily.

**Acceptance criteria** (the contract, each one checkable by itself):
- **AC-1**: The page has these sections in this order: hero, how the game works, meet the characters, draw your card, final WhatsApp call to action, footer.
- **AC-2**: A WhatsApp button is visible in the hero, in the floating nav at all scroll positions, in the draw result, and in the final section. Each opens `https://wa.me/<number>?text=<message>` with a ready written message in the current language.
- **AC-3**: The page exists in English at `/`, Chinese at `/zh/`, and Malay at `/ms/`. A language switch in the nav moves between them and keeps the visitor on the same page. The last chosen language is remembered on that device.
- **AC-4**: The characters section shows exactly seven roles: Merlin, Percival, Loyal Servant of Arthur (good side), then Assassin, Morgana, Mordred, Oberon (evil side). Each card shows original art, the role name, its side, and one line about what it does.
- **AC-4a** (added 2026-11-15): Every face up card shows a team badge in its top right corner: blue for the loyal side (Merlin, Percival, Loyal Servants) and red for the evil side (Assassin, Morgana, Mordred, Oberon). The badge is our own design. Face down cards show no badge.
- **AC-5**: The page starts on a cream palette. The background, text, and nav turn to the dark palette during the characters section, at the moment the first evil role is revealed, and stay dark to the end. Scrolling back up reverses the turn.
- **AC-6**: Role cards are real 3D objects in the browser (they have a front and a back, and they flip and tilt in perspective). In the hero, ten face down cards (the full ten player deck: Merlin, Percival, four Loyal Servants, Assassin, Morgana, Mordred, Oberon) turn slowly on an oval around the centre title "Avalon". Hovering a card with a mouse, or tapping it on a phone, stops the turning, and the card lifts and tilts toward the cursor. Clicking or tapping a card flies it to the middle of the screen while it flips face up, and a dialog shows that character's art, name, side, and one line; closing puts the card back. Scroll adds to the turning (changed 2026-11-15, owner's request, modelled on ellioteriksson.com).
- **AC-7**: A fixed animated shader backdrop runs behind all sections and its colours follow the light to dark turn. If WebGL is not available, a static gradient in the same colours shows in its place and nothing else breaks.
- **AC-8**: Scrolling is smoothed (Lenis) and section text reveals as it enters view. Motion uses only transform and opacity.
- **AC-9**: Tapping "Draw your card" plays a shuffle and flip animation and reveals one of the seven roles at random, each with equal chance. Every tap draws again. Two draws in a row never show the same role.
- **AC-10**: The draw result shows the role card, name, side, and one line, plus share buttons for WhatsApp, Facebook, Threads, and X, a copy link button, a "Draw again" button, and a WhatsApp button to ask the shop owner for details. The WhatsApp message to the owner names the drawn role.
- **AC-11**: Each share button opens that network's share screen with the link to the drawn role's own page in the current language. The WhatsApp, Threads, and X shares also carry a short ready written line naming the role.
- **AC-12**: Each role has its own page per language (21 pages, for example `/role/merlin/` and `/zh/role/merlin/`). The page shows that role's card, a "Draw your own" button that leads to the draw section, and a WhatsApp button. Its link preview shows that role's art and a title naming the role.
- **AC-13**: With "reduce motion" turned on in the device settings, there is no smooth scroll, no pinned sections, and no shader animation. All content, the draw, sharing, and every WhatsApp button still work, with simple fades.
- **AC-14**: On a mid range phone on 4G, the main hero content appears within 2.5 seconds (LCP, the time until the largest thing on screen has loaded), total script weight stays under 130 KB compressed, and scroll motion holds a steady frame rate with no visible stutter.
- **AC-15**: The layout works from 360 px wide phones up to wide desktops with no sideways scroll. All tap targets are at least 44 px. Body text meets WCAG AA contrast on both palettes. Every button can be reached and used with a keyboard, and every card image has alt text.
- **AC-16**: Each language page has its own title, description, canonical link, `hreflang` links to the other two languages, and Open Graph tags. A sitemap and `robots.txt` are generated.
- **AC-17**: If JavaScript fails or is off, all text, card images, and WhatsApp links still show and work as plain content. Only the draw and the motion are missing.
- **AC-18**: The OpenAI key is read only by the local art script from `.env`. It never appears in the built site, in the browser, or in the repo.

## Options considered

### Option 1: Static Astro site with CSS 3D cards and a custom shader backdrop

Astro builds plain static pages. GSAP ScrollTrigger and Lenis drive scroll motion. Cards are HTML elements moved in CSS 3D space. One small WebGL canvas draws the flowing backdrop.

**Pros**:
- Same motion tools as the reference site, so the same feel is reachable (basis: davidecarusio.it runs GSAP, ScrollTrigger, SplitText, and Lenis).
- Light on phones. Cards are images, and text stays real text for search engines and all three languages.
- Static pages give each role a real link preview with no server.

**Cons**:
- CSS 3D has limits. No real lighting or shadows cast between cards, so depth must be faked with gradients and soft shadows.
- The shader is hand written code that needs care to tune per device.

### Option 2: Full 3D scene with Three.js

A real 3D round table with cards and tokens, with a camera that travels through the scene on scroll.

**Pros**:
- The most striking result, with true lighting and depth.

**Cons**:
- Much heavier download and battery use. Cheap phones drop frames, which costs WhatsApp clicks.
- Text inside a 3D scene is hard to translate, hard for search engines, and hard for screen readers.
- Roughly two to three times the build time, and needs 3D models, not just images.

### Option 3: Webflow with Unicorn Studio, like the reference site

Build visually in Webflow and embed a ready made shader scene.

**Pros**:
- Fastest way to copy the reference look. Visual editing of content.

**Cons**:
- Monthly cost, and three languages need the paid localization add on.
- The random draw and the 21 role share pages fit poorly in a visual builder.
- The code is not in this repo, so the agent workflow cannot build or check it.

### Option 4: A video that plays as you scroll

Render the whole 3D journey as a film and tie its playhead to scroll.

**Pros**:
- Can look like a film, with no live 3D cost.

**Cons**:
- Large video files on mobile data. Scrubbing video is jerky on many phones.
- The random draw and tilting cards cannot be part of a fixed film.

## Decision

**Chosen option**: Option 1: Static Astro site with CSS 3D cards and a custom shader backdrop

Build a static Astro site in three languages, with GSAP and Lenis for motion, CSS 3D role cards, one WebGL shader backdrop, a random card draw that runs in the browser, and a static share page per role.

**Implementation skills**: `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance`, `gsap-plugins`, `gsap-utils`, `gsap-frameworks` (`greensock/gsap-skills`, `.agents/skills/gsap-*/`) · `cinematic-gsap-lenis-motion-system` (`mengto/skills`, `.agents/skills/cinematic-gsap-lenis-motion-system/`) · `high-end-visual-design` (`Leonxlnx/taste-skill-classics`, `.agents/skills/high-end-visual-design/`, opt in, named in `own.md` as the taste skill for this version)

## Rationale

The goal is a WhatsApp tap from a phone, so the page must be fast first and impressive second. Option 1 reaches the reference site's feel with the same tools while keeping the download small, which Option 2 and Option 4 cannot do on mid range phones. The share feature needs a real page per role for link previews, and the page needs three languages. Static Astro pages give both for free, while Option 3 makes both awkward or costly. One person runs the site, and a static site has nothing to operate.

The owner asked for "3D smooth motion like the reference". The reference is not true 3D, so true 3D (Option 2) would add cost without matching the brief any better. The owner chose "3D cards plus shader backdrop" when asked.

Smaller calls made here, each with its runner up:

| Call | Pick | Why | Runner up |
|---|---|---|---|
| Shader backdrop | One hand written WebGL fragment shader (a small program that colours each pixel), no 3D library | A flowing silk look needs about 100 lines, and a library would add weight for no gain | OGL, a tiny WebGL helper |
| Card 3D | CSS 3D transforms driven by GSAP | Cards stay real HTML, so text, alt text, and taps work as normal | Cards drawn inside WebGL |
| Styling | Tailwind CSS v4 with colour and type tokens as CSS variables | The taste skill is written in Tailwind terms, and variables make the light to dark turn one tween | Plain scoped CSS |
| Text reveal | GSAP SplitText, by word for English and Malay, by line for Chinese | Chinese has no spaces between words, so word splitting breaks it | CSS only fades |
| Languages | Astro built in i18n routing, English at `/` with no prefix | English is the default, short links for the main audience | All three with a prefix |
| Language detection | No automatic redirect. The switch is manual and remembered | Automatic redirects annoy people and confuse link previews | Redirect on first visit |
| Chinese script | Simplified Chinese | Most common among Chinese readers in Malaysia and Singapore. Confirm in Follow-up | Traditional |
| Randomness | `crypto.getRandomValues`, with a redraw if the result equals the last one | Fair, and "fresh every tap" should never look stuck | `Math.random` |
| Share previews | One 1200x630 image per role, art and logo only, no translated text baked in | Seven images serve all 21 pages. The translated title carries the role name | 21 images with text |
| Art pipeline | A Node script that calls the OpenAI image API and saves files into the repo | Art is made once, checked by a human, and committed. The site never calls the API | Generate by hand in a chat tool |
| Fonts | Self hosted via Fontsource. Fraunces for display, Geist for body, Noto Serif SC and Noto Sans SC for Chinese | No banned fonts from the taste skill, and no calls to a font server | Google Fonts links |
| Analytics | None wired at launch, but every WhatsApp and share button carries a `data-event` name | Host is undecided, so the tool is picked later without touching markup | Plausible from day one |
| Build order | Design gate first, then thin end to end slices | The owner asked to approve the design before any frontend build | Build everything, then review |

## Feature design

**Design source**: no design tool file. Direction comes from the owner's three reference sites, three sites found through the inspo MCP (listed in References), the banner image in `refeerences/banner avalon.png`, and the `high-end-visual-design` skill.

**Page composition** (home page, top to bottom):

| # | Section | Palette | What it shows | Motion |
|---|---|---|---|---|
| 0 | Floating nav | follows page | Brand name, language switch (EN, 中文, BM), WhatsApp pill button | Floating glass pill, detached from the top. Colours flip with the page |
| 1 | Hero | cream | Eyebrow tag, the title "Avalon", the line "Trust no one at the round table", WhatsApp button, "Draw your card" text link. Ten face down cards on an oval around the title | Cards open out from the centre on load, then the ring turns by itself (about one lap a minute). Cards on the far side are smaller and dimmer. Hover or tap stops the ring and lifts the card. The hero pins briefly; scroll turns the ring, then the cards part and fade (placeholder exit until the story flow is designed). Silk shader behind |
| 2 | How the game works | cream | Three steps: get a secret role, go on quests, find the traitors before they win | Section pins (stays in place while you scroll). Text reveals step by step. One card per step slides forward in depth |
| 3 | Meet the characters | cream, then dark | Seven role cards, good side first | Section pins. Cards flip face up one at a time. When the Assassin flips, backdrop, text, and nav turn dark. The four evil cards then rise out of the dark with a warm glow |
| 4 | Draw your card | dark | A face down deck, one button. After a draw: the result panel from AC-10 | Deck shuffles, one card flies up, flips, and settles. About 1.6 seconds |
| 5 | Final call | dark | One short line, one large WhatsApp button | Big type scales in. Button has a press and magnet hover effect |
| 6 | Footer | dark | Brand name, language links, a line saying the art is original and the page is not an official product | None |

On phones the same order holds. Pins are shorter, the hero arc becomes a fanned stack, and the characters section moves one card per swipe of scroll.

**Role share page** (`/role/<slug>/` per language): nav, the role card face up with a slow idle tilt, role name, side, one line, a line such as "A friend drew this role. Which one are you?", a "Draw your own" button to `/#draw` in that language, and a WhatsApp button. Dark palette for evil roles, cream for good roles.

**Visual direction** (the design step turns this into exact tokens):
- Light palette: warm cream paper, deep ink text, antique gold accent.
- Dark palette: near black with a blue tint, cream text, candle gold accent, a deep crimson for the evil side.
- Type: large high contrast serif for titles, clean sans for body. Chinese uses a matching serif and sans pair.
- Cards: tall 2:3 ratio, rounded corners, a thin gold edge, a shared card back with a crest. Soft wide shadows, never hard ones.
- A faint paper grain over the whole page, fixed in place.
- Buttons: full pills with the arrow in its own small circle, as the taste skill describes.

**Card art**:
- Two styles are made as samples in the design step: painted dark fantasy, and tarot card style. Samples are Merlin and Morgana in each style (four images). The owner picks one style, then all seven roles, the card back, and the seven share preview images are made in that style.
- Script: `scripts/generate-art.mjs`. It reads prompts from `scripts/art-prompts.json` (one shared style block per style, one subject line per role, so the set stays consistent), calls the OpenAI image API, and saves portrait PNG files to `src/assets/cards/<style>/<slug>.png`. It skips files that already exist unless run with `--force`.
- Prompts must ask for original characters and must not name the published game, its artists, or its card layout.
- Astro's image pipeline turns the PNG files into AVIF and WebP at the sizes the page needs.

**Data model sketch** (content files, no database):

| File | Shape |
|---|---|
| `src/data/roles.ts` | Array of seven: `slug` (unique, for example `merlin`), `side` (`good` or `evil`), `order` (1 to 7), `art` (image import), `ogImage` (path) |
| `src/i18n/en.json`, `zh.json`, `ms.json` | All page copy by key, plus per role `name`, `sideLabel`, `line`, `shareText`, `waMessage`. The three files must have identical keys |
| `src/config.ts` | `whatsappNumber`, `siteUrl`, `brandName`, `defaultLocale`, `locales` |

**State transitions** (the draw): `idle` → `shuffling` → `revealed` → (`Draw again`) → `shuffling`. Taps during `shuffling` are ignored. The page theme: `light` ↔ `dark`, driven only by scroll position in the characters section.

**Interface surface** (no server API, so this lists routes and outbound links):

| Route or link | Kind | Key inputs | What it gives | Auth | Failure case |
|---|---|---|---|---|---|
| `/`, `/zh/`, `/ms/` | static page | none | Landing page in that language | public | Unknown path shows a 404 page with a link home |
| `/role/<slug>/`, `/zh/role/<slug>/`, `/ms/role/<slug>/` | static page | `slug`, one of seven | Role share page with its own preview tags | public | Unknown slug shows the 404 page |
| `https://wa.me/<number>?text=<msg>` | outbound | number, message | Opens chat with the owner | none | No WhatsApp installed: WhatsApp's own web page handles it |
| `https://wa.me/?text=<text + url>` | outbound share | text, role url | WhatsApp share picker | none | Same as above |
| `https://www.facebook.com/sharer/sharer.php?u=<url>` | outbound share | role url | Facebook share screen | none | Popup blocked: link opens in a new tab |
| `https://www.threads.net/intent/post?text=<text + url>` | outbound share | text, role url | Threads post screen | none | Same |
| `https://x.com/intent/post?text=<text>&url=<url>` | outbound share | text, role url | X post screen | none | Same |
| Copy link | browser clipboard | role url | Link copied, button says "Copied" | none | Clipboard blocked: show the link in a selectable field |

Share link formats are as known at writing time. Check each one in a browser during the build, since networks change them.

**Value sourcing**:

| Action | Value produced or shown | Source |
|---|---|---|
| Any WhatsApp owner button | Phone number | `PUBLIC_WHATSAPP_NUMBER` via `src/config.ts` |
| Any WhatsApp owner button | Ready written message | `waMessage.general` in the current language file |
| WhatsApp owner button in draw result | Message naming the role | `waMessage.withRole` in the current language file, with the drawn role's `name` filled in |
| Draw | Which role | Random index over `roles` from `crypto.getRandomValues`, redrawn if equal to the last result held in memory |
| Share buttons | Link to share | `siteUrl` + language prefix + `/role/<slug>/` |
| Share buttons | Share line | Role `shareText` in the current language file |
| Role page preview | Image | Role `ogImage`, made absolute with `siteUrl` |
| Role page preview | Title and description | Role `name` and `line` in that page's language file |
| Page language | Current language | The URL path prefix |
| Language switch | Remembered language | `localStorage` key `avalon:lang`, used only to highlight and offer, never to redirect |
| Language switch | Target link | Same route under the other language prefix |
| Light to dark turn | When to turn | Scroll progress of the characters section, at the fourth card's flip |
| `hreflang` and canonical | Absolute links | `siteUrl` + route per language |

**Key invariants**:
- The three language files always have the same keys. A build check fails the build if they differ.
- There are always exactly seven roles, three good and four evil, and every role has art, a share image, and copy in all three languages.
- Every call to action on the site leads to WhatsApp or to the draw. No dead ends.
- Animation touches only transform and opacity. Blur effects sit only on fixed elements.
- One shader canvas for the whole page, capped at a device pixel ratio of 1.5, paused when the tab is hidden.
- No secret ever has the `PUBLIC_` prefix.

**Security model**: everything is public and read only. No forms, no accounts, no cookies, no personal data collected, so no consent banner is needed. The phone number shown is the shop's public business number. All outbound links open with `rel="noopener noreferrer"`. The OpenAI key lives only in a local `.env` file that git ignores, and only the art script reads it.

**Configuration required**:
- `PUBLIC_WHATSAPP_NUMBER`: the owner's WhatsApp number in international format with digits only
- `PUBLIC_SITE_URL`: the final site address, needed for share links, previews, and the sitemap
- `OPENAI_API_KEY`: local only, for `scripts/generate-art.mjs`
- `OPENAI_IMAGE_MODEL`: local only, the image model name, so it can change without a code edit. Confirm the current model name when the script is written
- `.env.example` lists all four with empty values

**Critical test scenarios**:
- Happy path: on a phone, open `/`, scroll to the end, tap the last WhatsApp button, and the chat opens with the English message, verifies **AC-1**, **AC-2**
- Draw and share: tap draw ten times, never see the same role twice in a row, then tap the X button and the post screen holds the role line and the role link, verifies **AC-9**, **AC-10**, **AC-11**
- Shared link: paste a `/zh/role/morgana/` link into a link preview checker and see Morgana's art and a Chinese title, verifies **AC-12**
- Language: switch to Malay on a role page and land on the same role in Malay, verifies **AC-3**
- Theme turn: scroll down through the characters section and back up, and the palette turns dark and returns to cream, verifies **AC-5**
- Failure case: turn WebGL off, and the gradient shows and everything else works, verifies **AC-7**
- Failure case: turn JavaScript off, and text, images, and WhatsApp links still work, verifies **AC-17**
- Reduced motion: turn the setting on, and no pinning or smooth scroll runs while the draw still works, verifies **AC-13**
- Secret safety: search the built `dist/` folder for the key prefix and find nothing, verifies **AC-18**

## Build plan

No build approach is on record, so this assumes thin end to end slices, with the design gate the owner asked for placed first.

**Phase A: design (ends with the owner's approval)**

1. Start the repo: `git init`, Astro project, Tailwind v4, `.gitignore` with `.env`, `.env.example`, satisfies **AC-18**
2. Write `scripts/generate-art.mjs` and `scripts/art-prompts.json`, then make the four sample images (Merlin and Morgana in both styles), satisfies **AC-4**, **AC-18**
3. Done 2026-11-14: related sites pulled from the inspo MCP, see References. Apply them in step 4, satisfies **AC-1**
4. Build a static design prototype in `design/` (plain HTML, no scroll motion): colour and type tokens for both palettes, every section from the composition table at phone and desktop widths, the role page, and both art styles side by side, satisfies **AC-1**, **AC-4**, **AC-5**, **AC-15**
5. **Gate.** The owner reviews the prototype, picks the art style, and approves or asks for changes. Nothing below starts before approval.

**Phase B: frontend build**

6. Thin thread: language routing, layout, nav with the language switch, hero text, and a working WhatsApp button, live in all three languages, satisfies **AC-2**, **AC-3**, **AC-17**
7. Content layer: `roles.ts`, the three language files, the key match check, `config.ts`, satisfies **AC-3**, **AC-4**
8. Make the full art set in the chosen style: seven roles, card back, seven share images, satisfies **AC-4**, **AC-12**
9. Build all sections as static, responsive, accessible markup with final styles, satisfies **AC-1**, **AC-4**, **AC-15**, **AC-17**
10. Role share pages with preview tags, plus page titles, descriptions, `hreflang`, canonical, sitemap, and `robots.txt`, satisfies **AC-12**, **AC-16**
11. The draw: state machine, fair random pick, result panel, share buttons, copy link, satisfies **AC-9**, **AC-10**, **AC-11**
12. Motion base: Lenis, ScrollTrigger setup, text reveals, the reduced motion path, satisfies **AC-8**, **AC-13**
13. 3D cards: hero arc, pointer tilt, pinned how it works section, pinned character flips, draw animation, satisfies **AC-6**, **AC-8**
14. Shader backdrop with the gradient fallback, then the light to dark turn across backdrop, text, and nav, satisfies **AC-5**, **AC-7**
15. Performance and device pass on real phones: image sizes, script weight, frame rate, tap targets, contrast, satisfies **AC-14**, **AC-15**

## Consequences

**Positive**:
- Nothing to operate. Any static host works, and hosting is free at this size.
- Fast on phones, with real text for search and for three languages.
- The share loop gives each visitor a reason to bring friends.
- Art can be made again at any time by running one script.

**Negative / tradeoffs**:
- Depth is faked, so it will not look like a true 3D scene with real lighting.
- All copy exists three times. Every wording change means three edits, and the Chinese and Malay need a native reader's check.
- Art made by an image model can drift in style between cards. Expect a few rounds of regeneration, and each round costs API credits.
- "Fresh every tap" means a visitor can keep drawing until they get the role they want, so a shared role is for fun and proves nothing.
- With no analytics at launch, the owner cannot count WhatsApp clicks until a tool is added.
- Pinned scroll sections need careful testing on iOS Safari, where browser bars resize the screen.

**Neutral**:
- Instagram is left out of sharing, since it has no share link for websites.
- The design prototype in `design/` is thrown away after the build. It is a reference, and the real site is not built on top of it.
- A new share network later means one more link format and one more button.

## Follow-up

- [x] Shop name: skipped for now (2026-11-14). The nav and footer show the plain wordmark "Avalon" until a name is given. `brandName` in `src/config.ts` is the one place to change it
- [x] Footer layout and music credit (2026-11-17): the footer carries the CC BY 4.0 credit for "Adventure" by Alexander Nakarada (fixed English text, same in every locale, in `src/templates/parts.mjs`). Desktop (over 820 px) is one row of three equal-width columns, all vertically centered: (1) left-aligned stack of the "Original artwork" note over the music credit, both at 12px, (2) brand "Avalon" at 32px, (3) language group EN · 中文 · BM at 24px. The order is set with CSS `order` on desktop only, so the HTML order and the mobile stacked layout are unchanged
- [x] WhatsApp number: `60176016227` (given 2026-11-14), set as `PUBLIC_WHATSAPP_NUMBER`
- [x] Session facts: skipped for now (2026-11-14). The copy states no price, schedule, player count, or call tool. It says the nights are online and sends every question to WhatsApp
- [ ] Owner: give the site address (domain), or accept the host's free address for now
- [ ] Owner: confirm Simplified Chinese, or ask for Traditional
- [x] Inspo MCP signed in and searched (2026-11-14)
- [ ] Owner: add `OPENAI_API_KEY` to a local `.env` file before step 2. Do not paste it in chat
- [x] Art style picked 2026-11-15: painted dark fantasy. The full set lives in `src/assets/cards/painted/`. The tarot samples stay in `src/assets/cards/tarot/` as a record and are not used by the site
- [ ] Pick a host (Vercel, Cloudflare Pages, or Netlify) before launch
- [ ] Pick an analytics tool and wire it to the `data-event` names, so WhatsApp clicks can be counted
- [ ] Have a native reader check the Chinese and Malay copy before launch
- [ ] Check all four share link formats in a browser during step 11
- [ ] The installed skills (`gsap-*`, `cinematic-gsap-lenis-motion-system`, `high-end-visual-design`) are not yet listed in a root `AGENTS.md`. They apply to the whole project and belong in its `## Agent skills` section. No Astro skill was installed (not picked)
- [ ] `gsap-react` was installed as part of the GSAP skill pack but this project does not use React, so it can be ignored

## References

**Project sources** (in this repo):
- `own.md`: the three reference sites and the note to use the taste skill
- `refeerences/banner avalon.png`: cards in an arc around a centred title and one button, the model for the hero
- `.agents/skills/high-end-visual-design/SKILL.md`: floating pill nav, pill buttons, soft shadows, transform and opacity only motion, grain overlay rules
- `.agents/skills/gsap-*` and `.agents/skills/cinematic-gsap-lenis-motion-system`: motion conventions for the build

**Practices & standards**:
- davidecarusio.it (viewed 2026-11-14): shader backdrop, Lenis smooth scroll, GSAP ScrollTrigger with split text reveals, and slow colour turns between sections. The model for the overall motion feel
- ellioteriksson.com: named by the owner for how seven cards move
- premotio.com: named by the owner for cards moving to a new table layout
- From the inspo MCP (searched 2026-11-14, four queries, screenshots viewed for the three kept):
  - knob.design: near black hero, white serif title set low and left, one large object tilted in 3D with a warm glow under it, deep red and cream accents. The model for the dark half and for how a tilted card should be lit
  - quill.finance: cream page with one soft flowing colour shape behind very large type and a small pill tag. The model for the cream half and the shader backdrop on a light page
  - cardsagainsthumanity.com: tilted, overlapping cards scattered across the whole hero, one of them inverted in colour. The model for the hero card arc and for making one card stand out
  - The catalog leans toward software products. Searches for fantasy, tarot, and board game pages returned nothing closer, so the art mood comes from the generated samples, not from a reference site
- Open Graph link previews are read from static HTML, which is why each role has its own page
- `prefers-reduced-motion` and WCAG AA contrast for accessibility
- Core Web Vitals LCP target of 2.5 seconds
- Secrets stay in environment variables, never in the repo or the browser bundle
