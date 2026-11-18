# 012 Background music

**Status**: built and checked in desktop Chrome 2026-11-17. Not yet checked on a real iPhone or Android phone.
**Code**: `src/js/music.js`, `scripts/build.mjs` (`buildAudio`), `src/templates/parts.mjs` (`nav`, the `.music` button), `src/styles/main.css` (`.music`, and the phone rules after `max-width:380px`), `src/i18n/*.json` (`a11y.musicOn`, `a11y.musicOff`)
**Source file**: `src/assets/audio/adventure-source.m4a` (the full 4:36 track, kept so the build does not depend on the owner's Videos folder)

## Decisions made

| # | Decision | Why / who |
|---|---|---|
| 1 | The site plays one **60 second loop**: the first 60 seconds of the source track. | Owner's request |
| 2 | `npm run build` cuts and compresses it with **ffmpeg** to `dist/assets/audio/adventure.m4a` (96 kbps AAC, stereo, about 720 KB). It rebuilds only when the source or `build.mjs` changes. | Owner asked for the music to be minified by the build script. **ffmpeg must be on PATH**, or set `FFMPEG_PATH`; the build stops with a clear message if it is missing |
| 3 | **Fade in** about 2 s at the start of every loop. **Fade out** from 57 s to 60 s, so it is silent when the loop ends. Then it starts again from 0. | Owner's request. Done in code (not the `loop` attribute) so every pass fades in |
| 4 | **Loudest volume 0.35.** Volume goes through a Web Audio gain node, because iOS ignores `audio.volume`. | Keeps it a background bed under the story |
| 5 | **It starts by itself 3 seconds after the page has fully loaded** (the `load` event, plus 3 s). Browsers often refuse sound without a user action, so a refused try changes nothing and the page waits for the next action. | Owner's request (2026-11-17) |
| 6 | **Any action starts it if it has not started yet**: click, tap, key press, scroll, wheel turn. Each try that is refused leaves the listeners on, so the next action tries again. Once it plays, the listeners are removed. | Owner's request (2026-11-17), first asked for the first interaction |
| 7 | A **speaker button in the top-right corner** turns the music on or off, on desktop, tablet and phone. Off fades out over 0.4 s then pauses. On restarts from 0 with a fade-in. | Owner's request |
| 8 | The choice is remembered in `localStorage` (`avalon-music`). If the visitor turned it off, the music stays off on later visits and nothing starts by itself. | Respect the visitor's choice |
| 9 | Before the music has started, the button shows "on". Tapping it then starts the music (it does not switch to off). | The icon should not lie |
| 10 | Phone (560px and below): the nav pill moves to the left and gets smaller so the button fits. Below 350px the "Avalon" word in the pill is hidden. | The pill was almost full width |
| 11 | The music pauses while the tab is hidden and resumes when it is shown again. Reduced motion: the fades are shorter (0.6 s in, 0.15 s button off). | Courtesy, AC-13 |

## Browser rules to know

- **Autoplay is the browser's choice.** Chrome and Safari usually refuse sound until the visitor clicks, taps or presses a key. In that case the 3 second try is refused and the music starts on the first click, tap or key press instead.
- **Scrolling alone does not count as a user action for the browser.** A wheel turn or a touch scroll is tried, but is refused until a real click, tap or key press. This was checked in Chrome: a wheel turn did not start it, the next click did.
- The audio file is served with range requests by normal hosts (Cloudflare Pages does). A host without them breaks seeking, but the loop only seeks to 0.

## Checked 2026-11-17 (desktop Chrome, headless, through the debug protocol)

- Autoplay allowed: started by itself about 3 s after load, volume at 0.35 after the fade-in.
- Autoplay blocked: silent after load, silent after a wheel turn, started after a click.
- Fade out: volume 0.28 at 57.6 s, 0.16 at 58.6 s, 0.04 at 59.6 s. After 60 s it was back at 0 s and fading in.
- Button off: fade to 0 in 0.4 s, then paused. On: restarted from 0 with a fade-in.
- Layout: button in the top-right corner and clear of the nav pill at 1280, 768, 560, 375, 360 and 320 pixels wide.

## Still open

- Check on a real iPhone and an Android phone (sound, the button, the tap that starts it).
- Owner's ear: is 0.35 loud enough, and is the first 60 seconds the part to keep?

## Fixed 2026-11-17: the button could not be turned off

- **Cause:** the button sits inside `.nav-wrap`, which has `pointer-events:none`. Only `.nav` turned it back on, so real clicks and taps went through the button to the page and its click handler never ran. (The earlier "checked in Chrome" run used script clicks, which ignore pointer-events.) Fix: `.music{pointer-events:auto}`.
- **Also hardened in `music.js`:** a tap while a start is still in flight now turns the music off (it used to be swallowed); a late start re-checks `wanted` and cannot override "off"; `stop()` has a timer fallback so the music pauses even if the browser throttles animation frames.
- **Tests:** `npm test`. `test/music.test.mjs` (fake audio and DOM, with and without reduced motion) and `test/music-layout.test.mjs` (real Chrome or Edge on the built `dist/`, at 1280, 768, 390 and 320 wide: button on screen, nothing covers it, clear of the nav pill, a real click or tap turns it off, on, off). Run `npm run build` first for the browser test.
