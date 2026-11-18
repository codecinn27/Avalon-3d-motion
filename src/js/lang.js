// Language switch. The choice is remembered on this device and only used to
// mark the remembered language in the nav. It never redirects.
const KEY = 'avalon:lang';

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const write = (value) => {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* private mode or blocked storage: the switch still works as plain links */
  }
};

export function initLang() {
  const current = document.documentElement.dataset.locale;
  const links = document.querySelectorAll('[data-lang]');
  links.forEach((a) => {
    // keep the visitor at the same spot on the page (for example #draw)
    a.addEventListener('click', () => {
      write(a.dataset.lang);
      if (location.hash && !a.hash) a.href += location.hash;
    });
  });
  const saved = read();
  if (saved && saved !== current) {
    document.querySelectorAll(`.nav [data-lang="${saved}"]`).forEach((a) => a.classList.add('offer'));
  }
}
