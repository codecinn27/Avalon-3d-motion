# 013 Mobile performance (scroll lag on real phones)

**Status**: in progress, worked one checkpoint at a time (see "Checkpoints" below). CP-1 and CP-2 measured: fewer layers (351 → 210), steadier frames (p95 108 → 58 ms), but the average is still about 21 to 25 fps because of freezes of up to about 3 s. CP-3 traced them: inside the pinned story the GPU draws 13 to 38 off-screen surfaces per frame (filters, 3D contexts, clip-paths, blends), against 1 after it, and that backs up the main thread. CP-4 hid the undrawn threads: layers 211 → 146, but the surfaces per frame did not fall, so the threads were not drawing them. CP-5 traced switch-offs: **the ten story cards make most of the surfaces and the freezes**, and only removing both their 3D context and their rounded clip cuts them (freezes over 500 ms 11 → 1). CP-6 did that for real: average fps 21.9 → 40.1 (run ranges apart), worst frame 3.2 s → 0.55 s, wall surfaces 41 → 15.5 per frame. Next: CP-7, tenth 8 (the 1.5 s freeze left at 70%), then the chapters' own effects. **Not ready to ship**: the goal is the ship rule in "What counts as smooth".
**Reported by**: owner ([own.md](../own.md) item 6). Scrolling is very laggy on a real phone. Desktop is smooth, and desktop Chrome in mobile view (DevTools device mode) is smooth too. It happens on Cloudflare and on cPanel alike.
**Test phone**: Honor X9b (ALI-NX1), 1200x2652, 3.25 device pixels per CSS pixel, screen at 60 Hz during the tests, Chrome 157.
**Code involved**: `src/templates/layout.mjs` (the `lite` class), `src/styles/main.css`, `src/js/shader.js`, `src/js/main.js`, `src/js/cards.js`, the chapter files. Measuring: `scripts/perf-phone.mjs`, `perf/`.

## Checkpoints

### How each step works

One change per step, so every change shows its own effect.

1. Make **one** change. Write down what and why under a new checkpoint.
2. `npm run build`
3. Measure it on the phone against the checkpoint before it (3 runs each, interleaved):
   `node scripts/perf-phone.mjs --before perf/builds/cp<N-1> --after dist --runs 3`
4. Record the numbers under the checkpoint and in the tracker. Verdict: **keep** (better), **revert** (worse), or **unclear** (the runs overlap: measure again or keep for a clear reason).
5. **End the checkpoint with the comparison table** (the rule below), with this checkpoint's column added.
6. If kept, freeze the build so the next step can be compared with it: copy `dist/` to `perf/builds/cp<N>/` (PowerShell: `Copy-Item -Recurse dist perf/builds/cp<N>`).
7. Tick the checkpoint, **only once its column in the comparison table is filled with measured numbers.**

**The comparison table rule** (owner, 2026-11-18): every checkpoint (`###` heading) ends with this table. It keeps the three target columns, then one column per checkpoint from the baseline to this one, so each checkpoint shows the whole history so far. The newest column is in bold. A checkpoint with no code change (a diagnosis) repeats the column before it, marked "no change".

- Baseline column: the first measurement (1 run). The other columns: the median of that checkpoint's "after" runs.
- Worst tenth: the slowest tenth of the page. Freezes: frames over 50 ms in the whole scroll. GPU memory: the Chrome GPU process "Graphics" figure from the script (compare columns, it has no fixed limit).
- Template for checkpoint N (add the columns between):

```
| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | ... | **CPN** |
|---|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | ... | |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | ... | |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | ... | |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | ... | |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | ... | |
| GPU layers | < 50 | 50–100 | > 200 | 339 | ... | |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | ... | |
```

Phone rules while measuring: unlocked, no touching, no `chrome://inspect` window open, USB debugging allowed with "Always allow" ticked.

### Tracker

The numbers are medians of the runs ("range" = slowest to fastest run). The worst tenth is the slowest tenth of the page. Ship rule targets in the last row.

| CP | Change | Avg fps (range) | Worst tenth | p95 frame | Dropped | Hitches >50 ms | Worst frame | Layers | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Baseline, nothing changed | 19.4 (15.3 to 26.6, 6 runs) | 0.3 fps | 92 to 241 ms | 27 to 31% | 37 to 48 | 2.7 to 3.4 s | 339 to 374 | the starting point |
| 1 | Phone-only: no grain, no glass blur, still silk. All: hide the 20 extra cards when invisible | 25.5 (20.7 to 40) | 1.3 fps | 74.9 ms | 20.9% | 55 | 3.1 s | 210 | keep, but **unclear**: the runs overlap the baseline's |
| 2 | Phone-only: tighter card shadow | 21.3 (19.4 to 30.2) | 0.7 fps | 58.2 ms | 16.6% | 38 | 3.3 s | 210 | keep: steadier (p95, dropped, hitches, GPU memory all better), average fps unchanged, freezes remain |
| 3 | No change: traces of the scroll | same as CP-2 | | | | | | | diagnosis: the GPU draws 13 to 38 off-screen surfaces per frame inside the story (1 after it), and that stalls the main thread |
| 4 | All: hide the night's and the quest's threads while undrawn | 27.3 (19.8 to 30.1) | 7.5 fps | 83.1 ms | 19.9% | 60 | 2.8 s | 146 | keep: layers 211 → 146 at no visual cost. Fps **unclear** (runs overlap), surfaces per frame unchanged, freezes remain |
| 5 | No change: traces with one thing switched off at a time | same as CP-4 | | | | | | | diagnosis: the cards' surfaces come from two causes at once, the `preserve-3d` card and the rounded `overflow: hidden` clip. Each alone changes nothing. Both off: surfaces about halved, freezes 21 → 12, over 500 ms 11 → 1 |
| 6 | All: no rounded clip on the card insides. Phone-only: a card at rest is flat, 3D only while it turns | 40.1 (35.4 to 42.6) | 18.8 fps | 74.8 ms | 17% | 119 | 549 ms | 109 | **keep**: fps against cp4 21.9 (21.4 to 29.7) in the same session, ranges apart. No visual change (phone screenshots) |
| Ship rule | | 55 or more (45 acceptable) | 45 (30 acceptable) | 20 ms (33) | under 5% (15%) | 0 to 2 (10) | under 100 ms (200) | under 50 (100) | |

### [x] CP-0 Baseline (2026-11-18)

**Change**: none. The build at that moment is frozen as `perf/builds/baseline/` (= cp0).

**First measurement**: 1 run, in the comparison table at the end of this checkpoint.

Across all 6 baseline runs of the day: 15.3, 18.7, 19.4, 19.4, 25.2, 26.6 fps (median 19.4). Average fps by tenth of the page (1 = hero, 10 = final call), one typical run: 27.3 / 4.1 / 6.6 / 1.5 / 3.6 / 3.0 / **0.3** / 1.1 / 25.8 / 54.9.

**What measuring found:**
- **Standing still the page runs at a steady 60 fps.** After the pin (the last tenth) scrolling is smooth too (55 to 66 fps). The lag is **only inside the pinned 3D story** (tenths 2 to 8), with freezes of 1 to 3.4 seconds.
- **It is not JavaScript.** In a 22 s scroll the scripts ran about 1 s, yet long frames added up to about 18 s. The main thread spends its time waiting for the GPU.
- **Switch-off tests** (CSS added live on the baseline, 2 runs each, fps range): baseline 18.7 to 26.6, no grain 24.3 to 26.4, no glass blur 20.4 to 22.1, no silk 22.7 to 30.5, `will-change: auto` 16.5 to 21.1 (worse), all four 16.4 to 20.2. **None of them fixes the pinned story**: it stays at 1 to 15 fps whatever is turned off. Removing `will-change` makes it worse, so P4 is dropped.
- **Layers** (`--layers`): 200 at the top, 320 to 355 inside the story. Most of it is cards: 30 cards (the 10 real ones and 20 "extras") stay in the 3D scene for the whole page, each split into about 4 GPU layers (3D wrapper, front, back, face). Card fronts and backs alone are 58 to 70 megapixels of layers. Every full-screen layer (grain, silk, tints, sections) is only about 2.8 megapixels. The 20 extras are only on screen at the start (the drum, the wall, the deal), but they were hidden with `opacity: 0` only, which still costs the GPU.
- Results: `perf/results/2026-11-17-16-07-*` (first run), `2026-11-17-16-08-*` (switch-off tests), `2026-11-17-16-22-after-layers.json`.

| Measure | Smooth (ship) | Acceptable | Laggy | **Baseline** |
|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | **15.3** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | **0.4** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | **241 ms** |
| Dropped frames | < 5% | 5–15% | > 15% | **31%** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | **37** |
| GPU layers | < 50 | 50–100 | > 200 | **339** |
| GPU memory | < 50% of max | < 75% | near max | **76 MB** |

### [x] CP-1 Phone-only effects and the hidden extra cards (2026-11-18)

Four changes, made and measured together (before the one-step rule).

**Change:**
- `layout.mjs`: the boot script adds `html.lite` on phones and tablets (`(hover: none), (pointer: coarse)`). `?lite=1` or `?lite=0` forces it on or off for testing.
- `main.css`: with `lite`, no grain overlay, and the nav and music button use a near-solid colour (`--glass-solid`, light, dark and night versions) instead of `backdrop-filter: blur(18px)`.
- `shader.js`, `main.js`: with `lite`, the silk backdrop is still. No drift, does not follow the scroll, drawn only while the colours turn (light, dark, night).
- `cards.js`: the 20 extra cards get `visibility: hidden` whenever they are invisible (on every device, no visual change).

**Why:** the grain, the glass blur and the silk are redrawn over the whole screen every frame. The extras' 40 card faces cost the GPU even when invisible.

**Measured** (`--plan perf/plans/before-after.json --runs 3`, baseline against this build):

| | Avg fps (range) | p95 | Dropped | Hitches | Worst frame | Layers | GPU MB |
|---|---|---|---|---|---|---|---|
| before (cp0) | 19.4 (19.4 to 25.2) | 91.6 ms | 29.1% | 41 | 3318 ms | 362 | 74 |
| after (cp1) | 25.5 (20.7 to 40) | 74.9 ms | 20.9% | 55 | 3051 ms | 210 | 75 |

By tenth of the page, before: 27.3 / 4.1 / 6.6 / 1.5 / 3.6 / 3.0 / 0.3 / 1.1 / 25.8 / 54.9. After: 29.6 / 11.6 / 8.1 / 4.1 / 6.3 / 10.9 / 1.3 / 11.7 / 34.4 / 62.5.

Layers (`--layers`): 79 at the top (was 200), 177 to 213 inside the story (was 320 to 355). Card faces 19 to 23 megapixels (was 58 to 70). Around 10% of the page the wall still uses all 30 cards, which is right: that is where they are on screen.

**Verdict: keep, but unclear.** Better in every tenth and on layers, but the run ranges overlap the baseline's and the freezes of about 3 s remain. Something other than the layer count causes the freezes. The build was not frozen as cp1 (CP-2 was added to the source before it was measured), so CP-2 is compared with cp0 and with these numbers.

Results: `perf/results/2026-11-17-16-22-*`.

| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | **CP1** |
|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | **25.5** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | **1.3** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | **74.9 ms** |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | **20.9%** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | **55** |
| GPU layers | < 50 | 50–100 | > 200 | 339 | **210** |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | **75 MB** |

### [x] CP-2 Tighter card shadow on phones (2026-11-18)

**Change:** `main.css`, with `lite`, the hero cards' faces use `0 16px 22px -12px` (dark: `0 18px 24px -12px`) instead of the wide `0 40px 60px -30px` (dark: `0 50px 70px -30px`).

**Why:** a phone hero card is about 148 CSS px wide, but its layers were about 268 x 342 px: the soft shadow more than doubles the area painted for every card face, front and back.

**Measured** (`--before perf/builds/baseline --after dist --runs 3`; there was no cp1 build to compare with, so "after" is CP-1 and CP-2 together, against the baseline):

| | Avg fps (range) | p95 | Dropped | Hitches | Worst frame | Layers | GPU MB |
|---|---|---|---|---|---|---|---|
| before (cp0) | 22.8 (15.7 to 23.9) | 108 ms | 22.1% | 58 | 2993 ms | 351 | 78 |
| after (cp2) | 21.3 (19.4 to 30.2) | 58.2 ms | 16.6% | 38 | 3292 ms | 210 | 62 |
| CP-1 for comparison | 25.5 (20.7 to 40) | 74.9 ms | 20.9% | 55 | 3051 ms | 210 | 75 |

Each run, before / after: 15.7 / 19.4, 23.9 / 21.3, 22.8 / 30.2 fps.
By tenth of the page, before: 18.2 / 6.5 / 7.0 / 6.3 / 4.1 / 4.6 / 1.6 / 11.2 / 25.4 / 65.8. After: 42.8 / 10.0 / 9.4 / 7.8 / 3.2 / 27.7 / **0.7** / 2.2 / 14.1 / 65.4.

Layers (`--layers` on cp2): the card faces fell as expected, from 9.7 to 5.3 megapixels for each of fronts and backs (19.4 → 10.6 in all) inside the story, and from 58 to 32 at the wall (10% of the page). The layer count stays 177 to 213 (the shadow changes size, not count). The biggest single item from 70% of the page on is now `button.slot` (the 10 cards' glow shadows in the later chapters, 8.8 megapixels).

**Verdict: keep.** Frames are steadier than at CP-1: p95 75 → 58 ms, dropped 20.9 → 16.6%, hitches 55 → 38, GPU memory 75 → 62 MB. The average frame rate did not improve (21.3 against 25.5, within the run-to-run spread; the baseline itself ran 15.7 to 23.9 this session). **The freezes of about 3 s are unchanged, and tenth 7 is still the worst (0.7 fps).** The average is dominated by those freezes, so they are the next target: CP-3.

Frozen as `perf/builds/cp2/`. Results: `perf/results/2026-11-18-11-03-*`.

| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | CP1 | **CP2** |
|---|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | 25.5 | **21.3** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | 1.3 | **0.7** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | 74.9 ms | **58.2 ms** |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | 20.9% | **16.6%** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | 55 | **38** |
| GPU layers | < 50 | 50–100 | > 200 | 339 | 210 | **210** |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | 75 MB | **62 MB** |

### [x] CP-3 Find the cause of the freezes (no code change, 2026-11-18)

**Do:** `node scripts/perf-phone.mjs --label cp2 --dir perf/builds/cp2 --trace`, and `--layers` for the elements. Three full-scroll traces of cp2 (the last two with scroll markers), plus the owner's own 10.6 s DevTools recording of the dev build.

**The script had to be fixed first** (the first `--trace` attempts never finished): while the phone traces, the page's DevTools connection stops answering, so the `scrollY` check hung and nothing scrolled. A full-page trace is also over 400 MB, more than Node can hold as one string. Now the trace scrolls a fixed number of batches, the page writes scroll markers into the trace, and the file is streamed to disk and read back event by event (see "The measurement script").

**Result: the GPU is drawing too many off-screen surfaces every frame inside the pinned story.**

- **Off-screen surfaces ("render passes").** An element with a `filter`, `mix-blend-mode`, `clip-path` on a layer, a 3D context or a group `opacity` is drawn into its own off-screen buffer first, then composited. Inside the story the phone draws **13 to 38 of these per frame on average (up to 46)**. After the pin it draws **1**.
- **That is most of the GPU's time.** Drawing those surfaces takes **40 to 66% of all the time** inside the story, against **5% after the pin**. In the first trace the GPU process main thread was busy 33 s of a 60 s scroll: compositing surfaces 12.1 s, swapping 6.3 s, and rastering tiles only about 2.7 s. Raster and compositing share that one GPU thread, so when it is behind, both wait.
- **What a freeze is.** A freeze is the page's main thread going over 200 ms without an animation frame, so the GSAP-driven pinned scenes stop moving. The clean trace has **18 freezes, all inside the story** (longest 3.5 s at 3%, then 2.3 s at 39%, 2.2 s at 55%, 1.7 s at 65%), and **none after the pin**. During every one the GPU was drawing surfaces 52 to 71% of the time. In most of them the main thread was **idle** (2 to 8% busy): the compositor held back new frames because the GPU had not finished the last ones. In the rest it was **stuck in Commit** for 100 to 943 ms, waiting for that same compositor. Either way the cause is the GPU, not JavaScript.
- **Ruled out.** **Image decoding (P7) is not a cause:** 27 to 31 decodes per scroll, longest 23 to 62 ms, about 250 ms in all. **JavaScript is not the cause either:** animation frame callbacks are about 4.4 s of a 60 s scroll, and the owner's DevTools recording shows the main thread busy only 1.6 s of 10.6 s.
- **Small main-thread items** (from the owner's recording, worth a later checkpoint, not the freezes): `cards.js:161` reads `window.scrollY` in every tick, which forces a style recalc after other modules write styles (219 ms of 10.6 s). There are also `getBoundingClientRect` (114 ms) and `clientWidth` (61 ms) reads inside frame loops (`night.js:101`, `seats.js`), plus hit testing (104 ms).

Per tenth of the page (clean trace `2026-11-18-13-24-cp2-trace.json`):

| Tenth | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Surfaces per frame (avg) | 21.7 | **38.3** | 12.7 | 20.0 | 15.2 | 16.6 | 21.8 | 16.8 | 17.3 | 1.2 |
| GPU time drawing them | 66% | 66% | 41% | 59% | 40% | 52% | 61% | 49% | 40% | 5% |
| Main-thread freezes > 200 ms | 3 | 1 | 2 | 4 | 1 | 2 | 2 | 1 | 2 | 0 |

**Which elements make the surfaces** (`--layers`, visible elements only, those under a parent at `opacity: 0` left out):

| Where | Count | Main ones |
|---|---|---|
| 0% hero | 34 | 10 `button.slot` (opacity group), 10 `div.card-3d` (3D), 8 `*-static` chapter blocks (`clip-path`), `.vh` text (`clip-path`) |
| 10% wall | 43 | **30 `div.card-3d`** (3D, all the extras on screen), the 8 `*-static` blocks |
| 20 to 80% | 54 to 85 | **15 to 16 `i.sh` thread shadows (`filter: blur`) and 15 to 16 `div.thr` threads (3D), in every chapter from the night on**, 10 `div.card-3d`; at 30% also 10 `div.eye-in` and 16 `i.gf` (`clip-path`), 9 `i.seam` (`drop-shadow`); 40 to 60% 10 `i.cf` (`clip-path`); 70 to 80% 6 `img.bl-ghost` (`mix-blend-mode: screen`) |
| 90% after the pin | 6 | text only |

The threads and their blurred shadows count as visible in every later chapter. There are three sets (the night's in `night.js`, then `x-thrs` sets in `quest.js` and `lady.js`), all hidden only by `scaleX(0)`. Whether any need to stay on screen there is a design question for the owner.

Results: `perf/results/2026-11-18-13-08-cp2-trace.json` (no markers), `2026-11-18-13-17-cp2-trace.json` (markers, but with one 4.6 s gap caused by the old script waiting, not by the page), `2026-11-18-13-24-cp2-trace.json` (clean), `2026-11-18-13-23-cp2-surfaces-layers.json`. Each trace is about 420 MB: open it in Chrome DevTools > Performance > Load profile, or summarise it with `--read-trace`.

| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | CP1 | CP2 | **CP3** |
|---|---|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | 25.5 | 21.3 | **21.3 (no change)** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | 1.3 | 0.7 | **0.7 (no change)** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | 74.9 ms | 58.2 ms | **58.2 ms (no change)** |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | 20.9% | 16.6% | **16.6% (no change)** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | 55 | 38 | **38 (no change)** |
| GPU layers | < 50 | 50–100 | > 200 | 339 | 210 | 210 | **210 (no change)** |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | 75 MB | 62 MB | **62 MB (no change)** |

### [x] CP-4 Hide the undrawn threads (2026-11-18)

**Change** (all devices, no visual change): `night.js` and `quest.js` set `visibility: hidden` on each thread (`.thr`) while its drawn value is 0 (`scaleX(0)`), and clear it as soon as it draws. The threads also start hidden in the markup, so they are hidden before the first frame. `lady.js` `lineSet` (the lady's and the climb's lines) already did this. The hidden value is `''`, not `'visible'`, so a thread never shows through a hidden parent.

**Why:** the CP-3 element scan counted 15 thread shadows (`filter: blur`) and 15 threads (3D) as off-screen surfaces in every tenth from 20% to 80%. Those were the night's and the quest's sets, left in the 3D scene at `scaleX(0)` after their chapter.

**Measured** (`--before perf/builds/cp2 --after dist --runs 3 --port 4880`; CP-3 changed no code, so "before" is cp2):

| | Avg fps (range) | p95 | Dropped | Hitches | Worst frame | Layers | GPU MB |
|---|---|---|---|---|---|---|---|
| before (cp2) | 21.6 (19.8 to 24.3) | 99.7 ms | 24.2% | 63 | 2768 ms | 211 | 66 |
| after (cp4) | 27.3 (19.8 to 30.1) | 83.1 ms | 19.9% | 60 | 2768 ms | 146 | 68 |

Each run, before / after: 21.6 / 27.3, 24.3 / 19.8, 19.8 / 30.1 fps.
By tenth of the page, before: 28.4 / 14.3 / 19.1 / 9.5 / 10.2 / 9.5 / 6.8 / 10.1 / 22.8 / 57.2. After: 37.0 / 13.0 / 9.6 / 13.5 / 11.4 / 19.4 / **7.5** / 8.2 / 35.5 / 64.7.

The cp2 runs this session (p95 99.7 ms, 63 hitches) were worse than the cp2 runs at CP-2 (58.2 ms, 38). That is run-to-run noise (heat, battery), so compare columns measured in the same session.

**Trace** (`--label cp4 --dir dist --trace`, against the CP-3 trace of cp2):

| Tenth | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Surfaces per frame, CP-3 (cp2) | 21.7 | 38.3 | 12.7 | 20.0 | 15.2 | 16.6 | 21.8 | 16.8 | 17.3 | 1.2 |
| Surfaces per frame, **CP-4** | 21.7 | **41.0** | 15.9 | 18.3 | 21.0 | 18.2 | 21.5 | 22.6 | 15.5 | 2.3 |
| GPU time drawing them, CP-4 | 67% | 68% | 41% | 48% | 59% | 61% | 63% | 57% | 44% | 8% |
| Main-thread freezes > 200 ms, CP-4 | 2 | 1 | 4 | 1 | 5 | 3 | 1 | 4 | 1 | 1 |

23 freezes in all (CP-3: 18), longest 3.2 s at 12%, 2.7 s at 3%, 1.7 s at 46%. During them the GPU was drawing surfaces 63 to 73% of the time, as at CP-3.

**Layers** (`--layers` on cp4): the threads are gone from the element scan everywhere except 50% (the lady's lines, which are on screen there). Surface candidates in the scan fell, e.g. 20%: 54 → 24, 40%: 66 → 36, 80%: 70 → 40.

**What this shows: the element scan overcounts.** The scan's candidates fell by about 30 per position, but the real surfaces per frame in the trace did not move. Chrome makes no off-screen surface for an element that draws nothing, and a thread at `scaleX(0)` draws nothing. It still cost a GPU layer (hence 211 → 146), but not a surface. So the scan only lists *candidates*. A candidate only counts once a trace shows the surfaces fall without it.

**What the real surfaces likely are** (to be confirmed by trace in CP-5): the counts follow what is actually drawn. Tenth 2 (41 per frame) is the wall, with all 30 cards in 3D (30 `div.card-3d` plus about 11 others). In every other story tenth, 16 to 23 per frame matches the 10 `div.card-3d` that stay on screen all the way through, plus the 8 `*-static` `clip-path` blocks and the `.vh` text. After the pin both are gone, and the count is 1 to 2.

**Verdict: keep.** Layers 211 → 146 (a ship-table measure) at no visual cost and no code risk. The fps median went up (21.6 → 27.3), but the runs overlap, so that part is **unclear**. The surfaces and the freezes are unchanged: **this did not touch the cause of the freezes.**

Frozen as `perf/builds/cp4/`. Results: `perf/results/2026-11-18-13-36-*` (runs), `2026-11-18-13-41-cp4-trace.json`, `2026-11-18-13-44-cp4-layers.json`.

| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | CP1 | CP2 | CP3 | **CP4** |
|---|---|---|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | 25.5 | 21.3 | 21.3 (no change) | **27.3** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | 1.3 | 0.7 | 0.7 (no change) | **7.5** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | 74.9 ms | 58.2 ms | 58.2 ms (no change) | **83.1 ms** |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | 20.9% | 16.6% | 16.6% (no change) | **19.9%** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | 55 | 38 | 38 (no change) | **60** |
| GPU layers | < 50 | 50–100 | > 200 | 339 | 210 | 210 | 210 (no change) | **146** |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | 75 MB | 62 MB | 62 MB (no change) | **68 MB** |

(p95, dropped and freezes look worse than the CP2 column only because this session ran slower: against cp2 measured in the same session, every one of them improved. See the first table.)

### [x] CP-5 Find what really draws the surfaces (no code change, 2026-11-18)

**Do:** trace cp4 with one thing switched off at a time, like CP-0's switch-off tests but with `--trace`, because the surface count is steady where fps is not. The CSS is injected after the intro. One trace per variant, all in one session, plus a **control** (cp4 with nothing switched off) so every row compares with a trace from the same session:
`node scripts/perf-phone.mjs --plan perf/plans/cp5-switch-offs.json --trace --port 4880` (then `-2`, `-3`, `-4`; each later plan was chosen from the one before). The switch-offs can look wrong (flat cards lose their backs). They find the cost. They are not fixes.

**Noise:** the control against the CP-4 trace of the same build differs by up to 5 surfaces in a tenth (tenth 4: 13.4 against 18.3). So below, a change under about 6 is noise.

Surfaces (render passes) per frame, by tenth of the page (– = no scroll markers in that tenth):

| Switched off (CSS) | 1 | 2 wall | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Freezes > 200 ms | of them > 500 ms | Longest |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **nothing (control)** | 20.5 | 37.6 | 12.6 | 13.4 | 21.1 | 21.0 | 20.0 | 22.9 | 15.1 | 1.7 | 21 | 11 | 2.6 s |
| flat cards `.card-3d{transform-style:flat}` | 16.9 | **15.9** | 18.5 | 20.6 | 27.7 | 22.0 | – | 20.0 | 12.5 | 2.1 | 19 | 12+ | 2.6 s |
| no clip-path `[class*=-static],.vh` | 23.7 | 41.0 | 19.3 | 18.7 | 26.2 | 21.4 | 24.4 | 21.6 | 16.6 | 1.4 | 22 | 12+ | 2.4 s |
| slot without `will-change: opacity` | 21.6 | 40.5 | 12.9 | 18.6 | 21.3 | 18.2 | 23.3 | 16.5 | 15.2 | 1.5 | 23 | 8 | 3.2 s |
| slot at `opacity: 1` | 21.7 | 40.2 | 20.3 | 13.8 | 20.5 | 17.0 | 18.8 | 25.0 | 14.7 | 5.3 | 23 | 10 | 2.9 s |
| flat cards + slot at `opacity: 1` | 17.1 | 16.3 | 20.1 | 16.7 | 18.0 | 19.8 | 27.8 | 20.6 | 13.1 | 3.5 | 21 | 12+ | 2.9 s |
| flat ring `.ring{transform-style:flat}` | 22.2 | 26.9 | 17.9 | 22.1 | 19.0 | 24.6 | 21.4 | 18.9 | 15.2 | 10.6 | 21 | 12+ | 3.1 s |
| flat ring + flat cards | 21.8 | 14.2 | 17.0 | 13.5 | 21.6 | 18.2 | 19.1 | 14.7 | 14.9 | 3.0 | 17 | 10 | 2.7 s |
| square card insides `.card .in{border-radius:0}` | 21.4 | 29.0 | 15.2 | 15.6 | 23.2 | 18.1 | 24.0 | – | 10.8 | 3.1 | 21 | 12+ | 3.3 s |
| **flat cards + square card insides** | **11.5** | **15.5** | **6.8** | **6.3** | 14.1 | **9.2** | 13.0 | 20.0 | **4.6** | 1.7 | **12** | **1** | 2.8 s (next 437 ms) |
| no cards at all `.slot,.slot *{visibility:hidden}` | 1.2 | 1.3 | 4.3 | 8.2 | 15.2 | 8.8 | 10.5 | 5.0 | 1.3 | 1.2 | 6 | 1 | 0.7 s |

("12+": the summary lists the 12 longest freezes, and all 12 were over 500 ms.)

**Result: the ten story cards make most of the surfaces and nearly all the long freezes, and only removing both of their two causes helps.**

- **The cards are the cost.** Hiding the ten slots (the bottom row, an upper bound) drops the story to 1 to 15 surfaces per frame, the GPU's drawing share to 6 to 40% (control: 39 to 68%), and the freezes to 6, with none over 711 ms.
- **Each card has two causes, and either one is enough to give it its surfaces.** Flattening the card's 3D (`.card-3d`, `preserve-3d`) alone, or squaring the rounded clip alone, changes nothing outside the wall. Both together: 4.6 to 14 surfaces in most story tenths, the GPU's drawing share 19 to 46%, freezes 21 → 12, and **over 500 ms 11 → 1**, close to the no-cards bound.
  - The 3D cause: `.card-3d` is a `preserve-3d` context inside a flat `.card`, so Chrome draws each card's faces into a surface before placing it.
  - The clip cause: `.card .in` has `overflow: hidden` with `border-radius`, and inside it `.face` (the name strip) is its own GPU layer. A rounded clip around more than one GPU layer needs a mask surface.
- **At the wall (tenth 2) the 3D alone is the cost**: flat cards 37.6 → 15.9, with or without the other switch-offs. That is the 20 extras' 3D contexts.
- **Ruled out:** the `*-static` and `.vh` `clip-path` (1 px screen-reader blocks, they draw nothing), the slot's opacity (forced to 1 or without `will-change`, no change), and the ring's own `preserve-3d` (no change outside the wall).
- **Left after the cards:** tenths 5 and 7 keep 10 to 15 surfaces with no cards at all. Those are the chapters' own effects (the CP-3 scan: thread shadows' `blur`, `i.seam` `drop-shadow`, `.gf`/`.cf` `clip-path`, `img.bl-ghost` blend). Tenth 8 keeps 20 with both causes off but 5 with no cards, so something else on the cards costs there (likely the `button.slot` glow shadows from CP-2's scan).

Results: `perf/results/2026-11-18-13-52-cp5-*-trace.json` (control, flat cards, no clip, slot without will-change opacity, no cards), `2026-11-18-14-04-*` (opacity 1, flat + opacity 1), `2026-11-18-14-08-*` (flat ring, flat ring + cards), `2026-11-18-14-12-*` (square insides, flat + square insides). Plans: `perf/plans/cp5-switch-offs.json` to `cp5-switch-offs-4.json`. The phone was at 39 to 42 °C, which moves fps but not the surface count.

| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | CP1 | CP2 | CP3 | CP4 | **CP5** |
|---|---|---|---|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | 25.5 | 21.3 | 21.3 (no change) | 27.3 | **27.3 (no change)** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | 1.3 | 0.7 | 0.7 (no change) | 7.5 | **7.5 (no change)** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | 74.9 ms | 58.2 ms | 58.2 ms (no change) | 83.1 ms | **83.1 ms (no change)** |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | 20.9% | 16.6% | 16.6% (no change) | 19.9% | **19.9% (no change)** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | 55 | 38 | 38 (no change) | 60 | **60 (no change)** |
| GPU layers | < 50 | 50–100 | > 200 | 339 | 210 | 210 | 210 (no change) | 146 | **146 (no change)** |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | 75 MB | 62 MB | 62 MB (no change) | 68 MB | **68 MB (no change)** |

### [x] CP-6 Take both causes off the cards (2026-11-18)

One change, because CP-5 showed each cause alone measures as nothing.

**Change:**
- **The rounded clip** (all devices, no visual change): `main.css`, `.card .in` no longer has `overflow: hidden`. The parts that fill it round themselves with `border-radius: inherit`: the painting (`.card .in img`), the name strip (`.face`), the blade's ghost painting (`.bl-ghost`) and Merlin's cracks (`.bl-crack`). The night's eye glow (`.eye-glow`, inset −35%) fades to transparent before the card edge, so nothing shows outside the card.
- **The 3D** (phones only, under `html.lite`, owner's choice; desktop unchanged): `cards.js` sets `data-face="front"` or `"back"` on a story card's `.card-3d` while its flip is exactly 0 or 1, and removes it while the card turns. `main.css`: with `data-face`, `.card-3d` is `transform-style: flat` with no transform, both sides have no transform and no `backface-visibility`, and the face that is down is `visibility: hidden`. While a card turns it gets its real 3D back, so the turn looks as before (owner's choice over a 2D squash flip). The 20 extras never turn, so they are flat the whole time.

**Why:** CP-5: each card made off-screen surfaces from two causes at once, its `preserve-3d` context and the rounded clip around its name strip's GPU layer.

**The "past 90°" question from CP-5 does not arise.** The slot (`.slot`) has no `preserve-3d`, so it already flattens the whole card into its own plane, and the card's 3D lives only inside `.card-3d`. A resting card drew exactly the same picture before. Checked on the phone: screenshots of cp4 and cp6 at 12 points (2% to 80%: ring, drum, wall, deal, night, vote, quest, water, Lady, blade) match, the up face is right at each (all back, all front, Merlin alone up at 30%, mixed at the blade), and full-resolution crops of the wall's corners are identical.

**Measured** (`--before perf/builds/cp4 --after dist --runs 3 --port 4880`):

| | Avg fps (range) | p95 | Dropped | Hitches | Worst frame | Layers | GPU MB |
|---|---|---|---|---|---|---|---|
| before (cp4) | 21.9 (21.4 to 29.7) | 99.8 ms | 18.4% | 61 | 3175 ms | 175 | 77 |
| after (cp6) | 40.1 (35.4 to 42.6) | 74.8 ms | 17% | 119 | 549 ms | 109 | 88 |

Each run, before / after: 29.7 / 42.6, 21.9 / 40.1, 21.4 / 35.4 fps.
By tenth of the page, before: 25.9 / 18.7 / 10.3 / 14.0 / 12.7 / 6.2 / 9.3 / 13.4 / 12.1 / 64.1. After: 51.3 / 44.5 / 28.2 / 23.4 / 20.4 / 25.7 / **18.8** / 23.5 / 45.0 / 73.3.

**Hitches went up (61 → 119) while the worst frame fell 3175 → 549 ms.** A hitch is one frame over 50 ms, so one 3 s freeze counted once. Now that the freezes are broken up, the story draws many more frames, and more of them land between 50 and 100 ms. GPU memory went up 77 → 88 MB (flat cards at rest keep their faces in fewer, larger layers). Both are worth watching, not a reason to revert.

**Trace** (`--label cp6 --dir dist --trace`), surfaces per frame against the CP-4 trace:

| Tenth | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Surfaces per frame, CP-4 | 21.7 | 41.0 | 15.9 | 18.3 | 21.0 | 18.2 | 21.5 | 22.6 | 15.5 | 2.3 |
| Surfaces per frame, **CP-6** | **12.7** | **15.5** | **5.3** | **6.4** | 12.1 | 10.7 | 9.6 | 14.4 | **1.1** | 1.6 |
| GPU time drawing them, CP-6 | 33% | 37% | 18% | 21% | 39% | 38% | 30% | **53%** | 10% | 8% |
| Main-thread freezes > 200 ms, CP-6 | 2 | 1 | 3 | 5 | 3 | 3 | 3 | 3 | 0 | 0 |

This matches CP-5's "flat cards + square card insides" row. 23 freezes over 200 ms (CP-4: 23), but now short: **3 over 500 ms** (CP-5 control: 11), longest **1457 ms and 572 ms, both at 70% of the page** (tenth 8, GPU drawing surfaces 69% of the time), then 536 ms at 39%, 469 ms at 57%. Tenth 8 is the one CP-5 flagged: it keeps 14 surfaces and the highest GPU share.

**Verdict: keep.** The first checkpoint whose runs do not overlap the one before: average fps 21.9 → 40.1, every tenth better, worst frame 3.2 s → 0.55 s, layers 175 → 109, at no visual change. Not yet at the ship rule: the average is "laggy" (under 45) and tenths 3 to 8 are 19 to 28 fps.

`npm test`: 33 pass, 0 fail. Frozen as `perf/builds/cp6/`. Results: `perf/results/2026-11-18-14-28-*` (runs), `2026-11-18-14-37-cp6-trace.json`.

| Measure | Smooth (ship) | Acceptable | Laggy | Baseline | CP1 | CP2 | CP3 | CP4 | CP5 | **CP6** |
|---|---|---|---|---|---|---|---|---|---|---|
| Average fps while scrolling | ≥ 55 | 45–55 | < 45 | 15.3 | 25.5 | 21.3 | 21.3 (no change) | 27.3 | 27.3 (no change) | **40.1** |
| Worst tenth of the page | ≥ 45 fps | 30–45 | < 30 | 0.4 | 1.3 | 0.7 | 0.7 (no change) | 7.5 | 7.5 (no change) | **18.8** |
| p95 frame time | ≤ 20 ms | ≤ 33 ms | > 33 ms | 241 ms | 74.9 ms | 58.2 ms | 58.2 ms (no change) | 83.1 ms | 83.1 ms (no change) | **74.8 ms** |
| Dropped frames | < 5% | 5–15% | > 15% | 31% | 20.9% | 16.6% | 16.6% (no change) | 19.9% | 19.9% (no change) | **17%** |
| Freezes over 50 ms | 0–2 | ≤ 10 | > 10 | 37 | 55 | 38 | 38 (no change) | 60 | 60 (no change) | **119** |
| GPU layers | < 50 | 50–100 | > 200 | 339 | 210 | 210 | 210 (no change) | 146 | 146 (no change) | **109** |
| GPU memory | < 50% of max | < 75% | near max | 76 MB | 75 MB | 62 MB | 62 MB (no change) | 68 MB | 68 MB (no change) | **88 MB** |

(Freezes over 50 ms went up because the long freezes broke into many shorter frames, see above. The worst frame, 549 ms, is the measure that shows the freezes going.)

### [ ] CP-7 and on: tenth 8, then the chapters' own effects

Cheapest first:
- **Tenth 8 (70 to 80%) is now the worst place**: the two longest freezes (1.5 s, 0.6 s) are at 70%, 14 surfaces per frame and the GPU drawing them 53% of the time. CP-5 showed it keeps 20 surfaces with both card causes off against 5 with no cards, so something else on the cards costs there. Run `--layers` at 70 to 80% on cp6 and trace the `button.slot` glow shadows (`.ring.is-night .slot` `box-shadow`, `main.css`) and its `::after` grey veil switched off.
- **The chapters' own effects** (tenths 5 and 7, 10 to 15 surfaces with no cards). Prove each by a switch-off trace first, as here: the thread shadows' `blur` while drawn (`.thr .sh`, `main.css:288`, a soft gradient on phones), `i.seam` `drop-shadow`, the `.gf`/`.cf`/`.eye-in` `clip-path` (clear it once the reveal is done), `img.bl-ghost` `mix-blend-mode`.
- Small main-thread items: cache the scroll position once per tick (`cards.js:161`), no layout reads inside frame loops (`night.js:101`, `seats.js`).
- `ScrollTrigger.normalizeScroll(true)` on touch devices, if the pins jitter once the freezes are gone (P5).

Phone checks before each run: unlocked, Chrome in front, no `chrome://inspect` window open. Port 4870 is often taken by a leftover server: add `--port 4880`. A trace takes about 3 minutes and writes about 320 to 420 MB. A `--plan` file with `--trace` traces every variant in one go.

## Why only a real phone shows it

- **Hosting is not the cause.** The host only sends the files. Scrolling happens entirely in the phone's browser, so every host gives the same result.
- **DevTools mobile view is not a phone.** It changes the screen size and fakes touch, but the page still renders on the desktop graphics card. CPU throttling in DevTools slows JavaScript, but it does not slow the GPU.
- **A phone has a weak GPU and about 3 times as many pixels per CSS pixel** (device pixel ratio 2 to 3). Effects that cost almost nothing on a desktop, such as full-screen blends, blurs and big layers, are where a phone runs out of time each frame.

Measuring confirmed GPU and compositing work as the cause, inside the pinned 3D story (CP-0).

## Suspected causes (the first list, before measuring)

Kept for reference. CP-0 showed that P1 to P3 are small, P4 makes things worse, and the cards in the 3D scene are the big cost.

| # | Suspect | Where | Why it hurts on a phone | Fix to try | Measured |
|---|---|---|---|---|---|
| P1 | **Grain overlay above the whole page** | `main.css` `.grain`: `position:fixed; inset:0; z-index:40`, an SVG `feTurbulence` noise as background | A see-through layer the size of the screen, on top of everything | Hide it on touch devices, **or** a small PNG tile inside `.backdrop` | small gain. Done in CP-1 (phones) |
| P2 | **`backdrop-filter: blur(18px)` on fixed elements** | `main.css` `.nav`, `.music` | The blur is recalculated every frame while the content behind moves | On touch devices a near-solid glass colour | small gain. Done in CP-1 (phones) |
| P3 | **The WebGL silk backdrop redraws all the time** | `shader.js` `frame()` | A full-screen canvas drawn on every frame | Still on touch devices, drawn only while the colours turn | small gain. Done in CP-1 (phones) |
| P4 | **Permanent `will-change` layers** | `main.css`: `.slot`, `.table`, `.st-card`, `.bl-dag`, `.c-motes i`, `.q-fly`, `.night-say .ns`, `.sn-t`, `.btn` | Each keeps a GPU layer | Remove them | **worse** without them. Dropped |
| P5 | **Pinned story scenes during native touch scrolling** | `motion.js`, `cards.js` (`pin:true`), the chapters | Pins updated from JavaScript can fall out of step with touch scrolling | `ScrollTrigger.normalizeScroll(true)` on touch devices, only if pins still jitter | not yet |
| P6 | **Other heavy effects inside chapters** | `.thr .sh` (`filter: blur`), `.bl-ghost` (`mix-blend-mode: screen`), the 3D card scenes, `water.js`, `runner.js` | Together they can push a chapter over budget | Fix what the profile shows | the 3D cards were the big one (CP-1). The rest: not yet |
| P7 | **Image decoding during scroll** | Card paintings and large WebP files | Decoding mid-scroll drops frames | Only if the trace shows it | **not a cause** (CP-3: about 30 decodes per scroll, about 250 ms in all) |

Fallback warning: `?webgl=off` switches to the CSS silk, which uses `filter: blur(60px)` on layers 140% of the screen size (`.silk`). On a phone that fallback may be as slow as the shader or slower.

## How to test on a phone over USB

### Android phone with Chrome (works from Windows)

1. **Turn on Developer options on the phone.** Settings > About phone > tap **Build number** 7 times. On Samsung: Settings > About phone > Software information > Build number. On Xiaomi: tap **MIUI version** or **OS version**.
2. **Turn on USB debugging.** Settings > Developer options (sometimes under System) > **USB debugging** on. On Honor, also **Allow ADB debugging in charge only mode**.
3. **Plug the phone into the PC** with a cable that carries data (some cables only charge). If Windows does not see the phone, install your phone maker's USB driver (Samsung: "Samsung Android USB Driver").
4. **Allow the computer.** The phone asks "Allow USB debugging?". Tick "Always allow from this computer" and tap Allow. Chrome and `adb` each use their own key, so the question can come twice. Without "Always allow" it comes back after every re-plug.
5. **On the PC**, open Chrome (or Edge) and go to `chrome://inspect/#devices` (Edge: `edge://inspect/#devices`). Make sure **Discover USB devices** is ticked. The phone's model name appears. "Offline, pending authentication" means step 4 is not done yet.
6. **On the phone**, open the site in Chrome (the live Cloudflare or cPanel URL is fine).
7. **On the PC**, the open tab appears under the phone's name. Click **inspect**. A DevTools window opens and controls the page running **on the phone**.
8. **Turn off the screen mirror** (the phone icon at the top left of that DevTools window) while measuring. Mirroring the screen costs the phone performance and makes the results worse.

`adb` is in the Android SDK: `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`. `adb devices` should show the phone as `device` (not `unauthorized`).

**If the phone does not show in `chrome://inspect`:** the measuring script runs `adb`, and on Windows `adb` holds the USB connection, so Chrome's own USB search cannot reach the phone. Go through `adb` instead (this works alongside the script):

1. `adb devices` must say `device`. If it says `unauthorized`, unlock the phone and allow the popup with **Always allow** ticked.
2. `adb forward tcp:9333 localabstract:chrome_devtools_remote` (Chrome on the phone must be open).
3. In `chrome://inspect/#devices` on the PC: tick **Discover network targets**, click **Configure...**, add `localhost:9333`, click **Done**.
4. The phone's tabs appear under **Remote Target #LOCALHOST**. Click **inspect** under the tab.

The other way: `adb kill-server`, unplug and re-plug, and Chrome's own USB search finds the phone (it asks to allow the computer once more). The measuring script starts `adb` again when it runs.

### What to look at by hand

- **Live frame rate:** DevTools menu (⋮) > More tools > **Rendering** > tick **Frame Rendering Stats**. A frame meter appears on the phone's screen.
- **Also in Rendering:** **Paint flashing**, **Layer borders**, **Highlight scroll performance issues**.
- **A recording:** **Performance** panel > record > scroll one chapter on the phone for 5 to 10 seconds > stop. Look at Frames (red or yellow = dropped), Main (yellow = JavaScript, purple or green = layout or paint), GPU (busy all the time = the GPU is the limit), and the Summary tab.
- **Layers:** ⋮ > More tools > **Layers**.
- **Switching things off live:** in **Elements** > **Styles**, click **+** and add a rule, for example `.grain { display: none !important; }`. It applies on the phone at once and goes on reload. Address switches: `?motion=off`, `?webgl=off`, `?lite=1`, `?lite=0`.

### iPhone

- Safari's Web Inspector for an iPhone needs a **Mac**: on the iPhone, Settings > Apps > Safari > Advanced > **Web Inspector** on. Plug it into the Mac, then in Safari on the Mac: Develop menu > [your iPhone] > the page.
- **From Windows** there is no free official tool. Options: borrow a Mac, a paid tool such as inspect.dev, or test by feel.
- If the Android tests find the cause, the same fixes will almost always help iPhones too.

## What counts as smooth (pass thresholds)

The phone's screen draws a new picture every 16.7 ms at 60 Hz (8.3 ms at 120 Hz). A frame that takes longer is a dropped frame, and the eye sees it as a stutter. Measured while scrolling, through the whole page:

| Measure | Smooth (ship) | Acceptable | Laggy (do not ship) |
|---|---|---|---|
| Average frame rate while scrolling | 55 fps or more (90% of the screen's rate) | 45 to 55 fps | under 45 fps |
| Worst tenth of the page (avg fps) | 45 fps or more | 30 to 45 fps | under 30 fps |
| p95 frame time (95% of frames are faster) | 20 ms or less | 33 ms or less | over 33 ms |
| Dropped frames (longer than 1.5 screen frames) | under 5% | 5 to 15% | over 15% |
| Hitches over 50 ms, whole scroll | 0 to 2 | up to 10 | more than 10 |
| Worst single frame | under 100 ms | under 200 ms | over 200 ms (a visible freeze) |
| GPU layers (Layers panel) | under 50 | 50 to 100 | over 200 |
| GPU memory | under half of the "max" shown by Frame Rendering Stats | under 75% of max | near max (the browser starts throwing tiles away: blank patches while scrolling) |

The GPU memory the script reports (`dumpsys meminfo`, the Chrome GPU process "Graphics" line) has no fixed limit. Use it to compare before and after: it should go down, or at least not go up.

**Ship rule:** the "after" build must reach at least **Acceptable** in every tenth of the page, and its median must beat the "before" median, with the two ranges of runs not overlapping. One run alone is not proof: heat, battery and background apps move the numbers by a few fps.

## The measurement script

`scripts/perf-phone.mjs` scrolls the page on the phone by itself and records every frame, so before and after are measured the same way.

- It serves a built folder from the PC to the phone through the USB cable (`adb reverse`, port 4870 and up, because Windows often reserves 8080), opens it in Chrome with an Android intent, waits for the intro, records 3 s standing still (gives the screen's refresh rate), then scrolls top to bottom with real finger swipes (`adb shell input swipe`, 6 per batch). Every animation frame's time and scroll position is recorded in the page. GPU memory and the layer count are read between batches, not while recording.
- `--trace`: while Chrome on the phone is tracing, nothing answers DevTools (not even `scrollY`), so the trace scrolls a fixed number of swipe batches (page height / 1800 + 3) and the page writes its scroll position into the trace four times a second (`console.timeStamp`). The trace is streamed to disk (about 400 MB for one scroll, too big for one Node string) and read back event by event. The summary gives, per tenth of the page, frames drawn, off-screen surfaces (render passes) per frame and the GPU's share of time drawing them, then the main-thread freezes (over 200 ms with no animation frame) and the long commits. A gap in *drawn* frames is not counted as a freeze: a page standing still draws nothing.
- Builds: `perf/builds/baseline/` (= cp0), then `perf/builds/cp<N>/` per kept checkpoint. Not in git. Results go to `perf/results/` (one JSON per run and a `-summary.md` per session, named by the UTC time).

```
npm run build
node scripts/perf-phone.mjs --before perf/builds/cp1 --after dist --runs 3    # a checkpoint against the one before
node scripts/perf-phone.mjs --label cp2 --dir dist --layers                    # which elements own the GPU layers, and which need an off-screen surface
node scripts/perf-phone.mjs --label cp2 --dir dist --trace                     # a Chrome trace of one full scroll, summarised by tenth of the page
node scripts/perf-phone.mjs --read-trace perf/results/<file>-trace.json        # the same summary again from a saved trace
node scripts/perf-phone.mjs --plan perf/plans/experiments.json --runs 2       # the CSS switch-off tests on the baseline
node scripts/perf-phone.mjs --label live --url https://your-site/ --runs 3    # the live site
```

## Still open

- [ ] Reach the ship rule on the Honor X9b (tracker above)
- [ ] Owner's look on a phone: no grain, a solid nav pill instead of frosted glass, a still silk backdrop, tighter card shadows (all phone-only, desktop unchanged)
- [ ] Check on an iPhone (needs a Mac, or test by feel)
- [x] `npm test` after CP-1 and CP-2 (2026-11-18: 33 pass, 0 fail), after CP-4 (2026-11-18: 33 pass, 0 fail), and after CP-6 (2026-11-18: 33 pass, 0 fail)
- [ ] This also covers AC-14 in spec 0001 (frame rate on a mid range phone) and the phone frame rate checks left open in chapters 2 to 8
