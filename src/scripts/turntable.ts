// A brick model on a turntable: it builds itself the first time it scrolls into view, then
// turns gently. Drag to turn it round; tap it and every brick hops, from the bottom up.
// The About page's portrait and each case study's model are built on this. A case study can
// also step through it like building instructions, and pull it apart to show its seams.
import * as THREE from 'three';
import type { Part, Unit } from './brick-kit';
import { type Live, baseplate, hopAll, lightScene, makeRenderer, mountUnits, poseUnit } from './brick-scene';

export interface Turntable {
  /** Built in order, each step starting a little after the one before. */
  steps: Unit[][];
  /** A baseplate under the model, in town studs; without one it stands on the page with its shadow. */
  plate?: { x: number; z: number; w: number; d: number };
  centre: [number, number, number];
  /** How much has to fit around the centre. */
  radius: number;
  /** Half the width that has to fit across, when that is more than the radius (a wide town). */
  wide?: number;
  /** Angles (radians): round from the front, and up from the ground. */
  az?: number;
  el?: number;
  /** How long the build takes, in ms. */
  duration?: number;
}

/** What a page can do with a model once it's up. */
export interface Model {
  /** The building instructions, bottom up: each step's parts, the way a booklet's bag lists them. */
  steps: Part[][];
  /** Shows the model up to instruction step k, that step's bricks dropping in; null shows it whole. */
  show(k: number | null): void;
  /** Every brick tinted apart from its neighbours and the layers lifted off each other, so the
   *  joints between bricks show: how each layer was split into real brick sizes. */
  seams(on: boolean): void;
  /** How many bricks it takes, and how many different shapes. */
  stats: { bricks: number; shapes: number };
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** How far the seams view lifts each layer: about a third of its height off the one below. */
const LIFT = 0.3;
/** Lighter, as is, and darker: neighbouring bricks rarely get the same, so where one stops shows. */
const SHADES = [0.16, 0, -0.16];

/** Splits a build into instruction steps: bottom up, a height at a time, with thin layers put
 *  together so each step has a real handful of parts, and never across one of the model's own
 *  steps (a project of the town, say). */
function instructions(lives: Live[]) {
  const total = lives.reduce((n, l) => n + l.insts.length, 0);
  const target = Math.max(4, Math.ceil(total / 16));
  const steps: Live[][] = [];
  let cur: Live[] = [], parts = 0, y = NaN, phase = -1;
  for (const live of lives) {
    if (!cur.length || live.step !== phase || (live.y !== y && parts >= target)) {
      cur = [];
      parts = 0;
      steps.push(cur);
    }
    cur.push(live);
    parts += live.insts.length;
    y = live.y;
    phase = live.step;
  }
  return steps;
}

export function turntable(root: HTMLElement, o: Turntable): Model | null {
  const canvas = root.querySelector('canvas');
  const renderer = canvas && makeRenderer(canvas);
  // No WebGL: say so with a class, so the page can fold the empty box away.
  if (!renderer) { root.classList.add('is-flat'); return null; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 400);
  const centre = new THREE.Vector3(...o.centre);
  const ground = new THREE.Vector3(centre.x, 0, centre.z);
  const reach = o.radius * 1.7;
  // The sun high and in front, so shadows stay short and inside the frame.
  const { sun } = lightScene(renderer, scene, ground, reach);
  sun.position.set(ground.x - reach * 0.3, reach * 1.5, ground.z + reach * 0.8);

  if (o.plate) {
    const plate = baseplate(o.plate.w, o.plate.d);
    plate.position.set(o.plate.x, 0, o.plate.z);
    scene.add(plate);
  } else {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x17191d, opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }
  const { lives, meshes } = mountUnits(scene, o.steps, new THREE.Sphere(centre, o.radius * 2));
  const S = o.steps.length, L = 1 / (1 + 0.6 * (S - 1)), gap = 0.6 * L;

  // The building instructions, and where each unit falls in them.
  const plan = instructions(lives);
  const stepOf = new Map<Live, number>(), rank = new Map<Live, number>();
  plan.forEach((units, i) => units.forEach((live, j) => { stepOf.set(live, i); rank.set(live, j); }));

  /** dirty: bricks moved, so the shadows need redoing too. redraw: only the view changed. */
  let dirty = true, redraw = false;
  const resize = () => {
    renderer.setSize(root.clientWidth, root.clientHeight, false);
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();
    redraw = true;
  };
  new ResizeObserver(resize).observe(root);
  resize();

  // Drag turns it; let go and it eases back. A tap on a brick says hello.
  let turn = 0, drag: { x: number; turn: number; moved: boolean } | null = null;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hello = () => { if (!reduce && start >= 0) hopAll(lives, performance.now(), Math.max(6, 500 / lives.length)); };
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, turn, moved: false };
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    turn = drag.turn - dx * 0.008;
    redraw = true;
  });
  const release = (e: PointerEvent) => {
    if (drag && !drag.moved && e.type === 'pointerup') {
      const r = canvas!.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.intersectObjects(meshes, false).length) hello();
    }
    drag = null;
  };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
  addEventListener('logo:hello', hello);

  // It builds the first time it comes into view, and rests while out of it.
  let visible = false, start = -1;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && start < 0) start = performance.now(); }, { threshold: 0.25 }).observe(root);

  /** null: the whole model, built the first time it's seen. A number: instruction step k. */
  let mode: number | null = null, shownAt = 0;
  let lift = 0, liftTo = 0;

  const duration = o.duration ?? 1800;
  let last = performance.now(), drawn = 0, shown = false;
  function frame(now: number) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible) return;
    let busy = false;
    if (lift !== liftTo) {
      lift += (liftTo - lift) * (reduce ? 1 : 1 - Math.exp(-dt * 9));
      if (Math.abs(liftTo - lift) < 1e-3) lift = liftTo;
      busy = true;
    }
    const p = start < 0 ? 0 : reduce ? 1 : Math.min(1, (now - start - 150) / duration);
    for (const live of lives) {
      let q: number;
      if (mode === null) {
        const sp = reduce ? (p > 0 ? 1 : 0) : Math.min(1, Math.max(0, (p - live.step * gap) / L));
        q = reduce ? sp : Math.min(1, Math.max(0, (sp - live.t0) / live.dur));
      } else {
        // Instructions: the steps before are built, the ones after aren't, and this one's
        // bricks drop in one after another, the way you'd add them.
        const i = stepOf.get(live)!;
        if (i !== mode) q = i < mode ? 1 : 0;
        else {
          const n = plan[i].length, j = rank.get(live)!;
          const delay = n > 1 ? (j / (n - 1)) * Math.min(900, n * 70) : 0;
          q = reduce ? 1 : clamp01((now - shownAt - delay) / 420);
        }
      }
      if (poseUnit(live, q, now, reduce, lift) || live.hop > now) busy = true;
    }
    // Let go, it eases back to its angle; with reduced motion it stays where it was left.
    if (!drag && !reduce) turn += (0 - turn) * (1 - Math.exp(-dt * 1.2));
    const az = (o.az ?? 0.45) + turn + (reduce ? 0 : Math.sin(now / 2600) * 0.1);
    const el = o.el ?? 0.45;
    const dist = Math.max(o.radius, (o.wide ?? o.radius) / (camera.aspect * 0.95)) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(centre.x + Math.sin(az) * Math.cos(el) * dist, centre.y + Math.sin(el) * dist, centre.z + Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(centre);
    // Full rate while bricks move or someone drags; the idle sway only needs about 20 frames a second.
    if (busy || dirty || redraw || (!reduce && now - drawn > 50)) {
      renderer!.shadowMap.needsUpdate = busy || dirty;
      renderer!.render(scene, camera);
      drawn = now;
      dirty = redraw = false;
      if (!shown) { shown = true; root.classList.add('is-ready'); }
    }
  }
  requestAnimationFrame(frame);

  // Seams: each brick in its own colour, a shade lighter or darker by a hash of its place in
  // its batch, so two bricks side by side rarely match and the line between them shows.
  const plain = new Map<THREE.InstancedMesh, Float32Array>();
  const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
  function tint(on: boolean) {
    for (const mesh of meshes) {
      const colors = mesh.instanceColor;
      if (!colors) continue;
      if (!plain.has(mesh)) plain.set(mesh, (colors.array as Float32Array).slice());
      const was = plain.get(mesh)!;
      for (let i = 0; i < mesh.count; i++) {
        c.fromArray(was, i * 3);
        if (on) {
          c.getHSL(hsl, THREE.SRGBColorSpace);
          const shade = SHADES[(Math.imul(i + 1, 2654435761) >>> 0) % SHADES.length];
          c.setHSL(hsl.h, hsl.s, Math.min(0.94, Math.max(0.06, hsl.l + shade)), THREE.SRGBColorSpace);
        }
        mesh.setColorAt(i, c);
      }
      colors.needsUpdate = true;
    }
  }

  return {
    steps: plan.map((units) => units.flatMap((live) => live.insts.map((x) => x.part))),
    show(k) {
      // Whatever the first build had left to do, it's done: back to the whole model is instant.
      if (start < 0) start = performance.now() - 1e6;
      mode = k === null ? null : Math.max(0, Math.min(plan.length - 1, k));
      shownAt = performance.now();
      dirty = true;
    },
    seams(on) {
      liftTo = on ? LIFT : 0;
      tint(on);
      dirty = true;
    },
    stats: { bricks: lives.reduce((n, l) => n + l.insts.length, 0), shapes: meshes.length },
  };
}
