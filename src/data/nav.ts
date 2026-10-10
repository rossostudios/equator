/**
 * The site's pages in navigation order, shared by the bar and its phone menu so the two
 * can't drift. `key` picks the label from ui[lang].nav.
 */
export const navPages = [
  { path: '/', key: 'home' },
  { path: '/work', key: 'work' },
  { path: '/proof', key: 'proof' },
  { path: '/about', key: 'about' },
] as const;

/** Whether a nav path is the page being shown. `current` is the path without its language prefix. */
export const isCurrent = (path: string, current: string) => (path === '/' ? current === '/' : current.startsWith(path));
