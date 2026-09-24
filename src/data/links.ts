import { UpworkIcon, FiverrIcon, NewTwitterIcon, ThreadsIcon, InstagramIcon, Facebook01Icon, TiktokIcon, Linkedin01Icon, Globe02Icon, ShopSignIcon } from './icons';

type IconData = readonly (readonly [string, Record<string, string | number>])[];

// Custom glyphs for platforms Hugeicons does not ship (drawn in the same 24px stroke style).
const ContraIcon: IconData = [
  ['path', { d: 'M12 3.5 19.5 8v8L12 20.5 4.5 16V8z' }],
  ['path', { d: 'M12 8v8M8.5 10l3.5-2 3.5 2' }],
];
const OnDesignIcon: IconData = [
  ['circle', { cx: 8, cy: 12, r: 3.5 }],
  ['path', { d: 'M15 15.5v-4a2.5 2.5 0 0 1 5 0v4' }],
  ['circle', { cx: 12, cy: 19.5, r: 0.5, fill: 'currentColor' }],
];

export interface LinkItem { name: string; handle: string; href: string; icon: IconData }
/** `es` carries the Spanish heading and blurb; names and handles read the same in both. */
export interface LinkGroup { title: string; blurb: string; es: { title: string; blurb: string }; items: LinkItem[] }

export const linkGroups: LinkGroup[] = [
  {
    title: 'Hire me',
    blurb: 'Pick whichever platform you already use.',
    es: { title: 'Contrátame', blurb: 'Elige la plataforma que ya usas.' },
    items: [
      { name: 'Upwork', handle: 'Christopher R.', href: 'https://www.upwork.com/freelancers/~01b92588d903989eb4', icon: UpworkIcon },
      { name: 'Fiverr', handle: 'chrisrosso_pmp', href: 'https://www.fiverr.com/chrisrosso_pmp', icon: FiverrIcon },
      { name: 'Contra', handle: 'chrisrosso', href: 'https://contra.com/chrisrosso', icon: ContraIcon },
      { name: 'on.design', handle: 'chrisrossonyc', href: 'https://on.design/chrisrossonyc', icon: OnDesignIcon },
      { name: 'LinkedIn', handle: 'equatorchris', href: 'https://www.linkedin.com/in/equatorchris/', icon: Linkedin01Icon },
    ],
  },
  {
    title: 'Live work',
    blurb: 'Two products you can open right now.',
    es: { title: 'Trabajo en vivo', blurb: 'Dos productos que puedes abrir ahora mismo.' },
    items: [
      { name: 'Plazuela', handle: 'plazuela.app', href: 'https://www.plazuela.app', icon: Globe02Icon },
      { name: 'Petzone', handle: 'petzone-coral.vercel.app', href: 'https://petzone-coral.vercel.app', icon: ShopSignIcon },
    ],
  },
  {
    title: 'Follow',
    blurb: 'Work in progress, process, and the occasional opinion.',
    es: { title: 'Sígueme', blurb: 'Trabajo en curso, proceso y alguna que otra opinión.' },
    items: [
      { name: 'X', handle: '@equator_chris', href: 'https://x.com/equator_chris', icon: NewTwitterIcon },
      { name: 'Threads', handle: '@equator_chris', href: 'https://www.threads.net/@equator_chris', icon: ThreadsIcon },
      { name: 'Instagram', handle: '@equator_chris', href: 'https://www.instagram.com/equator_chris', icon: InstagramIcon },
      { name: 'Facebook', handle: 'equatorchris', href: 'https://www.facebook.com/equatorchris', icon: Facebook01Icon },
      { name: 'TikTok', handle: '@equatorchris', href: 'https://www.tiktok.com/@equatorchris', icon: TiktokIcon },
    ],
  },
];
