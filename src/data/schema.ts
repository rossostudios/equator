import { linkGroups } from './links';
import { EMAIL } from '../i18n/ui';

/* Every profile we link to, straight from links.ts so this can never drift. */
const sameAs = [...new Set(linkGroups
  .filter((g) => g.title !== 'Live work')
  .flatMap((g) => g.items.map((i) => i.href)))];

/** Who this site is about, for search and answer engines. They lift entities out of this:
 *  it is the single highest-leverage thing on a page for being cited rather than crawled. */
export const schema = (site: URL, extra: object[] = []) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${site.origin}/#website`,
      name: 'Christopher Rosso',
      url: `${site.origin}/`,
      inLanguage: ['en', 'es'],
      publisher: { '@id': `${site.origin}/#christopher` },
    },
    {
      '@type': 'Person',
      '@id': `${site.origin}/#christopher`,
      name: 'Christopher Rosso',
      url: site.origin,
      image: new URL('/me.webp', site).href,
      jobTitle: 'Product designer and developer',
      description:
        'Designs and builds websites, online stores and custom software for founders and small businesses, from the first sketch to launch.',
      knowsLanguage: ['en', 'es'],
      homeLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Savannah', addressRegion: 'GA', addressCountry: 'US' } },
      knowsAbout: [
        'Brand identity', 'Product design', 'Web development', 'Shopify', 'Ecommerce',
        'Chrome extensions', 'Point of sale systems', 'Onchain products', 'AI coding agents', 'Generative video',
      ],
      sameAs,
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${site.origin}/#studio`,
      name: 'Christopher Rosso',
      url: site.origin,
      founder: { '@id': `${site.origin}/#christopher` },
      description:
        'One person who designs and builds products end to end: brand identity, product design, websites and the software behind them.',
      areaServed: ['US', 'CO', 'Worldwide'],
      availableLanguage: ['English', 'Spanish'],
      email: EMAIL,
      priceRange: 'From USD 50/hr',
    },
    /* What the page itself adds: a project, its breadcrumbs, a page's questions. */
    ...extra,
  ],
});
