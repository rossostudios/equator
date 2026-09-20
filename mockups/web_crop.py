"""
Crop 4K mockup renders to the canvas and export web-sized WebPs. Runs under Blender's Python (needs numpy):
  Blender -b --python mockups/web_crop.py -- <in.webp>=<out.webp> [...]
env: WEB_W (default 2400), WEB_Q (default 84), WEB_BBOX "x0 y0 x1 y1" in 4000x2600 render pixels.
The default box was measured on the Petzone POS render and fits every render made by mockup.py,
because the camera and canvas never move.
"""
import bpy, numpy as np, os, sys
pairs = [a.split("=", 1) for a in sys.argv[sys.argv.index("--") + 1:]]
BBOX_AT = 4000  # the box below was measured on a 4000px-wide render
BOX = [int(v) for v in os.environ.get("WEB_BBOX", "0 0 4000 2930").split()]
TARGET_W = int(os.environ.get("WEB_W", 2400)); Q = int(os.environ.get("WEB_Q", 95))
for src, dst in pairs:
    im = bpy.data.images.load(os.path.abspath(src))
    w, h = im.size
    k = w / BBOX_AT                       # scale the box to whatever this render is
    x0, y0, x1, y1 = [int(round(v * k)) for v in BOX]
    a = np.empty(w*h*4, dtype=np.float32); im.pixels.foreach_get(a)
    crop = a.reshape(h, w, 4)[::-1][y0:y1, x0:x1]
    ch, cw = crop.shape[:2]
    out = bpy.data.images.new(os.path.basename(dst), cw, ch, alpha=True)
    out.pixels.foreach_set(np.ascontiguousarray(crop[::-1]).ravel())
    out.scale(TARGET_W, round(ch * TARGET_W / cw))
    scene = bpy.context.scene
    # save_render applies the scene's view transform. The render is already graded and
    # written display-referred, so anything but Standard grades it a second time and
    # washes the image out. This was the "faded" look.
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.color_mode = 'RGBA'   # keep the transparency
    scene.render.image_settings.quality = Q
    out.save_render(filepath=os.path.abspath(dst), scene=scene)
    print("WROTE", dst, out.size[:], os.path.getsize(dst)//1024, "KB")
