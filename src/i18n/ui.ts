import type { Category } from '../data/work';

/**
 * The words the whole site shares: navigation, buttons, email subjects. Page copy lives
 * in each page, English and Spanish side by side. The Spanish is written, not machine
 * translated, and speaks to the reader as tú.
 */
export const EMAIL = 'chrisrossonyc@gmail.com';
export const mailto = (subject?: string) =>
  `mailto:${EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

const en = {
  nav: {
    label: 'Primary', home: 'Home', work: 'Work', about: 'About', testimonials: 'Testimonials',
    links: 'Links', email: 'Email', emailName: 'Email Christopher', logo: 'Equator home',
  },
  /** The phone menu's button and sheet. */
  menu: { open: 'Menu', close: 'Close', label: 'Site menu' },
  /** The theme button reads "Light" and is named "Switch to Light theme". */
  theme: { lead: 'Switch to ', light: 'Light', dark: 'Dark', tail: ' theme' },
  /** The language switch always offers the other one, named in its own language. */
  switchTo: { label: 'Español', lang: 'es' },
  copy: { label: 'Copy email', short: 'Copy', done: 'Copied', name: 'Copy email address' },
  drawer: { title: 'Links', close: 'Close links', handle: 'Same handle almost everywhere:' },
  cta: {
    build: "Tell me what you're building", start: 'Start a project', work: 'See the work', home: 'Back to home',
  },
  subject: {
    project: 'New project',
    similar: (title: string) => `Project like ${title}`,
    note: 'A note for the Equator site',
    broken: (path: string) => `Broken link: ${path}`,
  },
  category: { Brand: 'Brand', Product: 'Product', Web: 'Web', Motion: 'Motion' } as Record<Category, string>,
  live: 'Live',
  and: 'and',
};

const es: typeof en = {
  nav: {
    label: 'Principal', home: 'Inicio', work: 'Trabajo', about: 'Sobre mí', testimonials: 'Testimonios',
    links: 'Enlaces', email: 'Correo', emailName: 'Escríbele a Christopher', logo: 'Inicio de Equator',
  },
  menu: { open: 'Menú', close: 'Cerrar', label: 'Menú del sitio' },
  theme: { lead: 'Cambiar a tema ', light: 'Claro', dark: 'Oscuro', tail: '' },
  switchTo: { label: 'English', lang: 'en' },
  copy: { label: 'Copiar correo', short: 'Copiar', done: 'Copiado', name: 'Copiar dirección de correo' },
  drawer: { title: 'Enlaces', close: 'Cerrar enlaces', handle: 'El mismo usuario casi en todas partes:' },
  cta: {
    build: 'Cuéntame qué estás construyendo', start: 'Empezar un proyecto', work: 'Ver el trabajo', home: 'Volver al inicio',
  },
  subject: {
    project: 'Proyecto nuevo',
    similar: (title: string) => `Un proyecto como ${title}`,
    note: 'Una nota para el sitio de Equator',
    broken: (path: string) => `Enlace roto: ${path}`,
  },
  category: { Brand: 'Marca', Product: 'Producto', Web: 'Web', Motion: 'Movimiento' },
  live: 'En vivo',
  and: 'y',
};

export const ui = { en, es };
