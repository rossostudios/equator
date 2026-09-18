# Equator

Personal site for Christopher, built with [Astro](https://astro.build).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Structure

- `src/pages/index.astro` — About page
- `src/pages/work.astro` — Portfolio grid with category filters
- `src/pages/testimonials.astro` — Testimonials
- `src/data/work.ts` — Projects (edit here to add work)
- `src/data/testimonials.ts` — Quotes
- `src/components/IdCard.astro` — three.js lanyard ID card on the About page. Put your portrait at `public/me.jpg`
- `src/components/SupportWallet.astro` — tip jar; replace the placeholder addresses at the top of the file
- `src/components/WorkCard.astro` — Card with generated SVG covers; swap `cover` for a real image when ready
- `src/styles/global.css` — Design tokens, rail, pill nav, grid
