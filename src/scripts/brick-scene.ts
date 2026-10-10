// What every brick scene on the site shares: the renderer and light, and turning units into
// instanced bricks with their prints that drop into place. The home page's town and the
// About page's portrait are both built on this.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PLATE, type Part, type Unit, geometryFor, printPlacement, printTexture, studGeometry } from './brick-kit';
import { C } from './brick-colors';

/** A unit as it lives in a scene: which step builds it, the height it is sorted by, when in
 *  that step it drops, its instances and prints, and where it is in its fall or its hop. */
export interface Live {
  step: number; y: number; t0: number; dur: number; tag?: string;
  insts: { mesh: THREE.InstancedMesh; i: number; part: Part }[];
  prints: { mesh: THREE.Mesh; base: THREE.Vector3; y: number }[];
  q: number; dy: number; hop: number; lift: number;
}

/** null when the browser can't do WebGL; the page is complete without the scene. */
export function makeRenderer(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Shadows are redrawn only when a scene says something moved (shadowMap.needsUpdate).
  renderer.shadowMap.autoUpdate = false;
  return renderer;
}

/** A soft room for the plastic to reflect, sky and ground fill, and a warm sun from the
 *  front left whose shadows cover `reach` units around `centre`. */
export function lightScene(renderer: THREE.WebGLRenderer, scene: THREE.Scene, centre: THREE.Vector3, reach: number) {
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  room.dispose();
  scene.environmentIntensity = 0.5;
  scene.add(new THREE.HemisphereLight(0xfaf7f2, 0xc9b99a, 1.1));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.3);
  sun.position.set(centre.x - reach * 0.66, centre.y + reach * 1.4, centre.z + reach * 0.8);
  sun.target.position.copy(centre);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 1, far: reach * 4 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  scene.add(sun, sun.target);
  return { sun };
}

export const plastic = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0 });


/** A green baseplate w by d studs, its top at y = 0 and its corner at the origin, with the
 *  booklet page under it: a floor that shows only the plate's shadow. */
export function baseplate(w: number, d: number) {
  const group = new THREE.Group();
  const green = new THREE.MeshStandardMaterial({ color: C.bgreen, roughness: 0.38 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(w - 0.04, 0.32, d - 0.04, 2, 0.06), green);
  base.position.set(w / 2, -0.16, d / 2);
  base.castShadow = base.receiveShadow = true;
  const studs = new THREE.InstancedMesh(studGeometry, green, w * d);
  const m = new THREE.Matrix4();
  for (let x = 0, i = 0; x < w; x++) for (let z = 0; z < d; z++, i++) studs.setMatrixAt(i, m.makeTranslation(x + 0.5, -0.012, z + 0.5));
  studs.castShadow = studs.receiveShadow = true;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ color: 0x17191d, opacity: 0.14 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(w / 2, -0.33, d / 2);
  floor.receiveShadow = true;
  group.add(base, studs, floor);
  return group;
}

/** Puts every step's units in the scene as instanced bricks, hidden until they drop. Units
 *  build bottom up; within a step they are spread over its first 80%, so the last brick
 *  lands before the step ends. `bounds` stands in for the meshes' own: instances start at
 *  zero scale, so bounds computed from them would cull the whole scene. */
export function mountUnits(scene: THREE.Scene, steps: Unit[][], bounds: THREE.Sphere) {
  const lives: Live[] = [];
  const buckets = new Map<string, { geo: THREE.BufferGeometry; items: { part: Part; live: Live }[] }>();
  const lowest = (u: Unit) => u.at ?? Math.min(...u.parts.map((p) => p.y));
  steps.forEach((units, step) => {
    const order = units.map((u, i) => ({ u, i, y: lowest(u) })).sort((a, b) => a.y - b.y || a.i - b.i);
    order.forEach(({ u, y }, k) => {
      const live: Live = { step, y, t0: (k / order.length) * 0.8, dur: 0.2, tag: u.tag, insts: [], prints: [], q: -1, dy: 0, hop: -1, lift: 0 };
      lives.push(live);
      for (const part of u.parts) {
        const { key, geo } = geometryFor(part);
        if (!buckets.has(key)) buckets.set(key, { geo, items: [] });
        buckets.get(key)!.items.push({ part, live });
      }
      for (const pr of u.prints) {
        const { tex, fw, fh } = printTexture(pr.part, pr.face, pr.draw);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), mat);
        const { pos, rotY } = printPlacement(pr.part, pr.face);
        mesh.position.copy(pos);
        mesh.rotation.y = rotY;
        mesh.receiveShadow = true;
        mesh.visible = false;
        live.prints.push({ mesh, base: pos.clone(), y: pr.part.y * PLATE });
        scene.add(mesh);
      }
    });
  });

  const color = new THREE.Color();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const meshes: THREE.InstancedMesh[] = [];
  for (const { geo, items } of buckets.values()) {
    const mesh = new THREE.InstancedMesh(geo, plastic, items.length);
    items.forEach(({ part, live }, i) => {
      mesh.setColorAt(i, color.set(part.color));
      mesh.setMatrixAt(i, hidden);
      live.insts.push({ mesh, i, part });
    });
    mesh.userData.lives = items.map((it) => it.live);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.boundingSphere = bounds;
    meshes.push(mesh);
    scene.add(mesh);
  }
  return { lives, meshes };
}

/** A brick's fall: it drops in from above, speeding up, then settles with a small bounce. */
export const fall = (q: number, reduce: boolean) => {
  if (reduce) return 0;
  if (q < 0.72) { const f = q / 0.72; return 4.2 * (1 - f * f); }
  return Math.sin((Math.PI * (q - 0.72)) / 0.28) * 0.16;
};

const m = new THREE.Matrix4();
/** Moves a unit to where it is at progress q (0 hidden, 1 landed), plus any hop a tap gave
 *  it. `lift` spreads the layers apart (0.3 lifts each by 30% of its height off the plate),
 *  so the joints between them show. Returns whether anything moved, so the caller knows to render. */
export function poseUnit(live: Live, q: number, now: number, reduce: boolean, lift = 0) {
  let dy = q > 0 ? fall(q, reduce) : 0;
  // A hop can be booked for a moment from now, to ripple through a figure; until then, wait.
  if (live.hop >= 0 && live.hop <= now) {
    const t = (now - live.hop) / 420;
    if (t >= 1) live.hop = -1;
    else dy += Math.sin(Math.PI * t) * 0.9;
  }
  if (q === live.q && dy === live.dy && lift === live.lift) return false;
  live.q = q;
  live.dy = dy;
  live.lift = lift;
  for (const { mesh, i, part } of live.insts) {
    if (q <= 0) m.makeScale(0, 0, 0);
    else m.makeTranslation(part.x, part.y * PLATE * (1 + lift) + dy, part.z);
    mesh.setMatrixAt(i, m);
    mesh.instanceMatrix.needsUpdate = true;
  }
  for (const pr of live.prints) {
    pr.mesh.visible = q > 0;
    pr.mesh.position.set(pr.base.x, pr.base.y + pr.y * lift + dy, pr.base.z);
  }
  return true;
}

/** Every unit in `lives` hops, one after another from the bottom up: a wave of hello. */
export function hopAll(lives: Live[], now = performance.now(), gap = 18) {
  lives.forEach((l, i) => { l.hop = now + i * gap; });
}
