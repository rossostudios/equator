// The studio pass scene: three.js lanyard ID card for the homepage hero.
// Imported on demand by IdCard.astro once the page is idle, so its 559 KB never
// sits between a visitor and the first paint.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const root = document.getElementById('idcard')!;
const canvas = root.querySelector('canvas')!;
const { photo, name, role, handle, number } = root.dataset as Record<string, string>;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Card face textures (drawn on canvas) ----------
const W = 1024, H = 1536, R = 64;
const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.closePath();
};
const mark = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  // Equator mark: circle split by a horizontal gap
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, s, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + s * 0.28, s, 0, Math.PI); ctx.closePath(); ctx.fill();
};
const font = (w: number, px: number) => `${w} ${px}px Inter, system-ui, sans-serif`;

function drawFront(img: HTMLImageElement | null) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f7f6f3'; ctx.fillRect(0, 0, W, H);
  // subtle paper grain
  for (let i = 0; i < 6000; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  // header
  mark(ctx, 96, 118, 30, '#111');
  ctx.fillStyle = '#111'; ctx.font = font(600, 40); ctx.textBaseline = 'middle'; ctx.fillText('equator', 148, 118);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8a8a8a'; ctx.font = font(500, 24); ctx.fillText('STUDIO PASS', W - 88, 100);
  ctx.fillStyle = '#111'; ctx.font = `500 30px ui-monospace, SFMono-Regular, Menlo, monospace`; ctx.fillText('No. ' + number, W - 88, 138);
  ctx.textAlign = 'left';
  // photo well
  const px = 88, py = 200, pw = W - 176, ph = 900;
  rr(ctx, px, py, pw, ph, 40); ctx.save(); ctx.clip();
  if (img) {
    const s = Math.max(pw / img.width, ph / img.height);
    const dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
  } else {
    // Flat block pattern: horizontal runs over a base, seeded so it never reshuffles.
    const tones = ['#ff6b1a', '#ffb020', '#8898ff'];
    let seed = 20260410;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    const cols = 12, rows = 9;
    const cw = pw / cols, ch = ph / rows;
    ctx.fillStyle = tones[1]; ctx.fillRect(px, py, pw, ph);
    for (let row = 0; row < rows; row++) {
      let col = 0;
      while (col < cols) {
        const run = Math.min(cols - col, 1 + Math.floor(rnd() * 4));
        ctx.fillStyle = tones[Math.floor(rnd() * tones.length)];
        ctx.fillRect(px + col * cw, py + row * ch, run * cw + 1, ch + 1);
        col += run;
      }
    }
    // A few full-height columns on the right, the way the reference banding reads.
    for (let i = 0; i < 3; i++) {
      const col = cols - 1 - i * 2;
      ctx.fillStyle = tones[i % tones.length];
      ctx.fillRect(px + col * cw, py, cw * 0.6, ph);
    }
    ctx.fillStyle = 'rgba(16,16,16,.92)'; ctx.font = font(600, 320); ctx.textAlign = 'center';
    ctx.fillText(name.slice(0, 1), px + pw / 2, py + ph / 2 + 10); ctx.textAlign = 'left';
  }
  ctx.restore();
  // name block
  ctx.fillStyle = '#111'; ctx.font = font(600, 84); ctx.fillText(name, 88, 1200);
  ctx.fillStyle = '#6f6f6f'; ctx.font = font(400, 40); ctx.fillText(role, 88, 1270);
  // footer: handle + barcode
  ctx.fillStyle = '#111'; ctx.font = font(500, 32); ctx.fillText(handle, 88, 1400);
  ctx.fillStyle = '#8a8a8a'; ctx.font = font(400, 24); ctx.fillText('Member 1 of 1', 88, 1442);
  // barcode: fixed width block, right aligned
  const bw = 330, bx = W - 88 - bw, bars = [3,1,2,1,3,2,1,1,3,1,2,3,1,1,2,1,3,1,2,2,1,3,1,1,2,3,1,2,1,1,3,2,1,2,1,3,1,1,2,1,3,2,1,1,2];
  const unit = bw / bars.reduce((a, b) => a + b, 0) / 1.35;
  let x = bx;
  bars.forEach((b, i) => { const w = b * unit; if (i % 2 === 0) ctx.fillRect(x, 1384, w, 48); x += w * 1.35; });
  ctx.fillStyle = '#8a8a8a'; ctx.font = `400 22px ui-monospace, SFMono-Regular, Menlo, monospace`; ctx.textAlign = 'right';
  ctx.fillText('EQ-' + number, W - 88, 1454); ctx.textAlign = 'left';
  // slot
  ctx.fillStyle = '#e4e2dd'; rr(ctx, W / 2 - 70, 40, 140, 28, 14); ctx.fill();
  return c;
}

function drawBack() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 1.1, 100, W / 2, H * 1.1, H); g.addColorStop(0, '#2a2a2a'); g.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  mark(ctx, W / 2, H / 2 - 20, 120, '#f2ebe0');
  ctx.fillStyle = '#f2ebe0'; ctx.font = font(600, 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('equator', W / 2, H / 2 + 230);
  ctx.fillStyle = '#7a7a7a'; ctx.font = font(500, 26); ctx.fillText('NEW JERSEY · WORKING FROM SOUTH AMERICA', W / 2, H / 2 + 300);
  ctx.fillStyle = '#e4e2dd'; rr(ctx, W / 2 - 70, 40, 140, 28, 14); ctx.fill();
  return c;
}

// ---------- Scene ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.4;
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 1.55, 9.6);
camera.lookAt(0, 1.55, 0);

const key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(3, 6, 6); scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Pivot at the strap anchor (top of view). Everything swings around it.
const pivot = new THREE.Group(); pivot.position.set(0, 3.9, 0); scene.add(pivot);

const cardW = 2.2, cardH = 3.3, cardT = 0.06;
const geo = new RoundedBoxGeometry(cardW, cardH, cardT, 6, 0.12);
const side = new THREE.MeshPhysicalMaterial({ color: 0xf2f0ec, roughness: 0.5 });
const frontTex = new THREE.CanvasTexture(drawFront(null)); frontTex.colorSpace = THREE.SRGBColorSpace; frontTex.anisotropy = 8;
const backTex = new THREE.CanvasTexture(drawBack()); backTex.colorSpace = THREE.SRGBColorSpace; backTex.anisotropy = 8;
// Matte printed stock, not glass: a heavy clearcoat washed the block colours out.
const face = (map: THREE.Texture) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.62, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5, reflectivity: 0.3 });
const card = new THREE.Mesh(geo, [side, side, side, side, face(frontTex), face(backTex)]);
card.position.y = -cardH / 2 - 0.55;
pivot.add(card);

// Load the real photo, then redraw the front. The pass fades in only once the photo is
// on it, so nobody sees the fallback pattern swap for a face a moment later.
const ready = () => root.classList.add('is-ready');
const img = new Image(); img.src = photo;
img.onload = () => { frontTex.image = drawFront(img); frontTex.needsUpdate = true; ready(); };
img.onerror = ready;

// Clip + strap
const clip = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 12, 32), new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 1, roughness: 0.25 }));
clip.position.y = -0.4; pivot.add(clip);
const strapCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2.6, 0), new THREE.Vector3(0.02, 1.2, 0.05), new THREE.Vector3(0, -0.28, 0)]);
const strap = new THREE.Mesh(new THREE.TubeGeometry(strapCurve, 24, 0.045, 12, false), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
pivot.add(strap);
const strapTop = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.9, 5.5, 0), new THREE.Vector3(-0.4, 3.6, 0), new THREE.Vector3(0, 2.6, 0), new THREE.Vector3(0.4, 3.6, 0), new THREE.Vector3(0.9, 5.5, 0)]), 32, 0.045, 12, false), strap.material);
pivot.add(strapTop);

// ---------- Motion: spring pendulum + drag + flip ----------
let ax = 0, az = 0, vx = 0, vz = 0;     // swing angles/velocities (x = forward/back, z = side)
let flip = 0, flipTarget = 0;            // Y rotation
let dragging = false, moved = false, lastX = 0, lastY = 0, lastT = 0;
let idle = 0;

const pointer = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });
root.addEventListener('pointerdown', (e) => { dragging = true; moved = false; ({ x: lastX, y: lastY } = pointer(e)); lastT = performance.now(); root.setPointerCapture(e.pointerId); });
root.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const { x, y } = pointer(e); const dx = x - lastX, dy = y - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
  vz -= dx * 0.0025; vx += dy * 0.0025;
  lastX = x; lastY = y; lastT = performance.now();
});
const release = () => { if (dragging && !moved) flipTarget += Math.PI; dragging = false; };
root.addEventListener('pointerup', release); root.addEventListener('pointercancel', release);

// Hover tilt when not dragging
let hx = 0, hy = 0;
root.addEventListener('pointermove', (e) => { if (dragging) return; const r = root.getBoundingClientRect(); hx = ((e.clientX - r.left) / r.width - 0.5) * 2; hy = ((e.clientY - r.top) / r.height - 0.5) * 2; });
root.addEventListener('pointerleave', () => { hx = 0; hy = 0; });

function resize() {
  const w = root.clientWidth, h = root.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  camera.position.z = w < 380 ? 11.5 : 9.6;
}
new ResizeObserver(resize).observe(root); resize();

let last = performance.now();
let visible = true;
new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(root);

function tick() {
  requestAnimationFrame(tick);
  if (!visible) return;
  const now = performance.now(); const dt = Math.min((now - last) / 1000, 0.05); last = now;
  idle += dt;
  // spring back to rest + gentle breathing sway
  const k = 9, d = 2.2;
  const restZ = reduce ? 0 : Math.sin(idle * 0.9) * 0.02 + hx * 0.12;
  const restX = reduce ? 0 : Math.sin(idle * 1.3) * 0.015 - hy * 0.08;
  vz += (-(az - restZ) * k - vz * d) * dt; az += vz * dt;
  vx += (-(ax - restX) * k - vx * d) * dt; ax += vx * dt;
  pivot.rotation.z = az; pivot.rotation.x = ax;
  flip += (flipTarget - flip) * Math.min(1, dt * 6);
  card.rotation.y = flip;
  clip.rotation.y = flip;
  renderer.render(scene, camera);
}
tick();
