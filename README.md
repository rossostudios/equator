# chrisrosso.dev

Christopher Rosso's site: a building-instructions booklet with a brick town that builds itself as
you scroll. Built with [Astro](https://astro.build) and [three.js](https://threejs.org), in English
(at `/`) and Spanish (at `/es/`).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Pages

- `src/pages/[...lang]/index.astro`: home, the booklet. Each step is a section; the town behind it
  builds that step. The last step is a lot visitors stack bricks on, share, or turn into a brief.
- `src/pages/[...lang]/work.astro` and `work/[slug].astro`: the work, and a case study per project,
  each opening with its model in bricks and its building instructions to step through.
- `src/pages/[...lang]/build.astro`: "Tell me what you're building". Pick parts, see a rough price,
  send it as an email. Opens ready-made from a link: `/build?parts=website,store&stage=idea&when=month`.
- `src/pages/[...lang]/proof.astro`: the live products, and a clock to time the reply.
- `src/pages/[...lang]/about.astro`, `src/pages/404.astro`.
- `src/pages/llms.txt.ts` and `sitemap.xml.ts`: generated from the same data as the pages.

## Data

- `src/data/work.ts`: the projects and their case studies (screenshots live in `src/assets/work`,
  films and guides in `public/work`).
- `src/data/parts.ts`: the parts a project is built from: colours, rough hours for the price on
  /build, and where each kind of work can be seen.
- `src/data/links.ts`: profiles in the footer. `src/data/schema.ts`: structured data.
- `src/i18n/ui.ts`: words every page shares. Each page keeps its own copy, English and Spanish side
  by side.

## The bricks

- `src/scripts/brick-kit.ts`: parts, the builder models are drawn with, and their geometry.
- `src/scripts/brick-town.ts`: the town, the figure of me, and the printed signs and faces.
- `src/scripts/brick-scene.ts`: renderer, light, and bricks that drop into place.
- `src/scripts/bricks.ts`: the home page's town and lot. `turntable.ts`: the models on case studies,
  About and 404. `build-scene.ts`: the pile on /build. `rain2d.ts`: the brick rain.

## Not in the repo

`copy/` holds the private copy sources the site's wording comes from. It is ignored on purpose:
the repository is public.

`mockups/` has the scripts that made the case studies' renders, films and guides.
