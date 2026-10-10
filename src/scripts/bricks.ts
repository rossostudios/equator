// The home page's stage: a brick town that builds itself one step per section as the
// reader scrolls, like turning the pages of a building-instructions booklet. The last
// step leaves an empty lot that visitors can stack their own bricks on, share as a link,
// or turn into a brief: each colour stands for a part.
import * as THREE from 'three';
import { PLATE, geometryFor } from './brick-kit';
import { type Live, baseplate, fall, hopAll, lightScene, makeRenderer, mountUnits, plastic, poseUnit } from './brick-scene';
import { BASE, C, PLOT, POSES, SWATCHES, buildTown } from './brick-town';
import { SWATCH_PARTS } from '../data/parts';

const stage = document.getElementById('stage') as HTMLElement;
const canvas = stage.querySelector('canvas') as HTMLCanvasElement;
const column = document.querySelector('.steps') as HTMLElement;
const sections = [...document.querySelectorAll<HTMLElement>('[data-step]')];
const pager = [...document.querySelectorAll<HTMLAnchorElement>('[data-pager] a')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wide = matchMedia('(min-width: 900px)');

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// A shared lot arrives as #lot=…: go straight to the lot, and keep the code for when it opens.
const sharedLot = new URLSearchParams(location.hash.slice(1)).get('lot');
const lotStep = document.querySelector<HTMLElement>('.step--lot');
if (sharedLot !== null && lotStep) {
  history.replaceState(history.state, '', `${location.pathname}#${lotStep.id}`);
  lotStep.scrollIntoView({ behavior: 'instant' });
}

// The step numbers fade out once the footer comes up, so they never sit over it.
const foot = document.querySelector('.foot'), pagerNav = document.querySelector('[data-pager]');
if (foot && pagerNav) new IntersectionObserver(([e]) => pagerNav.classList.toggle('is-off', e.isIntersecting)).observe(foot);
const smooth = (t: number) => t * t * (3 - 2 * t);

async function main() {
  // The signs are lettered in the display face, so wait for it (but not forever).
  await Promise.race([
    document.fonts.load('800 64px "Bricolage Grotesque"'),
    new Promise((r) => setTimeout(r, 1500)),
  ]).catch(() => {});
  // Let the words paint first: setting up WebGL takes the main thread for a moment.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r))));

  const renderer = makeRenderer(canvas);
  if (!renderer) {
    // No WebGL: the booklet reads fine without its town, but the lot's buttons would do nothing.
    stage.classList.add('is-flat');
    document.querySelector<HTMLElement>('.play')?.setAttribute('hidden', '');
    return;
  }

  /** Set when something outside the loop changes what's on screen; the loop renders only then.
   *  `redraw` is the lighter kind: the camera or the ghost moved, so the shadows can stay. */
  let dirty = true, redraw = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 1, 400);
  const centre = new THREE.Vector3(BASE.w / 2, 0, BASE.d / 2);
  lightScene(renderer, scene, centre, 30);

  const color = new THREE.Color();
  const m = new THREE.Matrix4();

  // ---------- The baseplate, on the booklet page ----------
  scene.add(baseplate(BASE.w, BASE.d));

  // ---------- The town ----------
  const steps = buildTown(stage.dataset.lot ?? 'YOUR PRODUCT\nGOES HERE');
  const bounds = new THREE.Sphere(new THREE.Vector3(centre.x, 5, centre.z), 32);
  const { lives, meshes } = mountUnits(scene, steps, bounds);
  // Hovering the logo in the bar: the figure of me in the town hops hello.
  const me = lives.filter((l) => l.tag === 'me');
  addEventListener('logo:hello', () => {
    if (reduce || me[0]?.q !== 1) return;
    hopAll(me, performance.now(), 30);
    dirty = true;
  });


  // ---------- The lot: bricks the visitor stacks ----------
  const MAX = 300, TALL = 12;
  const userGeo = geometryFor({ x: 0, y: 0, z: 0, w: 2, d: 2, h: 3, color: '', kind: 'brick' }).geo;
  const userMesh = new THREE.InstancedMesh(userGeo, plastic, MAX);
  userMesh.count = 0;
  userMesh.castShadow = userMesh.receiveShadow = true;
  userMesh.frustumCulled = false;
  userMesh.boundingSphere = bounds;
  scene.add(userMesh);
  const ghost = new THREE.Mesh(userGeo, new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.3, transparent: true, opacity: 0.45, depthWrite: false }));
  ghost.visible = false;
  scene.add(ghost);

  type Placed = { x: number; z: number; l: number; c: number; born: number };
  let placed: Placed[] = [];
  const heights = new Uint8Array(PLOT.w * PLOT.d);
  let swatch = 0;
  let lotOpen = false;
  const KEY = 'bricks:lot';
  const fits = (b: { x: number; z: number; l: number; c: number }) =>
    [b.x, b.z, b.l, b.c].every(Number.isInteger) && b.x >= PLOT.x && b.x <= PLOT.x + PLOT.w - 2
      && b.z >= PLOT.z && b.z <= PLOT.z + PLOT.d - 2 && b.l >= 0 && b.l < TALL && b.c >= 0 && b.c < SWATCHES.length;
  /** The lot as a short code for a link: two bytes a brick (where, how high, what colour), in base64url. */
  const encode = (list: Placed[]) => {
    const bytes = list.flatMap((b) => [(b.x - PLOT.x) * 8 + (b.z - PLOT.z), b.l * 8 + b.c]);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const decode = (code: string) => {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const out: Placed[] = [];
    for (let i = 0; i + 1 < bin.length && out.length < MAX; i += 2) {
      const p = bin.charCodeAt(i), q = bin.charCodeAt(i + 1);
      const b = { x: PLOT.x + (p >> 3), z: PLOT.z + (p & 7), l: q >> 3, c: q & 7, born: Infinity };
      if (fits(b)) out.push(b);
    }
    return out;
  };
  let fromLink = false;
  try {
    if (sharedLot) {
      placed = decode(sharedLot);
      fromLink = true;
    } else {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      if (Array.isArray(saved)) placed = saved.slice(0, MAX).map(([x, z, l, c]: number[]) => ({ x, z, l, c, born: Infinity })).filter(fits);
    }
  } catch { /* a blocked store, or a broken link, just means an empty lot */ }
  for (const b of placed) stamp(b);
  if (fromLink) document.querySelector<HTMLElement>('[data-lot-from]')?.removeAttribute('hidden');

  function stamp(b: Placed) {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const k = (b.z - PLOT.z + j) * PLOT.w + (b.x - PLOT.x + i);
      heights[k] = Math.max(heights[k], b.l + 1);
    }
  }
  const share = document.querySelector<HTMLButtonElement>('[data-share-lot]');
  const brief = document.querySelector<HTMLAnchorElement>('[data-brief-lot]');
  const sent = document.querySelector<HTMLElement>('[data-lot-msg]');
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(placed.map((b) => [b.x, b.z, b.l, b.c]))); } catch { /* fine */ }
    const count = document.querySelector<HTMLElement>('[data-count]');
    if (count) count.textContent = (placed.length === 1 ? count.dataset.one : count.dataset.many)!.replace('{n}', String(placed.length));
    // The brief starts with a part for each colour on the lot, in the order they went down.
    const code = encode(placed);
    const ids = [...new Set(placed.map((b) => SWATCH_PARTS[b.c]).filter(Boolean))];
    if (brief) {
      brief.hidden = !placed.length;
      brief.href = `${brief.dataset.build}?${ids.length ? `parts=${ids.join(',')}&` : ''}lot=${code}`;
    }
    if (share) share.hidden = !placed.length;
    if (sent && !placed.length) sent.textContent = '';
  }
  save();
  // Announce changes to the count from here on, not the count the page opens with.
  document.querySelector('[data-count]')?.setAttribute('aria-live', 'polite');

  /** The 2x2 spot nearest a point on the lot, and the level a brick there would sit at. */
  function spotAt(px: number, pz: number) {
    const x = Math.min(PLOT.x + PLOT.w - 2, Math.max(PLOT.x, Math.round(px) - 1));
    const z = Math.min(PLOT.z + PLOT.d - 2, Math.max(PLOT.z, Math.round(pz) - 1));
    let l = 0;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) l = Math.max(l, heights[(z - PLOT.z + j) * PLOT.w + (x - PLOT.x + i)]);
    return l < TALL ? { x, z, l } : null;
  }
  function addBrick(spot: { x: number; z: number; l: number } | null, now = performance.now()) {
    if (!spot || placed.length >= MAX) return;
    const b = { ...spot, c: swatch, born: now };
    placed.push(b);
    stamp(b);
    save();
    dirty = true;
  }
  function clearLot() {
    placed = [];
    heights.fill(0);
    userMesh.count = 0;
    ghost.visible = false;
    save();
    dirty = true;
  }

  const legend = document.querySelector<HTMLElement>('[data-swatch-part]');
  document.querySelectorAll<HTMLButtonElement>('[data-swatch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      swatch = Number(btn.dataset.swatch);
      ghost.material.color.set(SWATCHES[swatch]);
      document.querySelectorAll('[data-swatch]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (legend) legend.textContent = btn.getAttribute('aria-label');
    });
  });
  // Share the lot as a link: on a phone through the share sheet, elsewhere copied.
  share?.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}#lot=${encode(placed)}`;
    if (navigator.share && matchMedia('(hover: none)').matches) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = Object.assign(document.createElement('textarea'), { value: url });
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    if (sent) sent.textContent = sent.dataset.copied!;
  });
  document.querySelector('[data-add]')?.addEventListener('click', () => {
    // Somewhere on the lot, favouring the lower columns so a random pile stays a pile.
    let best = null;
    for (let tries = 0; tries < 6; tries++) {
      const s = spotAt(PLOT.x + 1 + Math.random() * (PLOT.w - 2), PLOT.z + 1 + Math.random() * (PLOT.d - 2));
      if (s && (!best || s.l < best.l)) best = s;
    }
    addBrick(best);
  });
  document.querySelector('[data-clear]')?.addEventListener('click', clearLot);

  // ---------- Camera ----------
  /** The part of the canvas the town should sit in, as fractions: on a wide screen the text
   *  column takes the left, so the town centres in what is left on the right. */
  let fx = 1, fy = 1, ox = 0, oy = 0;
  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (wide.matches) {
      // Between the text column and the step numbers on the right.
      const col = column.getBoundingClientRect().right + 16;
      const edge = (document.querySelector('.pager')?.getBoundingClientRect().left ?? w) - 16;
      fx = (edge - col - 24) / w;
      ox = (col + edge - w) / (2 * w);
      fy = (h - 150) / h;
      oy = -24 / h;
    } else {
      fx = 0.96;
      fy = (h - 70) / h;
      oy = -22 / h;
      ox = 0;
    }
  }
  new ResizeObserver(() => { layout(); redraw = true; }).observe(stage);
  layout();

  const look = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(), dir = new THREE.Vector3();
  const Y = new THREE.Vector3(0, 1, 0);
  function aim(c: THREE.Vector3, r: number, az: number, el: number) {
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = r / Math.min(fy * t, fx * camera.aspect * t);
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    right.crossVectors(Y, dir).normalize();
    up.crossVectors(dir, right);
    look.copy(c)
      .addScaledVector(right, -ox * 2 * dist * t * camera.aspect)
      .addScaledVector(up, -oy * 2 * dist * t);
    camera.position.copy(look).addScaledVector(dir, dist);
    camera.lookAt(look);
  }

  const want = { c: new THREE.Vector3(), r: 0, az: 0, el: 0 };
  const cam = { c: new THREE.Vector3(), r: 0, az: 0, el: 0 };
  function posed(s: number) {
    const i = Math.min(POSES.length - 2, Math.floor(s));
    const f = smooth(clamp01(s - i));
    const a = POSES[i], b = POSES[i + 1];
    want.c.set(a.c[0], a.c[1], a.c[2]).lerp(new THREE.Vector3(b.c[0], b.c[1], b.c[2]), f);
    const portrait = camera.aspect < 1;
    const ra = portrait ? a.rn ?? a.r : a.r, rb = portrait ? b.rn ?? b.r : b.r;
    want.r = ra + (rb - ra) * f;
    want.az = a.az + (b.az - a.az) * f;
    want.el = a.el + (b.el - a.el) * f;
  }

  // ---------- Scroll ----------
  const target = steps.map(() => 0);
  const prog = steps.map(() => 0);
  /** Each section builds its step while its top travels up the visible text area, and the
   *  camera gets there a little earlier, so you watch the step go up rather than catch the end. */
  function readScroll() {
    const vh = innerHeight;
    const top = wide.matches ? 0 : stage.getBoundingClientRect().bottom;
    const span = vh - top;
    let s = 0;
    sections.forEach((sec, i) => {
      if (i === 0) return;
      const y = sec.getBoundingClientRect().top;
      target[i] = clamp01((top + span * 0.85 - y) / (span * 0.65));
      s += smooth(clamp01((top + span - y) / (span * 0.5)));
    });
    return s;
  }

  // ---------- Pointer: drag to turn the town, tap a brick to bump it, tap the lot to build ----------
  let userAz = 0, tiltX = 0, tiltY = 0;
  let drag: { x: number; az: number; moved: boolean } | null = null;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ground = new THREE.Plane(Y, 0);
  const hitPoint = new THREE.Vector3();

  function cast(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(lotOpen ? [userMesh, ...meshes] : meshes, false)[0];
    let spot = null;
    if (lotOpen) {
      if (hit?.object === userMesh && hit.face) {
        const n = hit.face.normal;
        spot = n.y > 0.5 ? spotAt(hit.point.x, hit.point.z) : spotAt(hit.point.x + n.x * 0.6, hit.point.z + n.z * 0.6);
      } else if (ray.ray.intersectPlane(ground, hitPoint)
        && hitPoint.x >= PLOT.x && hitPoint.x <= PLOT.x + PLOT.w && hitPoint.z >= PLOT.z && hitPoint.z <= PLOT.z + PLOT.d
        && (!hit || hit.distance > ray.ray.origin.distanceTo(hitPoint))) {
        spot = spotAt(hitPoint.x, hitPoint.z);
      }
    }
    return { hit, spot };
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, az: userAz, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    tiltX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    tiltY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (drag) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      userAz = Math.max(-1.1, Math.min(1.1, drag.az - dx * 0.006));
      ghost.visible = false;
    } else if (e.pointerType === 'mouse') {
      const { hit, spot } = cast(e);
      ghost.visible = !!spot;
      if (spot) ghost.position.set(spot.x, spot.l * 3 * PLATE, spot.z);
      canvas.style.cursor = spot || hit ? 'pointer' : 'grab';
    }
    redraw = true;
  });
  const release = (e: PointerEvent) => {
    if (drag && !drag.moved && e.type === 'pointerup') {
      const { hit, spot } = cast(e);
      if (spot) addBrick(spot);
      else if (hit && hit.object !== userMesh && hit.instanceId !== undefined) {
        (hit.object.userData.lives as Live[])[hit.instanceId].hop = performance.now();
      }
    }
    drag = null;
    redraw = true;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { tiltX = tiltY = 0; ghost.visible = false; redraw = true; });

  // ---------- Loop ----------
  let start = -1, last = performance.now(), lastS = -1, active = -1, settling = false;
  function frame(now: number) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (start < 0) start = now;
    let busy = false;

    // Step 1 builds on its own as the page opens; the rest follow the scroll.
    target[0] = reduce ? 1 : clamp01((now - start - 300) / 2600);
    const s = readScroll();
    const k = reduce ? 1 : 1 - Math.exp(-dt * 3);
    for (let i = 0; i < prog.length; i++) {
      const d = target[i] - prog[i];
      if (Math.abs(d) < 1e-4) prog[i] = target[i];
      else { prog[i] += d * k; busy = true; }
    }
    for (const live of lives) {
      const p = prog[live.step];
      const q = reduce ? (p > live.t0 ? 1 : 0) : clamp01((p - live.t0) / live.dur);
      if (poseUnit(live, q, now, reduce) || live.hop > now) busy = true;
    }

    // The lot opens once its border is down; bricks saved from a past visit drop in then.
    const open = prog[4] > 0.97;
    if (open && !lotOpen) placed.forEach((b, i) => { b.born = reduce ? 0 : now + i * 40; });
    if (!open) ghost.visible = false;
    lotOpen = open;
    userMesh.count = lotOpen ? placed.length : 0;
    if (lotOpen) {
      let falling = false;
      placed.forEach((b, i) => {
        const t = reduce ? 1 : clamp01((now - b.born) / 380);
        // A brick placed after this frame began waits a frame to appear.
        if (t < 1 || now < b.born) falling = true;
        m.makeTranslation(b.x, b.l * 3 * PLATE + (now < b.born ? 999 : fall(t, reduce)), b.z);
        userMesh.setMatrixAt(i, m);
        userMesh.setColorAt(i, color.set(SWATCHES[b.c] ?? C.red));
      });
      userMesh.instanceMatrix.needsUpdate = true;
      if (userMesh.instanceColor) userMesh.instanceColor.needsUpdate = true;
      // Keep drawing until one frame after the last brick lands, so its resting place (and shadow) shows.
      if (falling || settling) busy = true;
      settling = falling;
    }

    // Turning back to the front once the reader moves on, so each step is seen from its angle.
    if (Math.abs(s - lastS) > 0.002 && !drag) userAz *= 0.95;
    lastS = s;
    posed(s);
    want.az += userAz + (wide.matches && !reduce ? tiltX * 0.05 : 0);
    want.el += wide.matches && !reduce ? -tiltY * 0.03 : 0;
    if (cam.r === 0) {
      // First frame: start high and wide, then swoop in to the first step.
      cam.c.copy(want.c);
      cam.r = want.r * (reduce ? 1 : 1.5);
      cam.az = want.az - (reduce ? 0 : 0.4);
      cam.el = want.el + (reduce ? 0 : 0.25);
    }
    const kc = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
    const moving = cam.c.distanceToSquared(want.c) > 1e-5 || Math.abs(want.r - cam.r) > 1e-3
      || Math.abs(want.az - cam.az) > 1e-4 || Math.abs(want.el - cam.el) > 1e-4;
    cam.c.lerp(want.c, kc);
    cam.r += (want.r - cam.r) * kc;
    cam.az += (want.az - cam.az) * kc;
    cam.el += (want.el - cam.el) * kc;
    aim(cam.c, cam.r, cam.az, cam.el);

    const now5 = Math.min(POSES.length - 1, Math.round(s));
    if (now5 !== active) {
      active = now5;
      pager.forEach((a, i) => (i === active ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
    }

    if (busy || moving || dirty || redraw) {
      // Shadows only change when bricks move; a turning camera can reuse them.
      renderer.shadowMap.needsUpdate = busy || dirty;
      renderer.render(scene, camera);
      dirty = redraw = false;
      if (!stage.classList.contains('is-ready')) stage.classList.add('is-ready');
    }
  }
  // Compile the shaders without blocking the page before the first frame needs them.
  await renderer.compileAsync(scene, camera).catch(() => {});
  requestAnimationFrame(frame);
}

main();
