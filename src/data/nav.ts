import { testimonials } from './testimonials';

/**
 * The site's pages in navigation order, shared by the desktop rail and the phone menu so
 * the two can't drift. `key` picks the label from ui[lang].nav.
 *
 * An empty page in the primary nav tells every visitor nobody has vouched for the work yet,
 * so Testimonials stays out until there is a quote. The page itself stays up at its URL.
 */
export const navPages = [
  { path: '/', key: 'home', glyph: 'home' },
  { path: '/work', key: 'work', glyph: 'work' },
  { path: '/about', key: 'about', glyph: 'about' },
  { path: '/testimonials', key: 'testimonials', glyph: 'words' },
].filter((p) => p.path !== '/testimonials' || testimonials.length > 0) as {
  path: string; key: 'home' | 'work' | 'about' | 'testimonials'; glyph: 'home' | 'work' | 'about' | 'words';
}[];

/** Whether a nav path is the page being shown. `current` is the path without its language prefix. */
export const isCurrent = (path: string, current: string) => (path === '/' ? current === '/' : current.startsWith(path));
