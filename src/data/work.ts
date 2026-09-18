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
  cover: { kind: 'image'; src: string; alt: string; fit?: 'cover' | 'contain'; bg?: string } | { kind: 'equator' } | { kind: 'pos' };
  accent: string;
  url?: string;
  description: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'plazuela', title: 'Plazuela', client: 'Plazuela', category: 'Web', status: 'shipped', year: 2026, likes: 28, views: 340,
    cover: { kind: 'image', src: '/work/plazuela.png', alt: 'Plazuela: Tu negocio tiene lugar aquí', fit: 'contain', bg: '#2f4f43' }, accent: '#2f4f43', url: 'https://www.plazuela.app/',
    description: 'A directory of local businesses in Colombia, presented as an interactive town you can walk through. Explore each storefront, find how to contact the owner, or list your own business from USD 10. Brand, product and web, built end to end.',
    tags: ['web design', 'product design', 'branding', 'marketplace', 'colombia', 'next.js'],
  },
  {
    slug: 'petzone', title: 'Petzone', client: 'Petzone', category: 'Product', status: 'shipped', year: 2026, likes: 19, views: 212,
    cover: { kind: 'pos' }, accent: '#f28c28', url: 'https://www.plazuela.app/',
    description: 'Point-of-sale for a pet retail store. Fast checkout, inventory by SKU and variant, low-stock alerts and a daily close that takes one tap. Designed for a counter, not a desk, so everything is reachable with a thumb.',
    tags: ['product design', 'pos', 'retail', 'ui', 'ux', 'dashboard'],
  },
  {
    slug: 'equator', title: 'Equator', client: 'Equator', category: 'Brand', status: 'wip', year: 2026, likes: 12, views: 96,
    cover: { kind: 'equator' }, accent: '#111111',
    description: 'Our own studio brand, still in progress. A horizon-line mark, a low-contrast wordmark and a quiet system that stays out of the way of the work. This site is the first place it lives.',
    tags: ['branding', 'logo', 'visual identity', 'in progress', 'studio'],
  },
];

export const categories: Category[] = ['Brand', 'Product', 'Web', 'Motion'];
export const allTags: string[] = [...new Set(projects.flatMap((p) => p.tags))].sort();
