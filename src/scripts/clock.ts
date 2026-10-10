// The reply clock on /proof: press start and the email opens, then the time runs here until
// the visitor says they heard back. It lives in this browser only, and nothing is sent
// anywhere but the email itself. Inside the hour, it rains bricks.
type Words = {
  email: string; lang: string; subject: string; mail: string; running: string; result: string; within: string; over: string;
  units: { h: [string, string]; m: [string, string]; s: [string, string]; and: string };
};

const root = document.querySelector<HTMLElement>('[data-clock]');
if (root) {
  const w = JSON.parse(document.getElementById('clock-words')!.textContent!) as Words;
  const time = root.querySelector<HTMLElement>('[data-time]')!;
  const state = root.querySelector<HTMLElement>('[data-state]')!;
  const start = root.querySelector<HTMLAnchorElement>('[data-start]')!;
  const got = root.querySelector<HTMLButtonElement>('[data-got]')!;
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]')!;
  const KEY = 'bricks:clock';
  const HOUR = 3600e3;

  let clock: { start: number; end?: number } | null = null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (saved && typeof saved.start === 'number') clock = saved;
  } catch { /* no storage: the clock just won't survive a reload */ }
  const keep = () => {
    try {
      if (clock) localStorage.setItem(KEY, JSON.stringify(clock));
      else localStorage.removeItem(KEY);
    } catch { /* fine */ }
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const hms = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  /** 14 minutes, 1 hour and 5 minutes, 45 seconds. */
  const spoken = (ms: number) => {
    const s = Math.max(1, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
    const unit = (n: number, [one, many]: [string, string]) => `${n} ${n === 1 ? one : many}`;
    if (h) return m ? `${unit(h, w.units.h)} ${w.units.and} ${unit(m, w.units.m)}` : unit(h, w.units.h);
    return m ? unit(m, w.units.m) : unit(s, w.units.s);
  };

  let ticking = 0;
  function show() {
    clearInterval(ticking);
    const phase = !clock ? 'idle' : clock.end === undefined ? 'running' : clock.end - clock.start <= HOUR ? 'done' : 'over';
    root!.dataset.phase = phase;
    start.hidden = phase !== 'idle';
    got.hidden = phase !== 'running';
    reset.hidden = phase === 'idle';
    if (!clock) {
      time.textContent = hms(0);
      state.textContent = '';
    } else if (clock.end === undefined) {
      const from = clock.start;
      const tick = () => { time.textContent = hms(Date.now() - from); };
      tick();
      ticking = window.setInterval(tick, 1000);
      state.textContent = w.running;
    } else {
      const ms = clock.end - clock.start;
      time.textContent = hms(ms);
      state.textContent = `${w.result.replace('{t}', spoken(ms))} ${phase === 'done' ? w.within : w.over}`;
    }
  }

  start.addEventListener('click', (e) => {
    e.preventDefault();
    clock = { start: Date.now() };
    keep();
    const at = new Date().toLocaleTimeString(w.lang, { hour: 'numeric', minute: '2-digit' });
    location.href = `mailto:${w.email}?subject=${encodeURIComponent(w.subject)}&body=${encodeURIComponent(w.mail.replace('{time}', at))}`;
    show();
    got.focus();
  });
  got.addEventListener('click', () => {
    if (!clock) return;
    clock.end = Date.now();
    keep();
    show();
    reset.focus();
    if (clock.end - clock.start <= HOUR) import('./rain2d').then((m) => m.rain(36));
  });
  reset.addEventListener('click', () => {
    clock = null;
    keep();
    show();
    start.focus();
  });
  show();
}
