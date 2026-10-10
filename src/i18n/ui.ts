import type { Category } from '../data/work';

/**
 * The words the whole site shares: navigation, buttons, the logo's speech bubble. Page copy lives
 * in each page, English and Spanish side by side. The Spanish is written, not machine
 * translated, and speaks to the reader as tú.
 */
export const EMAIL = 'hello@chrisrosso.dev';
export const mailto = () => `mailto:${EMAIL}`;

const en = {
  nav: {
    label: 'Primary', home: 'Home', work: 'Work', proof: 'Proof', about: 'About', logo: 'Christopher Rosso, home', skip: 'Skip to content',
  },
  /** The phone menu's button and sheet. */
  menu: { open: 'Menu', close: 'Close', label: 'Site menu' },
  /** The speech bubble under the logo: how to make it rain, then a countdown. */
  tip: { hint: 'Psst: click my head 3 times', touch: 'Psst: tap my head 3 times', two: 'Two more!', one: 'One more!', rain: 'Brick rain!' },
  /** The language switch always offers the other one, named in its own language. */
  switchTo: { label: 'Español', lang: 'es' },
  copy: { label: 'Copy email', short: 'Copy', done: 'Copied', name: 'Copy email address' },
  cta: { build: "Tell me what you're building", start: 'Start a project', work: 'See the work' },
  category: { Brand: 'Brand', Product: 'Product', Web: 'Web', Motion: 'Motion', Game: 'Game' } as Record<Category, string>,
  live: 'Live',
  /** Said to screen readers on links that open a new tab. */
  newTab: '(opens in a new tab)',
};

const es: typeof en = {
  nav: {
    label: 'Principal', home: 'Inicio', work: 'Trabajo', proof: 'Pruebas', about: 'Sobre mí', logo: 'Christopher Rosso, inicio', skip: 'Saltar al contenido',
  },
  menu: { open: 'Menú', close: 'Cerrar', label: 'Menú del sitio' },
  tip: { hint: 'Psst: haz clic en mi cabeza 3 veces', touch: 'Psst: toca mi cabeza 3 veces', two: '¡Dos más!', one: '¡Una más!', rain: '¡Lluvia de piezas!' },
  switchTo: { label: 'English', lang: 'en' },
  copy: { label: 'Copiar correo', short: 'Copiar', done: 'Copiado', name: 'Copiar dirección de correo' },
  cta: { build: 'Cuéntame qué estás construyendo', start: 'Empezar un proyecto', work: 'Ver el trabajo' },
  category: { Brand: 'Marca', Product: 'Producto', Web: 'Web', Motion: 'Movimiento', Game: 'Juego' },
  live: 'En vivo',
  newTab: '(se abre en una pestaña nueva)',
};

export const ui = { en, es };
