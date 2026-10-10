/**
 * Regenerate src/data/icons.ts from @hugeicons/core-free-icons. The package isn't a dependency
 * (the site only needs these few paths), so install it first, without saving:
 *
 *   npm install --no-save @hugeicons/core-free-icons
 *   node mockups/vendor_icons.mjs
 *
 * Add a name to ICONS below if a new icon is needed, then re-run.
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const ICONS = [
  'ArrowLeft02Icon', 'ArrowRight02Icon', 'ArrowUpRight01Icon', 'Cancel01Icon', 'PlayIcon',
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
