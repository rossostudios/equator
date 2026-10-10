// The About page's portrait (and the 404's): me in bricks on my stand, built when it comes
// into view, then turning gently. Drag to turn me round; tap and every brick hops hello.
import { Builder } from './brick-kit';
import { me } from './brick-town';
import { turntable } from './turntable';

async function main() {
  const root = document.getElementById('portrait');
  if (!root) return;
  // The stand's name is lettered in the display face, so wait for it (but not forever).
  await Promise.race([document.fonts.load('800 64px "Bricolage Grotesque"'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
  const b = new Builder();
  me(b, 0, 0);
  turntable(root, { steps: [b.units], centre: [4, 5.4, 2], radius: 7.6, az: 0.5, el: 0.22, duration: 1500 });
}
main();
