/**
 * Every profile I keep, for the footer and the structured data. Each shows its official logo,
 * saved in public/brands from the brand's own site: the icon it publishes for browsers and
 * phones. Upwork only publishes a 48px one, so its black disc and white "up" are redrawn as a
 * vector. Plazuela and Petzone use their own marks.
 */
export interface LinkItem { name: string; handle: string; href: string; logo: string }
/** `es` carries the Spanish heading and blurb; names and handles read the same in both. */
export interface LinkGroup { title: string; blurb: string; es: { title: string; blurb: string }; items: LinkItem[] }

const linkedin: LinkItem = { name: 'LinkedIn', handle: 'equatorchris', href: 'https://www.linkedin.com/in/equatorchris/', logo: '/brands/linkedin.svg' };

export const linkGroups: LinkGroup[] = [
  {
    title: 'Hire me',
    blurb: 'Pick whichever platform you already use.',
    es: { title: 'Contrátame', blurb: 'Elige la plataforma que ya usas.' },
    items: [
      { name: 'Upwork', handle: 'Christopher R.', href: 'https://www.upwork.com/freelancers/~01b92588d903989eb4', logo: '/brands/upwork.svg' },
      { name: 'Fiverr', handle: 'chrisrosso_pmp', href: 'https://www.fiverr.com/chrisrosso_pmp', logo: '/brands/fiverr.png' },
      { name: 'Contra', handle: 'chrisrosso', href: 'https://contra.com/chrisrosso', logo: '/brands/contra.png' },
      { name: 'on.design', handle: 'chrisrossonyc', href: 'https://on.design/chrisrossonyc', logo: '/brands/ondesign.svg' },
      linkedin,
    ],
  },
  {
    title: 'Live work',
    blurb: 'Two products you can open right now.',
    es: { title: 'Trabajo en vivo', blurb: 'Dos productos que puedes abrir ahora mismo.' },
    items: [
      { name: 'Plazuela', handle: 'plazuela.app', href: 'https://www.plazuela.app', logo: '/brands/plazuela.svg' },
      { name: 'Petzone', handle: 'petzone-coral.vercel.app', href: 'https://petzone-coral.vercel.app', logo: '/brands/petzone.svg' },
    ],
  },
  {
    title: 'Follow',
    blurb: 'Work in progress, process, and the occasional opinion.',
    es: { title: 'Sígueme', blurb: 'Trabajo en curso, proceso y alguna que otra opinión.' },
    items: [
      linkedin,
      { name: 'X', handle: '@equator_chris', href: 'https://x.com/equator_chris', logo: '/brands/x.png' },
      { name: 'Threads', handle: '@equator_chris', href: 'https://www.threads.net/@equator_chris', logo: '/brands/threads.png' },
      { name: 'Instagram', handle: '@equator_chris', href: 'https://www.instagram.com/equator_chris', logo: '/brands/instagram.png' },
      { name: 'Facebook', handle: 'equatorchris', href: 'https://www.facebook.com/equatorchris', logo: '/brands/facebook.png' },
      { name: 'TikTok', handle: '@equatorchris', href: 'https://www.tiktok.com/@equatorchris', logo: '/brands/tiktok.png' },
    ],
  },
];
