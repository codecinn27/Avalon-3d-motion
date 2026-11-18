// Draw your card. States: idle -> shuffling -> revealed -> (draw again) -> shuffling.
// The pick is fair (crypto random, equal chance) and never repeats the last role.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
const enc = encodeURIComponent;

/** Uniform random integer in [0, n) with no modulo bias. */
function randomIndex(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % n;
}

export function initDraw({ animate = false } = {}) {
  const sec = document.getElementById('draw');
  const dataEl = document.getElementById('page-data');
  if (!sec || !dataEl) return null;
  const data = JSON.parse(dataEl.textContent);
  const { roles, text } = data;
  const $ = (q) => sec.querySelector(q);
  const el = {
    idle: $('.idle'), result: $('.result'), pick: $('[data-pick]'), flip: $('[data-pick] .card-3d'),
    img: $('[data-pick-img]'), name: $('[data-pick-name]'), side: $('[data-pick-side]'),
    title: $('[data-r-title]'), line: $('[data-r-line]'), wa: $('[data-r-wa]'),
    copy: $('[data-copy]'), field: $('[data-link-field]'), live: $('[data-live]'),
    backs: [...sec.querySelectorAll('.deck .card:not(.pick)')],
  };
  const gsap = animate ? window.gsap : null;
  let state = 'idle';
  let last = -1;
  let shareUrl = '';
  let copyTimer = 0;
  let staged = null; // chapter 8 (spec 011): the card and the result live on the table, and seat.js plays the lift and the turn

  const setState = (next) => {
    state = next;
    sec.dataset.state = next;
  };

  function pickRole() {
    let i;
    do {
      i = randomIndex(roles.length);
    } while (i === last);
    last = i;
    return roles[i];
  }

  /** Put the role on the hidden face of the pick card, and wait until its art is ready. */
  function loadFace(role) {
    el.pick.classList.toggle('evil', role.side === 'evil');
    el.pick.classList.toggle('good', role.side === 'good');
    el.name.textContent = role.name;
    el.side.textContent = text.sidesShort[role.side];
    el.img.srcset = `/assets/cards/${role.slug}-320.webp 320w, /assets/cards/${role.slug}-640.webp 640w`;
    el.img.sizes = '200px';
    el.img.src = `/assets/cards/${role.slug}-320.webp`;
    const ready = el.img.decode ? el.img.decode().catch(() => {}) : Promise.resolve();
    return Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]);
  }

  function fillResult(role) {
    const origin = data.siteUrl || location.origin;
    shareUrl = `${origin}${data.prefix}/role/${role.slug}/`;
    const shareText = fill(text.share, { role: role.name });
    el.title.innerHTML = esc(fill(text.resultTitle, { role: role.name })).replace(/\*(.+?)\*/g, '<em>$1</em>');
    el.line.textContent = role.line;
    el.wa.href = `https://wa.me/${data.whatsapp}?text=${enc(fill(text.waWithRole, { role: role.name }))}`;
    const links = {
      whatsapp: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`,
      // u: the page, so Facebook builds the preview card (picture, title) from its og tags. quote: the same words Threads gets.
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}`,
      threads: `https://www.threads.net/intent/post?text=${enc(`${shareText} ${shareUrl}`)}`,
    };
    el.result.querySelectorAll('[data-share]').forEach((a) => (a.href = links[a.dataset.share]));
    el.field.hidden = true;
    el.field.value = shareUrl;
    el.copy.textContent = text.copy;
    el.live.textContent = `${el.title.textContent} ${text.sides[role.side]}. ${role.line}`;
  }

  // ----- a picture of the drawn card: portrait on a phone, wide on a desktop (spec: save my card, and the phone's own share sheet) -----
  let shot = { slug: '', p: null };
  const loadImg = (src) => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const wrapText = (g, txt, x, y, maxW, lh, max) => {
    const words = txt.split(/(\s+)/);
    let line = '', n = 0;
    for (const w of words) {
      if (g.measureText(line + w).width > maxW && line.trim()) {
        g.fillText(line.trim(), x, y + n * lh);
        line = w.trimStart();
        if (++n >= max) return;
      } else line += w;
    }
    if (line.trim()) g.fillText(line.trim(), x, y + n * lh);
  };
  async function makeCard(role) {
    const portrait = matchMedia('(max-width: 820px)').matches;
    const W = portrait ? 1080 : 1200, H = portrait ? 1350 : 630;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    try { await document.fonts.load('80px Fraunces'); } catch {}
    const serif = "Fraunces, Georgia, 'Times New Roman', serif";
    const [art, badge] = await Promise.all([loadImg(`/assets/cards/${role.slug}-640.webp`), loadImg(`/assets/badges/${role.side}-384.webp`).catch(() => null)]);
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0B0D12');
    bg.addColorStop(1, role.side === 'evil' ? '#2a0d14' : '#10203f');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    const cw = portrait ? 760 : 360, ch = cw * 1.5, cx = portrait ? (W - cw) / 2 : 120, cy = portrait ? 60 : (H - ch) / 2;
    const r = cw * 0.07;
    g.save();
    g.shadowColor = 'rgba(0,0,0,.6)';
    g.shadowBlur = 40;
    g.fillStyle = '#c9a24a';
    g.beginPath();
    g.roundRect(cx - 12, cy - 12, cw + 24, ch + 24, r + 8);
    g.fill();
    g.restore();
    g.save();
    g.beginPath();
    g.roundRect(cx, cy, cw, ch, r);
    g.clip();
    g.drawImage(art, cx, cy, cw, ch);
    const fade = g.createLinearGradient(0, cy + ch * 0.62, 0, cy + ch);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,.85)');
    g.fillStyle = fade;
    g.fillRect(cx, cy, cw, ch);
    g.restore();
    if (badge) g.drawImage(badge, cx + cw - cw * 0.3, cy + cw * 0.03, cw * 0.27, cw * 0.27);
    g.textAlign = 'center';
    g.fillStyle = '#f3ecdf';
    const label = text.sides[role.side];
    if (portrait) {
      g.font = `500 ${cw * 0.11}px ${serif}`;
      g.fillText(role.name, W / 2, cy + ch - cw * 0.2);
      g.font = `500 ${cw * 0.045}px sans-serif`;
      g.fillStyle = 'rgba(243,236,223,.75)';
      g.fillText(label.toUpperCase(), W / 2, cy + ch - cw * 0.1);
      g.fillStyle = '#d9a441';
      g.font = `italic 400 56px ${serif}`;
      g.fillText(data.brand + ' · ' + location.host, W / 2, H - 70);
    } else {
      const tx = cx + cw + 90;
      g.textAlign = 'left';
      g.fillStyle = '#d9a441';
      g.font = `500 26px sans-serif`;
      g.fillText(label.toUpperCase(), tx, 150);
      g.fillStyle = '#f3ecdf';
      g.font = `500 96px ${serif}`;
      g.fillText(role.name, tx, 260);
      g.font = `400 32px ${serif}`;
      g.fillStyle = 'rgba(243,236,223,.82)';
      wrapText(g, role.line, tx, 335, W - tx - 70, 44, 5);
      g.fillStyle = '#d9a441';
      g.font = `italic 400 40px ${serif}`;
      g.fillText(data.brand + ' · ' + location.host, tx, H - 60);
    }
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }
  const cardBlob = () => {
    const role = roles[last];
    if (!role) return Promise.resolve(null);
    if (shot.slug !== role.slug + matchMedia('(max-width: 820px)').matches) shot = { slug: role.slug + matchMedia('(max-width: 820px)').matches, p: makeCard(role).catch(() => null) };
    return shot.p;
  };
  const fileOf = async () => {
    const b = await cardBlob();
    return b ? new File([b], `avalon-${roles[last].slug}.png`, { type: 'image/png' }) : null;
  };

  function showResult(first) {
    el.idle.hidden = true;
    el.result.hidden = false;
    if (gsap) gsap.fromTo(el.result.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, overwrite: true });
    else if (el.result.animate) el.result.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    if (first) el.title.focus({ preventScroll: true });
  }

  // ----- animation: shuffle, fly up, flip, settle. About 1.6 seconds. -----
  let base = null;
  if (gsap) {
    base = el.backs.map((c) => ({ x: gsap.getProperty(c, 'x'), y: gsap.getProperty(c, 'y'), rotation: gsap.getProperty(c, 'rotation') }));
    base.pick = { x: gsap.getProperty(el.pick, 'x'), y: gsap.getProperty(el.pick, 'y'), rotation: gsap.getProperty(el.pick, 'rotation') };
    gsap.set(el.flip, { rotationY: 180 });
  }

  function play(role, wasRevealed) {
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      if (wasRevealed) {
        tl.to(el.result.children, { opacity: 0.25, duration: 0.25 }, 0)
          .to(el.flip, { rotationY: 180, duration: 0.32, ease: 'power2.in' }, 0)
          .to(el.pick, { ...base.pick, scale: 1, duration: 0.32, ease: 'power2.inOut' }, 0.08);
      }
      // hold here, face still hidden, until the new art is ready
      tl.addPause('>', () => loadFace(role).then(() => tl.resume()));
      const out = [-96, 78, -58], back = [52, -64, 34];
      tl.to(el.backs, { x: (i) => base[i].x + out[i], rotation: (i) => base[i].rotation + (i % 2 ? 9 : -9), duration: 0.2, ease: 'power2.out', stagger: 0.04 })
        .to(el.backs, { x: (i) => base[i].x + back[i], rotation: (i) => base[i].rotation + (i % 2 ? -6 : 6), duration: 0.22, ease: 'power2.inOut', stagger: 0.04 })
        .to(el.backs, { x: (i) => base[i].x, rotation: (i) => base[i].rotation, duration: 0.24, ease: 'power2.out', stagger: 0.03 })
        .to(el.pick, { x: 0, y: -54, rotation: 0, scale: 1.1, duration: 0.38, ease: 'power3.out' }, '-=0.22')
        .to(el.flip, { rotationY: 0, duration: 0.56, ease: 'power2.inOut' }, '-=0.14')
        .to(el.pick, { y: 0, scale: 1.05, rotation: -2, duration: 0.42, ease: 'power2.out' }, '-=0.2');
    });
  }

  async function plain(role) {
    el.pick.classList.add('is-down');
    await loadFace(role);
    el.pick.classList.remove('is-down');
    if (el.pick.animate) el.pick.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
  }

  async function onDraw() {
    if (state === 'shuffling') return; // taps during the shuffle are ignored
    const wasRevealed = state === 'revealed';
    setState('shuffling');
    const role = pickRole();
    try {
      if (staged) await staged.play({ role, wasRevealed, loadFace: () => loadFace(role) });
      else if (gsap) await play(role, wasRevealed);
      else await plain(role);
    } catch (err) {
      console.error('[avalon] draw animation failed', err);
      el.pick.classList.remove('is-down');
    }
    fillResult(role);
    setState('revealed');
    showResult(!wasRevealed);
  }

  sec.querySelectorAll('[data-draw]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', onDraw);
  });
  el.result.querySelectorAll('[data-draw]').forEach((b) => (b.hidden = false));

  // save my card: the picture of the role, downloaded
  const saveBtn = el.result.querySelector('[data-save]');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const f = await fileOf();
      if (!f) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(f);
      a.download = f.name;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
  }
  // The Facebook button is a plain link share on every device. (It used to open the phone's file share sheet, but Facebook
  // drops the link and text when it is handed a picture file, so the post had no preview. The card picture is still saved by the save button.)

  el.copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      el.copy.textContent = text.copied;
      el.live.textContent = text.copied;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (el.copy.textContent = text.copy), 2200);
    } catch {
      // clipboard blocked: show the link in a field the visitor can select
      el.field.hidden = false;
      el.field.focus();
      el.field.select();
    }
  });

  // ----- chapter 8: the draw on the table (spec 011). seat.js hands over its card host and its panel host, and plays the lift and the turn -----
  const home = { deck: el.pick.parentNode, panel: el.result.parentNode, next: el.result.nextSibling };
  return {
    stage(cfg) {
      staged = cfg;
      cfg.card.append(el.pick);
      cfg.panel.append(el.result);
      sec.classList.add('is-moved');
      el.img.sizes = '300px';
    },
    unstage() {
      if (!staged) return;
      staged = null;
      this.reset();
      home.deck.append(el.pick);
      home.panel.insertBefore(el.result, home.next);
      sec.classList.remove('is-moved');
      el.img.sizes = '200px';
    },
    /** back to a face down card (scrolling back above the draw window) */
    reset() {
      if (state === 'idle' || state === 'shuffling') return;
      if (gsap) gsap.killTweensOf(el.flip);
      if (gsap) gsap.set(el.flip, { rotationY: 180 });
      el.result.hidden = true;
      el.idle.hidden = false;
      el.live.textContent = '';
      setState('idle');
    },
    draw: onDraw,
    state: () => state,
    flip: el.flip,
  };
}
