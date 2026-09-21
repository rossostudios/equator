/**
 * Regenerate src/data/icons.ts from the installed @hugeicons package.
 *
 * Run with: node mockups/vendor_icons.mjs
 * Add a name to ICONS below if a new icon is needed, then re-run.
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const ICONS = [
  'ArrowDown01Icon', 'ArrowLeft02Icon', 'ArrowRight02Icon', 'ArrowUpRight01Icon',
  'Cancel01Icon', 'CheckmarkBadge02Icon', 'Comment01Icon', 'Copy01Icon',
  'Facebook01Icon', 'FilterHorizontalIcon', 'FiverrIcon', 'Globe02Icon',
  'Home01Icon', 'InstagramIcon', 'LayoutGridIcon', 'Link04Icon',
  'LinkSquare02Icon', 'Linkedin01Icon', 'Mail01Icon', 'NewTwitterIcon',
  'PlayIcon', 'Search01Icon', 'ShopSignIcon', 'StarIcon',
  'TShirtIcon', 'ThreadsIcon', 'Tick02Icon', 'TiktokIcon',
  'UpworkIcon', 'Wallet01Icon',
  // Service card icons. Only the Equator mark itself is hand-drawn (see Glyph.astro);
  // everything generic comes from the set so it is professionally drawn and consistent.
  'ArtboardIcon', 'BrowserIcon', 'Rocket01Icon', 'ShoppingBag02Icon', 'PuzzleIcon',
  'Blockchain01Icon', 'Flowchart01Icon', 'AiSearchIcon', 'Film01Icon',
];

const require = createRequire(import.meta.url);
const base = require.resolve('@hugeicons/core-free-icons/package.json').replace(/package\.json$/, 'dist/esm/');

const header = `/**
 * Icon paths vendored from @hugeicons/core-free-icons v4.3.4 (MIT).
 *
 * The package's barrel index imports six files with the wrong letter case, for
 * example Grid2x2CheckIcon.js when the real file is Grid2X2CheckIcon.js. macOS
 * hides that because its filesystem is case-insensitive, but Linux build
 * machines do not, so importing the barrel fails there outright. We only use
 * the icons below, so they live here instead: deterministic across platforms,
 * and twelve thousand fewer modules for the bundler to walk.
 *
 * Regenerate with: node mockups/vendor_icons.mjs
 */
export type IconData = readonly (readonly [string, Record<string, string | number>])[];

`;

let out = header;
for (const name of ICONS) {
  const mod = await import(base + name + '.js');
  out += `export const ${name}: IconData = ${JSON.stringify(mod.default)};\n`;
}
writeFileSync(new URL('../src/data/icons.ts', import.meta.url), out);
console.log(`wrote src/data/icons.ts with ${ICONS.length} icons`);
