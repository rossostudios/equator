/**
 * Render the Plaza case study's images from the real fonts, into src/assets/work/plaza.
 *
 * Run with: node mockups/plaza/render.mjs [name ...]   (no names renders every one)
 * Needs the Plaza webfont package (PLAZA_FONTS, default ~/Desktop/plaza-webfont), the
 * Plazuela repo for its lockup and icons (PLAZUELA, default ~/Desktop/plazuela) and a
 * headless Chromium (CHROME, default Playwright's cached chrome-headless-shell). Each plate
 * is a page 1000px wide in this folder, captured at 2x and saved as WebP.
 */
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../../src/assets/work/plaza');
const PLAZA = process.env.PLAZA_FONTS ?? join(homedir(), 'Desktop/plaza-webfont');
const PLAZUELA = process.env.PLAZUELA ?? join(homedir(), 'Desktop/plazuela');
const CHROME = process.env.CHROME ?? (() => {
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  const shell = existsSync(cache) && readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().at(-1);
  if (!shell) throw new Error('No Chromium: set CHROME to a chrome or chrome-headless-shell binary.');
  return join(cache, shell, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
})();

/** [page, output name, height]. Plates are 1000 × 690; the heroes match the other heroes' 3:2. */
const PLATES = [
  ['hero.html', 'hero-light', 663], ['hero.html?dark', 'hero-dark', 663],
  ['cuts.html', 'cuts'], ['weights.html', 'weights'], ['sizes.html', 'sizes'],
  ['alternates.html', 'alternates'], ['all-at-once.html', 'all-at-once'], ['emoticons.html', 'emoticons'],
  ['construction.html', 'construction'], ['details.html', 'details'], ['charset.html', 'charset'],
  ['wordmark.html', 'wordmark'], ['icons.html', 'icons'],
];

// Both families, every weight, straight from the package.
const NAMES = ['Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'];
writeFileSync(join(HERE, 'fonts.css'), [['Plaza', 'Plaza'], ['Plaza Display', 'PlazaDisplay']]
  .flatMap(([family, file]) => NAMES.map((name, i) =>
    `@font-face { font-family: "${family}"; src: url("file://${PLAZA}/${file}-${name}.woff2") format("woff2"); font-weight: ${(i + 1) * 100}; font-display: block; }`))
  .join('\n') + '\n');

/** Just enough TrueType to pull one simple glyph's outline out of a .ttf. */
function glyphOf(file, char) {
  const b = readFileSync(file);
  const at = {};
  for (let i = 0; i < b.readUInt16BE(4); i++) at[b.toString('latin1', 12 + 16 * i, 16 + 16 * i)] = b.readUInt32BE(20 + 16 * i);
  const cmap = () => {
    for (let i = 0; i < b.readUInt16BE(at.cmap + 2); i++) {
      const s = at.cmap + b.readUInt32BE(at.cmap + 8 + 8 * i);
      if (b.readUInt16BE(s) !== 4) continue;
      const seg = b.readUInt16BE(s + 6) / 2, ends = s + 14, starts = ends + 2 * seg + 2, deltas = starts + 2 * seg, offsets = deltas + 2 * seg;
      const code = char.codePointAt(0);
      for (let k = 0; k < seg; k++) {
        if (b.readUInt16BE(ends + 2 * k) < code) continue;
        const start = b.readUInt16BE(starts + 2 * k), delta = b.readInt16BE(deltas + 2 * k), ro = b.readUInt16BE(offsets + 2 * k);
        if (start > code) break;
        if (!ro) return (code + delta) & 0xffff;
        const g = b.readUInt16BE(offsets + 2 * k + ro + 2 * (code - start));
        return g && (g + delta) & 0xffff;
      }
    }
    throw new Error(`${file} has no ${char}`);
  };
  const g = cmap();
  const advance = b.readUInt16BE(at.hmtx + 4 * Math.min(g, b.readUInt16BE(at.hhea + 34) - 1));
  const long = b.readInt16BE(at.head + 50) === 1;
  let p = at.glyf + (long ? b.readUInt32BE(at.loca + 4 * g) : 2 * b.readUInt16BE(at.loca + 2 * g));
  const count = b.readInt16BE(p);
  if (count < 0) throw new Error(`${char} is a composite glyph`);
  const ends = Array.from({ length: count }, (_, i) => b.readUInt16BE(p + 10 + 2 * i));
  p += 10 + 2 * count;
  p += 2 + b.readUInt16BE(p);
  const flags = [];
  while (flags.length <= ends.at(-1)) {
    const f = b[p++];
    flags.push(f);
    if (f & 8) for (let r = b[p++]; r > 0; r--) flags.push(f);
  }
  const axis = (short, same) => {
    let v = 0;
    return flags.map((f) => {
      if (f & short) { const d = b[p++]; v += f & same ? d : -d; } else if (!(f & same)) { v += b.readInt16BE(p); p += 2; }
      return v;
    });
  };
  const xs = axis(2, 16), ys = axis(4, 32);
  let s = 0;
  // Centred on its advance and flipped, so every weight shares an origin in SVG space.
  const contours = ends.map((e) => { const c = []; for (; s <= e; s++) c.push([xs[s] - advance / 2, -ys[s], (flags[s] & 1) === 1]); return c; });
  return contours;
}

/** TrueType's quadratic contours as an SVG path. */
const svgPath = (contours) => contours.map((points) => {
  const pts = [...points];
  let k = pts.findIndex((q) => q[2]);
  if (k < 0) { pts.unshift([(pts[0][0] + pts.at(-1)[0]) / 2, (pts[0][1] + pts.at(-1)[1]) / 2, true]); k = 0; }
  let d = `M${pts[k][0]} ${pts[k][1]}`, ctrl = null;
  for (const [x, y, on] of [...pts.slice(k + 1), ...pts.slice(0, k + 1)]) {
    if (on) { d += ctrl ? `Q${ctrl[0]} ${ctrl[1]} ${x} ${y}` : `L${x} ${y}`; ctrl = null; continue; }
    if (ctrl) d += `Q${ctrl[0]} ${ctrl[1]} ${(ctrl[0] + x) / 2} ${(ctrl[1] + y) / 2}`;
    ctrl = [x, y];
  }
  return d + 'Z';
}).join('');

// The a in every weight, with the stems the build script draws them at.
const build = readFileSync(join(PLAZA, 'source/build.py'), 'utf8').match(/WEIGHTS = \{([\s\S]*?)\n\}/)[1];
const stems = Object.fromEntries([...build.matchAll(/"(\w+)":\s*\((\d+),/g)].map(([, name, stem]) => [name, Number(stem)]));
const regular = glyphOf(join(PLAZA, 'desktop/Plaza-Regular.ttf'), 'a');
writeFileSync(join(HERE, 'outlines.js'), `window.PLAZA_A = ${JSON.stringify({
  weights: NAMES.map((name) => ({ name, stem: stems[name], path: svgPath(glyphOf(join(PLAZA, `desktop/Plaza-${name}.ttf`), 'a')) })),
  points: regular.flat(),
  handles: regular.flatMap((c) => c.map((q, i) => [q, c[(i + 1) % c.length]]).filter(([a, z]) => !a[2] || !z[2])
    .map(([a, z]) => `M${a[0]} ${a[1]}L${z[0]} ${z[1]}`)).join(''),
})};\n`);

// Plazuela's lockup, and its lettered icons with the render's floor faded out, so only the
// contact shadow stays under each one.
copyFileSync(join(PLAZUELA, 'public/brand/plazuela-lockup-horizontal-green-outlined.svg'), join(HERE, 'plazuela-lockup.svg'));
for (const kind of ['explore', 'agenda', 'faq']) {
  const { data, info } = await sharp(join(PLAZUELA, `artwork/discovery/blender/${kind}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const solid = Buffer.alloc(width * height);
  for (let i = 0; i < solid.length; i++) solid[i] = data[i * channels + 3] > 200 ? 255 : 0;
  const halo = await sharp(solid, { raw: { width, height, channels: 1 } }).blur(38).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < solid.length; i++) data[i * channels + 3] *= Math.min(1, (halo.data[i * halo.info.channels] / 255) * 2.6);
  await sharp(data, { raw: { width, height, channels } }).png().toFile(join(HERE, `icon-${kind}.png`));
}

const only = process.argv.slice(2);
const tmp = mkdtempSync(join(tmpdir(), 'plaza-'));
for (const [page, name, height = 690] of PLATES) {
  if (only.length && !only.includes(name)) continue;
  const png = join(tmp, `${name}.png`);
  const hero = name.startsWith('hero');
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    '--force-device-scale-factor=2', `--window-size=1000,${height}`, '--virtual-time-budget=4000',
    ...(hero ? ['--default-background-color=00000000'] : []),
    `--screenshot=${png}`, `file://${join(HERE, page)}`,
  ], { stdio: 'ignore' });
  await sharp(png).webp({ quality: hero ? 90 : 92, alphaQuality: 100, effort: 6 }).toFile(join(OUT, `${name}.webp`));
  console.log(`${name}.webp`);
}
