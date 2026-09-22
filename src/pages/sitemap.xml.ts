import type { APIRoute } from 'astro';
import { projects } from '../data/work';
import { langs, href } from '../i18n';

/** Generated rather than hand-written, so a new project or language cannot fall out of it. */
const PAGES = ['/', '/work', '/about', '/testimonials'];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://equator-two.vercel.app')).origin;
  const urls = langs.flatMap((lang) => [
    ...PAGES.map((p) => ({ loc: `${base}${href(lang, p)}`, priority: p === '/' ? '1.0' : '0.8' })),
    ...projects.map((p) => ({ loc: `${base}${href(lang, `/work/${p.slug}`)}`, priority: '0.7' })),
  ]);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n') +
      `\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
