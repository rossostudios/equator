// The brick kit: what a part is, the builder the town is drawn with, and the geometry
// each part renders as. Sizes follow the real thing: a stud is 1 unit across, a plate
// is 0.4 tall and a brick is three plates.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const PLATE = 0.4;

/** brick has studs, tile is smooth on top, round is a 1x1 cylinder, bar is a thin rod
 *  (a crane's cable) whose x and z are its centre rather than its corner. */
export type Kind = 'brick' | 'tile' | 'round' | 'bar';

/** x and z in studs, y in plates, measured from the part's lowest corner. */
export interface Part { x: number; y: number; z: number; w: number; d: number; h: number; color: string; kind: Kind }

export type Face = 'front' | 'back' | 'left' | 'right';
export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
/** A printed face: a sign's lettering, a cat's face. */
export interface Print { part: Part; face: Face; draw: Draw }
/** What drops in one go: a single part, or a sub-assembly built off to the side first.
 *  Units build bottom up; `at` overrides the height a unit is sorted by. `tag` names what
 *  a unit belongs to, so a scene can find, say, every brick of the figure of me. */
export interface Unit { parts: Part[]; prints: Print[]; at?: number; tag?: string }

/* Biggest first, so a wall becomes a few long bricks rather than a pile of 1x1s. */
const SIZES: [number, number][] = [
  [2, 8], [8, 2], [2, 6], [6, 2], [2, 4], [4, 2], [2, 3], [3, 2], [2, 2],
  [1, 8], [8, 1], [1, 6], [6, 1], [1, 4], [4, 1], [1, 3], [3, 1], [1, 2], [2, 1], [1, 1],
];
const TURNED = SIZES.map(([w, d]) => [d, w] as [number, number]);

/** Splits a picture of one layer into bricks. Every other layer is read from the opposite
 *  corner and prefers the other orientation, so seams stagger and corners interlock the
 *  way a real wall's do, instead of stacking into columns. */
function merge(rows: string[], flip: boolean) {
  const D = rows.length;
  const W = Math.max(...rows.map((r) => r.length));
  const cell = (x: number, z: number) => {
    if (x < 0 || z < 0 || x >= W || z >= D) return '';
    const c = flip ? rows[D - 1 - z][W - 1 - x] : rows[z][x];
    return c && c !== '.' && c !== ' ' ? c : '';
  };
  const used = new Uint8Array(W * D);
  const fits = (x: number, z: number, w: number, d: number, c: string) => {
    for (let j = z; j < z + d; j++) for (let i = x; i < x + w; i++) {
      if (cell(i, j) !== c || used[j * W + i]) return false;
    }
    return true;
  };
  const out: { x: number; z: number; w: number; d: number; c: string }[] = [];
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const c = cell(x, z);
    if (!c || used[z * W + x]) continue;
    for (const [w, d] of flip ? TURNED : SIZES) {
      if (!fits(x, z, w, d, c)) continue;
      for (let j = z; j < z + d; j++) for (let i = x; i < x + w; i++) used[j * W + i] = 1;
      out.push(flip ? { x: W - x - w, z: D - z - d, w, d, c } : { x, z, w, d, c });
      break;
    }
  }
  return out;
}

export class Builder {
  units: Unit[] = [];
  /** Given to every unit made while it is set. */
  tag?: string;
  private open: Unit | null = null;

  add(x: number, z: number, y: number, w: number, d: number, h: number, color: string, kind: Kind = 'brick'): Part {
    const part: Part = { x, y, z, w, d, h, color, kind };
    if (this.open) this.open.parts.push(part);
    else this.units.push({ parts: [part], prints: [], tag: this.tag });
    return part;
  }

  /** Everything added inside fn drops as one piece. */
  sub(fn: () => void, at?: number) {
    const unit: Unit = { parts: [], prints: [], at, tag: this.tag };
    this.open = unit;
    fn();
    this.open = null;
    if (unit.parts.length) this.units.push(unit);
    return unit;
  }

  print(part: Part, face: Face, draw: Draw) {
    const unit = this.open?.parts.includes(part) ? this.open : this.units.find((u) => u.parts.includes(part));
    unit?.prints.push({ part, face, draw });
  }

  /** One layer as a picture: each string is a row along x, the first row furthest back.
   *  `key` maps a character to a colour; '.' is empty. */
  layer(x0: number, z0: number, y: number, h: number, rows: string[], key: Record<string, string>, kind: Kind = 'brick') {
    if (kind === 'round') {
      rows.forEach((row, z) => [...row].forEach((c, x) => key[c] && this.add(x0 + x, z0 + z, y, 1, 1, h, key[c], 'round')));
      return;
    }
    for (const b of merge(rows, Math.round(y / h) % 2 === 1)) {
      if (key[b.c]) this.add(x0 + b.x, z0 + b.z, y, b.w, b.d, h, key[b.c], kind);
    }
  }

  fill(x0: number, z0: number, w: number, d: number, y: number, h: number, color: string, kind: Kind = 'brick') {
    this.layer(x0, z0, y, h, Array(d).fill('#'.repeat(w)), { '#': color }, kind);
  }
}

// ---------- Geometry ----------

/** A stud with a slight chamfer on its top edge, which is what catches the light. */
export const studGeometry = (() => {
  const body = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 18).translate(0, 0.075, 0);
  const lip = new THREE.CylinderGeometry(0.255, 0.3, 0.045, 18).translate(0, 0.1725, 0);
  return mergeGeometries([body, lip])!;
})();

/** How far a box's printable face sits inside the part's footprint: the gap between
 *  neighbouring bricks plus the rounded edge. */
const GAP = 0.015, BEVEL = 0.05;
const geometries = new Map<string, THREE.BufferGeometry>();

export function geometryFor(p: Part) {
  const key = `${p.kind}:${p.w}:${p.d}:${p.h}`;
  let geo = geometries.get(key);
  if (geo) return { key, geo };
  const H = p.h * PLATE;
  const pieces: THREE.BufferGeometry[] = [];
  if (p.kind === 'round') {
    pieces.push(new THREE.CylinderGeometry(0.485, 0.485, H - 0.01, 28).translate(0.5, H / 2, 0.5));
  } else if (p.kind === 'bar') {
    pieces.push(new THREE.CylinderGeometry(0.06, 0.06, H, 10).translate(0, H / 2, 0));
  } else {
    const r = Math.min(BEVEL, (H - 0.012) / 2 - 0.001);
    pieces.push(new RoundedBoxGeometry(p.w - GAP * 2, H - 0.012, p.d - GAP * 2, 2, r).translate(p.w / 2, H / 2, p.d / 2));
  }
  if (p.kind === 'brick' || p.kind === 'round') {
    for (let i = 0; i < p.w; i++) for (let j = 0; j < p.d; j++) pieces.push(studGeometry.clone().translate(i + 0.5, H - 0.012, j + 0.5));
  }
  // Rounded boxes come unindexed and cylinders indexed; merging needs them alike.
  geo = mergeGeometries(pieces.map((g) => (g.index ? g.toNonIndexed() : g)))!;
  geometries.set(key, geo);
  return { key, geo };
}

/** Draws a print onto a canvas the size of the face it goes on, background in the part's
 *  own colour, so the print reads as ink on the brick rather than a sticker. */
export function printTexture(p: Part, face: Face, draw: Draw) {
  const along = face === 'front' || face === 'back' ? p.w : p.d;
  const fw = along - GAP * 2 - BEVEL * 2;
  const fh = p.h * PLATE - 0.012 - BEVEL * 2;
  const scale = Math.min(180, 1024 / Math.max(fw, fh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(fw * scale);
  canvas.height = Math.round(fh * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = p.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, fw, fh };
}

/** Where a print's plane sits: just proud of the face it is printed on. */
export function printPlacement(p: Part, face: Face) {
  const H = p.h * PLATE;
  const cy = p.y * PLATE + H / 2;
  const e = GAP - 0.004;
  switch (face) {
    case 'front': return { pos: new THREE.Vector3(p.x + p.w / 2, cy, p.z + p.d - e), rotY: 0 };
    case 'back': return { pos: new THREE.Vector3(p.x + p.w / 2, cy, p.z + e), rotY: Math.PI };
    case 'right': return { pos: new THREE.Vector3(p.x + p.w - e, cy, p.z + p.d / 2), rotY: Math.PI / 2 };
    case 'left': return { pos: new THREE.Vector3(p.x + e, cy, p.z + p.d / 2), rotY: -Math.PI / 2 };
  }
}
