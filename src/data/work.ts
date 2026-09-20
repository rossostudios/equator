export type Category = 'Brand' | 'Product' | 'Web' | 'Motion';
export type Status = 'shipped' | 'wip';

export interface Project {
  slug: string;
  title: string;
  client: string;
  category: Category;
  status: Status;
  year: number;
  likes: number;
  views: number;
  video?: boolean;
  cover: {
    kind: 'image'; src: string; alt: string; fit?: 'cover' | 'contain'; bg?: string;
    /** Renders are transparent, so the house pattern sits behind them. */
    pattern?: { seed: number; palette: string[] };
  };
  /** Extra shots for the detail page, shown stacked in order. The first one is the hero.
   *  w/h are the file's real pixel size: they reserve layout space before the image loads. */
  gallery?: { src: string; alt: string; w: number; h: number }[];
  accent: string;
  url?: string;
  /** Case-study fields. Only what the work supports, no invented metrics. */
  scope?: string;
  highlights?: string[];
  description: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'plazuela', title: 'Plazuela', client: 'Plazuela', category: 'Web', status: 'shipped', year: 2026, likes: 28, views: 340,
    cover: { kind: 'image', src: '/work/plazuela/town.webp', alt: 'Plazuela board: an isometric town where every building is a local business, with the businesses listed beside it', fit: 'contain', bg: '#ffffff', pattern: { seed: 17, palette: ['#8898ff', '#ffb020', '#ff6b1a'] } },
    gallery: [
      { src: '/work/plazuela/town.webp', alt: 'Plazuela board: an isometric town where every building is a local business, with the businesses listed beside it', w: 2400, h: 1758 },
      { src: '/work/plazuela/business.webp', alt: 'Plazuela business panel for PetZone AJ Coltejer, opened from its building in the town', w: 2400, h: 1758 },
      { src: '/work/plazuela/publish.webp', alt: 'Plazuela publish flow: a business fills in its profile, picks a spot on the board and pays', w: 2400, h: 1758 },
    ],
    accent: '#2f4f43', url: 'https://www.plazuela.app/',
    scope: 'Brand, product design, web, build',
    highlights: [
      'An interactive town where every building is a real business you can open.',
      'Public business pages with category, city and a direct line to the owner.',
      'Self-serve listing from USD 10, with paid placement on the board.',
      'Built and shipped end to end, live at plazuela.app.',
    ],
    description: 'A directory of local businesses in Colombia, presented as an interactive town you can walk through. Explore each storefront, find how to contact the owner, or list your own business from USD 10. Brand, product and web, built end to end.',
    tags: ['web design', 'product design', 'branding', 'marketplace', 'colombia', 'next.js'],
  },
  {
    slug: 'petzone', title: 'Petzone', client: 'Petzone', category: 'Product', status: 'shipped', year: 2026, likes: 19, views: 212,
    cover: { kind: 'image', src: '/work/petzone/pos.webp', alt: 'Petzone point of sale: an empty register ready to scan or search, with the ticket panel beside it', fit: 'contain', bg: '#ffffff', pattern: { seed: 41, palette: ['#ff6b1a', '#ffb020', '#101010'] } },
    gallery: [
      { src: '/work/petzone/pos.webp', alt: 'Petzone point of sale: an empty register ready to scan or search, with the ticket panel beside it', w: 2400, h: 1758 },
      { src: '/work/petzone/sales.webp', alt: 'Petzone sales: every counter receipt with units, totals and payment status', w: 2400, h: 1758 },
      { src: '/work/petzone/orders.webp', alt: 'Petzone orders: products reserved for later payment, pickup or delivery', w: 2400, h: 1758 },
    ],
    accent: '#f28c28', url: 'https://petzone-coral.vercel.app',
    scope: 'Product design, build, operations',
    highlights: [
      'A register built for a counter: scan or search, favourites, one-tap ticket.',
      'Sales receipts, plus orders reserved for later payment, pickup or delivery.',
      'Inventory by SKU and variant, customers, vendors and reports behind the till.',
      'Runs the shop\'s daily trade, not a prototype.',
    ],
    description: 'Point-of-sale and operations for a pet retail store. Fast checkout at the counter, then sales, orders, inventory by SKU and variant, customers and reports behind it. Designed for a counter, not a desk, so everything is reachable with a thumb.',
    tags: ['product design', 'pos', 'retail', 'operations', 'ui', 'ux', 'dashboard'],
  },
  {
    slug: 'equator', title: 'Equator', client: 'Equator', category: 'Brand', status: 'wip', year: 2026, likes: 12, views: 96,
    cover: { kind: 'image', src: '/work/equator/brand.webp', alt: 'Equator brand: the horizon-line mark and wordmark in white', fit: 'contain', bg: '#ffffff', pattern: { seed: 63, palette: ['#ff9ec4', '#8898ff', '#ffb020'] } }, accent: '#111111',
    scope: 'Brand identity, in progress',
    highlights: [
      'A horizon-line mark that reads at favicon size and on a studio pass.',
      'A palette built as a horizon: sky, sun on the line, ground below.',
      'A block pattern generated in code, so every surface shares one construction.',
      'This site is the first place the system lives.',
    ],
    description: 'Our own studio brand, still in progress. A horizon-line mark, a low-contrast wordmark and a quiet system that stays out of the way of the work. This site is the first place it lives.',
    tags: ['branding', 'logo', 'visual identity', 'in progress', 'studio'],
  },
];

export const categories: Category[] = ['Brand', 'Product', 'Web', 'Motion'];
export const allTags: string[] = [...new Set(projects.flatMap((p) => p.tags))].sort();
