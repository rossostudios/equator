import { C } from '../scripts/brick-colors';
import type { Lang } from '../i18n';

/**
 * The parts a project can be built from, as /build offers them. Each is a brick colour with
 * its name printed on it, a rough size for the guide price, and, where there is one, the case
 * study that shows that kind of work. The lot on the home page, the case studies' "start
 * something similar" links and /llms.txt all read this list, so they can't drift apart.
 */
export type PartId = 'brand' | 'product' | 'website' | 'store' | 'software' | 'extension' | 'onchain' | 'systems' | 'seo' | 'motion';

export interface Part {
  id: PartId;
  color: string;
  /** The ink its name is printed in on the pile. */
  ink: string;
  /** Its name, and the short label printed on its brick. */
  en: [name: string, print: string];
  es: [name: string, print: string];
  /** The hours it usually takes on its own, low and high: what the rough price adds up.
   *  These are Christopher's numbers to set; the rate is the only published fact. */
  hours: [low: number, high: number];
  /** Where this kind of work can be seen: a case study, and the part of it that shows it.
   *  `at` is a chapter id, or 'film'; a chapter that no longer exists links to the page's top. */
  proof?: { slug: string; at?: string; en: string; es: string };
}

/** The hourly rate everything is priced from: "tasks from USD 50/hr". */
export const RATE = 50;

export const parts: Part[] = [
  {
    id: 'brand', color: C.red, ink: '#fff', en: ['Brand identity', 'BRAND'], es: ['Identidad de marca', 'MARCA'], hours: [10, 30],
    proof: { slug: 'plazuela', en: "Plazuela's brand", es: 'La marca de Plazuela' },
  },
  {
    id: 'product', color: C.blue, ink: '#fff', en: ['Product design', 'PRODUCT DESIGN'], es: ['Diseño de producto', 'DISEÑO'], hours: [15, 40],
    proof: { slug: 'petzone', at: 'point-of-sale', en: "Petzone's point of sale", es: 'El punto de venta de Petzone' },
  },
  {
    id: 'website', color: C.yellow, ink: C.black, en: ['Website', 'WEBSITE'], es: ['Sitio web', 'SITIO WEB'], hours: [10, 40],
    proof: { slug: 'plazuela', at: 'town', en: "Plazuela's town", es: 'El pueblo de Plazuela' },
  },
  {
    id: 'store', color: C.green, ink: '#fff', en: ['Online store', 'ONLINE STORE'], es: ['Tienda en línea', 'TIENDA'], hours: [20, 60],
    proof: { slug: 'plazuela', at: 'businesses', en: "Plazuela's checkout", es: 'El pago en Plazuela' },
  },
  {
    id: 'software', color: C.orange, ink: C.black, en: ['Custom software', 'SOFTWARE'], es: ['Software a la medida', 'SOFTWARE'], hours: [30, 120],
    proof: { slug: 'petzone', en: 'Petzone', es: 'Petzone' },
  },
  { id: 'extension', color: C.azure, ink: C.black, en: ['Chrome extension', 'EXTENSION'], es: ['Extensión de Chrome', 'EXTENSIÓN'], hours: [10, 30] },
  { id: 'onchain', color: C.purple, ink: '#fff', en: ['Onchain product', 'ONCHAIN'], es: ['Producto onchain', 'ONCHAIN'], hours: [20, 60] },
  {
    id: 'systems', color: C.dgray, ink: '#fff', en: ['Systems & operations', 'SYSTEMS'], es: ['Sistemas y operaciones', 'SISTEMAS'], hours: [8, 24],
    proof: { slug: 'petzone', at: 'reports', en: "Petzone's reports", es: 'Los reportes de Petzone' },
  },
  { id: 'seo', color: C.lime, ink: C.black, en: ['Agentic SEO', 'AI SEO'], es: ['SEO para IA', 'SEO IA'], hours: [6, 20] },
  {
    id: 'motion', color: C.magenta, ink: '#fff', en: ['Motion & video', 'MOTION'], es: ['Video y movimiento', 'VIDEO'], hours: [6, 24],
    proof: { slug: 'purrsuit', at: 'film', en: "Purrsuit's film", es: 'El video de Purrsuit' },
  },
];

const partIds = parts.map((p) => p.id);
export const isPartId = (id: string): id is PartId => (partIds as string[]).includes(id);

/** The bricks on the home page's lot are parts too: each swatch's colour is the part it stands
 *  for, in the swatches' order (brick-colors.ts SWATCHES). White is just a brick. */
export const SWATCH_PARTS: (PartId | null)[] = ['brand', 'website', 'product', 'store', null, 'software'];

/** A rough price for some parts, in dollars: their hours added up, at the rate. */
export function estimate(ids: string[]) {
  const picked = parts.filter((p) => ids.includes(p.id));
  const low = picked.reduce((n, p) => n + p.hours[0], 0);
  const high = picked.reduce((n, p) => n + p.hours[1], 0);
  return { low, high, from: low * RATE, to: high * RATE };
}

/** Dollars as each language writes them: $1,500, or USD 1.500. */
export const money = (n: number, lang: Lang) =>
  lang === 'es' ? `USD ${n.toLocaleString('es-CO')}` : `$${n.toLocaleString('en-US')}`;

/** A range of dollars: $1,500–$5,000, or USD 1.500–5.000. */
export const priceRange = (from: number, to: number, lang: Lang) =>
  lang === 'es' ? `${money(from, lang)}–${to.toLocaleString('es-CO')}` : `${money(from, lang)}–${money(to, lang)}`;
