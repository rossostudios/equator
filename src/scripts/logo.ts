// The logo is a little alive: its eyes follow the pointer, it blinks every few seconds, it
// says hello to the brick figure on the page when hovered, three quick clicks make it rain
// bricks (and a speech bubble says so, then counts you down), and the tab icon falls asleep
// while you're on another tab.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const logos = () => document.querySelectorAll<SVGSVGElement>('svg.logo');

// Eyes: each logo looks toward the pointer, up to a little under a unit of its 32.
if (!reduce && matchMedia('(hover: hover)').matches) {
  let queued = false, px = 0, py = 0;
  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      for (const logo of logos()) {
        const r = logo.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height * 0.55);
        const d = Math.hypot(dx, dy) || 1, reach = Math.min(1, d / 160);
        logo.style.setProperty('--lx', `${((dx / d) * 0.8 * reach).toFixed(2)}px`);
        logo.style.setProperty('--ly', `${((dy / d) * 0.6 * reach).toFixed(2)}px`);
      }
    });
  }, { passive: true });
}

// Blinks: one logo at a time, at an uneven pace, the way people blink.
if (!reduce) {
  const blink = () => {
    for (const logo of logos()) {
      logo.classList.add('is-blinking');
      setTimeout(() => logo.classList.remove('is-blinking'), 130);
    }
    setTimeout(blink, 2600 + Math.random() * 4200);
  };
  setTimeout(blink, 2000 + Math.random() * 2000);
}

// Hello: hovering a link with the logo in it tells the page, and the brick figure hops.
let last = 0;
addEventListener('pointerover', (e) => {
  const link = (e.target as Element).closest?.('a');
  if (!link?.querySelector('svg.logo') || performance.now() - last < 800) return;
  last = performance.now();
  dispatchEvent(new CustomEvent('logo:hello'));
});

// The speech bubble under the logo in the bar (Bar.astro). It tells you about the rain when
// you hover the logo, once on its own on a first visit, and counts down as you click.
// With reduced motion there is no rain, so the bubble promises none and the logo is just a link.
const tip = reduce ? null : document.querySelector<HTMLElement>('[data-logo-tip]');
const touch = matchMedia('(hover: none)').matches;
let tipTimer = 0;
function say(text: string | undefined, ms = 0) {
  if (!tip || !text) return;
  tip.textContent = text;
  tip.classList.add('is-on');
  clearTimeout(tipTimer);
  if (ms) tipTimer = window.setTimeout(hush, ms);
}
function hush() {
  clearTimeout(tipTimer);
  tip?.classList.remove('is-on');
}
const hint = () => (touch ? tip?.dataset.touch : tip?.dataset.hint);
const home = document.querySelector<HTMLElement>('header.bar .bar__name');
/** The hover hint, waiting to show. A click cancels it, so it never covers the countdown. */
let wait = 0;
if (tip && home) {
  home.addEventListener('pointerenter', () => { wait = window.setTimeout(() => { if (!clicks) say(hint()); }, 350); });
  home.addEventListener('pointerleave', () => { clearTimeout(wait); if (!clicks) hush(); });
  // A first visit gets the hint once, after the page has settled, whether or not anyone hovers.
  // It only counts as seen once it has actually shown.
  try {
    if (!localStorage.getItem('bricks:hinted')) {
      setTimeout(() => {
        if (clicks || document.hidden) return;
        say(hint(), 5000);
        try { localStorage.setItem('bricks:hinted', '1'); } catch { /* fine */ }
      }, 4500);
    }
  } catch { /* no storage: no unprompted hint */ }
}

/** Brick rain, down the page (rain2d.ts). */
function rain() {
  import('./rain2d').then((m) => m.rain());
}

// Three quick clicks on the logo. The logo is a link home, so a click waits a moment to see
// whether another follows before it goes; a click on the page you're already on scrolls up,
// and there the wait can be longer, since it costs nothing.
let clicks = 0, timer = 0, pending = '';
addEventListener('click', (e) => {
  const link = (e.target as Element).closest?.('a');
  if (reduce || !link?.querySelector('svg.logo') || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  // From the phone menu: close it, so whatever happens next happens on the page.
  link.closest('dialog')?.close();
  clearTimeout(timer);
  clearTimeout(wait);
  pending = link.href;
  ++clicks;
  say([tip?.dataset.two, tip?.dataset.one, tip?.dataset.rain][Math.min(clicks, 3) - 1], 1600);
  if (clicks >= 3) { clicks = 0; rain(); return; }
  const here = new URL(pending).pathname === location.pathname;
  timer = window.setTimeout(() => {
    const go = clicks > 0;
    clicks = 0;
    hush();
    if (!go) return;
    if (here) scrollTo({ top: 0, behavior: 'smooth' });
    else location.href = pending;
  }, here ? 900 : 450);
}, true);

// Or type the word: "bricks", or "piezas" in Spanish, anywhere outside a text field.
let typed = '';
addEventListener('keydown', (e) => {
  const el = e.target as HTMLElement;
  if (typeof e.key !== 'string' || e.key.length !== 1 || el.closest?.('input, textarea, select, [contenteditable]')) return;
  typed = (typed + e.key.toLowerCase()).slice(-6);
  if (typed === 'bricks' || typed === 'piezas') { typed = ''; rain(); }
});

// Hello to anyone who opens the console: it's the kind of visitor who reads the source.
console.log(
  '%c▀▀ %cBuilt in bricks with Astro and three.js, by Christopher Rosso.\n   Building something? hello@chrisrosso.dev',
  'color:#c91a09;font-weight:800', 'color:inherit;font-weight:600',
);

// The tab icon sleeps while the page is hidden and wakes when it comes back.
const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
if (icon) {
  const awake = icon.href;
  document.addEventListener('visibilitychange', () => {
    icon.href = document.hidden ? '/favicon-sleep.svg' : awake;
  });
}
