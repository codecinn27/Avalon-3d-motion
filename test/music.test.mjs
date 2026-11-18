// Tests for the music button (src/js/music.js). Run with `npm test`.
// The logic does not depend on screen size, so the same cases run with and without reduced motion (the only setting that
// changes the timing). The button's place and click target at desktop, tablet and phone widths is in music-layout.test.mjs.
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv } from './fake-env.mjs';
import { initMusic } from '../src/js/music.js';

for (const reduced of [false, true]) {
  describe(`music button (reduced motion: ${reduced})`, () => {
    let env;
    const boot = (opts) => { env = makeEnv(opts); env.install(); initMusic({ reduced }); return env; };
    afterEach(() => env && env.uninstall());

    test('shows itself and starts as "on"', () => {
      boot();
      assert.equal(env.button.hidden, false);
      assert.equal(env.pressed, 'true');
      assert.equal(env.button.getAttribute('aria-label'), 'Turn music off');
    });

    test('autoplay allowed: starts by itself 3 s after load, and one click turns it off', async () => {
      boot({ autoplay: true });
      await env.advance(2900);
      assert.equal(env.playing, false, 'not before 3 s');
      await env.advance(300);
      await env.advance(2500);
      assert.equal(env.audible, true, 'plays after 3 s');
      await env.tap(env.button);
      await env.advance(700);
      assert.equal(env.playing, false, 'paused after the click');
      assert.equal(env.pressed, 'false');
      assert.equal(env.button.getAttribute('aria-label'), 'Turn music on');
      assert.equal(env.stored, 'off');
    });

    test('autoplay blocked: silent, the button shows "on", the first tap starts it, the next turns it off', async () => {
      boot({ autoplay: false });
      await env.advance(4000);
      assert.equal(env.playing, false);
      assert.equal(env.pressed, 'true');
      await env.tap(env.button);
      await env.advance(600);
      assert.equal(env.audible, true, 'tap on the silent "on" button starts the music');
      await env.tap(env.button);
      await env.advance(700);
      assert.equal(env.playing, false, 'second tap turns it off');
      assert.equal(env.pressed, 'false');
    });

    test('a tap on the button WHILE the music is still starting turns it off (it used to be swallowed)', async () => {
      boot({ autoplay: false, playDelay: 1500 });
      await env.advance(100);
      await env.tap(env.page); // the first action anywhere starts the music, but the file is slow to load
      await env.advance(300);
      assert.equal(env.playing, false, 'still loading');
      await env.tap(env.button); // the visitor taps the speaker to turn it off
      await env.advance(4000);
      assert.equal(env.playing, false, 'must stay silent');
      assert.equal(env.pressed, 'false');
      assert.equal(env.stored, 'off');
    });

    test('a tap on the button while the button itself started the music, still loading, turns it off', async () => {
      boot({ autoplay: false, playDelay: 1500 });
      await env.advance(6000); // the 3 s automatic try has been refused by now
      await env.tap(env.button); // starts (silent "on" button), slow load
      await env.advance(300);
      await env.tap(env.button); // wants it off
      await env.advance(4000);
      assert.equal(env.playing, false);
      assert.equal(env.pressed, 'false');
    });

    test('a slow Web Audio resume does not switch the music back on after "off"', async () => {
      boot({ autoplay: false, ctxBlocked: true });
      await env.advance(4000);
      await env.tap(env.page);
      await env.tap(env.button);
      await env.advance(3000);
      assert.equal(env.playing, false);
      assert.equal(env.pressed, 'false');
    });

    test('off still pauses when animation frames never fire (throttled browser)', async () => {
      boot({ autoplay: true, rafWorks: true });
      await env.advance(5000);
      assert.equal(env.audible, true);
      env.rafWorks = false;
      // swap in a clock where requestAnimationFrame callbacks are never run
      const env2 = env; env2.uninstall(); env = makeEnv({ autoplay: true, rafWorks: false }); env.install(); initMusic({ reduced });
      await env.advance(5000);
      assert.equal(env.playing, true, 'it started even without frames');
      await env.tap(env.button);
      await env.advance(1000);
      assert.equal(env.playing, false, 'the timer fallback paused it');
    });

    test('off, then hiding and showing the tab keeps it silent', async () => {
      boot({ autoplay: true });
      await env.advance(5000);
      await env.tap(env.button);
      await env.advance(700);
      await env.hide(true);
      await env.hide(false);
      await env.advance(1000);
      assert.equal(env.playing, false);
    });

    test('hiding and showing the tab while it plays resumes it, and it can still be turned off', async () => {
      boot({ autoplay: true });
      await env.advance(5000);
      await env.hide(true);
      assert.equal(env.playing, false);
      await env.hide(false);
      await env.advance(300);
      assert.equal(env.playing, true);
      await env.tap(env.button);
      await env.advance(700);
      assert.equal(env.playing, false);
    });

    test('turning off during the fade-out of an earlier off, and on again, works any number of times', async () => {
      boot({ autoplay: true });
      await env.advance(5000);
      for (let i = 0; i < 5; i++) {
        await env.tap(env.button); // off
        await env.advance(100);
        await env.tap(env.button); // on again before the fade is done
        await env.advance(800);
        assert.equal(env.playing, true, `on after round ${i}`);
        assert.equal(env.pressed, 'true');
      }
      await env.tap(env.button);
      await env.advance(1000);
      assert.equal(env.playing, false);
      assert.equal(env.pressed, 'false');
    });

    test('quick double tap ends up off (and a third tap on)', async () => {
      boot({ autoplay: true });
      await env.advance(5000);
      await env.tap(env.button);
      await env.tap(env.button);
      await env.tap(env.button);
      await env.advance(1000);
      assert.equal(env.playing, false);
    });

    test('a remembered "off" stays off: nothing starts by itself or on any action', async () => {
      boot({ stored: 'off', autoplay: true });
      assert.equal(env.pressed, 'false');
      await env.advance(5000);
      await env.tap(env.page);
      await env.advance(1000);
      assert.equal(env.playing, false);
    });

    test('the loop end does not bring the music back after "off"', async () => {
      boot({ autoplay: true });
      await env.advance(5000);
      await env.tap(env.button);
      await env.advance(70000);
      assert.equal(env.playing, false);
    });

    test('turning it on again after off plays from the start', async () => {
      boot({ autoplay: true });
      await env.advance(20000);
      await env.tap(env.button);
      await env.advance(700);
      await env.tap(env.button);
      await env.advance(200);
      assert.equal(env.playing, true);
      assert.ok(env.audio.currentTime < 1, 'restarted from 0');
      assert.equal(env.stored, 'on');
    });
  });
}
