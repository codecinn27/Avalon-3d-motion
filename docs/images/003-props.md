# 003 Game cards (vote, quest, Lady of the Lake)

**Status**: all five pictures made 2026-11-15 and shown with their titles and badges on the design page (section 11). Waiting for the owner's final look. Not used on the site yet.
**Story**: [story_line.md](../scope/story_line.md) chapters 3, 4 and 5 ("Pictures to make")
**Code**: `scripts/art-prompts.json` (`props` block), `scripts/generate-art.mjs --props`, originals in `src/assets/props/`
**Preview**: `design/index.html`, section 11. Open it, scroll to the end, switch EN, 中文, BM. `?gl=zh` or `?gl=ms` opens it in that language. Badges are read from `dist/`, so run `npm run build` first if `dist/` is missing
**Related**: [001-characters](001-characters.md), [002-badge](002-badge.md)

## Decisions made

| # | Decision | Why / who |
|---|---|---|
| 1 | Five cards: Approve and Reject (vote), Success and Fail (quest), Lady of the Lake | Story line v3, owner approved 2026-11-15 |
| 2 | **Original designs, not copies** of the owner's reference pictures of the published cards. Same objects, materials and mood, our own drawing | Same copyright reason as the paintings, see [001-characters](001-characters.md) decision 7. References kept in `refeerences/` (`ref-vote-cards.png`, `ref-quest-success.png`, `ref-quest-fail.png`, `ref-lady-of-the-lake.png`), never fed to the model |
| 3 | **Every vote and quest card has its title on top**: APPROVE, REJECT, SUCCESS, FAIL. The title is **live text added by the page**, not painted into the picture. It shows in English (Approve, Reject, Success, Fail), Chinese (赞成, 反对, 成功, 失败) and Malay (Setuju, Tolak, Berjaya, Gagal) | Owner, 2026-11-15 ("no need" to bake it into the files). The model cannot spell Chinese reliably, and baked words would be English only. The pictures keep the top third (vote) and top fifth (quest) empty for the title |
| 4 | **Success carries both badges**: blue at the lower left, red at the lower right, beside the stem. **Fail carries only the red badge**, lower right. Badges are added by the page and are the cut out versions of `badges-src/raw-blue.png` and `raw-red.png` (`dist/assets/badges/good-384.webp` and `evil-384.webp`), the same files the role cards use. About 27% of the card width | Owner, 2026-11-15. The raw files have a white background, so the cut out versions are used. Same rule as [002-badge](002-badge.md) decision 4 (badges are not painted into the art). It also teaches the rule: the loyal can only play Success, traitors may play either |
| 5 | **Both vote spheres are the same size**, at the same place on the card | Owner, 2026-11-15 |
| 6 | **Lady of the Lake is a back view.** A woman standing in a misty green lake at dawn, her back bare, holding a thick white linen shirt against her front and hips, her head turned over her shoulder to look at the viewer. Long golden hair, white water lilies, forest and mist. **No bowl, no castle**. Kept modest: bare back and shoulders only, the cloth opaque, nothing at the front shown | Owner, 2026-11-15 (half naked, white shirt, back showing, head turned to the front), and confirmed the tasteful reading. The bowl is gone because chapter 5's water effect works on the table top |
| 7 | The file is called `lady_of_the_lake.png` (the owner's name, with underscores). The prompt key in `art-prompts.json` is the same | Owner |
| 8 | Full bleed pictures with no frame. The page draws the card edge, as for the role cards | One card look across the site |
| 9 | Model `gpt-image-2.6-flare`, portrait 1024x1536 | Owner, as for the badges |
| 10 | If the trailer is ever run as a paid Facebook or Instagram ad, the Lady's bare back may get it flagged or rejected. On the page itself she shows only in chapter 5 | Flagged to the owner, 2026-11-15 |

## How to make or change one

1. Edit its line in `scripts/art-prompts.json` (`props.approve`, `props.reject`, `props.success`, `props.fail`, `props.lady_of_the_lake`). `props.shared` holds the text used by all five.
2. `node scripts/generate-art.mjs --props lady_of_the_lake --force` (several at once: `--props approve,reject`). `--model name` uses another model.
3. Existing files are skipped unless `--force` is given. Move the old file into `src/assets/props/v1-backup/` first if you want to keep it.

The script's set mode is shared with the badges: `--badges` writes to `src/assets/badges-src/`, `--props` to `src/assets/props/`. **Do not pass `--badges --force`**: it replaces the approved badges. The model does not obey sizes ("69 percent of the card width"), so a size match is fixed afterwards with `sharp`, as for the Reject sphere (below).

## What was made

Cost: 9 images in all (5 first tests, then Reject twice more and the Lady twice more).

| Card | File | Notes |
|---|---|---|
| Approve | `src/assets/props/approve.png` | White marble sphere with gold veins on cream parchment. Sphere is 69% of the card width. First test, kept |
| Reject | `src/assets/props/reject.png` | Faceted black obsidian sphere on the same parchment. The model drew it too big (82%), then too small (61%), so the third picture was cropped and scaled 1.14 times with `sharp` until the sphere measured 69%, and moved to the same place as Approve's |
| Success | `src/assets/props/success.png` | Glowing gold chalice, vine engraving, a row of red stones at the rim. Space beside the stem for both badges. First test, kept |
| Fail | `src/assets/props/fail.png` | The same cup tarnished green and black, a crack down the bowl, dull red stones, smoke. Space at lower right for the red badge. First test, kept |
| Lady of the Lake | `src/assets/props/lady_of_the_lake.png` | Back view, head over the shoulder, opaque white linen at her hips, lilies, forest and mist. Third picture of the Lady |

Backups in `src/assets/props/v1-backup/`:

| File | What it is |
|---|---|
| `lady.png` | First Lady: faces the viewer, holds a silver bowl, castle ruins |
| `lady_of_the_lake-pass1-sheer-cloth.png` | First back view: close to the request but the wet cloth at the hips was partly see through, and castle ruins appeared. Replaced by an opaque version |
| `reject.png` | First Reject (sphere 82%) |
| `reject-pass2-too-big.png` | Second Reject (sphere 82%) |
| `reject-pass3-small.png` | Third Reject, before the crop and scale (sphere 61%). The final `reject.png` is made from this one |

## Open items

- Owner's final look at the five cards with titles and badges (section 11 of the design page)
- The build makes small WebP files from `src/assets/props/` when the vote, quest and Lady scenes are built (not wired yet). The titles move into `src/i18n/en.json`, `zh.json`, `ms.json` at the same time. The Chinese and Malay words above are mine and need a native reader check, like the rest of the copy
- Card backs for the vote and quest cards: the role card back is reused for the first build
