# 002 Team badge

**Status**: version 2 (detailed illustrated badges) is generated, cut out, live on the site and **approved by the owner on 2026-11-15**. Version 1 (simple vector) is kept as a fallback.
**Code**: `scripts/art-prompts.json` (`badges` block), `scripts/generate-art.mjs --badges`, `src/assets/badges-src/raw-blue.png` and `raw-red.png` (the generated originals), `scripts/build.mjs` (`cutOut`, `buildBadges`, share images), `src/styles/main.css` (`.card.good`, `.card.evil`), `src/assets/badges/*.svg` (version 1 fallback)
**Spec**: AC-4a in [0001](../specs/0001-avalon-landing-page.md)
**Related**: [001-characters](001-characters.md)

## Decisions made

| # | Decision | Why / who |
|---|---|---|
| 1 | Every **face up** card shows a team badge in its **top right corner**: **blue** for the good side (Merlin, Percival, Loyal Servants) and **red** for the evil side (Assassin, Morgana, Mordred, Oberon). | Owner, 2026-11-15 |
| 2 | Face down cards show **no badge**, so the team stays secret until the flip. | Keeps the mystery |
| 3 | The badge is **our own emblem**, not a copy of the game's crests. | Same copyright reason as the paintings, see [001-characters](001-characters.md) decision 7 |
| 4 | The badge is added by the page (CSS on `.card.good` / `.card.evil`) and onto the 1200x630 share images, **not painted into each card**. | One design, identical everywhere, changeable without regenerating any art |
| 5 | Version 1 (built): flat vector, blue enamel with a gold crown and sword, red enamel with a steel dagger, eight points. | First pass |
| 6 | **Version 2 request (owner, 2026-11-15)**: more detail. **Blue badge: a pegasus holding a spear.** **Red badge: a two headed bird, both legs spread wide and both wings open wide.** Both round rings carry their own specific details. Generate with **gpt-image-2.6-flare**. | Owner, after seeing his two reference badges |
| 7 | Model name: the owner wrote "gpt-imag-2.6-flare". The OpenAI key lists exactly one match, `gpt-image-2.6-flare`, so that is the model used. | Checked against the key's model list |

## Reading of the request (please confirm)

- "2 headed swarm": read as a **double headed eagle** (the owner's red reference shows a two headed bird with open wings and legs). If a **swan** was meant, say so.
- The owner's two reference badges (a red eagle badge and a blue winged creature badge) are for the **look and level of detail only**. The new badges use the owner's subjects (pegasus with spear, double headed bird) in our own drawing, with our own ring patterns. The references are not fed to the model and not copied.

## Plan (version 2) and what was done (2026-11-15, owner approved: eagle reading and 28% size)

1. **Prompts** written into `scripts/art-prompts.json` (new `badges` block, shared style text plus one subject line each):
   - Blue: round enamel medal, polished gold rim with engraved laurel and rune-like pattern, deep blue field, a rearing winged horse (pegasus) in gold and silver holding a spear, eight gold rays behind the rim. Own design.
   - Red: round enamel medal, dark steel rim with engraved teeth and filigree, crimson field, a double headed bird in silver with both wings spread wide and both legs spread wide with claws open, eight steel points behind the rim. Own design.
   - No text, letters or numbers on either.
2. **Script**: add a `--model` option to `scripts/generate-art.mjs` (default stays the model in `.env`), so the badges use `gpt-image-2.6-flare` without changing the model used for card art. Square 1024x1024 output, one badge per call.
3. **Test one of each first**, then check: does the model give a clean transparent background? If not, generate on a flat plain background and cut it out with `sharp`. Review the two test badges with the owner before any retries.
4. **Make small files** with `sharp`: WebP with transparency at 96, 192 and 384 px, plus a PNG for the 1200x630 share images. Output to `src/assets/badges/`.
5. **Wire in**: change the two CSS rules to use the new images, and the share image composite in `scripts/build.mjs`. Keep version 1 SVGs as a fallback and backup.
6. **Check on the design page** (`design/index.html`, section 10): old and new badge side by side, large, then on sample good and evil cards at card size.
7. **Check on the site** at hero dialog size, characters section, draw result, role pages and share images.

## Result

- Both badges came out right on the **first generation** with `gpt-image-2.6-flare`: pegasus holding a spear on the blue gold-laurel badge; two headed bird with both wings and both legs spread wide on the red steel badge with teeth and filigree ring. No text or letters appeared.
- The model painted them on a plain white background (a transparent background was not requested). The build removes the white that touches the edge with a flood fill, so white inside the badge is kept, softens the edge, and trims.
- Files made by `npm run build` into `dist/assets/badges/`: `good-96/192/384.webp`, `evil-96/192/384.webp`, plus `good-256.png` and `evil-256.png` for share images. The CSS picks the size with `image-set`.
- Badge size on cards raised from 24% to **28%** of the card width. Share images carry the badge too (slightly larger).
- The design page (section 10) shows the new badges large, the version 1 badges for comparison, and four sample cards.
- Generation cost: 2 images, no retries.

## How to change a badge later

1. Edit the subject line in `scripts/art-prompts.json` (`badges.blue` or `badges.red`).
2. `node scripts/generate-art.mjs --badges blue --force` (add `--model name` to use another model).
3. `npm run build` redoes the cut out and the small files.

## Known limits and open items

- At normal card size (about 45 px on a 160 px card) the fine detail is small. It shows fully in the card dialog, role pages and share images.
- A faint soft edge from the original drop shadow can remain on some dark backgrounds. If the owner sees it, regenerate with a plain background request or raise the clean-up passes in `cutOut`.
- Owner approved the look (2026-11-15). Phone size not yet checked by eye.
- The face down card back has no badge by design.
