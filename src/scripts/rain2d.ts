// Brick rain: loose bricks tumble down the page and land on whatever is there to land on, the
// cards, buttons and headings, and on each other. They sit a while, fall off if the pointer
// brushes them, then fade. Anything that misses bounces on the bottom of the window. Drawn on a
// canvas laid over the page that lets every click through, and removed when the last brick goes.
import { C } from './brick-colors';

const COLORS = [C.red, C.yellow, C.blue, C.green, C.orange, C.azure, C.lime, C.purple];
/** What bricks land on: the page's surfaces and buttons, by their top edge. */
const SOLID = [
  '[data-ledge=""]', '.card', '.sheet', '.bstep', '.callout', '.story__stop', 'li.step', '.after__step', '.proofcard', '.toolgroup',
  '.shot__open', '.loop__toggle', '.film__video', '.guide__video', '.facts', '.btn', '.chip-brick', '.tag', '.foot',
].join(', ');
/** A pile of bricks (BrickRow with rows): each brick in it is a ledge of its own. */
const PILE = '[data-ledge="bricks"] [data-b]';
/** And headings, by every line of their words. */
const WORDS = 'h1, h2, .display, .h2, .title';
const G = 1400;

/** A top edge something can rest on, in page coordinates. A brick resting on the page makes one too. */
type Ledge = { x1: number; x2: number; y: number; brick?: Brick };
type Brick = {
  studs: number; w: number; h: number; stud: number; c: string;
  /** Centre, in page coordinates while it falls or rests; on the floor, in the window's. */
  x: number; y: number; vx: number; vy: number; a: number; va: number;
  /** The flat angle a resting brick settles to: studs up, or studs down if it landed that way. */
  aTo: number;
  state: 'fall' | 'rest' | 'floor';
  /** What it rests on, and the ledge its own top makes for the next one. */
  on: Ledge | null; top: Ledge | null;
  flip: boolean; t: number; life: number; alpha: number;
};

let canvas: HTMLCanvasElement | null = null;
let bricks: Brick[] = [];
let ledges: Ledge[] = [];

/** Whether an element scrolls with the page: something fixed or sticky stays put while the
 *  page moves under it, and a brick resting on it would float off. */
function pinned(el: Element, seen: Map<Element, boolean>): boolean {
  if (el === document.body || el === document.documentElement) return false;
  const known = seen.get(el);
  if (known !== undefined) return known;
  const pos = getComputedStyle(el).position;
  const is = pos === 'fixed' || pos === 'sticky' || (!!el.parentElement && pinned(el.parentElement, seen));
  seen.set(el, is);
  return is;
}

/** The page's ledges near the window: surfaces by their top edge, headings by each line. */
function pageLedges(): Ledge[] {
  const out: Ledge[] = [];
  const near = [scrollY - innerHeight, scrollY + innerHeight * 2];
  const seen = new Map<Element, boolean>();
  const add = (left: number, right: number, top: number) => {
    const y = top + scrollY;
    if (right - left > 20 && y > near[0] && y < near[1]) out.push({ x1: left, x2: right, y });
  };
  for (const el of document.querySelectorAll(SOLID)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || pinned(el, seen)) continue;
    const inset = el.classList.contains('btn') ? 6 : 10;
    add(r.left + inset, r.right - inset, r.top);
  }
  // On a pile, a brick lands on the studs of whichever brick is under it, top or not: the
  // ones lower down only catch what falls into a gap.
  for (const el of document.querySelectorAll(PILE)) {
    const r = el.getBoundingClientRect();
    if (r.width && !pinned(el, seen)) add(r.left + 1, r.right - 1, r.top - r.height * 0.5);
  }
  const range = document.createRange();
  for (const el of document.querySelectorAll(WORDS)) {
    if (pinned(el, seen)) continue;
    range.selectNodeContents(el);
    // One ledge per line: the line's pieces (an <em> is a piece of its own) joined end to end,
    // at about where the capitals start rather than the top of the line box.
    const lines = new Map<number, { l: number; r: number; t: number; h: number }>();
    for (const r of range.getClientRects()) {
      if (!r.width) continue;
      const key = Math.round(r.top / 4);
      const line = lines.get(key);
      if (line) { line.l = Math.min(line.l, r.left); line.r = Math.max(line.r, r.right); }
      else lines.set(key, { l: r.left, r: r.right, t: r.top, h: r.height });
    }
    for (const line of lines.values()) add(line.l + 2, line.r - 2, line.t + line.h * 0.24);
  }
  return out;
}

/** Sets a resting brick loose again, and everything stacked on it. */
function loosen(b: Brick, kick = 0) {
  if (b.top) {
    ledges = ledges.filter((l) => l !== b.top);
    for (const o of bricks) if (o.on === b.top && o.state === 'rest') loosen(o);
    b.top = null;
  }
  b.state = 'fall';
  b.on = null;
  if (kick) {
    b.vy = -240 - Math.random() * 160;
    b.vx = kick * (90 + Math.random() * 120);
    b.va = (Math.random() - 0.5) * 10;
  }
}

/** The page's own ledges again, after a resize or anything that moved the layout. A brick whose
 *  ledge has moved away falls. */
function refresh() {
  const fresh = pageLedges();
  for (const b of bricks) {
    if (b.state !== 'rest' || !b.on || b.on.brick) continue;
    const still = fresh.find((l) => Math.abs(l.y - b.on!.y) < 1 && b.x > l.x1 && b.x < l.x2);
    if (still) b.on = still;
    else loosen(b);
  }
  ledges = [...fresh, ...ledges.filter((l) => l.brick)];
}

function spawn(count: number) {
  const unit = Math.max(9, Math.min(16, innerWidth / 70));
  for (let i = 0; i < count; i++) {
    const studs = [1, 2, 2, 3, 4][Math.floor(Math.random() * 5)];
    bricks.push({
      studs, w: studs * unit, h: unit * 1.1, stud: unit * 0.32, c: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.random() * innerWidth, y: scrollY - 40 - Math.random() * innerHeight * 0.7,
      vx: (Math.random() - 0.5) * 120, vy: Math.random() * 100,
      a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 8, aTo: 0,
      state: 'fall', on: null, top: null, flip: false, t: 0, life: 9 + Math.random() * 4, alpha: 1,
    });
  }
}

export function rain(count = 46) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Already raining: more bricks join the same shower, so they can stack on each other.
  if (canvas) { spawn(count); return; }

  const cv = document.createElement('canvas');
  canvas = cv;
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '60' });
  cv.setAttribute('aria-hidden', 'true');
  document.body.append(cv);
  const ctx = cv.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio, 2);
  const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  size();
  ledges = pageLedges();
  spawn(count);

  // A resize moves everything, so it all falls and the ledges are measured again; so does a
  // change in the page's height (a question opening, a card growing).
  const onResize = () => { size(); for (const b of bricks) if (b.state === 'rest') loosen(b); refresh(); };
  addEventListener('resize', onResize);
  let height = document.documentElement.scrollHeight;
  const watch = new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - height) > 1) { height = h; refresh(); }
  });
  watch.observe(document.body);
  // Brush a resting brick with the pointer and it falls off, the other way.
  const brush = (e: PointerEvent) => {
    for (const b of bricks) {
      if (b.state !== 'rest' || b.alpha < 0.5) continue;
      const top = b.y - scrollY - b.h / 2 - b.stud;
      if (Math.abs(e.clientX - b.x) < b.w / 2 && e.clientY > top && e.clientY < top + b.h + b.stud) loosen(b, b.x < e.clientX ? -1 : 1);
    }
  };
  addEventListener('pointermove', brush, { passive: true });
  // Ledges are measured near the window: scroll far and they're measured again.
  let measuredAt = scrollY;
  const onScroll = () => { if (Math.abs(scrollY - measuredAt) > innerHeight * 0.75) { measuredAt = scrollY; refresh(); } };
  addEventListener('scroll', onScroll, { passive: true });

  const draw = (b: Brick, y: number) => {
    const { w, h } = b, unit = w / b.studs;
    ctx.save();
    ctx.globalAlpha = Math.max(0, b.alpha);
    ctx.translate(b.x * dpr, y * dpr);
    ctx.rotate(b.a);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = b.c;
    for (let i = 0; i < b.studs; i++) { ctx.beginPath(); ctx.roundRect(-w / 2 + i * unit + unit * 0.2, -h / 2 - b.stud, unit * 0.6, b.stud + 1, 2); ctx.fill(); }
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 3); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-w / 2, h / 2 - h * 0.25, w, h * 0.25);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-w / 2 + 2, -h / 2 + 1.5, w - 4, 1.5);
    ctx.restore();
  };

  /** A falling brick meets a ledge: hard, it bounces; soft, it settles there, flat side down. */
  const land = (b: Brick, l: Ledge) => {
    if (b.vy > 330) {
      b.y = l.y - b.h / 2;
      b.vy *= -0.28; b.vx *= 0.6; b.va *= 0.5;
      return;
    }
    // Studs up, or studs down if it came down the wrong way round: whichever is nearer.
    const turns = Math.round(b.a / Math.PI);
    b.flip = Math.abs(turns) % 2 === 1;
    b.aTo = turns * Math.PI;
    b.va = b.vx = b.vy = 0;
    b.state = 'rest';
    b.on = l;
    b.t = 0;
    b.y = l.y - b.h / 2 - (b.flip ? b.stud : 0);
    b.top = { x1: b.x - b.w / 2 + 2, x2: b.x + b.w / 2 - 2, y: b.y - b.h / 2 - (b.flip ? 0 : b.stud * 0.55), brick: b };
    ledges.push(b.top);
  };

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.04);
    last = now;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const floor = innerHeight - 2;
    let alive = 0;
    for (const b of bricks) {
      if (b.alpha <= 0) continue;
      alive++;
      if (b.state === 'fall') {
        const before = b.y + b.h / 2;
        b.vy += G * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
        const after = b.y + b.h / 2;
        if (b.vy > 0) {
          // The highest ledge under its middle that its bottom passed this frame.
          let hit: Ledge | null = null;
          for (const l of ledges) {
            if (l.brick === b || b.x <= l.x1 || b.x >= l.x2 || before > l.y + 1 || after < l.y) continue;
            if (!hit || l.y < hit.y) hit = l;
          }
          if (hit) land(b, hit);
        }
        if (b.state === 'fall' && b.y - scrollY + b.h / 2 > floor) {
          // Missed everything: onto the bottom of the window, where it bounces and fades.
          b.state = 'floor';
          b.y = floor - b.h / 2;
          b.vy *= -0.32; b.vx *= 0.7; b.va *= 0.5;
        }
      } else if (b.state === 'floor') {
        b.vy += G * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
        if (b.y + b.h / 2 > floor) {
          b.y = floor - b.h / 2;
          b.vy *= -0.32; b.vx *= 0.7; b.va *= 0.5;
        }
        b.t += dt;
        if (b.t > 1.6) b.alpha -= dt * 1.5;
      } else {
        b.t += dt;
        b.a += (b.aTo - b.a) * Math.min(1, dt * 14);
        if (b.t > b.life) {
          // Time to go: it fades where it is, and whatever sits on it falls as it does.
          if (b.top) {
            const on = b.on;
            loosen(b);
            b.state = 'rest';
            b.on = on;
          }
          b.alpha -= dt * 1.4;
        }
      }
      draw(b, b.state === 'floor' ? b.y : b.y - scrollY);
    }
    if (alive) requestAnimationFrame(frame);
    else {
      cv.remove();
      canvas = null;
      bricks = [];
      ledges = [];
      watch.disconnect();
      removeEventListener('resize', onResize);
      removeEventListener('pointermove', brush);
      removeEventListener('scroll', onScroll);
    }
  };
  requestAnimationFrame(frame);
}
