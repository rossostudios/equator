# Purrsuit's case study

Everything on `/work/purrsuit` comes from the game itself (the Unity project at `~/Desktop/Pigeon Panic`, or
`PURRSUIT_REPO`). Nothing here is drawn by hand: run the steps again after the game changes.

1. **Footage and screenshots, from the game** (Unity 6, batch mode, in the game's folder):
   - `Unity -batchmode -projectPath . -executeMethod PigeonPanic.EditorTools.CatShotTool.RunBatch -hires`:
     every screen at 1080 x 2340 on an iPhone 16-shaped canvas, into `Captures/cat-ui-hires/`.
   - `Unity -batchmode -projectPath . -executeMethod PigeonPanic.EditorTools.FilmShots.RunBatch`: the loading
     screen into home, the perfect bot playing the endless journey's first loop, and Big Bruno's boss fight, filmed
     frame by frame at 60 fps into `Captures/film/{intro,journey,boss}.mp4`.
2. **Jinx in Blender** (the game's own `art/characters/jinx/Jinx.blend`, opened read-only):
   `Blender -b ".../Jinx.blend" -P render_jinx.py -- <renders dir>` renders the hero pose, the turnaround, the six
   looks, his faces, the wireframe pair and a 120-frame turntable (Cycles, transparent, about 20 minutes).
3. **Images**: `python3 compose.py <renders dir>` writes the cover and hero, the 3D boards, the props, icons and app
   icon boards, and the phone screenshots into `src/assets/work/purrsuit/`.
4. **Loops**: `python3 loops.py <renders dir>` cuts the chapters' loops into `public/work/purrsuit/loops/`.
5. **Film**: `python3 film.py <renders dir>` writes `public/work/purrsuit/film-{en,es}.mp4` and their posters
   (1600 x 900, 30 fps, silent, in the system of the other films).
6. **With sound, off the site**: `python3 reel.py <renders dir> <out dir>` writes an App Store app preview
   (886 x 1920, 29 s) and a 9:16 reel with the game's run song, cut on the bar.

Fonts are the game's (Lilita One and Titan One, OFL), read from its `Assets/Resources/Fonts`. `art.py` holds the
shared pieces: the phone, the navy backdrop, the logo as the game draws it, and the contact-shadow fade.
