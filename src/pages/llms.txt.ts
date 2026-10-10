import type { APIRoute } from 'astro';
import { projects } from '../data/work';
import { parts, RATE } from '../data/parts';
import { EMAIL } from '../i18n/ui';

/**
 * /llms.txt: the site in plain Markdown for answer engines and AI assistants, which read text
 * rather than walk a brick town. Built from the same data as the pages, so it can't drift from
 * them. Every claim in it is one the site makes.
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://chrisrosso.dev')).origin;
  const work = projects.flatMap((p) => {
    const live = p.status === 'shipped' && p.url && p.slug !== 'chrisrosso-dev' ? ` Live at ${p.url}.` : p.status === 'wip' ? ' In progress.' : '';
    return [
      `- [${p.title}](${base}/work/${p.slug}): ${p.summary}${live}`,
      ...(p.scope ? [`  - Scope: ${p.scope}`] : []),
      ...(p.highlights ?? []).map((h) => `  - ${h}`),
    ];
  });
  const lines = [
    '# Christopher Rosso',
    '',
    '> Christopher Rosso designs and builds websites, online stores and custom software for founders and small businesses, from the first sketch to launch. One person does the brand, the design and the code, in English or Spanish.',
    '',
    `- Contact: ${EMAIL}, by email only. Replies within the hour, in English or Spanish.`,
    `- Pricing: small tasks from USD ${RATE} an hour. Bigger projects get a fixed quote within a day of the first call.`,
    '- Ownership: the code, the domain, the hosting and every account are in the client\'s name from day one.',
    '- Process: a link the client can open in week one, before the first page is finished, updated as the work goes on.',
    '- Based in Savannah, Georgia, traveling South America for now, on US Eastern time.',
    `- The site in Spanish: ${base}/es/`,
    '',
    '## Work',
    '',
    ...work,
    '',
    '## What he builds',
    '',
    ...parts.map((p) => `- ${p.en[0]}${p.proof ? `: see ${base}/work/${p.proof.slug}` : ''}`),
    '',
    '## Pages',
    '',
    `- [Home](${base}/): the site as a building-instructions booklet, with a brick town that builds itself as you scroll`,
    `- [Work](${base}/work): every project, each with a case study`,
    `- [Proof](${base}/proof): the live products to open, and a way to time the reply`,
    `- [About](${base}/about): how the work runs, and the background behind it`,
    `- [Start a project](${base}/build): pick the parts, see a rough price, and send the brief by email`,
    '',
    '## Optional',
    '',
    `- [Sitemap](${base}/sitemap.xml)`,
  ];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
