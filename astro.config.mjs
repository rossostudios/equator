// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Needed for canonical URLs, Open Graph and the sitemap.
  site: 'https://chrisrosso.dev',
  // Testimonials became Proof: things to check rather than quotes to take on trust.
  redirects: {
    '/testimonials': '/proof',
    '/es/testimonials': '/es/proof',
  },
});
