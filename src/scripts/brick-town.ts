// The town the home page builds, one step per section: the street with my sign on it,
// then Plazuela, Petzone and Purrsuit, then an empty lot for whoever is reading.
// Coordinates are studs on a 36x26 baseplate: x runs left to right, z back to front.
import { Builder, type Draw, type Unit } from './brick-kit';
import { C } from './brick-colors';

export { C, SWATCHES } from './brick-colors';

export const BASE = { w: 36, d: 26 };

/** The empty lot inside its border, where visitors stack their own bricks. */
export const PLOT = { x: 26, z: 17, w: 8, d: 8 };

/** Where the camera looks for each step: a centre, how much has to fit around it (rn on a
 *  portrait screen, where the whole plate would otherwise crop), and the angle (radians)
 *  round from the front and up from the ground. */
export const POSES: { c: readonly number[]; r: number; rn?: number; az: number; el: number }[] = [
  { c: [18, 2, 14], r: 18, rn: 22.5, az: 0.36, el: 0.6 },
  { c: [8.5, 3.6, 5.5], r: 12, az: 0.62, el: 0.62 },
  { c: [27.5, 4, 5.5], r: 12.5, az: 0.45, el: 0.5 },
  { c: [17, 4.2, 21], r: 11.5, az: -0.28, el: 0.38 },
  { c: [30, 2.5, 20.5], r: 11, az: 0.35, el: 0.8 },
];

// ---------- Prints ----------

const FONT = '"Bricolage Grotesque", "Inter", system-ui, sans-serif';
type Fill = string | ((ctx: CanvasRenderingContext2D, w: number, h: number) => string | CanvasGradient);

/** Lettering sized to the face it is printed on. */
export const label = (text: string, fill: Fill, o: { stroke?: string; size?: number } = {}): Draw => (ctx, w, h) => {
  const lines = text.split('\n');
  let px = (h * (o.size ?? 0.66)) / lines.length;
  ctx.font = `800 ${px}px ${FONT}`;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  if (widest > w * 0.86) { px *= (w * 0.86) / widest; ctx.font = `800 ${px}px ${FONT}`; }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = typeof fill === 'string' ? fill : fill(ctx, w, h);
  lines.forEach((line, i) => {
    const y = h / 2 + (i - (lines.length - 1) / 2) * px * 1.04 + px * 0.05;
    if (o.stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = px * 0.2;
      ctx.strokeStyle = o.stroke;
      ctx.strokeText(line, w / 2, y);
    }
    ctx.fillText(line, w / 2, y);
  });
};

const ellipse = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};

const ear = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.fillStyle = C.rose;
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.18);
  ctx.lineTo(w / 2 + h * 0.3, h * 0.92);
  ctx.lineTo(w / 2 - h * 0.3, h * 0.92);
  ctx.closePath();
  ctx.fill();
};

/** Jinx, Purrsuit's hero: green eyes under heavy lids, pink nose, white whiskers. */
const jinxFace: Draw = (ctx, w, h) => {
  const cx = w / 2, u = h;
  ellipse(ctx, cx, h * 0.76, u * 0.4, u * 0.2, '#283644');
  for (const s of [-1, 1]) {
    const ex = cx + s * u * 0.6, ey = h * 0.45, rx = u * 0.27, ry = u * 0.24;
    ellipse(ctx, ex, ey, rx * 1.08, ry * 1.1, '#0B1218');
    ellipse(ctx, ex, ey, rx, ry, '#8BE04E');
    ellipse(ctx, ex, ey + ry * 0.08, rx * 0.26, ry * 0.72, '#0B1218');
    ellipse(ctx, ex - rx * 0.4, ey + ry * 0.1, ry * 0.16, ry * 0.16, '#FFFFFF');
    // The lid: drawn over the top of the eye in the fur colour, so he looks unimpressed.
    ellipse(ctx, ex, ey - ry * 0.95, rx * 1.25, ry * 0.86, C.black);
    ctx.strokeStyle = '#3B4A59';
    ctx.lineWidth = u * 0.05;
    ctx.beginPath();
    ctx.ellipse(ex, ey - ry * 0.95, rx * 1.12, ry * 0.86, 0, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
    ctx.lineCap = 'round';
    ctx.lineWidth = u * 0.06;
    ctx.beginPath();
    ctx.moveTo(ex - s * rx * 0.9, ey - ry * 2.1);
    ctx.lineTo(ex + s * rx * 0.7, ey - ry * 1.75);
    ctx.stroke();
  }
  ctx.fillStyle = C.rose;
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.1, h * 0.64);
  ctx.lineTo(cx + u * 0.1, h * 0.64);
  ctx.lineTo(cx, h * 0.73);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0B1218';
  ctx.lineWidth = u * 0.035;
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.13, h * 0.8);
  ctx.quadraticCurveTo(cx - u * 0.06, h * 0.86, cx, h * 0.76);
  ctx.quadraticCurveTo(cx + u * 0.06, h * 0.86, cx + u * 0.13, h * 0.8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.92)';
  ctx.lineWidth = u * 0.022;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + s * u * 0.3, h * 0.72 + i * u * 0.05);
    ctx.lineTo(cx + s * u * 1.12, h * 0.62 + i * u * 0.11);
    ctx.stroke();
  }
};

/** Dasha, Petzone's mascot: an orange kitten with a white blaze and big brown eyes. */
const dashaFace: Draw = (ctx, w, h) => {
  const cx = w / 2, u = h;
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.07, 0);
  ctx.lineTo(cx + u * 0.07, 0);
  ctx.lineTo(cx + u * 0.26, h * 0.62);
  ctx.lineTo(cx - u * 0.26, h * 0.62);
  ctx.closePath();
  ctx.fill();
  ellipse(ctx, cx, h * 0.82, u * 0.56, u * 0.3, C.white);
  for (const s of [-1, 1]) {
    const ex = cx + s * u * 0.47, ey = h * 0.46, r = u * 0.21;
    ellipse(ctx, ex, ey, r, r, '#2B1408');
    ellipse(ctx, ex, ey, r * 0.8, r * 0.8, '#7A3B12');
    ellipse(ctx, ex, ey + r * 0.05, r * 0.46, r * 0.46, '#120804');
    ellipse(ctx, ex + r * 0.28, ey - r * 0.3, r * 0.2, r * 0.2, '#FFFFFF');
    ellipse(ctx, ex - r * 0.3, ey + r * 0.32, r * 0.09, r * 0.09, '#FFFFFF');
  }
  ctx.fillStyle = '#5A2416';
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.08, h * 0.63);
  ctx.lineTo(cx + u * 0.08, h * 0.63);
  ctx.lineTo(cx, h * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7A1F22';
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.76, u * 0.12, u * 0.1, 0, 0, Math.PI);
  ctx.fill();
  ellipse(ctx, cx, h * 0.82, u * 0.06, u * 0.035, '#F07A8A');
};

/** Jinx's purple hoodie: zip, lime drawstrings, a pouch pocket. */
const hoodie: Draw = (ctx, w, h) => {
  const cx = w / 2;
  ctx.fillStyle = 'rgba(0,0,0,.13)';
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.28, h * 0.58, w * 0.56, h * 0.36, h * 0.1);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.fillRect(cx - h * 0.018, 0, h * 0.036, h);
  ctx.strokeStyle = C.lime;
  ctx.lineWidth = h * 0.045;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * w * 0.07, 0);
    ctx.lineTo(cx + s * w * 0.09, h * 0.42);
    ctx.stroke();
    ellipse(ctx, cx + s * w * 0.09, h * 0.47, h * 0.04, h * 0.05, C.white);
  }
};

/** My face: brown eyes under heavy brows, a big smile, and the beard around it. */
const myFace: Draw = (ctx, w, h) => {
  const cx = w / 2, u = h;
  ctx.fillStyle = C.hair;
  ctx.fillRect(0, 0, w, u * 0.06);
  ctx.fillRect(0, 0, u * 0.1, h * 0.62);
  ctx.fillRect(w - u * 0.1, 0, u * 0.1, h * 0.62);
  // The beard: everything below the cheek line, then the moustache over the smile.
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.quadraticCurveTo(u * 0.35, h * 0.62, cx - u * 0.42, h * 0.56);
  ctx.quadraticCurveTo(cx, h * 0.5, cx + u * 0.42, h * 0.56);
  ctx.quadraticCurveTo(w - u * 0.35, h * 0.62, w, h * 0.5);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#5A1F14';
  ctx.lineWidth = u * 0.03;
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.3, h * 0.69);
  ctx.quadraticCurveTo(cx, h * 0.67, cx + u * 0.3, h * 0.69);
  ctx.quadraticCurveTo(cx + u * 0.22, h * 0.86, cx, h * 0.87);
  ctx.quadraticCurveTo(cx - u * 0.22, h * 0.86, cx - u * 0.3, h * 0.69);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = C.skin2;
  ctx.lineWidth = u * 0.035;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.06, h * 0.49);
  ctx.quadraticCurveTo(cx, h * 0.53, cx + u * 0.06, h * 0.49);
  ctx.stroke();
  for (const s of [-1, 1]) {
    const ex = cx + s * u * 0.45, ey = h * 0.34;
    ellipse(ctx, ex, ey, u * 0.1, u * 0.085, '#FFFFFF');
    ellipse(ctx, ex, ey + u * 0.005, u * 0.068, u * 0.07, '#4A2A17');
    ellipse(ctx, ex, ey + u * 0.005, u * 0.034, u * 0.036, '#120A06');
    ellipse(ctx, ex + u * 0.025, ey - u * 0.025, u * 0.018, u * 0.018, '#FFFFFF');
    ctx.strokeStyle = C.hair;
    ctx.lineWidth = u * 0.075;
    ctx.beginPath();
    ctx.moveTo(ex - s * u * 0.13, h * 0.2);
    ctx.quadraticCurveTo(ex, h * 0.15, ex + s * u * 0.16, h * 0.19);
    ctx.stroke();
  }
};

/** The side of my head: the beard along the jaw, an ear, the faded hair above it.
 *  `front` is the canvas edge that faces the street. */
const mySide = (front: 'left' | 'right'): Draw => (ctx, w, h) => {
  const f = (x: number) => (front === 'left' ? x : w - x);
  ctx.fillStyle = C.hair;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(0, 0, w, h * 0.16);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(f(0), h * 0.45);
  ctx.lineTo(f(w * 0.52), h * 0.3);
  ctx.lineTo(f(w * 0.6), h * 0.7);
  ctx.quadraticCurveTo(f(w * 0.55), h, f(w * 0.3), h);
  ctx.lineTo(f(0), h);
  ctx.closePath();
  ctx.fill();
  ellipse(ctx, f(w * 0.68), h * 0.45, h * 0.09, h * 0.16, C.skin2);
  ellipse(ctx, f(w * 0.68), h * 0.45, h * 0.05, h * 0.1, C.skin);
};

/** The white tee under the open overshirt, and the gold chain. */
const shirt: Draw = (ctx, w, h) => {
  const cx = w / 2;
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.2, 0);
  ctx.lineTo(cx + w * 0.2, 0);
  ctx.lineTo(cx + w * 0.13, h);
  ctx.lineTo(cx - w * 0.13, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2E333A';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * w * 0.2, 0);
    ctx.lineTo(cx + s * w * 0.34, 0);
    ctx.lineTo(cx + s * w * 0.18, h * 0.42);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = h * 0.045;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.1, 0);
  ctx.quadraticCurveTo(cx, h * 0.42, cx + w * 0.1, 0);
  ctx.stroke();
  ctx.strokeStyle = '#3A4048';
  ctx.lineWidth = h * 0.03;
  ctx.strokeRect(cx + w * 0.24, h * 0.5, w * 0.16, h * 0.2);
};

const purrsuitFill: Fill = (ctx, _w, h) => {
  const g = ctx.createLinearGradient(0, h * 0.25, 0, h * 0.75);
  g.addColorStop(0, '#FFE45C');
  g.addColorStop(1, '#FF9A1F');
  return g;
};

/** The lot's sign: hazard stripes top and bottom, the words between. */
const lotSign = (text: string): Draw => (ctx, w, h) => {
  const band = h * 0.16;
  for (const y0 of [0, h - band]) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0, w, band);
    ctx.clip();
    ctx.fillStyle = C.yellow;
    ctx.fillRect(0, y0, w, band);
    ctx.fillStyle = C.black;
    for (let x = -band * 2; x < w + band; x += band * 1.6) {
      ctx.beginPath();
      ctx.moveTo(x, y0 + band);
      ctx.lineTo(x + band * 0.8, y0 + band);
      ctx.lineTo(x + band * 1.6, y0);
      ctx.lineTo(x + band * 0.8, y0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  label(text, C.black, { size: 0.54 })(ctx, w, h);
};

// ---------- Pieces used more than once ----------

function tree(b: Builder, x: number, z: number, y: number, leaf: string, heart: string) {
  b.add(x + 1, z + 1, y, 1, 1, 6, C.brown, 'round');
  b.layer(x, z, y + 6, 3, ['lll', 'lml', 'lll'], { l: leaf, m: heart });
  b.layer(x, z, y + 9, 3, ['.l.', 'lml', '.l.'], { l: leaf, m: heart });
  b.add(x + 1, z + 1, y + 12, 1, 1, 3, heart, 'round');
}

/** Where the street lamps stand. */
const LAMPS: [number, number][] = [[9, 15], [24, 15], [17, 11], [8, 9]];

function lamp(b: Builder, x: number, z: number) {
  b.add(x, z, 1, 1, 1, 9, C.black, 'round');
  b.add(x, z, 10, 1, 1, 1, C.lamp, 'round');
  b.add(x, z, 11, 1, 1, 1, C.black, 'round');
}

interface House {
  x: number; z: number; w: number; d: number; floors: number;
  wall: string; zocalo: string; trim: string; door: string;
  doorAt: [number, number]; windows: number[]; upper?: number[];
}

/** A house like the ones in Plazuela's town: white walls over a coloured skirt, coloured
 *  frames, and a stepped clay roof. Walls are hollow; nobody sees inside. */
function house(b: Builder, o: House) {
  const front = o.d - 1;
  for (let k = 0; k < o.floors; k++) {
    const rows: string[] = [];
    for (let zz = 0; zz < o.d; zz++) {
      let row = '';
      for (let xx = 0; xx < o.w; xx++) {
        const isFront = zz === front;
        const isSide = (xx === 0 || xx === o.w - 1) && !isFront && zz > 0;
        if (!isFront && !isSide && zz !== 0) { row += '.'; continue; }
        const low = k === 2 || k === 3, high = k === 5 || k === 6;
        let c = k < 2 ? 'z' : 'w';
        if (isFront && xx >= o.doorAt[0] && xx < o.doorAt[0] + o.doorAt[1] && k <= 2) c = 'd';
        else if (isFront && ((low && o.windows.includes(xx)) || (high && (o.upper ?? o.windows).includes(xx)))) c = 't';
        else if (isSide && zz === Math.floor(o.d / 2) && (low || high)) c = 't';
        row += c;
      }
      rows.push(row);
    }
    b.layer(o.x, o.z, k * 3, 3, rows, { z: o.zocalo, w: o.wall, d: o.door, t: o.trim });
  }
  let y = o.floors * 3;
  for (let lo = -1, hi = o.d; lo <= hi; lo++, hi--) {
    for (const color of [C.clay, C.clay2]) b.fill(o.x - 1, o.z + lo, o.w + 2, hi - lo + 1, y++, 1, color);
  }
}

/** Me, waving from a display stand with my name on the front. Built from bricks like
 *  everyone else in town; the face, the beard and the shirt are printed. x and z are the
 *  stand's back-left corner; it is 8 studs wide and 4 deep. */
export function me(b: Builder, x: number, z: number) {
  b.tag = 'me';
  const stand = b.add(x, z, 0, 8, 4, 4, C.black);
  b.print(stand, 'front', label('CHRIS ROSSO', '#FFFFFF', { size: 0.6 }));
  const bx = x + 2, y = 4;
  for (const lx of [bx, bx + 2]) {
    b.add(lx, z, y, 2, 3, 2, C.white);
    b.add(lx, z, y + 2, 2, 2, 3, C.denim);
  }
  b.fill(bx, z, 4, 3, y + 5, 3, C.denim);
  b.sub(() => {
    b.print(b.add(bx, z, y + 8, 4, 3, 6, C.jacket), 'front', shirt);
    // One arm down, the other up in a wave.
    b.add(bx - 1, z + 1, y + 8, 1, 1, 6, C.jacket);
    b.add(bx - 1, z + 1, y + 5, 1, 1, 3, C.skin, 'round');
    b.add(bx + 4, z + 1, y + 11, 1, 1, 3, C.jacket);
    b.add(bx + 5, z + 1, y + 11, 1, 1, 9, C.jacket);
    b.add(bx + 5, z + 1, y + 20, 1, 1, 3, C.skin, 'round');
  });
  b.sub(() => {
    const head = b.add(bx - 1, z, y + 14, 6, 4, 7, C.skin);
    b.print(head, 'front', myFace);
    b.print(head, 'right', mySide('left'));
    b.print(head, 'left', mySide('right'));
    b.fill(bx - 1, z, 6, 4, y + 21, 3, C.hair);
    b.fill(bx - 1, z + 2, 6, 2, y + 24, 1, C.hair);
  });
  b.tag = undefined;
}

// ---------- The town ----------

export function buildTown(lotText: string): Unit[][] {
  // Step 1: the street, my sign, a couple of trees and a taxi.
  const s0 = new Builder();
  const dash = Array.from({ length: BASE.w }, (_, x) => (x % 4 < 2 ? 'w' : 'g')).join('');
  s0.layer(0, 11, 0, 1, ['l'.repeat(BASE.w), 'g'.repeat(BASE.w), dash, 'g'.repeat(BASE.w), 'l'.repeat(BASE.w)],
    { l: C.lgray, g: C.dgray, w: C.white }, 'tile');
  s0.layer(0, 24, 0, 1, ['.........y', 'p.y.w.p.y.'], { y: C.yellow, p: C.pink, w: C.white }, 'round');
  tree(s0, 0, 16, 0, C.green, C.bgreen);
  me(s0, 1, 21);
  for (const [x, z] of LAMPS.slice(0, 3)) lamp(s0, x, z);
  // A Medellín taxi, so the street has somewhere to be going.
  s0.sub(() => {
    for (const [x, z] of [[14, 12], [14, 13], [17, 12], [17, 13]]) s0.add(x, z, 1, 1, 1, 2, C.black, 'round');
    s0.add(14, 12, 3, 4, 2, 1, C.dgray);
    s0.add(14, 12, 4, 4, 2, 3, C.yellow);
    s0.add(14, 12, 7, 2, 2, 3, C.aqua);
    s0.add(16, 12, 7, 2, 2, 1, C.yellow, 'tile');
    s0.add(14, 12, 10, 2, 2, 1, C.yellow, 'tile');
  }, 99);

  // Step 2: Plazuela. Two houses on a little plaza, a fountain, a tree in flower.
  const s1 = new Builder();
  s1.layer(1, 7, 0, 1, [
    'ddddddddddddddd',
    'dtttttttttttttd',
    'dtttttttttttttd',
    'ddddddddddddddd',
  ], { d: C.dtan, t: C.tan }, 'tile');
  house(s1, {
    x: 1, z: 1, w: 6, d: 6, floors: 5, wall: C.white, zocalo: C.azure, trim: C.blue, door: C.brown,
    doorAt: [2, 2], windows: [1, 4],
  });
  house(s1, {
    x: 8, z: 1, w: 7, d: 6, floors: 7, wall: C.white, zocalo: C.yellow, trim: C.green, door: C.green,
    doorAt: [3, 1], windows: [1, 5], upper: [1, 3, 5],
  });
  s1.fill(8, 7, 7, 1, 12, 1, C.brown);
  s1.layer(8, 7, 13, 3, ['b.b.b.b'], { b: C.brown }, 'round');
  s1.fill(8, 7, 7, 1, 16, 1, C.brown, 'tile');
  const plazuela = s1.add(2, 7, 12, 4, 1, 3, C.forest);
  s1.print(plazuela, 'front', label('PLAZUELA', '#FFFFFF', { size: 0.6 }));
  s1.layer(2, 7, 1, 3, ['####', '#..#', '#..#', '####'], { '#': C.lgray });
  s1.fill(3, 8, 2, 2, 1, 2, C.azure, 'tile');
  tree(s1, 12, 8, 1, C.pink, C.magenta);
  lamp(s1, ...LAMPS[3]);

  // Step 3: Petzone. The shop, its awning and sign, a bone on the roof, Dasha by the door.
  const s2 = new Builder();
  s2.fill(19, 8, 17, 3, 0, 1, C.lgray, 'tile');
  const FRONT = ['oggggddggggo', 'wggggddggggw', 'wggggddggggw', 'wwwwwwwwwwww'];
  for (let k = 0; k < 5; k++) {
    const rows: string[] = [];
    for (let zz = 0; zz < 7; zz++) {
      if (zz === 6) { rows.push(k < 4 ? FRONT[k] : ''); continue; }
      let row = '';
      for (let xx = 0; xx < 12; xx++) {
        const edge = xx === 0 || xx === 11 || zz === 0;
        row += !edge ? '.' : k === 0 ? 'o' : xx === 11 && zz >= 2 && zz <= 4 && k <= 2 ? 'g' : 'w';
      }
      rows.push(row);
    }
    s2.layer(20, 1, k * 3, 3, rows, { o: C.orange, w: C.white, g: C.aqua, d: C.dazure });
  }
  const petzone = s2.add(20, 7, 12, 12, 1, 3, C.orange);
  s2.print(petzone, 'front', label('PETZONE', '#FFFFFF', { size: 0.62 }));
  const stripes = Array.from({ length: 12 }, (_, i) => (i % 2 ? 'w' : 'o')).join('');
  s2.layer(20, 8, 9, 1, [stripes, stripes], { o: C.orange, w: C.white }, 'tile');
  s2.fill(20, 1, 12, 7, 15, 1, C.dgray);
  s2.layer(20, 1, 16, 1, ['############', ...Array(5).fill('#..........#'), '############'], { '#': C.lgray }, 'tile');
  s2.add(24, 4, 16, 1, 1, 9, C.dgray, 'round');
  s2.add(27, 4, 16, 1, 1, 9, C.dgray, 'round');
  s2.sub(() => {
    s2.layer(21, 4, 22, 3, ['XX......XX', 'XX......XX'], { X: C.white });
    s2.layer(21, 4, 25, 3, ['XXXXXXXXXX', 'XXXXXXXXXX'], { X: C.white });
    s2.layer(21, 4, 28, 3, ['XX......XX', 'XX......XX'], { X: C.white });
  });
  s2.layer(32, 8, 1, 3, ['oooo', 'oooo', 'wwww'], { o: C.orange, w: C.white });
  s2.layer(32, 8, 4, 3, ['oooo', 'owwo'], { o: C.orange, w: C.white });
  s2.add(31, 8, 1, 1, 1, 3, C.orange, 'round');
  s2.add(31, 8, 4, 1, 1, 3, C.orange, 'round');
  s2.add(31, 8, 7, 1, 1, 1, C.white, 'round');
  s2.sub(() => {
    const head = s2.add(32, 8, 7, 4, 3, 6, C.orange);
    s2.print(head, 'front', dashaFace);
    for (const x of [32, 35]) s2.print(s2.add(x, 9, 13, 1, 1, 3, C.orange), 'front', ear);
  });

  // Step 4: Purrsuit. A fish stall on the docks, and Jinx in his hoodie.
  const s3 = new Builder();
  s3.layer(10, 16, 0, 1, Array.from({ length: 10 }, (_, i) => (i % 2 ? 'b' : 'a').repeat(14)), { a: C.tan, b: C.nougat }, 'tile');
  s3.fill(11, 19, 8, 2, 1, 3, C.brown);
  s3.fill(11, 19, 8, 2, 4, 3, C.brown);
  s3.fill(11, 19, 8, 2, 7, 1, C.white, 'tile');
  for (const [x, z, c] of [[11, 19, C.orange], [14, 20, C.lorange], [16, 19, C.orange], [12, 20, C.azure]] as const) {
    s3.add(x, z, 8, 2, 1, 1, c);
  }
  s3.add(11, 18, 1, 1, 1, 12, C.black, 'round');
  s3.add(18, 18, 1, 1, 1, 12, C.black, 'round');
  const purrsuit = s3.add(11, 18, 13, 8, 1, 6, C.navy);
  s3.print(purrsuit, 'front', label('PURRSUIT', purrsuitFill, { stroke: '#3B1F00', size: 0.56 }));
  s3.add(11, 18, 19, 8, 1, 1, C.yellow, 'tile');
  s3.add(11, 22, 1, 2, 2, 3, C.brown);
  s3.add(11, 22, 4, 2, 2, 3, C.nougat);
  s3.add(11, 22, 7, 2, 1, 1, C.orange);
  s3.add(13, 23, 1, 2, 2, 3, C.nougat);
  for (const x of [19, 22]) {
    s3.add(x, 21, 1, 2, 3, 1, C.lime);
    s3.add(x, 21, 2, 2, 3, 2, C.white);
    s3.add(x, 21, 4, 2, 2, 3, C.black);
  }
  s3.fill(19, 21, 5, 3, 7, 3, C.dgray);
  s3.add(18, 22, 7, 1, 1, 3, C.black, 'round');
  s3.add(24, 22, 7, 1, 1, 3, C.black, 'round');
  s3.sub(() => {
    s3.print(s3.add(19, 21, 10, 5, 3, 6, C.purple), 'front', hoodie);
    s3.add(18, 22, 10, 1, 1, 6, C.purple);
    s3.add(24, 22, 10, 1, 1, 6, C.purple);
    s3.add(19, 21, 16, 5, 3, 1, C.purple);
  });
  s3.sub(() => {
    s3.print(s3.add(18, 21, 17, 7, 4, 7, C.black), 'front', jinxFace);
    for (const x of [18, 23]) s3.print(s3.add(x, 22, 24, 2, 1, 3, C.black), 'front', ear);
  });

  // Step 5: the empty lot, its sign, and a crane lowering the first brick.
  const s4 = new Builder();
  const border: string[] = [];
  for (let z = 0; z < 10; z++) {
    let row = '';
    for (let x = 0; x < 10; x++) row += x === 0 || x === 9 || z === 0 || z === 9 ? ((x + z) % 2 ? 'k' : 'y') : '.';
    border.push(row);
  }
  s4.layer(PLOT.x - 1, PLOT.z - 1, 0, 1, border, { y: C.yellow, k: C.black }, 'tile');
  s4.add(27, 16, 1, 1, 1, 6, C.dgray, 'round');
  s4.add(32, 16, 1, 1, 1, 6, C.dgray, 'round');
  s4.print(s4.add(27, 16, 7, 6, 1, 6, C.white), 'front', lotSign(lotText));
  s4.add(27, 16, 13, 6, 1, 1, C.yellow, 'tile');
  for (let i = 0; i < 10; i++) s4.add(35, 22, i * 3, 1, 1, 3, C.yellow);
  s4.sub(() => {
    s4.add(28, 22, 30, 8, 2, 1, C.yellow);
    s4.add(30, 23, 12, 0, 0, 18, C.black, 'bar');
    s4.add(29, 22, 9, 2, 2, 3, C.red);
  }, 99);

  return [s0.units, s1.units, s2.units, s3.units, s4.units];
}
