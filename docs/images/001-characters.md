# 001 Characters (card art)

**Status**: first set approved. The trait-based repaint of six characters was approved by the owner and **switched onto the live site on 2026-11-15**.
**Code**: `scripts/generate-art.mjs`, `scripts/art-prompts.json`, `src/data/deck.json`, `src/assets/cards/`
**Related**: [002-badge](002-badge.md), [001-banner](../section/001-banner.md)

## Decisions made

| # | Decision | Why / who |
|---|---|---|
| 1 | Art style is **painted dark fantasy** (oil paint, candle light, art fills the whole card). Tarot style was sampled and rejected. The tarot samples stay in `src/assets/cards/tarot/` as a record and are not used. | Owner picked 2026-11-15 |
| 2 | Art is made once with the OpenAI image API by a local script, checked by a human, and committed. The site never calls the API. The key stays in `.env` and never ships (AC-18). | Spec |
| 3 | Prompts must not name the published game, its artists or its card layout. | Takedown risk, see spec premise note |
| 4 | Ten cards in the deck: Merlin, Percival, Loyal Servant x4, Assassin, Morgana, Mordred, Oberon. Which painting each ring card uses is in `src/data/deck.json`. | Owner, 2026-11-15 |
| 5 | The four Loyal Servants: `loyal-servant` (male, Norse-style helmet, owner's reference), `loyal-servant-2` (older male, first set) then repainted, `loyal-servant-3` and `-4` (women). | Owner asked for 2 male and 2 female |
| 6 | Assassin, Mordred and the first Loyal Servant were redone earlier from the owner's reference pictures. | Owner |
| 7 | **Repaint request (2026-11-15)**: the owner asked for six characters to look "99% similar" to the real board game's cards. **Declined as asked**: those cards are the publisher's copyrighted artwork, and near copies on a public page that promotes paid game nights risk a takedown. **Done instead**: new original paintings that take the traits of each reference picture (hair, headband, helmet, moustache and so on), written as prompts, never feeding the game's pictures to the image model. | Decided with the owner, who then said to proceed with the trait-based plan |
| 8 | The new paintings go to `src/assets/cards/painted-v2/`. The live site keeps `painted/` until the owner approves. Switch = copy the six files over `painted/` and run `npm run build`. | Safe validation |
| 9 | The owner's reference pictures are saved in `refeerences/` (folder name as it exists). The build never reads that folder, so they cannot ship. They are shown on the design page for future reference. | Owner asked |
| 10 | Old prompts for the six roles are kept in `scripts/art-prompts.json` under `previous`. | Record |

## The six repaints (traits taken)

| Card | File | Traits |
|---|---|---|
| Morgana | `morgana` | Long copper-orange hair, gold headband with a red ruby at the forehead, tall ribbed gold collar, cold sideways stare |
| Loyal Servant, male | `loyal-servant-2` | Long dark curly hair, steel plate armour, a cut on the cheek |
| Loyal Servant, female 1 | `loyal-servant-3` | Hair swept back under a gold headband, blue gown with pearls, three quarter view |
| Loyal Servant, female 2 | `loyal-servant-4` | Closed steel helmet framing the face, plate armour with blue shoulder plates |
| Percival | `percival` | Straw-blond bowl cut, short moustache and chin beard, pale eyes, healing cut, dark armour with a red cloak |
| Oberon | `oberon` | Yellow-green horned fey creature, thorn crest, pointed ears, snarl with sharp fangs |

Generated 2026-11-15 with the model set in `.env`. Review them on `design/index.html`, sections 08 and 09.

## Open items

- Done 2026-11-15: owner approved, the six files were copied from `painted-v2/` over `painted/` and the site rebuilt. The previous six paintings are kept in `src/assets/cards/painted-v1-backup/`. `painted-v2/` still holds the same new files
- A native check of how the characters read at card size
