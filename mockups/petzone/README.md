# Petzone's case study

Everything on `/work/petzone` comes from the app itself: a demo server of the Petzone repo
(`~/Documents/Petzone` on `main`, or `PETZONE_REPO`), and Dasha's own Blender build in that repo
(`scripts/empty-art`). Nothing is drawn by hand. Run the steps again after the app changes.

The scripts need Node with the Petzone repo's `node_modules` (Playwright and sharp come from there), ffmpeg,
Blender 5 and, for Dasha's textures, Substance 3D Designer and Painter as `npm run empty-art` needs them.

1. **A demo server**: `npm run dev:demo` in the Petzone repo, port 3101. Point `PETZONE_URL` at another port if
   you need to. It blanks Supabase, so the store lives in the browser: `app.mjs` builds the sample shop once
   through the app's own Reports › Demo scenarios › Showcase store, on Saturday 3 October 2026, and keeps it in
   `.state/` (ignored).
2. **Screens**: `node capture.mjs [RAW]` captures every screen at twice its size: desktop 1440 x 900, an iPhone's
   393 x 798 at 3x. That means the sample shop for most screens, and an empty store for the setup cards and Dasha's
   empty pages. It also captures the film's register frames and where Dasha sits on each empty page. Run it again
   with `PETZONE_LANG=es` for the Spanish film and loops. RAW defaults to `$TMPDIR/petzone-folio/raw`.
3. **Frames**: `node frame.mjs [RAW]` puts the screens in their macOS windows and iPhones (transparent, with a
   soft shadow) and writes `src/assets/work/petzone/{desktop-light,desktop-dark,mobile-light}/*.webp` and the two
   heroes. A set name after the paths frames only that set, or `heroes`.
4. **Dasha in Blender**: `Blender -b --factory-startup --python render_dasha.py -- <renders dir>` renders her
   pose library, a turnaround, her faces, the rig (textured, clay, a ghost, plus `rig.json`: the Rigify controls
   and deform bones projected into the camera), the material balls and her coat's maps, a 96-frame turntable, and
   the puppy sitting beside her. It takes about an hour on an M4. Name parts after the directory to render only
   those (`poses faces turnaround rig materials turntable duo`). The duo needs the repo's cached `puppy.blend`,
   which `npm run empty-art` builds.
5. **Boards**: `node boards.mjs [renders dir]` writes `src/assets/work/petzone/3d/*.webp`, each 2400 x 1600 on
   the studio ground, the frame Purrsuit's boards share: the poses, the turnaround, the faces, the rig with its
   controls drawn the way Blender's viewport draws them, the coat's maps, the materials, and the puppy. It also
   writes the card's cover.
6. **Loops**: `node loops.mjs [RAW] [renders dir]` writes `public/work/petzone/loops/`:
   - the turntable;
   - the scenes grid playing each hover motion in turn;
   - the four empty pages in English and Spanish, with Dasha's strip playing where the page puts her.
7. **Film**: `node film.mjs [RAW] [renders dir]` draws `film.html` frame by frame. It writes
   `public/work/petzone/film-{en,es}.mp4` and their posters: 1600 x 900, 30 fps, about 60 s, silent. The style is
   the other films': caption cards, the product over a blur of itself, an end card. `FILM_FRAMES=2.4,7`
   renders only those moments as PNGs, to check a layout; `FILM_POSTER=1` rewrites only the posters.

The older `petzone_*_mockup` scenes beside these scripts are the September device mockups, kept on disk for
reference and out of git, as every mockup render and `.blend` is.
