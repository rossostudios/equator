// The model at the top of a case study: that project's corner of the home page's town, built
// in bricks on its own plate, with its building instructions to step through underneath, a
// bag of parts per step. This site's own case study gets the whole town, and a switch that
// pulls it apart to show its seams.
import type { Part } from './brick-kit';
import { buildTown } from './brick-town';
import { type Turntable, turntable } from './turntable';

type Zone = Omit<Turntable, 'steps'> & { steps: number[] };
const ZONES: Record<string, Zone> = {
  plazuela: { steps: [1], plate: { x: 0, z: 0, w: 17, d: 12 }, centre: [8.5, 3.4, 5.8], radius: 9.5, az: 0.55, el: 0.42 },
  petzone: { steps: [2], plate: { x: 18, z: 0, w: 18, d: 12 }, centre: [27, 3.6, 5.8], radius: 9.5, az: 0.5, el: 0.42 },
  purrsuit: { steps: [3], plate: { x: 9, z: 15, w: 17, d: 11 }, centre: [17.5, 4.2, 20.5], radius: 9.5, az: -0.32, el: 0.36 },
  'chrisrosso-dev': { steps: [0, 1, 2, 3, 4], plate: { x: 0, z: 0, w: 36, d: 26 }, centre: [18, 2.2, 13], radius: 17, wide: 23, az: 0.42, el: 0.6, duration: 4200 },
};

type Words = Record<'lang' | 'total' | 'start' | 'step' | 'one' | 'parts' | 'prev' | 'next' | 'finish' | 'more' | 'stats' | 'plate' | 'tile' | 'round' | 'bar', string>;

/** The most bags a step lists before it says how many more. */
const BAG = 9;

async function main() {
  const root = document.querySelector<HTMLElement>('[data-model]');
  const zone = root && ZONES[root.dataset.model!];
  if (!root || !zone) return;
  // The signs are lettered in the display face, so wait for it (but not forever).
  await Promise.race([document.fonts.load('800 64px "Bricolage Grotesque"'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
  const town = buildTown(root.dataset.lot ?? 'YOUR PRODUCT\nGOES HERE');
  const model = turntable(root, { ...zone, steps: zone.steps.map((s) => town[s]) });
  const ui = document.querySelector<HTMLElement>('[data-instructions]');
  if (!model || !ui) return;

  const w = JSON.parse(ui.dataset.words!) as Words;
  const fmt = (n: number) => n.toLocaleString(w.lang);
  const get = <T extends HTMLElement>(sel: string) => ui.querySelector<T>(sel)!;
  const start = get<HTMLButtonElement>('[data-start]'), prev = get<HTMLButtonElement>('[data-prev]'), next = get<HTMLButtonElement>('[data-next]');
  const label = get<HTMLElement>('[data-label]'), bag = get<HTMLElement>('[data-bag]');
  const seams = ui.querySelector<HTMLButtonElement>('[data-seams]'), stats = ui.querySelector<HTMLElement>('[data-stats]');
  const total = model.steps.length;
  let at: number | null = null;

  /** A part's size as the bag prints it: 2×4, 1×2 plate, 2×2 tile. */
  const size = (p: Part) => {
    if (p.kind === 'bar') return w.bar;
    const s = `${Math.min(p.w, p.d)}×${Math.max(p.w, p.d)}`;
    if (p.kind === 'tile') return `${s} ${w.tile}`;
    if (p.kind === 'round') return `${s} ${w.round}`;
    return p.h < 3 ? `${s} ${w.plate}` : p.h > 3 ? `${s}×${p.h / 3}` : s;
  };
  /** The step's bag: its parts counted by shape and colour, most first. */
  function fill(parts: Part[]) {
    const groups = new Map<string, { n: number; part: Part }>();
    for (const p of parts) {
      const key = `${size(p)}:${p.color.toLowerCase()}`;
      const g = groups.get(key);
      if (g) g.n++;
      else groups.set(key, { n: 1, part: p });
    }
    const sorted = [...groups.values()].sort((a, b) => b.n - a.n);
    const items = sorted.slice(0, BAG).map(({ n, part }) => {
      const li = document.createElement('li');
      li.className = 'bag__item';
      const brick = document.createElement('span');
      brick.className = `bag__brick bag__brick--${part.kind}`;
      brick.style.setProperty('--c', part.color);
      brick.style.setProperty('--n', String(Math.max(1, Math.min(8, Math.max(part.w, part.d)))));
      brick.setAttribute('aria-hidden', 'true');
      const count = document.createElement('span');
      count.className = 'bag__n';
      count.textContent = `${n}×`;
      li.append(brick, count, ` ${size(part)}`);
      return li;
    });
    const rest = sorted.slice(BAG).reduce((n, g) => n + g.n, 0);
    if (rest) {
      const li = document.createElement('li');
      li.className = 'bag__item bag__item--more';
      li.textContent = w.more.replace('{n}', fmt(rest));
      items.push(li);
    }
    bag.replaceChildren(...items);
  }

  function render() {
    const stepping = at !== null;
    start.hidden = stepping;
    prev.hidden = next.hidden = bag.hidden = !stepping;
    if (at === null) {
      label.textContent = w.total.replace('{n}', fmt(total));
      return;
    }
    const parts = model!.steps[at];
    const count = parts.length === 1 ? w.one : w.parts.replace('{n}', fmt(parts.length));
    label.textContent = `${w.step.replace('{k}', fmt(at + 1)).replace('{n}', fmt(total))} · ${count}`;
    // An arrow about to disable itself would drop keyboard focus to the page; hand it across first.
    if (at === 0 && document.activeElement === prev) next.focus();
    prev.disabled = at === 0;
    const last = at === total - 1;
    next.textContent = last ? '✓' : '→';
    next.setAttribute('aria-label', last ? w.finish : w.next);
    fill(parts);
  }
  const go = (k: number | null) => {
    at = k;
    model.show(k);
    render();
  };

  start.addEventListener('click', () => { go(0); next.focus(); });
  prev.addEventListener('click', () => { if (at) go(at - 1); });
  next.addEventListener('click', () => {
    if (at === null) return;
    if (at < total - 1) go(at + 1);
    else { go(null); start.focus(); }
  });
  seams?.addEventListener('click', () => {
    const on = seams.getAttribute('aria-pressed') !== 'true';
    seams.setAttribute('aria-pressed', String(on));
    model.seams(on);
    if (stats) {
      stats.hidden = !on;
      stats.textContent = w.stats.replace('{bricks}', fmt(model.stats.bricks)).replace('{shapes}', fmt(model.stats.shapes));
    }
  });

  ui.hidden = false;
  render();
}
main();
