import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n';
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
  /** The Spanish for every word above that a reader sees. Anything left out stays English. */
  es?: {
    summary?: string; scope?: string; description?: string; highlights?: string[]; tags?: string[];
    coverAlt?: string; galleryAlts?: string[];
  };
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
    es: {
      summary: 'Un directorio de negocios en Colombia, dibujado como un pueblo que puedes recorrer.',
      scope: 'Marca, diseño de producto, web, desarrollo',
      description: 'Un directorio de negocios locales en Colombia, solo que el directorio es un pueblo. Cada edificio es un negocio real; abres la puerta y estás hablando con el dueño. También puedes tener tu propio edificio: publicar un negocio cuesta desde USD 10 y ponerle nombre a un pueblo, USD 5.',
      highlights: [
        'Un pueblo isométrico donde cada edificio es un negocio real que puedes abrir',
        'Páginas públicas de cada negocio con categoría, ciudad y contacto directo con el dueño',
        'Publicación por cuenta propia desde USD 10, nombre de pueblo desde USD 5 y ubicación paga en el tablero',
        'Una vista de lista para quien prefiere no pasear',
        'En vivo en plazuela.app',
      ],
      tags: ['diseño web', 'diseño de producto', 'marca', 'marketplace', 'colombia', 'next.js'],
      coverAlt: 'Tablero de Plazuela: un pueblo isométrico donde cada edificio es un negocio local, con la lista de negocios al lado',
      galleryAlts: [
        'Tablero de Plazuela: un pueblo isométrico donde cada edificio es un negocio local, con la lista de negocios al lado',
        'Panel de negocio de Plazuela para PetZone AJ Coltejer, abierto desde su edificio en el pueblo',
        'Flujo de publicación de Plazuela: un negocio llena su perfil, elige un lugar en el tablero y paga',
      ],
    },
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
    es: {
      summary: 'La caja y el back office con los que funciona una tienda de mascotas en Itagüí.',
      scope: 'Diseño de producto, desarrollo, operaciones',
      description: 'Punto de venta y operaciones para una tienda de mascotas en Itagüí, Colombia. Cobro rápido en el mostrador y, detrás, ventas, inventario por referencia y variante, clientes y reportes. Diseñado para un mostrador, no para un escritorio: todo al alcance del pulgar y atajos de teclado para la caja.',
      highlights: [
        'Una caja pensada para el mostrador: escanear o buscar, favoritos y ticket con un toque',
        'Recibos, más pedidos apartados para pagar, recoger o enviar después',
        'Inventario por referencia y variante, clientes, proveedores y reportes detrás de la caja',
        'Caja, tickets del día y cajón de efectivo en una sola pantalla',
        'Se usa en la operación diaria de la tienda, no es un prototipo',
      ],
      tags: ['diseño de producto', 'pos', 'retail', 'operaciones', 'ui', 'ux', 'dashboard'],
      coverAlt: 'Punto de venta de Petzone: una caja vacía lista para escanear o buscar, con el panel del ticket al lado',
      galleryAlts: [
        'Punto de venta de Petzone: una caja vacía lista para escanear o buscar, con el panel del ticket al lado',
        'Ventas de Petzone: cada recibo del mostrador con unidades, totales y estado de pago',
        'Pedidos de Petzone: productos apartados para pagar, recoger o enviar después',
      ],
    },
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
    description: "My own brand, still in progress. A horizon line with a sun on it: sky above, ground below. The palette is generated in code, so every surface on this site shares one construction. This site is the first place it lives.",
    tags: ['branding', 'logo', 'visual identity', 'in progress', 'studio'],
    es: {
      summary: 'La identidad de mi propio estudio, todavía en proceso.',
      scope: 'Identidad de marca, en proceso',
      description: 'Mi propia marca, todavía en proceso. Una línea de horizonte con un sol encima: cielo arriba, tierra abajo. La paleta se genera en código, así que cada superficie de este sitio comparte una misma construcción. Este sitio es el primer lugar donde vive.',
      highlights: [
        'Un símbolo de horizonte que se lee igual en un favicon que en un pase de estudio',
        'Una paleta construida como un horizonte: cielo, sol en la línea y tierra abajo',
        'Un patrón de bloques generado en código, una sola construcción en todas las superficies',
        'Este sitio es el primer lugar donde vive el sistema',
      ],
      tags: ['marca', 'logo', 'identidad visual', 'en proceso', 'estudio'],
      coverAlt: 'Marca Equator: el símbolo de horizonte y el logotipo en blanco',
    },
  },
];

/** Widths every work image is built at. The browser picks one using each img's `sizes`. */
export const imageWidths = [640, 960, 1280, 1920, 2400];

/** A project in the reader's language: the Spanish where there is some, English otherwise. */
export const localize = (p: Project, lang: Lang): Project => {
  if (lang === 'en' || !p.es) return p;
  const es = p.es;
  return {
    ...p,
    summary: es.summary ?? p.summary,
    scope: es.scope ?? p.scope,
    description: es.description ?? p.description,
    highlights: es.highlights ?? p.highlights,
    tags: es.tags ?? p.tags,
    cover: { ...p.cover, alt: es.coverAlt ?? p.cover.alt },
    gallery: p.gallery?.map((shot, i) => ({ ...shot, alt: es.galleryAlts?.[i] ?? shot.alt })),
  };
};
