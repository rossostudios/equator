// The pile on /build: every part a visitor picks drops onto a stack beside the brick figure
// of me, with its name printed on the front. Tap a brick to take it off; drag to turn the
// whole thing; when the brief goes out, everything hops.
import * as THREE from 'three';
import { Builder, PLATE, type Part, geometryFor, printPlacement, printTexture } from './brick-kit';
import { baseplate, hopAll, lightScene, makeRenderer, mountUnits, poseUnit } from './brick-scene';
import { C } from './brick-colors';
import { label, me } from './brick-town';

export interface Pick { id: string; color: string; ink: string; print: string }

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** The plate, and the corner the pile stands on: bricks 6 studs wide, 2 deep, stepping
 *  one stud left and right as they go up, the way you'd stack them by hand. */
const W = 18, D = 8, TX = 10, TZ = 3;

export function mount(root: HTMLElement, onRemove: (id: string) => void) {
  const canvas = root.querySelector('canvas')!;
  const renderer = makeRenderer(canvas);
  // No WebGL: say so with a class, so the page can fold the empty box away.
  if (!renderer) { root.classList.add('is-flat'); return null; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 300);
  const { sun } = lightScene(renderer, scene, new THREE.Vector3(W / 2, 0, D / 2), 20);
  sun.position.set(W / 2 - 6, 30, D / 2 + 16);
  scene.add(baseplate(W, D));

  const b = new Builder();
  me(b, 0, 2);
  const { lives: figure, meshes: figureMeshes } = mountUnits(scene, [b.units], new THREE.Sphere(new THREE.Vector3(4, 6, 4), 12));

  type Brick = { id: string; group: THREE.Group; y: number; vy: number; ty: number; x: number; tx: number; s: number; leaving: boolean };
  const bricks = new Map<string, Brick>();
  const hits: THREE.Mesh[] = [];

  function make(p: Pick): THREE.Group {
    const part: Part = { x: 0, y: 0, z: 0, w: 6, d: 2, h: 3, color: p.color, kind: 'brick' };
    const group = new THREE.Group();
    const body = new THREE.Mesh(geometryFor(part).geo, new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.3 }));
    body.castShadow = body.receiveShadow = true;
    body.userData.id = p.id;
    const { tex, fw, fh } = printTexture(part, 'front', label(p.print, p.ink, { size: 0.58 }));
    const print = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    print.position.copy(printPlacement(part, 'front').pos);
    print.userData.id = p.id;
    group.add(body, print);
    hits.push(body, print);
    scene.add(group);
    return group;
  }

  function update(picks: Pick[]) {
    for (const brick of bricks.values()) brick.leaving = !picks.some((p) => p.id === brick.id);
    picks.forEach((p, i) => {
      let brick = bricks.get(p.id);
      if (!brick) {
        brick = { id: p.id, group: make(p), y: i * 3 * PLATE + (reduce ? 0 : 9), vy: 0, ty: 0, x: TX + (i % 2), tx: 0, s: 1, leaving: false };
        bricks.set(p.id, brick);
      }
      brick.ty = i * 3 * PLATE;
      brick.tx = TX + (i % 2);
      // Picked again on its way out: it comes back whole.
      brick.leaving = false;
      brick.s = 1;
    });
    height = Math.max(1, picks.length) * 3 * PLATE;
    dirty = true;
  }

  function cheer() {
    if (reduce) return;
    const now = performance.now();
    hopAll(figure, now, 25);
    [...bricks.values()].forEach((brick, i) => setTimeout(() => { brick.vy = 7; }, i * 70));
  }

  /** A picture of the pile to attach to the email: the render on the booklet's blue, the parts
   *  listed under it, and where it came from. */
  function snapshot(title: string, parts: { name: string; color: string }[], footer: string): Promise<Blob | null> {
    const W2 = 1200, H2 = 760, out = document.createElement('canvas');
    out.width = W2; out.height = 1000;
    const ctx = out.getContext('2d')!;
    const sky = ctx.createRadialGradient(W2 * 0.55, H2 * 0.4, 40, W2 * 0.55, H2 * 0.4, W2 * 0.75);
    sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.6, '#f6f4ef'); sky.addColorStop(1, '#ebe7df');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W2, H2);
    // Render once at the picture's size, take it, and put the canvas back the way it was.
    renderer!.setPixelRatio(1);
    renderer!.setSize(W2, H2, false);
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    // The pile may have changed while it was out of view and its loop was resting: show it finished.
    settle();
    place(performance.now());
    renderer!.shadowMap.needsUpdate = true;
    renderer!.render(scene, camera);
    ctx.drawImage(renderer!.domElement, 0, 0, W2, H2);
    renderer!.setPixelRatio(Math.min(devicePixelRatio, 2));
    resize();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, H2, W2, 1000 - H2);
    ctx.fillStyle = C.black;
    ctx.font = '800 44px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillText(title, 56, H2 + 74);
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    let x = 56, y = H2 + 128;
    for (const p of parts) {
      const w = ctx.measureText(p.name).width + 58;
      if (x + w > W2 - 56) { x = 56; y += 44; }
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.roundRect(x, y - 16, 34, 18, 3); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x + 4, y - 22, 10, 7, 2); ctx.roundRect(x + 20, y - 22, 10, 7, 2); ctx.fill();
      ctx.fillStyle = C.black;
      ctx.fillText(p.name, x + 44, y);
      x += w + 10;
    }
    ctx.fillStyle = '#6c7078';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(footer, W2 - 56, 1000 - 36);
    return new Promise((done) => out.toBlob(done, 'image/png'));
  }

  // Size, drag to turn, tap a brick to take it off, tap me to say hello.
  function resize() {
    renderer!.setSize(root.clientWidth, root.clientHeight, false);
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();
    redraw = true;
  }
  /** dirty: bricks moved, so the shadows need redoing too. redraw: only the view changed. */
  let dirty = true, redraw = false, height = 1.2;
  new ResizeObserver(resize).observe(root);
  resize();

  let turn = 0, drag: { x: number; turn: number; moved: boolean } | null = null;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, turn, moved: false };
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag) return;
    redraw = true;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    turn = Math.max(-1, Math.min(1, drag.turn - dx * 0.008));
  });
  const release = (e: PointerEvent) => {
    if (drag && !drag.moved && e.type === 'pointerup') {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects([...hits, ...figureMeshes], false)[0];
      if (hit?.object.userData.id) onRemove(hit.object.userData.id);
      else if (hit) hopAll(figure);
    }
    drag = null;
  };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
  addEventListener('logo:hello', () => { if (!reduce) hopAll(figure); });

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(root);

  /** Take a brick off for good: its colour and printed name were its own; the brick shape is shared, so it stays. */
  function drop(brick: Brick) {
    scene.remove(brick.group);
    const [body, print] = brick.group.children as THREE.Mesh[];
    (body.material as THREE.Material).dispose();
    const ink = print.material as THREE.MeshStandardMaterial;
    ink.map?.dispose();
    ink.dispose();
    print.geometry.dispose();
    for (const m of brick.group.children) { const i = hits.indexOf(m as THREE.Mesh); if (i >= 0) hits.splice(i, 1); }
    bricks.delete(brick.id);
    dirty = true;
  }
  /** Every brick straight to where it is going, and the camera to the pile's height. */
  function settle() {
    for (const brick of [...bricks.values()]) {
      if (brick.leaving) { drop(brick); continue; }
      brick.y = brick.ty; brick.vy = 0; brick.x = brick.tx; brick.s = 1;
      brick.group.position.set(brick.x, brick.y, TZ);
      brick.group.scale.setScalar(1);
    }
    view.h = Math.max(12.4, height + 1.5);
    view.r = Math.max(11, view.h * 0.62);
  }

  const look = new THREE.Vector3(), view = { h: 13, r: 12 };
  function place(now: number) {
    const az = 0.42 + turn + (reduce ? 0 : Math.sin(now / 2600) * 0.08);
    const el = 0.3;
    const dist = view.r / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.min(1, camera.aspect * 0.95);
    look.set(W / 2, view.h * 0.46, D / 2);
    camera.position.set(look.x + Math.sin(az) * Math.cos(el) * dist, look.y + Math.sin(el) * dist, look.z + Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(look);
  }
  let start = -1, last = performance.now(), drawn = 0, shown = false;
  function frame(now: number) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (start < 0) start = now;
    let busy = false;

    const p = reduce ? 1 : Math.min(1, (now - start - 150) / 1200);
    for (const live of figure) {
      const q = reduce ? 1 : Math.min(1, Math.max(0, (p - live.t0) / live.dur));
      if (poseUnit(live, q, now, reduce) || live.hop > now) busy = true;
    }

    // Each brick springs to its place in the pile; one taken off flies up and shrinks away.
    for (const brick of bricks.values()) {
      if (brick.leaving) {
        brick.y += dt * 9;
        brick.s -= dt * 4;
        if (brick.s <= 0) { drop(brick); continue; }
      } else if (reduce) {
        brick.y = brick.ty;
      } else {
        brick.vy += ((brick.ty - brick.y) * 80 - brick.vy * 6) * dt;
        brick.y += brick.vy * dt;
        // It lands on the brick below rather than sinking into it, and bounces a little.
        if (brick.y < brick.ty) {
          brick.y = brick.ty;
          brick.vy = Math.abs(brick.vy) < 1 ? 0 : -brick.vy * 0.35;
        }
      }
      brick.x += (brick.tx - brick.x) * (reduce ? 1 : 1 - Math.exp(-dt * 10));
      brick.group.position.set(brick.x, brick.y, TZ);
      brick.group.scale.setScalar(Math.max(0, brick.s));
      if (Math.abs(brick.vy) > 0.01 || Math.abs(brick.ty - brick.y) > 0.005 || Math.abs(brick.tx - brick.x) > 0.005 || brick.leaving) busy = true;
    }

    // The camera pulls back as the pile grows past my height, and sways a little while it waits.
    if (!drag && !reduce) turn += (0 - turn) * (1 - Math.exp(-dt * 1.2));
    const H = Math.max(12.4, height + 1.5);
    const k = reduce ? 1 : 1 - Math.exp(-dt * 3);
    view.h += (H - view.h) * k;
    view.r += (Math.max(11, view.h * 0.62) - view.r) * k;
    place(now);

    if (busy || dirty || redraw || (!reduce && now - drawn > 50)) {
      renderer!.shadowMap.needsUpdate = busy || dirty;
      renderer!.render(scene, camera);
      drawn = now;
      dirty = redraw = false;
      if (!shown) { shown = true; root.classList.add('is-ready'); }
    }
  }
  requestAnimationFrame(frame);

  return { update, cheer, snapshot };
}
