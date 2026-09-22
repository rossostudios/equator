import type { ImageMetadata } from 'astro';
import plazuelaTown from '../assets/work/plazuela/town.webp';
import plazuelaBusiness from '../assets/work/plazuela/business.webp';
import plazuelaPublish from '../assets/work/plazuela/publish.webp';
import petzonePos from '../assets/work/petzone/pos.webp';
import petzoneSales from '../assets/work/petzone/sales.webp';
import petzoneOrders from '../assets/work/petzone/orders.webp';
import equatorBrand from '../assets/work/equator/brand.webp';

export type Category = 'Brand' | 'Product' | 'Web' | 'Motion';
export type Status = 'shipped' | 'wip';

export interface Project {
  slug: string;
  title: string;
  client: string;
  category: Category;
  status: Status;
  year: number;
  video?: boolean;
  cover: {
    kind: 'image'; src: ImageMetadata; alt: string; fit?: 'cover' | 'contain'; bg?: string;
    /** Renders are transparent, so the house pattern sits behind them. */
    pattern?: { seed: number; palette: string[] };
  };
  /** Extra shots for the detail page, shown stacked in order. The first one is the hero.
   *  Imported rather than linked, so Astro reads each file's real size and resizes it. */
  gallery?: { src: ImageMetadata; alt: string }[];
  url?: string;
  /** One line under the card title: what this is, before anyone opens it. */
  summary: string;
  /** Case-study fields. Only what the work supports, no invented metrics. */
  scope?: string;
  highlights?: string[];
  description: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'plazuela', title: 'Plazuela', client: 'Plazuela', category: 'Web', status: 'shipped', year: 2026,
    cover: { kind: 'image', src: plazuelaTown, alt: 'Plazuela board: an isometric town where every building is a local business, with the businesses listed beside it', fit: 'contain', bg: '#ffffff', pattern: { seed: 17, palette: ['#8898ff', '#ffb020', '#ff6b1a'] } },
    gallery: [
      { src: plazuelaTown, alt: 'Plazuela board: an isometric town where every building is a local business, with the businesses listed beside it' },
      { src: plazuelaBusiness, alt: 'Plazuela business panel for PetZone AJ Coltejer, opened from its building in the town' },
      { src: plazuelaPublish, alt: 'Plazuela publish flow: a business fills in its profile, picks a spot on the board and pays' },
    ],
    url: 'https://www.plazuela.app/',
    scope: 'Brand, product design, web, build',
    highlights: [
      "An isometric town where every building is a real business you can open",
      "Public business pages with category, city and a direct line to the owner",
      "Self-serve listing from USD 10, town naming from $5, paid placement on the board",
      "A plain list view for anyone who'd rather not stroll",
      "Live at plazuela.app",
    ],
    summary: "A business directory for Colombia, drawn as a town you can walk through.",
    description: "A directory of local businesses in Colombia, except the directory is a town. Every building is a real business; open the door and you're talking to the owner. You can buy your own building too: listing starts at USD 10, naming a town costs $5.",
    tags: ['web design', 'product design', 'branding', 'marketplace', 'colombia', 'next.js'],
  },
  {
    slug: 'petzone', title: 'Petzone', client: 'Petzone', category: 'Product', status: 'shipped', year: 2026,
    cover: { kind: 'image', src: petzonePos, alt: 'Petzone point of sale: an empty register ready to scan or search, with the ticket panel beside it', fit: 'contain', bg: '#ffffff', pattern: { seed: 41, palette: ['#ff6b1a', '#ffb020', '#101010'] } },
    gallery: [
      { src: petzonePos, alt: 'Petzone point of sale: an empty register ready to scan or search, with the ticket panel beside it' },
      { src: petzoneSales, alt: 'Petzone sales: every counter receipt with units, totals and payment status' },
      { src: petzoneOrders, alt: 'Petzone orders: products reserved for later payment, pickup or delivery' },
    ],
    url: 'https://petzone-coral.vercel.app',
    scope: 'Product design, build, operations',
    highlights: [
      "A register built for a counter: scan or search, favourites, one-tap ticket",
      "Receipts, plus orders reserved for later payment, pickup or delivery",
      "Inventory by SKU and variant, customers, vendors and reports behind the till",
      "Register, today's tickets and the cash drawer on one screen",
      "Runs the shop's daily trade, not a prototype",
    ],
    summary: "The till and back office running a pet store in Itagüí.",
    description: "Point-of-sale and operations for a pet retail store in Itagüí, Colombia. Fast checkout at the counter, then sales, inventory by SKU and variant, customers and reports behind it. Designed for a counter, not a desk: everything reachable with a thumb, keyboard shortcuts for the till.",
    tags: ['product design', 'pos', 'retail', 'operations', 'ui', 'ux', 'dashboard'],
  },
  {
    slug: 'equator', title: 'Equator', client: 'Equator', category: 'Brand', status: 'wip', year: 2026,
    cover: { kind: 'image', src: equatorBrand, alt: 'Equator brand: the horizon-line mark and wordmark in white', fit: 'contain', bg: '#ffffff', pattern: { seed: 63, palette: ['#ff9ec4', '#8898ff', '#ffb020'] } },
    scope: 'Brand identity, in progress',
    highlights: [
      "A horizon-line mark that reads at favicon size and on a studio pass",
      "A palette built as a horizon: sky, sun on the line, ground below",
      "A block pattern generated in code, one construction across every surface",
      "This site is the first place the system lives",
    ],
    summary: "This studio's own identity, still being drawn.",
    description: "Our own studio brand, still in progress. A horizon line with a sun on it: sky above, ground below. The palette is generated in code, so every surface on this site shares one construction. This site is the first place it lives.",
    tags: ['branding', 'logo', 'visual identity', 'in progress', 'studio'],
  },
];

/** Widths every work image is built at. The browser picks one using each img's `sizes`. */
export const imageWidths = [640, 960, 1280, 1920, 2400];
